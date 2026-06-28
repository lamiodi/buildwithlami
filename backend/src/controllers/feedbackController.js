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

export const getFeedbackByProject = async (req, res) => {
    const { projectId } = req.params;
    if (!isUuid(projectId)) return res.status(400).json({ error: 'Invalid ID format.' });
    try {
        const { rows } = await pool.query(
            `SELECT * FROM project_feedback WHERE project_id = $1 ORDER BY created_at ASC`,
            [projectId]
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
        if (!isUuid(projectId)) return res.status(400).json({ error: 'Invalid projectId.' });

        // Verify the project exists so we don't insert orphan feedback rows.
        const project = await pool.query('SELECT id FROM client_projects WHERE id = $1', [projectId]);
        if (project.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        const { rows } = await pool.query(
            `INSERT INTO project_feedback (project_id, stage_index, client_comment)
             VALUES ($1, $2, $3) RETURNING *`,
            [projectId, stageIndex, clientComment]
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
