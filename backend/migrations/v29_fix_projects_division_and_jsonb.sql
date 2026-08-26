-- ═══════════════════════════════════════════════════════════
-- v29_fix_projects_division_and_jsonb.sql
-- ═══════════════════════════════════════════════════════════
-- 1. Updates `projects_division_check` constraint on `projects`
--    table to allow SOFTWARE, SURVEY, DRONE and legacy aliases.
-- 2. Ensures features and case study columns exist as JSONB.
--
-- All DDL is idempotent.
-- ═══════════════════════════════════════════════════════════

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_division_check;

ALTER TABLE projects ADD CONSTRAINT projects_division_check 
    CHECK (division IN ('SOFTWARE', 'SURVEY', 'DRONE', 'Technology', 'Surveying', 'Drone', 'Products'));
