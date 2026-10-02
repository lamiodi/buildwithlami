-- ─── v50_delivery_control.sql ─────────────────────────────
-- Admin OS Phase 3a — Delivery Control core (blueprint §35–§38):
--   approvals         — client sign-off records ("approve via the
--                       portal", never just WhatsApp text) (§35)
--   change_requests   — scoped scope-change workflow with cost /
--                       timeline impact, client approves (§37)
--   project_decisions — the decision log (§38)
--   revision rounds   — included_revision_rounds / used_revision_
--                       rounds on client_projects (§36)
-- ──────────────────────────────────────────────────────────

-- ── 1. Approvals (§35) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (title <> ''),
    description TEXT,
    item_type TEXT NOT NULL DEFAULT 'DESIGN'
        CHECK (item_type IN ('DESIGN', 'FEATURE', 'CONTENT', 'STAGE', 'OTHER')),
    version_label TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'APPROVED', 'CHANGES_REQUESTED', 'SUPERSEDED', 'CANCELLED')),
    client_comment TEXT,
    requested_at TIMESTAMPTZ,
    decided_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approvals_project ON approvals (project_id, status);
CREATE INDEX IF NOT EXISTS idx_approvals_client ON approvals (client_id, status);
-- The portal's pending list and the dashboard's "Waiting on Client".
CREATE INDEX IF NOT EXISTS idx_approvals_pending ON approvals (requested_at) WHERE status = 'PENDING';

-- ── 2. Change requests (§37) ─────────────────────────────
CREATE TABLE IF NOT EXISTS change_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (title <> ''),
    description TEXT,
    reason TEXT,
    additional_cost NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (additional_cost >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'NGN',
    additional_days INT NOT NULL DEFAULT 0 CHECK (additional_days >= 0),
    launch_impact TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'CANCELLED')),
    client_comment TEXT,
    sent_at TIMESTAMPTZ,
    decided_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_change_requests_project ON change_requests (project_id, status);
CREATE INDEX IF NOT EXISTS idx_change_requests_client ON change_requests (client_id, status);

-- ── 3. Decision log (§38) ────────────────────────────────
-- Append-only by convention: decisions are facts, never edited.
CREATE TABLE IF NOT EXISTS project_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (title <> ''),
    decision TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'MANUAL'
        CHECK (source IN ('MANUAL', 'APPROVAL', 'CHANGE_REQUEST', 'COMMUNICATION')),
    related_id UUID,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_decisions_project ON project_decisions (project_id, created_at DESC);

-- ── 4. Revision rounds (§36) ─────────────────────────────
ALTER TABLE client_projects
    ADD COLUMN IF NOT EXISTS included_revision_rounds INT NOT NULL DEFAULT 2
        CHECK (included_revision_rounds >= 0),
    ADD COLUMN IF NOT EXISTS used_revision_rounds INT NOT NULL DEFAULT 0
        CHECK (used_revision_rounds >= 0);
