-- ── v17: contracts.signed_pdf as bytea (Phase 8) ──────────
-- Phase 8 originally planned to archive signed PDFs to Supabase
-- Storage, but the user opted to store PDFs in the Postgres
-- database itself (simplest, works on Vercel serverless, no
-- extra dependency). The existing signed_pdf_url column is
-- kept for backwards compatibility but is no longer used by
-- the webhook — bytea is the new source of truth.

ALTER TABLE contracts
    ADD COLUMN IF NOT EXISTS signed_pdf BYTEA,
    ADD COLUMN IF NOT EXISTS signed_pdf_filename TEXT,
    ADD COLUMN IF NOT EXISTS signed_pdf_size_bytes INTEGER;

-- Index for the download route.
CREATE INDEX IF NOT EXISTS idx_contracts_agreement_id ON contracts(agreement_id);
