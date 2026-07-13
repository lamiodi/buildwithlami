-- ═══════════════════════════════════════════════════════════
-- v25_drop_cms.sql
-- ═══════════════════════════════════════════════════════════
-- Removes the original CMS-related tables:
--   pages         — CMS-managed long-form content
--   testimonials  — CMS-managed client quotes
--   equipment     — CMS-managed gear list (replaced by hardcoded
--                   data on the Survey/Drone home pages)
--   industries    — CMS-managed drone verticals (replaced by
--                   hardcoded data on the Drone home page)
--
-- The Portfolio (survey/drone projects) feature is preserved
-- and now lives in the existing `client_projects` table,
-- editable from /admin/portfolio.
--
-- Other tables created alongside the CMS in v12 — contracts,
-- resources, email_templates, conversations — are NOT touched
-- here: they back dedicated features (Zoho Sign, knowledge base,
-- email templates, unified inbox) that are not part of the CMS.
--
-- Idempotent: each DROP uses IF EXISTS so re-running is safe.
-- ═══════════════════════════════════════════════════════════

DROP TABLE IF EXISTS pages         CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS equipment    CASCADE;
DROP TABLE IF EXISTS industries   CASCADE;
