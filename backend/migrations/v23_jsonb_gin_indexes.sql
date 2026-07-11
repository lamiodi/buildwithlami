-- ── v23: JSONB GIN indexes for fast admin filters ────────
-- Several tables store structured pipeline state in JSONB
-- columns (client_projects.stages, client_projects.offboarding_checklist,
-- intake_submissions.responses). Without GIN, the admin UI
-- would be forced to do full-table scans when filtering by
-- "show me every project currently in the Quotation stage"
-- or "every offboarding where checklist.deliverables_approved
-- is false".
--
-- Each index uses jsonb_path_ops which is a smaller, faster
-- variant optimised for the @> containment operator we use
-- in our filter queries.

CREATE INDEX IF NOT EXISTS idx_client_projects_stages_gin
    ON client_projects USING GIN (stages jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_client_projects_offboarding_checklist_gin
    ON client_projects USING GIN (offboarding_checklist jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_intake_submissions_responses_gin
    ON intake_submissions USING GIN (responses jsonb_path_ops);
