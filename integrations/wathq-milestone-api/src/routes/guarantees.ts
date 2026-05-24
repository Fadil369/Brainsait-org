import { Hono } from 'hono';
import { Env, RegisterGuaranteeRequest } from '../types';
import { issueGuarantee, amendGuarantee, cancelGuarantee, releaseGuarantee, scanExpiringGuarantees } from '../services/escrow';
import { ok, err } from '../utils/response';

export const guaranteesRouter = new Hono<{ Bindings: Env }>();

/**
 * POST /wathq/v1/guarantees
 * Issue a new bank guarantee (performance, advance payment, retention, bid bond).
 */
guaranteesRouter.post('/', async (c) => {
  let body: RegisterGuaranteeRequest;
  try {
    body = await c.req.json<RegisterGuaranteeRequest>();
  } catch {
    return err(c, 400, 'Invalid JSON body');
  }

  const { contractId, vendorId, guaranteeType, amountSar, bankName, bankRef, issuedAt, expiresAt } = body;
  if (!contractId || !vendorId || !guaranteeType || !amountSar || !bankName || !bankRef || !expiresAt) {
    return err(c, 400, 'Missing required fields');
  }

  const result = await issueGuarantee(
    c.env,
    { contractId, vendorId, guaranteeType, amountSar, bankName, bankRef, issuedAt: issuedAt ?? new Date().toISOString(), expiresAt },
    c.get('actorId') ?? 'system',
    c.get('actorIp'),
  );

  if (result.status === 'REJECTED') {
    return err(c, 422, result.message);
  }

  return ok(c, result, 201);
});

/**
 * GET /wathq/v1/guarantees/:id
 */
guaranteesRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const g = await c.env.DB.prepare(`SELECT * FROM bank_guarantees WHERE id = ?`).bind(id).first();
  if (!g) return err(c, 404, 'Guarantee not found');
  return ok(c, g);
});

/**
 * PATCH /wathq/v1/guarantees/:id/amend
 */
guaranteesRouter.patch('/:id/amend', async (c) => {
  const guaranteeId = c.req.param('id');
  let body: { newAmountSar?: number; newExpiresAt?: string; reason: string };
  try {
    body = await c.req.json();
  } catch {
    return err(c, 400, 'Invalid JSON body');
  }

  if (!body.reason) return err(c, 400, 'reason is required');

  const result = await amendGuarantee(
    c.env,
    { guaranteeId, ...body },
    c.get('actorId') ?? 'system',
    c.get('actorIp'),
  );

  if (result.status === 'NOT_FOUND') return err(c, 404, result.message);
  return ok(c, result);
});

/**
 * POST /wathq/v1/guarantees/:id/cancel
 * Must be within 16-working-hour SLA window (GTPL escrow rules).
 */
guaranteesRouter.post('/:id/cancel', async (c) => {
  const guaranteeId = c.req.param('id');
  let body: { reason: string };
  try {
    body = await c.req.json();
  } catch {
    return err(c, 400, 'Invalid JSON body');
  }

  if (!body.reason) return err(c, 400, 'reason is required');

  const result = await cancelGuarantee(
    c.env,
    guaranteeId,
    body.reason,
    c.get('actorId') ?? 'system',
    c.get('actorIp'),
  );

  if (result.status === 'NOT_FOUND') return err(c, 404, result.message);
  return ok(c, result);
});

/**
 * POST /wathq/v1/guarantees/:id/release
 * Releases guarantee upon contract completion sign-off.
 */
guaranteesRouter.post('/:id/release', async (c) => {
  const guaranteeId = c.req.param('id');

  const result = await releaseGuarantee(
    c.env,
    guaranteeId,
    c.get('actorId') ?? 'system',
    c.get('actorIp'),
  );

  if (result.status === 'NOT_FOUND') return err(c, 404, result.message);
  return ok(c, result);
});

/**
 * GET /wathq/v1/guarantees/expiring
 * Returns guarantees within renewal alert window.
 */
guaranteesRouter.get('/expiring/scan', async (c) => {
  const ids = await scanExpiringGuarantees(c.env);
  return ok(c, { expiringCount: ids.length, guaranteeIds: ids });
});

/**
 * GET /wathq/v1/guarantees
 * List guarantees with optional filters.
 */
guaranteesRouter.get('/', async (c) => {
  const { contractId, vendorId, status, limit = '50', offset = '0' } = c.req.query();

  let query = 'SELECT * FROM bank_guarantees WHERE 1=1';
  const binds: string[] = [];

  if (contractId) { query += ' AND contract_id = ?'; binds.push(contractId); }
  if (vendorId) { query += ' AND vendor_id = ?'; binds.push(vendorId); }
  if (status) { query += ' AND status = ?'; binds.push(status); }

  query += ` ORDER BY issued_at DESC LIMIT ? OFFSET ?`;
  binds.push(limit, offset);

  const result = await c.env.DB.prepare(query).bind(...binds).all();
  return ok(c, { guarantees: result.results, total: result.results?.length ?? 0 });
});
