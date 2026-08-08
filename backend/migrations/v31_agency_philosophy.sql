-- v31_agency_philosophy.sql
-- Enforces simplified roles, adds country to clients, and cleans up email templates.

-- 1. Add country to clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- 2. Clean up roles to only 5 core roles
-- First, map existing users to the new roles if they are using legacy roles
UPDATE users
SET role_id = (SELECT id FROM roles WHERE name = 'Staff')
WHERE role_id IN (
    SELECT id FROM roles 
    WHERE name IN ('Developer', 'Survey Manager', 'Surveyor', 'Drone Manager', 'Drone Pilot', 'Finance')
);

UPDATE users
SET role = 'Staff'
WHERE role IN ('Developer', 'Survey Manager', 'Surveyor', 'Drone Manager', 'Drone Pilot', 'Finance');

-- Now delete the old roles
DELETE FROM roles 
WHERE name NOT IN ('Owner', 'Administrator', 'Project Manager', 'Staff', 'Client');

-- Ensure Staff role exists if it wasn't seeded
INSERT INTO roles (name) VALUES ('Staff') ON CONFLICT (name) DO NOTHING;

-- 3. Clean up email templates
-- The allowed templates are: Welcome, Quotation, Invoice, Contract, Project Update.
DELETE FROM email_templates
WHERE name NOT IN ('Welcome', 'Quotation', 'Invoice', 'Contract', 'Project Update');
