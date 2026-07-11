-- ── v18: International payment workflow (Phase 10) ──────
-- Adds the database scaffolding for branded multi-currency
-- payment pages with bank-transfer (Grey) support and a
-- manual proof-of-payment review queue.
--
-- Three additions:
--   1. invoices.pay_token       — secure UUID for the public
--                                  /pay/:token URL
--   2. bank_accounts             — Grey / Paystack settlement
--                                  accounts the admin maintains
--   3. payment_proofs            — client-submitted transaction
--                                  reference + optional file

-- 1. Secure token for the public payment page. The route is
--    unauthenticated by design (the client gets the link in
--    the invoice email). A 128-bit random token is enough to
--    keep the link unguessable in practice.
ALTER TABLE invoices
    ADD COLUMN IF NOT EXISTS pay_token UUID DEFAULT gen_random_uuid() UNIQUE,
    ADD COLUMN IF NOT EXISTS paid_via TEXT;  -- 'PAYSTACK' | 'BANK_TRANSFER' | 'CARD' | etc.

-- Backfill any existing invoices that were created before this
-- migration ran so /pay/:token works for them too.
UPDATE invoices
   SET pay_token = gen_random_uuid()
 WHERE pay_token IS NULL;

-- Index for the public route lookup. Token-based lookup is
-- the only access path, so this is the table's hot path.
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_pay_token ON invoices(pay_token);

-- 2. Bank accounts the admin maintains. One row per (currency,
-- provider) — typically you'll have NGN (Paystack settlement
-- or a local bank), USD (Grey US account), GBP (Grey UK
-- account). The PaymentPage reads only rows where is_active=true.
CREATE TABLE IF NOT EXISTS bank_accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency        CHAR(3) NOT NULL,            -- 'NGN' | 'USD' | 'GBP' | ...
    provider        TEXT NOT NULL DEFAULT 'GREY', -- 'GREY' | 'PAYSTACK' | 'LOCAL'
    account_name    TEXT NOT NULL,
    bank_name       TEXT NOT NULL,
    account_number  TEXT NOT NULL,
    routing_code    TEXT,                         -- US ABA / SWIFT for international
    sort_code       TEXT,                         -- UK sort code (XX-XX-XX)
    swift_code      TEXT,
    iban            TEXT,
    reference_hint  TEXT,                         -- e.g. "Use your invoice number as the reference"
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (currency, provider)
);

-- 3. Payment proofs — one row per submission. The client can
-- submit a transaction reference and optionally attach a
-- screenshot/PDF. The admin reviews and CONFIRM or REJECT.
CREATE TABLE IF NOT EXISTS payment_proofs (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id            UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    submitted_email       TEXT,                   -- captured in case the client isn't logged in
    transaction_reference TEXT NOT NULL,
    amount_paid           NUMERIC(12,2) NOT NULL,
    currency              CHAR(3) NOT NULL,
    proof_file_url        TEXT,                   -- Cloudinary URL (or data: URI fallback)
    proof_file_filename   TEXT,
    proof_file_size_bytes INTEGER,
    status                TEXT NOT NULL DEFAULT 'PENDING'
                          CHECK (status IN ('PENDING', 'CONFIRMED', 'REJECTED')),
    admin_notes           TEXT,
    reviewed_by           UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at           TIMESTAMPTZ,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for the admin queue (status-filtered) and for the
-- invoice detail view.
CREATE INDEX IF NOT EXISTS idx_payment_proofs_invoice ON payment_proofs(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_status ON payment_proofs(status, created_at DESC);

-- 4. The trigger that updates invoices.updated_at when a
-- payment_proofs row is changed. Mirrors the pattern used
-- elsewhere in the schema.
CREATE OR REPLACE FUNCTION trg_touch_invoice_on_proof()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE invoices SET updated_at = NOW() WHERE id = NEW.invoice_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS touch_invoice_on_proof ON payment_proofs;
CREATE TRIGGER touch_invoice_on_proof
    AFTER INSERT OR UPDATE ON payment_proofs
    FOR EACH ROW
    EXECUTE FUNCTION trg_touch_invoice_on_proof();

-- ── 5. Seed the admin's actual bank accounts ────────────
-- These are the CEO's real Grey (grey.co) settlement accounts.
-- They are intentionally NOT published on the public site —
-- the PaymentPage is token-protected and only reveals them
-- after the client picks a currency. The admin can edit or
-- deactivate any row from AdminSettings.
--
-- All amounts the admin edits here take effect on the next
-- page load (no redeploy required). If a bank ever changes,
-- update the row + rotate the live account with Grey.
INSERT INTO bank_accounts (
    currency, provider, account_name, bank_name, account_number,
    routing_code, sort_code, swift_code, iban, reference_hint, is_active
) VALUES
    -- USD — Lead Bank via Grey
    (
        'USD', 'GREY', 'Eugene Odibenuah', 'Lead',
        '210837680768', '101019644', NULL, NULL, NULL,
        'Use your invoice number (e.g. INV-2026-001) as the payment reference.',
        TRUE
    ),
    -- GBP — Clear Junction Limited via Grey
    (
        'GBP', 'GREY', 'Eugene Odibenuah', 'Clear Junction Limited',
        '43014342', NULL, '04-13-07', 'CLJUGB21XXX', 'GB55CLJU04130743014342',
        'Use your invoice number (e.g. INV-2026-001) as the payment reference.',
        TRUE
    )
ON CONFLICT (currency, provider) DO NOTHING;
