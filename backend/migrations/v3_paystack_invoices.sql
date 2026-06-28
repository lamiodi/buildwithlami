-- Migration to add JSONB indexes and Paystack support
-- 1. Add GIN Indexes for JSONB fields
CREATE INDEX IF NOT EXISTS idx_intake_responses ON intake_submissions USING GIN (responses);
CREATE INDEX IF NOT EXISTS idx_client_projects_checklist ON client_projects USING GIN (offboarding_checklist);
CREATE INDEX IF NOT EXISTS idx_intake_templates_schema ON intake_templates USING GIN (schema);

-- 2. Add Paystack reference to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paystack_reference TEXT;
