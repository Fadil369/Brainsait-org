import { Hono } from 'hono';
import { Env } from '../types';
import { generateUUID } from '../utils/uuid';
import { writeAudit } from '../utils/audit';
import { ok, created, err } from '../utils/response';

export const invoicesRouter = new Hono<{ Bindings: Env }>();

/**
 * POST /wathq/v1/invoices/upload
 * Accepts multipart/form-data with invoice PDF/image, stores in R2,
 * calls CF Workers AI for OCR extraction, persists structured record.
 */
invoicesRouter.post('/upload', async (c) => {
  let formData: FormData;
  try {
    formData = await c.req.formData();
  } catch {
    return err(c, 400, 'Expected multipart/form-data with file field');
  }

  const file = formData.get('file') as File | null;
  const claimAmountStr = formData.get('claimAmount') as string | null;

  if (!file) return err(c, 400, 'Missing file field in form data');
  if (!claimAmountStr) return err(c, 400, 'Missing claimAmount field');

  const claimAmount = parseFloat(claimAmountStr);
  if (isNaN(claimAmount) || claimAmount <= 0) {
    return err(c, 400, 'claimAmount must be a positive number');
  }

  const maxBytes = 10 * 1024 * 1024; // 10 MB
  if (file.size > maxBytes) {
    return err(c, 413, 'File exceeds 10 MB limit');
  }

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return err(c, 415, `Unsupported file type: ${file.type}`);
  }

  const invoiceId = generateUUID();
  const r2Key = `invoices/${invoiceId}/${file.name}`;

  // Store raw file in R2
  const fileBuffer = await file.arrayBuffer();
  await c.env.WATHQ_R2.put(r2Key, fileBuffer, {
    httpMetadata: { contentType: file.type },
    customMetadata: { claimAmount: String(claimAmount), uploadedBy: c.get('actorId') ?? 'unknown' },
  });

  const fileUrl = `r2://${r2Key}`;

  // CF AI OCR — use @cf/meta/llama-3.1-8b-instruct or image-to-text model
  let extractedAmount = claimAmount; // fallback: trust submitted amount
  let extractedVat = 0;
  let ocrConfidence = 'fallback';

  try {
    const aiInput = {
      image: Array.from(new Uint8Array(fileBuffer)),
      prompt: 'Extract the total invoice amount and VAT amount from this document. Return JSON: {"total": number, "vat": number}',
      max_tokens: 200,
    };

    // @ts-ignore — CF AI binding available at runtime
    const aiResult = await c.env.AI.run('@cf/llava-hf/llava-1.5-7b-hf', aiInput).catch(() => null);

    if (aiResult?.response) {
      const match = aiResult.response.match(/\{[\s\S]*?\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (typeof parsed.total === 'number' && parsed.total > 0) {
          extractedAmount = parsed.total;
          extractedVat = parsed.vat ?? 0;
          ocrConfidence = 'ai-extracted';
        }
      }
    }
  } catch {
    // OCR failure is non-fatal — fallback values already set
  }

  // Persist invoice record
  await c.env.DB.prepare(`
    INSERT INTO invoices (id, file_url, file_name, file_size_bytes, mime_type, extracted_amount, extracted_vat, ocr_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    invoiceId, fileUrl, file.name, file.size, file.type,
    extractedAmount, extractedVat, ocrConfidence,
  ).run();

  const actorId = c.get('actorId') ?? 'system';
  await writeAudit(c.env, {
    entityType: 'invoice',
    entityId: invoiceId,
    action: 'invoice_uploaded',
    actorId,
    actorIp: c.get('actorIp'),
    afterState: { fileUrl, extractedAmount, extractedVat, ocrConfidence },
    meta: { fileName: file.name, fileSizeBytes: file.size },
  });

  return created(c, {
    invoiceId,
    fileUrl,
    extraction: {
      extractedAmount,
      extractedVat,
      confidence: ocrConfidence,
      claimAmountSubmitted: claimAmount,
    },
  });
});

/**
 * GET /wathq/v1/invoices/:id
 */
invoicesRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const invoice = await c.env.DB.prepare(`SELECT * FROM invoices WHERE id = ?`).bind(id).first();
  if (!invoice) return err(c, 404, 'Invoice not found');
  return ok(c, invoice);
});

/**
 * PATCH /wathq/v1/invoices/:id/correct
 * Allows manual correction of extracted amounts if OCR failed.
 */
invoicesRouter.patch('/:id/correct', async (c) => {
  const id = c.req.param('id');
  let body: { extractedAmount?: number; extractedVat?: number; reason: string };
  try {
    body = await c.req.json();
  } catch {
    return err(c, 400, 'Invalid JSON');
  }

  const invoice = await c.env.DB.prepare(`SELECT * FROM invoices WHERE id = ?`).bind(id).first<{
    id: string; extracted_amount: number; extracted_vat: number;
  }>();
  if (!invoice) return err(c, 404, 'Invoice not found');

  const updates: string[] = ['updated_at = datetime(\'now\')', 'ocr_status = \'manual-corrected\''];
  const binds: (string | number)[] = [];

  if (body.extractedAmount !== undefined) { updates.push('extracted_amount = ?'); binds.push(body.extractedAmount); }
  if (body.extractedVat !== undefined) { updates.push('extracted_vat = ?'); binds.push(body.extractedVat); }
  binds.push(id);

  await c.env.DB.prepare(`UPDATE invoices SET ${updates.join(', ')} WHERE id = ?`).bind(...binds).run();

  await writeAudit(c.env, {
    entityType: 'invoice',
    entityId: id,
    action: 'invoice_manually_corrected',
    actorId: c.get('actorId') ?? 'system',
    actorIp: c.get('actorIp'),
    beforeState: { extractedAmount: invoice.extracted_amount, extractedVat: invoice.extracted_vat },
    afterState: { extractedAmount: body.extractedAmount, extractedVat: body.extractedVat },
    meta: { reason: body.reason },
  });

  return ok(c, { invoiceId: id, updated: true });
});
