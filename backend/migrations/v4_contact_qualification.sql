-- ═══════════════════════════════════════════════════════════
-- v4_contact_qualification.sql — PLACEHOLDER
-- ═══════════════════════════════════════════════════════════
-- This file is kept for backwards compatibility with
-- `runUpdateSchema.js`, which references it by name. The
-- original v4 work (contact form qualification fields) is
-- now applied in `v5_division.sql` — that migration adds
-- the `project_type`, `budget`, and `timeline` columns to
-- the `messages` table that the home-page Contact component
-- writes.
--
-- This is a no-op. Do not delete — the migration runner will
-- throw if the file is missing.
-- ═══════════════════════════════════════════════════════════

SELECT 'v4_contact_qualification: no-op (see v5_division.sql for messages columns)' AS note;
