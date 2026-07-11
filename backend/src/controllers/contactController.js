import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import pool from '../config/db.js';
import { sendNotificationEmail } from '../services/emailService.js';
import { insertLeadRow } from './crmController.js';

// ── Helpers ──────────────────────────────────────────────
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateUUID(id, res) {
    if (!UUID_REGEX.test(id)) {
        res.status(400).json({ error: 'Invalid ID format.' });
        return false;
    }
    return true;
}

// ── Validation ───────────────────────────────────────────
// Note: `subject` was removed in Phase 0 — neither the
// /contact form nor the home-page Contact component sends
// a `subject` field, so the column was always NULL.
const createMessageSchema = z.object({
    full_name: z.string().min(1),
    email: z.string().email(),
    message: z.string().min(1),
    project_type: z.string().optional().nullable(),
    budget: z.string().optional().nullable(),
    timeline: z.string().optional().nullable()
});

export async function submitContactForm(req, res) {
    try {
        const data = createMessageSchema.parse(req.body);

        // Sanitize the inputs before saving/sending
        const cleanName = DOMPurify.sanitize(data.full_name);
        const cleanMessage = DOMPurify.sanitize(data.message);
        const cleanProjectType = data.project_type ? DOMPurify.sanitize(data.project_type) : null;
        const cleanBudget = data.budget ? DOMPurify.sanitize(data.budget) : null;
        const cleanTimeline = data.timeline ? DOMPurify.sanitize(data.timeline) : null;

        const { rows } = await pool.query(
            `INSERT INTO messages (full_name, email, message, project_type, budget, timeline)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, email, created_at`,
            [cleanName, data.email, cleanMessage, cleanProjectType, cleanBudget, cleanTimeline]
        );

        // Phase 3 — auto-tag: every /contact submission also
        // lands in the CRM pipeline at the LEAD stage with
        // source = 'contact_form' and division = 'SOFTWARE'.
        // Failures are swallowed so the public form still
        // succeeds even if the leads table is unavailable.
        insertLeadRow({
            full_name: cleanName,
            email: data.email,
            division: 'SOFTWARE',
            source: 'contact_form',
            notes: cleanMessage
                ? `Project: ${cleanProjectType || '—'} · Budget: ${cleanBudget || '—'} · Timeline: ${cleanTimeline || '—'}\n\n${cleanMessage}`
                : null,
        }).catch(err => console.error('[Contact] lead auto-tag failed:', err.message));

        // Fire-and-forget: don't block the response for email delivery
        sendNotificationEmail({
            name: cleanName,
            email: data.email,
            subject: 'New Contact Form Submission',
            message: cleanMessage
        }).catch(err =>
            console.error('[Contact] Email notification failed:', err.message)
        );

        return res.status(201).json({ success: true, message: 'Message sent successfully.' });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Contact] submitContactForm error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function getMessages(req, res) {
    try {
        const { rows } = await pool.query(`SELECT * FROM messages ORDER BY created_at DESC`);
        return res.json(rows);
    } catch (err) {
        console.error('[Contact] getMessages error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function markMessageRead(req, res) {
    try {
        if (!validateUUID(req.params.id, res)) return;

        const { rows } = await pool.query(
            `UPDATE messages SET is_read = true WHERE id = $1 RETURNING *`,
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Message not found.' });
        return res.json(rows[0]);
    } catch (err) {
        console.error('[Contact] markMessageRead error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function deleteMessage(req, res) {
    try {
        if (!validateUUID(req.params.id, res)) return;

        const { rowCount } = await pool.query(`DELETE FROM messages WHERE id = $1`, [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Message not found.' });
        return res.json({ message: 'Message deleted.' });
    } catch (err) {
        console.error('[Contact] deleteMessage error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
