/**
 * BrowserSessionDO — Durable Object for portal session coordination.
 *
 * Tracks portal sessions created by the browser-service.
 * Provides locking (one active actor per session), TTL enforcement,
 * and metadata persistence across Worker invocations.
 */

import type { Env } from '../index';

interface SessionMeta {
  sessionId: string;
  portal: 'oracle' | 'nphies';
  branch?: string;
  status: 'active' | 'locked' | 'expired';
  lockedBy?: string;           // requestId that holds the lock
  createdAt: number;
  lastUsedAt: number;
  ttlMs: number;
}

export class BrowserSessionDO {
  private state: DurableObjectState;
  private sessions: Map<string, SessionMeta> = new Map();

  constructor(state: DurableObjectState, _env: Env) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    await this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get<Record<string, SessionMeta>>('sessions');
      if (stored) {
        this.sessions = new Map(Object.entries(stored));
      }
    });

    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);
    const method = request.method;

    // POST /session — create session record
    if (method === 'POST' && parts[0] === 'session') {
      const body = await request.json() as Partial<SessionMeta>;
      if (!body.sessionId || !body.portal) {
        return Response.json({ error: 'sessionId and portal required' }, { status: 400 });
      }

      const meta: SessionMeta = {
        sessionId: body.sessionId,
        portal: body.portal,
        branch: body.branch,
        status: 'active',
        createdAt: Date.now(),
        lastUsedAt: Date.now(),
        ttlMs: body.ttlMs ?? 30 * 60 * 1000,
      };

      this.sessions.set(body.sessionId, meta);
      await this.persist();

      // Schedule alarm for cleanup
      await this.state.storage.setAlarm(Date.now() + meta.ttlMs + 60_000);

      return Response.json(meta);
    }

    // GET /session/:id — read session
    if (method === 'GET' && parts[0] === 'session' && parts[1]) {
      const meta = this.sessions.get(parts[1]);
      if (!meta) return Response.json({ error: 'not found' }, { status: 404 });

      const isExpired = (Date.now() - meta.lastUsedAt) > meta.ttlMs;
      return Response.json({ ...meta, status: isExpired ? 'expired' : meta.status });
    }

    // PUT /session/:id/lock — acquire lock
    if (method === 'PUT' && parts[0] === 'session' && parts[2] === 'lock') {
      const meta = this.sessions.get(parts[1]!);
      if (!meta) return Response.json({ error: 'not found' }, { status: 404 });

      if (meta.status === 'locked') {
        return Response.json({ error: 'Session is locked by another process', lockedBy: meta.lockedBy }, { status: 409 });
      }

      const { requestId } = await request.json() as { requestId: string };
      meta.status = 'locked';
      meta.lockedBy = requestId;
      meta.lastUsedAt = Date.now();
      await this.persist();

      return Response.json({ ok: true, sessionId: meta.sessionId });
    }

    // PUT /session/:id/unlock — release lock
    if (method === 'PUT' && parts[0] === 'session' && parts[2] === 'unlock') {
      const meta = this.sessions.get(parts[1]!);
      if (!meta) return Response.json({ error: 'not found' }, { status: 404 });

      meta.status = 'active';
      meta.lockedBy = undefined;
      meta.lastUsedAt = Date.now();
      await this.persist();

      return Response.json({ ok: true });
    }

    // DELETE /session/:id — mark expired
    if (method === 'DELETE' && parts[0] === 'session' && parts[1]) {
      const meta = this.sessions.get(parts[1]);
      if (meta) {
        meta.status = 'expired';
        await this.persist();
      }
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  async alarm(): Promise<void> {
    const now = Date.now();
    for (const [id, meta] of this.sessions) {
      if ((now - meta.lastUsedAt) > meta.ttlMs) {
        this.sessions.delete(id);
      }
    }
    await this.persist();
  }

  private async persist(): Promise<void> {
    const obj: Record<string, SessionMeta> = {};
    for (const [k, v] of this.sessions) obj[k] = v;
    await this.state.storage.put('sessions', obj);
  }
}
