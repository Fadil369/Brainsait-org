/**
 * BrainSAIT Google Chat Worker
 *
 * Handles incoming events from Google Chat (app webhook) and sends
 * proactive messages to configured spaces.
 *
 * Secrets required (set via wrangler secret put):
 *   GOOGLE_CHAT_WEBHOOK_URL   – Incoming webhook URL for the default space
 *   NOTIFICATION_ROUTER_URL   – https://notifications.brainsait.org
 *
 * Bindings required:
 *   GCHAT_KV                  – KV namespace for space subscriptions
 */

const ROOMS = [
  { id: 'general',    name: 'General',          emoji: '💬' },
  { id: 'dev',        name: 'Development',       emoji: '💻' },
  { id: 'operations', name: 'Operations',         emoji: '⚙️' },
  { id: 'mentorship', name: 'Mentor Sessions',   emoji: '🎓' },
];

// --------------------------------------------------------------------------
// Main handler
// --------------------------------------------------------------------------
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = (r) => withCors(r);

    if (request.method === 'OPTIONS') {
      return cors(new Response(null, { status: 204 }));
    }

    if (url.pathname === '/health') {
      return cors(Response.json({ status: 'ok', service: 'brainsait-google-chat' }));
    }

    // Google Chat sends events here
    if (request.method === 'POST' && url.pathname === '/event') {
      return cors(await handleChatEvent(request, env));
    }

    // Notification router calls this to push a message into a space
    if (request.method === 'POST' && url.pathname === '/notify') {
      return cors(await handleInboundNotify(request, env));
    }

    return cors(Response.json({ error: 'not found' }, { status: 404 }));
  },
};

// --------------------------------------------------------------------------
// Google Chat event handler
// --------------------------------------------------------------------------
async function handleChatEvent(request, env) {
  let event;
  try {
    event = await request.json();
  } catch {
    return Response.json({ error: 'invalid JSON' }, { status: 400 });
  }

  const { type, message, space } = event;

  if (type === 'ADDED_TO_SPACE') {
    return Response.json(buildTextCard(
      'BrainSAIT Bot Connected',
      'Hi! I connect this Google Chat space to your BrainSAIT team rooms.\n\nType `/rooms` to see available rooms or `/help` for all commands.',
    ));
  }

  if (type === 'MESSAGE' && message?.text) {
    const text = (message.text || '').trim();
    const spaceId = space?.name || 'unknown';

    if (text.startsWith('/')) {
      return handleSlashCommand(text, spaceId, event, env);
    }

    // Forward plain message to subscribed room
    await forwardToRoom(spaceId, message, env);
    return Response.json({});
  }

  if (type === 'CARD_CLICKED') {
    const action = event.action?.actionMethodName || '';
    const spaceId = space?.name || 'unknown';
    if (action.startsWith('join:')) {
      const roomId = action.replace('join:', '');
      return handleJoinRoom(spaceId, roomId, env);
    }
  }

  return Response.json({});
}

// --------------------------------------------------------------------------
// Slash command dispatch
// --------------------------------------------------------------------------
async function handleSlashCommand(text, spaceId, event, env) {
  const [command, ...args] = text.trim().split(/\s+/);

  switch (command.toLowerCase()) {
    case '/start':
    case '/help':
      return Response.json(buildHelpCard());

    case '/rooms':
      return Response.json(buildRoomsCard());

    case '/join': {
      const roomId = args[0] || '';
      return handleJoinRoom(spaceId, roomId, env);
    }

    case '/leave':
      return handleLeaveRoom(spaceId, env);

    case '/status': {
      const sub = await getSubscribedRoom(spaceId, env);
      const msg = sub
        ? `You are subscribed to *${sub.name}* ${sub.emoji}`
        : 'Not subscribed to any room. Use /rooms to join one.';
      return Response.json(buildTextCard('Status', msg));
    }

    case '/notify': {
      const roomId = (args[0] || '').replace('#', '');
      if (roomId) {
        return handleJoinRoom(spaceId, roomId, env);
      }
      return Response.json(buildTextCard('Usage', 'Use `/notify <room-id>` to subscribe to a room.'));
    }

    default:
      return Response.json(buildTextCard('Unknown Command', 'Type `/help` to see available commands.'));
  }
}

// --------------------------------------------------------------------------
// Room join / leave
// --------------------------------------------------------------------------
async function handleJoinRoom(spaceId, roomId, env) {
  const room = ROOMS.find((r) => r.id === roomId);
  if (!room) {
    return Response.json(buildTextCard('Unknown Room', `Room "${roomId}" not found. Use /rooms to browse.`));
  }

  await env.GCHAT_KV.put(`sub:${spaceId}`, roomId, { expirationTtl: 86400 * 365 });

  // Add to broadcast list
  const listKey = `gc-subs:${roomId}`;
  const existing = await env.GCHAT_KV.get(listKey, { type: 'json' }) || [];
  if (!existing.includes(spaceId)) {
    existing.push(spaceId);
    await env.GCHAT_KV.put(listKey, JSON.stringify(existing), { expirationTtl: 86400 * 365 });
  }

  return Response.json(buildTextCard(
    `${room.emoji} Subscribed to ${room.name}`,
    `Messages in this space will appear in the ${room.name} room and vice-versa.`,
  ));
}

async function handleLeaveRoom(spaceId, env) {
  const roomId = await env.GCHAT_KV.get(`sub:${spaceId}`);
  if (roomId) {
    await env.GCHAT_KV.delete(`sub:${spaceId}`);
    const listKey = `gc-subs:${roomId}`;
    const existing = await env.GCHAT_KV.get(listKey, { type: 'json' }) || [];
    await env.GCHAT_KV.put(listKey, JSON.stringify(existing.filter((id) => id !== spaceId)));
  }
  return Response.json(buildTextCard('Unsubscribed', 'No longer receiving room notifications.'));
}

async function getSubscribedRoom(spaceId, env) {
  const roomId = await env.GCHAT_KV.get(`sub:${spaceId}`);
  return roomId ? ROOMS.find((r) => r.id === roomId) : null;
}

// --------------------------------------------------------------------------
// Forward Google Chat message to notification router
// --------------------------------------------------------------------------
async function forwardToRoom(spaceId, message, env) {
  const room = await getSubscribedRoom(spaceId, env);
  if (!room || !env.NOTIFICATION_ROUTER_URL) return;

  const senderName = message.sender?.displayName || 'Google Chat User';

  await fetch(`${env.NOTIFICATION_ROUTER_URL}/api/v1/chat/rooms/${room.id}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      senderId: `gchat:${spaceId}`,
      senderName: `${senderName} (Google Chat)`,
      message: message.text || '[non-text message]',
    }),
  }).catch(() => { /* best-effort */ });
}

// --------------------------------------------------------------------------
// Inbound notify — push a room message to all subscribed spaces
// --------------------------------------------------------------------------
async function handleInboundNotify(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || !body.roomId || !body.message) {
    return Response.json({ error: 'roomId and message required' }, { status: 400 });
  }

  const listKey = `gc-subs:${body.roomId}`;
  const spaceIds = await env.GCHAT_KV.get(listKey, { type: 'json' }) || [];

  // Try the default webhook first if no specific spaces
  const webhooks = spaceIds.length > 0
    ? spaceIds
    : (env.GOOGLE_CHAT_WEBHOOK_URL ? [env.GOOGLE_CHAT_WEBHOOK_URL] : []);

  const text = `💬 *${body.senderName || 'BrainSAIT'}* (${body.roomId}):\n${body.message}`;
  const results = await Promise.allSettled(
    webhooks.map((webhook) => sendToWebhook(webhook, text))
  );

  return Response.json({ sent: results.filter((r) => r.status === 'fulfilled').length });
}

async function sendToWebhook(webhookUrl, text) {
  // If it's a space name (e.g. "spaces/XXXXX"), skip — those need OAuth which is out of scope
  if (!webhookUrl.startsWith('http')) return;
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
}

// --------------------------------------------------------------------------
// Google Chat card builders
// --------------------------------------------------------------------------
function buildTextCard(title, text) {
  return {
    cardsV2: [{
      cardId: 'brainsait-card',
      card: {
        header: { title: 'BrainSAIT Incubator', subtitle: title, imageUrl: 'https://brainsait.org/favicon.ico' },
        sections: [{ widgets: [{ textParagraph: { text } }] }],
      },
    }],
  };
}

function buildHelpCard() {
  const commands = [
    '/rooms — Browse and join team rooms',
    '/join <room-id> — Subscribe this space to a room',
    '/leave — Unsubscribe from room notifications',
    '/status — Show current subscription',
    '/notify <room-id> — Alias for /join',
    '/help — Show this message',
  ];
  return {
    cardsV2: [{
      cardId: 'help-card',
      card: {
        header: { title: 'BrainSAIT Incubator Bot', subtitle: 'Available Commands' },
        sections: [{
          widgets: commands.map((cmd) => ({ textParagraph: { text: `• ${cmd}` } })),
        }],
      },
    }],
  };
}

function buildRoomsCard() {
  const buttons = ROOMS.map((r) => ({
    buttonList: {
      buttons: [{
        text: `${r.emoji} Join ${r.name}`,
        onClick: { action: { actionMethodName: `join:${r.id}` } },
      }],
    },
  }));

  return {
    cardsV2: [{
      cardId: 'rooms-card',
      card: {
        header: { title: 'BrainSAIT Team Rooms', subtitle: 'Select a room to subscribe' },
        sections: [{ widgets: buttons }],
      },
    }],
  };
}

// --------------------------------------------------------------------------
// CORS
// --------------------------------------------------------------------------
function withCors(response) {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return new Response(response.body, { status: response.status, headers });
}
