-- Align the database with the existing admin workflow. Preserve the legacy
-- IN_PROGRESS value so historical projects remain valid during rollout.
ALTER TABLE client_projects DROP CONSTRAINT IF EXISTS client_projects_status_check;
ALTER TABLE client_projects ADD CONSTRAINT client_projects_status_check
    CHECK (status IN ('ONBOARDING', 'PLANNING', 'DESIGN', 'DEVELOPMENT',
        'IN_PROGRESS', 'REVIEW', 'LAUNCHED', 'MAINTENANCE', 'ARCHIVED'));
