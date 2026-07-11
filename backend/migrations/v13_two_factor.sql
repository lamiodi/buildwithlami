-- ═══════════════════════════════════════════════════════════
-- v13_two_factor.sql
-- ═══════════════════════════════════════════════════════════
-- Adds the 2FA columns to the `users` table for TOTP-based
-- two-factor authentication (ROADMAP.md Phase 1 task #2).
--
-- `two_factor_secret`    — base32-encoded TOTP secret. NULL
--                          when 2FA is not yet provisioned.
-- `two_factor_enabled`   — TRUE once the user has confirmed
--                          the first working code. Until then
--                          the secret exists but is not enforced.
-- `two_factor_confirmed_at` — when the user first verified
--                          a code (NULL until then). Used by
--                          the audit trail to date the rollout.
-- `two_factor_recovery_codes` — array of SHA-256 hashes for
--                          the 8 one-time recovery codes shown
--                          to the user at setup time. Each code
--                          is consumed (removed) on use.
--
-- All DDL is idempotent.
-- ═══════════════════════════════════════════════════════════

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS two_factor_secret          TEXT,
    ADD COLUMN IF NOT EXISTS two_factor_enabled         BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS two_factor_confirmed_at    TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS two_factor_recovery_codes  TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Index used by /api/auth/2fa/status (cheap, row-level lookup).
CREATE INDEX IF NOT EXISTS idx_users_two_factor_enabled ON users(two_factor_enabled);
