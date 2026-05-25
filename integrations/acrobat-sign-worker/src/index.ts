// ── Acrobat Sign Worker Entry Point ──
// Routes: /sign/agreements, /sign/webhook, /sign/download, /sign/view
import { AdobeSignClient } from './adobe-sign';
import { generateSignedDocViewer } from './pdf-embed';
import type { Env, AgreementCreationRequest, SigningRecord, AdobeWebhookEvent } from './types';

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ success: false, error: message }, status);
}

// ── Verify HMAC signature for webhooks ──
async function verifyWebhookSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const expected = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return expected === signature;
}

// ── Generate unique IDs ──
function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2)}`;
}

// ── API Key auth middleware ──
function verifyApiKey(request: Request): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7);
  // In production, validate against KV or D1
  // For now, check a simple env-configured key
  return token.length > 10; // Basic check — replace with real validation
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const client = new AdobeSignClient(env);

    // ── Health check ──
    if (url.pathname === '/sign/health' && method === 'GET') {
      return jsonResponse({
        status: 'healthy',
        cloud: env.ADOBE_CLOUD || 'commercial',
        timestamp: new Date().toISOString(),
      });
    }

    // ── Create agreement (send for signing) ──
    if (url.pathname === '/sign/agreements' && method === 'POST') {
      try {
        const body = await request.json() as AgreementCreationRequest & { impersonateEmail?: string };

        if (!body.documentBase64 || !body.signerEmail || !body.signerName) {
          return errorResponse('Missing required fields: documentBase64, signerEmail, signerName');
        }

        // Set callback URL for webhooks
        body.callbackUrl = body.callbackUrl || `${url.origin}/sign/webhook`;
        body.frameParent = body.frameParent || url.origin;

        const result = await client.createAgreement(body, body.impersonateEmail);

        // Store in D1
        const recordId = generateId('sign');
        await env.DB.prepare(
          `INSERT INTO signing_records (id, agreement_id, cr_number, verification_id, signer_email, signer_name, document_name, status, signing_url, impersonated_for, metadata)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          recordId,
          result.id,
          body.crNumber || null,
          body.verificationId || null,
          body.signerEmail,
          body.signerName,
          body.documentName,
          result.status,
          result.signingUrl || null,
          body.impersonateEmail || null,
          JSON.stringify({ fields: body.fields || {} })
        ).run();

        return jsonResponse({
          success: true,
          data: {
            recordId,
            agreementId: result.id,
            status: result.status,
            signingUrl: result.signingUrl,
          },
        });
      } catch (err: any) {
        return errorResponse(err.message, 500);
      }
    }

    // ── Get agreement status ──
    if (url.pathname.startsWith('/sign/agreements/') && method === 'GET') {
      const agreementId = url.pathname.split('/').pop()!;
      try {
        const info = await client.getAgreementStatus(agreementId);

        // Update D1 record
        await env.DB.prepare(
          `UPDATE signing_records SET status = ?, updated_at = datetime('now') WHERE agreement_id = ?`
        ).bind(info.status, agreementId).run();

        return jsonResponse({
          success: true,
          data: {
            id: info.id,
            status: info.status,
            name: info.name,
            participants: info.participantSetsInfo?.map(p => ({
              name: p.memberInfos[0]?.name,
              email: p.memberInfos[0]?.email,
              status: p.memberInfos[0]?.status,
            })),
            createdDate: info.createdDate,
            displayDate: info.displayDate,
            expirationTime: info.expirationTime,
          },
        });
      } catch (err: any) {
        return errorResponse(err.message, 500);
      }
    }

    // ── Download signed document ──
    if (url.pathname.startsWith('/sign/download/') && method === 'GET') {
      const agreementId = url.pathname.split('/').pop()!;
      try {
        const pdf = await client.downloadSignedDocument(agreementId);
        return new Response(pdf, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${agreementId}-signed.pdf"`,
          },
        });
      } catch (err: any) {
        return errorResponse(err.message, 500);
      }
    }

    // ── Download audit trail ──
    if (url.pathname.startsWith('/sign/audit/') && method === 'GET') {
      const agreementId = url.pathname.split('/').pop()!;
      try {
        const pdf = await client.downloadAuditTrail(agreementId);
        return new Response(pdf, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${agreementId}-audit.pdf"`,
          },
        });
      } catch (err: any) {
        return errorResponse(err.message, 500);
      }
    }

    // ── PDF Embed viewer (renders signed doc inline) ──
    if (url.pathname.startsWith('/sign/view/') && method === 'GET') {
      const agreementId = url.pathname.split('/').pop()!;
      try {
        // Check if document is signed
        const record = await env.DB.prepare(
          `SELECT status, document_name FROM signing_records WHERE agreement_id = ?`
        ).bind(agreementId).first<SigningRecord>();

        if (!record) {
          return new Response('Document not found', { status: 404 });
        }

        if (record.status !== 'SIGNED') {
          return jsonResponse({
            success: false,
            error: `Document not yet signed (status: ${record.status})`,
          }, 400);
        }

        const viewerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${record.document_name || 'Signed Document'} — BrainSAIT Trust</title>
  <script src="https://documentcloud.adobe.com/view-sdk/main.js" async></script>
  <style>
    body { margin: 0; background: #02040a; font-family: Inter, sans-serif; }
    .header { padding: 12px 20px; background: #0a0f1a; border-bottom: 1px solid rgba(201,168,76,0.2); display: flex; align-items: center; justify-content: space-between; }
    .header .logo { color: #c9a84c; font-weight: 900; font-size: 16px; }
    .header .status { color: #10b981; font-size: 12px; font-weight: 600; }
    #pdf-container { width: 100%; height: calc(100vh - 50px); }
  </style>
</head>
<body>
  <div class="header">
    <span class="logo">BrainSAIT Trust ✦ VERIFIED</span>
    <span class="status">✓ Signed · Agreement ${agreementId.slice(0, 12)}…</span>
  </div>
  <div id="pdf-container"></div>
  <script>
    document.addEventListener("adobe_dc_view_sdk.ready", function() {
      var adobeDCView = new AdobeDC.View({
        clientId: "f3a2f455935a4822af9ee18b53917574",
        divId: "pdf-container"
      });
      adobeDCView.previewFile({
        content: { location: { url: "/sign/download/${agreementId}" } },
        metaData: { fileName: "${record.document_name || 'document.pdf'}" }
      }, {
        defaultViewMode: "FIT_WIDTH",
        showDownloadPDF: true,
        showPrintPDF: true,
        showAnnotationTools: false,
        enableSearchAPIs: true
      });
    });
  </script>
</body>
</html>`;

        return new Response(viewerHtml, {
          headers: { 'Content-Type': 'text/html' },
        });
      } catch (err: any) {
        return errorResponse(err.message, 500);
      }
    }

    // ── List signing records ──
    if (url.pathname === '/sign/records' && method === 'GET') {
      const cr = url.searchParams.get('cr');
      const status = url.searchParams.get('status');
      const limit = parseInt(url.searchParams.get('limit') || '20');

      let query = 'SELECT * FROM signing_records WHERE 1=1';
      const params: any[] = [];

      if (cr) { query += ' AND cr_number = ?'; params.push(cr); }
      if (status) { query += ' AND status = ?'; params.push(status); }
      query += ' ORDER BY created_at DESC LIMIT ?';
      params.push(limit);

      const results = await env.DB.prepare(query).bind(...params).all<SigningRecord>();

      return jsonResponse({ success: true, data: results.results });
    }

    // ── Cancel agreement ──
    if (url.pathname.startsWith('/sign/agreements/') && url.pathname.endsWith('/cancel') && method === 'POST') {
      const agreementId = url.pathname.split('/')[3];
      const body = await request.json() as { reason?: string };
      try {
        await client.cancelAgreement(agreementId, body.reason || 'Cancelled by BrainSAIT');

        await env.DB.prepare(
          `UPDATE signing_records SET status = 'CANCELLED', cancelled_at = datetime('now'), updated_at = datetime('now') WHERE agreement_id = ?`
        ).bind(agreementId).run();

        return jsonResponse({ success: true, message: 'Agreement cancelled' });
      } catch (err: any) {
        return errorResponse(err.message, 500);
      }
    }

    // ── Webhook handler ──
    if (url.pathname === '/sign/webhook' && method === 'POST') {
      const rawBody = await request.text();

      // Verify webhook signature if secret is configured
      if (env.ADOBE_WEBHOOK_SECRET) {
        const signature = request.headers.get('x-adobe-sign-clientid') || request.headers.get('webhook-notification-signature') || '';
        const valid = await verifyWebhookSignature(rawBody, signature, env.ADOBE_WEBHOOK_SECRET);
        if (!valid) {
          return errorResponse('Invalid webhook signature', 401);
        }
      }

      let event: AdobeWebhookEvent;
      try {
        event = JSON.parse(rawBody);
      } catch {
        return errorResponse('Invalid JSON', 400);
      }

      // Log the webhook event
      const eventId = generateId('whevt');
      await env.DB.prepare(
        `INSERT INTO webhook_events (id, webhook_id, agreement_id, event_type, event_date, payload, signature_valid)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        eventId,
        event.webhookId || null,
        event.eventResource?.id || null,
        event.event,
        event.eventDate,
        rawBody,
        env.ADOBE_WEBHOOK_SECRET ? 1 : 0
      ).run();

      // Map Adobe events to our statuses
      const statusMap: Record<string, string> = {
        'AGREEMENT_CREATED': 'OUT_FOR_SIGNATURE',
        'AGREEMENT_ACTION_DELEGATED_TO': 'DELEGATED',
        'AGREEMENT_RECALLED': 'CANCELLED',
        'AGREEMENT_REJECTED': 'REJECTED',
        'AGREEMENT_EXPIRED': 'EXPIRED',
        'AGREEMENT_ALL': 'UPDATED',
      };

      const newStatus = statusMap[event.event] || event.event;

      // Update D1 record
      if (event.eventResource?.id) {
        const updateFields: string[] = ['status = ?', "updated_at = datetime('now')"];
        const updateParams: any[] = [newStatus];

        if (event.event.includes('SIGNED') || newStatus === 'SIGNED') {
          updateFields.push("signed_at = datetime('now')");
        }

        await env.DB.prepare(
          `UPDATE signing_records SET ${updateFields.join(', ')} WHERE agreement_id = ?`
        ).bind(...updateParams, event.eventResource.id).run();
      }

      return jsonResponse({ success: true, received: true });
    }

    // ── OAuth callback (for interactive flows) ──
    if (url.pathname === '/sign/oauth/callback' && method === 'GET') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');

      if (!code) {
        return errorResponse('Missing authorization code', 400);
      }

      try {
        const tokenData = await client.exchangeCodeForToken(code, `${url.origin}/sign/oauth/callback`);
        return jsonResponse({
          success: true,
          message: 'Authorization successful',
          expiresIn: tokenData.expires_in,
          scopes: tokenData.scope,
        });
      } catch (err: any) {
        return errorResponse(err.message, 500);
      }
    }

    // 404
    return errorResponse('Not found', 404);
  },
};
