// ─── src/controllers/crmController.js ────────────────────
// Phase 3 — CRM Pipeline (ROADMAP.md §Phase 3)
//
// Endpoints exposed:
//   POST   /api/crm/leads              — public submission (contact / booking flows)
//   GET    /api/crm/leads              — admin list, with division / stage / source / date filters
//   GET    /api/crm/leads/:id          — single lead
//   PATCH  /api/crm/leads/:id/stage    — Kanban drag-and-drop
//   PATCH  /api/crm/leads/:id          — partial update (notes, source, contact details)
//   POST   /api/crm/leads/:id/convert  — promote to `clients`, set stage to WON
//   GET    /api/crm/stages             — the 8 stages array (UI labels + ordering)
//
// Every mutation writes an `audit_logs` row (see utils/auditLog.js).
// The lead auto-tag from public forms is wired in
// `contactController.js` and `bookingController.js` — they call
// `createLead` directly with `source = 'contact_form' | 'booking_form'`.
// ──────────────────────────────────────────────────────────

import { z } from 'zod';
import pool from '../config/db.js';
import { writeAuditLog, getClientIp } from '../utils/auditLog.js';

// ── Helpers ──────────────────────────────────────────────
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

export const CRM_STAGES = [
    { id: 'LEAD',        label: 'Lead',        color: 'blue' },
    { id: 'QUALIFIED',   label: 'Qualified',   color: 'cyan' },
    { id: 'PROPOSAL',    label: 'Proposal',    color: 'indigo' },
    { id: 'NEGOTIATION', label: 'Negotiation', color: 'amber' },
    { id: 'WON',         label: 'Won',         color: 'emerald' },
    { id: 'PROJECT',     label: 'Project',     color: 'purple' },
    { id: 'COMPLETED',   label: 'Completed',   color: 'teal' },
    { id: 'RETENTION',   label: 'Retention',   color: 'rose' },
];

const STAGE_IDS = new Set(CRM_STAGES.map((s) => s.id));

/**
 * Default onboarding checklist applied to a freshly-Won project.
 * Mirrors the ROADMAP §Phase 4 list verbatim. Each item is a
 * `{ key, label, done }` object so the admin can mark items
 * complete individually; the key is the stable identifier the
 * offboarding check uses.
 */
export const DEFAULT_ONBOARDING_CHECKLIST = [
    { key: 'welcome_email',     label: 'Send welcome email',           done: false },
    { key: 'kickoff_call',      label: 'Schedule kickoff call',        done: false },
    { key: 'credentials_vault', label: 'Share credentials vault link', done: false },
    { key: 'payment_received',  label: 'Confirm payment received',     done: false },
];

/**
 * Phase 4 — auto-checklist helper.
 *
 * Inserts a default `client_projects` row for the freshly-Won
 * lead, pre-populated with the onboarding checklist. Idempotent:
 * if a project already exists for `(client_id, source='lead_convert')`
 * we return the existing row instead of double-inserting.
 *
 * Pass `client` (must already exist) from the caller; we only
 * own the project-side insert so the caller's transaction state
 * is preserved.
 */
export async function ensureOnboardingProject(client, division, txClient) {
    const runner = txClient || pool;
    const existing = await runner.query(
        `SELECT id, offboarding_checklist FROM client_projects
          WHERE client_id = $1
            AND (notes LIKE '%[lead_convert]%' OR project_name LIKE 'Onboarding: %')
          LIMIT 1`,
        [client.id]
    );
    if (existing.rows.length > 0) {
        // If the existing row somehow lacks the checklist, fill it.
        if (!existing.rows[0].offboarding_checklist ||
            (Array.isArray(existing.rows[0].offboarding_checklist) && existing.rows[0].offboarding_checklist.length === 0)) {
            await runner.query(
                `UPDATE client_projects
                    SET offboarding_checklist = $1::jsonb,
                        offboarding_status = 'IN_PROGRESS',
                        updated_at = NOW()
                  WHERE id = $2`,
                [JSON.stringify(DEFAULT_ONBOARDING_CHECKLIST), existing.rows[0].id]
            );
        }
        return { created: false, project: existing.rows[0] };
    }

    const { rows } = await runner.query(
        `INSERT INTO client_projects (
             client_id, project_name, status, division, payment_status,
             offboarding_status, offboarding_checklist, notes
         ) VALUES (
             $1, $2, 'WON', $3, 'PENDING',
             'IN_PROGRESS', $4::jsonb, $5
         ) RETURNING *`,
        [
            client.id,
            `Onboarding: ${client.name || 'New client'}`,
            division,
            JSON.stringify(DEFAULT_ONBOARDING_CHECKLIST),
            '[lead_convert] Auto-created from a won CRM lead.',
        ]
    );
    return { created: true, project: rows[0] };
}

// ── Schemas ──────────────────────────────────────────────
const createLeadSchema = z.object({
    full_name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().optional().nullable(),
    division: z.enum(['SOFTWARE', 'SURVEY', 'DRONE']),
    source: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
});

const stageSchema = z.object({
    stage: z.enum([...STAGE_IDS]),
});

const updateLeadSchema = z.object({
    full_name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional().nullable(),
    source: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
});

/**
 * Insert a lead row. Used by:
 *   1. `POST /api/crm/leads` (admin, manual entry)
 *   2. `contactController.js` (auto-tag from /contact form)
 *   3. `bookingController.js` (auto-tag from /api/bookings)
 *
 * Returns the inserted lead on success, `null` on failure (so the
 * caller can choose whether to surface the error to the user — the
 * auto-tag paths intentionally swallow failures so the public form
 * still succeeds even if the lead row can't be written).
 */
export async function insertLeadRow(data) {
    try {
        const { rows } = await pool.query(
            `INSERT INTO leads (full_name, email, phone, division, source, notes, stage)
             VALUES ($1, $2, $3, $4, $5, $6, 'LEAD')
             RETURNING *`,
            [
                data.full_name,
                data.email,
                data.phone || null,
                data.division,
                data.source || null,
                data.notes || null,
            ]
        );
        return rows[0];
    } catch (err) {
        console.error('[CRM] insertLeadRow error:', err.message);
        return null;
    }
}

/**
 * POST /api/crm/leads — public submission.
 * Source: any form the lead originates from. Optional here, but
 * the contact and booking controllers pass it.
 */
export async function createLead(req, res) {
    try {
        const data = createLeadSchema.parse(req.body);
        const lead = await insertLeadRow(data);
        if (!lead) return res.status(500).json({ error: 'Failed to create lead.' });
        return res.status(201).json({ success: true, lead });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[CRM] createLead error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

/**
 * GET /api/crm/leads?division=SOFTWARE&stage=LEAD&source=contact_form&from=2026-01-01&to=2026-12-31&q=acme
 *
 * Filters are all AND-ed together. Unknown filter values are
 * ignored. `q` does an ILIKE on name/email/notes.
 */
export async function getLeads(req, res) {
    try {
        const { division, stage, source, from, to, q } = req.query;
        const conditions = [];
        const params = [];

        if (division && ['SOFTWARE', 'SURVEY', 'DRONE'].includes(division)) {
            params.push(division);
            conditions.push(`division = $${params.length}`);
        }
        if (stage && STAGE_IDS.has(stage)) {
            params.push(stage);
            conditions.push(`stage = $${params.length}`);
        }
        if (source) {
            params.push(source);
            conditions.push(`source = $${params.length}`);
        }
        if (from) {
            params.push(from);
            conditions.push(`created_at >= $${params.length}`);
        }
        if (to) {
            params.push(to);
            conditions.push(`created_at <= $${params.length}`);
        }
        if (q && typeof q === 'string' && q.trim().length >= 2) {
            params.push(`%${q.trim()}%`);
            const i = params.length;
            conditions.push(`(full_name ILIKE $${i} OR email ILIKE $${i} OR notes ILIKE $${i})`);
        }

        const where = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
        const { rows } = await pool.query(
            `SELECT *, (CURRENT_DATE - updated_at::date) AS days_in_stage
               FROM leads${where}
              ORDER BY updated_at DESC
              LIMIT 500`,
            params
        );
        return res.json(rows);
    } catch (err) {
        console.error('[CRM] getLeads error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

/**
 * GET /api/crm/leads/:id
 */
export async function getLeadById(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid lead ID.' });
        const { rows } = await pool.query(`SELECT * FROM leads WHERE id = $1`, [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Lead not found.' });
        return res.json(rows[0]);
    } catch (err) {
        console.error('[CRM] getLeadById error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

/**
 * PATCH /api/crm/leads/:id/stage — Kanban drag-and-drop handler.
 * Refreshes `updated_at` so the "days in stage" calc resets.
 */
export async function updateLeadStage(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid lead ID.' });
        const { stage } = stageSchema.parse(req.body);

        // Read the old value first so we can include it in the audit log.
        const before = await pool.query(`SELECT stage FROM leads WHERE id = $1`, [id]);
        if (before.rows.length === 0) return res.status(404).json({ error: 'Lead not found.' });
        const oldStage = before.rows[0].stage;

        if (oldStage === stage) {
            const { rows } = await pool.query(`SELECT * FROM leads WHERE id = $1`, [id]);
            return res.json(rows[0]);
        }

        const { rows } = await pool.query(
            `UPDATE leads
                SET stage = $1,
                    updated_at = NOW()
              WHERE id = $2
              RETURNING *`,
            [stage, id]
        );

        await writeAuditLog({
            action: 'LEAD_STAGE_CHANGED',
            entityType: 'leads',
            entityId: id,
            details: { from: oldStage, to: stage },
            user: req.user,
            ipAddress: getClientIp(req),
        });

        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[CRM] updateLeadStage error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

/**
 * PATCH /api/crm/leads/:id — partial update (notes, source, contact details).
 */
export async function updateLead(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid lead ID.' });

        const data = updateLeadSchema.parse(req.body);
        const allowedKeys = ['full_name', 'email', 'phone', 'source', 'notes'];
        const fields = Object.keys(data).filter((k) => allowedKeys.includes(k));
        if (fields.length === 0) {
            return res.status(400).json({ error: 'No updatable fields provided.' });
        }

        const setClauses = fields.map((k, i) => `${k} = $${i + 1}`);
        const values = fields.map((k) => data[k] ?? null);
        values.push(id);

        const { rows } = await pool.query(
            `UPDATE leads SET ${setClauses.join(', ')}, updated_at = NOW()
              WHERE id = $${values.length}
              RETURNING *`,
            values
        );

        if (rows.length === 0) return res.status(404).json({ error: 'Lead not found.' });

        await writeAuditLog({
            action: 'LEAD_UPDATED',
            entityType: 'leads',
            entityId: id,
            details: { fields, values: fields.reduce((acc, k) => ({ ...acc, [k]: data[k] }), {}) },
            user: req.user,
            ipAddress: getClientIp(req),
        });

        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[CRM] updateLead error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

/**
 * POST /api/crm/leads/:id/convert — promote a lead to a `clients` row.
 * Idempotent: a lead already linked to a client returns the existing
 * client. Sets the lead stage to WON.
 *
 * Body (optional):
 *   { billing_email?: string, notes?: string }
 */
const convertLeadSchema = z.object({
    billing_email: z.string().email().optional().nullable(),
    notes: z.string().optional().nullable(),
});

export async function convertLead(req, res) {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid lead ID.' });
        const body = convertLeadSchema.parse(req.body || {});

        await client.query('BEGIN');

        // Lock the lead row for the duration of the transaction so two
        // concurrent converts can't both create clients.
        const leadRes = await client.query(
            `SELECT * FROM leads WHERE id = $1 FOR UPDATE`,
            [id]
        );
        if (leadRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Lead not found.' });
        }
        const lead = leadRes.rows[0];

        // Already converted — return existing client + project.
        if (lead.converted_client_id) {
            const existing = await client.query(
                `SELECT * FROM clients WHERE id = $1`,
                [lead.converted_client_id]
            );
            const projectRes = await client.query(
                `SELECT * FROM client_projects
                  WHERE client_id = $1
                    AND (notes LIKE '%[lead_convert]%' OR project_name LIKE 'Onboarding: %')
                  LIMIT 1`,
                [lead.converted_client_id]
            );
            await client.query('COMMIT');
            return res.json({
                success: true,
                lead,
                client: existing.rows[0],
                project: projectRes.rows[0] || null,
                alreadyConverted: true,
            });
        }

        // Create the client row tagged with the same division.
        const clientInsert = await client.query(
            `INSERT INTO clients (name, primary_contact_email, billing_email, phone, notes, division)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
                lead.full_name,
                lead.email,
                body.billing_email || lead.email,
                lead.phone || null,
                body.notes || lead.notes || null,
                lead.division,
            ]
        );
        const newClient = clientInsert.rows[0];

        // Phase 4 — auto-create an onboarding `client_projects`
        // row with the default checklist. Runs inside the same
        // transaction so a failed checklist insert rolls back the
        // whole convert.
        const onboarding = await ensureOnboardingProject(newClient, lead.division, client);

        // Mark the lead WON and link the new client.
        const updatedLead = await client.query(
            `UPDATE leads
                SET stage = 'WON',
                    converted_client_id = $1,
                    updated_at = NOW()
              WHERE id = $2
              RETURNING *`,
            [newClient.id, id]
        );

        await client.query('COMMIT');

        await writeAuditLog({
            action: 'LEAD_CONVERTED',
            entityType: 'leads',
            entityId: id,
            details: {
                clientId: newClient.id,
                projectId: onboarding.project?.id,
                division: lead.division,
                onboardingCreated: onboarding.created,
            },
            user: req.user,
            ipAddress: getClientIp(req),
        });

        return res.status(201).json({
            success: true,
            lead: updatedLead.rows[0],
            client: newClient,
            project: onboarding.project,
        });
    } catch (err) {
        await client.query('ROLLBACK');
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[CRM] convertLead error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    } finally {
        client.release();
    }
}

/**
 * GET /api/crm/stages — returns the 8-stage array with labels.
 * The frontend uses this to build the Kanban columns in one place
 * so we never have a UI/DB drift.
 */
export function getStages(_req, res) {
    return res.json(CRM_STAGES);
}
