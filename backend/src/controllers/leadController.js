// ─── src/controllers/leadController.js ───────────────────
// Handles the full lead lifecycle:
//   POST /api/leads              — public form submission (funnel entry)
//   GET  /api/leads              — admin list with optional status filter
//   GET  /api/leads/:id          — admin single lead
//   PATCH /api/leads/:id         — admin updates lead status
//   POST /api/leads/:id/convert  — ACID transaction: lead → client
//   DELETE /api/leads/:id        — remove a lost lead
// ──────────────────────────────────────────────────────────

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import pool from '../config/db.js';
import whatsappService from '../services/whatsappService.js';

// ── Validation Schemas ───────────────────────────────────
const createLeadSchema = z.object({
    full_name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().optional(),
    package_interest: z.string().optional(),
    message: z.string().optional(),
    source: z.string().optional(),
});

const updateLeadSchema = z.object({
    status: z.enum(['NEW', 'CONTACTED', 'CONVERTED', 'LOST']),
});

const convertLeadSchema = z.object({
    project_title: z.string().min(1).optional(),
});

// ── List leads (admin) ───────────────────────────────────
export async function getLeads(req, res) {
    try {
        const { status } = req.query;
        let query = `SELECT * FROM leads`;
        const vals = [];

        if (status) {
            query += ` WHERE status = $1`;
            vals.push(status.toUpperCase());
        }

        query += ` ORDER BY created_at DESC`;

        const { rows } = await pool.query(query, vals);
        return res.json(rows);
    } catch (err) {
        console.error('[Lead] getLeads error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Get single lead (admin) ──────────────────────────────
export async function getLeadById(req, res) {
    try {
        const { rows } = await pool.query(`SELECT * FROM leads WHERE id = $1`, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Lead not found.' });
        return res.json(rows[0]);
    } catch (err) {
        console.error('[Lead] getLeadById error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Create lead (PUBLIC — funnel entry) ──────────────────
export async function createLead(req, res) {
    try {
        const data = createLeadSchema.parse(req.body);

        const { rows } = await pool.query(
            `INSERT INTO leads (full_name, email, phone, package_interest, message, source)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [
                data.full_name,
                data.email,
                data.phone || null,
                data.package_interest || null,
                data.message || null,
                data.source || 'WEBSITE',
            ],
        );

        const lead = rows[0];

        // WhatsApp notifications — fire & forget (don't block the response)
        const adminPhone = process.env.ADMIN_WHATSAPP_PHONE;
        if (adminPhone) {
            whatsappService.notifyNewLead(adminPhone, lead).catch((e) =>
                console.error('[Lead] Admin WhatsApp notify failed:', e.message),
            );
        }
        if (lead.phone) {
            whatsappService.notifyLeadConfirmation(lead.phone, lead.full_name).catch((e) =>
                console.error('[Lead] Lead WhatsApp confirm failed:', e.message),
            );
        }

        return res.status(201).json(lead);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Lead] createLead error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Update lead status (admin) ───────────────────────────
export async function updateLead(req, res) {
    try {
        const { status } = updateLeadSchema.parse(req.body);

        if (status === 'CONVERTED') {
            return res.status(400).json({
                error: 'Use POST /api/leads/:id/convert to convert a lead.',
            });
        }

        const { rows } = await pool.query(
            `UPDATE leads SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
            [status, req.params.id],
        );

        if (rows.length === 0) return res.status(404).json({ error: 'Lead not found.' });
        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Lead] updateLead error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Convert lead → client (ACID transaction) ─────────────
export async function convertLead(req, res) {
    const dbClient = await pool.connect();

    try {
        const { project_title } = convertLeadSchema.parse(req.body);

        // 1. Fetch lead
        const leadResult = await dbClient.query(`SELECT * FROM leads WHERE id = $1`, [req.params.id]);
        if (leadResult.rows.length === 0) return res.status(404).json({ error: 'Lead not found.' });

        const lead = leadResult.rows[0];
        if (lead.status === 'CONVERTED') {
            return res.status(409).json({ error: 'This lead has already been converted.' });
        }

        // 2. Begin transaction
        await dbClient.query('BEGIN');

        // 3a. Create client record
        const clientResult = await dbClient.query(
            `INSERT INTO clients (full_name, email, phone) VALUES ($1, $2, $3) RETURNING *`,
            [lead.full_name, lead.email || null, lead.phone || null],
        );
        const newClient = clientResult.rows[0];

        // 3b. Mark lead as converted
        await dbClient.query(
            `UPDATE leads SET status = 'CONVERTED', updated_at = NOW() WHERE id = $1`,
            [lead.id],
        );

        // 3c. Optionally create a project
        let newProject = null;
        if (project_title) {
            const slug = project_title
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '')
                .slice(0, 60);

            const projectResult = await dbClient.query(
                `INSERT INTO projects (title, slug, status, progress, client_id)
         VALUES ($1, $2, 'PLANNING', 0, $3)
         RETURNING *`,
                [project_title, slug, newClient.id],
            );
            newProject = projectResult.rows[0];
        }

        // 4. Generate magic link token (24h TTL)
        const token = crypto.randomBytes(48).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await dbClient.query(
            `UPDATE clients SET magic_link_token = $1, magic_link_expires = $2, updated_at = NOW() WHERE id = $3`,
            [token, expires, newClient.id],
        );

        // 5. Commit
        await dbClient.query('COMMIT');

        // 6. Send WhatsApp welcome (fire & forget)
        const magicLink = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;
        console.log(`[Lead] Magic link for ${newClient.email}: ${magicLink}`);

        if (newClient.phone) {
            whatsappService
                .notifyClientWelcome(newClient.phone, newClient.full_name, magicLink)
                .catch((e) => console.error('[Lead] Welcome WhatsApp failed:', e.message));
        }

        return res.status(201).json({
            message: 'Lead successfully converted to client.',
            client: newClient,
            project: newProject,
            magic_link: magicLink,
        });
    } catch (err) {
        await dbClient.query('ROLLBACK');
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        if (err.code === '23505') return res.status(409).json({ error: 'A client with this email already exists.' });
        console.error('[Lead] convertLead error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    } finally {
        dbClient.release();
    }
}

// ── Delete lead (admin) ──────────────────────────────────
export async function deleteLead(req, res) {
    try {
        const { rowCount } = await pool.query(`DELETE FROM leads WHERE id = $1`, [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Lead not found.' });
        return res.json({ message: 'Lead deleted.' });
    } catch (err) {
        console.error('[Lead] deleteLead error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
