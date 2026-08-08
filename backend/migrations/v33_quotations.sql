-- ═══════════════════════════════════════════════════════════
-- v33_quotations.sql
-- ═══════════════════════════════════════════════════════════
-- Adds the `quotations` table to support Phase 3:
-- The Rigid Quotation Workflow (1-click pipeline).
--
-- Lead -> Quotation -> Contract -> Invoice -> Project
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS quotations (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id              UUID REFERENCES leads(id) ON DELETE SET NULL,
    client_id            UUID REFERENCES clients(id) ON DELETE CASCADE,
    title                TEXT NOT NULL,
    amount               NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status               TEXT NOT NULL DEFAULT 'DRAFT'
                         CHECK (status IN ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'CONVERTED')),
    line_items           JSONB DEFAULT '[]'::jsonb,
    notes                TEXT,
    valid_until          TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotations_lead_id ON quotations(lead_id);
CREATE INDEX IF NOT EXISTS idx_quotations_client_id ON quotations(client_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);

-- Add a quotation_id, value, and contract_type to contracts if it doesn't exist
ALTER TABLE contracts
    ADD COLUMN IF NOT EXISTS quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS value NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'PROJECT_AGREEMENT';

-- Add a contract_id to invoices if it doesn't exist
ALTER TABLE invoices
    ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL;
