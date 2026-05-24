import { Context, Next } from 'hono';
import { Env } from '../types';
import { err } from '../utils/response';

/**
 * API key middleware — validates Bearer token against WATHQ_API_KEY secret.
 * In production, extend to validate JWTs from Etimad OAuth.
 */
export async function requireApiKey(c: Context<{ Bindings: Env }>, next: Next): Promise<Response> {
  const auth = c.req.header('Authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!token) {
    return err(c, 401, 'Missing Authorization header');
  }

  const validKey = c.env.WATHQ_API_KEY;
  if (!validKey || token !== validKey) {
    return err(c, 401, 'Invalid API key');
  }

  // Attach actor context for audit logging
  c.set('actorId', token.slice(-8)); // last 8 chars as actor ID in dev
  c.set('actorIp', c.req.header('CF-Connecting-IP') ?? 'unknown');

  await next();
  return c.res;
}

/**
 * Rate limiter using Cloudflare KV — 60 requests/minute per API key.
 */
export async function rateLimiter(c: Context<{ Bindings: Env }>, next: Next): Promise<Response> {
  const auth = c.req.header('Authorization') ?? 'anon';
  const windowKey = `rate:${auth}:${Math.floor(Date.now() / 60000)}`;

  const current = await c.env.WATHQ_KV.get(windowKey);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= 60) {
    return err(c, 429, 'Rate limit exceeded — 60 requests/minute');
  }

  await c.env.WATHQ_KV.put(windowKey, String(count + 1), { expirationTtl: 120 });
  await next();
  return c.res;
}
