-- ═══════════════════════════════════════════════════════════
-- DevAgency OS — Database Schema (init.sql)
-- Run once against Supabase via:  npm run db:init
-- ═══════════════════════════════════════════════════════════

-- 1. Users (admin accounts)
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,              -- TODO: migrate to bcrypt hash before production
  role       TEXT NOT NULL DEFAULT 'ADMIN'
             CHECK (role IN ('ADMIN', 'SUPER_ADMIN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Leads (public funnel — visitors who submitted the onboarding form)
CREATE TABLE IF NOT EXISTS leads (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name        TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT,
  package_interest TEXT,
  message          TEXT,
  status           TEXT NOT NULL DEFAULT 'NEW'
                   CHECK (status IN ('NEW', 'CONTACTED', 'CONVERTED', 'LOST')),
  source           TEXT NOT NULL DEFAULT 'WEBSITE',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Clients (converted leads — portal users)
CREATE TABLE IF NOT EXISTS clients (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name           TEXT NOT NULL,
  email               TEXT UNIQUE,
  phone               TEXT,
  magic_link_token    TEXT UNIQUE,
  magic_link_expires  TIMESTAMPTZ,       -- enforces time-based token expiry
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Projects
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url   TEXT,
  live_url    TEXT,
  repo_url    TEXT,
  featured    BOOLEAN NOT NULL DEFAULT false,
  status      TEXT NOT NULL DEFAULT 'PLANNING'
              CHECK (status IN ('PLANNING', 'DESIGN', 'DEV', 'REVIEW', 'LAUNCHED')),
  progress    INT NOT NULL DEFAULT 0
              CHECK (progress >= 0 AND progress <= 100),
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount     INT NOT NULL DEFAULT 0,     -- stored in kobo/cents
  status     TEXT NOT NULL DEFAULT 'PENDING'
             CHECK (status IN ('PENDING', 'PAID', 'OVERDUE')),
  due_date   DATE,
  client_id  UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Domains (renewal tracking)
CREATE TABLE IF NOT EXISTS domains (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  expiry_date DATE,
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common look-ups
CREATE INDEX IF NOT EXISTS idx_leads_status     ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email      ON leads(email);
CREATE INDEX IF NOT EXISTS idx_projects_client  ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_invoices_client  ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_domains_client   ON domains(client_id);
CREATE INDEX IF NOT EXISTS idx_domains_expiry   ON domains(expiry_date);
CREATE INDEX IF NOT EXISTS idx_clients_token    ON clients(magic_link_token);
