// ─── src/controllers/webhookController.js ────────────────
// Handles inbound form submissions from the public frontend.
// ──────────────────────────────────────────────────────────

import { z } from 'zod';
import pool from '../config/db.js';
import whatsappService from '../services/whatsappService.js';

// ── Validation ───────────────────────────────────────────
const contactFormSchema = z.object({
    full_name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    message: z.string().min(1),
});

// ── Handle contact / quote form ──────────────────────────
export async function handleContactForm(req, res) {
    try {
        const data = contactFormSchema.parse(req.body);

        // Upsert the sender as a client so they can receive magic links later.
        const { rows } = await pool.query(
            `INSERT INTO clients (full_name, email, phone)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE
         SET full_name  = EXCLUDED.full_name,
             phone      = COALESCE(EXCLUDED.phone, clients.phone),
             updated_at = NOW()
       RETURNING id`,
            [data.full_name, data.email, data.phone || null],
        );

        const clientId = rows[0].id;
        console.log(`[Webhook] New contact from ${data.full_name} (${data.email}): ${data.message}`);

        await whatsappService.sendTextMessage(
            process.env.ADMIN_WHATSAPP_PHONE || '0000000000',
            `📩 New enquiry from ${data.full_name}\nEmail: ${data.email}\n\n${data.message}`,
        );

        return res.status(201).json({ message: 'Thank you! We will be in touch soon.', clientId });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors });
        }
        console.error('[Webhook] handleContactForm error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
