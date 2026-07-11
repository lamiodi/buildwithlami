// ─── src/routes/adminInboxRoutes.js ──────────────────────
// Unified inbox + bulk action + global search endpoints.
// All routes require an authenticated admin.
// ──────────────────────────────────────────────────────────

import express from 'express';
import { z } from 'zod';
import pool from '../config/db.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import {
    getInbox,
    getThread,
    replyToInboxItem,
} from '../controllers/adminInboxController.js';
import { writeAuditLog, getClientIp } from '../utils/auditLog.js';

const router = express.Router();
router.use(verifyToken);
router.use(requireRole('Owner', 'Administrator'));

// ── Unified inbox ───────────────────────────────────────
router.get('/', getInbox);
router.get('/thread/:email', getThread);
router.post('/:kind/:id/reply', replyToInboxItem);

// ── Global search ────────────────────────────────────────
// GET /api/admin/search?q=odibenuah
// Returns top 5 matches per category. The union of three
// ILIKE searches, no FULLTEXT index needed for the current
// dataset size. `q` is parametrised to keep it injection-safe.
const search = async (req, res) => {
    const q = (req.query.q || '').trim();
    if (q.length < 2) {
        return res.json({ leads: [], clients: [], projects: [], invoices: [], messages: [] });
    }
    const needle = `%${q}%`;
    try {
        const [leads, clients, projects, invoices, messages] = await Promise.all([
            pool.query(
                `SELECT id, name, email, stage, created_at FROM leads
                  WHERE name ILIKE $1 OR email ILIKE $1
                  ORDER BY created_at DESC LIMIT 5`,
                [needle]
            ),
            pool.query(
                `SELECT id, name, primary_contact_email, phone, created_at FROM clients
                  WHERE name ILIKE $1 OR primary_contact_email ILIKE $1 OR phone ILIKE $1
                  ORDER BY created_at DESC LIMIT 5`,
                [needle]
            ),
            pool.query(
                `SELECT cp.id, cp.project_name, cp.status, c.name AS client_name
                   FROM client_projects cp
                   LEFT JOIN clients c ON c.id = cp.client_id
                  WHERE cp.project_name ILIKE $1
                  ORDER BY cp.updated_at DESC NULLS LAST LIMIT 5`,
                [needle]
            ),
            pool.query(
                `SELECT i.id, i.amount, i.status, i.due_date, c.name AS client_name
                   FROM invoices i
                   LEFT JOIN clients c ON c.id = i.client_id
                  WHERE c.name ILIKE $1 OR i.status::text ILIKE $1
                  ORDER BY i.created_at DESC LIMIT 5`,
                [needle]
            ),
            pool.query(
                `SELECT id, full_name, email, LEFT(message, 80) AS snippet, created_at
                   FROM messages
                  WHERE full_name ILIKE $1 OR email ILIKE $1 OR message ILIKE $1
                  ORDER BY created_at DESC LIMIT 5`,
                [needle]
            ),
        ]);
        return res.json({
            leads: leads.rows,
            clients: clients.rows,
            projects: projects.rows,
            invoices: invoices.rows,
            messages: messages.rows,
        });
    } catch (err) {
        console.error('[Search] error:', err.message);
        return res.status(500).json({ error: 'Search failed.' });
    }
};
router.get('/search', search);

// ── Bulk actions ─────────────────────────────────────────
// POST /api/admin/bulk/invoices
// body: { ids: [uuid, …], action: 'markPaid' | 'refund' | 'export' }
// POST /api/admin/bulk/clients
// body: { ids: [uuid, …], action: 'archive' | 'reassign' | 'export', assignTo?: uuid }

const bulkInvoiceSchema = z.object({
    ids: z.array(z.string().uuid()).min(1).max(200),
    action: z.enum(['markPaid', 'refund', 'export']),
});

router.post('/invoices', async (req, res) => {
    try {
        const data = bulkInvoiceSchema.parse(req.body);

        // Export is a read, not a write — return CSV-ready rows.
        if (data.action === 'export') {
            const { rows } = await pool.query(
                `SELECT i.id, i.amount, i.currency, i.status, i.due_date, i.paid_at,
                        c.name AS client_name, c.primary_contact_email
                   FROM invoices i
                   LEFT JOIN clients c ON c.id = i.client_id
                  WHERE i.id = ANY($1::uuid[])
                  ORDER BY i.created_at DESC`,
                [data.ids]
            );
            await writeAuditLog({
                action: 'BULK_INVOICE_EXPORTED',
                entityType: 'invoices',
                details: { count: rows.length, ids: data.ids },
                user: req.user,
                ipAddress: getClientIp(req),
            });
            return res.json({ success: true, rows });
        }

        const setClause = data.action === 'markPaid'
            ? `status = 'PAID', paid_at = NOW()`
            : `status = 'REFUNDED', paid_at = NULL`;
        const { rowCount } = await pool.query(
            `UPDATE invoices SET ${setClause}
              WHERE id = ANY($1::uuid[])`,
            [data.ids]
        );
        await writeAuditLog({
            action: data.action === 'markPaid' ? 'BULK_INVOICE_MARKED_PAID' : 'BULK_INVOICE_REFUNDED',
            entityType: 'invoices',
            details: { count: rowCount, ids: data.ids },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.json({ success: true, affected: rowCount });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Bulk] invoices error:', err.message);
        return res.status(500).json({ error: 'Bulk update failed.' });
    }
});

const bulkClientSchema = z.object({
    ids: z.array(z.string().uuid()).min(1).max(200),
    action: z.enum(['archive', 'reassign', 'export']),
    assignTo: z.string().uuid().optional(),
});

router.post('/clients', async (req, res) => {
    try {
        const data = bulkClientSchema.parse(req.body);
        let rowCount = 0;

        if (data.action === 'export') {
            const { rows } = await pool.query(
                `SELECT id, name, primary_contact_email, phone, status, created_at
                   FROM clients
                  WHERE id = ANY($1::uuid[])
                  ORDER BY created_at DESC`,
                [data.ids]
            );
            await writeAuditLog({
                action: 'BULK_CLIENT_EXPORTED',
                entityType: 'clients',
                details: { count: rows.length, ids: data.ids },
                user: req.user,
                ipAddress: getClientIp(req),
            });
            return res.json({ success: true, rows });
        }

        if (data.action === 'archive') {
            // Soft-archive by setting a `notes` flag — there's no
            // archived column on `clients` yet, so we mark in notes
            // and update timestamps. Keeps the data recoverable.
            const result = await pool.query(
                `UPDATE clients SET notes = COALESCE(notes, '') || '\n[ARCHIVED ' || NOW()::date || ']'
                  WHERE id = ANY($1::uuid[])`,
                [data.ids]
            );
            rowCount = result.rowCount;
        } else if (data.action === 'reassign') {
            if (!data.assignTo) {
                return res.status(400).json({ error: 'assignTo is required for reassign.' });
            }
            const result = await pool.query(
                `UPDATE client_projects
                    SET client_id = $1
                  WHERE client_id = ANY($2::uuid[])`,
                [data.assignTo, data.ids]
            );
            rowCount = result.rowCount;
        }
        await writeAuditLog({
            action: `BULK_CLIENT_${data.action.toUpperCase()}`,
            entityType: 'clients',
            details: { count: rowCount, ids: data.ids, assignTo: data.assignTo || null },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.json({ success: true, affected: rowCount });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Bulk] clients error:', err.message);
        return res.status(500).json({ error: 'Bulk update failed.' });
    }
});

// ── "Backup now" endpoint ────────────────────────────────
// Returns a signed-URL-free, immediate pg_dump-style
// snapshot. We just return the table row counts — this is
// a quick sanity check, not a full SQL dump. The real
// backup routine is documented in docs/BACKUP.md.
router.get('/backup-status', async (req, res) => {
    try {
        const tables = [
            'users', 'clients', 'client_projects', 'projects',
            'messages', 'project_feedback', 'invoices',
            'leads', 'bookings', 'notifications', 'audit_logs',
        ];
        const counts = {};
        for (const t of tables) {
            const r = await pool.query(`SELECT COUNT(*)::int AS n FROM ${t}`);
            counts[t] = r.rows[0].n;
        }
        return res.json({
            timestamp: new Date().toISOString(),
            counts,
            totalRows: Object.values(counts).reduce((s, n) => s + n, 0),
        });
    } catch (err) {
        console.error('[Backup] error:', err.message);
        return res.status(500).json({ error: 'Failed to gather backup status.' });
    }
});

export default router;
