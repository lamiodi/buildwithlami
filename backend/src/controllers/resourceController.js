// ─── src/controllers/resourceController.js ──────────────
// Knowledge-base articles. Public reads (PUBLISHED only),
// admin writes (Owner / Administrator).
//
// Mirrors the v12 resources table (with two v28 additions:
// display_order, cover_image, reading_time). Public listings
// are the rows that /resources renders; private detail reads
// are not exposed by the route — the public listing is the
// only consumer.
// ──────────────────────────────────────────────────────────

import { z } from 'zod';
import { pool } from '../config/db.js';

const createSchema = z.object({
    slug: z.string().min(1),
    title: z.string().min(1),
    excerpt: z.string().optional().nullable(),
    body: z.string().optional().nullable(),
    hero_image: z.string().url().optional().nullable().or(z.literal('')),
    cover_image: z.string().url().optional().nullable().or(z.literal('')),
    category: z.string().optional().nullable(),
    tags: z.array(z.string()).optional().default([]),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional().default('DRAFT'),
    display_order: z.number().int().optional().default(0),
    reading_time: z.string().optional().nullable(),
});

const updateSchema = createSchema.partial();

// Public listing — PUBLISHED rows only, ordered by display_order
// then most recently published.
export async function getPublicResources(_req, res) {
    try {
        const { rows } = await pool.query(
            `SELECT id, slug, title, excerpt, hero_image, cover_image,
                    category, tags, status, published_at, display_order, reading_time
               FROM resources
              WHERE status = 'PUBLISHED'
              ORDER BY display_order ASC, published_at DESC`
        );
        return res.json(rows);
    } catch (err) {
        console.error('[Resource] getPublicResources error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// Admin listing — all rows, any status.
export async function getAdminResources(_req, res) {
    try {
        const { rows } = await pool.query(
            `SELECT * FROM resources ORDER BY display_order ASC, created_at DESC`
        );
        return res.json(rows);
    } catch (err) {
        console.error('[Resource] getAdminResources error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function createResource(req, res) {
    try {
        const data = createSchema.parse(req.body);
        const { rows } = await pool.query(
            `INSERT INTO resources
                (slug, title, excerpt, body, hero_image, cover_image,
                 category, tags, status, display_order, reading_time,
                 published_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
                     CASE WHEN $9 = 'PUBLISHED' THEN NOW() ELSE NULL END)
             RETURNING *`,
            [
                data.slug,
                data.title,
                data.excerpt || null,
                data.body || null,
                data.hero_image || null,
                data.cover_image || null,
                data.category || null,
                data.tags || [],
                data.status || 'DRAFT',
                data.display_order ?? 0,
                data.reading_time || null,
            ]
        );
        return res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        if (err.code === '23505') return res.status(409).json({ error: 'A resource with that slug already exists.' });
        console.error('[Resource] createResource error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function updateResource(req, res) {
    try {
        const data = updateSchema.parse(req.body);
        const fields = [];
        const values = [];
        let idx = 1;

        for (const [key, val] of Object.entries(data)) {
            if (val !== undefined) { fields.push(`${key} = $${idx++}`); values.push(val); }
        }

        if (fields.length === 0) return res.status(400).json({ error: 'No fields to update.' });

        // Auto-stamp published_at the first time the row becomes
        // PUBLISHED; clear it on DRAFT/ARCHIVED.
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
            `UPDATE resources SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
            values
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Resource not found.' });
        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        if (err.code === '23505') return res.status(409).json({ error: 'A resource with that slug already exists.' });
        console.error('[Resource] updateResource error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function deleteResource(req, res) {
    try {
        const { rows } = await pool.query(
            `DELETE FROM resources WHERE id = $1 RETURNING id`,
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Resource not found.' });
        return res.json({ ok: true });
    } catch (err) {
        console.error('[Resource] deleteResource error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
