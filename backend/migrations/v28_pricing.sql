-- ═══════════════════════════════════════════════════════════
-- v28_pricing.sql
-- ═══════════════════════════════════════════════════════════
-- Adds a `pricing` table so the public /pricing page is driven
-- by admin-managed tiers instead of a hardcoded frontend list.
--
-- Pricing model: each tier is a row. Display order controls
// the left-to-right order on /pricing; `highlight` marks the
// recommended tier (drives the "Most popular" badge).
--
-- (Earlier in this session v28 also added `resources` columns
-- and seeded knowledge-base articles. That feature has been
// removed; the resources table is dropped in v29.)
--
-- Idempotent.
-- ═══════════════════════════════════════════════════════════

-- ── pricing tiers ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pricing (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    price         TEXT NOT NULL,
    cadence       TEXT NOT NULL DEFAULT 'one-time',
    description   TEXT,
    features      TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    highlight     BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    status        TEXT NOT NULL DEFAULT 'PUBLISHED'
                  CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pricing_status  ON pricing(status);
CREATE INDEX IF NOT EXISTS idx_pricing_display ON pricing(status, display_order);

-- Seed default tiers so the public /pricing page has
-- something presentable from day one. Re-running is safe —
-- existing rows are not touched (no unique key on `name`).
INSERT INTO pricing (name, price, cadence, description, features, highlight, display_order)
VALUES
    ('Starter', '₦350k', 'one-time',
     'For solo founders who need a clean landing page and a working contact form.',
     ARRAY['1-page responsive site','Contact form + email','Cloudinary image hosting','1 round of revisions'],
     false, 1),
    ('Growth', '₦1.2M', 'one-time',
     'For SMEs that need CRM, a dashboard, and integrations with Paystack / Stripe.',
     ARRAY['Multi-page site (up to 6)','CRM with leads + clients','Paystack / Stripe payments','Admin dashboard','3 rounds of revisions'],
     true, 2),
    ('Custom', 'Let''s talk', 'engagement',
     'For full SaaS products, drone pipelines, and ongoing engineering partnerships.',
     ARRAY['Bespoke architecture','Unlimited pages & roles','Drone / GIS pipelines','Maintenance retainer','Dedicated PM'],
     false, 3);
