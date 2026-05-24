import { Hono } from 'hono';
import { Env, ValidateBidRequest } from '../types';
import { checkBidArithmetic, checkUnderbid, recalculateLineItemTotal } from '../services/arithmetic';
import { generateUUID } from '../utils/uuid';
import { writeAudit } from '../utils/audit';
import { ok, err } from '../utils/response';
import { STANDSTILL_MIN_DAYS, STANDSTILL_MAX_DAYS } from '../constants';

export const bidsRouter = new Hono<{ Bindings: Env }>();

/**
 * POST /wathq/v1/bids/validate
 * FR-02: Bid arithmetic detection + FR-05: underbid scoring.
 * GTPL Art.46: arithmetic errors > 10% → exclude bid.
 * GTPL Art.47: 35% below govt estimate → mandatory negotiation.
 */
bidsRouter.post('/validate', async (c) => {
  let body: ValidateBidRequest;
  try {
    body = await c.req.json<ValidateBidRequest>();
  } catch {
    return err(c, 400, 'Invalid JSON body');
  }

  const { tenderId, vendorId, submittedTotal, lineItems, govtEstimate } = body;
  if (!tenderId || !vendorId || !submittedTotal) {
    return err(c, 400, 'Missing required fields: tenderId, vendorId, submittedTotal');
  }

  // Recalculate line items if provided
  let recalcResult = null;
  let correctedTotal = submittedTotal;

  if (lineItems && lineItems.length > 0) {
    recalcResult = recalculateLineItemTotal(lineItems);
    correctedTotal = recalcResult.recalculated;
  }

  // Arithmetic check (submitted vs recalculated)
  const arithmetic = checkBidArithmetic(correctedTotal, submittedTotal);

  // Underbid check against government estimate
  const underbid = govtEstimate ? checkUnderbid(submittedTotal, govtEstimate) : null;

  // Determine outcome
  let outcome: 'ACCEPTED' | 'ARITHMETIC_ERROR' | 'UNDERBID_REVIEW' | 'REJECTED';
  let recommendation: string;

  if (!arithmetic.passed) {
    outcome = 'ARITHMETIC_ERROR';
    recommendation = `Bid excluded: arithmetic error ${(arithmetic.errorPct * 100).toFixed(2)}% exceeds 10% (GTPL Art.46)`;
  } else if (underbid?.requiresNegotiation) {
    outcome = 'UNDERBID_REVIEW';
    recommendation = `Mandatory negotiation: bid is ${(underbid.discountPct * 100).toFixed(1)}% below government estimate (GTPL Art.47)`;
  } else {
    outcome = 'ACCEPTED';
    recommendation = 'Bid passes arithmetic and pricing thresholds';
  }

  // Persist evaluation record
  const evalId = generateUUID();
  await c.env.DB.prepare(`
    INSERT INTO bid_evaluations
      (id, tender_id, vendor_id, submitted_total, corrected_total, govt_estimate,
       arithmetic_error_pct, underbid_pct, outcome, recommendation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    evalId, tenderId, vendorId, submittedTotal, correctedTotal,
    govtEstimate ?? null,
    arithmetic.errorPct, underbid?.discountPct ?? null,
    outcome, recommendation,
  ).run();

  const actorId = c.get('actorId') ?? 'system';
  await writeAudit(c.env, {
    entityType: 'bid_evaluation',
    entityId: evalId,
    action: `bid_evaluated_${outcome.toLowerCase()}`,
    actorId,
    actorIp: c.get('actorIp'),
    afterState: { outcome, arithmetic, underbid },
    meta: { tenderId, vendorId },
  });

  return ok(c, {
    evaluationId: evalId,
    outcome,
    recommendation,
    arithmetic: {
      submittedTotal,
      correctedTotal,
      errorPct: arithmetic.errorPct,
      errorSar: arithmetic.delta,
      passed: arithmetic.passed,
    },
    underbid: underbid ? {
      govtEstimate,
      discountPct: underbid.discountPct,
      requiresNegotiation: underbid.requiresNegotiation,
      passedThreshold: underbid.passed,
    } : null,
    lineItemRecalc: recalcResult,
    gtplReferences: {
      arithmeticRule: 'GTPL Art.46 — exclusion if error > 10%',
      underbidRule: govtEstimate ? 'GTPL Art.47 — negotiation if > 35% below estimate' : null,
    },
  });
});

/**
 * GET /wathq/v1/bids/evaluations/:id
 */
bidsRouter.get('/evaluations/:id', async (c) => {
  const id = c.req.param('id');
  const eval_ = await c.env.DB.prepare(`SELECT * FROM bid_evaluations WHERE id = ?`).bind(id).first();
  if (!eval_) return err(c, 404, 'Evaluation not found');
  return ok(c, eval_);
});

/**
 * GET /wathq/v1/bids/standstill/:tenderId
 * GTPL Art.50: 5–10 day standstill period after award notice.
 */
bidsRouter.get('/standstill/:tenderId', async (c) => {
  const tenderId = c.req.param('tenderId');
  const awardDateStr = c.req.query('awardDate');

  if (!awardDateStr) return err(c, 400, 'awardDate query param required (ISO 8601)');

  const awardDate = new Date(awardDateStr);
  if (isNaN(awardDate.getTime())) return err(c, 400, 'Invalid awardDate format');

  const now = new Date();
  const elapsedDays = (now.getTime() - awardDate.getTime()) / 86400000;

  const inStandstill = elapsedDays < STANDSTILL_MAX_DAYS;
  const standstillLifted = elapsedDays >= STANDSTILL_MIN_DAYS;
  const standstillEndDate = new Date(awardDate);
  standstillEndDate.setDate(standstillEndDate.getDate() + STANDSTILL_MIN_DAYS);

  return ok(c, {
    tenderId,
    awardDate: awardDate.toISOString(),
    elapsedDays: Math.floor(elapsedDays),
    standstillMin: STANDSTILL_MIN_DAYS,
    standstillMax: STANDSTILL_MAX_DAYS,
    inStandstill,
    standstillLifted,
    standstillEndDate: standstillEndDate.toISOString(),
    canProceedWithAward: standstillLifted,
    gtplReference: 'GTPL Art.50 — 5–10 day standstill period post-award notice',
  });
});
