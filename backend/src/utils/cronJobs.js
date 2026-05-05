// ─── src/utils/cronJobs.js ───────────────────────────────
// Scheduled tasks that run on a recurring basis.
// ──────────────────────────────────────────────────────────

import cron from 'node-cron';
import pool from '../config/db.js';
import whatsappService from '../services/whatsappService.js';

/**
 * Runs every day at 08:00 AM.
 * Checks for domains expiring within the next 30 days
 * and sends WhatsApp notifications to the linked clients.
 */
export function startDomainExpiryCron() {
    cron.schedule('0 8 * * *', async () => {
        console.log('[CRON] Checking for domains expiring within 30 days…');

        try {
            const { rows } = await pool.query(`
        SELECT d.id, d.name, d.expiry_date,
               c.full_name, c.phone
        FROM   domains d
        JOIN   clients c ON c.id = d.client_id
        WHERE  d.expiry_date <= NOW() + INTERVAL '30 days'
          AND  d.expiry_date >= NOW()
        ORDER  BY d.expiry_date ASC
      `);

            if (rows.length === 0) {
                console.log('[CRON] No domains expiring soon.');
                return;
            }

            for (const domain of rows) {
                if (domain.phone) {
                    await whatsappService.notifyDomainExpiry(
                        domain.phone,
                        domain.name,
                        domain.expiry_date,
                    );
                }
                console.log(`[CRON] Notified ${domain.full_name} about ${domain.name} (expires ${domain.expiry_date}).`);
            }
        } catch (err) {
            console.error('[CRON] Domain expiry check failed:', err.message);
        }
    });

    console.log('[CRON] Domain-expiry job scheduled (daily @ 08:00).');
}
