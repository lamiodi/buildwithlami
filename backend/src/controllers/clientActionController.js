// ─── src/controllers/clientActionController.js ────────────
// Admin OS Phase 1 — Client Actions ("Waiting on Client",
// blueprint §15). Admin creates an action; the client sees it
// in their portal and marks it complete; admin gets notified.
//
// Admin endpoints (Owner-gated in routes/clientActionRoutes.js):
//   GET    /api/client-actions
//   POST   /api/client-actions
//   PATCH  /api/client-actions/:id
//   DELETE /api/client-actions/:id
//
// Portal endpoints (mounted in clientPortalRoutes.js):
//   GET   /api/client-portal/actions             — my open actions
//   PATCH /api/client-portal/actions/:id/complete — client completes
// ──────────────────────────────────────────────────────────

import { z } from 'zod';
import pool from '../config/db.js';
import { writeAuditLog, getClientIp } from '../utils/auditLog.js';
import { createNotification } from './notificationController.js';

// ── Helpers ──────────────────────────────────────────────
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

const ACTION_TYPES = ['UPLOAD', 'APPROVAL', 'PAYMENT', 'INFO', 'REVIEW'];
const ACTION_STATUSES = ['PENDING', 'COMPLETED', 'CANCELLED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const ACTION_SELECT = `
    SELECT a.*,
           c.name         AS client_name,
           p.project_name
      FROM client_actions a
      LEFT JOIN clients c         ON c.id = a.client_id
      LEFT JOIN client_projects p ON p.id = a.project_id
`;

/**
 * Resolve the Owner account for in-app notifications.
 * The studio runs a single admin (config/roles.js), but this
 * keeps working if an ADMIN role is ever re-added.
 */
async function getOwnerUserId() {
    const { rows } = await pool.query(
        `SELECT id FROM users WHERE lower(role) = 'owner' ORDER BY created_at LIMIT 1`
    );
    return rows[0]?.id || null;
}

// ── Schemas ──────────────────────────────────────────────
const dateish = z.string().min(1).refine(
    (v) => !Number.isNaN(Date.parse(v)),
    { message: 'Invalid date value.' }
).optional().nullable();

const createActionSchema = z.object({
    client_id: z.string().min(1, 'Client is required'),
    project_id: z.string().optional().nullable(),
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().optional().nullable(),
    type: z.enum(ACTION_TYPES).optional().default('INFO'),
    priority: z.enum(PRIORITIES).optional().default('MEDIUM'),
    status: z.enum(ACTION_STATUSES).optional().default('PENDING'),
    due_at: dateish,
});

const updateActionSchema = createActionSchema.partial();

// ── Admin: List ──────────────────────────────────────────
/**
 * GET /api/client-actions?scope=open|overdue|all&client_id=&q=
 */
export async function getActions(req, res) {
    try {
        const { scope, status, client_id, q } = req.query;
        const conditions = [];
        const params = [];

        const pendingClause = `a.status = 'PENDING'`;
        if (scope === 'overdue') {
            conditions.push(`(${pendingClause} AND a.due_at < NOW())`);
        } else if (!status && scope !== 'all') {
            conditions.push(pendingClause);
        }

        if (status && ACTION_STATUSES.includes(status)) {
            params.push(status);
            conditions.push(`a.status = $${params.length}`);
        }
        if (client_id && isUuid(client_id)) {
            params.push(client_id);
            conditions.push(`a.client_id = $${params.length}`);
        }
        if (q && typeof q === 'string' && q.trim().length >= 2) {
            params.push(`%${q.trim()}%`);
            conditions.push(`(a.title ILIKE $${params.length} OR c.name ILIKE $${params.length})`);
        }

        const where = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
        const { rows } = await pool.query(
            `${ACTION_SELECT}${where}
             ORDER BY (a.due_at IS NULL) ASC, a.due_at ASC, a.created_at DESC
             LIMIT 500`,
            params
        );
        return res.json(rows);
    } catch (err) {
        console.error('[ClientActions] getActions error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Admin: Create ────────────────────────────────────────
export async function createAction(req, res) {
    try {
        const data = createActionSchema.parse(req.body);
        if (!isUuid(data.client_id)) return res.status(400).json({ error: 'Invalid client ID.' });

        const clientExists = await pool.query(`SELECT id, name FROM clients WHERE id = $1`, [data.client_id]);
        if (clientExists.rows.length === 0) return res.status(404).json({ error: 'Client not found.' });

        const projectId = isUuid(data.project_id || '') ? data.project_id : null;

        const { rows } = await pool.query(
            `INSERT INTO client_actions
                (client_id, project_id, title, description, type, priority, status, due_at, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [
                data.client_id,
                projectId,
                data.title,
                data.description || null,
                data.type || 'INFO',
                data.priority || 'MEDIUM',
                data.status || 'PENDING',
                data.due_at || null,
                req.user?.id || null,
            ]
        );

        writeAuditLog({
            action: 'CLIENT_ACTION_CREATED',
            entityType: 'client_actions',
            entityId: rows[0].id,
            details: { title: data.title, clientId: data.client_id, type: data.type, dueAt: data.due_at || null },
            user: req.user,
            ipAddress: getClientIp(req),
        }).catch(() => {});

        return res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[ClientActions] createAction error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Admin: Update ────────────────────────────────────────
export async function updateAction(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid action ID.' });

        const data = updateActionSchema.parse(req.body);
        const allowedKeys = ['project_id', 'title', 'description', 'type', 'priority', 'status', 'due_at'];
        const fields = Object.keys(data).filter((k) => allowedKeys.includes(k));

        // completed_at follows the status, same rule as tasks.
        if (data.status === 'COMPLETED') {
            data.completed_at = data.completed_at || new Date().toISOString();
            fields.push('completed_at');
        } else if (data.status && data.status !== 'COMPLETED') {
            data.completed_at = null;
            fields.push('completed_at');
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No updatable fields provided.' });
        }

        const setClauses = fields.map((k, i) => `${k} = $${i + 1}`);
        const values = fields.map((k) => data[k] ?? null);
        values.push(id);

        const { rows } = await pool.query(
            `UPDATE client_actions SET ${setClauses.join(', ')}, updated_at = NOW()
              WHERE id = $${values.length}
              RETURNING *`,
            values
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Action not found.' });

        writeAuditLog({
            action: 'CLIENT_ACTION_UPDATED',
            entityType: 'client_actions',
            entityId: id,
            details: { fields, status: data.status },
            user: req.user,
            ipAddress: getClientIp(req),
        }).catch(() => {});

        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[ClientActions] updateAction error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Admin: Delete ────────────────────────────────────────
export async function deleteAction(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid action ID.' });
        const { rows } = await pool.query(
            `DELETE FROM client_actions WHERE id = $1 RETURNING id, title`, [id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Action not found.' });

        writeAuditLog({
            action: 'CLIENT_ACTION_DELETED',
            entityType: 'client_actions',
            entityId: id,
            details: { title: rows[0].title },
            user: req.user,
            ipAddress: getClientIp(req),
        }).catch(() => {});

        return res.status(204).send();
    } catch (err) {
        console.error('[ClientActions] deleteAction error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Portal: my open actions ──────────────────────────────
/**
 * GET /api/client-portal/actions (verifyClientToken)
 * Returns the client's PENDING actions with overdue flags —
 * the portal "Action Required" panel (blueprint §15, §81).
 */
export async function getMyActions(req, res) {
    try {
        const { rows } = await pool.query(
            `SELECT a.id, a.title, a.description, a.type, a.priority, a.status,
                    a.due_at, (a.due_at < NOW()) AS overdue,
                    a.project_id, p.project_name, a.created_at
               FROM client_actions a
               LEFT JOIN client_projects p ON p.id = a.project_id
              WHERE a.client_id = $1 AND a.status = 'PENDING'
              ORDER BY (a.due_at IS NULL) ASC, a.due_at ASC, a.created_at ASC
              LIMIT 100`,
            [req.clientUser.id]
        );
        return res.json(rows);
    } catch (err) {
        console.error('[ClientActions] getMyActions error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Portal: complete an action ───────────────────────────
/**
 * PATCH /api/client-portal/actions/:id/complete (verifyClientToken)
 * Body: { completion_note?: string }
 * Ownership-checked: a client can only complete their own action.
 */
export async function completeMyAction(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid action ID.' });

        const note = typeof req.body?.completion_note === 'string'
            ? req.body.completion_note.slice(0, 2000)
            : null;

        const { rows } = await pool.query(
            `UPDATE client_actions
                SET status = 'COMPLETED',
                    completed_at = NOW(),
                    completion_note = $1,
                    updated_at = NOW()
              WHERE id = $2 AND client_id = $3 AND status = 'PENDING'
              RETURNING *`,
            [note, id, req.clientUser.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Action not found or already completed.' });

        const client = await pool.query(`SELECT name FROM clients WHERE id = $1`, [req.clientUser.id]);

        writeAuditLog({
            action: 'CLIENT_ACTION_COMPLETED',
            entityType: 'client_actions',
            entityId: id,
            details: { title: rows[0].title, completedByClient: req.clientUser.email, note },
            ipAddress: getClientIp(req),
        }).catch(() => {});

        const ownerId = await getOwnerUserId();
        if (ownerId) {
            createNotification({
                userId: ownerId,
                type: 'client_action',
                title: 'Client action completed',
                body: `${client.rows[0]?.name || 'A client'} completed "${rows[0].title}"${note ? ` — ${note.slice(0, 120)}` : ''}.`,
                link: `/admin/clients/${req.clientUser.id}`,
            }).catch(() => {});
        }

        return res.json(rows[0]);
    } catch (err) {
        console.error('[ClientActions] completeMyAction error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
