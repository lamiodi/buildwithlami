-- v32_project_milestones.sql
-- Adds milestones tracking to client_projects table

ALTER TABLE client_projects 
ADD COLUMN milestones JSONB DEFAULT '[
    {"title": "Discovery & Planning", "status": "PENDING"},
    {"title": "Design & Prototyping", "status": "PENDING"},
    {"title": "Development", "status": "PENDING"},
    {"title": "Testing & QA", "status": "PENDING"},
    {"title": "Deployment", "status": "PENDING"}
]';

-- Ensure existing projects get the default milestones if null
UPDATE client_projects 
SET milestones = '[
    {"title": "Discovery & Planning", "status": "PENDING"},
    {"title": "Design & Prototyping", "status": "PENDING"},
    {"title": "Development", "status": "PENDING"},
    {"title": "Testing & QA", "status": "PENDING"},
    {"title": "Deployment", "status": "PENDING"}
]'
WHERE milestones IS NULL;
