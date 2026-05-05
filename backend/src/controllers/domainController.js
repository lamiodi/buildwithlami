// ─── src/controllers/domainController.js ─────────────────
// CRUD for domains — raw SQL, parameterised.
// ──────────────────────────────────────────────────────────

import { z } from 'zod';
import pool from '../config/db.js';

// ── Validation ───────────────────────────────────────────
const createDomainSchema = z.object({
    name: z.string().min(1),
    expiry_date: z.string().optional(),
    client_id: z.string().uuid(),
});

const updateDomainSchema = z.object({
    name: z.string().min(1).optional(),
    expiry_date: z.string().optional(),
    client_id: z.string().uuid().optional(),
});

const DOMAIN_SELECT = `
  SELECT d.*, c.full_name AS client_name, c.email AS client_email
  FROM   domains d
  LEFT JOIN clients c ON c.id = d.client_id
`;

// ── List ─────────────────────────────────────────────────
export async function getDomains(req, res) {
    try {
        const { rows } = await pool.query(`${DOMAIN_SELECT} ORDER BY d.expiry_date ASC`);
        return res.json(rows);
    } catch (err) {
        console.error('[Domain] getDomains error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Get by ID ────────────────────────────────────────────
export async function getDomainById(req, res) {
    try {
        const { rows } = await pool.query(`${DOMAIN_SELECT} WHERE d.id = $1`, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Domain not found.' });
        return res.json(rows[0]);
    } catch (err) {
        console.error('[Domain] getDomainById error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Create ───────────────────────────────────────────────
export async function createDomain(req, res) {
    try {
        const data = createDomainSchema.parse(req.body);
        const { rows } = await pool.query(
            `INSERT INTO domains (name, expiry_date, client_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [data.name, data.expiry_date || null, data.client_id],
        );
        return res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Domain] createDomain error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Update ───────────────────────────────────────────────
export async function updateDomain(req, res) {
    try {
        const data = updateDomainSchema.parse(req.body);
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
            `UPDATE domains SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
            values,
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Domain not found.' });
        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Domain] updateDomain error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Delete ───────────────────────────────────────────────
export async function deleteDomain(req, res) {
    try {
        const { rowCount } = await pool.query(`DELETE FROM domains WHERE id = $1`, [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Domain not found.' });
        return res.json({ message: 'Domain deleted.' });
    } catch (err) {
        console.error('[Domain] deleteDomain error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
