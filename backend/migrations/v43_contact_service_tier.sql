-- ═══════════════════════════════════════════════════════════
-- v43_contact_service_tier.sql
-- ═══════════════════════════════════════════════════════════
-- Stores the URL parameters that Pricing.jsx appends to the
-- contact CTA ("/contact?service=ecommerce&tier=ecom_growth&currency=USD")
-- so the admin can see which specific tier the prospect clicked.
--
-- NULL = came in via the homepage Contact form (no service/tier).
-- ═══════════════════════════════════════════════════════════

ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS service   TEXT,
    ADD COLUMN IF NOT EXISTS tier      TEXT,
    ADD COLUMN IF NOT EXISTS currency  TEXT;

CREATE INDEX IF NOT EXISTS idx_messages_service   ON messages(service);
CREATE INDEX IF NOT EXISTS idx_messages_tier      ON messages(tier);
CREATE INDEX IF NOT EXISTS idx_messages_currency  ON messages(currency);
