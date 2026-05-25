-- ── Acrobat Sign Integration: D1 Schema ──
-- Run: wrangler d1 execute <DB_NAME> --file=schema.sql

CREATE TABLE IF NOT EXISTS signing_records (
  id TEXT PRIMARY KEY,
  agreement_id TEXT NOT NULL UNIQUE,
  cr_number TEXT,
  verification_id TEXT,
  signer_email TEXT NOT NULL,
  signer_name TEXT NOT NULL,
  document_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CREATED',          -- CREATED, OUT_FOR_SIGNATURE, SIGNED, CANCELLED, EXPIRED, ABORTED
  webhook_id TEXT,
  signing_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  signed_at TEXT,
  cancelled_at TEXT,
  expired_at TEXT,
  signed_pdf_r2_key TEXT,                          -- R2 key for signed PDF storage
  audit_trail_r2_key TEXT,                         -- R2 key for audit trail
  impersonated_for TEXT,                           -- email if gov cloud impersonation
  metadata TEXT,                                    -- JSON blob for extra context
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_signing_agreement ON signing_records(agreement_id);
CREATE INDEX IF NOT EXISTS idx_signing_cr ON signing_records(cr_number);
CREATE INDEX IF NOT EXISTS idx_signing_status ON signing_records(status);
CREATE INDEX IF NOT EXISTS idx_signing_signer ON signing_records(signer_email);

-- Webhook event log
CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  webhook_id TEXT,
  agreement_id TEXT,
  event_type TEXT NOT NULL,
  event_date TEXT,
  payload TEXT NOT NULL,                           -- raw JSON payload
  signature_valid INTEGER NOT NULL DEFAULT 0,      -- 1 if HMAC verified
  processed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_webhook_agreement ON webhook_events(agreement_id);
