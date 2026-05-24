import { Env, BankGuarantee } from '../types';
import { GUARANTEE_CANCEL_SLA_HOURS, GUARANTEE_RENEWAL_ALERT_DAYS, GUARANTEE_MIN_VALIDITY_DAYS } from '../constants';
import { generateUUID } from '../utils/uuid';
import { writeAudit } from '../utils/audit';

export interface GuaranteeIssueInput {
  contractId: string;
  vendorId: string;
  guaranteeType: 'PERFORMANCE' | 'ADVANCE_PAYMENT' | 'RETENTION' | 'BID_BOND';
  amountSar: number;
  bankName: string;
  bankRef: string;
  issuedAt: string;
  expiresAt: string;
}

export interface GuaranteeAmendInput {
  guaranteeId: string;
  newAmountSar?: number;
  newExpiresAt?: string;
  reason: string;
}

export interface GuaranteeResult {
  id: string;
  status: string;
  cancellationDeadline?: string;
  renewalAlert?: boolean;
  message: string;
}

/**
 * Issues a new bank guarantee and schedules auto-cancel SLA check.
 * GTPL Art.55: guarantee must be valid ≥ 30 days beyond contract completion.
 */
export async function issueGuarantee(
  env: Env,
  input: GuaranteeIssueInput,
  actorId: string,
  actorIp?: string,
): Promise<GuaranteeResult> {
  const id = generateUUID();
  const issuedAt = input.issuedAt || new Date().toISOString();
  const expiresDate = new Date(input.expiresAt);
  const now = new Date();
  const validityDays = Math.floor((expiresDate.getTime() - now.getTime()) / 86400000);

  if (validityDays < GUARANTEE_MIN_VALIDITY_DAYS) {
    return {
      id: '',
      status: 'REJECTED',
      message: `Guarantee validity ${validityDays} days is below minimum ${GUARANTEE_MIN_VALIDITY_DAYS} days (GTPL Art.55)`,
    };
  }

  // SLA: auto-cancel deadline = issuedAt + 16 working hours
  const cancellationDeadline = computeWorkingHoursDeadline(new Date(issuedAt), GUARANTEE_CANCEL_SLA_HOURS);

  await env.DB.prepare(`
    INSERT INTO bank_guarantees
      (id, contract_id, vendor_id, guarantee_type, amount_sar, bank_name, bank_ref,
       issued_at, expires_at, status, auto_cancel_deadline)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
  `).bind(
    id, input.contractId, input.vendorId, input.guaranteeType,
    input.amountSar, input.bankName, input.bankRef,
    issuedAt, input.expiresAt, cancellationDeadline.toISOString(),
  ).run();

  const renewalAlert = validityDays <= GUARANTEE_RENEWAL_ALERT_DAYS + GUARANTEE_MIN_VALIDITY_DAYS;

  await writeAudit(env, {
    entityType: 'bank_guarantee',
    entityId: id,
    action: 'guarantee_issued',
    actorId,
    actorIp,
    afterState: { status: 'ACTIVE', amountSar: input.amountSar, expiresAt: input.expiresAt },
    meta: { validityDays, cancellationDeadline: cancellationDeadline.toISOString() },
  });

  return {
    id,
    status: 'ACTIVE',
    cancellationDeadline: cancellationDeadline.toISOString(),
    renewalAlert,
    message: `Guarantee issued. Auto-cancel SLA: ${cancellationDeadline.toISOString()}`,
  };
}

/**
 * Amends an existing bank guarantee (amount or expiry extension).
 * Only ACTIVE guarantees can be amended.
 */
export async function amendGuarantee(
  env: Env,
  input: GuaranteeAmendInput,
  actorId: string,
  actorIp?: string,
): Promise<GuaranteeResult> {
  const guarantee = await env.DB.prepare(
    `SELECT * FROM bank_guarantees WHERE id = ?`,
  ).bind(input.guaranteeId).first<BankGuarantee>();

  if (!guarantee) {
    return { id: input.guaranteeId, status: 'NOT_FOUND', message: 'Guarantee not found' };
  }
  if (guarantee.status !== 'ACTIVE') {
    return {
      id: input.guaranteeId,
      status: guarantee.status,
      message: `Cannot amend guarantee in state ${guarantee.status}`,
    };
  }

  const beforeState = { amountSar: guarantee.amount_sar, expiresAt: guarantee.expires_at };

  const updates: string[] = ['updated_at = datetime(\'now\')'];
  const binds: (string | number)[] = [];

  if (input.newAmountSar !== undefined) {
    updates.push('amount_sar = ?');
    binds.push(input.newAmountSar);
  }
  if (input.newExpiresAt) {
    updates.push('expires_at = ?');
    binds.push(input.newExpiresAt);
  }
  binds.push(input.guaranteeId);

  await env.DB.prepare(`UPDATE bank_guarantees SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...binds).run();

  await writeAudit(env, {
    entityType: 'bank_guarantee',
    entityId: input.guaranteeId,
    action: 'guarantee_amended',
    actorId,
    actorIp,
    beforeState,
    afterState: {
      amountSar: input.newAmountSar ?? guarantee.amount_sar,
      expiresAt: input.newExpiresAt ?? guarantee.expires_at,
    },
    meta: { reason: input.reason },
  });

  return {
    id: input.guaranteeId,
    status: 'ACTIVE',
    message: 'Guarantee amended successfully',
  };
}

/**
 * Cancels a guarantee within the 16-working-hour SLA window.
 * After the SLA deadline, cancellation is rejected.
 */
export async function cancelGuarantee(
  env: Env,
  guaranteeId: string,
  reason: string,
  actorId: string,
  actorIp?: string,
): Promise<GuaranteeResult> {
  const guarantee = await env.DB.prepare(
    `SELECT * FROM bank_guarantees WHERE id = ?`,
  ).bind(guaranteeId).first<BankGuarantee>();

  if (!guarantee) {
    return { id: guaranteeId, status: 'NOT_FOUND', message: 'Guarantee not found' };
  }
  if (guarantee.status !== 'ACTIVE') {
    return { id: guaranteeId, status: guarantee.status, message: `Guarantee already ${guarantee.status}` };
  }

  const now = new Date();
  const slaDeadline = guarantee.auto_cancel_deadline ? new Date(guarantee.auto_cancel_deadline) : null;

  if (slaDeadline && now > slaDeadline) {
    return {
      id: guaranteeId,
      status: 'ACTIVE',
      message: `SLA window expired at ${slaDeadline.toISOString()}. Manual bank process required.`,
    };
  }

  await env.DB.prepare(`
    UPDATE bank_guarantees
    SET status = 'CANCELLED', cancelled_at = datetime('now'), cancellation_reason = ?, updated_at = datetime('now')
    WHERE id = ?
  `).bind(reason, guaranteeId).run();

  await writeAudit(env, {
    entityType: 'bank_guarantee',
    entityId: guaranteeId,
    action: 'guarantee_cancelled',
    actorId,
    actorIp,
    beforeState: { status: 'ACTIVE' },
    afterState: { status: 'CANCELLED' },
    meta: { reason, withinSla: true },
  });

  return { id: guaranteeId, status: 'CANCELLED', message: 'Guarantee cancelled within SLA window' };
}

/**
 * Releases a guarantee upon contract completion sign-off.
 */
export async function releaseGuarantee(
  env: Env,
  guaranteeId: string,
  actorId: string,
  actorIp?: string,
): Promise<GuaranteeResult> {
  const guarantee = await env.DB.prepare(
    `SELECT * FROM bank_guarantees WHERE id = ?`,
  ).bind(guaranteeId).first<BankGuarantee>();

  if (!guarantee) {
    return { id: guaranteeId, status: 'NOT_FOUND', message: 'Guarantee not found' };
  }
  if (guarantee.status !== 'ACTIVE') {
    return { id: guaranteeId, status: guarantee.status, message: `Cannot release guarantee in state ${guarantee.status}` };
  }

  await env.DB.prepare(`
    UPDATE bank_guarantees
    SET status = 'RELEASED', released_at = datetime('now'), updated_at = datetime('now')
    WHERE id = ?
  `).bind(guaranteeId).run();

  await writeAudit(env, {
    entityType: 'bank_guarantee',
    entityId: guaranteeId,
    action: 'guarantee_released',
    actorId,
    actorIp,
    beforeState: { status: 'ACTIVE' },
    afterState: { status: 'RELEASED' },
  });

  return { id: guaranteeId, status: 'RELEASED', message: 'Guarantee released upon contract completion' };
}

/**
 * Checks guarantees approaching expiry (within GUARANTEE_RENEWAL_ALERT_DAYS).
 * Returns list of IDs that need renewal action.
 */
export async function scanExpiringGuarantees(env: Env): Promise<string[]> {
  const alertThreshold = new Date();
  alertThreshold.setDate(alertThreshold.getDate() + GUARANTEE_RENEWAL_ALERT_DAYS);

  const result = await env.DB.prepare(`
    SELECT id FROM bank_guarantees
    WHERE status = 'ACTIVE'
      AND expires_at <= ?
      AND expires_at > datetime('now')
  `).bind(alertThreshold.toISOString()).all<{ id: string }>();

  return (result.results ?? []).map(r => r.id);
}

/**
 * Computes working-hours deadline (Sun–Thu, 08:00–16:00 KSA = UTC+3).
 * Skips Friday/Saturday as Saudi weekend.
 */
function computeWorkingHoursDeadline(from: Date, workingHours: number): Date {
  const result = new Date(from);
  let remaining = workingHours * 60; // minutes

  while (remaining > 0) {
    result.setMinutes(result.getMinutes() + 1);
    const ksa = new Date(result.getTime() + 3 * 3600000);
    const dayOfWeek = ksa.getUTCDay(); // 0=Sun,5=Fri,6=Sat
    const hourKsa = ksa.getUTCHours();

    const isWorkingDay = dayOfWeek !== 5 && dayOfWeek !== 6;
    const isWorkingHour = hourKsa >= 8 && hourKsa < 16;

    if (isWorkingDay && isWorkingHour) {
      remaining--;
    }
  }

  return result;
}
