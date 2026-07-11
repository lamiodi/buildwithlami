-- ═══════════════════════════════════════════════════════════
-- v6_offboarding.sql
-- ═══════════════════════════════════════════════════════════
-- 1. Adds offboarding columns to `client_projects`. These
--    back the "onboarding checklist" auto-generator in §16.4
--    of UPDATE.md and the `/track/:id` client view.
--
-- 2. Drops the redundant `last_notified_at` column. The
--    `cronService.js` dedupe comment in the source code
--    referenced this column, but the actual SELECT/UPDATE
--    queries use an in-process `Map` keyed by
--    `${projectId}:${days}` instead — no code reads or writes
--    the column. See migrations/README.md, "Redundant Items
--    Removed".
--
-- All DDL is idempotent.
-- ═══════════════════════════════════════════════════════════

-- ── 1. offboarding columns ────────────────────────────────
ALTER TABLE client_projects
    ADD COLUMN IF NOT EXISTS offboarding_status    TEXT   NOT NULL DEFAULT 'NOT_STARTED',
    ADD COLUMN IF NOT EXISTS offboarding_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS payment_status        TEXT   NOT NULL DEFAULT 'PENDING'
        CHECK (payment_status IN ('PENDING', 'PARTIAL', 'PAID'));

-- Backfill the payment_status CHECK constraint on legacy DBs
-- that pre-date the constraint (the original
-- createMissingTables.sql defined the column without a CHECK).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.check_constraints
        WHERE constraint_name = 'client_projects_payment_status_check'
    ) THEN
        ALTER TABLE client_projects
            ADD CONSTRAINT client_projects_payment_status_check
            CHECK (payment_status IN ('PENDING', 'PARTIAL', 'PAID'));
    END IF;
END $$;

-- ── 2. drop redundant `last_notified_at` ─────────────────
-- Fresh DBs never have this column. Legacy DBs (created via
-- the old createMissingTables.sql) do — drop them so they
-- match the new schema.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'client_projects'
          AND column_name = 'last_notified_at'
    ) THEN
        ALTER TABLE client_projects DROP COLUMN last_notified_at;
    END IF;
END $$;
