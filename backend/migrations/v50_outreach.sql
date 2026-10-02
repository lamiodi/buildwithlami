-- ─── v50_outreach.sql ──────────────────────────────────────
-- Admin OS Phase 4 — Outreach (blueprint §18–§22, §95):
--   prospects             — cold-outreach pipeline (§18)
--   outreach_sequences    — reusable email sequences (§20)
--   outreach_sequence_steps — Day 0 / 3 / 7 / 14 steps per sequence
--   outreach_messages     — every outbound/inbound email per prospect
--   outreach_suppressions — unsubscribe / bounce / manual do-not-send (§19)
--   website_audits        — factual prospecting audits (§21)
--   outreach_settings     — single-row send guardrails: daily limit,
--                           sending window, global pause (§19, §83)
--
-- A default 4-step sequence is seeded so the founder can start
-- prospecting immediately. All DDL is idempotent.
-- ──────────────────────────────────────────────────────────

-- ── 1. Prospects ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prospects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL CHECK (company_name <> ''),
    contact_name TEXT,
    email TEXT NOT NULL,
    website TEXT,
    instagram TEXT,
    industry TEXT,
    country TEXT,
    city TEXT,
    source TEXT,
    research_notes TEXT,
    website_issues TEXT,
    service_opportunity TEXT,
    estimated_value NUMERIC(12,2) CHECK (estimated_value IS NULL OR estimated_value >= 0),
    estimated_value_currency CHAR(3) NOT NULL DEFAULT 'NGN',
    status TEXT NOT NULL DEFAULT 'RESEARCH'
        CHECK (status IN (
            'RESEARCH', 'READY_TO_CONTACT', 'EMAIL_DRAFTED', 'SENT',
            'FOLLOW_UP_1', 'FOLLOW_UP_2', 'FOLLOW_UP_3',
            'REPLIED', 'INTERESTED', 'NOT_INTERESTED',
            'UNSUBSCRIBED', 'BOUNCED', 'CONVERTED'
        )),
    sequence_id UUID, -- FK added after sequences exist
    last_contacted_at TIMESTAMPTZ,
    next_follow_up_at TIMESTAMPTZ,
    do_not_contact BOOLEAN NOT NULL DEFAULT FALSE,
    unsubscribed_at TIMESTAMPTZ,
    bounce_reason TEXT,
    converted_lead_id UUID, -- FK added after leads exist (it does, v9)
    unsubscribe_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects (status);
CREATE INDEX IF NOT EXISTS idx_prospects_email ON prospects (email);
CREATE INDEX IF NOT EXISTS idx_prospects_next_follow_up
    ON prospects (next_follow_up_at)
    WHERE status IN ('SENT', 'FOLLOW_UP_1', 'FOLLOW_UP_2', 'FOLLOW_UP_3');

-- ── 2. Sequences + steps ─────────────────────────────────
CREATE TABLE IF NOT EXISTS outreach_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (name <> ''),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    stop_on_reply BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outreach_sequence_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id UUID NOT NULL REFERENCES outreach_sequences(id) ON DELETE CASCADE,
    step_order INT NOT NULL CHECK (step_order >= 1),
    delay_days INT NOT NULL DEFAULT 0 CHECK (delay_days >= 0),
    subject TEXT NOT NULL CHECK (subject <> ''),
    body TEXT NOT NULL CHECK (body <> ''),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (sequence_id, step_order)
);

CREATE INDEX IF NOT EXISTS idx_outreach_steps_sequence
    ON outreach_sequence_steps (sequence_id, step_order);

-- Now that both tables exist, wire the deferred FKs.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_prospects_sequence'
    ) THEN
        ALTER TABLE prospects
            ADD CONSTRAINT fk_prospects_sequence
            FOREIGN KEY (sequence_id) REFERENCES outreach_sequences(id)
            ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_prospects_converted_lead'
    ) THEN
        ALTER TABLE prospects
            ADD CONSTRAINT fk_prospects_converted_lead
            FOREIGN KEY (converted_lead_id) REFERENCES leads(id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- ── 3. Messages (outbound + inbound log) ─────────────────
-- The partial unique index is the idempotency guarantee for
-- sequence sends (blueprint §89): a prospect can only ever
-- receive one outbound email per sequence step, no matter how
-- many times the cron re-runs.
CREATE TABLE IF NOT EXISTS outreach_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
    sequence_id UUID REFERENCES outreach_sequences(id) ON DELETE SET NULL,
    step_id UUID REFERENCES outreach_sequence_steps(id) ON DELETE SET NULL,
    direction TEXT NOT NULL DEFAULT 'OUTBOUND'
        CHECK (direction IN ('OUTBOUND', 'INBOUND')),
    subject TEXT,
    body TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'QUEUED', 'SENT', 'FAILED', 'CANCELLED', 'RECEIVED')),
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    provider_message_id TEXT,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outreach_messages_prospect
    ON outreach_messages (prospect_id, created_at);
CREATE INDEX IF NOT EXISTS idx_outreach_messages_status
    ON outreach_messages (status);
CREATE INDEX IF NOT EXISTS idx_outreach_messages_sent
    ON outreach_messages (sent_at)
    WHERE direction = 'OUTBOUND' AND status = 'SENT';

CREATE UNIQUE INDEX IF NOT EXISTS uq_outreach_step_send
    ON outreach_messages (prospect_id, step_id)
    WHERE step_id IS NOT NULL AND direction = 'OUTBOUND';

-- ── 4. Suppression list ──────────────────────────────────
-- Every send path (manual + cron) checks this BEFORE sending.
-- One row per email address, forever (blueprint §19).
CREATE TABLE IF NOT EXISTS outreach_suppressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE CHECK (email <> ''),
    reason TEXT NOT NULL DEFAULT 'MANUAL'
        CHECK (reason IN ('UNSUBSCRIBED', 'BOUNCED', 'MANUAL', 'COMPLAINT')),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. Website audits (§21) ──────────────────────────────
CREATE TABLE IF NOT EXISTS website_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
    website TEXT NOT NULL CHECK (website <> ''),
    mobile_notes TEXT,
    design_notes TEXT,
    performance_notes TEXT,
    seo_notes TEXT,
    cta_notes TEXT,
    ecommerce_available BOOLEAN,
    booking_available BOOLEAN,
    analytics_present BOOLEAN,
    ssl_valid BOOLEAN,
    contact_options TEXT,
    opportunities TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_website_audits_prospect
    ON website_audits (prospect_id);

-- ── 6. Send guardrails (§19 daily limit / window / pause) ─
CREATE TABLE IF NOT EXISTS outreach_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    daily_send_limit INT NOT NULL DEFAULT 20 CHECK (daily_send_limit BETWEEN 1 AND 200),
    send_window_start TEXT NOT NULL DEFAULT '09:00',
    send_window_end TEXT NOT NULL DEFAULT '17:00',
    paused BOOLEAN NOT NULL DEFAULT FALSE,
    from_name TEXT NOT NULL DEFAULT 'Lami - BuildWithLami',
    reply_to TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO outreach_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ── 7. Seed the default 4-step sequence (§20 example) ────
-- Only inserted once (guarded by name). The founder can edit
-- or deactivate it from /admin/outreach → Sequences.
INSERT INTO outreach_sequences (id, name, description, is_active, stop_on_reply)
SELECT gen_random_uuid(),
       'Default Cold Outreach',
       'Day 0 initial email, Day 3 / 7 / 14 follow-ups. Edit the copy under Outreach → Sequences.',
       TRUE,
       TRUE
WHERE NOT EXISTS (SELECT 1 FROM outreach_sequences WHERE name = 'Default Cold Outreach');

INSERT INTO outreach_sequence_steps (sequence_id, step_order, delay_days, subject, body)
SELECT s.id, v.step_order, v.delay_days, v.subject, v.body
FROM outreach_sequences s
CROSS JOIN (VALUES
    (1, 0,
     'Quick question about {{business_name}}''s website',
     E'Hi {{first_name}},\n\nI came across {{website}} while looking at {{industry}} businesses, and a couple of things stood out — {{observed_issue}}.\n\nI build websites that fix exactly that: faster loads, a clearer path for visitors to become customers, and a look that matches the quality of your work. A couple of recent examples: {{portfolio_url}}\n\nWould it be useful if I sent over 2–3 specific, no-obligation suggestions for your site?\n\nBest,\nLami\nBuildWithLami'),
    (2, 3,
     'Re: Quick question about {{business_name}}''s website',
     E'Hi {{first_name}},\n\nJust floating this back to the top of your inbox in case it got buried.\n\nHappy to send those 2–3 specific suggestions for {{website}} either way — just say the word.\n\nBest,\nLami'),
    (3, 7,
     'One idea for {{business_name}}',
     E'Hi {{first_name}},\n\nLast note from me, I promise. If a redesign isn''t on the table right now, no problem at all — but if visitors on mobile are bouncing off {{website}}, that''s usually money walking away.\n\nHere''s the portfolio if it''s ever useful: {{portfolio_url}}\n\nBest,\nLami'),
    (4, 14,
     'Closing the loop',
     E'Hi {{first_name}},\n\nI''ll stop here so I''m not cluttering your inbox. If a website project ever comes up — new build, redesign, or online store — I''d love to be on your shortlist.\n\nAll the best,\nLami\nBuildWithLami')
) AS v(step_order, delay_days, subject, body)
WHERE s.name = 'Default Cold Outreach'
  AND NOT EXISTS (
      SELECT 1 FROM outreach_sequence_steps st WHERE st.sequence_id = s.id
  );
