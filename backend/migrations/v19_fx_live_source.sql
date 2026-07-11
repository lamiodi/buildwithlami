-- ── v19: Live FX rate source tracking (Phase 11) ─────────
-- Phase 8 added static FX rates. Phase 11 adds the ability
-- to refresh them from a live API (open.er-api.com by default).
-- The columns below record where each rate came from and
-- when, so the admin can see "this rate is from the live API,
-- 2 hours ago" vs. "this rate is manual, edited 3 weeks ago".

ALTER TABLE fx_rates
    ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'MANUAL',  -- 'LIVE' | 'MANUAL' | 'SEED'
    ADD COLUMN IF NOT EXISTS fetched_at TIMESTAMPTZ;          -- NULL for manual edits, set on every live fetch

-- Backfill: any pre-existing rows are MANUAL with no fetched_at.
UPDATE fx_rates SET source = 'MANUAL' WHERE source IS NULL;
