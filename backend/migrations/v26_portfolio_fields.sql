-- ═══════════════════════════════════════════════════════════
-- v26_portfolio_fields.sql
-- ═══════════════════════════════════════════════════════════
-- Adds portfolio-publish fields to client_projects so that
-- the Survey and Drone divisions (and any future division)
-- can publish showcase items from /admin/portfolio and have
-- them appear on /survey and /drone (and their /:id detail
-- pages).
--
-- Fields added:
--   cover_image        — hero image for the public card + detail page
--   summary            — 1-2 sentence tagline shown on the card
--   location           — site / area name (Survey, Drone)
--   client_name        — display name (Survey/Drone don't always have
--                         a registered client record; nullable but
--                         often useful)
--   is_portfolio       — true → surfaced on the public portfolio
--   display_order      — ordering inside a division
--   tags               — NCAA category / surface type (e.g. array
--                         like {survey,drone,software})
--   published_at       — when the row was first marked portfolio
--
-- All DDL is idempotent.
-- ═══════════════════════════════════════════════════════════

ALTER TABLE client_projects
    ADD COLUMN IF NOT EXISTS cover_image   TEXT,
    ADD COLUMN IF NOT EXISTS summary       TEXT,
    ADD COLUMN IF NOT EXISTS location      TEXT,
    ADD COLUMN IF NOT EXISTS client_name   TEXT,
    ADD COLUMN IF NOT EXISTS is_portfolio  BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tags          TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    ADD COLUMN IF NOT EXISTS published_at  TIMESTAMPTZ;

-- Index that powers the public listing: WHERE division = $1 AND
-- is_portfolio = true ORDER BY display_order ASC, published_at DESC
CREATE INDEX IF NOT EXISTS idx_client_projects_portfolio
    ON client_projects (division, is_portfolio, display_order, published_at DESC)
    WHERE is_portfolio = true;
