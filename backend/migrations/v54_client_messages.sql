-- ─── v54_client_messages.sql ──────────────────────────────
-- Real portal messaging (replaces the simulated ClientMessages page).
-- Clients post subject+body from /portal/messages; the item appears in
-- the unified admin inbox (kind = 'portal'), the owner is notified, and
-- the admin reply is stored on the row and emailed back to the client.
-- ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS client_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES client_projects(id) ON DELETE SET NULL,
    subject TEXT NOT NULL CHECK (subject <> ''),
    body TEXT NOT NULL CHECK (body <> ''),
    admin_reply TEXT,
    replied_at TIMESTAMPTZ,
    replied_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_messages_client_created
    ON client_messages (client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_messages_unread
    ON client_messages (created_at DESC) WHERE is_read = FALSE;
