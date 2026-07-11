-- ═══════════════════════════════════════════════════════════
-- v12_cms.sql
-- ═══════════════════════════════════════════════════════════
-- Creates the Content Management tables (UPDATE.md §16.4 +
-- §16.5 + §16.9). These power /admin/cms, the home-page
-- testimonials, the /survey and /drone equipment galleries,
-- the email-template picker, the Zoho Sign contract archive,
-- the /resources knowledge base, and the unified inbox.
--
-- Tables in this migration:
--   pages            — CMS content (powers /resources, /portfolio, /pricing)
--   testimonials     — client quotes (home, /survey, /drone)
--   equipment        — Survey + Drone gear
--   industries       — Drone verticals
--   email_templates  — saved email bodies with placeholders
--   contracts        — Zoho Sign PDF archive
--   resources        — knowledge-base articles
--   conversations    — unified inbox threads
--
-- All DDL is idempotent.
-- ═══════════════════════════════════════════════════════════

-- ── 1. pages (CMS for /resources, /portfolio, /pricing) ──
CREATE TABLE IF NOT EXISTS pages (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug              TEXT UNIQUE NOT NULL,
    title             TEXT NOT NULL,
    body              TEXT,
    hero_image        TEXT,
    meta_description  TEXT,
    status            TEXT NOT NULL DEFAULT 'DRAFT'
                      CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    published_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pages_slug   ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);

-- ── 2. testimonials (client quotes) ──────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name   TEXT NOT NULL,
    division      TEXT NOT NULL
                  CHECK (division IN ('SOFTWARE', 'SURVEY', 'DRONE')),
    quote         TEXT NOT NULL,
    avatar_url    TEXT,
    is_featured   BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_testimonials_division  ON testimonials(division);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured  ON testimonials(is_featured);

-- ── 3. equipment (Survey + Drone gear) ───────────────────
CREATE TABLE IF NOT EXISTS equipment (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    division      TEXT NOT NULL
                  CHECK (division IN ('SURVEY', 'DRONE')),
    description   TEXT,
    image_url     TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_equipment_division ON equipment(division);
CREATE INDEX IF NOT EXISTS idx_equipment_order    ON equipment(display_order);

-- ── 4. industries (Drone verticals) ──────────────────────
CREATE TABLE IF NOT EXISTS industries (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           TEXT NOT NULL,
    description    TEXT,
    icon           TEXT,
    sample_image   TEXT,
    display_order  INTEGER NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_industries_order ON industries(display_order);

-- ── 5. email_templates (saved email bodies) ──────────────
CREATE TABLE IF NOT EXISTS email_templates (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT UNIQUE NOT NULL,
    subject     TEXT NOT NULL,
    body        TEXT NOT NULL,
    placeholders JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the 5 default templates the CEO Improvements §16.5
-- promised. Each is inserted with ON CONFLICT DO NOTHING so
-- re-running the migration is safe.
INSERT INTO email_templates (name, subject, body, placeholders) VALUES
    ('Welcome', 'Welcome to {{project_name}}!',
     'Hi {{client_name}},

Welcome aboard! We''re excited to start work on {{project_name}}.

Your project manager will be in touch shortly to schedule a kickoff call.

— The BuildWithLami team',
     '["client_name", "project_name"]'::jsonb),
    ('Proposal Sent', 'Your proposal for {{project_name}} is ready',
     'Hi {{client_name}},

Please find your proposal for {{project_name}} attached.

Total: {{amount}}
Valid for 14 days.

— The BuildWithLami team',
     '["client_name", "project_name", "amount"]'::jsonb),
    ('Invoice Sent', 'Invoice {{invoice_number}} from BuildWithLami',
     'Hi {{client_name}},

Invoice {{invoice_number}} for {{amount}} is ready.

Pay here: {{payment_url}}

— The BuildWithLami team',
     '["client_name", "invoice_number", "amount", "payment_url"]'::jsonb),
    ('Project Complete', 'Your project {{project_name}} is live!',
     'Hi {{client_name}},

{{project_name}} is now live at {{live_url}}.

Thanks for trusting BuildWithLami.

— The BuildWithLami team',
     '["client_name", "project_name", "live_url"]'::jsonb),
    ('Testimonial Request', 'Quick favour? Share your BuildWithLami experience',
     'Hi {{client_name}},

It''s been about a week since we wrapped {{project_name}}. Would you mind sharing a few lines about your experience?

A reply with 2-3 sentences is all we need — thank you!

— The BuildWithLami team',
     '["client_name", "project_name"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- ── 6. contracts (Zoho Sign PDF archive) ─────────────────
CREATE TABLE IF NOT EXISTS contracts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID REFERENCES clients(id) ON DELETE SET NULL,
    project_id      UUID REFERENCES client_projects(id) ON DELETE SET NULL,
    template_id     TEXT,                -- Zoho Sign template id
    agreement_id    TEXT,                -- Zoho Sign agreement id
    signatory_email TEXT,
    status          TEXT NOT NULL DEFAULT 'DRAFT'
                    CHECK (status IN ('DRAFT', 'SENT', 'SIGNED', 'VOID', 'EXPIRED')),
    signed_pdf_url  TEXT,                -- Supabase Storage / Cloudinary URL
    sent_at         TIMESTAMPTZ,
    signed_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contracts_client_id  ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_project_id ON contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status     ON contracts(status);

-- ── 7. resources (knowledge-base articles) ───────────────
CREATE TABLE IF NOT EXISTS resources (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug              TEXT UNIQUE NOT NULL,
    title             TEXT NOT NULL,
    excerpt           TEXT,
    body              TEXT,
    hero_image        TEXT,
    category          TEXT,
    tags              TEXT[],
    author_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    status            TEXT NOT NULL DEFAULT 'DRAFT'
                      CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    published_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_resources_slug     ON resources(slug);
CREATE INDEX IF NOT EXISTS idx_resources_status   ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);

-- ── 8. conversations (unified inbox threads) ─────────────
-- Each row is a thread, not a single message. Messages
-- belonging to the thread live in a child table or are
-- aggregated from `messages`, `project_feedback`, and
-- `intake_submissions` at read time.
CREATE TABLE IF NOT EXISTS conversations (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id      UUID REFERENCES clients(id) ON DELETE SET NULL,
    subject        TEXT,
    division       TEXT
                   CHECK (division IN ('SOFTWARE', 'SURVEY', 'DRONE')),
    status         TEXT NOT NULL DEFAULT 'NEW'
                   CHECK (status IN ('NEW', 'IN_PROGRESS', 'WAITING', 'RESOLVED')),
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_conversations_client_id       ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status          ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
