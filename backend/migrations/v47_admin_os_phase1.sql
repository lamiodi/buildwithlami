-- ─── v47_admin_os_phase1.sql ──────────────────────────────
-- Admin Operating System — Phase 1 (Core Productivity).
--
-- New tables:
--   tasks                — the Tonight Queue / task system (blueprint §29)
--   client_actions       — "Waiting on Client" items (blueprint §15)
--   client_onboardings   — dedicated progressive onboarding wizard (blueprint §6, §80)
--   client_contacts      — secondary client contacts (blueprint §16)
--   client_social_profiles — Instagram / TikTok / etc. handles (blueprint §16, §76)
--
-- New columns:
--   leads.next_action / next_action_due_at          (blueprint §30)
--   clients.whatsapp_number / instagram / country / city /
--     preferred_contact_method / status / source / next_action / next_action_due_at
--   client_projects.next_action / next_action_due_at
--
-- Everything is idempotent (IF NOT EXISTS) per migrations/README.md.
-- ──────────────────────────────────────────────────────────

-- ── 1. Tasks ─────────────────────────────────────────────
-- A drifted, empty `tasks` table (columns: assigned_to /
-- division / due_date) exists in the live DB from manual
-- editing outside the migration history. Drop it — but ONLY
-- when it is that legacy shape AND holds zero rows, so real
-- data can never be silently discarded. If a populated legacy
-- table ever appears, this migration intentionally fails and
-- a human decides.
DO $$
BEGIN
    IF EXISTS (
            SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'tasks'
        )
        AND EXISTS (
            SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'tasks'
               AND column_name = 'assigned_to'
        )
        AND (SELECT COUNT(*) FROM tasks) = 0
    THEN
        DROP TABLE tasks CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (title <> ''),
    description TEXT,
    owner_type TEXT NOT NULL DEFAULT 'ADMIN'
        CHECK (owner_type IN ('ADMIN', 'CLIENT', 'SYSTEM')),
    status TEXT NOT NULL DEFAULT 'TODO'
        CHECK (status IN ('TODO', 'IN_PROGRESS', 'WAITING', 'REVIEW', 'DONE', 'CANCELLED')),
    priority TEXT NOT NULL DEFAULT 'MEDIUM'
        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    estimated_minutes INT CHECK (estimated_minutes IS NULL OR estimated_minutes > 0),
    actual_minutes INT CHECK (actual_minutes IS NULL OR actual_minutes >= 0),
    due_at TIMESTAMPTZ,
    blocked BOOLEAN NOT NULL DEFAULT FALSE,
    blocked_reason TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON tasks (due_at) WHERE status NOT IN ('DONE', 'CANCELLED');
CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks (project_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_client ON tasks (client_id);

-- ── 2. Client Actions (Waiting on Client) ────────────────
CREATE TABLE IF NOT EXISTS client_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES client_projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL CHECK (title <> ''),
    description TEXT,
    type TEXT NOT NULL DEFAULT 'INFO'
        CHECK (type IN ('UPLOAD', 'APPROVAL', 'PAYMENT', 'INFO', 'REVIEW')),
    priority TEXT NOT NULL DEFAULT 'MEDIUM'
        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    status TEXT NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    due_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    completion_note TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_actions_status ON client_actions (status);
CREATE INDEX IF NOT EXISTS idx_client_actions_due_at ON client_actions (due_at) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_client_actions_client ON client_actions (client_id, status);

-- ── 3. Client Onboardings ────────────────────────────────
-- One ACTIVE onboarding per client is enforced by the partial
-- unique index below; APPROVED rows free the slot so a future
-- project can start a fresh onboarding.
CREATE TABLE IF NOT EXISTS client_onboardings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES client_projects(id) ON DELETE SET NULL,
    project_type TEXT NOT NULL DEFAULT 'BUSINESS'
        CHECK (project_type IN ('BUSINESS', 'ECOMMERCE', 'BOOKING', 'LANDING', 'PORTFOLIO', 'CUSTOM')),
    status TEXT NOT NULL DEFAULT 'NOT_STARTED'
        CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'NEEDS_CHANGES', 'APPROVED')),
    responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    completion_percent INT NOT NULL DEFAULT 0
        CHECK (completion_percent BETWEEN 0 AND 100),
    requested_changes TEXT,
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_client_onboardings_active
    ON client_onboardings (client_id)
    WHERE status IN ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'NEEDS_CHANGES');

CREATE INDEX IF NOT EXISTS idx_client_onboardings_status ON client_onboardings (status);

-- ── 4. Client Contacts (secondary people) ────────────────
CREATE TABLE IF NOT EXISTS client_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (name <> ''),
    role_title TEXT,
    email TEXT,
    whatsapp TEXT,
    phone TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_contacts_client ON client_contacts (client_id);

-- ── 5. Client Social Profiles ────────────────────────────
CREATE TABLE IF NOT EXISTS client_social_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    platform TEXT NOT NULL
        CHECK (platform IN ('INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'X', 'LINKEDIN', 'SNAPCHAT', 'YOUTUBE', 'PINTEREST', 'WHATSAPP', 'OTHER')),
    username TEXT,
    url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_social_profiles_client ON client_social_profiles (client_id);

-- ── 6. Next-action columns (blueprint §30) ───────────────
ALTER TABLE leads
    ADD COLUMN IF NOT EXISTS next_action TEXT,
    ADD COLUMN IF NOT EXISTS next_action_due_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_leads_next_action_due
    ON leads (next_action_due_at)
    WHERE stage NOT IN ('WON', 'COMPLETED', 'RETENTION');

ALTER TABLE clients
    ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
    ADD COLUMN IF NOT EXISTS instagram TEXT,
    ADD COLUMN IF NOT EXISTS country TEXT,
    ADD COLUMN IF NOT EXISTS city TEXT,
    ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT
        CHECK (preferred_contact_method IS NULL OR preferred_contact_method IN ('WHATSAPP', 'EMAIL', 'PHONE')),
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'ONBOARDING', 'MAINTENANCE', 'INACTIVE')),
    ADD COLUMN IF NOT EXISTS source TEXT,
    ADD COLUMN IF NOT EXISTS next_action TEXT,
    ADD COLUMN IF NOT EXISTS next_action_due_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_clients_whatsapp ON clients (whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_clients_instagram ON clients (instagram);

ALTER TABLE client_projects
    ADD COLUMN IF NOT EXISTS next_action TEXT,
    ADD COLUMN IF NOT EXISTS next_action_due_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_client_projects_next_action
    ON client_projects (next_action_due_at)
    WHERE status NOT IN ('ARCHIVED');
