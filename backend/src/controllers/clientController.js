import { z } from 'zod';
import pool from '../config/db.js';
import { writeAuditLog, getClientIp } from '../utils/auditLog.js';

const clientSchema = z.object({
    name: z.string().min(1, "Name is required"),
    primary_contact_email: z.string().email("Valid primary email is required"),
    billing_email: z.string().email("Valid billing email is required").optional().or(z.literal('')),
    phone: z.string().max(32, "Phone too long").optional().or(z.literal('')),
    stripe_customer_id: z.string().optional().or(z.literal('')),
    division: z.enum(['SOFTWARE', 'SURVEY', 'DRONE']).optional().default('SOFTWARE'),
    notes: z.string().optional().or(z.literal(''))
});

export const getClients = async (req, res) => {
    try {
        const conditions = [];
        const params = [];
        
        // Add division filter if provided
        if (req.query.division && ['SOFTWARE', 'SURVEY', 'DRONE'].includes(req.query.division)) {
            params.push(req.query.division);
            conditions.push(`c.division = $${params.length}`);
        }
        
        const where = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
        
        const { rows } = await pool.query(`
            SELECT 
                c.*,
                (SELECT COUNT(*) FROM client_projects cp WHERE cp.client_id = c.id) as projects_count,
                (SELECT COALESCE(SUM(amount), 0) FROM invoices i WHERE i.client_id = c.id AND i.status = 'PAID') as total_billed
            FROM clients c
            ${where}
            ORDER BY c.created_at DESC
        `, params);
        res.json(rows);
    } catch (err) {
        console.error('[Clients] getClients error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getClientById = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(
            `SELECT * FROM clients WHERE id = $1`,
            [id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Client not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error('[Clients] getClientById error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createClient = async (req, res) => {
    try {
        const data = clientSchema.parse(req.body);
        const { rows } = await pool.query(
            `INSERT INTO clients (name, primary_contact_email, billing_email, phone, stripe_customer_id, division, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [data.name, data.primary_contact_email, data.billing_email || null, data.phone || null, data.stripe_customer_id || null, data.division || 'SOFTWARE', data.notes || null]
        );
        writeAuditLog({
            action: 'CLIENT_CREATED',
            entityType: 'clients',
            entityId: rows[0].id,
            details: { name: data.name, division: data.division },
            user: req.user,
            ipAddress: getClientIp(req),
        }).catch(() => {});
        res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Clients] createClient error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const data = clientSchema.parse(req.body);
        // Capture the pre-update state for the audit diff.
        const before = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
        const { rows } = await pool.query(
            `UPDATE clients
             SET name = $1, primary_contact_email = $2, billing_email = $3, phone = $4, stripe_customer_id = $5, division = $6, notes = $7, updated_at = NOW()
             WHERE id = $8 RETURNING *`,
            [data.name, data.primary_contact_email, data.billing_email || null, data.phone || null, data.stripe_customer_id || null, data.division || 'SOFTWARE', data.notes || null, id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Client not found' });
        writeAuditLog({
            action: 'CLIENT_UPDATED',
            entityType: 'clients',
            entityId: id,
            details: { before: before.rows[0], after: rows[0] },
            user: req.user,
            ipAddress: getClientIp(req),
        }).catch(() => {});
        res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Clients] updateClient error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        const before = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
        const { rowCount } = await pool.query(
            `DELETE FROM clients WHERE id = $1`,
            [id]
        );
        if (rowCount === 0) return res.status(404).json({ error: 'Client not found' });
        writeAuditLog({
            action: 'CLIENT_DELETED',
            entityType: 'clients',
            entityId: id,
            details: { deletedClient: before.rows[0] },
            user: req.user,
            ipAddress: getClientIp(req),
        }).catch(() => {});
        res.status(204).send();
    } catch (err) {
        console.error('[Clients] deleteClient error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};
