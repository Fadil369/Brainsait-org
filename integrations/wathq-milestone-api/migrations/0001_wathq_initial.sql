-- ============================================================
-- WATHQ PROCUREMENT API — D1 Schema Migration v1
-- DB: openauth-brainsait-db (repurposed for wathq procurement)
-- Regulatory basis: GTPL, AFESWE, Etimad payment-claims-manual
-- ============================================================

CREATE TABLE IF NOT EXISTS d1_migrations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    UNIQUE NOT NULL,
  applied_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ────────────────────────────────────────────────
-- CORE PROCUREMENT ENTITIES
-- ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendor_profiles (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  cr_number      TEXT UNIQUE NOT NULL,            -- Commercial Registry number
  cr_name_ar     TEXT NOT NULL,
  cr_name_en     TEXT,
  entity_type    TEXT NOT NULL DEFAULT 'PRIVATE',  -- PRIVATE | GOV
  iban           TEXT,                             -- for payment disbursement
  status         TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK(status IN ('ACTIVE','SUSPENDED','DEREGISTERED')),
  capital_sar    REAL DEFAULT 0,
  city           TEXT,
  national_addr  TEXT,                             -- JSON: full national address
  meta           TEXT,                             -- JSON: extra Wathq API fields
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contracts (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  contract_number TEXT UNIQUE NOT NULL,
  title_ar        TEXT NOT NULL,
  title_en        TEXT,
  vendor_id       TEXT NOT NULL REFERENCES vendor_profiles(id) ON DELETE RESTRICT,
  gov_entity      TEXT NOT NULL,                   -- issuing government entity
  total_value_sar REAL NOT NULL,
  signed_at       TEXT,                            -- contract signature datetime
  status          TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK(status IN ('DRAFT','ACTIVE','SUSPENDED','COMPLETED','TERMINATED')),
  etimad_ref      TEXT,                            -- Etimad platform contract ref
  standstill_ends_at TEXT,                         -- GTPL Art.7: 5-10 day freeze
  meta            TEXT,                            -- JSON: extra fields
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS milestones (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  contract_id    TEXT NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  name_ar        TEXT,
  order_seq      INTEGER NOT NULL DEFAULT 0,
  planned_date   TEXT NOT NULL,
  completed_date TEXT,
  value_sar      REAL NOT NULL DEFAULT 0,          -- milestone payment value
  status         TEXT NOT NULL DEFAULT 'PLANNED'
    CHECK(status IN ('PLANNED','IN_PROGRESS','COMPLETED','VERIFY_PENDING','VERIFIED','DISPUTED')),
  verified_by    TEXT,                             -- user/auditor who verified
  verified_at    TEXT,
  consultant_sig TEXT,                             -- consultant signature ref
  contractor_sig TEXT,                             -- contractor signature ref
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS invoices (
  id               TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  vendor_id        TEXT NOT NULL REFERENCES vendor_profiles(id) ON DELETE RESTRICT,
  r2_key           TEXT,                           -- Cloudflare R2 storage key
  file_name        TEXT NOT NULL,
  file_type        TEXT NOT NULL
    CHECK(file_type IN ('PDF','PNG','JPG','JPEG')),
  extracted_amount REAL,                           -- AI/OCR extracted total
  extracted_vat    REAL,                           -- AI/OCR extracted VAT (15%)
  line_items       TEXT,                           -- JSON array of line items
  parse_status     TEXT NOT NULL DEFAULT 'PENDING'
    CHECK(parse_status IN ('PENDING','PARSED','FAILED','MANUAL_REVIEW')),
  parse_error      TEXT,
  parsed_at        TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payment_claims (
  id               TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  milestone_id     TEXT NOT NULL UNIQUE REFERENCES milestones(id) ON DELETE RESTRICT,
  vendor_id        TEXT NOT NULL REFERENCES vendor_profiles(id) ON DELETE RESTRICT,
  invoice_id       TEXT REFERENCES invoices(id) ON DELETE SET NULL,
  claimed_amount   REAL NOT NULL,
  vat_amount       REAL NOT NULL DEFAULT 0,
  total_with_vat   REAL NOT NULL DEFAULT 0,
  arithmetic_ok    INTEGER NOT NULL DEFAULT 0,     -- 0=false 1=true
  arithmetic_error_pct REAL,                       -- actual % deviation
  vat_checked      INTEGER NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK(status IN ('DRAFT','SUBMITTED','VALIDATED','DISBURSEMENT_ORDER','PAYMENT_ORDER','PAID','REJECTED','OFFSET_PENDING')),
  rejection_reason TEXT,
  etimad_claim_ref TEXT,                           -- Etimad financial claim ref
  disbursement_order_at TEXT,
  payment_order_at TEXT,
  paid_at          TEXT,
  submitted_by     TEXT NOT NULL,                  -- userId / CR
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ────────────────────────────────────────────────
-- AFESWE: DEBT REGISTRY & OFFSET ENGINE
-- ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS debt_registry (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  vendor_id      TEXT NOT NULL REFERENCES vendor_profiles(id) ON DELETE RESTRICT,
  cr_number      TEXT NOT NULL,
  debt_ref       TEXT UNIQUE NOT NULL,             -- state revenue system ref
  amount_sar     REAL NOT NULL,
  balance_sar    REAL NOT NULL,                    -- remaining after partial payments
  description    TEXT,
  gov_entity     TEXT NOT NULL,                    -- creditor government entity
  status         TEXT NOT NULL DEFAULT 'LIST'
    CHECK(status IN ('LIST','PAID_OFF','CANCELLED','EXEMPTED','INSTALLMENT')),
  -- GTPL Art.60: exemption tracking
  exemption_requested INTEGER NOT NULL DEFAULT 0,
  exemption_approved  INTEGER NOT NULL DEFAULT 0,
  registered_at  TEXT NOT NULL,
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS debt_offsets (
  id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  claim_id          TEXT NOT NULL REFERENCES payment_claims(id) ON DELETE RESTRICT,
  debt_id           TEXT NOT NULL REFERENCES debt_registry(id) ON DELETE RESTRICT,
  vendor_id         TEXT NOT NULL REFERENCES vendor_profiles(id) ON DELETE RESTRICT,
  original_claim_sar REAL NOT NULL,
  debt_deducted_sar  REAL NOT NULL,
  net_payment_sar    REAL NOT NULL,
  offset_status      TEXT NOT NULL DEFAULT 'PENDING'
    CHECK(offset_status IN ('PENDING','EXECUTED','FAILED','REVERSED')),
  two_phase_token    TEXT,                         -- idempotency key for 2PC
  executed_at        TEXT,
  failed_reason      TEXT,
  created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ────────────────────────────────────────────────
-- AFESWE: BANK GUARANTEE ESCROW MODULE
-- ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bank_guarantees (
  id               TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  vendor_id        TEXT NOT NULL REFERENCES vendor_profiles(id) ON DELETE RESTRICT,
  contract_id      TEXT REFERENCES contracts(id) ON DELETE SET NULL,
  guarantee_type   TEXT NOT NULL
    CHECK(guarantee_type IN ('GRIEVANCE','POST_QUAL','PERFORMANCE','ADVANCE')),
  bank_ref         TEXT NOT NULL,                  -- bank's internal reference
  amount_sar       REAL NOT NULL,
  currency         TEXT NOT NULL DEFAULT 'SAR',
  issued_at        TEXT NOT NULL,
  -- GTPL: grievance guarantees valid ≥30 days from filing
  valid_from       TEXT NOT NULL,
  valid_until      TEXT NOT NULL,
  auto_cancel_sla_hours INTEGER NOT NULL DEFAULT 16, -- service delivery level
  status           TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK(status IN ('ACTIVE','AMENDED','CANCELLED','EXPIRED','RENEWAL_PENDING')),
  cancellation_trigger TEXT,                       -- RESOLUTION | EXPIRED | MANUAL
  cancelled_at     TEXT,
  renewal_alerted  INTEGER NOT NULL DEFAULT 0,     -- 5-day pre-expiry alert sent
  etimad_contracts_ref TEXT,                       -- from Contracts API response
  x_mof_rq_uid     TEXT,                           -- idempotency GUID for Etimad
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ────────────────────────────────────────────────
-- AFESWE: BID SCRUTINY (ARITHMETIC + UNDERBID)
-- ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bid_evaluations (
  id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  contract_id       TEXT REFERENCES contracts(id) ON DELETE SET NULL,
  vendor_id         TEXT NOT NULL REFERENCES vendor_profiles(id) ON DELETE RESTRICT,
  bid_amount_sar    REAL NOT NULL,
  govt_estimate_sar REAL NOT NULL,
  price_list_total  REAL NOT NULL,
  arithmetic_error_sar REAL NOT NULL DEFAULT 0,
  arithmetic_error_pct REAL NOT NULL DEFAULT 0,
  -- GTPL: flag if error >10%
  arithmetic_flag   INTEGER NOT NULL DEFAULT 0,
  -- GTPL: flag if bid ≥35% below govt estimate
  underbid_flag     INTEGER NOT NULL DEFAULT 0,
  underbid_pct      REAL NOT NULL DEFAULT 0,
  committee_review_required INTEGER NOT NULL DEFAULT 0,
  committee_notes   TEXT,
  result            TEXT NOT NULL DEFAULT 'PENDING'
    CHECK(result IN ('PENDING','PASSED','FLAGGED_ARITHMETIC','FLAGGED_UNDERBID','EXCLUDED','NEGOTIATION_REQUIRED')),
  evaluated_by      TEXT,
  evaluated_at      TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ────────────────────────────────────────────────
-- AFESWE: ETIMAD OAuth TOKEN CACHE
-- ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS etimad_tokens (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  client_id       TEXT NOT NULL,
  access_token    TEXT NOT NULL,
  token_type      TEXT NOT NULL DEFAULT 'Bearer',
  expires_at      TEXT NOT NULL,                   -- datetime when token expires
  -- TTL = 3599s per Etimad Token API spec
  ttl_seconds     INTEGER NOT NULL DEFAULT 3599,
  organization    TEXT NOT NULL DEFAULT 'mof',
  is_active       INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ────────────────────────────────────────────────
-- COMPLIANCE: IMMUTABLE AUDIT LOG
-- ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_log (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  entity_type    TEXT NOT NULL,                    -- claim | milestone | guarantee | offset | bid
  entity_id      TEXT NOT NULL,
  action         TEXT NOT NULL,                    -- e.g. claim_submitted, milestone_verified
  actor_id       TEXT NOT NULL,                    -- userId / CR / system
  actor_ip       TEXT,
  x_mof_rq_uid   TEXT,                             -- idempotency key (from Etimad reqs)
  before_state   TEXT,                             -- JSON snapshot
  after_state    TEXT,                             -- JSON snapshot
  meta           TEXT,                             -- JSON extra context
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
  -- NOTE: no UPDATE/DELETE permitted on this table — append-only
);

-- ────────────────────────────────────────────────
-- INDEXES
-- ────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_vendor_cr       ON vendor_profiles(cr_number);
CREATE INDEX IF NOT EXISTS idx_milestones_ctr  ON milestones(contract_id, status);
CREATE INDEX IF NOT EXISTS idx_claims_vendor   ON payment_claims(vendor_id, status);
CREATE INDEX IF NOT EXISTS idx_claims_ms       ON payment_claims(milestone_id);
CREATE INDEX IF NOT EXISTS idx_debts_vendor    ON debt_registry(vendor_id, status);
CREATE INDEX IF NOT EXISTS idx_debts_cr        ON debt_registry(cr_number, status);
CREATE INDEX IF NOT EXISTS idx_guarantees_vendor ON bank_guarantees(vendor_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_entity    ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor     ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_bids_contract   ON bid_evaluations(contract_id, result);
CREATE INDEX IF NOT EXISTS idx_tokens_client   ON etimad_tokens(client_id, is_active);
CREATE INDEX IF NOT EXISTS idx_offsets_claim   ON debt_offsets(claim_id, offset_status);

-- ────────────────────────────────────────────────
-- SEED: migration record
-- ────────────────────────────────────────────────

INSERT OR IGNORE INTO d1_migrations(name) VALUES ('0001_wathq_initial');
