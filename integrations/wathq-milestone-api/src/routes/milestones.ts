import { Hono } from 'hono';
import { Env } from '../types';
import { writeAudit } from '../utils/audit';
import { ok, err } from '../utils/response';

export const milestonesRouter = new Hono<{ Bindings: Env }>();

const VALID_TRANSITIONS: Record<string, string[]> = {
  PLANNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: ['VERIFY_PENDING'],
  VERIFY_PENDING: ['VERIFIED', 'IN_PROGRESS'],
  VERIFIED: [],
};

/**
 * GET /wathq/v1/milestones/:id
 */
milestonesRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const milestone = await c.env.DB.prepare(`
    SELECT m.*, c.title as contract_title, c.signatory_id
    FROM milestones m
    LEFT JOIN contracts c ON c.id = m.contract_id
    WHERE m.id = ?
  `).bind(id).first();

  if (!milestone) return err(c, 404, 'Milestone not found');
  return ok(c, milestone);
});

/**
 * PATCH /wathq/v1/milestones/:id/status
 * Transitions milestone through GTPL-defined state machine.
 */
milestonesRouter.patch('/:id/status', async (c) => {
  const id = c.req.param('id');
  let body: { status: string; completedDate?: string; notes?: string };
  try {
    body = await c.req.json();
  } catch {
    return err(c, 400, 'Invalid JSON body');
  }

  const { status: newStatus, completedDate, notes } = body;
  if (!newStatus) return err(c, 400, 'status is required');

  const milestone = await c.env.DB.prepare(
    `SELECT * FROM milestones WHERE id = ?`,
  ).bind(id).first<{ id: string; status: string; contract_id: string }>();

  if (!milestone) return err(c, 404, 'Milestone not found');

  const allowed = VALID_TRANSITIONS[milestone.status] ?? [];
  if (!allowed.includes(newStatus)) {
    return err(c, 422,
      `Invalid transition ${milestone.status} → ${newStatus}. Allowed: ${allowed.join(', ') || 'none (terminal state)'}`);
  }

  const updates: string[] = ['status = ?', 'updated_at = datetime(\'now\')'];
  const binds: (string | null)[] = [newStatus];

  if (newStatus === 'COMPLETED' && completedDate) {
    updates.push('completed_date = ?');
    binds.push(completedDate);
  }

  binds.push(id);

  await c.env.DB.prepare(
    `UPDATE milestones SET ${updates.join(', ')} WHERE id = ?`,
  ).bind(...binds).run();

  const actorId = c.get('actorId') ?? 'system';
  const actorIp = c.get('actorIp');

  await writeAudit(c.env, {
    entityType: 'milestone',
    entityId: id,
    action: `milestone_status_${newStatus.toLowerCase()}`,
    actorId,
    actorIp,
    beforeState: { status: milestone.status },
    afterState: { status: newStatus },
    meta: { notes },
  });

  return ok(c, { milestoneId: id, previousStatus: milestone.status, newStatus });
});

/**
 * GET /wathq/v1/milestones
 * List milestones by contract or status.
 */
milestonesRouter.get('/', async (c) => {
  const { contractId, status, limit = '50', offset = '0' } = c.req.query();

  let query = 'SELECT * FROM milestones WHERE 1=1';
  const binds: string[] = [];

  if (contractId) { query += ' AND contract_id = ?'; binds.push(contractId); }
  if (status) { query += ' AND status = ?'; binds.push(status); }

  query += ` ORDER BY "order" ASC LIMIT ? OFFSET ?`;
  binds.push(limit, offset);

  const result = await c.env.DB.prepare(query).bind(...binds).all();
  return ok(c, { milestones: result.results, total: result.results?.length ?? 0 });
});

/**
 * POST /wathq/v1/milestones
 * Create a new milestone under a contract.
 */
milestonesRouter.post('/', async (c) => {
  let body: {
    contractId: string; name: string; order: number;
    plannedDate: string; vendorId?: string;
  };
  try {
    body = await c.req.json();
  } catch {
    return err(c, 400, 'Invalid JSON body');
  }

  const { contractId, name, order, plannedDate } = body;
  if (!contractId || !name || !order || !plannedDate) {
    return err(c, 400, 'Missing required fields: contractId, name, order, plannedDate');
  }

  const contract = await c.env.DB.prepare(`SELECT id FROM contracts WHERE id = ?`).bind(contractId).first();
  if (!contract) return err(c, 404, 'Contract not found');

  const id = crypto.randomUUID();
  await c.env.DB.prepare(`
    INSERT INTO milestones (id, contract_id, name, "order", planned_date, status)
    VALUES (?, ?, ?, ?, ?, 'PLANNED')
  `).bind(id, contractId, name, order, plannedDate).run();

  await writeAudit(c.env, {
    entityType: 'milestone',
    entityId: id,
    action: 'milestone_created',
    actorId: c.get('actorId') ?? 'system',
    actorIp: c.get('actorIp'),
    afterState: { contractId, name, order, status: 'PLANNED' },
  });

  return ok(c, { milestoneId: id, status: 'PLANNED' }, 201);
});
