-- ═══════════════════════════════════════════════════════════
-- BuildWithLami (buildwithlami.com) — Database Schema (init.sql)
-- Run once against Supabase via:  npm run db:init
-- ═══════════════════════════════════════════════════════════

-- 1. Users (admin accounts)
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'OWNER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Profile (Public Bio)
CREATE TABLE IF NOT EXISTS profile (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name    TEXT NOT NULL,
  headline     TEXT,
  bio          TEXT,
  resume_url   TEXT,
  avatar_url   TEXT,
  social_links JSONB,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Projects (Portfolio Pieces)
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  summary     TEXT,
  content     TEXT,
  tech_stack  TEXT[],
  features    TEXT[],
  category    TEXT,
  image_url   TEXT,
  live_url    TEXT,
  repo_url    TEXT,
  featured    BOOLEAN NOT NULL DEFAULT false,
  status      TEXT NOT NULL DEFAULT 'PUBLISHED'
              CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Messages (Contact Inquiries)
-- Note: `subject` was removed in Phase 0 — neither the
-- /contact form nor the home-page Contact component sent it.
-- `project_type` / `budget` / `timeline` are the qualification
-- fields the home-page Contact component writes.
CREATE TABLE IF NOT EXISTS messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name    TEXT NOT NULL,
  email        TEXT NOT NULL,
  message      TEXT NOT NULL,
  project_type TEXT,
  budget       TEXT,
  timeline     TEXT,
  is_read      BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common look-ups
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
