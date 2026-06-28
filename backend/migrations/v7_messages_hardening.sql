-- Migration: messages table hardening
-- 1. Replace the low-cardinality boolean index with a partial index on unread
--    messages (much more useful for an inbox UI).
DROP INDEX IF EXISTS idx_messages_read;
CREATE INDEX IF NOT EXISTS idx_messages_unread_created
    ON messages(created_at DESC)
    WHERE is_read = false;

-- 2. Add a CHECK constraint on email format (defence in depth — the API also
--    validates, but the DB is the last line of defence).
ALTER TABLE messages
    DROP CONSTRAINT IF EXISTS messages_email_format_check;
ALTER TABLE messages
    ADD CONSTRAINT messages_email_format_check
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- 3. Add a small lookup index for subject search.
CREATE INDEX IF NOT EXISTS idx_messages_subject_lower
    ON messages(LOWER(subject))
    WHERE subject IS NOT NULL;
