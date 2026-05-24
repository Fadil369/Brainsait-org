import {
  ARITHMETIC_ERROR_THRESHOLD,
  UNDERBID_THRESHOLD,
  VAT_RATE,
} from '../constants';

export interface ArithmeticResult {
  ok: boolean;
  errorAmount: number;
  errorPct: number;
  exceedsThreshold: boolean;
}

export interface UnderbidResult {
  flagged: boolean;
  deviationPct: number;
  negotiationRequired: boolean;
}

export interface VatResult {
  ok: boolean;
  expectedVat: number;
  providedVat: number;
  delta: number;
}

/**
 * GTPL Executive Regulations: validate invoice arithmetic.
 * Flag if |extracted - claimed| / claimed > 10%.
 */
export function checkInvoiceArithmetic(
  extractedAmount: number,
  claimedAmount: number,
): ArithmeticResult {
  if (claimedAmount <= 0) {
    return { ok: false, errorAmount: 0, errorPct: 1, exceedsThreshold: true };
  }
  const errorAmount = Math.abs(extractedAmount - claimedAmount);
  const errorPct = errorAmount / claimedAmount;
  return {
    ok: errorPct <= ARITHMETIC_ERROR_THRESHOLD,
    errorAmount,
    errorPct,
    exceedsThreshold: errorPct > ARITHMETIC_ERROR_THRESHOLD,
  };
}

/**
 * GTPL: validate bid arithmetic against price list.
 * Flag if arithmetic correction of price list errors exceeds 10% of total bid.
 */
export function checkBidArithmetic(
  correctedTotal: number,
  submittedTotal: number,
): ArithmeticResult {
  if (submittedTotal <= 0) {
    return { ok: false, errorAmount: 0, errorPct: 1, exceedsThreshold: true };
  }
  const errorAmount = Math.abs(correctedTotal - submittedTotal);
  const errorPct = errorAmount / submittedTotal;
  return {
    ok: errorPct <= ARITHMETIC_ERROR_THRESHOLD,
    errorAmount,
    errorPct,
    exceedsThreshold: errorPct > ARITHMETIC_ERROR_THRESHOLD,
  };
}

/**
 * GTPL: detect predatory underbidding.
 * Bids ≥35% below govt estimate require mandatory committee review.
 * Cannot be summarily excluded — only flagged.
 */
export function checkUnderbid(
  bidAmount: number,
  govtEstimate: number,
): UnderbidResult {
  if (govtEstimate <= 0) return { flagged: false, deviationPct: 0, negotiationRequired: false };
  const deviationPct = (govtEstimate - bidAmount) / govtEstimate;
  const flagged = deviationPct >= UNDERBID_THRESHOLD;
  return {
    flagged,
    deviationPct,
    negotiationRequired: flagged, // mandatory negotiation per GTPL
  };
}

/**
 * Validate KSA VAT (15%) on invoice.
 * Allows ±1 SAR rounding tolerance.
 */
export function checkVatCompliance(
  claimedAmount: number,
  providedVat: number,
): VatResult {
  const expectedVat = Math.round(claimedAmount * VAT_RATE * 100) / 100;
  const delta = Math.abs(providedVat - expectedVat);
  return {
    ok: delta <= 1.0,
    expectedVat,
    providedVat,
    delta,
  };
}

/**
 * Recalculate line-item total from invoice line items.
 * Used to detect invoice inflation / suppression.
 */
export function recalculateLineItemTotal(
  items: Array<{ unitPrice: number; quantity: number; lineTotal: number }>,
): { recalculated: number; provided: number; delta: number } {
  let recalculated = 0;
  let provided = 0;
  for (const item of items) {
    recalculated += item.unitPrice * item.quantity;
    provided += item.lineTotal;
  }
  return { recalculated, provided, delta: Math.abs(recalculated - provided) };
}
