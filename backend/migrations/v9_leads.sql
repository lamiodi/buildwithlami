-- ═══════════════════════════════════════════════════════════
-- v9_leads.sql
-- ═══════════════════════════════════════════════════════════
-- Creates the `leads` table for the 8-stage CRM pipeline
-- (UPDATE.md §8). The 8 stages are:
--   LEAD → QUALIFIED → PROPOSAL → NEGOTIATION → WON
--   → PROJECT → COMPLETED → RETENTION
--
-- `converted_client_id` is FK-linked to `clients.id` and is
-- populated by the `POST /api/crm/leads/:id/convert` route
-- in Phase 3.
--
-- All DDL is idempotent.
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS leads (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name            TEXT NOT NULL,
    email                TEXT NOT NULL,
    phone                TEXT,
    division             TEXT NOT NULL
                         CHECK (division IN ('SOFTWARE', 'SURVEY', 'DRONE')),
    stage                TEXT NOT NULL DEFAULT 'LEAD'
                         CHECK (stage IN (
                             'LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION',
                             'WON', 'PROJECT', 'COMPLETED', 'RETENTION'
                         )),
    source               TEXT,
    notes                TEXT,
    converted_client_id  UUID REFERENCES clients(id) ON DELETE SET NULL,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_division ON leads(division);
CREATE INDEX IF NOT EXISTS idx_leads_stage    ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_email    ON leads(email);
