-- v35_project_files.sql
-- Create a categorized document repository for projects

CREATE TABLE IF NOT EXISTS project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
    uploader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Proposal', 'Contract', 'Invoice', 'Brief', 'Asset', 'Other')),
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Index for quick lookups by project
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
