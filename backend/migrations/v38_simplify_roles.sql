-- ═══════════════════════════════════════════════════════════
-- v38_simplify_roles.sql
-- ═══════════════════════════════════════════════════════════
-- One-man studio simplification.
--
-- BuildWithLami is operated by a single owner. The historical
-- 10-role RBAC table (`v7_roles_rbac.sql`) and the v22 normalisation
-- pass were written for a multi-user agency that never materialised.
-- This migration:
--
--   1. Re-points every legacy admin role on `users.role` to
--      `'Owner'` so any pre-existing user row becomes the owner.
--   2. Re-points every `users.role_id` FK to the canonical
--      `'Owner'` row in the `roles` table.
--   3. Deletes the eight specialist role rows from `roles`
--      (`Administrator`, `Project Manager`, `Developer`,
--      `Survey Manager`, `Surveyor`, `Drone Manager`,
--      `Drone Pilot`, `Finance`, `Staff`) — leaving only
--      `Owner` and `Client`. Anything pointing at those
--      deleted rows has been re-pointed in step 2.
--   4. Re-runs the v22 admin-role casing normaliser so any
--      pre-v22 upper-case 'ADMIN' / 'OWNER' legacy text is now
--      `'Owner'`.
--
-- The runtime (`config/roles.js`) and every route file have
-- already been updated to only ever check for `'Owner'` (admin)
-- and `'Client'` / `'CLIENT_PORTAL'` (portal). This migration
-- just brings the data into agreement so the legacy `role`
-- TEXT column and the `roles` lookup table no longer carry
-- stale specialist names.
--
-- All DDL is idempotent — safe to re-run.
-- ═══════════════════════════════════════════════════════════

-- ── 1. normalise admin role text to 'Owner' ──────────────
-- Anything that *was* an admin-level identity (Owner, Administrator,
-- Finance, Project Manager, Developer, Survey Manager, Surveyor,
-- Drone Manager, Drone Pilot, Staff, or any legacy upper-case
-- variant of those) becomes 'Owner'. Client-shaped values
-- ('Client', 'CLIENT_PORTAL', or their lower-case legacy spellings)
-- stay client-shaped.
UPDATE users
SET    role = 'Owner'
WHERE  lower(role) IN (
           'owner', 'admin', 'administrator', 'superadmin', 'admin2',
           'finance', 'project_manager', 'pm', 'developer',
           'survey_manager', 'surveyor', 'drone_manager', 'drone_pilot',
           'staff'
       )
  AND  role IS DISTINCT FROM 'Owner';

-- ── 2. re-point users.role_id → Owner ────────────────────
-- NULL out any FK that points at a row we're about to delete,
-- then rewrite it to the Owner row's id. ON DELETE SET NULL on
-- users.role_id means this is defensive — but the explicit
-- UPDATE keeps the audit trail clean.
UPDATE users u
SET    role_id = r.id
FROM   roles r
WHERE  r.name = 'Owner'
  AND  u.role_id IS DISTINCT FROM r.id
  AND  lower(coalesce(u.role, '')) = 'owner';

-- ── 3. delete the eight specialist role rows ────────────
-- Anything still pointing at one of these via users.role_id
-- was re-pointed in step 2. We delete the rows themselves
-- because the runtime no longer recognises them.
DELETE FROM roles
WHERE  name IN (
    'Administrator',
    'Project Manager',
    'Developer',
    'Survey Manager',
    'Surveyor',
    'Drone Manager',
    'Drone Pilot',
    'Finance',
    'Staff'
);
