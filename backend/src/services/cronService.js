// ─── src/services/cronService.js ────────────────────────
// Handles scheduled background tasks like Domain Expiration
// Reminders and Automated Monthly Invoicing.
// ──────────────────────────────────────────────────────────

import cron from 'node-cron';
import pool from '../config/db.js';
import { sendNotificationEmail } from './emailService.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_TO;
if (!ADMIN_EMAIL) {
    console.warn('[Cron] ADMIN_EMAIL / EMAIL_TO not set; admin alerts will be skipped.');
}

// Track which (project, threshold) combinations we've already alerted on
// during this process lifetime, so a re-run (e.g. after a restart) doesn't
// spam the same client within a 6-day window. Pair with the on-disk
// `last_notified_at` column in the v6_cron_dedupe migration to survive
// restarts in production.
const recentNotifications = new Map(); // key: `${projectId}:${days}` -> timestamp

const wasNotifiedRecently = (projectId, days) => {
    const key = `${projectId}:${days}`;
    const last = recentNotifications.get(key);
    if (!last) return false;
    return Date.now() - last < 6 * 24 * 60 * 60 * 1000; // 6 days
};

const markNotified = (projectId, days) => {
    recentNotifications.set(`${projectId}:${days}`, Date.now());
};

export const startCronJobs = () => {
    // Run every day at 8:00 AM server time
    cron.schedule('0 8 * * *', async () => {
        console.log('[Cron] Running daily system checks...');
        await checkDomainExpirations();
        await generateMonthlyInvoices();
    });

    // Database health-check every 5 minutes — keeps the connection
    // warm so Supabase doesn't idle it out, and logs any issues.
    cron.schedule('*/5 * * * *', async () => {
        try {
            const start = Date.now();
            const result = await pool.query('SELECT 1 AS ok, NOW() AS db_time');
            const latency = Date.now() - start;
            console.log(`[Cron] DB heartbeat OK — ${latency}ms, db_time: ${result.rows[0].db_time}`);
        } catch (error) {
            console.error(`[Cron] DB heartbeat FAILED — ${error.message}`);
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

            if (wasNotifiedRecently(project.project_id, days)) continue;
            markNotified(project.project_id, days);

            console.log(`[Cron] Sending domain expiration alert for: ${project.domain_name} (T-${days}d)`);

            // 1. Send Professional Email to the Client
            await sendNotificationEmail({
                name: 'buildwithlami.dev',
                email: 'no-reply@buildwithlami.dev',
                toEmail: project.primary_contact_email,
                subject: `Action Required: Domain Expiring Soon (${project.domain_name})`,
                message: `Dear ${project.client_name},\n\nThis is a friendly automated reminder that the domain name for your project, ${project.domain_name}, is set to expire on ${new Date(project.domain_expiration).toDateString()}.\n\nTo avoid any downtime or disruption to your website and services, please log in to your domain registrar to renew it at your earliest convenience.\n\nIf you have already renewed it or need any assistance, please feel free to reply to this email.\n\nBest regards,\nEugene Odibenuah\nbuildwithlami.dev`
            });

            // 2. Send Alert to Admin (configurable via env)
            if (ADMIN_EMAIL) {
                await sendNotificationEmail({
                    name: 'System Alert',
                    email: 'no-reply@buildwithlami.dev',
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
        const query = `
            SELECT id, project_name, monthly_fee, client_id
            FROM client_projects
            WHERE payment_type = 'MONTHLY'
            AND status IN ('ACTIVE', 'MAINTENANCE', 'LAUNCHED')
        `;
        const { rows } = await pool.query(query);

        for (const project of rows) {
            const invoiceCheckQuery = `
                SELECT id FROM invoices
                WHERE project_id = $1
                AND description LIKE 'Monthly Retainer%'
                AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
            `;
            const invoiceCheck = await pool.query(invoiceCheckQuery, [project.id]);

            if (invoiceCheck.rows.length === 0) {
                const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

                const insertResult = await pool.query(
                    `INSERT INTO invoices (project_id, amount, description, status, due_date)
                     VALUES ($1, $2, $3, 'PENDING', CURRENT_DATE + INTERVAL '7 days')
                     RETURNING id`,
                    [project.id, project.monthly_fee, `Monthly Retainer - ${monthName}`]
                );

                console.log(`[Cron] Generated Monthly Invoice for ${project.project_name}`);

                if (ADMIN_EMAIL) {
                    await sendNotificationEmail({
                        name: 'System Alert',
                        email: 'no-reply@buildwithlami.dev',
                        toEmail: ADMIN_EMAIL,
                        subject: `💰 Monthly Invoice Generated: ${project.project_name}`,
                        message: `A monthly retainer invoice of $${project.monthly_fee} was automatically generated for ${project.project_name} (id: ${insertResult.rows[0].id}).\n\nLog in to generate the Paystack link and send it to the client.`
                    });
                }
            }
        }
    } catch (error) {
        console.error('[Cron] Error generating monthly invoices:', error);
    }
};
