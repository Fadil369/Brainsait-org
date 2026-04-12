/**
 * Credential vault — envelope encryption for portal credentials in KV.
 *
 * Master key: ENCRYPTION_KEY (Workers Secret, 32 hex chars → 16 bytes, or base64)
 * Algorithm: AES-GCM 256-bit
 *
 * KV key pattern: portal:{portal}:{branch}:creds
 *
 * NOTE: This stores session credentials (username/password) encrypted.
 * The Worker never logs plaintext credentials.
 */

import type { Env } from '../index';

interface PortalCredentials {
  username: string;
  password: string;
  extraFields?: Record<string, string>;
  storedAt: number;
}

async function deriveKey(rawKey: string): Promise<CryptoKey> {
  // Accept either base64 or hex-encoded 32-byte key
  let keyBytes: Uint8Array;
  if (/^[0-9a-fA-F]{64}$/.test(rawKey)) {
    // 64 hex chars = 32 bytes
    keyBytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      keyBytes[i] = parseInt(rawKey.slice(i * 2, i * 2 + 2), 16);
    }
  } else {
    keyBytes = Uint8Array.from(atob(rawKey), (c) => c.charCodeAt(0));
  }

  return crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export async function storeCredentials(
  env: Env,
  portal: string,
  branch: string,
  credentials: { username: string; password: string; extraFields?: Record<string, string> },
): Promise<void> {
  const key = await deriveKey(env.ENCRYPTION_KEY);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const plaintext = JSON.stringify({ ...credentials, storedAt: Date.now() } satisfies PortalCredentials);
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

  // Store as base64(iv):base64(ciphertext)
  const ivB64 = btoa(String.fromCharCode(...iv));
  const ctB64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));

  await env.LINC_CACHE.put(
    `portal:${portal}:${branch}:creds`,
    `${ivB64}:${ctB64}`,
    { expirationTtl: 365 * 24 * 60 * 60 },  // 1 year
  );
}

export async function loadCredentials(
  env: Env,
  portal: string,
  branch: string,
): Promise<PortalCredentials | null> {
  const stored = await env.LINC_CACHE.get(`portal:${portal}:${branch}:creds`);
  if (!stored) return null;

  const colonIdx = stored.indexOf(':');
  if (colonIdx === -1) return null;

  const ivB64 = stored.slice(0, colonIdx);
  const ctB64 = stored.slice(colonIdx + 1);

  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(ctB64), (c) => c.charCodeAt(0));

  const key = await deriveKey(env.ENCRYPTION_KEY);

  try {
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return JSON.parse(new TextDecoder().decode(plaintext)) as PortalCredentials;
  } catch {
    return null;
  }
}

export async function deleteCredentials(
  env: Env,
  portal: string,
  branch: string,
): Promise<void> {
  await env.LINC_CACHE.delete(`portal:${portal}:${branch}:creds`);
}
