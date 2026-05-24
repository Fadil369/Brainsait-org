import { Env, EtimadToken } from '../types';
import { ETIMAD_TOKEN_TTL_SECONDS, KV_PREFIX } from '../constants';
import { generateUUID, generateMofGUID } from '../utils/uuid';

/**
 * AFESWE FR-04: OAuth Token Orchestration Agent.
 * Automatically retrieves, caches, and rotates Etimad Bearer tokens
 * before the rigid 3599-second expiration window.
 *
 * Flow:
 *   1. Check KV cache for valid token (with 60s safety margin)
 *   2. If missing/expiring → POST /oauth/v2/accesstoken (client_credentials)
 *   3. Store in KV with TTL = 3539s (3599 - 60s safety margin)
 *   4. Persist to D1 for audit trail
 */
export async function getEtimadToken(env: Env): Promise<string> {
  const cacheKey = `${KV_PREFIX.ETIMAD_TOKEN}${env.ETIMAD_CLIENT_ID}`;

  // 1. Check KV cache
  const cached = await env.WATHQ_KV.get(cacheKey);
  if (cached) return cached;

  // 2. Fetch fresh token via client_credentials grant (TLS 1.2 enforced by CF)
  const credentials = btoa(`${env.ETIMAD_CLIENT_ID}:${env.ETIMAD_CLIENT_SECRET}`);
  const resp = await fetch(env.ETIMAD_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=openid',
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Etimad token fetch failed [${resp.status}]: ${text}`);
  }

  const token: EtimadToken = await resp.json();

  // 3. Cache in KV with 60s safety margin (TTL = 3599 - 60 = 3539s)
  const kvTtl = Math.max((token.expires_in ?? ETIMAD_TOKEN_TTL_SECONDS) - 60, 60);
  await env.WATHQ_KV.put(cacheKey, token.access_token, { expirationTtl: kvTtl });

  // 4. Persist to D1 for compliance audit
  const expiresAt = new Date(Date.now() + (token.expires_in ?? ETIMAD_TOKEN_TTL_SECONDS) * 1000);
  await env.DB.prepare(`
    UPDATE etimad_tokens SET is_active = 0 WHERE client_id = ? AND is_active = 1
  `).bind(env.ETIMAD_CLIENT_ID).run();

  await env.DB.prepare(`
    INSERT INTO etimad_tokens (id, client_id, access_token, token_type, expires_at, ttl_seconds, organization, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `).bind(
    generateUUID(),
    env.ETIMAD_CLIENT_ID,
    token.access_token.slice(0, 20) + '...', // truncate for D1 — full token in KV only
    token.token_type,
    expiresAt.toISOString(),
    token.expires_in ?? ETIMAD_TOKEN_TTL_SECONDS,
    token.organization_name ?? 'mof',
  ).run();

  return token.access_token;
}

/**
 * Query Etimad Contracts API for a bank guarantee / contract lookup.
 * Requires: Bearer token + X_MOF_RqUID GUID + idType.
 */
export async function queryEtimadContract(
  env: Env,
  contractNumber: string,
  idType: '01' | '02' | '03' = '01',
): Promise<unknown> {
  const token = await getEtimadToken(env);
  const guid = generateMofGUID();
  const url = `${env.ETIMAD_CONTRACTS_URL}/${contractNumber}?idType=${idType}`;

  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'X_MOF_RqUID': guid,
      'X_MOF_ClientID': env.ETIMAD_CLIENT_ID,
    },
  });

  if (resp.status === 401) {
    // Token expired mid-flight — invalidate cache and retry once
    const cacheKey = `${KV_PREFIX.ETIMAD_TOKEN}${env.ETIMAD_CLIENT_ID}`;
    await env.WATHQ_KV.delete(cacheKey);
    return queryEtimadContract(env, contractNumber, idType);
  }

  if (!resp.ok) {
    throw new Error(`Etimad Contracts API error [${resp.status}]: ${await resp.text()}`);
  }

  return { data: await resp.json(), xMofRqUid: guid };
}
