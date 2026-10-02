-- ═══════════════════════════════════════════════════════════
-- v51_offboarding_retention.sql
-- ═══════════════════════════════════════════════════════════
-- Admin OS Phase 5 — Offboarding / Retention (blueprint
-- §47 Renewals, §48 Maintenance, §49 Website Monitoring,
-- §51–§52 Handover, §53 Post-Launch, §54 Testimonials, §55 Referrals).
--
--   maintenance_plans          — dedicated maintenance records (§48);
--                                maintenance clients are NOT archived projects
--   renewals                   — one reminder surface for domain / hosting /
--                                email / maintenance / SaaS renewals (§47);
--                                a maintenance plan upserts its linked row
--   testimonials               — consented client quotes; publishable to the
--                                public site only with permission (§54)
--   referrals                  — /ref/:code tracking with reward state (§55)
--   site_monitors + events     — lightweight uptime/SSL monitoring (§49)
--   tasks.dedup_key            — idempotent post-launch task creation (§89)
--   client_projects.offboarding_{started,completed}_at — handover timestamps
--
-- All DDL is idempotent (the migration runner re-executes files).
-- ═══════════════════════════════════════════════════════════

-- ── 1. Maintenance plans (§48) ───────────────────────────
CREATE TABLE IF NOT EXISTS maintenance_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES client_projects(id) ON DELETE SET NULL,
    plan_name TEXT NOT NULL CHECK (plan_name <> ''),
    billing_cycle TEXT NOT NULL DEFAULT 'MONTHLY'
        CHECK (billing_cycle IN ('MONTHLY', 'QUARTERLY', 'ANNUAL')),
    amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'NGN',
    start_date DATE,
    renewal_date DATE,
    included_hours NUMERIC(6,1) NOT NULL DEFAULT 0 CHECK (included_hours >= 0),
    used_hours NUMERIC(6,1) NOT NULL DEFAULT 0 CHECK (used_hours >= 0),
    site_url TEXT,
    sla_notes TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_plans_client ON maintenance_plans (client_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_plans_active ON maintenance_plans (active) WHERE active;

-- ── 2. Renewals (§47) ────────────────────────────────────
-- One row per renewable service. The cron alerts at T-60/30/14/7
-- and on OVERDUE (deduped via notification_dedup, same as the
-- legacy domain_expiration checker).
CREATE TABLE IF NOT EXISTS renewals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES client_projects(id) ON DELETE SET NULL,
    maintenance_plan_id UUID REFERENCES maintenance_plans(id) ON DELETE SET NULL,
    service TEXT NOT NULL
        CHECK (service IN ('DOMAIN', 'HOSTING', 'MAINTENANCE', 'EMAIL', 'SSL', 'SAAS', 'SUPPORT', 'OTHER')),
    label TEXT NOT NULL CHECK (label <> ''),
    renewal_date DATE NOT NULL,
    amount NUMERIC(12,2) CHECK (amount IS NULL OR amount >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'NGN',
    reminder_days INT NOT NULL DEFAULT 30 CHECK (reminder_days BETWEEN 1 AND 120),
    status TEXT NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'RENEWED', 'CANCELLED', 'LAPSED')),
    last_renewed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_renewals_date_active ON renewals (renewal_date) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_renewals_client ON renewals (client_id);

-- A maintenance plan owns at most one linked renewal row —
-- makes the plan→renewal sync upsert idempotent (§89).
CREATE UNIQUE INDEX IF NOT EXISTS uq_renewals_maintenance_plan
    ON renewals (maintenance_plan_id)
    WHERE maintenance_plan_id IS NOT NULL;

-- ── 3. Testimonials (§54) ────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES client_projects(id) ON DELETE SET NULL,
    rating INT CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
    testimonial TEXT NOT NULL CHECK (LENGTH(TRIM(testimonial)) > 0),
    client_name TEXT NOT NULL CHECK (client_name <> ''),
    company TEXT,
    role TEXT,
    permission_to_publish BOOLEAN NOT NULL DEFAULT FALSE,
    avatar_url TEXT,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_published ON testimonials (published_at DESC) WHERE published;

-- ── 4. Referrals (§55) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    code TEXT NOT NULL UNIQUE,
    referred_name TEXT,
    referred_business TEXT,
    referred_email TEXT,
    status TEXT NOT NULL DEFAULT 'NEW'
        CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST')),
    project_id UUID REFERENCES client_projects(id) ON DELETE SET NULL,
    revenue NUMERIC(12,2) CHECK (revenue IS NULL OR revenue >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'NGN',
    reward_description TEXT,
    reward_status TEXT NOT NULL DEFAULT 'NONE'
        CHECK (reward_status IN ('NONE', 'PENDING', 'AWARDED', 'PAID')),
    hits INT NOT NULL DEFAULT 0 CHECK (hits >= 0),
    last_hit_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals (status);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals (referrer_client_id);

-- ── 5. Site monitors (§49) ───────────────────────────────
-- Deliberately gentle: checks run every 15 minutes from the
-- existing cron (free-tier friendly), alerts deduped.
CREATE TABLE IF NOT EXISTS site_monitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (name <> ''),
    url TEXT NOT NULL CHECK (url ~* '^https?://'),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES client_projects(id) ON DELETE SET NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    last_checked_at TIMESTAMPTZ,
    last_status TEXT CHECK (last_status IS NULL OR last_status IN ('UP', 'DOWN')),
    last_status_code INT,
    last_response_time_ms INT,
    last_error TEXT,
    ssl_expires_at DATE,
    consecutive_failures INT NOT NULL DEFAULT 0 CHECK (consecutive_failures >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_monitor_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID NOT NULL REFERENCES site_monitors(id) ON DELETE CASCADE,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('UP', 'DOWN')),
    status_code INT,
    response_time_ms INT,
    error TEXT
);

CREATE INDEX IF NOT EXISTS idx_site_monitor_events_monitor_time
    ON site_monitor_events (monitor_id, checked_at DESC);

-- ── 6. Idempotent post-launch tasks (§53 + §89) ──────────
-- onProjectLaunched inserts its six post-launch tasks with a
-- deterministic dedup_key; the partial unique index makes
-- re-runs (deploy restart, admin double-click) a no-op.
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS dedup_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_tasks_dedup_key
    ON tasks (dedup_key)
    WHERE dedup_key IS NOT NULL;

-- ── 7. Handover timestamps (§51) ─────────────────────────
ALTER TABLE client_projects
    ADD COLUMN IF NOT EXISTS offboarding_started_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS offboarding_completed_at TIMESTAMPTZ;
