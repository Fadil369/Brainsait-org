import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { Env } from './types';
import { requireApiKey, rateLimiter } from './middleware/auth';
import { claimsRouter } from './routes/claims';
import { milestonesRouter } from './routes/milestones';
import { invoicesRouter } from './routes/invoices';
import { bidsRouter } from './routes/bids';
import { guaranteesRouter } from './routes/guarantees';
import { offsetsRouter } from './routes/offsets';
import { vendorsRouter } from './routes/vendors';
import { paymentsRouter } from './routes/payments';
import { scanExpiringGuarantees } from './services/escrow';
import { ok } from './utils/response';

const app = new Hono<{ Bindings: Env }>();

// --- Global Middleware ---

app.use('*', cors({
  origin: ['https://brainsait.org', 'https://www.brainsait.org', 'https://*.brainsait-org.pages.dev'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-MOF-RqUID'],
  exposeHeaders: ['X-Request-ID'],
  maxAge: 86400,
  credentials: true,
}));

app.use('/wathq/v1/*', rateLimiter);
app.use('/wathq/v1/*', requireApiKey);

// --- Health & Info ---

app.get('/', (c) => ok(c, {
  service: 'Wathq Milestone Verification API',
  version: '1.0.0',
  description: 'AFESWE — Automated Fintech Escrow and Smart Workflow Ecosystem',
  docs: 'https://brainsait.org/wathq',
  status: 'operational',
}));

app.get('/health', (c) => ok(c, {
  status: 'healthy',
  timestamp: new Date().toISOString(),
  region: (c.req.raw as any).cf?.colo ?? 'unknown',
}));

// --- API Routes ---

app.route('/wathq/v1/claims', claimsRouter);
app.route('/wathq/v1/milestones', milestonesRouter);
app.route('/wathq/v1/invoices', invoicesRouter);
app.route('/wathq/v1/bids', bidsRouter);
app.route('/wathq/v1/guarantees', guaranteesRouter);
app.route('/wathq/v1/offsets', offsetsRouter);
app.route('/wathq/v1/vendors', vendorsRouter);
// Payments — /config and /webhooks are public (no auth middleware)
app.route('/wathq/v1/payments', paymentsRouter);

// Wathq API proxy — forward to real Wathq with cached apiKey
app.get('/wathq/v1/proxy/*', async (c) => {
  const wathqKey = c.env.WATHQ_API_KEY;
  if (!wathqKey) return c.json({ success: false, error: { message: 'WATHQ_API_KEY not configured' } }, 503 as any);

  const base = c.env.WATHQ_API_BASE_URL ?? 'https://api.wathq.sa/v1';
  const path = c.req.path.replace('/wathq/v1/proxy', '');
  const upstream = `${base}${path}${c.req.url.includes('?') ? '?' + c.req.url.split('?')[1] : ''}`;

  const cacheKey = `wathq-proxy:${path}`;
  const cached = await c.env.WATHQ_KV.get(cacheKey);
  if (cached) return c.json(JSON.parse(cached));

  const resp = await fetch(upstream, {
    headers: { apiKey: wathqKey, Accept: 'application/json' },
  });

  const data = await resp.json() as any;
  if (resp.ok) {
    await c.env.WATHQ_KV.put(cacheKey, JSON.stringify(data), { expirationTtl: 86400 });
  }
  return c.json(data, resp.status as any);
});

// --- Scheduled Tasks (Cloudflare Cron Triggers) ---

export default {
  fetch: app.fetch,

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runScheduledTasks(event, env));
  },
};

async function runScheduledTasks(event: ScheduledEvent, env: Env): Promise<void> {
  const cron = event.cron;

  // Every 6 hours: scan for guarantees approaching expiry
  if (cron === '0 */6 * * *') {
    const expiringIds = await scanExpiringGuarantees(env);
    if (expiringIds.length > 0) {
      // Queue renewal alerts via WATHQ_QUEUE
      for (const id of expiringIds) {
        await env.WATHQ_QUEUE.send({ type: 'guarantee_renewal_alert', guaranteeId: id });
      }
    }
  }

  // Daily: expire stale Etimad OAuth tokens from KV
  if (cron === '0 0 * * *') {
    // KV TTLs handle expiry automatically — this is a no-op placeholder
    // for future token revocation logic
  }
}
