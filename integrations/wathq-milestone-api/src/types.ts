// ── Cloudflare Worker Env bindings ─────────────────────────────────────
export interface Env {
  // D1: openauth-brainsait-db (repurposed for wathq procurement)
  DB: D1Database;
  // KV: token cache + rate limiting
  WATHQ_KV: KVNamespace;
  // R2: invoice document storage
  WATHQ_R2: R2Bucket;
  // Queues: async OCR + audit events
  WATHQ_QUEUE: Queue;
  // Secrets
  API_SECRET_KEY: string;
  WATHQ_API_KEY: string;           // real Wathq apiKey from developer.wathq.sa
  WATHQ_API_BASE_URL: string;      // https://api.wathq.sa/v1
  ETIMAD_CLIENT_ID: string;
  ETIMAD_CLIENT_SECRET: string;
  ETIMAD_TOKEN_URL: string;
  ETIMAD_CONTRACTS_URL: string;
  ENVIRONMENT: string;
  // Payment keys
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  PAYPAL_CLIENT_ID: string;
  PAYPAL_CLIENT_SECRET: string;
  STCPAY_MERCHANT_ID: string;
  STCPAY_SECRET_KEY: string;
}

// ── Status Enums (D1 CHECK constraints mirror these) ────────────────────
export type MilestoneStatus =
  | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'
  | 'VERIFY_PENDING' | 'VERIFIED' | 'DISPUTED';

export type ClaimStatus =
  | 'DRAFT' | 'SUBMITTED' | 'VALIDATED'
  | 'DISBURSEMENT_ORDER' | 'PAYMENT_ORDER'
  | 'PAID' | 'REJECTED' | 'OFFSET_PENDING';

export type DebtStatus = 'LIST' | 'PAID_OFF' | 'CANCELLED' | 'EXEMPTED' | 'INSTALLMENT';

export type GuaranteeType = 'GRIEVANCE' | 'POST_QUAL' | 'PERFORMANCE' | 'ADVANCE';

export type GuaranteeStatus =
  | 'ACTIVE' | 'AMENDED' | 'CANCELLED' | 'EXPIRED' | 'RENEWAL_PENDING';

export type BidResult =
  | 'PENDING' | 'PASSED' | 'FLAGGED_ARITHMETIC'
  | 'FLAGGED_UNDERBID' | 'EXCLUDED' | 'NEGOTIATION_REQUIRED';

// ── Domain Types ─────────────────────────────────────────────────────────
export interface VendorProfile {
  id: string;
  cr_number: string;
  cr_name_ar: string;
  cr_name_en?: string;
  entity_type: 'PRIVATE' | 'GOV';
  iban?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DEREGISTERED';
  capital_sar: number;
  city?: string;
  national_addr?: string;
  meta?: string;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  contract_number: string;
  title_ar: string;
  title_en?: string;
  vendor_id: string;
  gov_entity: string;
  total_value_sar: number;
  signed_at?: string;
  status: 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'COMPLETED' | 'TERMINATED';
  etimad_ref?: string;
  standstill_ends_at?: string;
  meta?: string;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  contract_id: string;
  name: string;
  name_ar?: string;
  order_seq: number;
  planned_date: string;
  completed_date?: string;
  value_sar: number;
  status: MilestoneStatus;
  verified_by?: string;
  verified_at?: string;
  consultant_sig?: string;
  contractor_sig?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  vendor_id: string;
  r2_key?: string;
  file_name: string;
  file_type: 'PDF' | 'PNG' | 'JPG' | 'JPEG';
  extracted_amount?: number;
  extracted_vat?: number;
  line_items?: string;
  parse_status: 'PENDING' | 'PARSED' | 'FAILED' | 'MANUAL_REVIEW';
  parse_error?: string;
  parsed_at?: string;
  created_at: string;
}

export interface PaymentClaim {
  id: string;
  milestone_id: string;
  vendor_id: string;
  invoice_id?: string;
  claimed_amount: number;
  vat_amount: number;
  total_with_vat: number;
  arithmetic_ok: number;
  arithmetic_error_pct?: number;
  vat_checked: number;
  status: ClaimStatus;
  rejection_reason?: string;
  etimad_claim_ref?: string;
  disbursement_order_at?: string;
  payment_order_at?: string;
  paid_at?: string;
  submitted_by: string;
  created_at: string;
  updated_at: string;
}

export interface DebtRecord {
  id: string;
  vendor_id: string;
  cr_number: string;
  debt_ref: string;
  amount_sar: number;
  balance_sar: number;
  description?: string;
  gov_entity: string;
  status: DebtStatus;
  exemption_requested: number;
  exemption_approved: number;
  registered_at: string;
  updated_at: string;
}

export interface BankGuarantee {
  id: string;
  vendor_id: string;
  contract_id?: string;
  guarantee_type: GuaranteeType;
  bank_ref: string;
  amount_sar: number;
  currency: string;
  issued_at: string;
  valid_from: string;
  valid_until: string;
  auto_cancel_sla_hours: number;
  status: GuaranteeStatus;
  cancellation_trigger?: string;
  cancelled_at?: string;
  renewal_alerted: number;
  etimad_contracts_ref?: string;
  x_mof_rq_uid?: string;
  created_at: string;
  updated_at: string;
}

export interface BidEvaluation {
  id: string;
  contract_id?: string;
  vendor_id: string;
  bid_amount_sar: number;
  govt_estimate_sar: number;
  price_list_total: number;
  arithmetic_error_sar: number;
  arithmetic_error_pct: number;
  arithmetic_flag: number;
  underbid_flag: number;
  underbid_pct: number;
  committee_review_required: number;
  committee_notes?: string;
  result: BidResult;
  evaluated_by?: string;
  evaluated_at?: string;
  created_at: string;
}

// ── API Request/Response shapes ─────────────────────────────────────────
export interface SubmitClaimRequest {
  milestoneId: string;
  invoiceId: string;
  claimedAmount: number;
  submittedBy: string;
}

export interface ValidateBidRequest {
  vendorId: string;
  contractId?: string;
  bidAmountSar: number;
  govtEstimateSar: number;
  priceListTotal: number;
  priceListItems?: Array<{ description: string; unitPrice: number; quantity: number; lineTotal: number }>;
}

export interface RegisterGuaranteeRequest {
  vendorId: string;
  contractId?: string;
  guaranteeType: GuaranteeType;
  bankRef: string;
  amountSar: number;
  issuedAt: string;
  validFrom: string;
  validUntil: string;
}

export interface ExecuteOffsetRequest {
  claimId: string;
  vendorId: string;
  requestedBy: string;
}

export interface EtimadToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  organization_name: string;
}
