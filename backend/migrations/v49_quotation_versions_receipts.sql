-- ─── v49_quotation_versions_receipts.sql ──────────────────
-- Admin OS Phase 2 (continued):
--   §24 Quotation versioning — never overwrite a sent/accepted
--       quote; revisions become new rows (V1, V2, …) grouped by
--       `root_id`, older rows move to SUPERSEDED.
--   §45 Receipts — a durable, numbered record generated for every
--       paid invoice (amount, method, remaining balance).
-- ──────────────────────────────────────────────────────────

-- ── 1. Quotation versioning ──────────────────────────────
ALTER TABLE quotations
    ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1
        CHECK (version >= 1),
    ADD COLUMN IF NOT EXISTS root_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

-- SUPERSEDED joins the status enum for versioned-away quotes.
-- DROP + re-ADD keeps the migration re-runnable.
ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_status_check;
ALTER TABLE quotations ADD CONSTRAINT quotations_status_check
    CHECK (status IN ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'CONVERTED', 'SUPERSEDED'));

CREATE INDEX IF NOT EXISTS idx_quotations_root ON quotations (root_id);

-- ── 2. Receipts ──────────────────────────────────────────
-- One receipt per invoice (UNIQUE invoice_id) = idempotent
-- generation no matter how many payment paths fire. Amounts are
-- stored in the invoice's own currency; remaining_balance is
-- computed per currency at generation time (blueprint §42).
CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number TEXT NOT NULL UNIQUE,
    invoice_id UUID NOT NULL UNIQUE REFERENCES invoices(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES client_projects(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency CHAR(3) NOT NULL DEFAULT 'NGN',
    paid_via TEXT,
    paid_at TIMESTAMPTZ NOT NULL,
    remaining_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_receipts_client ON receipts (client_id);
CREATE INDEX IF NOT EXISTS idx_receipts_created ON receipts (created_at DESC);
