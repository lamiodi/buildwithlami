-- v55: Email OTP 2FA
-- Replaces TOTP (QR/authenticator) with a short-lived email OTP.
-- The hashed OTP + its expiry live in two nullable columns on users.
-- two_factor_enabled and two_factor_recovery_codes are kept for
-- backward-compat but recovery codes are no longer issued.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_otp_hash       TEXT        DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS email_otp_expires_at TIMESTAMPTZ DEFAULT NULL;
