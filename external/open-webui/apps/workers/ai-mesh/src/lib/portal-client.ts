/**
 * Portal client — makes authenticated requests from the AI Mesh Worker to the
 * BrainSAIT Browser Agent Service (https://browser-agent.elfadil.com).
 *
 * Auth: short-lived HS256 JWT signed with BROWSER_SERVICE_SECRET.
 * The browser service validates the same secret (shared via env var).
 */

import type { Env } from '../index';

async function signToken(secret: string, requestId: string): Promise<string> {
  // URL-safe base64 helper — must convert BEFORE signing (jose verifies over URL-safe parts)
  const b64url = (s: string) =>
    btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  const header  = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now     = Math.floor(Date.now() / 1000);
  const payload = b64url(JSON.stringify({
    iss: 'brainsait-ai-mesh',
    aud: 'browser-service',
    sub: requestId,
    iat: now,
    exp: now + 300,
  }));

  // Sign over the URL-safe signing input (header.payload without padding)
  const data = `${header}.${payload}`;

  // Decode hex secret to raw bytes (matches Buffer.from(secret, 'hex') on browser-service side)
  const keyBytes = new Uint8Array(secret.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));
  const key = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );

  const sig    = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  return `${data}.${sigB64}`;
}

interface PortalClientOptions {
  env: Env;
  requestId: string;
}

export class PortalClient {
  private baseUrl: string;
  private secret: string;
  private requestId: string;

  constructor(opts: PortalClientOptions) {
    this.baseUrl = opts.env.BROWSER_SERVICE_URL ?? 'https://browser-agent.elfadil.com';
    this.secret = opts.env.BROWSER_SERVICE_SECRET ?? '';
    this.requestId = opts.requestId;
  }

  private async headers(): Promise<Record<string, string>> {
    const token = await signToken(this.secret, this.requestId);
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Request-ID': this.requestId,
    };
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const resp = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: await this.headers(),
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: resp.statusText })) as any;
      throw Object.assign(new Error(err.message ?? err.error ?? 'Portal service error'), {
        code: err.code ?? 'PORTAL_ERROR',
        status: resp.status,
      });
    }

    return resp.json() as Promise<T>;
  }

  async get<T>(path: string): Promise<T> {
    const resp = await fetch(`${this.baseUrl}${path}`, {
      headers: await this.headers(),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: resp.statusText })) as any;
      throw Object.assign(new Error(err.error ?? 'Portal service error'), { status: resp.status });
    }

    return resp.json() as Promise<T>;
  }

  async delete(path: string): Promise<void> {
    await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: await this.headers(),
    });
  }
}
