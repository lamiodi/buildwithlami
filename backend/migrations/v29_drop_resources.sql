-- ═══════════════════════════════════════════════════════════
-- v29_drop_resources.sql
-- ═══════════════════════════════════════════════════════════
-- Drops the `resources` table. The knowledge-base feature
-- was added in v12 and grew a few extra columns in v28.
-- It has been removed end-to-end: no controller, no route,
-- no admin page, no public page, and no nav links. Nothing
-- in the app still reads this table, so dropping it is safe.
--
-- Idempotent.
-- ═══════════════════════════════════════════════════════════

DROP TABLE IF EXISTS resources CASCADE;
