import { z } from 'zod';
import pool from '../config/db.js';

// ── Intake Templates ──────────────────────────────────────

const templateSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    schema: z.array(z.any()) // Array of objects defining the fields
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

export const createTemplate = async (req, res) => {
    try {
        const { name, description, schema } = templateSchema.parse(req.body);

        const { rows } = await pool.query(
            `INSERT INTO intake_templates (name, description, schema)
             VALUES ($1, $2, $3) RETURNING *`,
            [name, description || null, JSON.stringify(schema)]
        );

        res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Templates] createTemplate error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

export const getTemplates = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM intake_templates ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error('[Templates] getTemplates error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

export const getTemplateById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID format.' });
        const { rows } = await pool.query('SELECT * FROM intake_templates WHERE id = $1', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Template not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error('[Templates] getTemplateById error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// ── Intake Submissions ────────────────────────────────────

const submissionSchema = z.object({
    projectId: z.string().uuid(),
    responses: z.record(z.any()) // JSON object with field responses
});

export const submitIntake = async (req, res) => {
    try {
        const { projectId, responses } = submissionSchema.parse(req.body);
        if (!isUuid(projectId)) return res.status(400).json({ error: 'Invalid projectId.' });

        // For CLIENT tokens, the JWT carries the trackingId (req.user.trackingId)
        // which must resolve to the same project they are trying to submit for.
        if (req.user && req.user.role === 'CLIENT') {
            const proj = await pool.query(
                'SELECT id FROM client_projects WHERE id = $1 AND tracking_id = $2',
                [projectId, req.user.trackingId]
            );
            if (proj.rows.length === 0) {
                return res.status(403).json({ error: 'You are not authorized to submit for this project.' });
            }
        }

        const { rows } = await pool.query(
            `INSERT INTO intake_submissions (project_id, responses)
             VALUES ($1, $2)
             ON CONFLICT (project_id)
             DO UPDATE SET responses = EXCLUDED.responses, submitted_at = NOW()
             RETURNING *`,
            [projectId, JSON.stringify(responses)]
        );

        // Automatically set intake_completed to true in client_projects
        await pool.query(
            `UPDATE client_projects SET intake_completed = true WHERE id = $1`,
            [projectId]
        );

        res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Templates] submitIntake error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

export const getIntakeSubmissionsByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        if (!isUuid(projectId)) return res.status(400).json({ error: 'Invalid ID format.' });
        const { rows } = await pool.query('SELECT * FROM intake_submissions WHERE project_id = $1 ORDER BY submitted_at DESC', [projectId]);
        res.json(rows);
    } catch (err) {
        console.error('[Templates] getIntakeSubmissionsByProject error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
