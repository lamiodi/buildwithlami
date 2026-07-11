-- ═══════════════════════════════════════════════════════════
-- v5_division.sql
-- ═══════════════════════════════════════════════════════════
-- 1. Adds a `division` column to every business table so
--    leads / clients / projects / invoices can be tagged
--    as SOFTWARE, SURVEY, or DRONE.
--
-- 2. Adds the missing `project_type`, `budget`, and
--    `timeline` columns to the `messages` table. The home-page
--    `Contact` component writes these fields but the original
--    `init.sql` only had `subject` (which was never sent by any
--    form — see migrations/README.md, "Redundant Items Removed").
--
-- 3. Drops the redundant `subject` column from `messages`
--    (added in early schema drafts; never populated by any
--    public form). Uses `DROP COLUMN IF EXISTS` so re-running
--    this migration is safe.
--
-- All DDL is idempotent — this file can be applied multiple
-- times without error.
-- ═══════════════════════════════════════════════════════════

-- ── 1. division columns ──────────────────────────────────
ALTER TABLE clients
    ADD COLUMN IF NOT EXISTS division TEXT NOT NULL DEFAULT 'SOFTWARE'
    CHECK (division IN ('SOFTWARE', 'SURVEY', 'DRONE'));

ALTER TABLE client_projects
    ADD COLUMN IF NOT EXISTS division TEXT NOT NULL DEFAULT 'SOFTWARE'
    CHECK (division IN ('SOFTWARE', 'SURVEY', 'DRONE'));

ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS division TEXT NOT NULL DEFAULT 'SOFTWARE'
    CHECK (division IN ('SOFTWARE', 'SURVEY', 'DRONE'));

ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS division TEXT NOT NULL DEFAULT 'SOFTWARE'
    CHECK (division IN ('SOFTWARE', 'SURVEY', 'DRONE'));

ALTER TABLE invoices
    ADD COLUMN IF NOT EXISTS division TEXT NOT NULL DEFAULT 'SOFTWARE'
    CHECK (division IN ('SOFTWARE', 'SURVEY', 'DRONE'));

-- Index for the most common filter: "show me everything for SURVEY".
CREATE INDEX IF NOT EXISTS idx_clients_division          ON clients(division);
CREATE INDEX IF NOT EXISTS idx_client_projects_division  ON client_projects(division);
CREATE INDEX IF NOT EXISTS idx_projects_division         ON projects(division);
CREATE INDEX IF NOT EXISTS idx_messages_division         ON messages(division);
CREATE INDEX IF NOT EXISTS idx_invoices_division         ON invoices(division);

-- ── 2. contact-form qualification fields ─────────────────
-- These are written by the home-page Contact component.
ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS project_type TEXT,
    ADD COLUMN IF NOT EXISTS budget       TEXT,
    ADD COLUMN IF NOT EXISTS timeline     TEXT;

-- ── 3. drop redundant `subject` column ───────────────────
-- The /contact page form (ContactPage.jsx) only sends
-- {name, email, message}. The home-page Contact component
-- sends {full_name, email, message, project_type, budget,
-- timeline} — never a `subject`. The column was always NULL
-- in practice, so we drop it. Wrapped in a DO block so the
-- migration is idempotent on databases where the column has
-- already been removed.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'messages'
          AND column_name = 'subject'
    ) THEN
        ALTER TABLE messages DROP COLUMN subject;
    END IF;
END $$;
