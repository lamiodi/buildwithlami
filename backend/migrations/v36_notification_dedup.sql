-- ═══════════════════════════════════════════════════════════
-- v36_notification_dedup.sql
-- ═══════════════════════════════════════════════════════════
-- Persistent dedup table for cron-sent notifications (e.g. domain
-- expiration alerts). Replaces the in-memory Map in
-- `cronService.js` so a server restart no longer re-fires the
-- same alert within the dedup window. Idempotent.
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notification_dedup (
    entity_type TEXT NOT NULL,        -- e.g. 'domain_expiration'
    entity_id   TEXT NOT NULL,        -- e.g. project_id (uuid)
    bucket      TEXT NOT NULL,        -- e.g. 'T-30' / 'T-14' / 'T-7'
    sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (entity_type, entity_id, bucket)
);

-- Fast lookup for the "have we alerted within the last 6 days?" query.
CREATE INDEX IF NOT EXISTS idx_notification_dedup_sent_at
    ON notification_dedup (sent_at DESC);
