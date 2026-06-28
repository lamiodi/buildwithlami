import pool from '../config/db.js';
import { z } from 'zod';
import crypto from 'crypto';

const invoiceSchema = z.object({
    clientId: z.string().uuid(),
    projectId: z.string().uuid(),
    amount: z.number().positive(),
    dueDate: z.string().optional()
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

// Helper: timing-safe string compare that does not crash on length mismatch.
function safeEqualHex(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    if (a.length !== b.length) return false;
    try {
        return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
    } catch {
        return false;
    }
}

// Admin: Create an invoice and generate a Paystack payment link
export const createInvoice = async (req, res) => {
    try {
        const { clientId, projectId, amount, dueDate } = invoiceSchema.parse(req.body);

        if (!isUuid(clientId) || !isUuid(projectId)) {
            return res.status(400).json({ error: 'Invalid ID format.' });
        }

        // Fetch client email for Paystack
        const clientResult = await pool.query('SELECT primary_contact_email FROM clients WHERE id = $1', [clientId]);
        if (clientResult.rows.length === 0) return res.status(404).json({ error: 'Client not found' });
        const email = clientResult.rows[0].primary_contact_email;

        // Verify the project exists and is linked to this client before inserting.
        const projectResult = await pool.query(
            'SELECT id, client_id, amount_due, payment_status FROM client_projects WHERE id = $1',
            [projectId]
        );
        if (projectResult.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        if (projectResult.rows[0].client_id !== clientId) {
            return res.status(400).json({ error: 'Project does not belong to the given client.' });
        }

        // Insert pending invoice into database
        const { rows } = await pool.query(
            `INSERT INTO invoices (client_id, project_id, amount, due_date, status)
             VALUES ($1, $2, $3, $4, 'PENDING') RETURNING *`,
            [clientId, projectId, amount, dueDate || null]
        );
        const invoice = rows[0];

        // Initialize transaction with Paystack
        if (process.env.PAYSTACK_SECRET_KEY) {
            const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    amount: Math.round(amount * 100), // Paystack uses kobo/pesewas
                    reference: invoice.id,
                    callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/track/payment-success`
                })
            });

            const paystackData = await paystackRes.json();

            if (paystackData.status && paystackData.data && paystackData.data.authorization_url) {
                const paymentUrl = paystackData.data.authorization_url;
                const reference = paystackData.data.reference;

                const updatedInvoice = await pool.query(
                    `UPDATE invoices SET payment_url = $1, paystack_reference = $2 WHERE id = $3 RETURNING *`,
                    [paymentUrl, reference, invoice.id]
                );
                return res.status(201).json(updatedInvoice.rows[0]);
            }

            // Paystack init failed — log and return 502 so the client knows the
            // payment link wasn't generated, but keep the local invoice as PENDING
            // so an admin can retry from the dashboard.
            console.error('[Invoices] Paystack init failed:', paystackData.message || 'unknown error');
            return res.status(502).json({
                error: 'Payment provider error. Invoice saved as PENDING; please retry from the dashboard.',
                invoice
            });
        }

        res.status(201).json(invoice);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Invoices] createInvoice error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin/Client: Get invoices for a project
export const getInvoicesByProject = async (req, res) => {
    const { projectId } = req.params;
    if (!isUuid(projectId)) return res.status(400).json({ error: 'Invalid ID format.' });
    try {
        const { rows } = await pool.query(
            `SELECT * FROM invoices WHERE project_id = $1 ORDER BY created_at DESC`,
            [projectId]
        );
        res.json(rows);
    } catch (err) {
        console.error('[Invoices] getInvoicesByProject error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Paystack Webhook to automatically mark invoice as PAID
export const paystackWebhook = async (req, res) => {
    try {
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) {
            console.error('[Invoices] Webhook called but PAYSTACK_SECRET_KEY is not set');
            return res.status(500).json({ error: 'Webhook not configured.' });
        }

        // Validate signature with constant-time comparison.
        const signature = req.headers['x-paystack-signature'];
        const rawBody = req.rawBody || (req.body ? JSON.stringify(req.body) : '');
        const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');

        if (!safeEqualHex(hash, signature)) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        const event = req.body;
        if (!event || event.event !== 'charge.success' || !event.data) {
            // Acknowledge so Paystack doesn't retry for events we don't care about.
            return res.sendStatus(200);
        }

        const reference = event.data.reference;
        if (!isUuid(reference)) {
            return res.status(400).json({ error: 'Invalid invoice reference.' });
        }

        // Mark invoice as paid and verify the amount matches what we expected.
        const { rows } = await pool.query(
            `UPDATE invoices
                SET status = 'PAID', paid_at = NOW()
              WHERE id = $1
                AND status <> 'PAID'
                AND amount = $2
              RETURNING *`,
            [reference, (event.data.amount || 0) / 100]
        );

        if (rows.length > 0) {
            const invoice = rows[0];

            // Only flip the project to PAID when the *sum* of paid invoices
            // covers the project's amount_due. Otherwise leave it as-is
            // (PENDING / PARTIAL / OVERDUE).
            const { rows: agg } = await pool.query(
                `SELECT
                    COALESCE(SUM(amount) FILTER (WHERE status = 'PAID'), 0) AS paid_total,
                    (SELECT amount_due FROM client_projects WHERE id = $1) AS amount_due
                 FROM invoices
                 WHERE project_id = $1`,
                [invoice.project_id]
            );

            const paidTotal = parseFloat(agg[0]?.paid_total || 0);
            const amountDue = parseFloat(agg[0]?.amount_due || 0);

            let newStatus = null;
            if (amountDue > 0 && paidTotal + 0.0001 >= amountDue) {
                newStatus = 'PAID';
            } else if (paidTotal > 0) {
                newStatus = 'PARTIAL';
            }

            if (newStatus) {
                await pool.query(
                    `UPDATE client_projects SET payment_status = $1, updated_at = NOW() WHERE id = $2`,
                    [newStatus, invoice.project_id]
                );
            }
        }

        res.sendStatus(200);
    } catch (err) {
        console.error('[Invoices] Webhook error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};
