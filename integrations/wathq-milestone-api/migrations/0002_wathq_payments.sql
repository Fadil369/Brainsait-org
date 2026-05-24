-- ============================================================
-- WATHQ TRUST LAYER — Payment & Commerce Tables Migration v2
-- Adds: payment_orders, credit_accounts, waitlist_signups, wathq_api_calls
-- ============================================================

CREATE TABLE IF NOT EXISTS payment_orders (
  id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  product_id        TEXT NOT NULL,
  amount_sar        REAL NOT NULL,
  quantity          INTEGER NOT NULL DEFAULT 1,
  status            TEXT NOT NULL DEFAULT 'PENDING'
    CHECK(status IN ('PENDING','COMPLETED','FAILED','REFUNDED','CANCELLED')),
  payment_method    TEXT,   -- 'stripe' | 'paypal' | 'stcpay'
  stripe_session_id TEXT,
  paypal_order_id   TEXT,
  stcpay_ref        TEXT,
  email             TEXT,
  customer_name     TEXT,
  vat_amount        REAL    GENERATED ALWAYS AS (amount_sar * 0.15) STORED,
  total_with_vat    REAL    GENERATED ALWAYS AS (amount_sar * 1.15) STORED,
  meta              TEXT,   -- JSON: extra payment provider data
  created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_email     ON payment_orders(email);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status    ON payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_stripe    ON payment_orders(stripe_session_id);

-- Credit accounts for prepaid balance management
CREATE TABLE IF NOT EXISTS credit_accounts (
  id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email             TEXT UNIQUE NOT NULL,
  api_key           TEXT UNIQUE,                    -- generated when account is activated
  balance_sar       REAL NOT NULL DEFAULT 0,
  total_loaded_sar  REAL NOT NULL DEFAULT 0,
  total_spent_sar   REAL NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK(status IN ('ACTIVE','SUSPENDED','DEPLETED')),
  plan              TEXT NOT NULL DEFAULT 'pay_as_you_go'
    CHECK(plan IN ('trial','pay_as_you_go','growth','enterprise')),
  trial_calls_used  INTEGER NOT NULL DEFAULT 0,
  trial_calls_limit INTEGER NOT NULL DEFAULT 20,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_credit_accounts_api_key ON credit_accounts(api_key);
CREATE INDEX IF NOT EXISTS idx_credit_accounts_email   ON credit_accounts(email);

-- Per-call billing ledger
CREATE TABLE IF NOT EXISTS wathq_api_calls (
  id               TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  account_email    TEXT NOT NULL,
  api_key          TEXT,
  endpoint         TEXT NOT NULL,   -- 'cr-full' | 'cr-basic' | 'address' | 'poa' | 'deed' | etc.
  cr_number        TEXT,
  cost_sar         REAL NOT NULL DEFAULT 0,
  cache_hit        INTEGER NOT NULL DEFAULT 0,  -- 1 = served from KV cache (no charge)
  status_code      INTEGER,
  ip               TEXT,
  called_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_api_calls_account   ON wathq_api_calls(account_email);
CREATE INDEX IF NOT EXISTS idx_api_calls_called_at ON wathq_api_calls(called_at);

-- Waitlist/early-access signups (replaces Formspree)
CREATE TABLE IF NOT EXISTS waitlist_signups (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  company     TEXT,
  product     TEXT NOT NULL,
  volume      TEXT,
  usecase     TEXT,
  source      TEXT NOT NULL DEFAULT 'wathq-trust-layer',
  status      TEXT NOT NULL DEFAULT 'NEW'
    CHECK(status IN ('NEW','CONTACTED','CONVERTED','DECLINED')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email   ON waitlist_signups(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_product ON waitlist_signups(product);
CREATE INDEX IF NOT EXISTS idx_waitlist_status  ON waitlist_signups(status);

-- API pricing table (allows runtime updates without redeploy)
CREATE TABLE IF NOT EXISTS api_pricing (
  endpoint      TEXT PRIMARY KEY,
  name_ar       TEXT NOT NULL,
  name_en       TEXT NOT NULL,
  price_sar     REAL NOT NULL,
  is_free       INTEGER NOT NULL DEFAULT 0,
  wathq_api_id  INTEGER,              -- maps to developer.wathq.sa API IDs
  active        INTEGER NOT NULL DEFAULT 1,
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO api_pricing (endpoint, name_ar, name_en, price_sar, wathq_api_id) VALUES
  ('cr-full',        'السجل التجاري الكامل',   'Commercial Registration Full',          20.00, 16),
  ('cr-new-leg',     'السجل التجاري - تشريع جديد', 'CR New Legislation',                20.00, 32),
  ('cr-search',      'بحث السجل التجاري',       'Commercial Registration Search',         9.00, 20),
  ('deed',           'الصك العقاري',            'Real Estate Deed',                       9.00, 13),
  ('address',        'العنوان الوطني',           'National Address',                       4.00, 17),
  ('poa',            'الوكالة العدلية',          'Power of Attorney / Judicial Agency',    9.00, 14),
  ('certificate',    'شهادة المنشأ',             'Certificate of Origin',                  5.00, 9),
  ('trademark',      'العلامة التجارية',         'Trademark',                              5.00, 10),
  ('corp-identity',  'الهوية الاعتبارية',        'Corporate Identity',                     5.00, 11),
  ('financials',     'القوائم المالية',           'Financial Statements',                  12.00, 12),
  ('chambers',       'الغرف السعودية',            'Saudi Chambers Council',                 5.00, 15),
  ('cr-sso',         'السجل عبر النفاذ الموحد',  'CR via Unified SSO',                     9.00, 19),
  ('beneficiary',    'المستفيد الحقيقي',         'Ultimate Beneficiary Owner',              0.00, NULL),
  ('cr-status',      'حالة السجل التجاري',       'CR Status Check',                        5.00, NULL);
