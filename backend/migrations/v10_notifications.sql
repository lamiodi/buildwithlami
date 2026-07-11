-- ═══════════════════════════════════════════════════════════
-- v10_notifications.sql
-- ═══════════════════════════════════════════════════════════
-- Creates the `notifications` table for the in-app
-- notification center (UPDATE.md §16.1, ROADMAP.md Phase 2).
-- Populated by background jobs (cron), by the CRM
-- stage-transition handlers, and by the support inbox when
-- a client message arrives.
--
-- This table is distinct from the existing `activity_logs`
-- table (which is broader and unfiltered). `notifications`
-- is the user-facing bell; `activity_logs` is the admin
-- audit trail.
--
-- All DDL is idempotent.
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    type        TEXT NOT NULL,
    title       TEXT NOT NULL,
    body        TEXT,
    link        TEXT,
    is_read     BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id      ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read      ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at   ON notifications(created_at DESC);
