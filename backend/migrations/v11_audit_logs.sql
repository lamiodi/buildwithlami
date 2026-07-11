-- ═══════════════════════════════════════════════════════════
-- v11_audit_logs.sql
-- ═══════════════════════════════════════════════════════════
-- Creates the `audit_logs` table for the sensitive-action
-- audit trail (UPDATE.md §16.6, ROADMAP.md Phase 1 task #4).
-- Captures who-did-what on invoice paid, lead stage changed,
-- user role changed, project deleted, and similar events.
--
-- This table is separate from the existing `activity_logs`
-- table, which is the coarse "admin did something" log.
-- `audit_logs` is the immutable security record required for
-- accountability; `activity_logs` is the dashboard widget.
--
-- All DDL is idempotent.
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS audit_logs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    action       TEXT NOT NULL,
    entity_type  TEXT NOT NULL,
    entity_id    UUID,
    details      JSONB,
    ip_address   INET,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id      ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity       ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at   ON audit_logs(created_at DESC);
