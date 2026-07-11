-- ═══════════════════════════════════════════════════════════
-- v7_roles_rbac.sql
-- ═══════════════════════════════════════════════════════════
-- Creates the `roles` table and seeds the 10 RBAC roles
-- defined in UPDATE.md §11.1. Also links `users.role_id` to
-- `roles.id` for FK-driven role checks (and backfills the
-- Owner role onto the CEO account).
--
-- The original `users` table has a TEXT `role` column that
-- was populated with `'OWNER'` by the legacy seed scripts.
-- We keep that TEXT column for now (cheap, no breaking
-- change) and add `role_id` next to it. Phase 1 will refactor
-- `authMiddleware.js` to read from the TEXT column first,
-- then fall back to the FK.
--
-- All DDL is idempotent.
-- ═══════════════════════════════════════════════════════════

-- ── 1. roles table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
    id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL
);

-- ── 2. seed the 10 RBAC roles ────────────────────────────
INSERT INTO roles (name) VALUES
    ('Owner'),
    ('Administrator'),
    ('Project Manager'),
    ('Developer'),
    ('Survey Manager'),
    ('Surveyor'),
    ('Drone Manager'),
    ('Drone Pilot'),
    ('Finance'),
    ('Client')
ON CONFLICT (name) DO NOTHING;

-- ── 3. link users → roles ─────────────────────────────────
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);

-- Backfill the FK for the CEO account. We set it by
-- matching the role name on the TEXT column (legacy 'OWNER'
-- or the newer 'Owner' string both resolve to the Owner
-- role row).
UPDATE users u
SET    role_id = r.id
FROM   roles r
WHERE  r.name = 'Owner'
  AND  u.role_id IS NULL
  AND  lower(u.role) IN ('owner', 'admin', 'administrator', 'superadmin');

-- ── 4. normalise the CEO's TEXT role to 'Owner' ───────────
-- The legacy seed script wrote 'OWNER' (uppercase). The
-- RBAC roles table uses 'Owner' (titlecase). Normalise so
-- the two stay in sync.
UPDATE users
SET    role = 'Owner'
WHERE  email = 'EUGENEODIBENUAH@GMAIL.COM'
  AND  role IS DISTINCT FROM 'Owner';
