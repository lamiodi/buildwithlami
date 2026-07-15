-- ═══════════════════════════════════════════════════════════
-- BuildWithLami (buildwithlami.com) — Missing Tables Migration
-- Creates all tables referenced by the application code
-- that are not in init.sql
-- ═══════════════════════════════════════════════════════════

-- 1. Clients
CREATE TABLE IF NOT EXISTS clients (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    TEXT NOT NULL,
    primary_contact_email   TEXT NOT NULL,
    billing_email           TEXT,
    stripe_customer_id      TEXT,
    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Client Projects
-- Note: `last_notified_at` was removed in Phase 0 — the
-- `cronService.js` keeps dedupe state in a process-local Map,
-- not in this column. The `v6_offboarding.sql` migration
-- drops the column from legacy databases.
CREATE TABLE IF NOT EXISTS client_projects (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id               UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_name            TEXT NOT NULL,
    tracking_id             TEXT UNIQUE,
    progress                INTEGER NOT NULL DEFAULT 0,
    status                  TEXT NOT NULL DEFAULT 'PLANNING'
                            CHECK (status IN ('PLANNING', 'IN_PROGRESS', 'REVIEW', 'LAUNCHED', 'MAINTENANCE', 'ARCHIVED')),
    notes                   TEXT,
    domain_name             TEXT,
    domain_expiration       DATE,
    amount_due              NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_type            TEXT NOT NULL DEFAULT 'ONE_TIME'
                            CHECK (payment_type IN ('ONE_TIME', 'MONTHLY')),
    monthly_fee             NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_status          TEXT NOT NULL DEFAULT 'PENDING'
                            CHECK (payment_status IN ('PENDING', 'PARTIAL', 'PAID')),
    stages                  JSONB NOT NULL DEFAULT '[]'::jsonb,
    intake_form_id          UUID,
    intake_completed        BOOLEAN NOT NULL DEFAULT false,
    assets_url              TEXT,
    training_video_url      TEXT,
    maintenance_plan_url    TEXT,
    offboarding_status      TEXT NOT NULL DEFAULT 'NOT_STARTED',
    offboarding_checklist   JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id           UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_id          UUID NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
    amount              NUMERIC(12,2) NOT NULL,
    description         TEXT,
    status              TEXT NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED')),
    due_date            DATE,
    payment_url         TEXT,
    paystack_reference  TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Intake Templates
CREATE TABLE IF NOT EXISTS intake_templates (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    description TEXT,
    schema      JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Intake Submissions
CREATE TABLE IF NOT EXISTS intake_submissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL UNIQUE REFERENCES client_projects(id) ON DELETE CASCADE,
    responses       JSONB NOT NULL DEFAULT '{}'::jsonb,
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Project Secrets (encrypted credentials)
CREATE TABLE IF NOT EXISTS project_secrets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_id      UUID REFERENCES client_projects(id) ON DELETE CASCADE,
    key_name        TEXT NOT NULL,
    encrypted_value TEXT NOT NULL,
    iv              TEXT NOT NULL,
    auth_tag        TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Project Feedback
CREATE TABLE IF NOT EXISTS project_feedback (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
    stage_index     INTEGER NOT NULL DEFAULT 0,
    client_comment  TEXT NOT NULL,
    admin_reply     TEXT,
    status          TEXT NOT NULL DEFAULT 'OPEN'
                    CHECK (status IN ('OPEN', 'RESOLVED')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_client_projects_client_id ON client_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_client_projects_tracking_id ON client_projects(tracking_id);
CREATE INDEX IF NOT EXISTS idx_client_projects_status ON client_projects(status);
CREATE INDEX IF NOT EXISTS idx_client_projects_domain_expiration ON client_projects(domain_expiration);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_intake_submissions_project_id ON intake_submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_secrets_client_id ON project_secrets(client_id);
CREATE INDEX IF NOT EXISTS idx_project_secrets_project_id ON project_secrets(project_id);
CREATE INDEX IF NOT EXISTS idx_project_feedback_project_id ON project_feedback(project_id);
CREATE INDEX IF NOT EXISTS idx_project_feedback_status ON project_feedback(status);
