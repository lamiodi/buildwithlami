import { z } from 'zod';
import pool from '../config/db.js';

// ── Helpers ──────────────────────────────────────────────
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateUUID(id, res) {
    if (!UUID_REGEX.test(id)) {
        res.status(400).json({ error: 'Invalid ID format.' });
        return false;
    }
    return true;
}

// ── Validation ───────────────────────────────────────────
//
// v28 added JSONB columns for case-study content (challenge,
// solution, results, gallery, ...). We allow the frontend
// to send anything JSON-serialisable and let PostgreSQL
// validate the shape — keeping the Zod schema permissive
// here avoids locking the form behind a brittle contract.
const createProjectSchema = z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    summary: z.string().optional(),
    content: z.string().optional(),
    tech_stack: z.array(z.string()).optional(),
    features: z.array(z.string()).optional(),
    category: z.string().optional().nullable(),
    image_url: z.string().url().optional().or(z.literal('')),
    live_url: z.string().url().optional().or(z.literal('')),
    repo_url: z.string().url().optional().or(z.literal('')),
    division: z.enum(['SOFTWARE', 'SURVEY', 'DRONE']).default('SOFTWARE'),
    featured: z.boolean().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
    location: z.string().optional().nullable(),
    client_name: z.string().optional().nullable(),
    display_order: z.number().int().optional().default(0),
    tags: z.array(z.string()).optional().default([]),
    // v28 — premium case-study fields
    tagline: z.string().optional().nullable(),
    year: z.string().optional().nullable(),
    industry: z.string().optional().nullable(),
    status_label: z.string().optional().nullable(),
    duration: z.string().optional().nullable(),
    role: z.string().optional().nullable(),
    gallery: z.array(z.any()).optional().default([]),
    challenge: z.any().optional().default({}),
    solution: z.any().optional().default({}),
    results: z.array(z.any()).optional().default([]),
    feature_categories: z.array(z.any()).optional().default([]),
    flow: z.array(z.any()).optional().default([]),
    tech_categories: z.array(z.any()).optional().default([]),
    architecture: z.array(z.any()).optional().default([]),
    timeline: z.array(z.any()).optional().default([]),
    responsibilities: z.array(z.string()).optional().default([]),
    metrics: z.any().optional().default({}),
    stats: z.any().optional().default({}),
    related_slugs: z.array(z.string()).optional().default([]),
    meta: z.any().optional().default({}),
});

const updateProjectSchema = z.object({
    title: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    summary: z.string().optional().nullable(),
    content: z.string().optional().nullable(),
    tech_stack: z.array(z.string()).optional().nullable(),
    features: z.array(z.string()).optional().nullable(),
    category: z.string().optional().nullable(),
    image_url: z.string().url().optional().nullable().or(z.literal('')),
    live_url: z.string().url().optional().nullable().or(z.literal('')),
    repo_url: z.string().url().optional().nullable().or(z.literal('')),
    division: z.enum(['SOFTWARE', 'SURVEY', 'DRONE']).optional(),
    featured: z.boolean().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
    location: z.string().optional().nullable(),
    client_name: z.string().optional().nullable(),
    display_order: z.number().int().optional(),
    tags: z.array(z.string()).optional(),
    // v28 — premium case-study fields
    tagline: z.string().optional().nullable(),
    year: z.string().optional().nullable(),
    industry: z.string().optional().nullable(),
    status_label: z.string().optional().nullable(),
    duration: z.string().optional().nullable(),
    role: z.string().optional().nullable(),
    gallery: z.array(z.any()).optional().nullable(),
    challenge: z.any().optional().nullable(),
    solution: z.any().optional().nullable(),
    results: z.array(z.any()).optional().nullable(),
    feature_categories: z.array(z.any()).optional().nullable(),
    flow: z.array(z.any()).optional().nullable(),
    tech_categories: z.array(z.any()).optional().nullable(),
    architecture: z.array(z.any()).optional().nullable(),
    timeline: z.array(z.any()).optional().nullable(),
    responsibilities: z.array(z.string()).optional().nullable(),
    metrics: z.any().optional().nullable(),
    stats: z.any().optional().nullable(),
    related_slugs: z.array(z.string()).optional().nullable(),
    meta: z.any().optional().nullable(),
});

// JSONB columns added by v28. Used by updateProject to
// decide which fields need an explicit ::jsonb cast on bind.
const V28_JSONB_FIELDS = new Set([
    'gallery',
    'challenge',
    'solution',
    'results',
    'feature_categories',
    'flow',
    'tech_categories',
    'architecture',
    'timeline',
    'responsibilities',
    'metrics',
    'stats',
    'related_slugs',
    'meta',
]);

// ── List all projects ────────────────────────────────────
export async function getProjects(req, res) {
    try {
        let query = `SELECT * FROM projects`;
        const vals = [];
        const conditions = [];

        // Auth middleware normalises the role to the canonical titlecase
        // name from ROLE_DIVISIONS (e.g. 'Owner', 'Administrator'). For
        // backwards compatibility we also accept any of the privilege
        // roles that can see all projects (Owner / Administrator / Project
        // Manager / Finance — anyone above 'client').
        const privRoles = ['Owner', 'Administrator', 'Project Manager', 'Finance'];
        const isPrivileged = req.user && privRoles.includes(req.user.role);
        if (!isPrivileged) {
            conditions.push(`status = 'PUBLISHED'`);
        }

        // Add division filter if provided
        if (req.query.division && ['SOFTWARE', 'SURVEY', 'DRONE'].includes(req.query.division)) {
            vals.push(req.query.division);
            conditions.push(`division = $${vals.length}`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        query += ` ORDER BY created_at DESC`;

        // Pagination support
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
        const offset = (page - 1) * limit;

        // Count total for pagination metadata
        let countQuery = `SELECT COUNT(*) FROM projects`;
        if (conditions.length > 0) {
            countQuery += ` WHERE ` + conditions.join(' AND ');
        }
        const countResult = await pool.query(countQuery, vals);
        const total = parseInt(countResult.rows[0].count);

        query += ` LIMIT $${vals.length + 1} OFFSET $${vals.length + 2}`;
        vals.push(limit, offset);

        const { rows } = await pool.query(query, vals);
        
        return res.json({
            data: rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page < Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('[Project] getProjects error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Get single project ──────────────────────────────────
export async function getProjectById(req, res) {
    try {
        if (!validateUUID(req.params.id, res)) return;

        // Public read: only PUBLISHED rows. Admins (Owner /
        // Administrator / Project Manager / Finance) can read
        // any status — the route layer enforces auth before
        // hitting this branch, so unauthenticated callers can
        // only see PUBLISHED content.
        const privRoles = ['Owner', 'Administrator', 'Project Manager', 'Finance'];
        const isPrivileged = req.user && privRoles.includes(req.user.role);
        const whereStatus = isPrivileged ? '' : `AND status = 'PUBLISHED'`;

        const { rows } = await pool.query(
            `SELECT * FROM projects WHERE id = $1 ${whereStatus}`,
            [req.params.id]
        );
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
        // Map: feature_categories → feature_categories, etc.
        // Frontend uses snake_case; pg / jsonb columns accept
        // JS objects natively, so we pass them through.
        const { rows } = await pool.query(
            `INSERT INTO projects (
                title, slug, summary, content, tech_stack, features, category,
                image_url, live_url, repo_url,
                division, featured, status,
                location, client_name, display_order, tags,
                published_at,
                tagline, year, industry, status_label, duration, role,
                gallery, challenge, solution, results, feature_categories,
                flow, tech_categories, architecture, timeline,
                responsibilities, metrics, stats, related_slugs, meta
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17,
                CASE WHEN $13 = 'PUBLISHED' THEN NOW() ELSE NULL END,
                $18, $19, $20, $21, $22, $23,
                $24::jsonb, $25::jsonb, $26::jsonb, $27::jsonb, $28::jsonb,
                $29::jsonb, $30::jsonb, $31::jsonb, $32::jsonb,
                $33::jsonb, $34::jsonb, $35::jsonb, $36::jsonb, $37::jsonb
            )
            RETURNING *`,
            [
                data.title,
                data.slug,
                data.summary || null,
                data.content || null,
                data.tech_stack || [],
                data.features || [],
                data.category || null,
                data.image_url || null,
                data.live_url || null,
                data.repo_url || null,
                data.division || 'SOFTWARE',
                data.featured ?? false,
                data.status || 'DRAFT',
                data.location || null,
                data.client_name || null,
                data.display_order ?? 0,
                data.tags || [],
                // v28 scalars
                data.tagline || null,
                data.year || null,
                data.industry || null,
                data.status_label || null,
                data.duration || null,
                data.role || null,
                // v28 JSONB — pg accepts JS objects; the explicit
                // ::jsonb cast in the SQL makes the column shape
                // explicit and avoids relying on driver inference.
                JSON.stringify(data.gallery ?? []),
                JSON.stringify(data.challenge ?? {}),
                JSON.stringify(data.solution ?? {}),
                JSON.stringify(data.results ?? []),
                JSON.stringify(data.feature_categories ?? []),
                JSON.stringify(data.flow ?? []),
                JSON.stringify(data.tech_categories ?? []),
                JSON.stringify(data.architecture ?? []),
                JSON.stringify(data.timeline ?? []),
                JSON.stringify(data.responsibilities ?? []),
                JSON.stringify(data.metrics ?? {}),
                JSON.stringify(data.stats ?? {}),
                JSON.stringify(data.related_slugs ?? []),
                JSON.stringify(data.meta ?? {}),
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
        if (!validateUUID(req.params.id, res)) return;

        const data = updateProjectSchema.parse(req.body);
        const fields = [];
        const values = [];
        let idx = 1;

        // JSONB columns need an explicit ::jsonb cast on bind
        // so the driver doesn't push the JS object as a string.
        for (const [key, val] of Object.entries(data)) {
            if (val === undefined) continue;
            if (V28_JSONB_FIELDS.has(key)) {
                fields.push(`${key} = $${idx++}::jsonb`);
                values.push(JSON.stringify(val));
            } else {
                fields.push(`${key} = $${idx++}`);
                values.push(val);
            }
        }

        if (fields.length === 0) return res.status(400).json({ error: 'No fields to update.' });

        // Maintain published_at: stamp it the first time the row
        // becomes PUBLISHED; clear it on ARCHIVED.
        fields.push(`published_at = CASE
            WHEN $${idx}::text = 'PUBLISHED' AND published_at IS NULL THEN NOW()
            WHEN $${idx}::text IN ('DRAFT', 'ARCHIVED') THEN NULL
            ELSE published_at
        END`);
        values.push(data.status ?? 'DRAFT');
        idx++;

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
        if (!validateUUID(req.params.id, res)) return;

        const { rowCount } = await pool.query(`DELETE FROM projects WHERE id = $1`, [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Project not found.' });
        return res.json({ message: 'Project deleted.' });
    } catch (err) {
        console.error('[Project] deleteProject error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
