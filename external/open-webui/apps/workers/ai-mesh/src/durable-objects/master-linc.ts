/**
 * MasterLincSession Durable Object
 *
 * Persistent MASTERLINC agent — maintains conversation context,
 * routing decisions, and real-time WebSocket streaming per session.
 */

import type { Env } from '../index';

interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
  timestamp: number;
}

interface SessionState {
  sessionId: string;
  userId?: string;
  history: ConversationTurn[];
  activeAgent?: string;
  context: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export class MasterLincSession {
  state: DurableObjectState;
  env: Env;
  private session: SessionState | null = null;
  private webSockets: WebSocket[] = [];

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // WebSocket upgrade for real-time streaming
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }

    if (url.pathname === '/history') return this.getHistory();
    if (url.pathname === '/context') return this.getContext();
    if (url.pathname === '/reset' && request.method === 'DELETE') return this.resetSession();
    if (request.method === 'POST') return this.handleMessage(request, url.pathname);

    return new Response('Not found', { status: 404 });
  }

  private async loadSession(): Promise<SessionState> {
    if (this.session) return this.session;
    this.session = await this.state.storage.get<SessionState>('session') ?? {
      sessionId: this.state.id.toString(),
      history: [],
      context: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    return this.session;
  }

  private async saveSession(): Promise<void> {
    if (!this.session) return;
    this.session.updatedAt = Date.now();
    // Keep last 50 turns to avoid storage bloat
    if (this.session.history.length > 50) {
      this.session.history = this.session.history.slice(-50);
    }
    await this.state.storage.put('session', this.session);
  }

  private async handleMessage(request: Request, path: string): Promise<Response> {
    const session = await this.loadSession();
    const body = await request.json<{ message: string; userId?: string; metadata?: Record<string, unknown> }>();

    // Route to appropriate LINC agent
    const agentId = this.selectAgent(body.message, session.context);

    const turn: ConversationTurn = {
      role: 'user',
      content: body.message,
      agent: agentId,
      timestamp: Date.now(),
    };
    session.history.push(turn);
    session.activeAgent = agentId;
    if (body.userId) session.userId = body.userId;

    await this.saveSession();

    // Broadcast to WebSocket clients
    this.broadcast({ type: 'turn', turn, agentId });

    return Response.json({
      sessionId: session.sessionId,
      agentId,
      historyLength: session.history.length,
      message: `Routing to ${agentId}`,
    });
  }

  private selectAgent(message: string, context: Record<string, unknown>): string {
    const lower = message.toLowerCase();

    if (/claim|denial|billing|remittance|nphies.*submit/i.test(lower)) return 'claimlinc';
    if (/prior auth|authorization|pa request|approval/i.test(lower)) return 'authlinc';
    if (/drg|case.?mix|grouper|weight|reimburs/i.test(lower)) return 'drglinc';
    if (/diagnos|symptom|differential|drug|dose|interact/i.test(lower)) return 'clinicallinc';
    if (/patient|admission|discharge|ward|opd|appointment/i.test(lower)) return 'healthcarelinc';
    if (/radiol|ct|mri|x.?ray|imaging|pacs|bi.?rads/i.test(lower)) return 'radiolinc';
    if (/icd|cpt|code|coding|procedure code/i.test(lower)) return 'codelinc';
    if (/fhir|bundle|hl7|interop|resource/i.test(lower)) return 'bridgelinc';
    if (/complian|hipaa|pdpo|audit|breach|gdpr/i.test(lower)) return 'compliancelinc';
    if (/translat|arabic|english|ترجم|عربي/i.test(lower)) return 'ttlinc';
    if (/message|whatsapp|sms|remind|patient.*contact/i.test(lower)) return 'basma';
    if (/eligib|batch|remittance|nphies/i.test(lower)) return 'brainsait-nphies-agent';

    return 'masterlinc';
  }

  private async handleWebSocket(request: Request): Promise<Response> {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.state.acceptWebSocket(server as unknown as WebSocket);
    this.webSockets.push(server as unknown as WebSocket);

    const session = await this.loadSession();
    (server as unknown as WebSocket).send(JSON.stringify({
      type: 'connected',
      sessionId: session.sessionId,
      historyLength: session.history.length,
    }));

    return new Response(null, { status: 101, webSocket: client as unknown as WebSocket });
  }

  private broadcast(msg: unknown): void {
    const json = JSON.stringify(msg);
    this.webSockets = this.webSockets.filter((ws) => {
      try { ws.send(json); return true; } catch { return false; }
    });
  }

  private async getHistory(): Promise<Response> {
    const session = await this.loadSession();
    return Response.json({ history: session.history, sessionId: session.sessionId });
  }

  private async getContext(): Promise<Response> {
    const session = await this.loadSession();
    return Response.json({ context: session.context, activeAgent: session.activeAgent });
  }

  private async resetSession(): Promise<Response> {
    await this.state.storage.delete('session');
    this.session = null;
    return Response.json({ status: 'reset' });
  }
}
