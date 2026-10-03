-- ─── v42: tracking_id backfill ─────────────────────────────
-- New project rows now auto-generate a tracking_id at INSERT time
-- (see clientProjectController, crmController, invoiceController,
-- paymentController). This migration backfills any pre-existing
-- rows that were created before that change so the column is no
-- longer NULL.
--
-- gen_random_bytes(16) → 32 hex chars. The unique partial index
-- from v39 protects against collisions; if a clash is detected
-- the UPDATE is retried with a fresh value.
-- ─────────────────────────────────────────────────────────────

-- Fresh databases (vanilla Postgres) lack pgcrypto, which this
-- migration and v50 rely on for gen_random_bytes. Supabase ships
-- with it, so this is a no-op there.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'gen_random_bytes' AND n.nspname = 'public'
    ) THEN
        CREATE EXTENSION IF NOT EXISTS pgcrypto;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not ensure pgcrypto: %', SQLERRM;
END $$;

DO $$
DECLARE
    r RECORD;
    tid TEXT;
BEGIN
    FOR r IN SELECT id FROM client_projects WHERE tracking_id IS NULL LOOP
        LOOP
            tid := encode(gen_random_bytes(16), 'hex');
            BEGIN
                UPDATE client_projects
                   SET tracking_id = tid
                 WHERE id = r.id;
                EXIT;
            EXCEPTION WHEN unique_violation THEN
                -- extremely unlikely (16 random bytes), retry
                CONTINUE;
            END;
        END LOOP;
    END LOOP;
END $$;
