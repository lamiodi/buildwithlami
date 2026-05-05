-- migrations/v2_leads_and_fixes.sql

-- 1. Updates to clients table (payment readiness)
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- 2. Updates to invoices table (payment integration)
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT;

ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS payment_url TEXT;

-- update the status constraint on invoices to include 'DRAFT'
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check CHECK (status IN ('DRAFT', 'PENDING', 'PAID', 'OVERDUE'));

-- Note: The leads table and magic_link_expires changes were already present in init.sql,
-- which was likely pre-updated for Phase 1.5, but these payment columns were missing.
