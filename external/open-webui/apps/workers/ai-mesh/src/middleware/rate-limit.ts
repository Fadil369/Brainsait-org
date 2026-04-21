/**
 * Rate Limit Middleware — per-model sliding window
 */

import type { Context, Next } from 'hono';
import type { Env } from '../index';

const LIMITS: Record<string, { requests: number; windowSec: number }> = {
  'masterlinc': { requests: 100, windowSec: 60 },
  'claimlinc': { requests: 200, windowSec: 60 },
  'default': { requests: 60, windowSec: 60 },
};

export async function rateLimitMiddleware(c: Context<{ Bindings: Env }>, next: Next): Promise<void | Response> {
  const auth = c.req.header('Authorization') ?? 'anon';
  const model = (await c.req.json().catch(() => ({} as any))).model ?? 'default';
  const key = `rl:${auth.slice(-8)}:${model}`;

  const limit = LIMITS[model] ?? LIMITS['default'];
  const now = Math.floor(Date.now() / 1000);
  const windowKey = `${key}:${Math.floor(now / limit.windowSec)}`;

  const current = parseInt((await c.env.RATE_LIMIT.get(windowKey)) ?? '0');
  if (current >= limit.requests) {
    return c.json({ error: 'Rate limit exceeded', retryAfter: limit.windowSec }, 429);
  }

  await c.env.RATE_LIMIT.put(windowKey, (current + 1).toString(), { expirationTtl: limit.windowSec * 2 });
  await next();
}
