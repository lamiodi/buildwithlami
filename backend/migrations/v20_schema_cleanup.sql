-- ═══════════════════════════════════════════════════════════
-- v20_schema_cleanup.sql
-- ═══════════════════════════════════════════════════════════
-- Phase 12 — Schema audit & cleanup.
--
-- Brings the migrations into sync with the actual code and
-- adds the missing indexes for the dashboard's hot queries.
--
-- 1. ADDS `invoices.invoice_number` (TEXT, UNIQUE)
--    — invoiceController.js line 80 already writes it; the
--      column was never declared in any migration. Backfills
--      any pre-existing rows as `INV-YYYY-NNN` per year so
--      the column is non-null and unique everywhere.
--
-- 2. ADDS `invoices.paid_at` (TIMESTAMPTZ, NULL)
--    — written by invoiceController / paymentController /
--      adminInboxRoutes. Previously only created by the
--      one-off `applyFixes.js` script; promoted to a real
--      migration so a fresh `db:init` + `db:migrate` works
--      on a clean database.
--
-- 3. CREATES `activity_logs` table
--    — used by activityController, activityMiddleware, and
--      the dashboard "Recent activity" widget. Previously
--      only created by the one-off `applyFixes.js` script.
--      The `details` column is JSONB (not TEXT) so we can
--      query into it later if needed.
--
-- 4. DROPS the unused `conversations` table
--    — defined in v12_cms.sql but never read or written by
--      any controller. The unified-inbox view aggregates
--      `messages`, `project_feedback`, and `intake_submissions`
--      directly (see adminInboxController.js). Cascade drops
--      any dependent objects just in case.
--
-- 5. ADDS performance indexes for dashboard hot paths:
--      - invoices(created_at DESC)          — getAllInvoices, Reports revenueByMonth
--      - invoices(status, created_at DESC)  — Reports paid/pending/overdue filters
--      - invoices(client_id, status)        — client billing views
--      - invoices(project_id, status)       — project billing views
--      - client_projects(updated_at DESC)   — dashboard overview ordering
--      - client_projects(client_id, status) — per-client project list
--      - clients(created_at DESC)           — dashboard overview ordering
--      - project_feedback(created_at DESC)  — dashboard recent feedback
--      - project_feedback(status)           — already exists; kept
--      - intake_templates(created_at DESC)  — dashboard overview ordering
--      - activity_logs(created_at DESC)     — dashboard recent activity
--      - activity_logs(action)              — filter by event type
--      - bank_accounts(currency, is_active) — PaymentPage query
--      - clients(division, created_at DESC) — division-filtered client list
--      - leads(updated_at DESC)             — Today widget "stale leads" query
--      - messages(created_at DESC)          — Today widget unread + admin list
--
-- All DDL is idempotent.
-- ═══════════════════════════════════════════════════════════

-- ── 1. invoices.invoice_number ───────────────────────────
ALTER TABLE invoices
    ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- Backfill: assign INV-YYYY-NNN per year, ordered by
-- created_at. We use a window function so the backfill is
-- stable and unique. Wrapped in a DO block so re-running
-- the migration is safe.
DO $$
DECLARE
    rec RECORD;
    seq INT;
    prefix TEXT;
    candidate TEXT;
    year_cursor CURSOR FOR
        SELECT DISTINCT EXTRACT(YEAR FROM created_at)::int AS yr
        FROM invoices
        WHERE invoice_number IS NULL
        ORDER BY yr;
BEGIN
    FOR rec IN year_cursor LOOP
        seq := 0;
        prefix := 'INV-' || rec.yr || '-';
        FOR candidate IN
            SELECT id::text
            FROM invoices
            WHERE invoice_number IS NULL
              AND EXTRACT(YEAR FROM created_at)::int = rec.yr
            ORDER BY created_at ASC, id ASC
        LOOP
            seq := seq + 1;
            UPDATE invoices
               SET invoice_number = prefix || LPAD(seq::text, 3, '0')
             WHERE id::text = candidate;
        END LOOP;
    END LOOP;
END $$;

-- Enforce NOT NULL + UNIQUE only after the backfill, so the
-- migration is safe to run on a populated database.
ALTER TABLE invoices
    ALTER COLUMN invoice_number SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'invoices_invoice_number_key'
    ) THEN
        ALTER TABLE invoices
            ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);
    END IF;
END $$;

-- ── 2. invoices.paid_at ─────────────────────────────────
ALTER TABLE invoices
    ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- ── 3. activity_logs table ───────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID,
    user_name     TEXT,
    action        TEXT NOT NULL,
    resource_type TEXT,
    resource_id   TEXT,
    details       JSONB,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. drop unused `conversations` table ─────────────────
DROP TABLE IF EXISTS conversations CASCADE;

-- ── 5. performance indexes ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_invoices_created_at         ON invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_status_created     ON invoices(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_client_status      ON invoices(client_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_project_status     ON invoices(project_id, status);

CREATE INDEX IF NOT EXISTS idx_client_projects_updated_at  ON client_projects(updated_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_client_projects_client_stat ON client_projects(client_id, status);

CREATE INDEX IF NOT EXISTS idx_clients_created_at          ON clients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_div_created         ON clients(division, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_project_feedback_created    ON project_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_intake_templates_created    ON intake_templates(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created       ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action        ON activity_logs(action);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_active        ON bank_accounts(currency, is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_leads_updated_at            ON leads(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_created_at         ON messages(created_at DESC);
