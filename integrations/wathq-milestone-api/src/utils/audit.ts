import { Env } from '../types';
import { generateUUID } from './uuid';

export interface AuditEvent {
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  actorIp?: string;
  xMofRqUid?: string;
  beforeState?: unknown;
  afterState?: unknown;
  meta?: unknown;
}

/**
 * Write an immutable audit event to D1.
 * Per Etimad compliance: every action traceable to actor + machine instance.
 */
export async function writeAudit(env: Env, event: AuditEvent): Promise<void> {
  await env.DB.prepare(`
    INSERT INTO audit_log
      (id, entity_type, entity_id, action, actor_id, actor_ip,
       x_mof_rq_uid, before_state, after_state, meta)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    generateUUID(),
    event.entityType,
    event.entityId,
    event.action,
    event.actorId,
    event.actorIp ?? null,
    event.xMofRqUid ?? null,
    event.beforeState ? JSON.stringify(event.beforeState) : null,
    event.afterState  ? JSON.stringify(event.afterState)  : null,
    event.meta        ? JSON.stringify(event.meta)        : null,
  ).run();
}
