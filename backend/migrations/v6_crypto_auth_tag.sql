-- Migration: AES-256-GCM support
-- Adds the auth_tag column required by the new GCM-mode cipher.
-- Old rows (encrypted with CBC) cannot be decrypted by the new code; they will
-- surface as "authTag is required" errors and should be re-entered by the user.
ALTER TABLE project_secrets ADD COLUMN IF NOT EXISTS auth_tag TEXT;
