import { z } from 'zod';
import pool from '../config/db.js';

// ── Validation ───────────────────────────────────────────
const createProjectSchema = z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    summary: z.string().optional(),
    content: z.string().optional(),
    tech_stack: z.array(z.string()).optional(),
    image_url: z.string().url().optional(),
    live_url: z.string().url().optional(),
    repo_url: z.string().url().optional(),
    featured: z.boolean().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional()
});

const updateProjectSchema = z.object({
    title: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    summary: z.string().optional().nullable(),
    content: z.string().optional().nullable(),
    tech_stack: z.array(z.string()).optional().nullable(),
    image_url: z.string().url().optional().nullable(),
    live_url: z.string().url().optional().nullable(),
    repo_url: z.string().url().optional().nullable(),
    featured: z.boolean().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional()
});

// ── List all projects ────────────────────────────────────
export async function getProjects(req, res) {
    try {
        let query = `SELECT * FROM projects`;
        const vals = [];

        // If not logged in, only show published projects
        if (!req.user || req.user.role !== 'OWNER') {
            query += ` WHERE status = 'PUBLISHED'`;
        }

        query += ` ORDER BY created_at DESC`;

        const { rows } = await pool.query(query, vals);
        return res.json(rows);
    } catch (err) {
        console.error('[Project] getProjects error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Get single project ──────────────────────────────────
export async function getProjectById(req, res) {
    try {
        const { rows } = await pool.query(`SELECT * FROM projects WHERE id = $1`, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Project not found.' });

        return res.json(rows[0]);
    } catch (err) {
        console.error('[Project] getProjectById error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Get project by slug (public) ─────────────────────────
export async function getProjectBySlug(req, res) {
    try {
        const { rows } = await pool.query(`SELECT * FROM projects WHERE slug = $1 AND status = 'PUBLISHED'`, [req.params.slug]);
        if (rows.length === 0) return res.status(404).json({ error: 'Project not found.' });
        return res.json(rows[0]);
    } catch (err) {
        console.error('[Project] getProjectBySlug error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Create project ───────────────────────────────────────
export async function createProject(req, res) {
    try {
        const data = createProjectSchema.parse(req.body);
        const { rows } = await pool.query(
            `INSERT INTO projects (title, slug, summary, content, tech_stack, image_url, live_url, repo_url, featured, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
            [
                data.title,
                data.slug,
                data.summary || null,
                data.content || null,
                data.tech_stack || [],
                data.image_url || null,
                data.live_url || null,
                data.repo_url || null,
                data.featured ?? false,
                data.status || 'DRAFT'
            ]
        );
        return res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        if (err.code === '23505') return res.status(409).json({ error: 'A project with that slug already exists.' });
        console.error('[Project] createProject error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Update project ───────────────────────────────────────
export async function updateProject(req, res) {
    try {
        const data = updateProjectSchema.parse(req.body);
        const fields = [];
        const values = [];
        let idx = 1;

        for (const [key, val] of Object.entries(data)) {
            if (val !== undefined) { fields.push(`${key} = $${idx++}`); values.push(val); }
        }

        if (fields.length === 0) return res.status(400).json({ error: 'No fields to update.' });

        fields.push(`updated_at = NOW()`);
        values.push(req.params.id);

        const { rows } = await pool.query(
            `UPDATE projects SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
            values
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Project not found.' });

        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        if (err.code === '23505') return res.status(409).json({ error: 'A project with that slug already exists.' });
        console.error('[Project] updateProject error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Delete project ───────────────────────────────────────
export async function deleteProject(req, res) {
    try {
        const { rowCount } = await pool.query(`DELETE FROM projects WHERE id = $1`, [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Project not found.' });
        return res.json({ message: 'Project deleted.' });
    } catch (err) {
        console.error('[Project] deleteProject error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
