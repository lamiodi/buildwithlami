// ─── src/controllers/aftercareController.js ───────────────
// Admin OS Phase 5 — Offboarding / Retention endpoints
// (blueprint §47–§49, §51–§55). All Owner-gated except the
// three public routes (published testimonials, referral code
// lookup + hit counter) which are declared before the auth
// middleware in aftercareRoutes.
//
// Conventions match the rest of the admin API: zod-validated
// bodies, uuid guards, audit logs on writes, per-currency
// money (§42 — never combined across FX).
// ──────────────────────────────────────────────────────────

import crypto from 'node:crypto';
import { z } from 'zod';
import pool from '../config/db.js';
import { writeAuditLog, getClientIp } from '../utils/auditLog.js';
import {
    getHandoverState,
    startHandover,
    setChecklistItem,
    completeHandover,
    launchProject,
    runMonitorChecks,
} from '../services/aftercareService.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

const badId = (res) => res.status(400).json({ error: 'Invalid ID format.' });
const serverError = (res, err, tag) => {
    console.error(`[Aftercare] ${tag} error:`, err.message);
    return res.status(500).json({ error: 'Internal server error.' });
};
const audit = (req, action, entityType, entityId, details) =>
    writeAuditLog({
        action, entityType, entityId, details,
        user: req.user, ipAddress: getClientIp(req),
    }).catch(() => {});

const optionalUuid = z.string().uuid().nullable().optional().or(z.literal('').transform(() => null));
const optionalDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional().or(z.literal('').transform(() => null));
const money = z.number().nonnegative().nullable().optional();
const currency = z.string().trim().length(3).toUpperCase().default('NGN');

// ══════════════════════════════════════════════════════════
// Renewals (§47)
// ══════════════════════════════════════════════════════════

const renewalSchema = z.object({
    client_id: optionalUuid,
    project_id: optionalUuid,
    service: z.enum(['DOMAIN', 'HOSTING', 'MAINTENANCE', 'EMAIL', 'SSL', 'SAAS', 'SUPPORT', 'OTHER']),
    label: z.string().trim().min(1).max(200),
    renewal_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    amount: money,
    currency,
    notes: z.string().max(2000).nullable().optional().or(z.literal('').transform(() => null)),
});

export async function getRenewals(req, res) {
    try {
        const { status, client_id, due_within } = req.query;
        const where = [];
        const params = [];
        if (status) { params.push(String(status)); where.push(`r.status = $${params.length}`); }
        if (client_id && isUuid(client_id)) { params.push(client_id); where.push(`r.client_id = $${params.length}`); }
        if (due_within && /^\d+$/.test(due_within)) {
            params.push(String(due_within));
            where.push(`r.renewal_date BETWEEN CURRENT_DATE AND CURRENT_DATE + ($${params.length} || ' days')::interval`);
        }
        const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
        const { rows } = await pool.query(
            `SELECT r.*, c.name AS client_name, cp.project_name,
                    (r.renewal_date - CURRENT_DATE) AS days_remaining
               FROM renewals r
               LEFT JOIN clients c ON c.id = r.client_id
               LEFT JOIN client_projects cp ON cp.id = r.project_id
               ${whereClause}
              ORDER BY r.renewal_date ASC`,
            params
        );
        return res.json(rows);
    } catch (err) {
        return serverError(res, err, 'getRenewals');
    }
}

export async function createRenewal(req, res) {
    try {
        const data = renewalSchema.parse(req.body);
        const { rows } = await pool.query(
            `INSERT INTO renewals (client_id, project_id, service, label, renewal_date, amount, currency, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [data.client_id || null, data.project_id || null, data.service, data.label,
             data.renewal_date, data.amount ?? null, data.currency, data.notes || null]
        );
        audit(req, 'RENEWAL_CREATED', 'renewals', rows[0].id, { label: data.label, service: data.service });
        return res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        return serverError(res, err, 'createRenewal');
    }
}

export async function updateRenewal(req, res) {
    try {
        if (!isUuid(req.params.id)) return badId(res);
        const data = renewalSchema.partial().parse(req.body);
        const allowed = ['client_id', 'project_id', 'service', 'label', 'renewal_date', 'amount', 'currency', 'notes', 'status'];
        const sets = [];
        const params = [];
        for (const key of allowed) {
            if (data[key] !== undefined) {
                params.push(data[key] === '' ? null : data[key]);
                sets.push(`${key} = $${params.length}`);
            }
        }
        if (sets.length === 0) return res.status(400).json({ error: 'No valid fields to update.' });
        params.push(req.params.id);
        const { rows } = await pool.query(
            `UPDATE renewals SET ${sets.join(', ')}, updated_at = NOW()
              WHERE id = $${params.length} RETURNING *`,
            params
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Renewal not found.' });
        audit(req, 'RENEWAL_UPDATED', 'renewals', req.params.id, data);
        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        return serverError(res, err, 'updateRenewal');
    }
}

export async function deleteRenewal(req, res) {
    try {
        if (!isUuid(req.params.id)) return badId(res);
        const { rowCount } = await pool.query(`DELETE FROM renewals WHERE id = $1`, [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Renewal not found.' });
        audit(req, 'RENEWAL_DELETED', 'renewals', req.params.id, {});
        return res.json({ success: true });
    } catch (err) {
        return serverError(res, err, 'deleteRenewal');
    }
}

/** Mark renewed — pushes the date out one year by default. */
export async function renewRenewal(req, res) {
    try {
        if (!isUuid(req.params.id)) return badId(res);
        const schema = z.object({ next_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() });
        const data = schema.parse(req.body || {});
        const { rows } = await pool.query(
            `UPDATE renewals
                SET renewal_date = COALESCE($2::date, renewal_date + INTERVAL '1 year'),
                    last_renewed_at = NOW(),
                    status = 'ACTIVE',
                    updated_at = NOW()
              WHERE id = $1 RETURNING *`,
            [req.params.id, data.next_date || null]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Renewal not found.' });
        audit(req, 'RENEWAL_RENEWED', 'renewals', req.params.id, { next_date: rows[0].renewal_date });
        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        return serverError(res, err, 'renewRenewal');
    }
}

/** Compact upcoming list for the Command Center chip/panel. */
export async function getUpcomingRenewals(req, res) {
    try {
        const days = /^\d+$/.test(req.query.days || '') ? Math.min(parseInt(req.query.days, 10), 365) : 30;
        const { rows } = await pool.query(
            `SELECT r.id, r.label, r.service, r.renewal_date, r.amount, r.currency,
                    r.client_id, c.name AS client_name,
                    (r.renewal_date - CURRENT_DATE) AS days_remaining
               FROM renewals r
               LEFT JOIN clients c ON c.id = r.client_id
              WHERE r.status = 'ACTIVE'
                AND r.renewal_date BETWEEN CURRENT_DATE AND CURRENT_DATE + ($2 || ' days')::interval
              ORDER BY r.renewal_date ASC
              LIMIT 8`,
            [days, String(days)]
        );
        return res.json(rows);
    } catch (err) {
        return serverError(res, err, 'getUpcomingRenewals');
    }
}

// ══════════════════════════════════════════════════════════
// Maintenance plans (§48)
// ══════════════════════════════════════════════════════════

const maintenanceSchema = z.object({
    client_id: optionalUuid,
    project_id: optionalUuid,
    plan_name: z.string().trim().min(1).max(200),
    billing_cycle: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL']).default('MONTHLY'),
    amount: z.number().nonnegative().default(0),
    currency,
    start_date: optionalDate,
    renewal_date: optionalDate,
    included_hours: z.number().nonnegative().optional(),
    used_hours: z.number().nonnegative().optional(),
    site_url: z.string().trim().max(500).nullable().optional().or(z.literal('').transform(() => null)),
    sla_notes: z.string().max(2000).nullable().optional().or(z.literal('').transform(() => null)),
    active: z.boolean().optional(),
});

/**
 * Keep the plan's linked renewal row in step (idempotent upsert on
 * the partial unique index uq_renewals_maintenance_plan). A plan
 * deactivation cancels its renewal; reactivation restores it.
 */
async function syncPlanRenewal(plan) {
    if (!plan.renewal_date) return;
    await pool.query(
        `INSERT INTO renewals
            (client_id, project_id, maintenance_plan_id, service, label,
             renewal_date, amount, currency, status)
         VALUES ($1, $2, $3, 'MAINTENANCE', $4, $5, $6, $7, $8)
         ON CONFLICT (maintenance_plan_id) WHERE maintenance_plan_id IS NOT NULL
         DO UPDATE SET
             client_id = EXCLUDED.client_id,
             project_id = EXCLUDED.project_id,
             label = EXCLUDED.label,
             renewal_date = EXCLUDED.renewal_date,
             amount = EXCLUDED.amount,
             currency = EXCLUDED.currency,
             status = EXCLUDED.status,
             updated_at = NOW()`,
        [plan.client_id, plan.project_id, plan.id,
         `Maintenance — ${plan.plan_name}`, plan.renewal_date,
         plan.amount, plan.currency, plan.active ? 'ACTIVE' : 'CANCELLED']
    );
}

export async function getMaintenancePlans(req, res) {
    try {
        const { rows } = await pool.query(
            `SELECT mp.*, c.name AS client_name, cp.project_name,
                    r.id AS renewal_id, r.status AS renewal_status
               FROM maintenance_plans mp
               LEFT JOIN clients c ON c.id = mp.client_id
               LEFT JOIN client_projects cp ON cp.id = mp.project_id
               LEFT JOIN renewals r ON r.maintenance_plan_id = mp.id
              ORDER BY mp.active DESC, mp.created_at DESC`
        );
        return res.json(rows);
    } catch (err) {
        return serverError(res, err, 'getMaintenancePlans');
    }
}

export async function createMaintenancePlan(req, res) {
    try {
        const data = maintenanceSchema.parse(req.body);
        const { rows } = await pool.query(
            `INSERT INTO maintenance_plans
                (client_id, project_id, plan_name, billing_cycle, amount, currency,
                 start_date, renewal_date, included_hours, used_hours, site_url, sla_notes, active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, COALESCE($13, TRUE))
             RETURNING *`,
            [data.client_id || null, data.project_id || null, data.plan_name, data.billing_cycle,
             data.amount, data.currency, data.start_date || null, data.renewal_date || null,
             data.included_hours ?? 0, data.used_hours ?? 0, data.site_url || null,
             data.sla_notes || null, data.active]
        );
        await syncPlanRenewal(rows[0]);
        audit(req, 'MAINTENANCE_PLAN_CREATED', 'maintenance_plans', rows[0].id, { plan_name: data.plan_name });
        return res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        return serverError(res, err, 'createMaintenancePlan');
    }
}

export async function updateMaintenancePlan(req, res) {
    try {
        if (!isUuid(req.params.id)) return badId(res);
        const data = maintenanceSchema.partial().parse(req.body);
        const allowed = ['client_id', 'project_id', 'plan_name', 'billing_cycle', 'amount', 'currency',
            'start_date', 'renewal_date', 'included_hours', 'used_hours', 'site_url', 'sla_notes', 'active'];
        const sets = [];
        const params = [];
        for (const key of allowed) {
            if (data[key] !== undefined) {
                params.push(data[key] === '' ? null : data[key]);
                sets.push(`${key} = $${params.length}`);
            }
        }
        if (sets.length === 0) return res.status(400).json({ error: 'No valid fields to update.' });
        params.push(req.params.id);
        const { rows } = await pool.query(
            `UPDATE maintenance_plans SET ${sets.join(', ')}, updated_at = NOW()
              WHERE id = $${params.length} RETURNING *`,
            params
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Maintenance plan not found.' });
        await syncPlanRenewal(rows[0]);
        audit(req, 'MAINTENANCE_PLAN_UPDATED', 'maintenance_plans', req.params.id, data);
        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        return serverError(res, err, 'updateMaintenancePlan');
    }
}

export async function deleteMaintenancePlan(req, res) {
    try {
        if (!isUuid(req.params.id)) return badId(res);
        await pool.query(`DELETE FROM renewals WHERE maintenance_plan_id = $1`, [req.params.id]);
        const { rowCount } = await pool.query(`DELETE FROM maintenance_plans WHERE id = $1`, [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Maintenance plan not found.' });
        audit(req, 'MAINTENANCE_PLAN_DELETED', 'maintenance_plans', req.params.id, {});
        return res.json({ success: true });
    } catch (err) {
        return serverError(res, err, 'deleteMaintenancePlan');
    }
}

/** Log maintenance hours against a plan (§48 included/used hours). */
export async function logMaintenanceHours(req, res) {
    try {
        if (!isUuid(req.params.id)) return badId(res);
        const schema = z.object({
            hours: z.number().positive().max(1000),
            note: z.string().max(500).optional(),
        });
        const data = schema.parse(req.body);
        const { rows } = await pool.query(
            `UPDATE maintenance_plans
                SET used_hours = used_hours + $2, updated_at = NOW()
              WHERE id = $1 RETURNING *`,
            [req.params.id, data.hours]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Maintenance plan not found.' });
        audit(req, 'MAINTENANCE_HOURS_LOGGED', 'maintenance_plans', req.params.id, {
            hours: data.hours, note: data.note || null,
        });
        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        return serverError(res, err, 'logMaintenanceHours');
    }
}

// ══════════════════════════════════════════════════════════
// Testimonials (§54)
// ══════════════════════════════════════════════════════════

const testimonialSchema = z.object({
    client_id: optionalUuid,
    project_id: optionalUuid,
    rating: z.number().int().min(1).max(5).nullable().optional(),
    testimonial: z.string().trim().min(1).max(4000),
    client_name: z.string().trim().min(1).max(200),
    company: z.string().trim().max(200).nullable().optional().or(z.literal('').transform(() => null)),
    role: z.string().trim().max(200).nullable().optional().or(z.literal('').transform(() => null)),
    permission_to_publish: z.boolean().optional(),
    avatar_url: z.string().trim().max(500).nullable().optional().or(z.literal('').transform(() => null)),
});

export async function getTestimonials(req, res) {
    try {
        const { rows } = await pool.query(
            `SELECT t.*, c.name AS linked_client_name, cp.project_name
               FROM testimonials t
               LEFT JOIN clients c ON c.id = t.client_id
               LEFT JOIN client_projects cp ON cp.id = t.project_id
              ORDER BY t.created_at DESC`
        );
        return res.json(rows);
    } catch (err) {
        return serverError(res, err, 'getTestimonials');
    }
}

export async function createTestimonial(req, res) {
    try {
        const data = testimonialSchema.parse(req.body);
        const { rows } = await pool.query(
            `INSERT INTO testimonials
                (client_id, project_id, rating, testimonial, client_name, company, role,
                 permission_to_publish, avatar_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, FALSE), $9) RETURNING *`,
            [data.client_id || null, data.project_id || null, data.rating ?? null,
             data.testimonial, data.client_name, data.company || null, data.role || null,
             data.permission_to_publish, data.avatar_url || null]
        );
        audit(req, 'TESTIMONIAL_CREATED', 'testimonials', rows[0].id, { client_name: data.client_name });
        return res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        return serverError(res, err, 'createTestimonial');
    }
}

export async function updateTestimonial(req, res) {
    try {
        if (!isUuid(req.params.id)) return badId(res);
        const data = testimonialSchema.partial().parse(req.body);

        // §54 — never publish without explicit client permission.
        if (data.published === true) {
            const { rows: existing } = await pool.query(
                `SELECT permission_to_publish, published FROM testimonials WHERE id = $1`,
                [req.params.id]
            );
            if (existing.length === 0) return res.status(404).json({ error: 'Testimonial not found.' });
            const permitted = data.permission_to_publish ?? existing[0].permission_to_publish;
            if (!permitted) {
                return res.status(400).json({ error: 'Publishing requires the client\'s permission to publish.' });
            }
        }

        const allowed = ['client_id', 'project_id', 'rating', 'testimonial', 'client_name',
            'company', 'role', 'permission_to_publish', 'avatar_url', 'published'];
        const sets = [];
        const params = [];
        for (const key of allowed) {
            if (data[key] !== undefined) {
                params.push(data[key] === '' ? null : data[key]);
                sets.push(`${key} = $${params.length}`);
            }
        }
        if (data.published !== undefined) {
            sets.push(`published_at = ${data.published ? 'NOW()' : 'NULL'}`);
        }
        if (sets.length === 0) return res.status(400).json({ error: 'No valid fields to update.' });
        params.push(req.params.id);
        const { rows } = await pool.query(
            `UPDATE testimonials SET ${sets.join(', ')}, updated_at = NOW()
              WHERE id = $${params.length} RETURNING *`,
            params
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Testimonial not found.' });
        audit(req, 'TESTIMONIAL_UPDATED', 'testimonials', req.params.id, data);
        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        return serverError(res, err, 'updateTestimonial');
    }
}

export async function deleteTestimonial(req, res) {
    try {
        if (!isUuid(req.params.id)) return badId(res);
        const { rowCount } = await pool.query(`DELETE FROM testimonials WHERE id = $1`, [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Testimonial not found.' });
        audit(req, 'TESTIMONIAL_DELETED', 'testimonials', req.params.id, {});
        return res.json({ success: true });
    } catch (err) {
        return serverError(res, err, 'deleteTestimonial');
    }
}

/** PUBLIC — feeds the homepage testimonials section (§54). */
export async function getPublicTestimonials(req, res) {
    try {
        const { rows } = await pool.query(
            `SELECT id, client_name, company, role, testimonial, rating, published_at
               FROM testimonials
              WHERE published AND permission_to_publish
              ORDER BY published_at DESC NULLS LAST
              LIMIT 10`
        );
        // Shape matches TestimonialsSplit's item contract.
        return res.json(rows.map((r) => ({
            id: r.id,
            name: r.client_name,
            company: r.company || 'Client',
            role: r.role || '',
            quote: r.testimonial,
            rating: r.rating,
        })));
    } catch (err) {
        return serverError(res, err, 'getPublicTestimonials');
    }
}

// ══════════════════════════════════════════════════════════
// Referrals (§55)
// ══════════════════════════════════════════════════════════

const referralSchema = z.object({
    referrer_client_id: optionalUuid,
    code: z.string().trim().toUpperCase().max(24).optional(),
    referred_name: z.string().trim().max(200).nullable().optional().or(z.literal('').transform(() => null)),
    referred_business: z.string().trim().max(200).nullable().optional().or(z.literal('').transform(() => null)),
    referred_email: z.string().trim().email().max(200).nullable().optional().or(z.literal('').transform(() => null)),
    status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST']).optional(),
    project_id: optionalUuid,
    revenue: money,
    currency,
    reward_description: z.string().max(500).nullable().optional().or(z.literal('').transform(() => null)),
    reward_status: z.enum(['NONE', 'PENDING', 'AWARDED', 'PAID']).optional(),
    notes: z.string().max(2000).nullable().optional().or(z.literal('').transform(() => null)),
});

function generateReferralCode() {
    return crypto.randomBytes(6).toString('base64url')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()
        .padEnd(8, 'X')
        .slice(0, 8);
}

export async function getReferrals(req, res) {
    try {
        const { rows } = await pool.query(
            `SELECT rf.*, c.name AS referrer_name, cp.project_name
               FROM referrals rf
               LEFT JOIN clients c ON c.id = rf.referrer_client_id
               LEFT JOIN client_projects cp ON cp.id = rf.project_id
              ORDER BY rf.created_at DESC`
        );
        return res.json(rows);
    } catch (err) {
        return serverError(res, err, 'getReferrals');
    }
}

export async function createReferral(req, res) {
    try {
        const data = referralSchema.parse(req.body);
        let code = data.code || generateReferralCode();
        let rows = [];
        // Retry on the unlikely code collision (§89 pattern).
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const result = await pool.query(
                    `INSERT INTO referrals
                        (referrer_client_id, code, referred_name, referred_business, referred_email,
                         status, project_id, revenue, currency, reward_description, reward_status, notes)
                     VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'NEW'), $7, $8, $9, $10, COALESCE($11, 'NONE'), $12)
                     RETURNING *`,
                    [data.referrer_client_id || null, code, data.referred_name || null,
                     data.referred_business || null, data.referred_email || null, data.status,
                     data.project_id || null, data.revenue ?? null, data.currency,
                     data.reward_description || null, data.reward_status, data.notes || null]
                );
                rows = result.rows;
                break;
            } catch (insertErr) {
                if (insertErr.code === '23505' && !data.code) {
                    code = generateReferralCode();
                    continue;
                }
                throw insertErr;
            }
        }
        if (rows.length === 0) return res.status(409).json({ error: 'Referral code already exists.' });
        audit(req, 'REFERRAL_CREATED', 'referrals', rows[0].id, { code: rows[0].code });
        return res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        return serverError(res, err, 'createReferral');
    }
}

export async function updateReferral(req, res) {
    try {
        if (!isUuid(req.params.id)) return badId(res);
        const data = referralSchema.partial().parse(req.body);
        const allowed = ['referrer_client_id', 'referred_name', 'referred_business', 'referred_email',
            'status', 'project_id', 'revenue', 'currency', 'reward_description', 'reward_status', 'notes'];
        const sets = [];
        const params = [];
        for (const key of allowed) {
            if (data[key] !== undefined) {
                params.push(data[key] === '' ? null : data[key]);
                sets.push(`${key} = $${params.length}`);
            }
        }
        if (sets.length === 0) return res.status(400).json({ error: 'No valid fields to update.' });
        params.push(req.params.id);
        const { rows } = await pool.query(
            `UPDATE referrals SET ${sets.join(', ')}, updated_at = NOW()
              WHERE id = $${params.length} RETURNING *`,
            params
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Referral not found.' });
        audit(req, 'REFERRAL_UPDATED', 'referrals', req.params.id, data);
        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        return serverError(res, err, 'updateReferral');
    }
}

export async function deleteReferral(req, res) {
    try {
        if (!isUuid(req.params.id)) return badId(res);
        const { rowCount } = await pool.query(`DELETE FROM referrals WHERE id = $1`, [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Referral not found.' });
        audit(req, 'REFERRAL_DELETED', 'referrals', req.params.id, {});
        return res.json({ success: true });
    } catch (err) {
        return serverError(res, err, 'deleteReferral');
    }
}

/** PUBLIC — who referred this code (for the /ref/:code landing). */
export async function getReferralByCode(req, res) {
    try {
        const code = String(req.params.code || '').toUpperCase();
        if (!/^[A-Z0-9]{4,24}$/.test(code)) return res.status(400).json({ error: 'Invalid referral code.' });
        const { rows } = await pool.query(
            `SELECT rf.code, rf.status, c.name AS referrer_name
               FROM referrals rf
               LEFT JOIN clients c ON c.id = rf.referrer_client_id
              WHERE rf.code = $1`,
            [code]
        );
        if (rows.length === 0 || rows[0].status === 'LOST') {
            return res.status(404).json({ error: 'Referral not found.' });
        }
        return res.json({
            code: rows[0].code,
            referrer_name: rows[0].referrer_name || 'A BuildWithLami client',
        });
    } catch (err) {
        return serverError(res, err, 'getReferralByCode');
    }
}

/** PUBLIC — count a visit to /ref/:code. Fire-and-forget friendly. */
export async function recordReferralHit(req, res) {
    try {
        const code = String(req.params.code || '').toUpperCase();
        if (!/^[A-Z0-9]{4,24}$/.test(code)) return res.status(400).json({ error: 'Invalid referral code.' });
        const { rows } = await pool.query(
            `UPDATE referrals
                SET hits = hits + 1, last_hit_at = NOW(), updated_at = NOW()
              WHERE code = $1 AND status <> 'LOST'
             RETURNING id`,
            [code]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Referral not found.' });
        audit(req, 'REFERRAL_HIT', 'referrals', rows[0].id, { code });
        return res.json({ success: true });
    } catch (err) {
        return serverError(res, err, 'recordReferralHit');
    }
}

// ══════════════════════════════════════════════════════════
// Site monitors (§49)
// ══════════════════════════════════════════════════════════

const monitorSchema = z.object({
    name: z.string().trim().min(1).max(200),
    url: z.string().trim().url().refine((u) => /^https?:\/\//i.test(u), 'Must be an http(s) URL'),
    client_id: optionalUuid,
    project_id: optionalUuid,
    enabled: z.boolean().optional(),
});

export async function getMonitors(req, res) {
    try {
        const { rows } = await pool.query(
            `SELECT sm.*, c.name AS client_name, cp.project_name
               FROM site_monitors sm
               LEFT JOIN clients c ON c.id = sm.client_id
               LEFT JOIN client_projects cp ON cp.id = sm.project_id
              ORDER BY sm.created_at ASC`
        );
        return res.json(rows);
    } catch (err) {
        return serverError(res, err, 'getMonitors');
    }
}

export async function getMonitorEvents(req, res) {
    try {
        if (!isUuid(req.params.id)) return badId(res);
        const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
        const { rows } = await pool.query(
            `SELECT e.*, sm.name AS monitor_name
               FROM site_monitor_events e
               JOIN site_monitors sm ON sm.id = e.monitor_id
              WHERE e.monitor_id = $1
              ORDER BY e.checked_at DESC
              LIMIT $2`,
            [req.params.id, limit]
        );
        return res.json(rows);
    } catch (err) {
        return serverError(res, err, 'getMonitorEvents');
    }
}

export async function createMonitor(req, res) {
    try {
        const data = monitorSchema.parse(req.body);
        const { rows } = await pool.query(
            `INSERT INTO site_monitors (name, url, client_id, project_id, enabled)
             VALUES ($1, $2, $3, $4, COALESCE($5, TRUE)) RETURNING *`,
            [data.name, data.url, data.client_id || null, data.project_id || null, data.enabled]
        );
        audit(req, 'MONITOR_CREATED', 'site_monitors', rows[0].id, { name: data.name, url: data.url });
        return res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        return serverError(res, err, 'createMonitor');
    }
}

export async function updateMonitor(req, res) {
    try {
        if (!isUuid(req.params.id)) return badId(res);
        const data = monitorSchema.partial().parse(req.body);
        const allowed = ['name', 'url', 'client_id', 'project_id', 'enabled'];
        const sets = [];
        const params = [];
        for (const key of allowed) {
            if (data[key] !== undefined) {
                params.push(data[key] === '' ? null : data[key]);
                sets.push(`${key} = $${params.length}`);
            }
        }
        if (sets.length === 0) return res.status(400).json({ error: 'No valid fields to update.' });
        params.push(req.params.id);
        const { rows } = await pool.query(
            `UPDATE site_monitors SET ${sets.join(', ')}, updated_at = NOW()
              WHERE id = $${params.length} RETURNING *`,
            params
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Monitor not found.' });
        audit(req, 'MONITOR_UPDATED', 'site_monitors', req.params.id, data);
        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        return serverError(res, err, 'updateMonitor');
    }
}

export async function deleteMonitor(req, res) {
    try {
        if (!isUuid(req.params.id)) return badId(res);
        const { rowCount } = await pool.query(`DELETE FROM site_monitors WHERE id = $1`, [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Monitor not found.' });
        audit(req, 'MONITOR_DELETED', 'site_monitors', req.params.id, {});
        return res.json({ success: true });
    } catch (err) {
        return serverError(res, err, 'deleteMonitor');
    }
}

/** Manual "check now" trigger (the cron calls the service directly). */
export async function triggerMonitorChecks(req, res) {
    try {
        const summary = await runMonitorChecks();
        audit(req, 'MONITOR_CHECKS_RUN', 'site_monitors', null, summary);
        return res.json(summary);
    } catch (err) {
        return serverError(res, err, 'triggerMonitorChecks');
    }
}

// ══════════════════════════════════════════════════════════
// Handover (§51–§52) + launch (§53)
// ══════════════════════════════════════════════════════════

export async function getHandover(req, res) {
    try {
        if (!isUuid(req.params.projectId)) return badId(res);
        const state = await getHandoverState(req.params.projectId);
        if (!state) return res.status(404).json({ error: 'Project not found.' });
        return res.json(state);
    } catch (err) {
        return serverError(res, err, 'getHandover');
    }
}

export async function startHandoverAction(req, res) {
    try {
        if (!isUuid(req.params.projectId)) return badId(res);
        const state = await startHandover(req.params.projectId);
        if (!state) return res.status(404).json({ error: 'Project not found.' });
        audit(req, 'HANDOVER_STARTED', 'client_projects', req.params.projectId, {});
        return res.json(state);
    } catch (err) {
        return serverError(res, err, 'startHandover');
    }
}

export async function toggleHandoverItem(req, res) {
    try {
        if (!isUuid(req.params.projectId)) return badId(res);
        const schema = z.object({
            key: z.string().trim().min(1).max(64),
            done: z.boolean(),
            note: z.string().max(500).nullable().optional(),
        });
        const data = schema.parse(req.body);
        const result = await setChecklistItem(req.params.projectId, data.key, data.done, data.note ?? null);
        if (result?.notFound) return res.status(404).json({ error: 'Project not found.' });
        if (result?.badKey) return res.status(400).json({ error: 'Unknown checklist item.' });
        return res.json({ checklist: result.checklist, missing_required: result.missing, all_required_done: result.allRequiredDone });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        return serverError(res, err, 'toggleHandoverItem');
    }
}

export async function completeHandoverAction(req, res) {
    try {
        if (!isUuid(req.params.projectId)) return badId(res);
        const schema = z.object({ next_status: z.enum(['MAINTENANCE', 'ARCHIVED']) });
        const data = schema.parse(req.body);
        const result = await completeHandover(req.params.projectId, data.next_status, req.user);
        if (result?.notFound) return res.status(404).json({ error: 'Project not found.' });
        if (result?.blocked) {
            return res.status(400).json({
                error: 'Handover blocked — required checklist items outstanding.',
                missing: result.missing,
            });
        }
        return res.json({ success: true, project: result.project });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        return serverError(res, err, 'completeHandover');
    }
}

export async function launchProjectAction(req, res) {
    try {
        if (!isUuid(req.params.projectId)) return badId(res);
        const result = await launchProject(req.params.projectId, req.user);
        if (result?.alreadyLaunched) {
            return res.status(409).json({ error: 'Project is already launched or archived.' });
        }
        return res.json({ success: true, project: result.project, automation: result.automation });
    } catch (err) {
        return serverError(res, err, 'launchProject');
    }
}
