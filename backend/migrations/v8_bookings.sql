-- ═══════════════════════════════════════════════════════════
-- v8_bookings.sql
-- ═══════════════════════════════════════════════════════════
-- Creates the `bookings` table used by the /survey and /drone
-- public booking forms (UPDATE.md §6.1 / §6.2). The two
-- divisions share one table; a CHECK constraint on
-- `division` keeps the row scoped to SURVEY or DRONE.
--
-- All DDL is idempotent.
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS bookings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       TEXT NOT NULL,
    email           TEXT NOT NULL,
    phone           TEXT,
    division        TEXT NOT NULL
                    CHECK (division IN ('SURVEY', 'DRONE')),
    service         TEXT NOT NULL,
    location        TEXT,
    preferred_date  DATE,
    notes           TEXT,
    status          TEXT NOT NULL DEFAULT 'NEW'
                    CHECK (status IN ('NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_division ON bookings(division);
CREATE INDEX IF NOT EXISTS idx_bookings_status   ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_email    ON bookings(email);
