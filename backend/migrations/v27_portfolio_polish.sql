-- ═══════════════════════════════════════════════════════════
-- v27_portfolio_polish.sql
-- ═══════════════════════════════════════════════════════════
-- Extends the `projects` table (used by /admin/portfolio) with
-- the metadata the Survey and Drone divisions need on their
-- detail pages:
--   location        — site / area (Survey, Drone)
--   client_name     — display name (Survey/Drone don't always
--                     have a registered client record)
--   display_order   — ordering inside a division
--   tags            — NCAA category / surface type
--   published_at    — when the row was first published
--
-- These are nullable so existing software projects are
-- untouched.
--
-- Idempotent.
-- ═══════════════════════════════════════════════════════════

ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS location      TEXT,
    ADD COLUMN IF NOT EXISTS client_name   TEXT,
    ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tags          TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    ADD COLUMN IF NOT EXISTS published_at  TIMESTAMPTZ;

-- Composite index for the public division listing.
CREATE INDEX IF NOT EXISTS idx_projects_division_status
    ON projects (division, status, display_order, created_at DESC);
