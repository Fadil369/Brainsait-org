/**
 * BrainSAIT Cloudflare Calls Proxy Worker
 *
 * Keeps CF_CALLS_APP_SECRET server-side and provides a clean API for the
 * frontend to create/manage WebRTC sessions via Cloudflare Calls.
 *
 * Secrets required (set via wrangler secret put):
 *   CF_CALLS_APP_ID     – App ID from Cloudflare dashboard → Calls
 *   CF_CALLS_APP_SECRET – App secret
 *
 * Env vars (wrangler.toml [vars]):
 *   AGENT_URL           – URL of the realtime-agent worker (e.g. https://agent.brainsait.org)
 *
 * API surface:
 *   POST /v1/sessions              – Create a new session, returns sessionId + ICE config
 *   POST /v1/sessions/:id/tracks  – Add SDP track offer, returns SDP answer
 *   PUT  /v1/sessions/:id/tracks  – Renegotiate tracks
 *   GET  /v1/sessions/:id         – Get session details
 *   DELETE /v1/sessions/:id       – Close session
 *   GET  /v1/ice                  – Return STUN/TURN configuration
 *   POST /v1/agent/join           – Invite Linc (AI mentor) into a RealtimeKit meeting
 *   POST /v1/agent/leave          – Remove Linc from a RealtimeKit meeting
 */

const CF_CALLS_BASE = 'https://rtc.live.cloudflare.com/v1/apps';

const CORS_ORIGINS = new Set([
  'https://brainsait.org',
  'https://partners.brainsait.org',
  'http://localhost:3000',
  'http://localhost:3001',
]);

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return corsResponse(new Response(null, { status: 204 }), request);
    }

    const url = new URL(request.url);
    const wrap = (r) => corsResponse(r, request);

    if (url.pathname === '/health') {
      return wrap(Response.json({ status: 'ok', service: 'brainsait-cf-calls' }));
    }

    // GET /v1/ice — return ICE/TURN config (no auth required on client)
    if (url.pathname === '/v1/ice' && request.method === 'GET') {
      return wrap(Response.json(buildIceConfig()));
    }

    // POST /v1/sessions — create a new session
    if (url.pathname === '/v1/sessions' && request.method === 'POST') {
      return wrap(await createSession(request, env));
    }

    // POST /v1/sessions/:id/tracks — add tracks (SDP offer/answer)
    const tracksMatch = url.pathname.match(/^\/v1\/sessions\/([^/]+)\/tracks$/);
    if (tracksMatch && (request.method === 'POST' || request.method === 'PUT')) {
      return wrap(await manageTracks(tracksMatch[1], request, env));
    }

    // GET /v1/sessions/:id — session details
    const sessionMatch = url.pathname.match(/^\/v1\/sessions\/([^/]+)$/);
    if (sessionMatch && request.method === 'GET') {
      return wrap(await getSession(sessionMatch[1], env));
    }

    // DELETE /v1/sessions/:id — close session
    if (sessionMatch && request.method === 'DELETE') {
      return wrap(await closeSession(sessionMatch[1], env));
    }

    // POST /v1/agent/join — invite Linc (AI mentor) into a RealtimeKit meeting
    if (url.pathname === '/v1/agent/join' && request.method === 'POST') {
      return wrap(await agentJoin(request, env));
    }

    // POST /v1/agent/leave — remove Linc from a RealtimeKit meeting
    if (url.pathname === '/v1/agent/leave' && request.method === 'POST') {
      return wrap(await agentLeave(request, env));
    }

    return wrap(Response.json({ error: 'not found' }, { status: 404 }));
  },
};

// --------------------------------------------------------------------------
// Realtime Agent (Linc) proxy
// --------------------------------------------------------------------------

/**
 * Invite Linc into a RealtimeKit meeting.
 *
 * Request body (JSON):
 *   { "meetingId": "<rtk-meeting-id>" }
 * Headers:
 *   Authorization: Bearer <realtimekit-auth-token>
 *
 * The caller must provide a RealtimeKit meeting ID and a valid auth token for
 * that meeting (obtained from dash.realtime.cloudflare.com or the RTK API).
 * Linc will join the meeting and greet participants automatically.
 */
async function agentJoin(request, env) {
  const agentUrl = env.AGENT_URL ?? 'https://agent.brainsait.org';
  const authHeader = request.headers.get('Authorization');

  let meetingId;
  try {
    const body = await request.json();
    meetingId = body.meetingId;
  } catch {
    return Response.json({ error: 'JSON body with meetingId required' }, { status: 400 });
  }

  if (!meetingId) {
    return Response.json({ error: 'meetingId is required' }, { status: 400 });
  }
  if (!authHeader) {
    return Response.json({ error: 'Authorization header required (RealtimeKit auth token)' }, { status: 401 });
  }

  const resp = await fetch(`${agentUrl}/init?meetingId=${encodeURIComponent(meetingId)}`, {
    method: 'POST',
    headers: { Authorization: authHeader },
  });

  const data = await resp.json().catch(() => ({ error: 'agent returned non-JSON' }));
  return Response.json(data, { status: resp.status });
}

/**
 * Remove Linc from a RealtimeKit meeting.
 *
 * Request body (JSON):
 *   { "meetingId": "<rtk-meeting-id>" }
 */
async function agentLeave(request, env) {
  const agentUrl = env.AGENT_URL ?? 'https://agent.brainsait.org';

  let meetingId;
  try {
    const body = await request.json();
    meetingId = body.meetingId;
  } catch {
    return Response.json({ error: 'JSON body with meetingId required' }, { status: 400 });
  }

  if (!meetingId) {
    return Response.json({ error: 'meetingId is required' }, { status: 400 });
  }

  const resp = await fetch(`${agentUrl}/deinit?meetingId=${encodeURIComponent(meetingId)}`, {
    method: 'POST',
  });

  const data = await resp.json().catch(() => ({ error: 'agent returned non-JSON' }));
  return Response.json(data, { status: resp.status });
}

// --------------------------------------------------------------------------
// Session management
// --------------------------------------------------------------------------
async function createSession(request, env) {
  if (!env.CF_CALLS_APP_ID || !env.CF_CALLS_APP_SECRET) {
    return Response.json({ error: 'CF Calls not configured' }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));

  // Allow caller to pass a roomId for naming; we store that in the response
  const { roomId = 'default', participantName = 'User' } = body;

  const cfResp = await callsApi('POST', `/sessions/new`, {}, env);
  if (!cfResp.ok) {
    const err = await cfResp.text();
    return Response.json({ error: 'CF Calls session creation failed', detail: err }, { status: 502 });
  }

  const data = await cfResp.json();

  return Response.json({
    sessionId: data.sessionId,
    iceServers: buildIceConfig().iceServers,
    roomId,
    participantName,
    _cf: data,
  }, { status: 201 });
}

async function manageTracks(sessionId, request, env) {
  if (!env.CF_CALLS_APP_ID || !env.CF_CALLS_APP_SECRET) {
    return Response.json({ error: 'CF Calls not configured' }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const method = request.method === 'PUT' ? 'PUT' : 'POST';

  const cfResp = await callsApi(method, `/sessions/${sessionId}/tracks/new`, body, env);
  if (!cfResp.ok) {
    const err = await cfResp.text();
    return Response.json({ error: 'Track management failed', detail: err }, { status: 502 });
  }

  return Response.json(await cfResp.json());
}

async function getSession(sessionId, env) {
  if (!env.CF_CALLS_APP_ID || !env.CF_CALLS_APP_SECRET) {
    return Response.json({ error: 'CF Calls not configured' }, { status: 503 });
  }

  const cfResp = await callsApi('GET', `/sessions/${sessionId}`, null, env);
  if (!cfResp.ok) {
    return Response.json({ error: 'Session not found' }, { status: 404 });
  }

  return Response.json(await cfResp.json());
}

async function closeSession(sessionId, env) {
  if (!env.CF_CALLS_APP_ID || !env.CF_CALLS_APP_SECRET) {
    return Response.json({ error: 'CF Calls not configured' }, { status: 503 });
  }

  // CF Calls doesn't have a dedicated DELETE — we close all tracks
  const cfResp = await callsApi('PUT', `/sessions/${sessionId}/tracks/close`, {
    tracks: [{ trackName: '*' }],
    sessionDescription: { type: 'offer', sdp: '' },
  }, env);

  if (!cfResp.ok) {
    const err = await cfResp.text();
    return Response.json({ error: 'Close session failed', detail: err }, { status: 502 });
  }

  return Response.json({ status: 'closed', sessionId });
}

// --------------------------------------------------------------------------
// CF Calls API helper
// --------------------------------------------------------------------------
async function callsApi(method, path, body, env) {
  const url = `${CF_CALLS_BASE}/${env.CF_CALLS_APP_ID}${path}`;
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${env.CF_CALLS_APP_SECRET}`,
      'Content-Type': 'application/json',
    },
  };
  if (body !== null && method !== 'GET') {
    options.body = JSON.stringify(body);
  }
  return fetch(url, options);
}

// --------------------------------------------------------------------------
// ICE / TURN configuration
// --------------------------------------------------------------------------
function buildIceConfig() {
  // Cloudflare's public STUN server
  return {
    iceServers: [
      { urls: 'stun:stun.cloudflare.com:3478' },
    ],
    iceTransportPolicy: 'all',
  };
}

// --------------------------------------------------------------------------
// CORS helpers
// --------------------------------------------------------------------------
function corsResponse(response, request) {
  const headers = new Headers(response.headers);
  const origin = request?.headers.get('Origin') || '';
  headers.set('Access-Control-Allow-Origin', CORS_ORIGINS.has(origin) ? origin : 'https://brainsait.org');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return new Response(response.body, { status: response.status, headers });
}
