import pool from '../config/db.js';
import { z } from 'zod';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

const feedbackSchema = z.object({
    projectId: z.string().uuid(),
    stageIndex: z.number().int().min(0),
    clientComment: z.string().min(1)
});

const replySchema = z.object({
    adminReply: z.string().optional().nullable(),
    status: z.enum(['OPEN', 'RESOLVED']).optional()
});

/**
 * Resolve the projectId in a request to a real UUID, ensuring
 * a CLIENT-role caller can only access projects they own
 * (i.e. their JWT `trackingId` maps to this project).
 *
 * Returns the resolved projectId, or sends an error response and returns null.
 */
async function authorizeProjectAccess(req, res, requestedProjectId) {
    if (!isUuid(requestedProjectId)) {
        res.status(400).json({ error: 'Invalid projectId.' });
        return null;
    }
    const role = req.user?.role;
    // Admin / Owner are unrestricted.
    const isStaff = role && ['Owner', 'Administrator'].includes(role);
    if (!isStaff) {
        // For CLIENT, enforce that the projectId matches the JWT's trackingId.
        const jwtTrackingId = req.user?.trackingId;
        if (!jwtTrackingId) {
            res.status(403).json({ error: 'Forbidden — no trackingId on token.' });
            return null;
        }
        const { rows } = await pool.query(
            'SELECT id FROM client_projects WHERE tracking_id = $1',
            [jwtTrackingId]
        );
        if (rows.length === 0 || rows[0].id !== requestedProjectId) {
            res.status(403).json({ error: 'Forbidden — you may only access your own project.' });
            return null;
        }
    }
    return requestedProjectId;
}

export const getFeedbackByProject = async (req, res) => {
    const { projectId } = req.params;
    try {
        const authorized = await authorizeProjectAccess(req, res, projectId);
        if (!authorized) return;
        const { rows } = await pool.query(
            `SELECT * FROM project_feedback WHERE project_id = $1 ORDER BY created_at ASC`,
            [authorized]
        );
        res.json(rows);
    } catch (err) {
        console.error('[Feedback] getFeedback error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

export const submitFeedback = async (req, res) => {
    try {
        const { projectId, stageIndex, clientComment } = feedbackSchema.parse(req.body);
        const authorized = await authorizeProjectAccess(req, res, projectId);
        if (!authorized) return;

        // Verify the project exists so we don't insert orphan feedback rows.
        const project = await pool.query('SELECT id FROM client_projects WHERE id = $1', [authorized]);
        if (project.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        const { rows } = await pool.query(
            `INSERT INTO project_feedback (project_id, stage_index, client_comment)
             VALUES ($1, $2, $3) RETURNING *`,
            [authorized, stageIndex, clientComment]
        );

        res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Feedback] submitFeedback error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

export const replyToFeedback = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID format.' });
    try {
        const { adminReply, status } = replySchema.parse(req.body);
        const { rows } = await pool.query(
            `UPDATE project_feedback
             SET admin_reply = $1, status = $2, updated_at = NOW()
             WHERE id = $3 RETURNING *`,
            [adminReply || null, status || 'RESOLVED', id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Feedback not found' });
        res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Feedback] replyToFeedback error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
