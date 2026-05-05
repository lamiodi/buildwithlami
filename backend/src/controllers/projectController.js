// ─── src/controllers/projectController.js ────────────────
// Full CRUD for projects, with JOINs to fetch client data
// and WhatsApp notifications on status changes.
// ──────────────────────────────────────────────────────────

import { z } from 'zod';
import pool from '../config/db.js';
import whatsappService from '../services/whatsappService.js';

// ── Validation ───────────────────────────────────────────
const createProjectSchema = z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().optional(),
    image_url: z.string().url().optional(),
    live_url: z.string().url().optional(),
    repo_url: z.string().url().optional(),
    featured: z.boolean().optional(),
    status: z.enum(['PLANNING', 'DESIGN', 'DEV', 'REVIEW', 'LAUNCHED']).optional(),
    progress: z.number().int().min(0).max(100).optional(),
    client_id: z.string().uuid().optional(),
});

const updateProjectSchema = z.object({
    title: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    description: z.string().optional(),
    image_url: z.string().url().optional().nullable(),
    live_url: z.string().url().optional().nullable(),
    repo_url: z.string().url().optional().nullable(),
    featured: z.boolean().optional(),
    status: z.enum(['PLANNING', 'DESIGN', 'DEV', 'REVIEW', 'LAUNCHED']).optional(),
    progress: z.number().int().min(0).max(100).optional(),
    client_id: z.string().uuid().optional().nullable(),
});

// ── Helper: build SELECT with JOIN ───────────────────────
const PROJECT_SELECT = `
  SELECT p.id, p.title, p.slug, p.description,
         p.image_url, p.live_url, p.repo_url, p.featured,
         p.status, p.progress, p.client_id,
         p.created_at, p.updated_at,
         c.full_name  AS client_name,
         c.email      AS client_email,
         c.phone      AS client_phone
  FROM   projects p
  LEFT JOIN clients c ON c.id = p.client_id
`;

// ── List all projects ────────────────────────────────────
export async function getProjects(req, res) {
    try {
        let query = `${PROJECT_SELECT}`;
        const vals = [];

        // Clients only see their own project(s)
        if (req.user.role === 'CLIENT') {
            query += ` WHERE p.client_id = $1`;
            vals.push(req.user.id);
        }

        query += ` ORDER BY p.created_at DESC`;

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
        const { rows } = await pool.query(`${PROJECT_SELECT} WHERE p.id = $1`, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Project not found.' });

        // Clients can only view their own project
        if (req.user.role === 'CLIENT' && rows[0].client_id !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden.' });
        }

        return res.json(rows[0]);
    } catch (err) {
        console.error('[Project] getProjectById error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Get project by slug (public) ─────────────────────────
export async function getProjectBySlug(req, res) {
    try {
        const { rows } = await pool.query(`${PROJECT_SELECT} WHERE p.slug = $1`, [req.params.slug]);
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
            `INSERT INTO projects (title, slug, description, image_url, live_url, repo_url, featured, status, progress, client_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
            [
                data.title,
                data.slug,
                data.description || null,
                data.image_url || null,
                data.live_url || null,
                data.repo_url || null,
                data.featured ?? false,
                data.status || 'PLANNING',
                data.progress ?? 0,
                data.client_id || null,
            ],
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
            values,
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Project not found.' });

        const project = rows[0];

        // WhatsApp notification on status change
        if (data.status && project.client_id) {
            const clientResult = await pool.query(`SELECT phone FROM clients WHERE id = $1`, [project.client_id]);
            const client = clientResult.rows[0];
            if (client?.phone) {
                await whatsappService.notifyProjectStatusChange(client.phone, project.title, data.status);
            }
        }

        return res.json(project);
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
