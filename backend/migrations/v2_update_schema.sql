-- Migration to upgrade client_projects schema structure
-- 1. Remove plaintext staging columns
ALTER TABLE client_projects DROP COLUMN IF EXISTS login_url;
ALTER TABLE client_projects DROP COLUMN IF EXISTS login_username;
ALTER TABLE client_projects DROP COLUMN IF EXISTS login_password;

-- 2. Modify status CHECK constraints safely
-- First, ensure any invalid status values are set to PLANNING
UPDATE client_projects SET status = 'PLANNING' WHERE status NOT IN ('ONBOARDING', 'PLANNING', 'DESIGN', 'DEVELOPMENT', 'REVIEW', 'LAUNCHED', 'MAINTENANCE', 'ARCHIVED');
ALTER TABLE client_projects DROP CONSTRAINT IF EXISTS client_projects_status_check;
ALTER TABLE client_projects ADD CONSTRAINT client_projects_status_check CHECK (status IN ('ONBOARDING', 'PLANNING', 'DESIGN', 'DEVELOPMENT', 'REVIEW', 'LAUNCHED', 'MAINTENANCE', 'ARCHIVED'));

-- 3. Add new tracking columns
ALTER TABLE client_projects ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE'));
ALTER TABLE client_projects ADD COLUMN IF NOT EXISTS offboarding_checklist JSONB DEFAULT '[]'::jsonb;
