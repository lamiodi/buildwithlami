-- ─── v48_quote_deposit_automation.sql ─────────────────────
-- Admin OS Phase 2 — the quote → deposit → onboarding chain
-- (blueprint §25 Quote Acceptance Workflow, §58 automations).
--
-- New columns:
--   quotations.currency         — the quote's currency (the admin UI
--                                 already sends it; the API dropped it)
--   quotations.deposit_percent  — deposit share of the total, default 50
--                                 (matches the studio's 50/50 milestone terms)
--   quotations.accepted_at      — when acceptance was recorded
--   invoices.quotation_id       — links the auto-created deposit invoice
--                                 back to its quotation
--
-- The partial unique index makes the deposit invoice per quotation
-- a database-level idempotency guarantee (blueprint §89): no matter
-- how many times the acceptance automation re-runs, a quotation can
-- only ever have ONE invoice.
-- ──────────────────────────────────────────────────────────

ALTER TABLE quotations
    ADD COLUMN IF NOT EXISTS currency CHAR(3) NOT NULL DEFAULT 'NGN',
    ADD COLUMN IF NOT EXISTS deposit_percent INT NOT NULL DEFAULT 50
        CHECK (deposit_percent BETWEEN 0 AND 100),
    ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

-- Quick lookups for the command center / quotation views.
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations (status);

ALTER TABLE invoices
    ADD COLUMN IF NOT EXISTS quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_invoices_per_quotation
    ON invoices (quotation_id)
    WHERE quotation_id IS NOT NULL;
