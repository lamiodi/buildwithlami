-- ── v16: FX rates for multi-currency invoices (Phase 8) ─────
-- Static exchange rates used to convert invoice amounts to the
-- base currency (NGN) for reporting purposes. Rates are stored
-- as: 1 NGN = X <target_currency>. The admin can update these
-- from AdminSettings.

CREATE TABLE IF NOT EXISTS fx_rates (
    base_currency     CHAR(3) NOT NULL DEFAULT 'NGN',
    target_currency   CHAR(3) NOT NULL,
    rate              NUMERIC(14, 8) NOT NULL CHECK (rate > 0),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by        UUID REFERENCES users(id) ON DELETE SET NULL,
    PRIMARY KEY (base_currency, target_currency)
);

-- Seed with sensible defaults (1 NGN = X foreign). These are
-- approximate as of 2026; admin can refine in AdminSettings.
--   1 NGN ≈ 0.00065 USD
--   1 NGN ≈ 0.00060 EUR
--   1 NGN ≈ 0.00052 GBP
INSERT INTO fx_rates (base_currency, target_currency, rate) VALUES
    ('NGN', 'NGN', 1.00000000),
    ('NGN', 'USD', 0.00065000),
    ('NGN', 'EUR', 0.00060000),
    ('NGN', 'GBP', 0.00052000)
ON CONFLICT (base_currency, target_currency) DO NOTHING;

-- Index for fast lookups in dashboard reporting.
CREATE INDEX IF NOT EXISTS idx_fx_rates_base ON fx_rates(base_currency);
