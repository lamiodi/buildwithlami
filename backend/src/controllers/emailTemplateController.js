// ─── src/controllers/emailTemplateController.js ──────────
// Phase 3 — Email Templates CRUD + render + send.
//
// All admin routes are gated by `requireRole('Owner', 'Administrator')`
// in the router. The render endpoint is open to any authenticated
// admin (used by the CRM "send proposal" picker).
// ──────────────────────────────────────────────────────────

import { z } from 'zod';
import pool from '../config/db.js';
import { renderTemplate, sendTemplatedEmail, loadAndRenderTemplate } from '../services/templateService.js';
import { writeAuditLog, getClientIp } from '../utils/auditLog.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

const templateSchema = z.object({
    name: z.string().min(1),
    subject: z.string().min(1),
    body: z.string().min(1),
    placeholders: z.array(z.string()).optional().default([]),
});

// ── List ────────────────────────────────────────────────
export async function getTemplates(_req, res) {
    try {
        const { rows } = await pool.query(
            `SELECT id, name, subject, body, placeholders, created_at, updated_at
               FROM email_templates
              ORDER BY name ASC`
        );
        return res.json(rows);
    } catch (err) {
        console.error('[EmailTemplates] list error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Get one ─────────────────────────────────────────────
export async function getTemplateById(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid template ID.' });
        const { rows } = await pool.query(
            `SELECT * FROM email_templates WHERE id = $1`, [id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Template not found.' });
        return res.json(rows[0]);
    } catch (err) {
        console.error('[EmailTemplates] get error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Create ──────────────────────────────────────────────
export async function createTemplate(req, res) {
    try {
        const data = templateSchema.parse(req.body);
        const { rows } = await pool.query(
            `INSERT INTO email_templates (name, subject, body, placeholders)
             VALUES ($1, $2, $3, $4::jsonb)
             RETURNING *`,
            [data.name, data.subject, data.body, JSON.stringify(data.placeholders)]
        );

        await writeAuditLog({
            action: 'EMAIL_TEMPLATE_CREATED',
            entityType: 'email_templates',
            entityId: rows[0].id,
            details: { name: data.name },
            user: req.user,
            ipAddress: getClientIp(req),
        });

        return res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        if (err.code === '23505') return res.status(409).json({ error: 'A template with that name already exists.' });
        console.error('[EmailTemplates] create error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Update ──────────────────────────────────────────────
export async function updateTemplate(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid template ID.' });
        const data = templateSchema.parse(req.body);

        const { rows } = await pool.query(
            `UPDATE email_templates
                SET name = $1, subject = $2, body = $3, placeholders = $4::jsonb, updated_at = NOW()
              WHERE id = $5
              RETURNING *`,
            [data.name, data.subject, data.body, JSON.stringify(data.placeholders), id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Template not found.' });

        await writeAuditLog({
            action: 'EMAIL_TEMPLATE_UPDATED',
            entityType: 'email_templates',
            entityId: id,
            details: { name: data.name },
            user: req.user,
            ipAddress: getClientIp(req),
        });

        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        if (err.code === '23505') return res.status(409).json({ error: 'A template with that name already exists.' });
        console.error('[EmailTemplates] update error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Delete ──────────────────────────────────────────────
export async function deleteTemplate(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid template ID.' });
        const { rows } = await pool.query(
            `DELETE FROM email_templates WHERE id = $1 RETURNING id, name`,
            [id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Template not found.' });

        await writeAuditLog({
            action: 'EMAIL_TEMPLATE_DELETED',
            entityType: 'email_templates',
            entityId: id,
            details: { name: rows[0].name },
            user: req.user,
            ipAddress: getClientIp(req),
        });

        return res.json({ success: true, deleted: rows[0] });
    } catch (err) {
        console.error('[EmailTemplates] delete error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Render (preview without sending) ────────────────────
// POST /api/email-templates/:id/render   { data: { client_name: '…', … } }
export async function renderTemplatePreview(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid template ID.' });
        const data = (req.body && req.body.data) || {};
        const rendered = await loadAndRenderTemplate(pool, id, data);
        if (!rendered) return res.status(404).json({ error: 'Template not found.' });
        return res.json(rendered);
    } catch (err) {
        console.error('[EmailTemplates] render error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Send (render + dispatch) ────────────────────────────
// POST /api/email-templates/:id/send
//   { to: 'client@example.com', data: {…} }
export async function sendTemplate(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid template ID.' });

        const bodySchema = z.object({
            to: z.string().email(),
            data: z.record(z.any()).optional().default({}),
        });
        const { to, data } = bodySchema.parse(req.body);

        const rendered = await loadAndRenderTemplate(pool, id, data);
        if (!rendered) return res.status(404).json({ error: 'Template not found.' });

        const result = await sendTemplatedEmail({
            to,
            subject: rendered.subject,
            body: rendered.body,
        });

        if (!result.success) {
            return res.status(502).json({ error: result.error || 'Send failed.' });
        }

        await writeAuditLog({
            action: 'EMAIL_TEMPLATE_SENT',
            entityType: 'email_templates',
            entityId: id,
            details: { to, template: rendered.name, mocked: !!result.mocked },
            user: req.user,
            ipAddress: getClientIp(req),
        });

        return res.json({ success: true, mocked: !!result.mocked, messageId: result.messageId, rendered });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[EmailTemplates] send error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
