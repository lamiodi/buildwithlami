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
const createBookingSchema = z.object({
    full_name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional().nullable(),
    division: z.enum(['SURVEY', 'DRONE']),
    service: z.string().min(1),
    location: z.string().optional().nullable(),
    preferred_date: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
});

/**
 * POST /api/bookings — public submission (rate-limited)
 */
export async function createBooking(req, res) {
    try {
        const data = createBookingSchema.parse(req.body);

        const cleanName = DOMPurify.sanitize(data.full_name);
        const cleanService = DOMPurify.sanitize(data.service);
        const cleanLocation = data.location ? DOMPurify.sanitize(data.location) : null;
        const cleanNotes = data.notes ? DOMPurify.sanitize(data.notes) : null;

        const { rows } = await pool.query(
            `INSERT INTO bookings (full_name, email, phone, division, service, location, preferred_date, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, full_name, email, division, service, status, created_at`,
            [
                cleanName,
                data.email,
                data.phone || null,
                data.division,
                cleanService,
                cleanLocation,
                data.preferred_date || null,
                cleanNotes,
            ]
        );

        // Phase 3 — auto-tag: every /api/bookings submission
        // also writes a lead at the LEAD stage. Survey/Drone
        // bookings keep their division. `source = 'booking_form'`
        // so we can distinguish a /contact submission from a
        // /survey or /drone booking in the CRM filters.
        insertLeadRow({
            full_name: cleanName,
            email: data.email,
            phone: data.phone || null,
            division: data.division,
            source: 'booking_form',
            notes: cleanNotes
                ? `Service: ${cleanService}\nLocation: ${cleanLocation || '—'}\nPreferred date: ${data.preferred_date || '—'}\n\n${cleanNotes}`
                : `Service: ${cleanService}\nLocation: ${cleanLocation || '—'}\nPreferred date: ${data.preferred_date || '—'}`,
        }).catch(err => console.error('[Booking] lead auto-tag failed:', err.message));

        // Fire-and-forget notification email to admin
        sendNotificationEmail({
            name: cleanName,
            email: data.email,
            subject: `New ${data.division} Booking: ${cleanService}`,
            message: `New booking request:\n\nService: ${cleanService}\nDivision: ${data.division}\nLocation: ${cleanLocation || 'N/A'}\nPreferred Date: ${data.preferred_date || 'N/A'}\nPhone: ${data.phone || 'N/A'}\nNotes: ${cleanNotes || 'N/A'}`,
        }).catch(err =>
            console.error('[Booking] Email notification failed:', err.message)
        );

        return res.status(201).json({ success: true, booking: rows[0] });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Booking] createBooking error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

/**
 * GET /api/bookings — admin list (with optional division filter)
 */
export async function getBookings(req, res) {
    try {
        const { division, status } = req.query;
        let query = 'SELECT * FROM bookings';
        const params = [];
        const conditions = [];

        if (division) {
            params.push(division);
            conditions.push(`division = $${params.length}`);
        }
        if (status) {
            params.push(status);
            conditions.push(`status = $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY created_at DESC';

        const { rows } = await pool.query(query, params);
        return res.json(rows);
    } catch (err) {
        console.error('[Booking] getBookings error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

/**
 * PATCH /api/bookings/:id/status — update booking status
 */
export async function updateBookingStatus(req, res) {
    try {
        if (!validateUUID(req.params.id, res)) return;

        const statusSchema = z.object({
            status: z.enum(['NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST']),
        });
        const { status } = statusSchema.parse(req.body);

        const { rows } = await pool.query(
            `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
            [status, req.params.id]
        );

        if (rows.length === 0) return res.status(404).json({ error: 'Booking not found.' });
        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Booking] updateBookingStatus error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
