-- ═══════════════════════════════════════════════════════════
-- v24_pages_division.sql
-- ═══════════════════════════════════════════════════════════
-- Adds division field to pages table to support workspace-
-- specific CMS filtering. This solves the issue where
-- Software portfolio pages were showing in Survey and Drone
-- workspaces.
--
-- Existing pages without a division will be set to 'SOFTWARE'
-- as a default (backward compatibility).
--
-- Idempotent.
-- ═══════════════════════════════════════════════════════════

-- Add division column
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS division TEXT
    CHECK (division IN ('SOFTWARE', 'SURVEY', 'DRONE'));

-- Set default for existing pages (assume they're SOFTWARE content)
UPDATE pages 
SET division = 'SOFTWARE'
WHERE division IS NULL;

-- Make division NOT NULL for future inserts
ALTER TABLE pages 
ALTER COLUMN division SET NOT NULL;

-- Create index for workspace filtering
CREATE INDEX IF NOT EXISTS idx_pages_division ON pages(division);

-- Composite index for workspace + status filtering
CREATE INDEX IF NOT EXISTS idx_pages_division_status_updated_at 
    ON pages (division, status, updated_at DESC);