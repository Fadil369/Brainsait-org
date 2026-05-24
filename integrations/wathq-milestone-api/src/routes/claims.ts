import { Hono } from 'hono';
import { Env, PaymentClaim, SubmitClaimRequest } from '../types';
import { executeDebtOffset } from '../services/debt-offset';
import { checkInvoiceArithmetic, checkVatCompliance } from '../services/arithmetic';
import { generateUUID } from '../utils/uuid';
import { writeAudit } from '../utils/audit';
import { ok, created, err } from '../utils/response';

export const claimsRouter = new Hono<{ Bindings: Env }>();

/**
 * POST /wathq/v1/claims/submit
 * Validates arithmetic + VAT, checks milestone status, creates claim record.
 * Business rule: milestone must be VERIFIED before claim submission (GTPL).
 */
claimsRouter.post('/submit', async (c) => {
  let body: SubmitClaimRequest;
  try {
    body = await c.req.json<SubmitClaimRequest>();
  } catch {
    return err(c, 400, 'Invalid JSON body');
  }

  const { userId, milestoneId, amount, invoiceId } = body;
  if (!userId || !milestoneId || !amount || !invoiceId) {
    return err(c, 400, 'Missing required fields: userId, milestoneId, amount, invoiceId');
  }
  if (amount <= 0) {
    return err(c, 400, 'Amount must be positive');
  }

  // Fetch milestone and invoice in parallel
  const [milestone, invoice] = await Promise.all([
    c.env.DB.prepare(`SELECT * FROM milestones WHERE id = ?`).bind(milestoneId).first(),
    c.env.DB.prepare(`SELECT * FROM invoices WHERE id = ?`).bind(invoiceId).first<{
      id: string; extracted_amount: number; extracted_vat: number; file_url: string;
    }>(),
  ]);

  if (!milestone) return err(c, 404, 'Milestone not found');
  if (!invoice) return err(c, 404, 'Invoice not found');

  const actorId = c.get('actorId') ?? userId;
  const actorIp = c.get('actorIp');

  // Guard: only VERIFIED milestones can receive claims
  if ((milestone as any).status !== 'VERIFIED') {
    await writeAudit(c.env, {
      entityType: 'payment_claim',
      entityId: milestoneId,
      action: 'claim_blocked_unverified_milestone',
      actorId,
      actorIp,
      meta: { milestoneStatus: (milestone as any).status },
    });
    return err(c, 422, `Milestone is ${(milestone as any).status} — must be VERIFIED before claim submission`);
  }

  // Duplicate claim guard
  const existing = await c.env.DB.prepare(
    `SELECT id, status FROM payment_claims WHERE milestone_id = ? AND status NOT IN ('REJECTED')`,
  ).bind(milestoneId).first<{ id: string; status: string }>();

  if (existing) {
    return err(c, 409, `Active claim ${existing.id} already exists for this milestone (status: ${existing.status})`);
  }

  // Arithmetic and VAT validation
  const arithmetic = checkInvoiceArithmetic(invoice.extracted_amount, amount);
  const vat = checkVatCompliance(amount, invoice.extracted_vat);
  const claimId = generateUUID();

  if (!arithmetic.passed) {
    await c.env.DB.prepare(`
      INSERT INTO payment_claims
        (id, milestone_id, vendor_id, claimed_amount, invoice_id, status, arithmetic_ok, vat_checked, rejection_reason)
      VALUES (?, ?, ?, ?, ?, 'REJECTED', 0, ?, ?)
    `).bind(
      claimId, milestoneId, (milestone as any).vendor_id ?? '',
      amount, invoiceId, vat.passed ? 1 : 0,
      `Arithmetic error ${(arithmetic.errorPct * 100).toFixed(2)}% exceeds 10% threshold`,
    ).run();

    await writeAudit(c.env, {
      entityType: 'payment_claim',
      entityId: claimId,
      action: 'claim_rejected_arithmetic',
      actorId,
      actorIp,
      afterState: { status: 'REJECTED', arithmeticErrorPct: arithmetic.errorPct },
    });

    return err(c, 422, `Invoice arithmetic error: ${(arithmetic.errorPct * 100).toFixed(2)}% deviation exceeds 10% (GTPL)`);
  }

  // Create validated claim
  await c.env.DB.prepare(`
    INSERT INTO payment_claims
      (id, milestone_id, vendor_id, claimed_amount, invoice_id, status, arithmetic_ok, vat_checked)
    VALUES (?, ?, ?, ?, ?, 'VALIDATED', 1, ?)
  `).bind(
    claimId, milestoneId, (milestone as any).vendor_id ?? '',
    amount, invoiceId, vat.passed ? 1 : 0,
  ).run();

  await writeAudit(c.env, {
    entityType: 'payment_claim',
    entityId: claimId,
    action: 'claim_validated',
    actorId,
    actorIp,
    afterState: { status: 'VALIDATED', amount, arithmeticOk: true, vatPassed: vat.passed },
    meta: { vatNote: vat.passed ? null : `VAT discrepancy: expected ${vat.expectedVat} got ${vat.providedVat}` },
  });

  return created(c, {
    claimId,
    status: 'VALIDATED',
    validation: {
      milestoneStatus: 'VERIFIED',
      arithmeticOk: true,
      vatChecked: vat.passed,
      vatNote: vat.passed ? undefined : `VAT deviation: provided ${vat.providedVat}, expected ~${vat.expectedVat}`,
    },
  });
});

/**
 * GET /wathq/v1/claims/:id/status
 */
claimsRouter.get('/:id/status', async (c) => {
  const id = c.req.param('id');
  const claim = await c.env.DB.prepare(`
    SELECT pc.*, m.name as milestone_name, m.status as milestone_status
    FROM payment_claims pc
    LEFT JOIN milestones m ON m.id = pc.milestone_id
    WHERE pc.id = ?
  `).bind(id).first();

  if (!claim) return err(c, 404, 'Claim not found');
  return ok(c, claim);
});

/**
 * POST /wathq/v1/claims/:id/advance-to-payment-order
 * Transitions VALIDATED → PAYMENT_ORDER and triggers debt offset check.
 */
claimsRouter.post('/:id/advance-to-payment-order', async (c) => {
  const id = c.req.param('id');
  const actorId = c.get('actorId') ?? 'system';
  const actorIp = c.get('actorIp');

  const claim = await c.env.DB.prepare(
    `SELECT * FROM payment_claims WHERE id = ?`,
  ).bind(id).first<PaymentClaim>();

  if (!claim) return err(c, 404, 'Claim not found');
  if (claim.status !== 'VALIDATED') {
    return err(c, 422, `Claim must be VALIDATED to advance to PAYMENT_ORDER (current: ${claim.status})`);
  }

  await c.env.DB.prepare(`
    UPDATE payment_claims SET status = 'PAYMENT_ORDER', updated_at = datetime('now') WHERE id = ?
  `).bind(id).run();

  // Trigger debt offset engine
  const updatedClaim: PaymentClaim = { ...claim, status: 'PAYMENT_ORDER' };
  const offsetResult = await executeDebtOffset(c.env, updatedClaim, actorId, actorIp);

  return ok(c, {
    claimId: id,
    newStatus: offsetResult.executed ? 'OFFSET_PENDING' : 'PAYMENT_ORDER',
    offset: offsetResult,
  });
});

/**
 * GET /wathq/v1/claims
 * List claims with optional filters: milestoneId, status, vendorId.
 */
claimsRouter.get('/', async (c) => {
  const { milestoneId, status, vendorId, limit = '50', offset = '0' } = c.req.query();

  let query = 'SELECT * FROM payment_claims WHERE 1=1';
  const binds: string[] = [];

  if (milestoneId) { query += ' AND milestone_id = ?'; binds.push(milestoneId); }
  if (status) { query += ' AND status = ?'; binds.push(status); }
  if (vendorId) { query += ' AND vendor_id = ?'; binds.push(vendorId); }

  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  binds.push(limit, offset);

  const result = await c.env.DB.prepare(query).bind(...binds).all();
  return ok(c, { claims: result.results, total: result.results?.length ?? 0 });
});
