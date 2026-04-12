/**
 * BrainSAIT AI Intelligence Mesh
 *
 * Unified AI gateway for all 13 LINC agents:
 * - AI Gateway routing with cost tracking and caching
 * - AutoRAG: Vectorize + R2 medical knowledge injection
 * - Durable Objects for persistent agent state
 * - Queue dispatch for async claims and notifications
 * - R2 audit trail for HIPAA compliance
 * - Workers AI fallback when cloud providers unavailable
 * - OpenAI-compatible API (drop-in for GitHub proxy)
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { MasterLincSession } from './durable-objects/master-linc';
import { ClaimStateMachine } from './durable-objects/claim-state';
import { ragMiddleware } from './middleware/rag';
import { authMiddleware } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/rate-limit';
import { auditLog } from './lib/audit';
import { routeToProvider } from './lib/providers';
import { ingestDocument } from './lib/ingest';

export { MasterLincSession, ClaimStateMachine };

export interface Env {
  // AI
  AI: Ai;

  // Vectorize
  MEDICAL_INDEX: VectorizeIndex;
  BRAINSAIT_INDEX: VectorizeIndex;
  SEARCH_INDEX: VectorizeIndex;  // 1024d — matches bge-large-en-v1.5

  // D1
  DB: D1Database;
  METRICS_DB: D1Database;

  // KV
  LINC_CACHE: KVNamespace;
  AGENT_CACHE: KVNamespace;
  SESSIONS: KVNamespace;
  RATE_LIMIT: KVNamespace;

  // R2
  HEALTHCARE_FILES: R2Bucket;
  RADIOLOGY: R2Bucket;
  AUDIT_LOGS: R2Bucket;
  DOCUMENTS: R2Bucket;

  // Queues
  CLAIMS_QUEUE: Queue;
  NOTIFY_QUEUE: Queue;

  // Durable Objects
  MASTER_LINC: DurableObjectNamespace;
  CLAIM_STATE: DurableObjectNamespace;

  // Secrets / Vars
  ANTHROPIC_API_KEY: string;
  OPENAI_API_KEY: string;
  GITHUB_MODELS_TOKEN: string;
  JWT_SECRET: string;
  AI_GATEWAY_ID: string;
  ACCOUNT_ID: string;
  CACHE_TTL: string;
  MAX_RAG_RESULTS: string;
  ENVIRONMENT: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: ['https://work.elfadil.com', 'https://iris.elfadil.com', 'http://localhost:3000'],
  allowHeaders: ['Authorization', 'Content-Type', 'X-Request-ID', 'X-Session-ID'],
  exposeHeaders: ['X-Request-ID', 'X-RAG-Sources', 'X-Model-Used', 'X-Cache-Hit'],
}));
app.use('*', logger());

// ── HEALTH ────────────────────────────────────────────────────────────────────
app.get('/health', async (c) => {
  return c.json({
    status: 'healthy',
    service: 'brainsait-ai-mesh',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    components: {
      ai: 'available',
      vectorize: 'available',
      d1: 'available',
      r2: 'available',
      queues: 'available',
    },
  });
});

// ── STATUS — per-agent live health ────────────────────────────────────────────
app.get('/v1/agents/status', authMiddleware, async (c) => {
  const agents = [
    'masterlinc', 'claimlinc', 'authlinc', 'drglinc', 'clinicallinc',
    'healthcarelinc', 'radiolinc', 'codelinc', 'bridgelinc', 'compliancelinc',
    'ttlinc', 'basma', 'brainsait-nphies-agent',
  ];

  const statuses = await Promise.all(agents.map(async (id) => {
    const cached = await c.env.AGENT_CACHE.get(`health:${id}`);
    return { id, status: cached ?? 'unknown' };
  }));

  return c.json({ agents: statuses, timestamp: new Date().toISOString() });
});

// ── OPENAI-COMPATIBLE CHAT COMPLETIONS ────────────────────────────────────────
// Drop-in replacement for GitHub Models proxy (port 8888 → this worker)
app.post('/v1/chat/completions', authMiddleware, rateLimitMiddleware, async (c) => {
  const requestId = c.req.header('X-Request-ID') ?? crypto.randomUUID();
  const sessionId = c.req.header('X-Session-ID') ?? requestId;
  const body = await c.req.json<{ model: string; messages: any[]; stream?: boolean; temperature?: number }>();

  const { model, messages, stream = false, temperature = 0.1 } = body;
  const startTime = Date.now();

  // ── 1. CACHE CHECK ──────────────────────────────────────────────────────────
  const cacheKey = `chat:${model}:${await hashMessages(messages)}`;
  if (!stream) {
    const cached = await c.env.LINC_CACHE.get(cacheKey);
    if (cached) {
      c.header('X-Cache-Hit', 'true');
      c.header('X-Request-ID', requestId);
      return c.json(JSON.parse(cached));
    }
  }

  // ── 2. RAG AUGMENTATION ─────────────────────────────────────────────────────
  const { augmentedMessages, sources } = await ragMiddleware(messages, model, c.env);

  // ── 3. ROUTE TO PROVIDER ────────────────────────────────────────────────────
  const { response, modelUsed, provider } = await routeToProvider({
    model,
    messages: augmentedMessages,
    stream,
    temperature,
    env: c.env,
    requestId,
  });

  const latencyMs = Date.now() - startTime;

  // ── 4. CACHE RESPONSE ───────────────────────────────────────────────────────
  if (!stream && response.choices) {
    await c.env.LINC_CACHE.put(cacheKey, JSON.stringify(response), {
      expirationTtl: parseInt(c.env.CACHE_TTL),
    });
  }

  // ── 5. AUDIT LOG (async, non-blocking) ──────────────────────────────────────
  c.executionCtx.waitUntil(
    auditLog(c.env.AUDIT_LOGS, {
      requestId,
      sessionId,
      model,
      modelUsed,
      provider,
      messageCount: messages.length,
      latencyMs,
      ragSources: sources,
      timestamp: new Date().toISOString(),
    })
  );

  // ── 6. METRICS (async) ──────────────────────────────────────────────────────
  c.executionCtx.waitUntil(
    recordMetric(c.env.METRICS_DB, { model, provider, latencyMs, success: true })
  );

  c.header('X-Request-ID', requestId);
  c.header('X-RAG-Sources', sources.length.toString());
  c.header('X-Model-Used', modelUsed);
  c.header('X-Cache-Hit', 'false');

  return c.json(response);
});

// ── RAG QUERY — direct vector search ─────────────────────────────────────────
app.post('/v1/rag/query', authMiddleware, async (c) => {
  const { query, index = 'search', topK = 5, limit } = await c.req.json<{
    query: string; index?: string; topK?: number; limit?: number;
  }>();

  const k = limit ?? topK;
  const embedResult = await c.env.AI.run('@cf/baai/bge-large-en-v1.5', { text: query });
  const queryVector = Array.isArray(embedResult) ? embedResult : (embedResult as any).data[0];

  // SEARCH_INDEX (1024d) matches bge-large-en-v1.5; fall back to others for legacy
  const vectorIndex = index === 'medical' ? c.env.MEDICAL_INDEX
    : index === 'brainsait' ? c.env.BRAINSAIT_INDEX
    : c.env.SEARCH_INDEX;

  const matches = await vectorIndex.query(queryVector, { topK: k, returnMetadata: 'all' });

  const context = matches.matches
    .map((m) => (m.metadata as any)?.text ?? '')
    .filter(Boolean)
    .join('\n\n');

  return c.json({
    query,
    count: matches.matches.length,
    context,
    results: matches.matches.map((m) => ({
      id: m.id,
      score: m.score,
      metadata: m.metadata,
    })),
  });
});

// ── DOCUMENT INGEST — feed R2 docs or direct content into Vectorize ───────────
app.post('/v1/rag/ingest', authMiddleware, async (c) => {
  const body = await c.req.json<{
    key?: string; content?: string; bucket?: string; chunkSize?: number;
    metadata?: Record<string, string>;
  }>();

  const { key, content, bucket = 'healthcare', chunkSize = 512, metadata = {} } = body;
  let text: string;

  if (content) {
    // Direct content ingest — no R2 lookup needed
    text = content;
  } else if (key) {
    const r2 = bucket === 'radiology' ? c.env.RADIOLOGY : c.env.HEALTHCARE_FILES;
    const object = await r2.get(key);
    if (!object) return c.json({ error: 'Document not found' }, 404);
    text = await object.text();
  } else {
    return c.json({ error: 'Provide either "content" or "key"' }, 400);
  }

  const docKey = key ?? `inline-${Date.now()}`;
  const count = await ingestDocument(text, docKey, c.env.SEARCH_INDEX, c.env.AI, chunkSize, metadata);

  return c.json({ key: docKey, chunksIndexed: count, status: 'indexed' });
});

// ── CLAIMS — async NPHIES submission ─────────────────────────────────────────
app.post('/v1/claims/submit', authMiddleware, async (c) => {
  const claim = await c.req.json();
  const claimId = `CLM-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  // Dispatch to Durable Object for state machine
  const doId = c.env.CLAIM_STATE.idFromName(claimId);
  const stub = c.env.CLAIM_STATE.get(doId);
  await stub.fetch('https://internal/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claimId, claim }),
  });

  // Enqueue for async NPHIES processing
  await c.env.CLAIMS_QUEUE.send({ claimId, claim, timestamp: Date.now() });

  return c.json({ claimId, status: 'queued', message: 'Claim submitted for NPHIES processing' });
});

// ── CLAIM STATUS — from Durable Object ───────────────────────────────────────
app.get('/v1/claims/:claimId', authMiddleware, async (c) => {
  const { claimId } = c.req.param();
  const doId = c.env.CLAIM_STATE.idFromName(claimId);
  const stub = c.env.CLAIM_STATE.get(doId);
  const resp = await stub.fetch('https://internal/status');
  return new Response(resp.body, { headers: { 'Content-Type': 'application/json' } });
});

// ── SESSION — MASTERLINC persistent context ───────────────────────────────────
app.all('/v1/session/:sessionId/*', authMiddleware, async (c) => {
  const { sessionId } = c.req.param();
  const doId = c.env.MASTER_LINC.idFromName(sessionId);
  const stub = c.env.MASTER_LINC.get(doId);
  // Forward to DO
  return stub.fetch(c.req.raw);
});

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
app.post('/v1/notify', authMiddleware, async (c) => {
  const msg = await c.req.json<{ to: string; channel: 'whatsapp' | 'sms' | 'email'; message: string; lang?: string }>();
  await c.env.NOTIFY_QUEUE.send({ ...msg, timestamp: Date.now() });
  return c.json({ status: 'queued' });
});

// ── STORAGE — R2 presigned operations ─────────────────────────────────────────
app.post('/v1/storage/upload', authMiddleware, async (c) => {
  const form = await c.req.formData();
  const file = form.get('file') as File;
  const folder = (form.get('folder') as string) ?? 'general';
  const bucket = (form.get('bucket') as string) ?? 'healthcare';

  if (!file) return c.json({ error: 'No file provided' }, 400);

  const key = `${folder}/${Date.now()}-${file.name}`;
  const r2 = bucket === 'radiology' ? c.env.RADIOLOGY : c.env.HEALTHCARE_FILES;
  await r2.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { originalName: file.name, uploadedAt: new Date().toISOString() },
  });

  return c.json({ key, bucket, size: file.size, contentType: file.type });
});

// ── QUEUE CONSUMER ────────────────────────────────────────────────────────────
export default {
  fetch: app.fetch,

  async queue(batch: MessageBatch, env: Env): Promise<void> {
    for (const message of batch.messages) {
      const msg = message.body as any;

      if (batch.queue === 'brainsait-claims') {
        await processClaim(msg, env);
        message.ack();
      } else if (batch.queue === 'brainsait-notifications') {
        await sendNotification(msg, env);
        message.ack();
      }
    }
  },
};

// ── HELPERS ───────────────────────────────────────────────────────────────────

async function hashMessages(messages: any[]): Promise<string> {
  const str = JSON.stringify(messages.slice(-3)); // last 3 messages for cache key
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

async function recordMetric(db: D1Database, data: {
  model: string; provider: string; latencyMs: number; success: boolean;
}): Promise<void> {
  try {
    await db.prepare(`
      INSERT INTO ai_metrics (model, provider, latency_ms, success, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(data.model, data.provider, data.latencyMs, data.success ? 1 : 0, Date.now()).run();
  } catch {
    // Metrics table might not exist yet — non-fatal
  }
}

async function processClaim(msg: any, env: Env): Promise<void> {
  const { claimId, claim } = msg;
  // Update DO state to processing
  const doId = env.CLAIM_STATE.idFromName(claimId);
  const stub = env.CLAIM_STATE.get(doId);
  await stub.fetch('https://internal/processing', {
    method: 'POST',
    body: JSON.stringify({ status: 'processing' }),
  });

  // Log to R2 audit
  await env.AUDIT_LOGS.put(
    `claims/${claimId}.json`,
    JSON.stringify({ claimId, claim, status: 'processing', timestamp: new Date().toISOString() }),
    { httpMetadata: { contentType: 'application/json' } }
  );
}

async function sendNotification(msg: any, env: Env): Promise<void> {
  const { to, channel, message, lang = 'ar' } = msg;
  // Log notification
  await env.AUDIT_LOGS.put(
    `notifications/${Date.now()}-${to}.json`,
    JSON.stringify({ to, channel, message, lang, timestamp: new Date().toISOString() }),
    { httpMetadata: { contentType: 'application/json' } }
  );
  // In production: call Twilio/WhatsApp API here
}
