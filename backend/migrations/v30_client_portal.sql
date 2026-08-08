-- v30_client_portal.sql
-- Adds authentication fields for Client Portal MVP

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'clients' 
          AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE clients ADD COLUMN password_hash TEXT;
        ALTER TABLE clients ADD COLUMN last_login_at TIMESTAMPTZ;
        ALTER TABLE clients ADD COLUMN reset_token TEXT;
        ALTER TABLE clients ADD COLUMN reset_token_expires_at TIMESTAMPTZ;
    END IF;
END $$;
