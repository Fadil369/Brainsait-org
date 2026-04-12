/**
 * Auth Middleware — JWT / API Key validation
 */

import type { Context, Next } from 'hono';
import type { Env } from '../index';

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next): Promise<void | Response> {
  const auth = c.req.header('Authorization') ?? '';

  if (!auth) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (auth.startsWith('Bearer sk-')) {
    // API key — strip "Bearer sk-" prefix (10 chars) to get raw key
    const key = auth.slice(10);
    const valid = await c.env.SESSIONS.get(`apikey:${key}`);
    // Allow the BrainSAIT admin key or any registered key
    if (!valid && key !== 'brainsait-4a4bf67acc084d3560faa0670b7f0d6465df4b3d') {
      return c.json({ error: 'Invalid API key' }, 401);
    }
  } else if (auth.startsWith('Bearer ey')) {
    // JWT — validate signature
    try {
      await verifyJWT(auth.slice(7), c.env.JWT_SECRET);
    } catch {
      return c.json({ error: 'Invalid token' }, 401);
    }
  } else {
    return c.json({ error: 'Unsupported auth scheme' }, 401);
  }

  await next();
}

async function verifyJWT(token: string, secret: string): Promise<void> {
  const [header, payload, sig] = token.split('.');
  if (!header || !payload || !sig) throw new Error('Malformed JWT');

  const data = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const sigBytes = Uint8Array.from(atob(sig.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
  const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(data));
  if (!valid) throw new Error('JWT signature invalid');

  const claims = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  if (claims.exp && claims.exp < Date.now() / 1000) throw new Error('JWT expired');
}
