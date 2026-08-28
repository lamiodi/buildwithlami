-- ─── v41: Retainer invoice idempotency ──────────────────────
-- The monthly retainer cron previously deduplicated using
-- `description LIKE 'Monthly Retainer%'` + EXTRACT(MONTH/YEAR) on
-- created_at. This is fragile:
--   * description text can be edited retroactively, breaking the dedup
--   * timezone of created_at vs CURRENT_DATE can flip a month boundary
--   * no DB-level guarantee — two concurrent cron runs can both pass
--     the check before either INSERTs
--
-- This migration adds a structured `retainer_period` column
-- (CHAR(7) in 'YYYY-MM' form) and a unique partial index so the
-- INSERT itself becomes the lock. Any second INSERT for the same
-- (project_id, retainer_period) tuple is rejected by the DB with
-- a unique-constraint violation, which we catch in code as
-- "already generated".
-- ─────────────────────────────────────────────────────────────

ALTER TABLE invoices
    ADD COLUMN IF NOT EXISTS retainer_period CHAR(7);

-- Only one retainer invoice per project per month. NULL retainer_period
-- is allowed to coexist with any other row (e.g. ad-hoc invoices), and
-- two non-retainer invoices on the same project are still fine.
CREATE UNIQUE INDEX IF NOT EXISTS uq_invoices_project_retainer_period
    ON invoices (project_id, retainer_period)
    WHERE retainer_period IS NOT NULL;
