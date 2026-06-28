-- Add offboarding_status column to client_projects table
ALTER TABLE client_projects 
ADD COLUMN offboarding_status JSONB DEFAULT '{
  "assets_delivered": false,
  "training_completed": false,
  "credentials_documented": false,
  "support_handoff": false,
  "final_payment": false,
  "client_feedback": false
}'::jsonb;

-- Add timeline_events table for project timeline
CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'IN_PROGRESS', 'PENDING', 'CANCELLED')),
  category TEXT NOT NULL CHECK (category IN ('milestone', 'decision', 'deliverable', 'meeting', 'revision')),
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for faster timeline queries
CREATE INDEX IF NOT EXISTS idx_timeline_events_project_id ON timeline_events(project_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_event_date ON timeline_events(event_date);

-- Add helper function to update offboarding status
CREATE OR REPLACE FUNCTION update_offboarding_status(
  project_id UUID,
  status_json JSONB
) RETURNS VOID AS $$
BEGIN
  UPDATE client_projects 
  SET offboarding_status = status_json,
      updated_at = NOW()
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;

-- Add helper function to add timeline event
CREATE OR REPLACE FUNCTION add_timeline_event(
  project_id UUID,
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'COMPLETED',
  category TEXT DEFAULT 'milestone'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO timeline_events (
    project_id, title, description, status, category
  ) VALUES (
    project_id, title, description, status, category
  );
END;
$$ LANGUAGE plpgsql;