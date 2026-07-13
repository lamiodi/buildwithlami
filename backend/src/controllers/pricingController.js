// ─── src/controllers/pricingController.js ────────────────
// Public pricing tiers (/pricing) + admin CRUD.
//
// Each row is one tier. `highlight` drives the "Most popular"
// badge, `display_order` controls the left-to-right order on
// the public page.
// ──────────────────────────────────────────────────────────

import { z } from 'zod';
import pool from '../config/db.js';

const createSchema = z.object({
    name: z.string().min(1),
    price: z.string().min(1),
    cadence: z.string().optional().default('one-time'),
    description: z.string().optional().nullable(),
    features: z.array(z.string()).optional().default([]),
    highlight: z.boolean().optional().default(false),
    display_order: z.number().int().optional().default(0),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional().default('PUBLISHED'),
});

const updateSchema = createSchema.partial();

export async function getPublicPricing(_req, res) {
    try {
        const { rows } = await pool.query(
            `SELECT id, name, price, cadence, description, features,
                    highlight, display_order, status
               FROM pricing
              WHERE status = 'PUBLISHED'
              ORDER BY display_order ASC, created_at ASC`
        );
        return res.json(rows);
    } catch (err) {
        console.error('[Pricing] getPublicPricing error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function getAdminPricing(_req, res) {
    try {
        const { rows } = await pool.query(
            `SELECT * FROM pricing ORDER BY display_order ASC, created_at ASC`
        );
        return res.json(rows);
    } catch (err) {
        console.error('[Pricing] getAdminPricing error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function createPricing(req, res) {
    try {
        const data = createSchema.parse(req.body);
        const { rows } = await pool.query(
            `INSERT INTO pricing
                (name, price, cadence, description, features, highlight, display_order, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                data.name,
                data.price,
                data.cadence || 'one-time',
                data.description || null,
                data.features || [],
                data.highlight ?? false,
                data.display_order ?? 0,
                data.status || 'PUBLISHED',
            ]
        );
        return res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Pricing] createPricing error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function updatePricing(req, res) {
    try {
        const data = updateSchema.parse(req.body);
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
            `UPDATE pricing SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
            values
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Pricing tier not found.' });
        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Pricing] updatePricing error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function deletePricing(req, res) {
    try {
        const { rows } = await pool.query(
            `DELETE FROM pricing WHERE id = $1 RETURNING id`,
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Pricing tier not found.' });
        return res.json({ ok: true });
    } catch (err) {
        console.error('[Pricing] deletePricing error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
