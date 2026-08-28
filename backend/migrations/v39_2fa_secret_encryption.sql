-- ═══════════════════════════════════════════════════════════
-- v39_2fa_secret_encryption.sql
-- ═══════════════════════════════════════════════════════════
-- Production hardening for 2FA at-rest storage and project
-- tracking. Both changes are idempotent and intentionally
-- backward compatible — existing rows continue to work.
--
-- 1) `users.two_factor_secret` is renamed to
--    `users.totp_secret_encrypted` to make the contract
--    explicit: the column is now expected to hold an
--    AES-256-GCM envelope (see utils/twoFactorCrypto.js),
--    not a raw base32 secret. A back-compat view over the
--    original column name keeps every existing query path
--    working while data is being re-encrypted by the
--    one-time migration in src/scripts/rotate2faSecrets.js.
--
-- 2) `client_projects.tracking_id` is added with a UNIQUE
--    constraint so the public tracking page can resolve a
--    project by its short, non-enumerable identifier.
--    The column is nullable so legacy rows remain valid
--    until the API backfills them.
-- ═══════════════════════════════════════════════════════════

-- ── 1) 2FA secret column rename + back-compat view ──────
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'two_factor_secret'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'totp_secret_encrypted'
    ) THEN
        ALTER TABLE users RENAME COLUMN two_factor_secret TO totp_secret_encrypted;
    END IF;
END $$;

-- Back-compat view so legacy code (and the v13 docs) keep
-- working while the re-encryption script runs.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'users_legacy_2fa') THEN
        EXECUTE $v$
            CREATE VIEW users_legacy_2fa AS
            SELECT id, totp_secret_encrypted AS two_factor_secret
            FROM users
        $v$;
    END IF;
END $$;

-- ── 2) client_projects.tracking_id ─────────────────────
ALTER TABLE client_projects
    ADD COLUMN IF NOT EXISTS tracking_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_client_projects_tracking_id
    ON client_projects(tracking_id)
    WHERE tracking_id IS NOT NULL;
