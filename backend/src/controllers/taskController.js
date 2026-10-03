// ─── src/controllers/taskController.js ────────────────────
// Admin OS Phase 1 — Task system (blueprint §29) feeding the
// Command Center's Tonight Queue (blueprint §5A, §74).
//
// Endpoints exposed (all Owner-gated in routes/taskRoutes.js):
//   GET    /api/tasks              — list w/ filters + scope
//   GET    /api/tasks/:id          — single task
//   POST   /api/tasks              — create
//   PATCH  /api/tasks/:id          — partial update (sets
//                                     completed_at on DONE)
//   DELETE /api/tasks/:id          — remove
// ──────────────────────────────────────────────────────────

import { z } from 'zod';
import pool from '../config/db.js';
import { writeAuditLog, getClientIp } from '../utils/auditLog.js';

// ── Helpers ──────────────────────────────────────────────
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'WAITING', 'REVIEW', 'DONE', 'CANCELLED'];
const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

// Shared select: joined client/project names for display + a
// computed "sort_rank" so overdue→urgent work floats to the top
// of every list (the same ordering the Tonight Queue uses).
const TASK_SELECT = `
    SELECT t.*,
           c.name  AS client_name,
           p.project_name,
           CASE t.priority
               WHEN 'URGENT' THEN 0
               WHEN 'HIGH'   THEN 1
               WHEN 'MEDIUM' THEN 2
               ELSE 3
           END AS priority_rank
      FROM tasks t
      LEFT JOIN clients c         ON c.id = t.client_id
      LEFT JOIN client_projects p ON p.id = t.project_id
`;

// ── Schemas ──────────────────────────────────────────────
const dateish = z.string().min(1).refine(
    (v) => !Number.isNaN(Date.parse(v)),
    { message: 'Invalid date value.' }
).optional().nullable();

const taskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().optional().nullable(),
    client_id: z.string().optional().nullable(),
    project_id: z.string().optional().nullable(),
    owner_type: z.enum(['ADMIN', 'CLIENT', 'SYSTEM']).optional().default('ADMIN'),
    status: z.enum(TASK_STATUSES).optional().default('TODO'),
    priority: z.enum(TASK_PRIORITIES).optional().default('MEDIUM'),
    estimated_minutes: z.number().int().positive().optional().nullable(),
    actual_minutes: z.number().int().nonnegative().optional().nullable(),
    due_at: dateish,
    blocked: z.boolean().optional(),
    blocked_reason: z.string().optional().nullable(),
});

const taskUpdateSchema = taskSchema.partial().extend({
    title: z.string().min(1).max(200).optional(),
});

// ── List ─────────────────────────────────────────────────
/**
 * GET /api/tasks?scope=tonight|today|overdue|open|all
 *                 &status=TODO&priority=HIGH
 *                 &project_id=&client_id=&q=
 *
 * scope shortcuts:
 *   tonight — open work due today or earlier (the after-work queue)
 *   today   — open work due today only
 *   overdue — open work past its due date
 *   open    — everything not DONE/CANCELLED
 */
export async function getTasks(req, res) {
    try {
        const { scope, status, priority, project_id, client_id, q } = req.query;
        const conditions = [];
        const params = [];

        const openClause = `t.status NOT IN ('DONE', 'CANCELLED')`;

        if (scope === 'tonight') {
            conditions.push(`(${openClause} AND t.due_at IS NOT NULL AND t.due_at < NOW() + INTERVAL '1 day')`);
        } else if (scope === 'today') {
            conditions.push(`(${openClause} AND t.due_at::date = CURRENT_DATE)`);
        } else if (scope === 'overdue') {
            conditions.push(`(${openClause} AND t.due_at < NOW())`);
        } else if (!status || scope === 'open') {
            // No explicit status filter → default to open work.
            conditions.push(openClause);
        }

        if (status && TASK_STATUSES.includes(status)) {
            params.push(status);
            conditions.push(`t.status = $${params.length}`);
        }
        if (priority && TASK_PRIORITIES.includes(priority)) {
            params.push(priority);
            conditions.push(`t.priority = $${params.length}`);
        }
        if (project_id && isUuid(project_id)) {
            params.push(project_id);
            conditions.push(`t.project_id = $${params.length}`);
        }
        if (client_id && isUuid(client_id)) {
            params.push(client_id);
            conditions.push(`t.client_id = $${params.length}`);
        }
        if (q && typeof q === 'string' && q.trim().length >= 2) {
            params.push(`%${q.trim()}%`);
            conditions.push(`t.title ILIKE $${params.length}`);
        }

        const where = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
        const { rows } = await pool.query(
            `${TASK_SELECT}${where}
             ORDER BY priority_rank ASC,
                      (t.due_at IS NULL) ASC,
                      t.due_at ASC,
                      t.created_at DESC
             LIMIT 500`,
            params
        );
        return res.json(rows);
    } catch (err) {
        console.error('[Tasks] getTasks error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Single ───────────────────────────────────────────────
export async function getTaskById(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid task ID.' });
        const { rows } = await pool.query(`${TASK_SELECT} WHERE t.id = $1`, [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Task not found.' });
        return res.json(rows[0]);
    } catch (err) {
        console.error('[Tasks] getTaskById error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Create ───────────────────────────────────────────────
export async function createTask(req, res) {
    try {
        const data = taskSchema.parse(req.body);

        // Resolve client_id from the project when only a project is given,
        // so the dashboard can group by client either way.
        let clientId = isUuid(data.client_id || '') ? data.client_id : null;
        const projectId = isUuid(data.project_id || '') ? data.project_id : null;
        if (!clientId && projectId) {
            const proj = await pool.query(`SELECT client_id FROM client_projects WHERE id = $1`, [projectId]);
            clientId = proj.rows[0]?.client_id || null;
        }

        const { rows } = await pool.query(
            `INSERT INTO tasks
                (title, description, client_id, project_id, owner_type, status,
                 priority, estimated_minutes, due_at, blocked, blocked_reason)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING *`,
            [
                data.title,
                data.description || null,
                clientId,
                projectId,
                data.owner_type || 'ADMIN',
                data.status || 'TODO',
                data.priority || 'MEDIUM',
                data.estimated_minutes || null,
                data.due_at || null,
                data.blocked || false,
                data.blocked_reason || null,
            ]
        );

        writeAuditLog({
            action: 'TASK_CREATED',
            entityType: 'tasks',
            entityId: rows[0].id,
            details: { title: data.title, priority: data.priority, projectId, clientId },
            user: req.user,
            ipAddress: getClientIp(req),
        }).catch(() => {});

        return res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Tasks] createTask error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Update ───────────────────────────────────────────────
export async function updateTask(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid task ID.' });

        const data = taskUpdateSchema.parse(req.body);
        const allowedKeys = [
            'title', 'description', 'client_id', 'project_id', 'owner_type',
            'status', 'priority', 'estimated_minutes', 'actual_minutes',
            'due_at', 'blocked', 'blocked_reason',
        ];
        const fields = Object.keys(data).filter((k) => allowedKeys.includes(k));

        // Keep completed_at in sync with the status so the
        // Tonight Queue never shows finished work.
        if (data.status === 'DONE' && !fields.includes('completed_at')) {
            fields.push('completed_at');
            data.completed_at = new Date().toISOString();
        } else if (data.status && data.status !== 'DONE') {
            fields.push('completed_at');
            data.completed_at = null;
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No updatable fields provided.' });
        }

        const setClauses = fields.map((k, i) => `${k} = $${i + 1}`);
        const values = fields.map((k) => data[k] ?? null);
        values.push(id);

        const { rows } = await pool.query(
            `UPDATE tasks SET ${setClauses.join(', ')}, updated_at = NOW()
              WHERE id = $${values.length}
              RETURNING *`,
            values
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Task not found.' });

        writeAuditLog({
            action: 'TASK_UPDATED',
            entityType: 'tasks',
            entityId: id,
            details: { fields, status: data.status },
            user: req.user,
            ipAddress: getClientIp(req),
        }).catch(() => {});

        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Tasks] updateTask error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Delete ───────────────────────────────────────────────
export async function deleteTask(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid task ID.' });
        const { rows } = await pool.query(`DELETE FROM tasks WHERE id = $1 RETURNING id, title`, [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Task not found.' });

        writeAuditLog({
            action: 'TASK_DELETED',
            entityType: 'tasks',
            entityId: id,
            details: { title: rows[0].title },
            user: req.user,
            ipAddress: getClientIp(req),
        }).catch(() => {});

        return res.status(204).send();
    } catch (err) {
        console.error('[Tasks] deleteTask error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
