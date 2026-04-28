/**
 * NPHIES shared helpers — extracted for reuse by basma.ts
 */

export interface Env {
  NPHIES_USERNAME: string;
  NPHIES_PASSWORD: string;
  NPHIES_TOKEN_URL: string;
  NPHIES_VIEWER_API: string;
  NPHIES_CLIENT_ID: string;
  API_SECRET_KEY: string;
}

export const FACILITIES: Record<string, { license: string; name: string; type: string }> = {
  riyadh:  { license: "10000000000988", type: "Provider", name: "Al-Hayat National Hospital, Riyadh" },
  madinah: { license: "10000300220660", type: "Provider", name: "Hayat National Hospital – Madinah" },
  unaizah: { license: "10000000030262", type: "Provider", name: "Al-Hayat National Hospital - Unaizah" },
  khamis:  { license: "10000000030643", type: "Provider", name: "Al-Hayat National Hospital - Khamis Mushait" },
  jizan:   { license: "10000000037034", type: "Provider", name: "The National Life Hospital, Jazan" },
  abha:    { license: "10000300330931", type: "Provider", name: "HNHN ABHA" },
};

// Per-isolate token cache
let _token: string | null = null;
let _tokenExpiry = 0;

export async function getToken(env: Env): Promise<string> {
  const now = Date.now() / 1000;
  if (_token && now < _tokenExpiry - 30) return _token;
  const resp = await fetch(env.NPHIES_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.NPHIES_CLIENT_ID,
      grant_type: "password",
      username: env.NPHIES_USERNAME,
      password: env.NPHIES_PASSWORD,
      scope: "openid",
    }),
  });
  if (!resp.ok) throw new Error(`NPHIES auth failed: ${resp.status}`);
  const data = await resp.json() as { access_token: string; expires_in: number };
  _token = data.access_token;
  _tokenExpiry = now + (data.expires_in ?? 240);
  return _token;
}

export async function nphiesGet(
  env: Env,
  path: string,
  branch: string | null,
  params: Record<string, string> = {}
): Promise<Response> {
  const token = await getToken(env);
  const fac = branch ? FACILITIES[branch] : null;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    Origin: "https://viewer.nphies.sa",
  };
  if (fac) {
    headers["facilitylicense"] = fac.license;
    headers["facilitytype"]    = fac.type;
    headers["username"]        = fac.license;
  }
  const url = new URL(`${env.NPHIES_VIEWER_API}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return fetch(url.toString(), { headers, signal: AbortSignal.timeout(30000) });
}
