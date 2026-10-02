// ─── src/controllers/deliveryController.js ────────────────
// Admin OS Phase 3a — Delivery Control (blueprint §35–§38).
//
// Admin endpoints (Owner-gated in routes/deliveryRoutes.js):
//   GET    /api/delivery/projects/:projectId/approvals
//   POST   /api/delivery/projects/:projectId/approvals       — create + email client
//   PATCH  /api/delivery/approvals/:id                       — edit / supersede / cancel
//   GET    /api/delivery/projects/:projectId/change-requests
//   POST   /api/delivery/projects/:projectId/change-requests
//   PATCH  /api/delivery/change-requests/:id                 — edit / send / cancel
//   GET    /api/delivery/projects/:projectId/decisions
//   POST   /api/delivery/projects/:projectId/decisions       — manual decision entry
//
// Portal endpoints (verifyClientToken, in clientPortalRoutes):
//   GET   /api/client-portal/approvals                       — pending approvals + sent CRs
//   PATCH /api/client-portal/approvals/:id/decide            — approve / request changes
//   PATCH /api/client-portal/change-requests/:id/decide      — approve / reject
//
// Every client decision is written to project_decisions (§38),
// audited, and notified to the owner. CHANGES_REQUESTED on an
// approval consumes a revision round (§36) — counted, never
// automatically billed.
// ──────────────────────────────────────────────────────────

import { z } from 'zod';
import pool from '../config/db.js';
import { writeAuditLog, getClientIp } from '../utils/auditLog.js';
import { createNotification } from './notificationController.js';
import { sendApprovalRequestEmail, sendChangeRequestEmail } from '../services/deliveryEmailService.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

async function getOwnerUserId() {
    const { rows } = await pool.query(
        `SELECT id FROM users WHERE lower(role) = 'owner' ORDER BY created_at LIMIT 1`
    );
    return rows[0]?.id || null;
}

async function notifyOwner({ type, title, body, link }) {
    const ownerId = await getOwnerUserId();
    if (ownerId) {
        await createNotification({ userId: ownerId, type, title, body, link }).catch(() => {});
    }
}

/** Resolve project → { id, client_id, project_name, client_name, client_email }. */
async function loadProjectContext(projectId) {
    const { rows } = await pool.query(
        `SELECT p.id, p.client_id, p.project_name,
                c.name AS client_name, c.primary_contact_email AS client_email
           FROM client_projects p
           JOIN clients c ON c.id = p.client_id
          WHERE p.id = $1`,
        [projectId]
    );
    return rows[0] || null;
}

/** Append to the decision log (§38). Fire-and-forget safe. */
async function recordDecision({ projectId, clientId, title, decision, source, relatedId = null, createdBy = null }) {
    await pool.query(
        `INSERT INTO project_decisions (project_id, client_id, title, decision, source, related_id, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [projectId, clientId, title, decision, source, relatedId, createdBy]
    ).catch((err) => console.error('[Delivery] decision log write failed:', err.message));
}

// ── Schemas ──────────────────────────────────────────────
const createApprovalSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().optional().nullable(),
    item_type: z.enum(['DESIGN', 'FEATURE', 'CONTENT', 'STAGE', 'OTHER']).optional().default('DESIGN'),
    version_label: z.string().max(60).optional().nullable(),
    notify_client: z.boolean().optional().default(true),
});

const updateApprovalSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional().nullable(),
    item_type: z.enum(['DESIGN', 'FEATURE', 'CONTENT', 'STAGE', 'OTHER']).optional(),
    version_label: z.string().max(60).optional().nullable(),
    status: z.enum(['PENDING', 'SUPERSEDED', 'CANCELLED']).optional(),
});

const createChangeRequestSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().optional().nullable(),
    reason: z.string().optional().nullable(),
    additional_cost: z.number().min(0).optional().default(0),
    currency: z.string().length(3).optional().default('NGN'),
    additional_days: z.number().int().min(0).optional().default(0),
    launch_impact: z.string().optional().nullable(),
    send_now: z.boolean().optional().default(true),
});

const updateChangeRequestSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional().nullable(),
    reason: z.string().optional().nullable(),
    additional_cost: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
    additional_days: z.number().int().min(0).optional(),
    launch_impact: z.string().optional().nullable(),
    status: z.enum(['SENT', 'CANCELLED']).optional(), // APPROVED/REJECTED are client-only
});

const createDecisionSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    decision: z.string().min(1, 'Decision is required'),
    source: z.enum(['MANUAL', 'COMMUNICATION']).optional().default('MANUAL'),
});

// ══════════════════════════════════════════════════════════
//  Approvals (§35)
// ══════════════════════════════════════════════════════════

export async function getApprovals(req, res) {
    try {
        const { projectId } = req.params;
        if (!isUuid(projectId)) return res.status(400).json({ error: 'Invalid project ID.' });
        const { rows } = await pool.query(
            `SELECT * FROM approvals WHERE project_id = $1 ORDER BY (status = 'PENDING') DESC, created_at DESC`,
            [projectId]
        );
        return res.json(rows);
    } catch (err) {
        console.error('[Delivery] getApprovals error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function createApproval(req, res) {
    try {
        const { projectId } = req.params;
        if (!isUuid(projectId)) return res.status(400).json({ error: 'Invalid project ID.' });
        const data = createApprovalSchema.parse(req.body);

        const ctx = await loadProjectContext(projectId);
        if (!ctx) return res.status(404).json({ error: 'Project not found.' });

        const { rows } = await pool.query(
            `INSERT INTO approvals
                (project_id, client_id, title, description, item_type, version_label, status, requested_at, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', NOW(), $7)
             RETURNING *`,
            [projectId, ctx.client_id, data.title, data.description || null,
             data.item_type, data.version_label || null, req.user?.id || null]
        );

        writeAuditLog({
            action: 'APPROVAL_REQUESTED',
            entityType: 'approvals',
            entityId: rows[0].id,
            details: { title: data.title, projectId, item_type: data.item_type },
            user: req.user,
            ipAddress: getClientIp(req),
        }).catch(() => {});

        let emailStatus = null;
        if (data.notify_client) {
            try {
                const result = await sendApprovalRequestEmail({
                    clientEmail: ctx.client_email,
                    clientName: ctx.client_name,
                    title: data.title,
                    description: data.description,
                    projectName: ctx.project_name,
                    versionLabel: data.version_label,
                });
                emailStatus = result.success ? 'sent' : 'failed';
            } catch { emailStatus = 'failed'; }
        }

        return res.status(201).json({ ...rows[0], emailStatus });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Delivery] createApproval error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function updateApproval(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid approval ID.' });
        const data = updateApprovalSchema.parse(req.body);

        // A decided approval is a record — it can only be
        // superseded/cancelled, never silently edited.
        if (data.status === undefined && data.title === undefined) {
            return res.status(400).json({ error: 'No updatable fields provided.' });
        }

        const fields = Object.keys(data).filter((k) => ['title', 'description', 'item_type', 'version_label', 'status'].includes(k));
        const setClauses = fields.map((k, i) => `${k} = $${i + 1}`);
        const values = fields.map((k) => data[k] ?? null);
        values.push(id);

        const { rows } = await pool.query(
            `UPDATE approvals SET ${setClauses.join(', ')}, updated_at = NOW()
              WHERE id = $${values.length}
                AND status NOT IN ('APPROVED', 'CHANGES_REQUESTED', 'SUPERSEDED', 'CANCELLED')
              RETURNING *`,
            values
        );
        if (rows.length === 0) return res.status(409).json({ error: 'Approval not found or already decided.' });

        writeAuditLog({
            action: 'APPROVAL_UPDATED',
            entityType: 'approvals',
            entityId: id,
            details: { fields },
            user: req.user,
            ipAddress: getClientIp(req),
        }).catch(() => {});

        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Delivery] updateApproval error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ══════════════════════════════════════════════════════════
//  Change requests (§37)
// ══════════════════════════════════════════════════════════

export async function getChangeRequests(req, res) {
    try {
        const { projectId } = req.params;
        if (!isUuid(projectId)) return res.status(400).json({ error: 'Invalid project ID.' });
        const { rows } = await pool.query(
            `SELECT * FROM change_requests WHERE project_id = $1 ORDER BY (status = 'SENT') DESC, created_at DESC`,
            [projectId]
        );
        return res.json(rows);
    } catch (err) {
        console.error('[Delivery] getChangeRequests error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function createChangeRequest(req, res) {
    try {
        const { projectId } = req.params;
        if (!isUuid(projectId)) return res.status(400).json({ error: 'Invalid project ID.' });
        const data = createChangeRequestSchema.parse(req.body);

        const ctx = await loadProjectContext(projectId);
        if (!ctx) return res.status(404).json({ error: 'Project not found.' });

        const currency = (data.currency || 'NGN').toUpperCase();
        const { rows } = await pool.query(
            `INSERT INTO change_requests
                (project_id, client_id, title, description, reason, additional_cost, currency,
                 additional_days, launch_impact, status, sent_at, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING *`,
            [projectId, ctx.client_id, data.title, data.description || null, data.reason || null,
             data.additional_cost || 0, currency, data.additional_days || 0, data.launch_impact || null,
             data.send_now ? 'SENT' : 'DRAFT', data.send_now ? new Date().toISOString() : null,
             req.user?.id || null]
        );

        writeAuditLog({
            action: 'CHANGE_REQUEST_CREATED',
            entityType: 'change_requests',
            entityId: rows[0].id,
            details: { title: data.title, projectId, additionalCost: data.additional_cost, sent: data.send_now },
            user: req.user,
            ipAddress: getClientIp(req),
        }).catch(() => {});

        let emailStatus = null;
        if (data.send_now) {
            try {
                const result = await sendChangeRequestEmail({
                    clientEmail: ctx.client_email,
                    clientName: ctx.client_name,
                    title: data.title,
                    description: data.description,
                    additionalCost: data.additional_cost || 0,
                    currency,
                    additionalDays: data.additional_days || 0,
                    launchImpact: data.launch_impact,
                    projectName: ctx.project_name,
                });
                emailStatus = result.success ? 'sent' : 'failed';
            } catch { emailStatus = 'failed'; }
        }

        return res.status(201).json({ ...rows[0], emailStatus });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Delivery] createChangeRequest error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function updateChangeRequest(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid change request ID.' });
        const data = updateChangeRequestSchema.parse(req.body);

        const fields = Object.keys(data).filter((k) =>
            ['title', 'description', 'reason', 'additional_cost', 'currency', 'additional_days', 'launch_impact', 'status'].includes(k)
        );
        if (fields.length === 0) {
            return res.status(400).json({ error: 'No updatable fields provided.' });
        }

        const setClauses = fields.map((k, i) => `${k} = $${i + 1}`);
        if (data.status === 'SENT') setClauses.push(`sent_at = COALESCE(sent_at, NOW())`);
        const values = fields.map((k) => data[k] ?? null);
        values.push(id);

        // Only DRAFT rows are admin-editable; once the client has a
        // SENT/AUTO-decided CR in hand it is immutable.
        const { rows } = await pool.query(
            `UPDATE change_requests SET ${setClauses.join(', ')}, updated_at = NOW()
              WHERE id = $${values.length}
                AND status = 'DRAFT'
              RETURNING *`,
            values
        );
        if (rows.length === 0) {
            return res.status(409).json({ error: 'Change request not found, already sent, or already decided.' });
        }

        writeAuditLog({
            action: 'CHANGE_REQUEST_UPDATED',
            entityType: 'change_requests',
            entityId: id,
            details: { fields, sent: data.status === 'SENT' },
            user: req.user,
            ipAddress: getClientIp(req),
        }).catch(() => {});

        // Sending emails the client about the scope change.
        let emailStatus = null;
        if (data.status === 'SENT') {
            const ctx = await loadProjectContext(rows[0].project_id);
            try {
                const result = await sendChangeRequestEmail({
                    clientEmail: ctx?.client_email,
                    clientName: ctx?.client_name,
                    title: rows[0].title,
                    description: rows[0].description,
                    additionalCost: Number(rows[0].additional_cost),
                    currency: rows[0].currency,
                    additionalDays: rows[0].additional_days,
                    launchImpact: rows[0].launch_impact,
                    projectName: ctx?.project_name,
                });
                emailStatus = result.success ? 'sent' : 'failed';
            } catch { emailStatus = 'failed'; }
        }

        return res.json({ ...rows[0], emailStatus });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Delivery] updateChangeRequest error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ══════════════════════════════════════════════════════════
//  Decision log (§38)
// ══════════════════════════════════════════════════════════

export async function getDecisions(req, res) {
    try {
        const { projectId } = req.params;
        if (!isUuid(projectId)) return res.status(400).json({ error: 'Invalid project ID.' });
        const { rows } = await pool.query(
            `SELECT d.*, (u.email IS NOT NULL) AS by_admin
               FROM project_decisions d
               LEFT JOIN users u ON u.id = d.created_by
              WHERE d.project_id = $1
              ORDER BY d.created_at DESC
              LIMIT 200`,
            [projectId]
        );
        return res.json(rows);
    } catch (err) {
        console.error('[Delivery] getDecisions error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function createDecision(req, res) {
    try {
        const { projectId } = req.params;
        if (!isUuid(projectId)) return res.status(400).json({ error: 'Invalid project ID.' });
        const data = createDecisionSchema.parse(req.body);

        const ctx = await loadProjectContext(projectId);
        if (!ctx) return res.status(404).json({ error: 'Project not found.' });

        const { rows } = await pool.query(
            `INSERT INTO project_decisions (project_id, client_id, title, decision, source, created_by)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [projectId, ctx.client_id, data.title, data.decision, data.source, req.user?.id || null]
        );

        writeAuditLog({
            action: 'DECISION_LOGGED',
            entityType: 'project_decisions',
            entityId: rows[0].id,
            details: { title: data.title, source: data.source },
            user: req.user,
            ipAddress: getClientIp(req),
        }).catch(() => {});

        return res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Delivery] createDecision error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ══════════════════════════════════════════════════════════
//  Portal: client decisions
// ══════════════════════════════════════════════════════════

/** GET /api/client-portal/approvals — my pending approvals + sent change requests. */
export async function getMyApprovals(req, res) {
    try {
        const [approvals, changeRequests] = await Promise.all([
            pool.query(
                `SELECT a.id, a.title, a.description, a.item_type, a.version_label, a.status,
                        a.requested_at, a.project_id, p.project_name
                   FROM approvals a
                   LEFT JOIN client_projects p ON p.id = a.project_id
                  WHERE a.client_id = $1 AND a.status = 'PENDING'
                  ORDER BY a.requested_at ASC
                  LIMIT 50`,
                [req.clientUser.id]
            ),
            pool.query(
                `SELECT cr.id, cr.title, cr.description, cr.reason, cr.additional_cost, cr.currency,
                        cr.additional_days, cr.launch_impact, cr.status, cr.sent_at,
                        cr.project_id, p.project_name
                   FROM change_requests cr
                   LEFT JOIN client_projects p ON p.id = cr.project_id
                  WHERE cr.client_id = $1 AND cr.status = 'SENT'
                  ORDER BY cr.sent_at ASC
                  LIMIT 50`,
                [req.clientUser.id]
            ),
        ]);
        return res.json({ approvals: approvals.rows, changeRequests: changeRequests.rows });
    } catch (err) {
        console.error('[Delivery] getMyApprovals error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

/** PATCH /api/client-portal/approvals/:id/decide — { decision: 'APPROVED'|'CHANGES_REQUESTED', comment? } */
export async function decideMyApproval(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid approval ID.' });

        const decision = req.body?.decision;
        if (!['APPROVED', 'CHANGES_REQUESTED'].includes(decision)) {
            return res.status(400).json({ error: 'decision must be APPROVED or CHANGES_REQUESTED.' });
        }
        const comment = typeof req.body?.comment === 'string' ? req.body.comment.slice(0, 2000) : null;
        if (decision === 'CHANGES_REQUESTED' && !comment?.trim()) {
            return res.status(400).json({ error: 'Please describe the changes you need.' });
        }

        const client = await pool.connect();
        let approval;
        let project;
        try {
            await client.query('BEGIN');

            const upd = await client.query(
                `UPDATE approvals
                    SET status = $1,
                        client_comment = $2,
                        decided_at = NOW(),
                        updated_at = NOW()
                  WHERE id = $3 AND client_id = $4 AND status = 'PENDING'
                  RETURNING *`,
                [decision, comment, id, req.clientUser.id]
            );
            if (upd.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Approval not found or already decided.' });
            }
            approval = upd.rows[0];

            // §36 — a changes-requested round consumes one revision.
            // Counted for transparency; never auto-charged.
            if (decision === 'CHANGES_REQUESTED') {
                const rev = await client.query(
                    `UPDATE client_projects
                        SET used_revision_rounds = used_revision_rounds + 1,
                            updated_at = NOW()
                      WHERE id = $1
                      RETURNING used_revision_rounds, included_revision_rounds`,
                    [approval.project_id]
                );
                project = rev.rows[0];
            }

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

        // §38 — the decision log entry.
        await recordDecision({
            projectId: approval.project_id,
            clientId: req.clientUser.id,
            title: approval.title,
            decision: decision === 'APPROVED'
                ? `Approved${approval.version_label ? ` (${approval.version_label})` : ''}.${comment ? ` Note: ${comment}` : ''}`
                : `Changes requested${approval.version_label ? ` (${approval.version_label})` : ''}: ${comment}`,
            source: 'APPROVAL',
            relatedId: approval.id,
        });

        writeAuditLog({
            action: 'APPROVAL_RECORDED',
            entityType: 'approvals',
            entityId: id,
            details: { decision, comment, byClient: req.clientUser.email },
            ipAddress: getClientIp(req),
        }).catch(() => {});

        const overBudget = project && project.used_revision_rounds > project.included_revision_rounds;
        await notifyOwner({
            type: 'approval',
            title: decision === 'APPROVED' ? 'Client approved work' : 'Client requested changes',
            body: `${req.clientUser.name || 'A client'} ${decision === 'APPROVED' ? 'approved' : 'requested changes on'} "${approval.title}".${comment ? ` — ${comment.slice(0, 140)}` : ''}${overBudget ? ` ⚠️ Revision rounds used: ${project.used_revision_rounds}/${project.included_revision_rounds} — extra rounds need a priced change request.` : ''}`,
            link: `/admin/projects/${approval.project_id}`,
        });

        return res.json({ ...approval, used_revision_rounds: project?.used_revision_rounds, included_revision_rounds: project?.included_revision_rounds });
    } catch (err) {
        console.error('[Delivery] decideMyApproval error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

/** PATCH /api/client-portal/change-requests/:id/decide — { decision: 'APPROVED'|'REJECTED', comment? } */
export async function decideMyChangeRequest(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid change request ID.' });

        const decision = req.body?.decision;
        if (!['APPROVED', 'REJECTED'].includes(decision)) {
            return res.status(400).json({ error: 'decision must be APPROVED or REJECTED.' });
        }
        const comment = typeof req.body?.comment === 'string' ? req.body.comment.slice(0, 2000) : null;

        const client = await pool.connect();
        let cr;
        let projectUpdate = null;
        try {
            await client.query('BEGIN');

            const upd = await client.query(
                `UPDATE change_requests
                    SET status = $1,
                        client_comment = $2,
                        decided_at = NOW(),
                        updated_at = NOW()
                  WHERE id = $3 AND client_id = $4 AND status = 'SENT'
                  RETURNING *`,
                [decision, comment, id, req.clientUser.id]
            );
            if (upd.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Change request not found or already decided.' });
            }
            cr = upd.rows[0];

            // §37 — approval updates the project value, and the
            // payment status is re-derived from paid totals.
            if (decision === 'APPROVED' && Number(cr.additional_cost) > 0) {
                const proj = await client.query(
                    `UPDATE client_projects
                        SET amount_due = amount_due + $1,
                            updated_at = NOW()
                      WHERE id = $2
                      RETURNING amount_due`,
                    [cr.additional_cost, cr.project_id]
                );
                const agg = await client.query(
                    `SELECT COALESCE(SUM(amount) FILTER (WHERE status = 'PAID'), 0) AS paid_total
                       FROM invoices WHERE project_id = $1`,
                    [cr.project_id]
                );
                const paidTotal = parseFloat(agg.rows[0]?.paid_total || 0);
                const amountDue = parseFloat(proj.rows[0]?.amount_due || 0);
                const newPaymentStatus = amountDue > 0 && paidTotal + 0.0001 >= amountDue
                    ? 'PAID'
                    : paidTotal > 0 ? 'PARTIAL' : 'PENDING';
                await client.query(
                    `UPDATE client_projects SET payment_status = $1, updated_at = NOW() WHERE id = $2`,
                    [newPaymentStatus, cr.project_id]
                );
                projectUpdate = { amount_due: Number(proj.rows[0].amount_due), payment_status: newPaymentStatus };
            }

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

        await recordDecision({
            projectId: cr.project_id,
            clientId: req.clientUser.id,
            title: `Change request: ${cr.title}`,
            decision: decision === 'APPROVED'
                ? `Approved (+${cr.currency} ${Number(cr.additional_cost).toLocaleString()}${cr.additional_days ? `, +${cr.additional_days}d` : ''}).${comment ? ` Note: ${comment}` : ''}`
                : `Rejected.${comment ? ` Note: ${comment}` : ''}`,
            source: 'CHANGE_REQUEST',
            relatedId: cr.id,
        });

        writeAuditLog({
            action: 'CHANGE_REQUEST_DECIDED',
            entityType: 'change_requests',
            entityId: id,
            details: { decision, comment, byClient: req.clientUser.email, projectUpdate },
            ipAddress: getClientIp(req),
        }).catch(() => {});

        await notifyOwner({
            type: 'change_request',
            title: decision === 'APPROVED' ? 'Change request approved' : 'Change request rejected',
            body: `${req.clientUser.name || 'A client'} ${decision === 'APPROVED' ? 'approved' : 'rejected'} "${cr.title}"${Number(cr.additional_cost) > 0 ? ` (+${cr.currency} ${Number(cr.additional_cost).toLocaleString()})` : ''}.${decision === 'APPROVED' && Number(cr.additional_cost) > 0 ? ' Project value updated — create the balance invoice when ready.' : ''}`,
            link: `/admin/projects/${cr.project_id}`,
        });

        return res.json({ ...cr, projectUpdate });
    } catch (err) {
        console.error('[Delivery] decideMyChangeRequest error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
