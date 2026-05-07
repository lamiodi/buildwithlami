import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import pool from '../config/db.js';
import { sendNotificationEmail } from '../services/emailService.js';

// ── Validation ───────────────────────────────────────────
const createMessageSchema = z.object({
    full_name: z.string().min(1),
    email: z.string().email(),
    subject: z.string().optional(),
    message: z.string().min(1)
});

export async function submitContactForm(req, res) {
    try {
        const data = createMessageSchema.parse(req.body);
        
        // Sanitize the inputs before saving/sending
        const cleanName = DOMPurify.sanitize(data.full_name);
        const cleanSubject = data.subject ? DOMPurify.sanitize(data.subject) : null;
        const cleanMessage = DOMPurify.sanitize(data.message);

        const { rows } = await pool.query(
            `INSERT INTO messages (full_name, email, subject, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, created_at`,
            [cleanName, data.email, cleanSubject, cleanMessage]
        );
        
        // Send email notification
        await sendNotificationEmail({
            name: cleanName,
            email: data.email,
            subject: cleanSubject,
            message: cleanMessage
        });
        
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
        const { rowCount } = await pool.query(`DELETE FROM messages WHERE id = $1`, [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Message not found.' });
        return res.json({ message: 'Message deleted.' });
    } catch (err) {
        console.error('[Contact] deleteMessage error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
