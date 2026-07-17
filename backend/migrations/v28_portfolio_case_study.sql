-- ═══════════════════════════════════════════════════════════
-- v28_portfolio_case_study.sql
-- ═══════════════════════════════════════════════════════════
-- Extends the `projects` table with the fields consumed by
-- the premium public case-study pages:
--   - Software (ProjectDetailPage.jsx)
--   - Drone    (DroneProjectDetailPage.jsx)
--   - Survey   (SurveyProjectDetailPage.jsx)
--
-- Goals:
--   1. Close the data gap so live API projects can render
--      the full case-study layout, not just the legacy card.
--   2. Keep the schema non-breaking — every new column is
--      nullable or has a safe default, so existing rows are
--      untouched.
--   3. Use JSONB for structured arrays (gallery, results,
--      timeline, ...) — flexible for future field additions
--      without DDL churn, and aligned with v23's GIN index
--      pattern.
--
-- Idempotent. Safe to re-run.
-- ═══════════════════════════════════════════════════════════

-- ── 1. Scalar display fields ─────────────────────────────
-- `tagline`       : one-line value proposition shown in the hero
-- `year`          : string for flexibility ("2024", "Q1 2024")
-- `industry`      : sector / domain
-- `status_label`  : free-form display status ("Live", "Completed",
--                    "In Progress"); the existing `status` enum
--                    (DRAFT / PUBLISHED / ARCHIVED) keeps the
--                    workflow semantics
-- `duration`      : "5 months", "1 day on site", ...
-- `role`          : "Lead Engineer", "Pilot", "Surveyor", ...

ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS tagline       TEXT,
    ADD COLUMN IF NOT EXISTS year          TEXT,
    ADD COLUMN IF NOT EXISTS industry      TEXT,
    ADD COLUMN IF NOT EXISTS status_label  TEXT,
    ADD COLUMN IF NOT EXISTS duration      TEXT,
    ADD COLUMN IF NOT EXISTS role          TEXT;

-- ── 2. Gallery — multi-image array ────────────────────────
-- Stored as JSONB (not TEXT[]) so each entry can carry its
-- own `alt` text and optional `device` ("desktop" | "tablet"
-- | "phone") for the responsive mockup on the public page.
-- Shape: [{ src, alt, device? }]

ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS gallery JSONB NOT NULL DEFAULT '[]'::jsonb;

-- ── 3. Case-study JSONB columns ──────────────────────────
-- Each column holds the exact shape the public detail pages
-- already render. Keeping the shapes documented here so the
-- frontend form can validate input before posting.
--
-- challenge           { problem, constraints[], goals[] }
-- solution            { architecture, ui, backend, performance, security, accessibility }
-- results             [{ value, label, description }]
-- feature_categories  [{ name, icon, items: [{ title, description }] }]
-- flow                [{ step, detail }]
-- tech_categories     [{ name, icon, items: [string] }]
-- architecture        [{ layer, detail }]
-- timeline            [{ phase, detail }]
-- responsibilities    [string]
-- metrics             { lighthouse, performance, accessibility, seo, bestPractices, apiResponse, bundle }
-- stats               { screens, endpoints, tables, flight_time, area, photos, videos, ... }
-- related_slugs       [string]

ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS challenge            JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS solution             JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS results              JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS feature_categories   JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS flow                 JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS tech_categories      JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS architecture         JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS timeline             JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS responsibilities     JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS metrics              JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS stats                JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS related_slugs        JSONB NOT NULL DEFAULT '[]'::jsonb;

-- ── 4. Division-specific meta payload ─────────────────────
-- Holds division-scoped fields that don't deserve a top-level
-- column. Keeps the schema stable while letting the form
-- surface whatever makes sense per division.
--
-- Drone  meta : { weather, team_size, ... }
-- Survey meta : { site_area, state, lga, terrain,
--                 accuracy_label, coords, method, team,
--                 elevation_range, boundary_points }
-- Software    : (rarely used; legacy rich content lives in
--                the typed JSONB columns above)

ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS meta JSONB NOT NULL DEFAULT '{}'::jsonb;

-- ── 5. GIN indexes for fast JSONB filters ─────────────────
-- Consistent with v23 — we use jsonb_path_ops which is a
-- smaller, faster variant optimised for the @> containment
-- operator. The admin form's "filter by tag / category"
-- patterns can lean on these.

CREATE INDEX IF NOT EXISTS idx_projects_gallery_gin
    ON projects USING GIN (gallery jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_projects_challenge_gin
    ON projects USING GIN (challenge jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_projects_solution_gin
    ON projects USING GIN (solution jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_projects_results_gin
    ON projects USING GIN (results jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_projects_feature_categories_gin
    ON projects USING GIN (feature_categories jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_projects_flow_gin
    ON projects USING GIN (flow jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_projects_tech_categories_gin
    ON projects USING GIN (tech_categories jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_projects_architecture_gin
    ON projects USING GIN (architecture jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_projects_timeline_gin
    ON projects USING GIN (timeline jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_projects_metrics_gin
    ON projects USING GIN (metrics jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_projects_stats_gin
    ON projects USING GIN (stats jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_projects_related_slugs_gin
    ON projects USING GIN (related_slugs jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_projects_meta_gin
    ON projects USING GIN (meta jsonb_path_ops);
