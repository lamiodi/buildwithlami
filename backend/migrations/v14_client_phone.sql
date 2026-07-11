-- ═══════════════════════════════════════════════════════════
-- v14_client_phone.sql
-- ═══════════════════════════════════════════════════════════
-- Adds a `phone` column to the `clients` table for WhatsApp deep-links
-- (ROADMAP.md Phase 2 task #7).
--
-- All DDL is idempotent.
-- ═══════════════════════════════════════════════════════════

ALTER TABLE clients
    ADD COLUMN IF NOT EXISTS phone TEXT;
