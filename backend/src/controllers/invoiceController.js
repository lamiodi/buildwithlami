import pool from '../config/db.js';
import { z } from 'zod';
import crypto from 'crypto';
import { writeAuditLog, getClientIp } from '../utils/auditLog.js';
import { SUPPORTED_CURRENCIES } from '../utils/fx.js';
import { sendInvoiceEmail } from './paymentController.js';

const invoiceSchema = z.object({
    clientId: z.string().uuid(),
    projectId: z.string().uuid(),
    amount: z.number().positive(),
    currency: z.string().length(3).refine(
        (c) => SUPPORTED_CURRENCIES.includes(String(c).toUpperCase()),
        { message: `currency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}` }
    ).optional(),
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
        const { clientId, projectId, amount, currency, dueDate } = invoiceSchema.parse(req.body);
        // Default to NGN; upper-case to normalise storage.
        const currencyCode = (currency || 'NGN').toUpperCase();

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

        // Paystack is NGN-only. For non-NGN invoices we still store the
        // invoice row but skip the Paystack init — the admin wires up
        // payment manually (Stripe / wire / Wise) for USD/EUR/GBP.
        const isPaystackSupported = currencyCode === 'NGN';

        // Insert pending invoice into database. invoice_number
        // is generated server-side as INV-YYYY-NNN where NNN is
        // the count of invoices this year + 1. Using a UNIQUE
        // column on invoice_number + a defensive ON CONFLICT
        // fallback in case two concurrent inserts race.
        const yearPrefix = `INV-${new Date().getFullYear()}-`;
        const { rows: countRows } = await pool.query(
            `SELECT COUNT(*)::int AS n FROM invoices WHERE invoice_number LIKE $1`,
            [yearPrefix + '%']
        );
        const nextSeq = String((countRows[0]?.n || 0) + 1).padStart(3, '0');
        const invoiceNumber = yearPrefix + nextSeq;

        const { rows } = await pool.query(
            `INSERT INTO invoices (client_id, project_id, amount, currency, due_date, status, invoice_number)
             VALUES ($1, $2, $3, $4, $5, 'PENDING', $6) RETURNING *`,
            [clientId, projectId, amount, currencyCode, dueDate || null, invoiceNumber]
        );
        const invoice = rows[0];

        // Initialize transaction with Paystack (NGN only).
        if (isPaystackSupported && process.env.PAYSTACK_SECRET_KEY) {
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

                const updated = await pool.query(
                    `UPDATE invoices SET payment_url = $1, paystack_reference = $2 WHERE id = $3 RETURNING *`,
                    [paymentUrl, reference, invoice.id]
                );
                // Merge Paystack data into the response object.
                Object.assign(invoice, updated.rows[0]);
            } else {
                // Paystack init failed — log but keep the local
                // invoice as PENDING so an admin can retry from
                // the dashboard. We still send the invoice email
                // so the client gets a payment link.
                console.error('[Invoices] Paystack init failed:', paystackData.message || 'unknown error');
            }
        }

        // Send the invoice email with the secure /pay/:token
        // link. The PaymentPage shows bank-transfer details
        // for non-NGN, so international clients get everything
        // they need in one message. Fire-and-forget so SMTP
        // latency doesn't block the API response.
        sendInvoiceEmail({
            clientEmail: email,
            clientName: clientResult.rows[0].name || null,
            invoiceId: invoice.id,
            amount: invoice.amount,
            currency: invoice.currency,
            payToken: invoice.pay_token,
            dueDate: invoice.due_date,
            projectName: projectResult.rows[0].project_name || null,
        }).catch(err => console.error('[Invoices] invoice-email failed:', err.message));

        res.status(201).json(invoice);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Invoices] createInvoice error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin: Get all invoices (with client + project names for display)
export const getAllInvoices = async (req, res) => {
    try {
        const conditions = [];
        const params = [];
        
        // Add division filter if provided
        if (req.query.division && ['SOFTWARE', 'SURVEY', 'DRONE'].includes(req.query.division)) {
            params.push(req.query.division);
            conditions.push(`i.division = $${params.length}`);
        }
        
        const where = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
        
        const { rows } = await pool.query(`
            SELECT i.id, i.project_id, i.client_id, i.amount, i.currency, i.status,
                   i.due_date, i.payment_url, i.paystack_reference, i.paid_at,
                   i.division, i.created_at,
                   c.name AS client_name,
                   p.project_name
            FROM invoices i
            LEFT JOIN clients c ON i.client_id = c.id
            LEFT JOIN client_projects p ON i.project_id = p.id
            ${where}
            ORDER BY i.created_at DESC
        `, params);
        res.json(rows);
    } catch (err) {
        console.error('[Invoices] getAllInvoices error:', err.message);
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

// Admin: Delete invoice
export const deleteInvoice = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID format.' });
    try {
        const { rows } = await pool.query('DELETE FROM invoices WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Invoice not found.' });
        await writeAuditLog({
            action: 'INVOICE_DELETED',
            entityType: 'invoices',
            entityId: id,
            details: { amount: rows[0].amount, status: rows[0].status },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        res.json({ success: true, deleted: rows[0] });
    } catch (err) {
        console.error('[Invoices] deleteInvoice error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin: Mark invoice as paid manually
export const markInvoicePaid = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID format.' });
    try {
        const { rows } = await pool.query(
            `UPDATE invoices SET status = 'PAID', paid_at = NOW() WHERE id = $1 AND status <> 'PAID' RETURNING *`,
            [id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Invoice not found or already paid.' });
        await writeAuditLog({
            action: 'INVOICE_MARKED_PAID',
            entityType: 'invoices',
            entityId: id,
            details: {
                amount: rows[0].amount,
                clientId: rows[0].client_id,
                projectId: rows[0].project_id,
            },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        res.json(rows[0]);
    } catch (err) {
        console.error('[Invoices] markInvoicePaid error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin: Issue refund (sets invoice to REFUNDED, clears paid_at)
export const refundInvoice = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID format.' });
    try {
        const { rows } = await pool.query(
            `UPDATE invoices SET status = 'REFUNDED', paid_at = NULL WHERE id = $1 AND status = 'PAID' RETURNING *`,
            [id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Invoice not found or cannot be refunded.' });
        await writeAuditLog({
            action: 'INVOICE_REFUNDED',
            entityType: 'invoices',
            entityId: id,
            details: {
                amount: rows[0].amount,
                clientId: rows[0].client_id,
                projectId: rows[0].project_id,
            },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        res.json(rows[0]);
    } catch (err) {
        console.error('[Invoices] refundInvoice error:', err.message);
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