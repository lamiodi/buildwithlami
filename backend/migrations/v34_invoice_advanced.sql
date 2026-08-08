-- ═══════════════════════════════════════════════════════════
-- v34_invoice_advanced.sql
-- ═══════════════════════════════════════════════════════════
-- Adds advanced fields to invoices for Phase 4 (Invoice Generator Polish).
-- ═══════════════════════════════════════════════════════════

ALTER TABLE invoices
    ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS deposit_required NUMERIC(12, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS line_items JSONB DEFAULT '[]'::jsonb;
