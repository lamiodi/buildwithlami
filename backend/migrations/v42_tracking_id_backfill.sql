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
