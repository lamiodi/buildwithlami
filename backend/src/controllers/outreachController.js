// ─── src/controllers/outreachController.js ────────────────
// Admin OS Phase 4 — Outreach (blueprint §18–§22, §61, §95).
//
// Endpoints (all under /api/outreach, admin-gated except the
// public unsubscribe):
//   GET    /prospects                 — list (status/q/due/sequence filters)
//   POST   /prospects                 — create (duplicate email → 409)
//   GET    /prospects/:id             — detail: messages + audits + sequence
//   PATCH  /prospects/:id             — update fields/status (side effects on
//                                       UNSUBSCRIBED/BOUNCED/NOT_INTERESTED)
//   DELETE /prospects/:id             — hard delete (cascades messages/audits)
//   POST   /prospects/:id/generate-draft  — §21 "Generate Outreach Draft"
//   POST   /prospects/:id/send        — send draft / next sequence step / one-off
//   POST   /prospects/:id/record-reply — inbound reply → REPLIED + stop sequence
//   POST   /prospects/:id/convert     — §22 convert to lead
//   PATCH  /messages/:id              — edit an unsent draft
//   POST   /messages/:id/cancel       — cancel a queued/draft message
//   GET/POST /sequences, GET/PATCH/DELETE /sequences/:id
//   GET/POST /audits, PATCH/DELETE /audits/:id
//   GET/POST /suppressions, DELETE /suppressions/:id
//   GET/PATCH /settings               — daily limit / window / pause / mailbox
//   GET    /analytics                 — §61 outreach numbers
//   GET    /unsubscribe/:token        — PUBLIC, token is the auth
// ──────────────────────────────────────────────────────────

import { z } from 'zod';
import pool from '../config/db.js';
import { writeAuditLog, getClientIp } from '../utils/auditLog.js';
import {
    isUuid,
    getOutreachSettings,
    isSuppressed,
    suppressEmail,
    sendProspectEmail,
    sendNextSequenceStep,
    recordProspectReply,
    generateInitialDraft,
    processDueFollowUps,
} from '../services/outreachService.js';

const PROSPECT_STATUSES = [
    'RESEARCH', 'READY_TO_CONTACT', 'EMAIL_DRAFTED', 'SENT',
    'FOLLOW_UP_1', 'FOLLOW_UP_2', 'FOLLOW_UP_3',
    'REPLIED', 'INTERESTED', 'NOT_INTERESTED',
    'UNSUBSCRIBED', 'BOUNCED', 'CONVERTED',
];

const hhmm = /^\d{2}:\d{2}$/;

// ── Schemas ──────────────────────────────────────────────
const prospectCreateSchema = z.object({
    company_name: z.string().min(1, 'Company name is required'),
    contact_name: z.string().optional().nullable(),
    email: z.string().email('Valid email is required'),
    website: z.string().optional().nullable(),
    instagram: z.string().optional().nullable(),
    industry: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    source: z.string().optional().nullable(),
    research_notes: z.string().optional().nullable(),
    website_issues: z.string().optional().nullable(),
    service_opportunity: z.string().optional().nullable(),
    estimated_value: z.number().nonnegative().optional().nullable(),
    estimated_value_currency: z.string().length(3).optional(),
    sequence_id: z.string().uuid().optional().nullable(),
});

const prospectUpdateSchema = z.object({
    company_name: z.string().min(1).optional(),
    contact_name: z.string().optional().nullable(),
    email: z.string().email().optional(),
    website: z.string().optional().nullable(),
    instagram: z.string().optional().nullable(),
    industry: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    source: z.string().optional().nullable(),
    research_notes: z.string().optional().nullable(),
    website_issues: z.string().optional().nullable(),
    service_opportunity: z.string().optional().nullable(),
    estimated_value: z.number().nonnegative().optional().nullable(),
    estimated_value_currency: z.string().length(3).optional(),
    status: z.enum(PROSPECT_STATUSES).optional(),
    sequence_id: z.string().uuid().nullable().optional(),
    do_not_contact: z.boolean().optional(),
});

const sequenceCreateSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
    stop_on_reply: z.boolean().optional(),
    steps: z.array(z.object({
        step_order: z.number().int().positive().optional(),
        delay_days: z.number().int().nonnegative().default(0),
        subject: z.string().min(1, 'Subject is required'),
        body: z.string().min(1, 'Body is required'),
        is_active: z.boolean().optional(),
    })).default([]),
});

const sequenceUpdateSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
    stop_on_reply: z.boolean().optional(),
    steps: z.array(z.object({
        step_order: z.number().int().positive().optional(),
        delay_days: z.number().int().nonnegative().default(0),
        subject: z.string().min(1),
        body: z.string().min(1),
        is_active: z.boolean().optional(),
    })).optional(),
});

const auditCreateSchema = z.object({
    prospect_id: z.string().uuid().optional().nullable(),
    website: z.string().min(1, 'Website is required'),
    mobile_notes: z.string().optional().nullable(),
    design_notes: z.string().optional().nullable(),
    performance_notes: z.string().optional().nullable(),
    seo_notes: z.string().optional().nullable(),
    cta_notes: z.string().optional().nullable(),
    ecommerce_available: z.boolean().optional().nullable(),
    booking_available: z.boolean().optional().nullable(),
    analytics_present: z.boolean().optional().nullable(),
    ssl_valid: z.boolean().optional().nullable(),
    contact_options: z.string().optional().nullable(),
    opportunities: z.string().optional().nullable(),
});

const auditUpdateSchema = auditCreateSchema.partial();

const suppressionCreateSchema = z.object({
    email: z.string().email('Valid email is required'),
    reason: z.enum(['UNSUBSCRIBED', 'BOUNCED', 'MANUAL', 'COMPLAINT']).default('MANUAL'),
    note: z.string().optional().nullable(),
});

const settingsUpdateSchema = z.object({
    daily_send_limit: z.number().int().min(1).max(200).optional(),
    send_window_start: z.string().regex(hhmm, 'Use HH:MM').optional(),
    send_window_end: z.string().regex(hhmm, 'Use HH:MM').optional(),
    paused: z.boolean().optional(),
    from_name: z.string().min(1).optional(),
    reply_to: z.string().email().nullable().optional(),
});

// ── Prospects ────────────────────────────────────────────
export async function listProspects(req, res) {
    try {
        const { status, q, due, sequence_id, limit } = req.query;
        const conditions = [];
        const params = [];

        if (status && PROSPECT_STATUSES.includes(status)) {
            params.push(status);
            conditions.push(`p.status = $${params.length}`);
        }
        if (sequence_id && isUuid(sequence_id)) {
            params.push(sequence_id);
            conditions.push(`p.sequence_id = $${params.length}`);
        }
        if (due === '1' || due === 'true') {
            conditions.push(`p.next_follow_up_at IS NOT NULL AND p.next_follow_up_at <= NOW()`);
        }
        if (q && typeof q === 'string' && q.trim().length >= 2) {
            params.push(`%${q.trim()}%`);
            const i = params.length;
            conditions.push(`(p.company_name ILIKE $${i} OR p.contact_name ILIKE $${i} OR p.email ILIKE $${i} OR p.website ILIKE $${i} OR p.instagram ILIKE $${i})`);
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const lim = Math.min(parseInt(limit, 10) || 500, 1000);
        params.push(lim);

        const { rows } = await pool.query(
            `SELECT p.*,
                    s.name AS sequence_name,
                    (SELECT COUNT(*)::int FROM outreach_messages m
                      WHERE m.prospect_id = p.id AND m.direction = 'OUTBOUND' AND m.status = 'SENT') AS sends,
                    (SELECT COUNT(*)::int FROM outreach_messages m
                      WHERE m.prospect_id = p.id AND m.direction = 'INBOUND') AS replies,
                    (SELECT COUNT(*)::int FROM website_audits a WHERE a.prospect_id = p.id) AS audits
               FROM prospects p
               LEFT JOIN outreach_sequences s ON s.id = p.sequence_id
               ${where}
              ORDER BY (p.next_follow_up_at IS NOT NULL) DESC, p.next_follow_up_at ASC, p.updated_at DESC
              LIMIT $${params.length}`,
            params
        );
        return res.json(rows);
    } catch (err) {
        console.error('[Outreach] listProspects error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function createProspect(req, res) {
    try {
        const data = prospectCreateSchema.parse(req.body);

        const dupe = await pool.query(
            `SELECT id, company_name, status FROM prospects WHERE lower(email) = lower($1) LIMIT 1`,
            [data.email]
        );
        if (dupe.rows.length > 0) {
            return res.status(409).json({
                error: `A prospect for ${dupe.rows[0].company_name} already exists with this email.`,
                prospect: dupe.rows[0],
            });
        }
        const suppressed = await isSuppressed(data.email);
        if (suppressed) {
            return res.status(409).json({ error: 'This email is on the suppression list — remove it there first if this is genuinely a new contact.' });
        }

        if (data.sequence_id) {
            const seq = await pool.query(`SELECT id FROM outreach_sequences WHERE id = $1 AND is_active = TRUE`, [data.sequence_id]);
            if (seq.rows.length === 0) return res.status(400).json({ error: 'Sequence not found or inactive.' });
        }

        const { rows } = await pool.query(
            `INSERT INTO prospects (
                 company_name, contact_name, email, website, instagram, industry,
                 country, city, source, research_notes, website_issues,
                 service_opportunity, estimated_value, estimated_value_currency, sequence_id
             ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
             RETURNING *`,
            [
                data.company_name, data.contact_name || null, data.email,
                data.website || null, data.instagram || null, data.industry || null,
                data.country || null, data.city || null, data.source || null,
                data.research_notes || null, data.website_issues || null,
                data.service_opportunity || null, data.estimated_value ?? null,
                (data.estimated_value_currency || 'NGN').toUpperCase(), data.sequence_id || null,
            ]
        );

        await writeAuditLog({
            action: 'PROSPECT_CREATED',
            entityType: 'prospects',
            entityId: rows[0].id,
            details: { company: data.company_name, email: data.email },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Outreach] createProspect error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function getProspect(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid prospect ID.' });

        const { rows } = await pool.query(
            `SELECT p.*, s.name AS sequence_name, s.stop_on_reply,
                    l.id AS lead_id, l.full_name AS lead_name
               FROM prospects p
               LEFT JOIN outreach_sequences s ON s.id = p.sequence_id
               LEFT JOIN leads l ON l.id = p.converted_lead_id
              WHERE p.id = $1`,
            [id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Prospect not found.' });
        const prospect = rows[0];

        const [messages, audits, steps] = await Promise.all([
            pool.query(
                `SELECT m.*, st.step_order, st.delay_days
                   FROM outreach_messages m
                   LEFT JOIN outreach_sequence_steps st ON st.id = m.step_id
                  WHERE m.prospect_id = $1
                  ORDER BY m.created_at ASC LIMIT 200`,
                [id]
            ),
            pool.query(
                `SELECT * FROM website_audits WHERE prospect_id = $1 ORDER BY created_at DESC`,
                [id]
            ),
            prospect.sequence_id
                ? pool.query(
                    `SELECT * FROM outreach_sequence_steps WHERE sequence_id = $1 ORDER BY step_order`,
                    [prospect.sequence_id]
                )
                : Promise.resolve({ rows: [] }),
        ]);

        return res.json({
            ...prospect,
            messages: messages.rows,
            audits: audits.rows,
            sequence_steps: steps.rows,
        });
    } catch (err) {
        console.error('[Outreach] getProspect error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function updateProspect(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid prospect ID.' });
        const data = prospectUpdateSchema.parse(req.body);

        const before = await pool.query(`SELECT * FROM prospects WHERE id = $1`, [id]);
        if (before.rows.length === 0) return res.status(404).json({ error: 'Prospect not found.' });
        const prev = before.rows[0];

        if (data.sequence_id) {
            const seq = await pool.query(`SELECT id FROM outreach_sequences WHERE id = $1 AND is_active = TRUE`, [data.sequence_id]);
            if (seq.rows.length === 0) return res.status(400).json({ error: 'Sequence not found or inactive.' });
        }

        // Side-effect statuses (blueprint §19): unsubscribes and bounces
        // permanently suppress the address; NOT_INTERESTED just stops the
        // pending follow-ups without blocking future manual contact.
        if (data.status === 'UNSUBSCRIBED') {
            await suppressEmail(prev.email, 'UNSUBSCRIBED', 'Prospect status set to UNSUBSCRIBED');
        }
        if (data.status === 'BOUNCED') {
            await suppressEmail(prev.email, 'BOUNCED', 'Prospect status set to BOUNCED');
        }
        if (data.status === 'NOT_INTERESTED') {
            await pool.query(
                `UPDATE outreach_messages
                    SET status = 'CANCELLED', error = 'Cancelled — not interested', updated_at = NOW()
                  WHERE prospect_id = $1 AND direction = 'OUTBOUND' AND status IN ('DRAFT','QUEUED')`,
                [id]
            );
        }
        if (data.status && ['UNSUBSCRIBED', 'BOUNCED', 'NOT_INTERESTED', 'CONVERTED', 'REPLIED', 'INTERESTED'].includes(data.status)) {
            data.next_follow_up_at = null; // handled below via SQL
        }

        const allowedKeys = [
            'company_name', 'contact_name', 'email', 'website', 'instagram', 'industry',
            'country', 'city', 'source', 'research_notes', 'website_issues',
            'service_opportunity', 'estimated_value', 'estimated_value_currency',
            'status', 'sequence_id', 'do_not_contact',
        ];
        const fields = Object.keys(data).filter((k) => allowedKeys.includes(k));
        if (fields.length === 0) return res.status(400).json({ error: 'No updatable fields provided.' });

        const setClauses = fields.map((k, i) => `${k} = $${i + 1}`);
        const values = fields.map((k) => data[k] ?? null);
        values.push(id);

        let extraSet = '';
        if (data.status === 'UNSUBSCRIBED') extraSet += `, unsubscribed_at = NOW(), do_not_contact = TRUE`;
        if (data.status === 'BOUNCED') extraSet += `, do_not_contact = TRUE`;
        if (data.status && ['UNSUBSCRIBED', 'BOUNCED', 'NOT_INTERESTED', 'CONVERTED', 'REPLIED', 'INTERESTED'].includes(data.status)) {
            extraSet += `, next_follow_up_at = NULL`;
        }
        if (data.sequence_id !== undefined && !data.sequence_id) extraSet += `, next_follow_up_at = NULL`;

        const { rows } = await pool.query(
            `UPDATE prospects SET ${setClauses.join(', ')}${extraSet}, updated_at = NOW()
              WHERE id = $${values.length} RETURNING *`,
            values
        );

        await writeAuditLog({
            action: 'PROSPECT_UPDATED',
            entityType: 'prospects',
            entityId: id,
            details: { fields, fromStatus: prev.status, toStatus: data.status || prev.status },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Outreach] updateProspect error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function deleteProspect(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid prospect ID.' });
        const { rowCount } = await pool.query(`DELETE FROM prospects WHERE id = $1`, [id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Prospect not found.' });
        await writeAuditLog({
            action: 'PROSPECT_DELETED',
            entityType: 'prospects',
            entityId: id,
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.json({ success: true });
    } catch (err) {
        console.error('[Outreach] deleteProspect error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function generateDraft(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid prospect ID.' });
        const result = await generateInitialDraft(id);
        if (!result.ok) {
            return res.status(result.reason === 'prospect_not_found' ? 404 : 400).json({ error: result.reason });
        }
        if (!result.reused) {
            await pool.query(
                `UPDATE prospects
                    SET status = CASE WHEN status IN ('RESEARCH', 'READY_TO_CONTACT') THEN 'EMAIL_DRAFTED' ELSE status END,
                        updated_at = NOW()
                  WHERE id = $1`,
                [id]
            );
        }
        await writeAuditLog({
            action: 'OUTREACH_DRAFT_GENERATED',
            entityType: 'prospects',
            entityId: id,
            details: { messageId: result.message.id, reused: !!result.reused, source: result.source || 'rules' },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.json({ success: true, message: result.message, reused: !!result.reused, source: result.source || 'rules' });
    } catch (err) {
        console.error('[Outreach] generateDraft error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

const sendSchema = z.object({
    message_id: z.string().uuid().optional(),
    subject: z.string().optional(),
    body: z.string().optional(),
});

export async function sendProspect(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid prospect ID.' });
        const data = sendSchema.parse(req.body || {});

        let message = null;
        if (data.message_id) {
            const { rows } = await pool.query(
                `SELECT * FROM outreach_messages WHERE id = $1 AND prospect_id = $2`,
                [data.message_id, id]
            );
            if (rows.length === 0) return res.status(404).json({ error: 'Draft not found for this prospect.' });
            if (!['DRAFT', 'QUEUED'].includes(rows[0].status)) {
                return res.status(400).json({ error: `Message is already ${rows[0].status}.` });
            }
            message = rows[0];
        }

        // Three send modes, in priority order (blueprint §23-style
        // explicit action beats implicit progression):
        //   1. send a specific draft          (message_id)
        //   2. send a one-off custom email    (subject + body)
        //   3. send the next sequence step    (nothing given)
        let result;
        if (message || data.subject || data.body) {
            result = await sendProspectEmail({
                prospectId: id,
                message,
                subject: data.subject,
                body: data.body,
                automated: false,
                user: req.user,
                ipAddress: getClientIp(req),
            });
        } else {
            result = await sendNextSequenceStep(id, { automated: false, user: req.user, ipAddress: getClientIp(req) });
        }

        if (!result.ok) {
            const messages = {
                paused: 'Outreach is globally paused — resume it in Outreach → Settings.',
                daily_limit_reached: `Daily send limit reached (${result.guards?.limit}). Sends reset at midnight.`,
                suppressed: 'This address is on the suppression list.',
                do_not_contact: 'This prospect is flagged do-not-contact.',
                prospect_unsubscribed: 'This prospect unsubscribed.',
                prospect_bounced: 'This address bounced previously.',
                prospect_replied: 'This prospect already replied — respond instead of sending more outreach.',
                prospect_converted: 'This prospect was already converted to a lead.',
                step_already_sent: 'This sequence step was already sent.',
                no_active_sequence: 'No sequence step to send — attach a sequence or provide subject + body.',
                sequence_inactive: 'The attached sequence is deactivated.',
                sequence_complete: 'The sequence is already complete — no steps left to send.',
                missing_subject_or_body: 'Provide a subject and body, or attach a sequence.',
            };
            return res.status(409).json({ error: messages[result.reason] || `Send blocked: ${result.reason}.`, reason: result.reason });
        }
        return res.json({ success: true, message: result.message, prospect: result.prospect, guards: result.guards });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Outreach] sendProspect error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

const replySchema = z.object({
    subject: z.string().optional().nullable(),
    body: z.string().optional().nullable(),
});

export async function recordReply(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid prospect ID.' });
        const data = replySchema.parse(req.body || {});
        const result = await recordProspectReply({
            prospectId: id,
            subject: data.subject,
            body: data.body,
            user: req.user,
            ipAddress: getClientIp(req),
        });
        if (!result.ok) return res.status(404).json({ error: 'Prospect not found.' });
        return res.json({ success: true, prospect: result.prospect, message: result.message, cancelledMessages: result.cancelledMessages });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Outreach] recordReply error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

const convertSchema = z.object({
    division: z.enum(['SOFTWARE', 'SURVEY', 'DRONE']).optional(),
});

export async function convertProspect(req, res) {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid prospect ID.' });
        const body = convertSchema.parse(req.body || {});

        await client.query('BEGIN');
        const pRes = await client.query(`SELECT * FROM prospects WHERE id = $1 FOR UPDATE`, [id]);
        if (pRes.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Prospect not found.' }); }
        const prospect = pRes.rows[0];

        if (prospect.converted_lead_id) {
            const lead = await client.query(`SELECT * FROM leads WHERE id = $1`, [prospect.converted_lead_id]);
            await client.query('COMMIT');
            return res.json({ success: true, lead: lead.rows[0], alreadyConverted: true });
        }

        // Preserve the outreach history in the lead notes (§22).
        const parts = [];
        if (prospect.research_notes) parts.push(`Research: ${prospect.research_notes}`);
        if (prospect.website_issues) parts.push(`Website issues: ${prospect.website_issues}`);
        if (prospect.service_opportunity) parts.push(`Opportunity: ${prospect.service_opportunity}`);
        if (prospect.website) parts.push(`Website: ${prospect.website}`);
        if (prospect.instagram) parts.push(`Instagram: ${prospect.instagram}`);
        const auditRes = await client.query(
            `SELECT opportunities FROM website_audits WHERE prospect_id = $1 ORDER BY created_at DESC LIMIT 1`,
            [id]
        );
        if (auditRes.rows[0]?.opportunities) parts.push(`Audit: ${auditRes.rows[0].opportunities}`);
        const lastReply = await client.query(
            `SELECT subject, LEFT(body, 300) AS snippet FROM outreach_messages
              WHERE prospect_id = $1 AND direction = 'INBOUND'
              ORDER BY created_at DESC LIMIT 1`,
            [id]
        );
        if (lastReply.rows[0]) parts.push(`Last reply (${lastReply.rows[0].subject}): ${lastReply.rows[0].snippet}`);
        const notes = parts.length > 0
            ? `[cold_outreach] Converted from outreach.\n${parts.join('\n')}`
            : '[cold_outreach] Converted from outreach.';

        const leadInsert = await client.query(
            `INSERT INTO leads (full_name, email, phone, division, source, notes, stage)
             VALUES ($1, $2, NULL, $3, 'cold_outreach', $4, 'LEAD') RETURNING *`,
            [
                prospect.contact_name || prospect.company_name,
                prospect.email,
                body.division || 'SOFTWARE',
                notes,
            ]
        );
        const lead = leadInsert.rows[0];

        await client.query(
            `UPDATE prospects
                SET status = 'CONVERTED', converted_lead_id = $1, do_not_contact = TRUE,
                    next_follow_up_at = NULL, updated_at = NOW()
              WHERE id = $2`,
            [lead.id, id]
        );
        await client.query(
            `UPDATE outreach_messages
                SET status = 'CANCELLED', error = 'Cancelled — converted to lead', updated_at = NOW()
              WHERE prospect_id = $1 AND direction = 'OUTBOUND' AND status IN ('DRAFT','QUEUED')`,
            [id]
        );
        await client.query('COMMIT');

        await writeAuditLog({
            action: 'PROSPECT_CONVERTED',
            entityType: 'prospects',
            entityId: id,
            details: { leadId: lead.id },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.status(201).json({ success: true, lead });
    } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Outreach] convertProspect error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    } finally {
        client.release();
    }
}

// ── Messages ─────────────────────────────────────────────
const messageUpdateSchema = z.object({
    subject: z.string().min(1).optional(),
    body: z.string().min(1).optional(),
});

export async function updateMessage(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid message ID.' });
        const data = messageUpdateSchema.parse(req.body);
        const fields = Object.keys(data);
        if (fields.length === 0) return res.status(400).json({ error: 'Nothing to update.' });

        const setClauses = fields.map((k, i) => `${k} = $${i + 1}`);
        const values = fields.map((k) => data[k]);
        values.push(id);
        const { rows } = await pool.query(
            `UPDATE outreach_messages SET ${setClauses.join(', ')}, updated_at = NOW()
              WHERE id = $${values.length} AND status IN ('DRAFT', 'QUEUED')
              RETURNING *`,
            values
        );
        if (rows.length === 0) return res.status(400).json({ error: 'Only unsent drafts can be edited.' });
        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Outreach] updateMessage error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function cancelMessage(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid message ID.' });
        const { rows } = await pool.query(
            `UPDATE outreach_messages
                SET status = 'CANCELLED', error = 'Cancelled by admin', updated_at = NOW()
              WHERE id = $1 AND status IN ('DRAFT', 'QUEUED')
              RETURNING *`,
            [id]
        );
        if (rows.length === 0) return res.status(400).json({ error: 'Message is not cancellable.' });
        return res.json(rows[0]);
    } catch (err) {
        console.error('[Outreach] cancelMessage error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Sequences ────────────────────────────────────────────
async function stepsFor(sequenceId) {
    const { rows } = await pool.query(
        `SELECT * FROM outreach_sequence_steps WHERE sequence_id = $1 ORDER BY step_order`,
        [sequenceId]
    );
    return rows;
}

export async function listSequences(_req, res) {
    try {
        const { rows } = await pool.query(
            `SELECT s.*,
                    (SELECT COUNT(*)::int FROM prospects p WHERE p.sequence_id = s.id) AS prospect_count,
                    (SELECT COUNT(*)::int FROM outreach_messages m
                      WHERE m.sequence_id = s.id AND m.direction = 'OUTBOUND' AND m.status = 'SENT') AS sends
               FROM outreach_sequences s
              ORDER BY s.created_at ASC`
        );
        const withSteps = await Promise.all(rows.map(async (s) => ({ ...s, steps: await stepsFor(s.id) })));
        return res.json(withSteps);
    } catch (err) {
        console.error('[Outreach] listSequences error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function createSequence(req, res) {
    const client = await pool.connect();
    try {
        const data = sequenceCreateSchema.parse(req.body);
        await client.query('BEGIN');
        const seqRes = await client.query(
            `INSERT INTO outreach_sequences (name, description, is_active, stop_on_reply)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [data.name, data.description || null, data.is_active ?? true, data.stop_on_reply ?? true]
        );
        const sequence = seqRes.rows[0];
        let order = 0;
        for (const step of data.steps) {
            order += 1;
            await client.query(
                `INSERT INTO outreach_sequence_steps (sequence_id, step_order, delay_days, subject, body, is_active)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [sequence.id, step.step_order || order, step.delay_days ?? 0, step.subject, step.body, step.is_active ?? true]
            );
        }
        await client.query('COMMIT');

        await writeAuditLog({
            action: 'OUTREACH_SEQUENCE_CREATED',
            entityType: 'outreach_sequences',
            entityId: sequence.id,
            details: { name: data.name, steps: data.steps.length },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.status(201).json({ ...sequence, steps: await stepsFor(sequence.id) });
    } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Outreach] createSequence error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    } finally {
        client.release();
    }
}

export async function getSequence(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid sequence ID.' });
        const { rows } = await pool.query(`SELECT * FROM outreach_sequences WHERE id = $1`, [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Sequence not found.' });
        return res.json({ ...rows[0], steps: await stepsFor(id) });
    } catch (err) {
        console.error('[Outreach] getSequence error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function updateSequence(req, res) {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid sequence ID.' });
        const data = sequenceUpdateSchema.parse(req.body);

        await client.query('BEGIN');
        const existing = await client.query(`SELECT * FROM outreach_sequences WHERE id = $1 FOR UPDATE`, [id]);
        if (existing.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Sequence not found.' }); }

        const meta = {};
        for (const k of ['name', 'description', 'is_active', 'stop_on_reply']) {
            if (data[k] !== undefined) meta[k] = data[k];
        }
        if (Object.keys(meta).length > 0) {
            const sets = Object.keys(meta).map((k, i) => `${k} = $${i + 1}`);
            await client.query(
                `UPDATE outreach_sequences SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${Object.keys(meta).length + 1}`,
                [...Object.values(meta), id]
            );
        }

        if (data.steps) {
            // Replace-all strategy: FK is ON DELETE SET NULL so already-sent
            // messages keep their subject/body history in outreach_messages.
            await client.query(`DELETE FROM outreach_sequence_steps WHERE sequence_id = $1`, [id]);
            let order = 0;
            for (const step of data.steps) {
                order += 1;
                await client.query(
                    `INSERT INTO outreach_sequence_steps (sequence_id, step_order, delay_days, subject, body, is_active)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [id, step.step_order || order, step.delay_days ?? 0, step.subject, step.body, step.is_active ?? true]
                );
            }
        }
        await client.query('COMMIT');

        await writeAuditLog({
            action: 'OUTREACH_SEQUENCE_UPDATED',
            entityType: 'outreach_sequences',
            entityId: id,
            details: { fields: Object.keys(data), stepsReplaced: data.steps ? data.steps.length : 0 },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.json({ ...(meta.name ? { name: meta.name } : {}), steps: await stepsFor(id) });
    } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Outreach] updateSequence error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    } finally {
        client.release();
    }
}

export async function deleteSequence(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid sequence ID.' });

        const inUse = await pool.query(`SELECT COUNT(*)::int AS n FROM prospects WHERE sequence_id = $1`, [id]);
        if (inUse.rows[0].n > 0) {
            return res.status(409).json({ error: `${inUse.rows[0].n} prospect(s) are attached — deactivate the sequence instead.` });
        }
        const { rowCount } = await pool.query(`DELETE FROM outreach_sequences WHERE id = $1`, [id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Sequence not found.' });
        await writeAuditLog({
            action: 'OUTREACH_SEQUENCE_DELETED',
            entityType: 'outreach_sequences',
            entityId: id,
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.json({ success: true });
    } catch (err) {
        console.error('[Outreach] deleteSequence error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Website audits (§21) ─────────────────────────────────
export async function listAudits(req, res) {
    try {
        const { prospect_id, q, limit } = req.query;
        const conditions = [];
        const params = [];
        if (prospect_id && isUuid(prospect_id)) {
            params.push(prospect_id);
            conditions.push(`a.prospect_id = $${params.length}`);
        }
        if (q && q.trim().length >= 2) {
            params.push(`%${q.trim()}%`);
            conditions.push(`(a.website ILIKE $${params.length} OR p.company_name ILIKE $${params.length})`);
        }
        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const lim = Math.min(parseInt(limit, 10) || 200, 500);
        params.push(lim);
        const { rows } = await pool.query(
            `SELECT a.*, p.company_name, p.contact_name, p.email AS prospect_email
               FROM website_audits a
               LEFT JOIN prospects p ON p.id = a.prospect_id
               ${where}
              ORDER BY a.created_at DESC
              LIMIT $${params.length}`,
            params
        );
        return res.json(rows);
    } catch (err) {
        console.error('[Outreach] listAudits error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function createAudit(req, res) {
    try {
        const data = auditCreateSchema.parse(req.body);
        if (data.prospect_id) {
            const p = await pool.query(`SELECT id FROM prospects WHERE id = $1`, [data.prospect_id]);
            if (p.rows.length === 0) return res.status(400).json({ error: 'Prospect not found.' });
        }
        const { rows } = await pool.query(
            `INSERT INTO website_audits (
                 prospect_id, website, mobile_notes, design_notes, performance_notes,
                 seo_notes, cta_notes, ecommerce_available, booking_available,
                 analytics_present, ssl_valid, contact_options, opportunities, created_by
             ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
            [
                data.prospect_id || null, data.website, data.mobile_notes || null,
                data.design_notes || null, data.performance_notes || null,
                data.seo_notes || null, data.cta_notes || null,
                data.ecommerce_available ?? null, data.booking_available ?? null,
                data.analytics_present ?? null, data.ssl_valid ?? null,
                data.contact_options || null, data.opportunities || null,
                req.user?.id || null,
            ]
        );
        await writeAuditLog({
            action: 'WEBSITE_AUDIT_CREATED',
            entityType: 'website_audits',
            entityId: rows[0].id,
            details: { website: data.website, prospectId: data.prospect_id || null },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Outreach] createAudit error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function updateAudit(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid audit ID.' });
        const data = auditUpdateSchema.parse(req.body);
        const allowedKeys = [
            'prospect_id', 'website', 'mobile_notes', 'design_notes', 'performance_notes',
            'seo_notes', 'cta_notes', 'ecommerce_available', 'booking_available',
            'analytics_present', 'ssl_valid', 'contact_options', 'opportunities',
        ];
        const fields = Object.keys(data).filter((k) => allowedKeys.includes(k));
        if (fields.length === 0) return res.status(400).json({ error: 'No updatable fields provided.' });
        const sets = fields.map((k, i) => `${k} = $${i + 1}`);
        const values = fields.map((k) => data[k] ?? null);
        values.push(id);
        const { rows } = await pool.query(
            `UPDATE website_audits SET ${sets.join(', ')}, updated_at = NOW()
              WHERE id = $${values.length} RETURNING *`,
            values
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Audit not found.' });
        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Outreach] updateAudit error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function deleteAudit(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid audit ID.' });
        const { rowCount } = await pool.query(`DELETE FROM website_audits WHERE id = $1`, [id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Audit not found.' });
        return res.json({ success: true });
    } catch (err) {
        console.error('[Outreach] deleteAudit error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Suppressions ─────────────────────────────────────────
export async function listSuppressions(_req, res) {
    try {
        const { rows } = await pool.query(
            `SELECT * FROM outreach_suppressions ORDER BY created_at DESC LIMIT 1000`
        );
        return res.json(rows);
    } catch (err) {
        console.error('[Outreach] listSuppressions error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function addSuppression(req, res) {
    try {
        const data = suppressionCreateSchema.parse(req.body);
        await suppressEmail(data.email, data.reason, data.note || null);
        // Keep prospects in sync so the UI shows the truth.
        await pool.query(
            `UPDATE prospects SET do_not_contact = TRUE, updated_at = NOW()
              WHERE lower(email) = lower($1) AND do_not_contact = FALSE`,
            [data.email]
        );
        await writeAuditLog({
            action: 'OUTREACH_SUPPRESSED',
            entityType: 'outreach_suppressions',
            entityId: null,
            details: { email: data.email, reason: data.reason },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.status(201).json({ success: true, email: data.email.toLowerCase(), reason: data.reason });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Outreach] addSuppression error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function removeSuppression(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid suppression ID.' });
        const { rows } = await pool.query(`DELETE FROM outreach_suppressions WHERE id = $1 RETURNING email`, [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Suppression entry not found.' });
        await writeAuditLog({
            action: 'OUTREACH_UNSUPPRESSED',
            entityType: 'outreach_suppressions',
            entityId: id,
            details: { email: rows[0].email },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.json({ success: true });
    } catch (err) {
        console.error('[Outreach] removeSuppression error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Settings ─────────────────────────────────────────────
export async function getSettings(_req, res) {
    try {
        return res.json(await getOutreachSettings());
    } catch (err) {
        console.error('[Outreach] getSettings error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function updateSettings(req, res) {
    try {
        const data = settingsUpdateSchema.parse(req.body);
        const fields = Object.keys(data);
        if (fields.length === 0) return res.status(400).json({ error: 'No updatable fields provided.' });
        const sets = fields.map((k, i) => `${k} = $${i + 1}`);
        const values = fields.map((k) => data[k] ?? null);
        values.push(1);
        const { rows } = await pool.query(
            `UPDATE outreach_settings SET ${sets.join(', ')}, updated_at = NOW()
              WHERE id = $${values.length} RETURNING *`,
            values
        );
        await writeAuditLog({
            action: 'OUTREACH_SETTINGS_UPDATED',
            entityType: 'outreach_settings',
            entityId: '1',
            details: data,
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Outreach] updateSettings error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Analytics (§61) ──────────────────────────────────────
export async function getAnalytics(_req, res) {
    try {
        const [totals, byStatus, trend, perSequence, todayCount] = await Promise.all([
            pool.query(`
                SELECT
                    (SELECT COUNT(*)::int FROM prospects) AS prospects,
                    (SELECT COUNT(DISTINCT prospect_id)::int FROM outreach_messages
                      WHERE direction = 'OUTBOUND' AND status = 'SENT') AS contacted,
                    (SELECT COUNT(DISTINCT prospect_id)::int FROM outreach_messages
                      WHERE direction = 'INBOUND') AS replies,
                    (SELECT COUNT(*)::int FROM prospects WHERE status = 'INTERESTED') AS interested,
                    (SELECT COUNT(*)::int FROM prospects WHERE status = 'CONVERTED') AS converted,
                    (SELECT COUNT(*)::int FROM outreach_suppressions WHERE reason = 'UNSUBSCRIBED') AS unsubscribes,
                    (SELECT COUNT(*)::int FROM outreach_suppressions WHERE reason = 'BOUNCED') AS bounces,
                    (SELECT COUNT(*)::int FROM outreach_messages
                      WHERE direction = 'OUTBOUND' AND status = 'SENT') AS total_sends,
                    (SELECT COUNT(*)::int FROM website_audits) AS audits
            `),
            pool.query(`SELECT status, COUNT(*)::int AS count FROM prospects GROUP BY status`),
            pool.query(`
                SELECT to_char(m.month, 'YYYY-MM') AS month,
                       (SELECT COUNT(*)::int FROM prospects p
                         WHERE date_trunc('month', p.created_at) = m.month) AS added,
                       (SELECT COUNT(*)::int FROM outreach_messages om
                         WHERE om.direction = 'OUTBOUND' AND om.status = 'SENT'
                           AND date_trunc('month', om.sent_at) = m.month) AS sends,
                       (SELECT COUNT(*)::int FROM outreach_messages om
                         WHERE om.direction = 'INBOUND'
                           AND date_trunc('month', om.created_at) = m.month) AS replies
                  FROM generate_series(
                       date_trunc('month', NOW()) - INTERVAL '5 months',
                       date_trunc('month', NOW()),
                       INTERVAL '1 month') AS m(month)
                 ORDER BY m.month
            `),
            pool.query(`
                SELECT s.id, s.name, s.is_active,
                       (SELECT COUNT(*)::int FROM prospects p WHERE p.sequence_id = s.id) AS prospects,
                       (SELECT COUNT(*)::int FROM outreach_messages m
                         WHERE m.sequence_id = s.id AND m.direction = 'OUTBOUND' AND m.status = 'SENT') AS sends,
                       (SELECT COUNT(DISTINCT m.prospect_id)::int FROM outreach_messages m
                         WHERE m.sequence_id = s.id AND m.direction = 'INBOUND') AS replies
                  FROM outreach_sequences s
                 ORDER BY s.created_at ASC
            `),
            pool.query(
                `SELECT COUNT(*)::int AS n FROM outreach_messages
                  WHERE direction = 'OUTBOUND' AND status = 'SENT' AND sent_at >= CURRENT_DATE`
            ),
        ]);

        const settings = await getOutreachSettings();
        const t = totals.rows[0];
        return res.json({
            totals: {
                ...t,
                reply_rate: t.contacted > 0 ? Math.round((t.replies / t.contacted) * 100) : 0,
                conversion_rate: t.contacted > 0 ? Math.round((t.converted / t.contacted) * 100) : 0,
            },
            byStatus: byStatus.rows,
            trend: trend.rows,
            sequences: perSequence.rows,
            today: { sends: todayCount.rows[0].n, limit: settings.daily_send_limit, paused: settings.paused },
        });
    } catch (err) {
        console.error('[Outreach] getAnalytics error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Manual cron trigger (testing / catch-up) ─────────────
export async function triggerFollowUps(req, res) {
    try {
        const summary = await processDueFollowUps();
        await writeAuditLog({
            action: 'OUTREACH_FOLLOWUPS_TRIGGERED',
            entityType: 'outreach_messages',
            details: summary,
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.json(summary);
    } catch (err) {
        console.error('[Outreach] triggerFollowUps error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── PUBLIC: unsubscribe (§19) ────────────────────────────
// The unguessable token IS the auth. One-click unsubscribe:
// marks the prospect, suppresses the address forever, cancels
// any queued follow-ups.
export async function publicUnsubscribe(req, res) {
    try {
        const { token } = req.params;
        if (!token || !/^[0-9a-f]{32}$/i.test(token)) {
            return res.status(400).json({ error: 'Invalid unsubscribe link.' });
        }
        const { rows } = await pool.query(
            `SELECT * FROM prospects WHERE unsubscribe_token = $1`,
            [token.toLowerCase()]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'This unsubscribe link is no longer valid.' });
        const prospect = rows[0];

        await pool.query(
            `UPDATE prospects
                SET status = 'UNSUBSCRIBED', do_not_contact = TRUE,
                    unsubscribed_at = NOW(), next_follow_up_at = NULL, updated_at = NOW()
              WHERE id = $1`,
            [prospect.id]
        );
        await pool.query(
            `UPDATE outreach_messages
                SET status = 'CANCELLED', error = 'Cancelled — unsubscribed', updated_at = NOW()
              WHERE prospect_id = $1 AND direction = 'OUTBOUND' AND status IN ('DRAFT','QUEUED')`,
            [prospect.id]
        );
        await suppressEmail(prospect.email, 'UNSUBSCRIBED', 'One-click unsubscribe link');

        return res.json({ success: true, company_name: prospect.company_name });
    } catch (err) {
        console.error('[Outreach] publicUnsubscribe error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
