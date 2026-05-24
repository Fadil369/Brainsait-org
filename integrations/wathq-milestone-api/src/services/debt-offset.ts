import { Env, DebtRecord, PaymentClaim } from '../types';
import { DEBT_OFFSET_BLOCKED_STATES, KV_PREFIX } from '../constants';
import { generateUUID } from '../utils/uuid';
import { writeAudit } from '../utils/audit';

export interface OffsetResult {
  executed: boolean;
  originalClaimSar: number;
  debtDeductedSar: number;
  netPaymentSar: number;
  debtId?: string;
  offsetId?: string;
  reason?: string;
}

/**
 * AFESWE: Real-Time Debt-to-Payment Offset Engine (FR-03).
 *
 * When a payment_claim reaches PAYMENT_ORDER state:
 *   1. Query debt_registry for vendor's active LIST debts
 *   2. Check exemption/installment blocks (GTPL Art.60, Etimad rules)
 *   3. If eligible: execute two-phase offset atomically
 *      - Phase 1: mark debt_offset as PENDING + lock via KV
 *      - Phase 2: update debt status to PAID_OFF + update claim to OFFSET_PENDING
 *   4. Net payment = claim amount - debt balance
 */
export async function executeDebtOffset(
  env: Env,
  claim: PaymentClaim,
  actorId: string,
  actorIp?: string,
): Promise<OffsetResult> {
  // 1. Find vendor's highest-priority active debt
  const debt = await env.DB.prepare(`
    SELECT * FROM debt_registry
    WHERE vendor_id = ? AND status = 'LIST'
      AND exemption_requested = 0 AND exemption_approved = 0
    ORDER BY amount_sar DESC
    LIMIT 1
  `).bind(claim.vendor_id).first<DebtRecord>();

  if (!debt) {
    return {
      executed: false,
      originalClaimSar: claim.claimed_amount,
      debtDeductedSar: 0,
      netPaymentSar: claim.claimed_amount,
      reason: 'No eligible active debts found',
    };
  }

  // 2. Block check: exemption / installment / cancelled
  if (DEBT_OFFSET_BLOCKED_STATES.has(debt.status)) {
    return {
      executed: false,
      originalClaimSar: claim.claimed_amount,
      debtDeductedSar: 0,
      netPaymentSar: claim.claimed_amount,
      reason: `Debt ${debt.id} in non-offsettable state: ${debt.status}`,
    };
  }

  // 3. Two-phase commit — idempotency via KV lock
  const twoPhaseKey = `${KV_PREFIX.TWO_PHASE}${claim.id}:${debt.id}`;
  const existing = await env.WATHQ_KV.get(twoPhaseKey);
  if (existing) {
    return JSON.parse(existing) as OffsetResult; // idempotent return
  }

  const deductAmount = Math.min(debt.balance_sar, claim.claimed_amount);
  const netPayment = claim.claimed_amount - deductAmount;
  const offsetId = generateUUID();

  try {
    // Phase 1: Create offset record + lock
    await env.DB.prepare(`
      INSERT INTO debt_offsets
        (id, claim_id, debt_id, vendor_id, original_claim_sar, debt_deducted_sar, net_payment_sar, offset_status, two_phase_token)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
    `).bind(offsetId, claim.id, debt.id, claim.vendor_id,
            claim.claimed_amount, deductAmount, netPayment, twoPhaseKey).run();

    // Phase 2a: Update debt status
    const newDebtStatus = deductAmount >= debt.balance_sar ? 'PAID_OFF' : 'LIST';
    const newBalance = Math.max(0, debt.balance_sar - deductAmount);
    await env.DB.prepare(`
      UPDATE debt_registry SET status = ?, balance_sar = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(newDebtStatus, newBalance, debt.id).run();

    // Phase 2b: Update offset to EXECUTED + claim to OFFSET_PENDING
    await env.DB.prepare(`
      UPDATE debt_offsets SET offset_status = 'EXECUTED', executed_at = datetime('now') WHERE id = ?
    `).bind(offsetId).run();

    await env.DB.prepare(`
      UPDATE payment_claims SET status = 'OFFSET_PENDING', updated_at = datetime('now') WHERE id = ?
    `).bind(claim.id).run();

    const result: OffsetResult = {
      executed: true,
      originalClaimSar: claim.claimed_amount,
      debtDeductedSar: deductAmount,
      netPaymentSar: netPayment,
      debtId: debt.id,
      offsetId,
    };

    // Store result for idempotency (24h TTL)
    await env.WATHQ_KV.put(twoPhaseKey, JSON.stringify(result), { expirationTtl: 86400 });

    await writeAudit(env, {
      entityType: 'debt_offset',
      entityId: offsetId,
      action: 'offset_executed',
      actorId,
      actorIp,
      beforeState: { debtStatus: 'LIST', balance: debt.balance_sar, claimStatus: claim.status },
      afterState:  { debtStatus: newDebtStatus, balance: newBalance, claimStatus: 'OFFSET_PENDING' },
      meta: { deductAmount, netPayment },
    });

    return result;
  } catch (e) {
    // Mark offset as FAILED — do NOT release the payment
    await env.DB.prepare(`
      UPDATE debt_offsets SET offset_status = 'FAILED', failed_reason = ? WHERE id = ?
    `).bind(String(e), offsetId).run();

    throw new Error(`Offset 2PC failed — payment blocked: ${e}`);
  }
}
