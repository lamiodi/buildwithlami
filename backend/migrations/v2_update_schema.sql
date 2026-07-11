-- ═══════════════════════════════════════════════════════════
-- v2_update_schema.sql — PLACEHOLDER
-- ═══════════════════════════════════════════════════════════
-- This file is kept for backwards compatibility with
-- `runUpdateSchema.js`, which references it by name. The
-- original v2 work is now part of `createMissingTables.sql`
-- (run during `npm run db:init`) and the new migrations in
-- this folder (v5+).
--
-- This is a no-op. Do not delete — the migration runner will
-- throw if the file is missing.
-- ═══════════════════════════════════════════════════════════

SELECT 'v2_update_schema: no-op (see createMissingTables.sql + v5+ migrations)' AS note;
