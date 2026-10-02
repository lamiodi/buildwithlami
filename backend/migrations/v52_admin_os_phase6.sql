-- ─── v52_admin_os_phase6.sql ───────────────────────────────
-- Admin Operating System — Phase 6 (Intelligence):
--   §33 Project profitability — expenses become linkable to a
--       project so revenue − expenses − hours can be computed
--       per project (existing rows stay division-only, NULL).
--   §31 Workload / capacity guardrail — single-row settings:
--       weekly available hours, max concurrent builds, work
--       days/hours. Feeds the Tonight Queue capacity bar.
--   §78 Automatic client summary — generated (AI or rules)
--       internal summary per client, editable by the admin.
--
-- Everything is idempotent (IF NOT EXISTS) per migrations/README.md.
-- ──────────────────────────────────────────────────────────

-- ── 1. Per-project expenses (§33) ────────────────────────
ALTER TABLE expenses
    ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES client_projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_expenses_project ON expenses (project_id)
    WHERE project_id IS NOT NULL;

-- ── 2. Workload settings (§31) ───────────────────────────
-- Single-row table (id = 1) following the outreach_settings
-- pattern. Defaults mirror the blueprint example: weekday
-- evenings 7–10 PM, Saturdays flexible, max 3 concurrent builds.
CREATE TABLE IF NOT EXISTS workload_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    weekly_hours NUMERIC(5,1) NOT NULL DEFAULT 15.0
        CHECK (weekly_hours > 0 AND weekly_hours <= 168),
    max_concurrent_builds INT NOT NULL DEFAULT 3
        CHECK (max_concurrent_builds BETWEEN 1 AND 50),
    evening_capacity_hours NUMERIC(4,1) NOT NULL DEFAULT 3.0
        CHECK (evening_capacity_hours > 0 AND evening_capacity_hours <= 24),
    work_days TEXT NOT NULL DEFAULT 'Mon–Sat',
    work_hours TEXT NOT NULL DEFAULT '7:00 PM – 10:00 PM',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO workload_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ── 3. Client summary (§78) ──────────────────────────────
ALTER TABLE clients
    ADD COLUMN IF NOT EXISTS summary TEXT,
    ADD COLUMN IF NOT EXISTS summary_source TEXT
        CHECK (summary_source IN ('ai', 'rules', 'manual')),
    ADD COLUMN IF NOT EXISTS summary_generated_at TIMESTAMPTZ;

-- ── 4. Profitability query support ───────────────────────
-- Hours come from tasks.actual_minutes / estimated_minutes
-- (already indexed via idx_tasks_project_status). Invoices get
-- a (project_id, status) index for revenue-per-project sums.
CREATE INDEX IF NOT EXISTS idx_invoices_project_status
    ON invoices (project_id, status);
