// ─── src/controllers/cmsController.js ────────────────────
// Phase 4 — Content Management (CMS).
//
// Owns CRUD for the four content tables seeded by v12_cms.sql:
//   - pages        → /resources, /portfolio, /pricing
//   - testimonials → home + /survey + /drone quote cards
//   - equipment    → /survey + /drone gear galleries
//   - industries   → /drone verticals
//
// The public routes (GET only, status filter applied) are
// unauthenticated so the public-facing pages can call them
// without a token. All write endpoints are admin-gated inside
// the router.
// ──────────────────────────────────────────────────────────

import { z } from 'zod';
import pool from '../config/db.js';
import { writeAuditLog, getClientIp } from '../utils/auditLog.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

// ── Schemas ──────────────────────────────────────────────
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;

const pageSchema = z.object({
    slug: z.string().min(1).regex(SLUG_RE, 'Slug must be lowercase letters, numbers, or hyphens (max 64).'),
    title: z.string().min(1),
    body: z.string().optional().nullable(),
    hero_image: z.string().url().optional().nullable(),
    meta_description: z.string().max(300).optional().nullable(),
    division: z.enum(['SOFTWARE', 'SURVEY', 'DRONE']).default('SOFTWARE'),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

const testimonialSchema = z.object({
    client_name: z.string().min(1),
    division: z.enum(['SOFTWARE', 'SURVEY', 'DRONE']),
    quote: z.string().min(1),
    avatar_url: z.string().url().optional().nullable(),
    is_featured: z.boolean().optional().default(false),
});

const equipmentSchema = z.object({
    name: z.string().min(1),
    division: z.enum(['SURVEY', 'DRONE']),
    description: z.string().optional().nullable(),
    image_url: z.string().url().optional().nullable(),
    display_order: z.number().int().min(0).optional().default(0),
});

const industrySchema = z.object({
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    icon: z.string().optional().nullable(),
    sample_image: z.string().url().optional().nullable(),
    display_order: z.number().int().min(0).optional().default(0),
});

// ─────────────────────────── PAGES ─────────────────────────────
/**
 * GET /api/cms/pages?status=PUBLISHED&division=SOFTWARE
 * Public — but admins see DRAFT rows for their own slugs too.
 * Status filter defaults to PUBLISHED; pass `status=` (empty) or
 * `all` to get every row (admin use).
 * Division filter is optional - if not provided, returns all divisions.
 */
export async function getPages(req, res) {
    try {
        const { status, slug, division } = req.query;
        const conditions = [];
        const params = [];

        if (slug) {
            params.push(slug);
            conditions.push(`slug = $${params.length}`);
        }
        if (division && ['SOFTWARE', 'SURVEY', 'DRONE'].includes(division)) {
            params.push(division);
            conditions.push(`division = $${params.length}`);
        }
        if (status && status !== 'all' && status !== '') {
            params.push(status);
            conditions.push(`status = $${params.length}`);
        } else if (!slug) {
            // No filters → only show published by default.
            conditions.push(`status = 'PUBLISHED'`);
        }

        const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
        const { rows } = await pool.query(
            `SELECT * FROM pages${where} ORDER BY updated_at DESC LIMIT 500`,
            params
        );
        return res.json(rows);
    } catch (err) {
        console.error('[CMS] getPages error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

/**
 * GET /api/cms/pages/:slug
 * Public — only PUBLISHED rows are reachable; DRAFT/ARCHIVED
 * return 404 so they're invisible to the public.
 */
export async function getPageBySlug(req, res) {
    try {
        const { slug } = req.params;
        if (!SLUG_RE.test(slug)) return res.status(400).json({ error: 'Invalid slug.' });
        const { rows } = await pool.query(
            `SELECT * FROM pages WHERE slug = $1 AND status = 'PUBLISHED' LIMIT 1`,
            [slug]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Page not found.' });
        return res.json(rows[0]);
    } catch (err) {
        console.error('[CMS] getPageBySlug error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

/**
 * GET /api/cms/pages/id/:id
 * Admin-only — full row including DRAFT/ARCHIVED.
 */
export async function getPageById(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid page id.' });
        const { rows } = await pool.query(`SELECT * FROM pages WHERE id = $1`, [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Page not found.' });
        return res.json(rows[0]);
    } catch (err) {
        console.error('[CMS] getPageById error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function createPage(req, res) {
    try {
        const data = pageSchema.parse(req.body);
        const { rows } = await pool.query(
            `INSERT INTO pages (slug, title, body, hero_image, meta_description, division, status, published_at)
             VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'DRAFT'),
                     CASE WHEN $7 = 'PUBLISHED' THEN NOW() ELSE NULL END)
             RETURNING *`,
            [data.slug, data.title, data.body || null, data.hero_image || null, data.meta_description || null, data.division || 'SOFTWARE', data.status || 'DRAFT']
        );

        await writeAuditLog({
            action: 'CMS_PAGE_CREATED',
            entityType: 'pages',
            entityId: rows[0].id,
            details: { slug: data.slug, division: data.division, status: data.status || 'DRAFT' },
            user: req.user,
            ipAddress: getClientIp(req),
        });

        return res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        if (err.code === '23505') return res.status(409).json({ error: 'A page with that slug already exists.' });
        console.error('[CMS] createPage error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function updatePage(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid page id.' });
        const data = pageSchema.parse(req.body);

        const { rows } = await pool.query(
            `UPDATE pages
                SET slug = $1, title = $2, body = $3, hero_image = $4,
                    meta_description = $5, division = $6, status = $7,
                    published_at = CASE
                        WHEN $7 = 'PUBLISHED' AND published_at IS NULL THEN NOW()
                        WHEN $7 <> 'PUBLISHED' THEN NULL
                        ELSE published_at
                    END,
                    updated_at = NOW()
              WHERE id = $8
              RETURNING *`,
            [data.slug, data.title, data.body || null, data.hero_image || null, data.meta_description || null, data.division || 'SOFTWARE', data.status || 'DRAFT', id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Page not found.' });

        await writeAuditLog({
            action: 'CMS_PAGE_UPDATED',
            entityType: 'pages',
            entityId: id,
            details: { slug: data.slug, division: data.division, status: data.status || 'DRAFT' },
            user: req.user,
            ipAddress: getClientIp(req),
        });

        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        if (err.code === '23505') return res.status(409).json({ error: 'A page with that slug already exists.' });
        console.error('[CMS] updatePage error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function deletePage(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid page id.' });
        const { rows } = await pool.query(`DELETE FROM pages WHERE id = $1 RETURNING id, slug`, [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Page not found.' });

        await writeAuditLog({
            action: 'CMS_PAGE_DELETED',
            entityType: 'pages',
            entityId: id,
            details: { slug: rows[0].slug },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.json({ success: true, deleted: rows[0] });
    } catch (err) {
        console.error('[CMS] deletePage error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ─────────────────────────── TESTIMONIALS ─────────────────────
/**
 * GET /api/cms/testimonials?division=SURVEY&featured=true
 * Public.
 */
export async function getTestimonials(req, res) {
    try {
        const { division, featured } = req.query;
        const conditions = [];
        const params = [];
        if (division && ['SOFTWARE', 'SURVEY', 'DRONE'].includes(division)) {
            params.push(division);
            conditions.push(`division = $${params.length}`);
        }
        if (featured === 'true' || featured === '1') {
            conditions.push(`is_featured = true`);
        }
        const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
        const { rows } = await pool.query(
            `SELECT * FROM testimonials${where} ORDER BY is_featured DESC, created_at DESC LIMIT 200`,
            params
        );
        return res.json(rows);
    } catch (err) {
        console.error('[CMS] getTestimonials error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function createTestimonial(req, res) {
    try {
        const data = testimonialSchema.parse(req.body);
        const { rows } = await pool.query(
            `INSERT INTO testimonials (client_name, division, quote, avatar_url, is_featured)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [data.client_name, data.division, data.quote, data.avatar_url || null, !!data.is_featured]
        );

        await writeAuditLog({
            action: 'CMS_TESTIMONIAL_CREATED',
            entityType: 'testimonials',
            entityId: rows[0].id,
            details: { client_name: data.client_name, division: data.division },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[CMS] createTestimonial error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function updateTestimonial(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid id.' });
        const data = testimonialSchema.parse(req.body);
        const { rows } = await pool.query(
            `UPDATE testimonials
                SET client_name = $1, division = $2, quote = $3, avatar_url = $4,
                    is_featured = $5, updated_at = NOW()
              WHERE id = $6 RETURNING *`,
            [data.client_name, data.division, data.quote, data.avatar_url || null, !!data.is_featured, id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Testimonial not found.' });

        await writeAuditLog({
            action: 'CMS_TESTIMONIAL_UPDATED',
            entityType: 'testimonials',
            entityId: id,
            details: { client_name: data.client_name },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[CMS] updateTestimonial error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function deleteTestimonial(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid id.' });
        const { rows } = await pool.query(`DELETE FROM testimonials WHERE id = $1 RETURNING id, client_name`, [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Testimonial not found.' });

        await writeAuditLog({
            action: 'CMS_TESTIMONIAL_DELETED',
            entityType: 'testimonials',
            entityId: id,
            details: { client_name: rows[0].client_name },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.json({ success: true, deleted: rows[0] });
    } catch (err) {
        console.error('[CMS] deleteTestimonial error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ─────────────────────────── EQUIPMENT ────────────────────────
export async function getEquipment(req, res) {
    try {
        const { division } = req.query;
        const conditions = [];
        const params = [];
        if (division && ['SURVEY', 'DRONE'].includes(division)) {
            params.push(division);
            conditions.push(`division = $${params.length}`);
        }
        const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
        const { rows } = await pool.query(
            `SELECT * FROM equipment${where} ORDER BY display_order ASC, created_at ASC`,
            params
        );
        return res.json(rows);
    } catch (err) {
        console.error('[CMS] getEquipment error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function createEquipment(req, res) {
    try {
        const data = equipmentSchema.parse(req.body);
        const { rows } = await pool.query(
            `INSERT INTO equipment (name, division, description, image_url, display_order)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [data.name, data.division, data.description || null, data.image_url || null, data.display_order || 0]
        );

        await writeAuditLog({
            action: 'CMS_EQUIPMENT_CREATED',
            entityType: 'equipment',
            entityId: rows[0].id,
            details: { name: data.name, division: data.division },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[CMS] createEquipment error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function updateEquipment(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid id.' });
        const data = equipmentSchema.parse(req.body);
        const { rows } = await pool.query(
            `UPDATE equipment
                SET name = $1, division = $2, description = $3, image_url = $4,
                    display_order = $5, updated_at = NOW()
              WHERE id = $6 RETURNING *`,
            [data.name, data.division, data.description || null, data.image_url || null, data.display_order || 0, id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Equipment not found.' });

        await writeAuditLog({
            action: 'CMS_EQUIPMENT_UPDATED',
            entityType: 'equipment',
            entityId: id,
            details: { name: data.name },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[CMS] updateEquipment error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function deleteEquipment(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid id.' });
        const { rows } = await pool.query(`DELETE FROM equipment WHERE id = $1 RETURNING id, name`, [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Equipment not found.' });

        await writeAuditLog({
            action: 'CMS_EQUIPMENT_DELETED',
            entityType: 'equipment',
            entityId: id,
            details: { name: rows[0].name },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.json({ success: true, deleted: rows[0] });
    } catch (err) {
        console.error('[CMS] deleteEquipment error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ─────────────────────────── INDUSTRIES ──────────────────────
export async function getIndustries(_req, res) {
    try {
        const { rows } = await pool.query(
            `SELECT * FROM industries ORDER BY display_order ASC, name ASC`
        );
        return res.json(rows);
    } catch (err) {
        console.error('[CMS] getIndustries error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function createIndustry(req, res) {
    try {
        const data = industrySchema.parse(req.body);
        const { rows } = await pool.query(
            `INSERT INTO industries (name, description, icon, sample_image, display_order)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [data.name, data.description || null, data.icon || null, data.sample_image || null, data.display_order || 0]
        );

        await writeAuditLog({
            action: 'CMS_INDUSTRY_CREATED',
            entityType: 'industries',
            entityId: rows[0].id,
            details: { name: data.name },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[CMS] createIndustry error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function updateIndustry(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid id.' });
        const data = industrySchema.parse(req.body);
        const { rows } = await pool.query(
            `UPDATE industries
                SET name = $1, description = $2, icon = $3, sample_image = $4,
                    display_order = $5, updated_at = NOW()
              WHERE id = $6 RETURNING *`,
            [data.name, data.description || null, data.icon || null, data.sample_image || null, data.display_order || 0, id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Industry not found.' });

        await writeAuditLog({
            action: 'CMS_INDUSTRY_UPDATED',
            entityType: 'industries',
            entityId: id,
            details: { name: data.name },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[CMS] updateIndustry error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function deleteIndustry(req, res) {
    try {
        const { id } = req.params;
        if (!isUuid(id)) return res.status(400).json({ error: 'Invalid id.' });
        const { rows } = await pool.query(`DELETE FROM industries WHERE id = $1 RETURNING id, name`, [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Industry not found.' });

        await writeAuditLog({
            action: 'CMS_INDUSTRY_DELETED',
            entityType: 'industries',
            entityId: id,
            details: { name: rows[0].name },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.json({ success: true, deleted: rows[0] });
    } catch (err) {
        console.error('[CMS] deleteIndustry error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
