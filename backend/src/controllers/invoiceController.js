// ─── src/controllers/invoiceController.js ────────────────
// CRUD for invoices — raw SQL, parameterised.
// ──────────────────────────────────────────────────────────

import { z } from 'zod';
import pool from '../config/db.js';

// ── Validation ───────────────────────────────────────────
const createInvoiceSchema = z.object({
    amount: z.number().int().min(0),
    status: z.enum(['PENDING', 'PAID', 'OVERDUE']).optional(),
    due_date: z.string().optional(),
    client_id: z.string().uuid(),
});

const updateInvoiceSchema = z.object({
    amount: z.number().int().min(0).optional(),
    status: z.enum(['PENDING', 'PAID', 'OVERDUE']).optional(),
    due_date: z.string().optional(),
    client_id: z.string().uuid().optional(),
});

const INVOICE_SELECT = `
  SELECT i.*, c.full_name AS client_name, c.email AS client_email
  FROM   invoices i
  LEFT JOIN clients c ON c.id = i.client_id
`;

// ── List ─────────────────────────────────────────────────
export async function getInvoices(req, res) {
    try {
        let query = `${INVOICE_SELECT}`;
        const vals = [];

        // Clients only see their own invoices
        if (req.user.role === 'CLIENT') {
            query += ` WHERE i.client_id = $1`;
            vals.push(req.user.id);
        }

        query += ` ORDER BY i.created_at DESC`;

        const { rows } = await pool.query(query, vals);
        return res.json(rows);
    } catch (err) {
        console.error('[Invoice] getInvoices error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Get by ID ────────────────────────────────────────────
export async function getInvoiceById(req, res) {
    try {
        const { rows } = await pool.query(`${INVOICE_SELECT} WHERE i.id = $1`, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Invoice not found.' });

        // Clients can only access their own invoice
        if (req.user.role === 'CLIENT' && rows[0].client_id !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden.' });
        }

        return res.json(rows[0]);
    } catch (err) {
        console.error('[Invoice] getInvoiceById error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Create ───────────────────────────────────────────────
export async function createInvoice(req, res) {
    try {
        const data = createInvoiceSchema.parse(req.body);
        const { rows } = await pool.query(
            `INSERT INTO invoices (amount, status, due_date, client_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [data.amount, data.status || 'PENDING', data.due_date || null, data.client_id],
        );
        return res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Invoice] createInvoice error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Update ───────────────────────────────────────────────
export async function updateInvoice(req, res) {
    try {
        const data = updateInvoiceSchema.parse(req.body);
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
            `UPDATE invoices SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
            values,
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Invoice not found.' });
        return res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Invoice] updateInvoice error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Delete ───────────────────────────────────────────────
export async function deleteInvoice(req, res) {
    try {
        const { rowCount } = await pool.query(`DELETE FROM invoices WHERE id = $1`, [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ error: 'Invoice not found.' });
        return res.json({ message: 'Invoice deleted.' });
    } catch (err) {
        console.error('[Invoice] deleteInvoice error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
