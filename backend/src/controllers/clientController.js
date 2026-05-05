// ─── src/controllers/clientController.js ─────────────────
// Full CRUD for the clients table — raw SQL, parameterised.
// ──────────────────────────────────────────────────────────

import { z } from 'zod';
import pool from '../config/db.js';

// ── Validation ───────────────────────────────────────────
const createClientSchema = z.object({
    full_name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().optional(),
});

const updateClientSchema = z.object({
    full_name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
});

// ── List all clients ─────────────────────────────────────
export async function getClients(req, res) {
    try {
        const { rows } = await pool.query(
            `SELECT id, full_name, email, phone, created_at, updated_at
       FROM   clients
       ORDER  BY created_at DESC`,
        );
        return res.json(rows);
    } catch (err) {
        console.error('[Client] getClients error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Get single client ────────────────────────────────────
export async function getClientById(req, res) {
    try {
        const { rows } = await pool.query(
            `SELECT id, full_name, email, phone, created_at, updated_at
       FROM   clients
       WHERE  id = $1`,
            [req.params.id],
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Client not found.' });
        return res.json(rows[0]);
    } catch (err) {
        console.error('[Client] getClientById error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Create client ────────────────────────────────────────
export async function createClient(req, res) {
    try {
        const data = createClientSchema.parse(req.body);
        const { rows } = await pool.query(
            `INSERT INTO clients (full_name, email, phone)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [data.full_name, data.email || null, data.phone || null],
        );
        return res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Client] createClient error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Update client ────────────────────────────────────────
export async function updateClient(req, res) {
    try {
        const data = updateClientSchema.parse(req.body);
        const fields = [];
        const values = [];
        let idx = 1;

        if (data.full_name !== undefined) { fields.push(`full_name = $${idx++}`); values.push(data.full_name); }
        if (data.email !== undefined) { fields.push(`email = $${idx++}`); values.push(data.email); }
        if (data.phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(data.phone); }

        if (fields.length === 0) return res.status(400).json({ error: 'No fields to update.' });

        fields.push(`updated_at = NOW()`);
        values.push(req.params.id);

        const { rows } = await pool.query(
            `UPDATE clients SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
            values,
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Client not found.' });
        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Client] updateClient error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Delete client ────────────────────────────────────────
export async function deleteClient(req, res) {
    try {
        const { rowCount } = await pool.query(`DELETE FROM clients WHERE id = $1`, [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Client not found.' });
        return res.json({ message: 'Client deleted.' });
    } catch (err) {
        console.error('[Client] deleteClient error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
