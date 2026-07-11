-- ═══════════════════════════════════════════════════════════
-- v21_pages_perf_index.sql
-- ═══════════════════════════════════════════════════════════
-- The public GET /api/cms/pages endpoint queries
--   WHERE status = 'PUBLISHED' ORDER BY updated_at DESC
-- (and the slug lookup, which uses (slug, status), is also a
-- candidate for a slightly better index — the existing
-- single-column idx_pages_slug still serves it via index scan).
--
-- v12 created single-column indexes on (slug) and (status).
-- Postgres can combine them, but a composite (status, updated_at
-- DESC) matches the public list query exactly and lets it
-- skip a separate sort. Cheap to add, no downsides.
--
-- Idempotent.
-- ═══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_pages_status_updated_at
    ON pages (status, updated_at DESC);
