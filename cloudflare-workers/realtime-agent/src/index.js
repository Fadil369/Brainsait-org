/**
 * BrainSAIT Realtime Agent — "Linc"
 *
 * An AI voice mentor that joins RealtimeKit meetings via the
 * @cloudflare/realtime-agents SDK.
 *
 * Pipeline:
 *   RealtimeKit meeting audio
 *     → Deepgram STT (transcript)
 *     → Workers AI / llama-3.1-8b (response as Linc, the BrainSAIT mentor)
 *     → ElevenLabs TTS (audio)
 *   → back into the RealtimeKit meeting
 *
 * ─── Secrets required (wrangler secret put ... --name brainsait-realtime-agent-prod) ───
 *   DEEPGRAM_API_KEY       – Deepgram speech-to-text key
 *   ELEVENLABS_API_KEY     – ElevenLabs text-to-speech key
 *   REALTIME_API_TOKEN     – CF API token with "Admin: Realtime" scope
 *
 * ─── API ─────────────────────────────────────────────────────────────────────
 *   POST /init?meetingId=<id>      Authorization: Bearer <realtimekit-auth-token>
 *   POST /deinit?meetingId=<id>
 *   *    /agentsInternal/*          (internal SDK routing — do not call directly)
 */

import {
  DeepgramSTT,
  TextComponent,
  RealtimeKitTransport,
  ElevenLabsTTS,
  RealtimeAgent,
} from '@cloudflare/realtime-agents';

// ─── Linc's persona ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Linc, an AI mentor for BrainSAIT's healthcare innovation incubator.
BrainSAIT supports entrepreneurs building digital health and AI solutions in Saudi Arabia and the GCC region.

Your role in this meeting:
- Answer questions about the incubator programme, cohort timeline, and resources
- Help participants think through their product ideas, business models, and go-to-market strategy
- Encourage founders, celebrate progress, and surface blockers early
- Speak naturally and concisely — you are talking aloud in a live meeting, so keep answers under 3 sentences
- If you don't know something, say so honestly and suggest who to contact

Important: Never fabricate regulatory or clinical facts. If a founder asks about NPHIES, SFDA, or MOH regulations, advise them to verify with the relevant authority.`;

// ─── Text processor ──────────────────────────────────────────────────────────

class LincTextProcessor extends TextComponent {
  constructor(env) {
    super();
    this.env = env;
    this.history = []; // keep short conversation history within a session
  }

  async onTranscript(text, reply) {
    // Build messages for the LLM
    this.history.push({ role: 'user', content: text });

    // Keep history bounded (last 6 turns) to avoid token blowup
    if (this.history.length > 12) {
      this.history = this.history.slice(this.history.length - 12);
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...this.history,
    ];

    try {
      const result = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages,
        max_tokens: 150, // keep voice responses short
      });

      const response = result.response ?? 'I didn\'t catch that — could you repeat?';
      this.history.push({ role: 'assistant', content: response });
      reply(response);
    } catch (err) {
      console.error('[Linc] AI inference error:', err);
      reply('Sorry, I\'m having trouble thinking right now. Please try again in a moment.');
    }
  }
}

// ─── Durable Object ──────────────────────────────────────────────────────────

export class LincAgent extends RealtimeAgent {
  constructor(ctx, env) {
    super(ctx, env);
    this.textProcessor = null;
  }

  async init(agentId, meetingId, authToken, workerUrl, accountId, apiToken) {
    this.textProcessor = new LincTextProcessor(this.env);
    const rtkTransport = new RealtimeKitTransport(meetingId, authToken);

    await this.initPipeline(
      [
        rtkTransport,
        new DeepgramSTT(this.env.DEEPGRAM_API_KEY),
        this.textProcessor,
        new ElevenLabsTTS(this.env.ELEVENLABS_API_KEY),
        rtkTransport,
      ],
      agentId,
      workerUrl,
      accountId,
      apiToken,
    );

    const { meeting } = rtkTransport;

    // Greet participants when they join
    meeting.participants.joined.on('participantJoined', (participant) => {
      const name = participant.name || 'there';
      this.textProcessor.speak(
        `Hi ${name}! I'm Linc, your BrainSAIT AI mentor. Ask me anything about the incubator programme or your project.`
      );
    });

    meeting.participants.joined.on('participantLeft', (participant) => {
      const name = participant.name || 'a participant';
      console.log(`[Linc] ${name} left the meeting`);
    });

    // Join the meeting
    await meeting.join();
    console.log(`[Linc] Joined meeting ${meetingId} as agent ${agentId}`);
  }

  async deinit() {
    await this.deinitPipeline();
    console.log('[Linc] Pipeline torn down');
  }
}

// ─── Fetch handler ────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const meetingId = url.searchParams.get('meetingId');

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request),
      });
    }

    // Health check
    if (url.pathname === '/health') {
      return corsWrap(
        Response.json({ status: 'ok', agent: 'Linc', service: 'brainsait-realtime-agent' }),
        request
      );
    }

    if (!meetingId) {
      return corsWrap(
        Response.json({ error: 'meetingId query param required' }, { status: 400 }),
        request
      );
    }

    // Resolve the Durable Object for this meeting
    const agentId = meetingId;
    const id = env.LINC_AGENT.idFromName(meetingId);
    const stub = env.LINC_AGENT.get(id);

    // Internal SDK routing (pipeline heartbeat / signalling)
    if (url.pathname.startsWith('/agentsInternal')) {
      return stub.fetch(request);
    }

    switch (url.pathname) {
      case '/init': {
        if (request.method !== 'POST') break;

        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
          return corsWrap(
            Response.json({ error: 'Authorization: Bearer <realtimekit-token> required' }, { status: 401 }),
            request
          );
        }

        const authToken = authHeader.slice(7); // strip "Bearer "
        const accountId = env.REALTIME_ACCOUNT_ID ?? 'd7b99530559ab4f2545e9bdc72a7ab9b';
        const apiToken  = env.REALTIME_API_TOKEN;

        if (!apiToken) {
          return corsWrap(
            Response.json({ error: 'REALTIME_API_TOKEN secret not set' }, { status: 503 }),
            request
          );
        }
        if (!env.DEEPGRAM_API_KEY || !env.ELEVENLABS_API_KEY) {
          return corsWrap(
            Response.json({ error: 'STT/TTS secrets not configured' }, { status: 503 }),
            request
          );
        }

        await stub.init(agentId, meetingId, authToken, url.host, accountId, apiToken);
        return corsWrap(Response.json({ status: 'joined', agentId, meetingId }), request);
      }

      case '/deinit': {
        if (request.method !== 'POST') break;
        await stub.deinit();
        return corsWrap(Response.json({ status: 'left', agentId, meetingId }), request);
      }

      default:
        break;
    }

    return corsWrap(Response.json({ error: 'not found' }, { status: 404 }), request);
  },
};

// ─── CORS helpers ─────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = new Set([
  'https://brainsait.org',
  'https://partners.brainsait.org',
  'http://localhost:3000',
  'http://localhost:3001',
]);

function corsHeaders(request) {
  const origin = request?.headers.get('Origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://brainsait.org',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function corsWrap(response, request) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders(request))) headers.set(k, v);
  return new Response(response.body, { status: response.status, headers });
}
