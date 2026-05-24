// GTPL & AFESWE regulatory constants — do NOT modify without legal review

/** GTPL Executive Regulations: arithmetic error threshold for bid/invoice exclusion */
export const ARITHMETIC_ERROR_THRESHOLD = 0.10;          // 10%

/** GTPL Regulations: underbid flag threshold requiring mandatory committee negotiation */
export const UNDERBID_THRESHOLD = 0.35;                  // 35% below govt estimate

/** Etimad Token API: Bearer token time-to-live in seconds */
export const ETIMAD_TOKEN_TTL_SECONDS = 3599;

/** GTPL: grievance bank guarantee minimum validity period in days */
export const GUARANTEE_MIN_VALIDITY_DAYS = 30;

/** Etimad Service Delivery Levels: auto-cancellation SLA for bank guarantees */
export const GUARANTEE_CANCEL_SLA_HOURS = 16;

/** GTPL Art.7: minimum standstill period days after tender decision */
export const STANDSTILL_MIN_DAYS = 5;

/** GTPL Art.7: maximum standstill period days after tender decision */
export const STANDSTILL_MAX_DAYS = 10;

/** Saudi VAT rate */
export const VAT_RATE = 0.15;                            // 15%

/** Ministry of Finance 60-day payment settlement target */
export const MOF_PAYMENT_TARGET_DAYS = 60;

/** Guarantee renewal alert window (days before expiry) */
export const GUARANTEE_RENEWAL_ALERT_DAYS = 5;

/** Etimad idType codes for Contracts API */
export const ETIMAD_ID_TYPE = {
  COMMERCIAL_REGISTRY: '01',
  BENEFICIARY_ID: '02',
  ID_700: '03',
} as const;

/** Debt states that block automatic offset (exemption/installment/cancelled) */
export const DEBT_OFFSET_BLOCKED_STATES = new Set(['EXEMPTED', 'CANCELLED', 'INSTALLMENT']);

/** KV key prefixes */
export const KV_PREFIX = {
  ETIMAD_TOKEN: 'etimad:token:',
  RATE_LIMIT: 'rate:',
  TWO_PHASE: '2pc:offset:',
} as const;
