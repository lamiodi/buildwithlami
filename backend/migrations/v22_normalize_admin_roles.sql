-- ═══════════════════════════════════════════════════════════
-- v22_normalize_admin_roles.sql
-- ═══════════════════════════════════════════════════════════
-- The original seedAdmin script (v2_update_schema era) wrote
-- the role as uppercase 'ADMIN'. Phase 1's RBAC migration
-- (v7_roles_rbac.sql) switched every requireRole() call to the
-- titlecase names ('Owner', 'Administrator'), and authMiddleware
-- has a normaliseRole() helper that maps both casings.
--
-- In practice, the helper is brittle when the role string is
-- missing from the known list (it falls through unchanged), and
-- any admin whose DB row still reads 'ADMIN' / 'OWNER' will hit
-- 403 on every role-gated endpoint (e.g. /api/dashboard,
-- /api/notifications, /api/admin/*).
--
-- This migration normalises every legacy casing to the new
-- canonical name in one pass. Idempotent — re-running on an
-- already-migrated DB is a no-op because the WHERE clause won't
-- match any rows.
-- ═══════════════════════════════════════════════════════════

UPDATE users SET role = 'Owner' WHERE role IN ('ADMIN', 'OWNER', 'admin', 'owner');
UPDATE users SET role = 'Administrator' WHERE role IN ('ADMIN2', 'admin2', 'administrator');
UPDATE users SET role = 'Project Manager' WHERE role IN ('PROJECT_MANAGER', 'project_manager', 'pm', 'PM');
UPDATE users SET role = 'Survey Manager' WHERE role IN ('SURVEY_MANAGER', 'survey_manager');
UPDATE users SET role = 'Drone Manager' WHERE role IN ('DRONE_MANAGER', 'drone_manager');
UPDATE users SET role = 'Finance' WHERE role IN ('FINANCE', 'finance');
