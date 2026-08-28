-- ═══════════════════════════════════════════════════════════
-- v37_login_lockout.sql
-- ═══════════════════════════════════════════════════════════
-- Account-level brute-force protection for the admin login.
-- After MAX_FAILED_LOGINS failed attempts within the
-- LOCKOUT_WINDOW_MINUTES window, the account is locked until
-- LOCKOUT_DURATION_MINUTES have elapsed. The auth controller
-- resets the counters on a successful login. Idempotent.
-- ═══════════════════════════════════════════════════════════

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS failed_login_count INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS first_failed_at    TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS locked_until        TIMESTAMPTZ;
