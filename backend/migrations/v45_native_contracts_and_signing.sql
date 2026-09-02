-- ── v45: Native Contracts & Electronic Signature System ─────────
-- Replaces third-party Zoho Sign dependency with an in-house
-- cryptographic e-signature and contract management workflow.
-- ─────────────────────────────────────────────────────────────

ALTER TABLE contracts
    ADD COLUMN IF NOT EXISTS signing_token    TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS title            TEXT DEFAULT 'Service Agreement',
    ADD COLUMN IF NOT EXISTS contract_type    TEXT DEFAULT 'SOFTWARE',
    ADD COLUMN IF NOT EXISTS terms_content    TEXT,
    ADD COLUMN IF NOT EXISTS amount           NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS currency         TEXT DEFAULT 'NGN',
    ADD COLUMN IF NOT EXISTS deposit_amount    NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS duration         TEXT,
    ADD COLUMN IF NOT EXISTS expires_at       TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    ADD COLUMN IF NOT EXISTS viewed_at        TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS signer_name      TEXT,
    ADD COLUMN IF NOT EXISTS signature_data   TEXT,
    ADD COLUMN IF NOT EXISTS signer_ip        TEXT,
    ADD COLUMN IF NOT EXISTS signer_user_agent TEXT,
    ADD COLUMN IF NOT EXISTS contract_hash    TEXT,
    ADD COLUMN IF NOT EXISTS audit_trail      JSONB DEFAULT '[]'::jsonb;

-- Index for public signing token lookups
CREATE INDEX IF NOT EXISTS idx_contracts_signing_token ON contracts(signing_token);
