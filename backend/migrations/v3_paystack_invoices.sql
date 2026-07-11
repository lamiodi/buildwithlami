-- ═══════════════════════════════════════════════════════════
-- v3_paystack_invoices.sql — PLACEHOLDER
-- ═══════════════════════════════════════════════════════════
-- This file is kept for backwards compatibility with
-- `runUpdateSchema.js`, which references it by name. The
-- original v3 work (Paystack invoice columns) is already in
-- `createMissingTables.sql` — the `invoices` table there
-- includes `payment_url` and `paystack_reference`.
--
-- This is a no-op. Do not delete — the migration runner will
-- throw if the file is missing.
-- ═══════════════════════════════════════════════════════════

SELECT 'v3_paystack_invoices: no-op (see createMissingTables.sql invoices table)' AS note;
