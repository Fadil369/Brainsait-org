import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env, ConversationMessage, VisitorData } from '@basma/shared/types';
import { createAIService } from '@basma/shared/ai-service';
import { transcribeAudio as sttTranscribe, ttsToMulawFrames } from '@basma/shared/speech';
import { createRequestId, log, writeAudit } from '@basma/shared/logger';

const app = new Hono<{ Bindings: Env }>();

app.use('/*', cors());

// Twilio Voice Webhook
app.post('/twilio/voice', async (c) => {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://${c.req.header('host')}/twilio/stream" />
  </Connect>
</Response>`;

  return c.body(twiml, 200, {
    'Content-Type': 'application/xml'
  });
});

// WebSocket Stream Handler
app.get('/twilio/stream', async (c) => {
  const upgradeHeader = c.req.header('Upgrade');
  if (upgradeHeader !== 'websocket') {
    return c.text('Expected websocket', 426);
  }

  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  const meta = {
    rid: c.req.header('x-request-id') || createRequestId(),
    ip: c.req.header('cf-connecting-ip') || '',
    ua: c.req.header('user-agent') || ''
  };

  const callHandler = new CallHandler(c.env, meta);
  await callHandler.handleConnection(server);

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
});

// ──────────────────────────────────────────────────────────────
// Call Handler
// ──────────────────────────────────────────────────────────────
interface CallMeta {
  rid: string;
  ip: string;
  ua: string;
}

class CallHandler {
  private conversationHistory: ConversationMessage[] = [];
  private visitorData: VisitorData = {};
  private callStartTime: number = Date.now();
  private aiService: ReturnType<typeof createAIService>;

  constructor(private env: Env, private meta: CallMeta) {
    // createAIService reads ORACLE_BRIDGE_URL + ORACLE_BRIDGE_API_KEY from env
    this.aiService = createAIService(env);
  }

  async handleConnection(ws: WebSocket) {
    ws.addEventListener('message', async (event) => {
      const data = JSON.parse(event.data as string);

      if (data.event === 'start') {
        this.callStartTime = Date.now();
        log('info', 'twilio_stream_start', { rid: this.meta.rid, start: this.callStartTime });
      }

      if (data.event === 'media') {
        const audioPayload = base64ToUint8Array(data.media.payload);
        const userText = await this.transcribeAudio(audioPayload);
        log('debug', 'transcribed_user_speech', { rid: this.meta.rid, text_len: userText?.length || 0 });

        if (userText) {
          this.conversationHistory.push({
            role: 'user',
            content: userText
          });

          // Use processCallWithTools — handles Oracle OASIS tool calls
          const { text, toolsUsed, thinkingPhrase } = await this.aiService.processCallWithTools(
            this.conversationHistory,
            this.visitorData
          );

          log('debug', 'ai_tools_used', { rid: this.meta.rid, tools: toolsUsed });

          // If AI said a thinking phrase (e.g. "Let me check that for you..."),
          // speak it immediately so caller isn't left in silence during tool execution.
          // In practice processCallWithTools already awaits tools before returning,
          // but the phrase is preserved for UX transparency in logs / future streaming.
          if (thinkingPhrase) {
            log('debug', 'ai_thinking_phrase', { rid: this.meta.rid, phrase: thinkingPhrase });
          }

          if (text) {
            const frames = await ttsToMulawFrames(this.env, text);
            await this.streamFrames(ws, frames);

            this.conversationHistory.push({
              role: 'assistant',
              content: text
            });
          }

          // Extract visitor / patient data from updated conversation
          const extracted = await this.aiService.extractVisitorData(
            this.conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')
          );
          this.visitorData = { ...this.visitorData, ...extracted };
        }
      }

      if (data.event === 'stop') {
        await this.saveCallLog();
        log('info', 'twilio_stream_stop', { rid: this.meta.rid });
        ws.close();
      }
    });

    ws.addEventListener('close', async () => {
      await this.saveCallLog();
      log('info', 'twilio_ws_close', { rid: this.meta.rid });
    });

    ws.accept();
  }

  private async transcribeAudio(audio: Uint8Array): Promise<string> {
    try {
      const result = await sttTranscribe(this.env, audio, { mimeType: 'audio/wav' });
      return result.text;
    } catch (e) {
      console.error('Transcription failed', e);
      return '';
    }
  }

  private async saveCallLog() {
    const duration = Math.floor((Date.now() - this.callStartTime) / 1000);
    const transcript = this.conversationHistory.map(m =>
      `${m.role}: ${m.content}`
    ).join('\n\n');

    const transcriptKey = `transcripts/${crypto.randomUUID()}.txt`;
    await this.env.R2_STORAGE.put(transcriptKey, transcript);

    const summary = await this.aiService.generateSummary(this.conversationHistory);
    const sentiment = await this.aiService.analyzeSentiment(transcript);

    const id = crypto.randomUUID();
    await this.env.DB.prepare(`
      INSERT INTO call_logs (
        id, user_id, visitor_id, call_type, direction, duration_seconds,
        language, summary, sentiment, transcript_url, action_items, created_at, status
      ) VALUES (?, ?, ?, 'inbound', 'incoming', ?, ?, ?, ?, ?, ?, ?, 'completed')
    `).bind(
      id,
      this.visitorData.userId || 'system',
      this.visitorData.visitorId || null,
      duration,
      this.visitorData.language || 'en',
      summary,
      sentiment,
      `r2://${transcriptKey}`,
      JSON.stringify(this.extractActionItems()),
      Date.now()
    ).run();

    await writeAudit(this.env, {
      action: 'create',
      resource_type: 'call_log',
      resource_id: id,
      changes: { duration, summary, sentiment },
      ip_address: this.meta.ip,
      user_agent: this.meta.ua
    });

    if (this.visitorData.phone || this.visitorData.email) {
      await this.upsertVisitor();
    }
  }

  private extractActionItems(): Array<{ action: string; deadline: string }> {
    const items = [];

    if (this.visitorData.appointment_requested) {
      items.push({
        action: 'Schedule appointment',
        deadline: this.visitorData.preferred_time || 'TBD'
      });
    }

    return items;
  }

  private async upsertVisitor() {
    const existing = await this.env.DB.prepare(`
      SELECT id FROM visitors WHERE phone = ? OR email = ?
    `).bind(
      this.visitorData.phone || '',
      this.visitorData.email || ''
    ).first();

    if (existing) {
      await this.env.DB.prepare(`
        UPDATE visitors SET
          last_contact = ?,
          total_interactions = total_interactions + 1,
          lead_score = lead_score + 5,
          metadata = ?
        WHERE id = ?
      `).bind(
        Date.now(),
        JSON.stringify(this.visitorData),
        existing.id
      ).run();

      this.visitorData.visitorId = existing.id as string;
    } else {
      const newId = crypto.randomUUID();
      await this.env.DB.prepare(`
        INSERT INTO visitors (
          id, user_id, name, phone, email, company, source,
          first_contact, last_contact, language, lead_score, status, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, 'phone_call', ?, ?, ?, 0, 'new', ?)
      `).bind(
        newId,
        this.visitorData.userId || 'system',
        this.visitorData.name || null,
        this.visitorData.phone || null,
        this.visitorData.email || null,
        this.visitorData.company || null,
        Date.now(),
        Date.now(),
        this.visitorData.language || 'en',
        JSON.stringify(this.visitorData)
      ).run();

      this.visitorData.visitorId = newId;
    }
  }

  private async streamFrames(ws: WebSocket, frames: Uint8Array[]) {
    for (let i = 0; i < frames.length; i++) {
      ws.send(JSON.stringify({ event: 'media', media: { payload: uint8ToBase64(frames[i]) } }));
      await delay(20);
    }
  }
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
function base64ToUint8Array(base64: string): Uint8Array {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export default app;
