// ─── src/controllers/onboardingController.js ──────────────
// Admin OS Phase 1 — Client Onboarding (blueprint §6–§14, §80, §93).
//
// A dedicated, progressive-save onboarding wizard that lives in
// the authenticated client portal. Distinct from the generic
// intake_templates system: onboarding is one canonical per-client
// form with server-tracked completion and a review loop
// (SUBMITTED → NEEDS_CHANGES → APPROVED).
//
// Admin endpoints (Owner-gated in routes/onboardingRoutes.js):
//   GET   /api/onboarding
//   GET   /api/onboarding/:id
//   POST  /api/onboarding                    — create + optional invite email
//   POST  /api/onboarding/:id/invite         — (re)send the invite email
//   PATCH /api/onboarding/:id/status         — NEEDS_CHANGES / APPROVED / reopen
//
// Portal endpoints (mounted in clientPortalRoutes.js):
//   GET   /api/client-portal/onboarding      — my active onboarding
//   PATCH /api/client-portal/onboarding      — autosave one section
//   POST  /api/client-portal/onboarding/submit
// ──────────────────────────────────────────────────────────

import { z } from 'zod';
import pool from '../config/db.js';
import { writeAuditLog, getClientIp } from '../utils/auditLog.js';
import { createNotification } from './notificationController.js';
import {
    sendOnboardingInviteEmail,
    sendOnboardingChangesEmail,
} from '../services/onboardingEmailService.js';

// ── Helpers ──────────────────────────────────────────────
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

const PROJECT_TYPES = ['BUSINESS', 'ECOMMERCE', 'BOOKING', 'LANDING', 'PORTFOLIO', 'CUSTOM'];

/**
 * Section spec — single source of truth for completion math.
 * The frontend wizard mirrors this shape; the server stays
 * authoritative for completion_percent.
 *
 * `required` lists response keys inside the section object that
 * must be answered before the section counts as complete.
 * Sections with an empty `required` list are optional and are
 * excluded from the percentage denominator.
 */
export const ONBOARDING_SECTIONS = [
    { key: 'contact',    label: 'Contact Details',     required: ['full_name', 'business_name', 'email', 'whatsapp'] },
    { key: 'business',   label: 'Business',            required: ['business_description', 'industry'] },
    { key: 'social',     label: 'Social Media',        required: [] },
    { key: 'website',    label: 'Website & Domain',    required: ['owns_domain'] },
    { key: 'brand',      label: 'Brand',               required: ['brand_name'] },
    { key: 'goals',      label: 'Project Goals',       required: ['primary_purpose', 'target_audience'] },
    { key: 'content',    label: 'Content',             required: ['has_copy'] },
    { key: 'ecommerce',  label: 'E-commerce',          required: ['product_count', 'currency'], when: ['ECOMMERCE'] },
    { key: 'booking',    label: 'Booking & Services',  required: ['services'], when: ['BOOKING'] },
    { key: 'marketing',  label: 'Marketing & SEO',     required: [] },
    { key: 'policies',   label: 'Policies & Legal',    required: [] },
];

const SECTION_KEYS = new Set(ONBOARDING_SECTIONS.map((s) => s.key));

const isAnswered = (v) => {
    if (v === null || v === undefined) return false;
    if (typeof v === 'string') return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'object') return Object.keys(v).length > 0;
    return true;
};

/**
 * Completion % across required fields of applicable sections.
 * E-commerce / Booking sections only apply to their project type.
 */
export function computeCompletion(responses, projectType) {
    const data = responses || {};
    let total = 0;
    let answered = 0;
    for (const section of ONBOARDING_SECTIONS) {
        if (section.when && !section.when.includes(projectType)) continue;
        if (!section.required || section.required.length === 0) continue;
        const sectionData = data[section.key] || {};
        for (const field of section.required) {
            total += 1;
            if (isAnswered(sectionData[field])) answered += 1;
        }
    }
    return total === 0 ? 0 : Math.round((answered / total) * 100);
}

/**
 * Blueprint §78 — auto-generated internal summary from the
 * responses. Editable later / Phase 6 may enrich it.
 */
export function buildClientSummary(responses, projectType) {
    const r = responses || {};
    const pick = (section, key) => r[section]?.[key];
    const list = (section, key) => {
        const v = pick(section, key);
        return Array.isArray(v) ? v.filter(Boolean) : v ? [v] : [];
    };

    const assetsOutstanding = [];
    if (pick('content', 'has_copy') === 'no') assetsOutstanding.push('Website copy / copywriting');
    if (pick('brand', 'has_logo') === 'no') assetsOutstanding.push('Logo files');
    if (pick('content', 'price_list') === false) assetsOutstanding.push('Price list');
    if (pick('policies', 'has_policies') === 'no') assetsOutstanding.push('Policy documents');
    if (pick('website', 'owns_domain') === 'no') assetsOutstanding.push('Domain purchase');

    return {
        type: projectType,
        markets: list('goals', 'countries_served'),
        currencies: list('ecommerce', 'currency'),
        paymentMethods: list('ecommerce', 'payment_providers'),
        shipping: pick('ecommerce', 'shipping_countries') || null,
        social: {
            instagram: pick('social', 'instagram') || null,
            tiktok: pick('social', 'tiktok') || null,
            facebook: pick('social', 'facebook') || null,
        },
        mainGoal: pick('goals', 'primary_purpose') || null,
        assetsOutstanding,
    };
}

async function getOwnerUserId() {
    const { rows } = await pool.query(
        `SELECT id FROM users WHERE lower(role) = 'owner' ORDER BY created_at LIMIT 1`
    );
    return rows[0]?.id || null;
}

const portalUrl = () =>
    `${(process.env.FRONTEND_URL || 'https://buildwithlami.com').replace(/\/+$/, '')}/portal/onboarding`;

const ONBOARDING_SELECT = `
    SELECT o.*,
           c.name  AS client_name,
           c.primary_contact_email AS client_email,
           p.project_name
      FROM client_onboardings o
      LEFT JOIN clients c         ON c.id = o.client_id
      LEFT JOIN client_projects p ON p.id = o.project_id
`;

// ── Schemas ──────────────────────────────────────────────
const createOnboardingSchema = z.object({
    client_id: z.string().min(1, 'Client is required'),
    project_id: z.string().optional().nullable(),
    project_type: z.enum(PROJECT_TYPES).optional().default('BUSINESS'),
    send_invite: z.boolean().optional().default(true),
});

const statusSchema = z.object({
    status: z.enum(['IN_PROGRESS', 'NEEDS_CHANGES', 'APPROVED']),
    requested_changes: z.string().optional().nullable(),
});

// ── Admin: List ──────────────────────────────────────────
export async function getOnboardings(req, res) {
    try {
        const { status, q } = req.query;
        const conditions = [];
        const params = [];

        if (status && ['NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'NEEDS_CHANGES', 'APPROVED'].includes(status)) {
            params.push(status);
            conditions.push(`o.status = $${params.length}`);
        }
        if (q && typeof q === 'string' && q.trim().length >= 2) {
            params.push(`%${q.trim()}%`);
            conditions.push(`c.name ILIKE $${params.length}`);
        }

        const where = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
        const { rows } = await pool.query(
            `${ONBOARDING_SELECT}${where}
             ORDER BY (o.status = 'SUBMITTED') DESC, o.updated_at DESC
             LIMIT 200`,
            params
        );
        return res.json(rows);
    } catch (err) {
        console.error('[Onboarding] getOnboardings error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Admin: Single ────────────────────────────────────────
export async function getOnboardingById(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid onboarding ID.' });
        const { rows } = await pool.query(`${ONBOARDING_SELECT} WHERE o.id = $1`, [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Onboarding not found.' });

        const row = rows[0];
        return res.json({
            ...row,
            summary: buildClientSummary(row.responses, row.project_type),
        });
    } catch (err) {
        console.error('[Onboarding] getOnboardingById error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Admin: Create ────────────────────────────────────────
/**
 * Shared creation core used by BOTH the admin route below and
 * the Phase 2 automation chain (automationService.onInvoicePaid).
 *
 * Idempotent: when the client already has an active onboarding
 * (partial unique index), returns it with created:false and no
 * duplicate email. Returns:
 *   { ok, onboarding, created, emailStatus, error? }
 */
export async function ensureOnboardingForClient({
    clientId,
    projectId = null,
    projectType = 'BUSINESS',
    sendInvite = true,
    user = null,
    ipAddress = null,
}) {
    const clientRes = await pool.query(
        `SELECT id, name, primary_contact_email FROM clients WHERE id = $1`,
        [clientId]
    );
    if (clientRes.rows.length === 0) {
        return { ok: false, error: 'client_not_found' };
    }
    const client = clientRes.rows[0];

    let onboarding;
    let created = false;
    try {
        const insert = await pool.query(
            `INSERT INTO client_onboardings (client_id, project_id, project_type)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [clientId, projectId, projectType]
        );
        onboarding = insert.rows[0];
        created = true;
    } catch (insertErr) {
        // 23505 = unique_violation → the partial unique index says
        // this client already has an active onboarding.
        if (insertErr.code === '23505') {
            const existing = await pool.query(
                `SELECT * FROM client_onboardings
                  WHERE client_id = $1 AND status IN ('NOT_STARTED','IN_PROGRESS','SUBMITTED','NEEDS_CHANGES')
                  ORDER BY updated_at DESC LIMIT 1`,
                [clientId]
            );
            if (existing.rows.length === 0) throw insertErr;
            return { ok: true, onboarding: existing.rows[0], created: false, emailStatus: null };
        }
        throw insertErr;
    }

    writeAuditLog({
        action: 'ONBOARDING_CREATED',
        entityType: 'client_onboardings',
        entityId: onboarding.id,
        details: { clientId, projectType, inviteSent: sendInvite, automated: user === null },
        user,
        ipAddress,
    }).catch(() => {});

    // Set the client's lifecycle status to ONBOARDING so the
    // client list reflects where they are in the funnel.
    await pool.query(`UPDATE clients SET status = 'ONBOARDING', updated_at = NOW() WHERE id = $1 AND status = 'ACTIVE'`, [clientId]);

    let emailStatus = null;
    if (sendInvite) {
        try {
            const result = await sendOnboardingInviteEmail({
                clientEmail: client.primary_contact_email,
                clientName: client.name,
                portalUrl: portalUrl(),
            });
            emailStatus = result.success ? 'sent' : 'failed';
        } catch (emailErr) {
            // The onboarding row already exists — an SMTP outage must
            // not roll back the business action. Surface the failure
            // and let the admin resend the invite later.
            console.error('[Onboarding] invite email failed:', emailErr.message);
            emailStatus = 'failed';
        }
    }

    return { ok: true, onboarding, created, emailStatus };
}

export async function createOnboarding(req, res) {
    try {
        const data = createOnboardingSchema.parse(req.body);
        if (!isUuid(data.client_id)) return res.status(400).json({ error: 'Invalid client ID.' });

        const projectId = isUuid(data.project_id || '') ? data.project_id : null;

        const result = await ensureOnboardingForClient({
            clientId: data.client_id,
            projectId,
            projectType: data.project_type,
            sendInvite: data.send_invite,
            user: req.user,
            ipAddress: getClientIp(req),
        });

        if (!result.ok) {
            return res.status(404).json({ error: 'Client not found.' });
        }
        if (!result.created) {
            return res.status(409).json({
                error: 'This client already has an active onboarding.',
                onboardingId: result.onboarding.id,
            });
        }

        return res.status(201).json({ ...result.onboarding, emailStatus: result.emailStatus });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Onboarding] createOnboarding error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Admin: (Re)send invite ───────────────────────────────
export async function resendOnboardingInvite(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid onboarding ID.' });
        const { rows } = await pool.query(
            `${ONBOARDING_SELECT} WHERE o.id = $1`,
            [id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Onboarding not found.' });

        const result = await sendOnboardingInviteEmail({
            clientEmail: rows[0].client_email,
            clientName: rows[0].client_name,
            portalUrl: portalUrl(),
        });
        if (!result.success) return res.status(502).json({ error: 'Failed to send invite email.' });

        writeAuditLog({
            action: 'ONBOARDING_INVITE_SENT',
            entityType: 'client_onboardings',
            entityId: id,
            details: { to: rows[0].client_email },
            user: req.user,
            ipAddress: getClientIp(req),
        }).catch(() => {});

        return res.json({ success: true });
    } catch (err) {
        console.error('[Onboarding] resendOnboardingInvite error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Admin: Status transitions ────────────────────────────
/**
 * PATCH /api/onboarding/:id/status
 *   NEEDS_CHANGES — send requested_changes back to the client (+email)
 *   APPROVED      — lock the onboarding in
 *   IN_PROGRESS   — reopen a submitted form
 */
export async function updateOnboardingStatus(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid onboarding ID.' });
        const data = statusSchema.parse(req.body);

        const before = await pool.query(`${ONBOARDING_SELECT} WHERE o.id = $1`, [id]);
        if (before.rows.length === 0) return res.status(404).json({ error: 'Onboarding not found.' });
        const prev = before.rows[0];

        if (data.status === 'NEEDS_CHANGES' && !data.requested_changes) {
            return res.status(400).json({ error: 'requested_changes is required when requesting changes.' });
        }
        if (prev.status === 'APPROVED') {
            return res.status(409).json({ error: 'This onboarding is already approved.' });
        }

        const { rows } = await pool.query(
            `UPDATE client_onboardings
                SET status = $1,
                    requested_changes = $2,
                    approved_at = CASE WHEN $1 = 'APPROVED' THEN NOW() ELSE approved_at END,
                    updated_at = NOW()
              WHERE id = $3
              RETURNING *`,
            [data.status, data.status === 'NEEDS_CHANGES' ? data.requested_changes : null, id]
        );

        writeAuditLog({
            action: 'ONBOARDING_STATUS_CHANGED',
            entityType: 'client_onboardings',
            entityId: id,
            details: { from: prev.status, to: data.status, requestedChanges: data.requested_changes || null },
            user: req.user,
            ipAddress: getClientIp(req),
        }).catch(() => {});

        if (data.status === 'APPROVED') {
            // Approved → the client is properly onboarded now.
            await pool.query(
                `UPDATE clients SET status = 'ACTIVE', updated_at = NOW() WHERE id = $1 AND status = 'ONBOARDING'`,
                [prev.client_id]
            );
        }

        let emailStatus = null;
        if (data.status === 'NEEDS_CHANGES') {
            const result = await sendOnboardingChangesEmail({
                clientEmail: prev.client_email,
                clientName: prev.client_name,
                portalUrl: portalUrl(),
                requestedChanges: data.requested_changes,
            });
            emailStatus = result.success ? 'sent' : 'failed';
        }

        return res.json({ ...rows[0], emailStatus });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Onboarding] updateOnboardingStatus error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Portal: my onboarding ────────────────────────────────
/**
 * GET /api/client-portal/onboarding (verifyClientToken)
 * Active (non-approved) first; else the latest approved record
 * so the client still sees the approved state.
 */
export async function getMyOnboarding(req, res) {
    try {
        const { rows } = await pool.query(
            `SELECT * FROM client_onboardings
              WHERE client_id = $1
              ORDER BY (status = 'APPROVED') ASC, updated_at DESC
              LIMIT 1`,
            [req.clientUser.id]
        );
        return res.json(rows[0] || null);
    } catch (err) {
        console.error('[Onboarding] getMyOnboarding error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Portal: autosave a section ───────────────────────────
/**
 * PATCH /api/client-portal/onboarding (verifyClientToken)
 * Body: { section: 'contact', data: { ... } }
 *
 * Shallow-merges the section object into responses (top-level
 * keys are section keys), then recomputes completion server-side.
 */
export async function saveMyOnboarding(req, res) {
    try {
        const { section, data } = req.body || {};
        if (!SECTION_KEYS.has(section)) {
            return res.status(400).json({ error: 'Unknown section.' });
        }
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            return res.status(400).json({ error: 'Section data must be an object.' });
        }

        // Cap the payload — the global json limit is 100kb; keep
        // each section far below that.
        const serialized = JSON.stringify(data);
        if (serialized.length > 20000) {
            return res.status(400).json({ error: 'Section data too large.' });
        }

        // Read-merge-write runs in a real transaction: the FOR UPDATE row
        // lock only lives inside one, and the portal autosaves sections
        // concurrently — without the transaction two saves can merge
        // against the same snapshot and one section's answers are lost.
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const current = await client.query(
                `SELECT * FROM client_onboardings
                  WHERE client_id = $1
                    AND status IN ('NOT_STARTED','IN_PROGRESS','NEEDS_CHANGES')
                  ORDER BY updated_at DESC
                  LIMIT 1
                  FOR UPDATE`,
                [req.clientUser.id]
            );
            if (current.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'No active onboarding found.' });
            }
            const onboarding = current.rows[0];

            const merged = { ...(onboarding.responses || {}), [section]: data };
            const percent = computeCompletion(merged, onboarding.project_type);

            const { rows } = await client.query(
                `UPDATE client_onboardings
                    SET responses = $1::jsonb,
                        completion_percent = $2,
                        status = 'IN_PROGRESS',
                        updated_at = NOW()
                  WHERE id = $3
                  RETURNING *`,
                [JSON.stringify(merged), percent, onboarding.id]
            );

            await client.query('COMMIT');
            return res.json(rows[0]);
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('[Onboarding] saveMyOnboarding error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Portal: submit ───────────────────────────────────────
/**
 * POST /api/client-portal/onboarding/submit (verifyClientToken)
 * Moves the active onboarding to SUBMITTED and notifies admin.
 */
export async function submitMyOnboarding(req, res) {
    try {
        const current = await pool.query(
            `SELECT * FROM client_onboardings
              WHERE client_id = $1
                AND status IN ('IN_PROGRESS','NEEDS_CHANGES')
              ORDER BY updated_at DESC
              LIMIT 1`,
            [req.clientUser.id]
        );
        if (current.rows.length === 0) {
            return res.status(404).json({ error: 'No active onboarding to submit.' });
        }
        const onboarding = current.rows[0];
        if (onboarding.completion_percent === 0) {
            return res.status(400).json({ error: 'Please fill in at least the required fields before submitting.' });
        }

        const { rows } = await pool.query(
            `UPDATE client_onboardings
                SET status = 'SUBMITTED',
                    submitted_at = NOW(),
                    updated_at = NOW()
              WHERE id = $1
              RETURNING *`,
            [onboarding.id]
        );

        writeAuditLog({
            action: 'ONBOARDING_SUBMITTED',
            entityType: 'client_onboardings',
            entityId: onboarding.id,
            details: { clientId: req.clientUser.id, completionPercent: onboarding.completion_percent },
            ipAddress: getClientIp(req),
        }).catch(() => {});

        const ownerId = await getOwnerUserId();
        if (ownerId) {
            createNotification({
                userId: ownerId,
                type: 'onboarding',
                title: 'Onboarding submitted for review',
                body: `${req.clientUser.name || 'A client'} submitted their onboarding form (${onboarding.completion_percent}% complete).`,
                link: `/admin/clients/${req.clientUser.id}`,
            }).catch(() => {});
        }

        return res.json(rows[0]);
    } catch (err) {
        console.error('[Onboarding] submitMyOnboarding error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
