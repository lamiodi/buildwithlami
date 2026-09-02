-- ─── v44_password_reset_tokens.sql ──────────────────────────
-- Password reset token management for both Admin Users and Clients.
--
-- Security properties:
--   - Token is stored as a SHA-256 hash (never cleartext).
--   - Single-use enforced by `used_at IS NULL` check.
--   - Short expiration (1 hour default).
--   - Scoped to user_type ('USER' or 'CLIENT').
-- ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    user_type TEXT NOT NULL DEFAULT 'USER',
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pwd_reset_token_hash 
    ON password_reset_tokens (token_hash) 
    WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_pwd_reset_email 
    ON password_reset_tokens (email);
