-- ═══════════════════════════════════════════════════════════
-- v40_manual_invoice_payment.sql
-- ═══════════════════════════════════════════════════════════
-- CRIT-4 — Manual invoice payment hardening.
--
-- Previously, the admin /api/invoices/:id/pay endpoint flipped
-- an invoice to PAID with nothing more than a single PATCH.
-- There was no requirement to provide a transaction reference,
-- attach a proof, or re-confirm 2FA for high-value invoices.
--
-- This migration adds the audit columns the new controller
-- needs, and it records a manual_payment_threshold (in the
-- smallest currency unit for the project, e.g. kobo for NGN)
-- above which the admin must produce a fresh 2FA code to
-- confirm the action. The actual threshold value is read by
-- the controller from process.env.MANUAL_PAYMENT_THRESHOLD_KOBO
-- (default 10,000,000 kobo = ₦100,000 / $200) so the
-- operational value can be tuned without a schema change.
--
-- The link to the originating payment_proofs row is the
-- evidence record: when the client uploaded a transaction
-- reference + receipt through /api/payments/public/:token/proof,
-- the admin's "mark paid" call must reference that proof.
-- ═══════════════════════════════════════════════════════════

ALTER TABLE invoices
    ADD COLUMN IF NOT EXISTS manual_payment_reference   TEXT,
    ADD COLUMN IF NOT EXISTS manual_payment_proof_id    UUID
        REFERENCES payment_proofs(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS manual_paid_via            TEXT;

-- The two columns we always populate on a manual confirmation
-- (reference text + the proof row) are indexed together so the
-- admin queue can filter by "has manual reference?".
CREATE INDEX IF NOT EXISTS idx_invoices_manual_payment_proof
    ON invoices(manual_payment_proof_id)
    WHERE manual_payment_proof_id IS NOT NULL;

-- The `manual_paid_via` column records the *reason* this
-- confirmation happened (e.g. 'BANK_TRANSFER_CONFIRMED',
-- 'WIRE_CONFIRMED', 'CRYPTO_CONFIRMED'). The legacy
-- `paid_via` column on the same table is preserved for
-- backwards compatibility — reviewProof() sets it to
-- 'BANK_TRANSFER' when confirming a bank-transfer proof.
