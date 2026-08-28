// ─── src/services/cronService.js ────────────────────────
// Handles scheduled background tasks like Domain Expiration
// Reminders, Automated Monthly Invoicing, and Live FX
// rate refreshes.
// ──────────────────────────────────────────────────────────

import cron from 'node-cron';
import pool from '../config/db.js';
import { sendNotificationEmail } from './emailService.js';
import { refreshAndApply } from './fxService.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_TO;
if (!ADMIN_EMAIL) {
    console.warn('[Cron] ADMIN_EMAIL / EMAIL_TO not set; admin alerts will be skipped.');
}

// Persistent dedup for cron-sent notifications. Replaces the previous
// in-memory Map (which reset on every restart and would re-fire the
// same domain-expiration alert immediately after a deploy). Backed
// by the `notification_dedup` table (see migration v36). The 6-day
// window matches the previous in-memory behaviour and is a deliberate
// "don't spam the same client within a week" guard.
const DEDUP_WINDOW_DAYS = 6;
const wasNotifiedRecently = async (projectId, days) => {
    try {
        const { rows } = await pool.query(
            `SELECT 1 FROM notification_dedup
              WHERE entity_type = 'domain_expiration'
                AND entity_id   = $1
                AND bucket      = $2
                AND sent_at     > NOW() - ($3 || ' days')::interval
              LIMIT 1`,
            [String(projectId), String(days), String(DEDUP_WINDOW_DAYS)]
        );
        return rows.length > 0;
    } catch (err) {
        // If the table doesn't exist (migration not run yet) or DB is
        // unavailable, fail open — we'd rather risk a duplicate alert
        // than silently swallow the email.
        console.error('[Cron] dedup lookup failed:', err.message);
        return false;
    }
};

const markNotified = async (projectId, days) => {
    try {
        await pool.query(
            `INSERT INTO notification_dedup (entity_type, entity_id, bucket, sent_at)
             VALUES ('domain_expiration', $1, $2, NOW())
             ON CONFLICT (entity_type, entity_id, bucket)
             DO UPDATE SET sent_at = EXCLUDED.sent_at`,
            [String(projectId), String(days)]
        );
    } catch (err) {
        console.error('[Cron] dedup insert failed:', err.message);
    }
};

export const startCronJobs = () => {
    // Run every day at 8:00 AM server time
    cron.schedule('0 8 * * *', async () => {
        console.log('[Cron] Running daily system checks...');
        await checkDomainExpirations();
        await generateMonthlyInvoices();
    });

    // Database health-check once a day at 8:05 AM — keeps the connection
    // warm so Supabase doesn't idle it out, and logs any issues.
    cron.schedule('5 8 * * *', async () => {
        try {
            const start = Date.now();
            const result = await pool.query('SELECT 1 AS ok, NOW() AS db_time');
            const latency = Date.now() - start;
            console.log(`[Cron] DB heartbeat OK — ${latency}ms, db_time: ${result.rows[0].db_time}`);
        } catch (error) {
            console.error(`[Cron] DB heartbeat FAILED — ${error.message}`);
        }
    });

    // Live FX rate refresh — once a day at 5:00 AM UTC. open.er-api.com
    // updates its rates at midnight UTC, so 5 AM UTC gives it time to
    // settle. The admin can also trigger a manual refresh from
    // Settings → FX Rates. If the API call fails, the existing rates
    // (whether manual or stale-live) stay untouched — the dashboard's
    // revenue numbers won't break.
    cron.schedule('0 5 * * *', async () => {
        console.log('[Cron] Refreshing live FX rates…');
        try {
            const summary = await refreshAndApply();
            console.log(`[Cron] FX refresh OK — applied ${summary.applied_count} rate(s): ${summary.currencies.join(', ')}`);
        } catch (err) {
            console.error(`[Cron] FX refresh FAILED — ${err.message}. Existing rates unchanged.`);
        }
    });

    console.log('[Server] Cron jobs scheduled successfully.');
};

const checkDomainExpirations = async () => {
    try {
        const query = `
            SELECT cp.id AS project_id, cp.project_name, cp.domain_name, cp.domain_expiration,
                   c.name AS client_name, c.primary_contact_email
            FROM client_projects cp
            JOIN clients c ON cp.client_id = c.id
            WHERE cp.domain_expiration IS NOT NULL
            AND cp.status != 'ARCHIVED'
            AND (
                cp.domain_expiration = CURRENT_DATE + INTERVAL '30 days' OR
                cp.domain_expiration = CURRENT_DATE + INTERVAL '14 days' OR
                cp.domain_expiration = CURRENT_DATE + INTERVAL '7 days'
            )
        `;
        const { rows } = await pool.query(query);

        for (const project of rows) {
            const days = Math.round(
                (new Date(project.domain_expiration) - new Date()) / (1000 * 60 * 60 * 24)
            );

            if (await wasNotifiedRecently(project.project_id, days)) continue;
            await markNotified(project.project_id, days);

            console.log(`[Cron] Sending domain expiration alert for: ${project.domain_name} (T-${days}d)`);

            // 1. Send Professional Email to the Client
            await sendNotificationEmail({
                name: 'BuildWithLami',
                email: 'no-reply@buildwithlami.com',
                toEmail: project.primary_contact_email,
                subject: `Action Required: Domain Expiring Soon (${project.domain_name})`,
                message: `Dear ${project.client_name},\n\nThis is a friendly automated reminder that the domain name for your project, ${project.domain_name}, is set to expire on ${new Date(project.domain_expiration).toDateString()}.\n\nTo avoid any downtime or disruption to your website and services, please log in to your domain registrar to renew it at your earliest convenience.\n\nIf you have already renewed it or need any assistance, please feel free to reply to this email.\n\nBest regards,\nEugene Odibenuah\nBuildWithLami (buildwithlami.com)`
            });

            // 2. Send Alert to Admin (configurable via env)
            if (ADMIN_EMAIL) {
                await sendNotificationEmail({
                    name: 'System Alert',
                    email: 'no-reply@buildwithlami.com',
                    toEmail: ADMIN_EMAIL,
                    subject: `🚨 Client Alerted: Domain Expiring (${project.domain_name})`,
                    message: `An automated domain expiration reminder was just sent to ${project.client_name} (${project.primary_contact_email}) for the domain ${project.domain_name} (Expiring: ${new Date(project.domain_expiration).toDateString()}).`
                });
            }
        }
    } catch (error) {
        console.error('[Cron] Error checking domain expirations:', error);
    }
};

const generateMonthlyInvoices = async () => {
    try {
        // Use the FIRST day of the current month in UTC as the canonical
        // "billing month" reference. This avoids any drift from the
        // server's local timezone and makes the period stable for the
        // entire run.
        const periodDate = await pool.query(`SELECT DATE_TRUNC('month', NOW() AT TIME ZONE 'UTC')::date AS period_start`);
        const periodStart = periodDate.rows[0].period_start; // e.g. 2026-08-01
        // CHAR(7) "YYYY-MM" derived from the same canonical period.
        const retainerPeriod = `${periodStart.getUTCFullYear()}-${String(periodStart.getUTCMonth() + 1).padStart(2, '0')}`;
        const monthName = periodStart.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

        const query = `
            SELECT id, project_name, monthly_fee, client_id
            FROM client_projects
            WHERE payment_type = 'MONTHLY'
            AND status IN ('ACTIVE', 'MAINTENANCE', 'LAUNCHED')
        `;
        const { rows } = await pool.query(query);

        for (const project of rows) {
            // The DB-enforced uniqueness is via the partial unique index
            // `uq_invoices_project_retainer_period` (see migration v41).
            // We rely on the INSERT to fail on conflict rather than doing
            // a fragile pre-check, which closes the race window between
            // two concurrent cron runs.
            let insertedRow;
            try {
                const insertResult = await pool.query(
                    `INSERT INTO invoices
                        (project_id, amount, description, status, due_date, retainer_period)
                     VALUES ($1, $2, $3, 'PENDING', $4::date + INTERVAL '7 days', $5)
                     RETURNING id`,
                    [
                        project.id,
                        project.monthly_fee,
                        `Monthly Retainer - ${monthName}`,
                        periodStart,
                        retainerPeriod,
                    ]
                );
                insertedRow = insertResult.rows[0];
            } catch (err) {
                // 23505 = unique_violation in PostgreSQL.
                if (err && err.code === '23505') {
                    // Already generated for this period — expected on retries.
                    continue;
                }
                throw err;
            }

            console.log(`[Cron] Generated Monthly Invoice for ${project.project_name} (period ${retainerPeriod})`);

            if (ADMIN_EMAIL) {
                await sendNotificationEmail({
                    name: 'System Alert',
                    email: 'no-reply@buildwithlami.com',
                    toEmail: ADMIN_EMAIL,
                    subject: `💰 Monthly Invoice Generated: ${project.project_name}`,
                    message: `A monthly retainer invoice of $${project.monthly_fee} was automatically generated for ${project.project_name} (id: ${insertedRow.id}, period ${retainerPeriod}).\n\nLog in to generate the Paystack link and send it to the client.`
                });
            }
        }
    } catch (error) {
        console.error('[Cron] Error generating monthly invoices:', error);
    }
};
