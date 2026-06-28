-- ─── MASTER SCHEMA MIGRATION ─────────────────────────
-- buildwithlami.dev v2.0 — Agency OS Edition
-- ─────────────────────────────────────────────────────────

-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- SECTION 1: CORE PORTFOLIO & ADMIN
-- ==========================================

-- 1. Users (Admin/Owner Access)
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT UNIQUE NOT NULL,
  password     TEXT NOT NULL,        -- bcrypt hash
  role         TEXT NOT NULL DEFAULT 'OWNER' CHECK (role IN ('OWNER', 'ADMIN', 'CLIENT')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Profile (Public bio for portfolio)
-- The `id` column is fixed to a single sentinel value so the table can only
-- ever hold one row, enforced at the database level (not via app-level
-- "LIMIT 1" hacks in the queries).
CREATE TABLE IF NOT EXISTS profile (
  id           INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  full_name    TEXT NOT NULL,
  headline     TEXT,
  bio          TEXT,
  resume_url   TEXT,
  avatar_url   TEXT,
  social_links JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Projects (Public Portfolio pieces)
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL, 
  summary     TEXT,                 
  content     TEXT,                 
  tech_stack  TEXT[],               
  image_url   TEXT,                 
  live_url    TEXT,                 
  repo_url    TEXT,                 
  featured    BOOLEAN NOT NULL DEFAULT false,
  status      TEXT NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Messages (Public Contact Form Inquiries)
CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  subject     TEXT,
  message     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- SECTION 2: AGENCY OPERATIONS
-- ==========================================

-- 5. Clients (The core CRM entity)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  primary_contact_email TEXT NOT NULL,
  billing_email TEXT,
  stripe_customer_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Intake Templates (Dynamic Form Builder Blueprint)
CREATE TABLE IF NOT EXISTS intake_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  schema JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Client Projects (The Active Agency Pipelines)
CREATE TABLE IF NOT EXISTS client_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  tracking_id TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT NOT NULL DEFAULT 'PLANNING' CHECK (status IN ('ONBOARDING', 'PLANNING', 'DESIGN', 'DEVELOPMENT', 'REVIEW', 'LAUNCHED', 'MAINTENANCE', 'ARCHIVED')),
  
  -- Billing & Domain
  domain_name TEXT,
  domain_expiration DATE,
  amount_due NUMERIC(10, 2) DEFAULT 0.00,
  payment_type TEXT DEFAULT 'ONE_TIME' CHECK (payment_type IN ('ONE_TIME', 'MONTHLY')),
  monthly_fee NUMERIC(10, 2) DEFAULT 0.00,
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE')),
  offboarding_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Pipeline Stages
  stages JSONB DEFAULT '[
      {"name": "Discovery & Planning", "status": "PENDING"},
      {"name": "Design & Mockups", "status": "PENDING"},
      {"name": "Development", "status": "PENDING"},
      {"name": "Testing & Revisions", "status": "PENDING"},
      {"name": "Launch", "status": "PENDING"}
  ]'::jsonb,
  
  -- Onboarding/Offboarding Links
  intake_form_id UUID REFERENCES intake_templates(id) ON DELETE SET NULL,
  intake_completed BOOLEAN NOT NULL DEFAULT false,
  assets_url TEXT,
  training_video_url TEXT,
  maintenance_plan_url TEXT,
  
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Intake Submissions (Client Responses)
CREATE TABLE IF NOT EXISTS intake_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE UNIQUE,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Project Secrets (Encrypted Credential Vault)
CREATE TABLE IF NOT EXISTS project_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  iv TEXT NOT NULL,
  auth_tag TEXT,                  -- AES-256-GCM authentication tag
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Invoices (Granular Billing)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED')),
    stripe_invoice_id TEXT,
    payment_url TEXT,
    due_date DATE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Project Feedback (Client Comments/Revisions)
CREATE TABLE IF NOT EXISTS project_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
    stage_index INT NOT NULL,
    client_comment TEXT NOT NULL,
    admin_reply TEXT,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'RESOLVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- SECTION 3: INDEXES & PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_client_projects_tracking ON client_projects(tracking_id);
CREATE INDEX IF NOT EXISTS idx_project_secrets_client ON project_secrets(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
