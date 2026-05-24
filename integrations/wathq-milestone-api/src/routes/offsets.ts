import { Hono } from 'hono';
import { Env, PaymentClaim, ExecuteOffsetRequest } from '../types';
import { executeDebtOffset } from '../services/debt-offset';
import { writeAudit } from '../utils/audit';
import { ok, err } from '../utils/response';

export const offsetsRouter = new Hono<{ Bindings: Env }>();

/**
 * POST /wathq/v1/offsets/execute
 * FR-03: Real-Time Debt-to-Payment Offset Engine.
 * Executes two-phase commit offset for a PAYMENT_ORDER claim.
 */
offsetsRouter.post('/execute', async (c) => {
  let body: ExecuteOffsetRequest;
  try {
    body = await c.req.json<ExecuteOffsetRequest>();
  } catch {
    return err(c, 400, 'Invalid JSON body');
  }

  const { claimId } = body;
  if (!claimId) return err(c, 400, 'claimId is required');

  const claim = await c.env.DB.prepare(
    `SELECT * FROM payment_claims WHERE id = ?`,
  ).bind(claimId).first<PaymentClaim>();

  if (!claim) return err(c, 404, 'Claim not found');

  if (claim.status !== 'PAYMENT_ORDER') {
    return err(c, 422,
      `Offset requires claim in PAYMENT_ORDER state (current: ${claim.status}). ` +
      `Advance claim first via POST /claims/:id/advance-to-payment-order`);
  }

  const actorId = c.get('actorId') ?? 'system';
  const actorIp = c.get('actorIp');

  const result = await executeDebtOffset(c.env, claim, actorId, actorIp);

  return ok(c, {
    claimId,
    offset: result,
    summary: result.executed
      ? `Deducted ${result.debtDeductedSar} SAR from debt. Net payment: ${result.netPaymentSar} SAR`
      : `No offset applied — ${result.reason}`,
  });
});

/**
 * GET /wathq/v1/offsets/:id
 * Fetch a specific offset record.
 */
offsetsRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const offset = await c.env.DB.prepare(`SELECT * FROM debt_offsets WHERE id = ?`).bind(id).first();
  if (!offset) return err(c, 404, 'Offset not found');
  return ok(c, offset);
});

/**
 * GET /wathq/v1/offsets
 * List offset records by vendor or claim.
 */
offsetsRouter.get('/', async (c) => {
  const { vendorId, claimId, status, limit = '50', offset: off = '0' } = c.req.query();

  let query = 'SELECT * FROM debt_offsets WHERE 1=1';
  const binds: string[] = [];

  if (vendorId) { query += ' AND vendor_id = ?'; binds.push(vendorId); }
  if (claimId) { query += ' AND claim_id = ?'; binds.push(claimId); }
  if (status) { query += ' AND offset_status = ?'; binds.push(status); }

  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  binds.push(limit, off);

  const result = await c.env.DB.prepare(query).bind(...binds).all();
  return ok(c, { offsets: result.results, total: result.results?.length ?? 0 });
});
