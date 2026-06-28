-- Migration: Add contact pre-qualification columns
ALTER TABLE messages ADD COLUMN IF NOT EXISTS project_type TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS budget TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS timeline TEXT;
