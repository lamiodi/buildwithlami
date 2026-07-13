-- ═══════════════════════════════════════════════════════════
-- v28_resources_pricing.sql
-- ═══════════════════════════════════════════════════════════
-- Adds a `pricing` table and a few lightweight additions to
-- `resources` so both surfaces can be managed from /admin
-- (Resources, Pricing) and rendered on the public site
-- (/resources, /pricing).
--
-- Pricing model: each tier is a row. Display order controls
-- the left-to-right order on /pricing; `highlight` marks the
-- recommended tier (drives the "Most popular" badge).
--
-- Idempotent.
-- ═══════════════════════════════════════════════════════════

-- ── resources additions ───────────────────────────────────
ALTER TABLE resources
    ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS cover_image   TEXT,
    ADD COLUMN IF NOT EXISTS reading_time  TEXT;

CREATE INDEX IF NOT EXISTS idx_resources_display
    ON resources (status, display_order, published_at DESC);

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
-- something presentable from day one. Each INSERT uses
-- ON CONFLICT DO NOTHING on the natural key (name) to keep
-- re-running this migration idempotent.
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
     false, 3)
ON CONFLICT DO NOTHING;

-- Seed default resources so the public /resources page has
-- something presentable. We match on slug (UNIQUE) for
-- idempotency.
INSERT INTO resources (slug, title, excerpt, body, category, tags, status, published_at, display_order)
VALUES
    ('choose-custom-web-app-vs-saas', 'How to choose between a custom web app and SaaS',
     'A 5-minute framework for deciding when to build vs buy.',
     'The build vs buy decision almost always comes down to three things: recurring cost, customisation, and lock-in.\n\nIf the SaaS fits 80% of your workflow and your process is not a competitive moat, buy. If the missing 20% is the part that actually differentiates you, build.',
     'Strategy', ARRAY['software','build-vs-buy'], 'PUBLISHED', NOW(), 1),
    ('drone-data-in-postgis', 'Why your drone data should land in PostGIS, not a folder',
     'GIS-native storage pays off the second you need to query by location.',
     'Drone outputs are spatial. Storing them as flat files in a cloud bucket works until the first time you want a query like "all flights within 200m of parcel X after 2025-06-01". PostGIS + a GIN index on the geom column gives you that query in milliseconds.',
     'Drone', ARRAY['gis','postgis','drone'], 'PUBLISHED', NOW(), 2),
    ('onboarding-mistakes-saas', '5 onboarding mistakes that kill SaaS retention',
     'A checklist of what to fix before your first 1,000 users.',
     'Empty states, missing sample data, no in-app guidance, no email follow-up, and no "magic moment" in the first 5 minutes. Fix all five and your D7 retention climbs by 15-25%.',
     'Software', ARRAY['saas','retention'], 'PUBLISHED', NOW(), 3),
    ('survey-plan-vs-deed', 'Survey plan vs. deed of assignment: what you actually need',
     'Documents you need for a land survey in Nigeria, demystified.',
     'For a typical boundary survey you need the deed of assignment, the most recent survey plan (if any), and a means of identification for the owner. The surveyor will tell you if additional approvals are needed.',
     'Survey', ARRAY['nigeria','surveying'], 'PUBLISHED', NOW(), 4)
ON CONFLICT (slug) DO NOTHING;
