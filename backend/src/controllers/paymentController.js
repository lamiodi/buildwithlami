// ── controllers/paymentController.js ──────────────────────
// Phase 10 — International payment workflow.
//
// Two route groups share this controller:
//   PUBLIC  /api/payments/public/*   — no auth, token-based
//   ADMIN   /api/payments/*         — Owner / Administrator
//
// The public surface is read + write only for a single
// invoice identified by a secure random `pay_token` (UUID).
// The token is unguessable in practice (128 bits), so the
// "secret URL" pattern is sufficient — the client receives
// the link via the invoice email.

import pool from '../config/db.js';
import { z } from 'zod';
import { writeAuditLog, getClientIp } from '../utils/auditLog.js';
import {
    sendInvoiceEmail,
    sendProofReceivedEmail,
    sendAdminProofNotification,
    sendPaymentConfirmedEmail,
} from '../services/paymentEmailService.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import { SUPPORTED_CURRENCIES } from '../utils/fx.js';

// ── PUBLIC ──────────────────────────────────────────────

/**
 * GET /api/payments/public/:token
 * Returns the invoice + project + client summary + the active
 * bank accounts for the relevant currencies. The client never
 * needs to log in.
 */
export const getInvoiceByToken = async (req, res) => {
    const { token } = req.params;

    // Validate the token format early so we don't hit the DB
    // with a garbage request.
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
        return res.status(400).json({ error: 'Invalid payment link.' });
    }

    try {
        const invoiceRes = await pool.query(
            `SELECT i.id, i.invoice_number, i.amount, i.currency, i.status, i.due_date,
                    i.paid_via, i.paid_at, i.created_at,
                    i.description, i.payment_url,
                    p.project_name, p.id AS project_id,
                    c.name AS client_name, c.primary_contact_email
             FROM invoices i
             LEFT JOIN client_projects p ON p.id = i.project_id
             LEFT JOIN clients c ON c.id = i.client_id
             WHERE i.pay_token = $1`,
            [token]
        );
        if (invoiceRes.rows.length === 0) {
            return res.status(404).json({ error: 'Invoice not found. Please check the link in your email.' });
        }
        const invoice = invoiceRes.rows[0];

        // Active bank accounts for the supported currencies. We
        // pull all of them — the client picks which one applies.
        const bankRes = await pool.query(
            `SELECT id, currency, provider, account_name, bank_name,
                    account_number, routing_code, sort_code, swift_code, iban, reference_hint
             FROM bank_accounts
             WHERE is_active = TRUE
               AND currency = ANY($1::char(3)[])
             ORDER BY currency ASC`,
            [SUPPORTED_CURRENCIES]
        );

        // Latest proof (if any) so the client can see "we got
        // your submission, reviewing now" without re-uploading.
        const proofRes = await pool.query(
            `SELECT id, status, transaction_reference, amount_paid, currency, created_at
             FROM payment_proofs
             WHERE invoice_id = $1
             ORDER BY created_at DESC
             LIMIT 1`,
            [invoice.id]
        );

        res.json({
            invoice,
            bankAccounts: bankRes.rows,
            latestProof: proofRes.rows[0] || null,
        });
    } catch (err) {
        console.error('[Payments] getInvoiceByToken error:', err.message);
        res.status(500).json({ error: 'Failed to load payment page.' });
    }
};

const submitProofSchema = z.object({
    transaction_reference: z.string().trim().min(3).max(200),
    amount_paid: z.number().positive(),
    currency: z.string().length(3).refine(
        (c) => SUPPORTED_CURRENCIES.includes(String(c).toUpperCase())
    ),
    submitted_email: z.string().email().optional().or(z.literal('')),
});

/**
 * POST /api/payments/public/:token/proof
 * Client submits transaction reference + optional proof file
 * (multipart/form-data). Always creates a PENDING row; the
 * admin CONFIRMs or REJECTs in the queue.
 */
export const submitProof = async (req, res) => {
    const { token } = req.params;

    try {
        // Look up the invoice first so we know the real amount
        // and can return a 404 for a bad token.
        const invoiceRes = await pool.query(
            `SELECT i.id, i.amount, i.currency, i.status, i.client_id, i.project_id,
                    c.name AS client_name, c.primary_contact_email
             FROM invoices i
             LEFT JOIN clients c ON c.id = i.client_id
             WHERE i.pay_token = $1`,
            [token]
        );
        if (invoiceRes.rows.length === 0) {
            return res.status(404).json({ error: 'Invoice not found.' });
        }
        const invoice = invoiceRes.rows[0];

        // Don't accept new proofs on a paid invoice.
        if (invoice.status === 'PAID') {
            return res.status(400).json({ error: 'This invoice has already been paid.' });
        }

        // Validate body (multipart fields arrive as strings).
        const parseResult = submitProofSchema.safeParse({
            transaction_reference: req.body?.transaction_reference,
            amount_paid: req.body?.amount_paid ? Number(req.body.amount_paid) : undefined,
            currency: req.body?.currency,
            submitted_email: req.body?.submitted_email || undefined,
        });
        if (!parseResult.success) {
            return res.status(400).json({ error: 'Invalid submission.', details: parseResult.error.errors });
        }
        const data = parseResult.data;

        // Optional proof file → Cloudinary. Falls back to a
        // data: URI in dev (see cloudinaryService.js).
        let proof_file_url = null;
        let proof_file_filename = null;
        let proof_file_size_bytes = null;
        if (req.file) {
            const upload = await uploadToCloudinary(req.file, {
                folder: 'buildwithlami/payment-proofs',
                resource_type: 'auto',
            });
            proof_file_url = upload.url;
            proof_file_filename = req.file.originalname;
            proof_file_size_bytes = req.file.size;
        }

        const result = await pool.query(
            `INSERT INTO payment_proofs
                (invoice_id, submitted_email, transaction_reference, amount_paid, currency,
                 proof_file_url, proof_file_filename, proof_file_size_bytes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                invoice.id,
                data.submitted_email || invoice.primary_contact_email || null,
                data.transaction_reference,
                data.amount_paid,
                data.currency.toUpperCase(),
                proof_file_url,
                proof_file_filename,
                proof_file_size_bytes,
            ]
        );

        // Fire-and-forget emails (don't block the response on
        // SMTP latency). Errors are logged inside the service.
        const proof = result.rows[0];
        sendProofReceivedEmail({
            clientEmail: data.submitted_email || invoice.primary_contact_email,
            clientName: invoice.client_name,
            invoiceId: invoice.id,
            amount: data.amount_paid,
            currency: data.currency,
            transactionReference: data.transaction_reference,
        }).catch(err => console.error('[Payments] proof-received email failed:', err.message));

        sendAdminProofNotification({
            clientName: invoice.client_name,
            invoiceId: invoice.id,
            amount: data.amount_paid,
            currency: data.currency,
            transactionReference: data.transaction_reference,
        }).catch(err => console.error('[Payments] admin-notification email failed:', err.message));

        res.status(201).json({
            proof,
            message: 'Proof received. We\'ll review it within 1 business hour.',
        });
    } catch (err) {
        console.error('[Payments] submitProof error:', err.message);
        res.status(500).json({ error: 'Failed to submit proof. Please try again or email us.' });
    }
};

// ── ADMIN ───────────────────────────────────────────────

/**
 * GET /api/payments/proofs
 * List all payment proofs, optionally filtered by status.
 */
export const listProofs = async (req, res) => {
    const { status } = req.query;
    try {
        const params = [];
        let filter = '';
        if (status && ['PENDING', 'CONFIRMED', 'REJECTED'].includes(status)) {
            params.push(status);
            filter = `WHERE pp.status = $1`;
        }
        const { rows } = await pool.query(
            `SELECT pp.*, i.amount AS invoice_amount, i.currency AS invoice_currency,
                    c.name AS client_name, c.primary_contact_email,
                    p.project_name
             FROM payment_proofs pp
             JOIN invoices i ON i.id = pp.invoice_id
             LEFT JOIN clients c ON c.id = i.client_id
             LEFT JOIN client_projects p ON p.id = i.project_id
             ${filter}
             ORDER BY
                 CASE WHEN pp.status = 'PENDING' THEN 0 ELSE 1 END,
                 pp.created_at DESC`,
            params
        );
        res.json(rows);
    } catch (err) {
        console.error('[Payments] listProofs error:', err.message);
        res.status(500).json({ error: 'Failed to load proofs.' });
    }
};

const reviewSchema = z.object({
    decision: z.enum(['CONFIRM', 'REJECT']),
    admin_notes: z.string().max(2000).optional(),
});

/**
 * POST /api/payments/proofs/:id/review
 * Admin confirms or rejects a proof. On CONFIRM, the invoice
 * is flipped to PAID (atomically with the proof update).
 */
export const reviewProof = async (req, res) => {
    const { id } = req.params;
    try {
        const { decision, admin_notes } = reviewSchema.parse(req.body);
        const newStatus = decision === 'CONFIRM' ? 'CONFIRMED' : 'REJECTED';

        // Look up the proof + invoice in one round trip so we
        // can return useful data in the response and the email.
        const lookup = await pool.query(
            `SELECT pp.id, pp.invoice_id, pp.amount_paid, pp.currency,
                    pp.transaction_reference, pp.submitted_email,
                    i.amount AS invoice_amount, i.currency AS invoice_currency,
                    c.name AS client_name, c.primary_contact_email,
                    proj.project_name
             FROM payment_proofs pp
             JOIN invoices i ON i.id = pp.invoice_id
             LEFT JOIN clients c ON c.id = i.client_id
             LEFT JOIN client_projects proj ON proj.id = i.project_id
             WHERE pp.id = $1`,
            [id]
        );
        if (lookup.rows.length === 0) {
            return res.status(404).json({ error: 'Proof not found.' });
        }
        const row = lookup.rows[0];
        if (row.invoice_currency && row.invoice_currency.toUpperCase() !== row.currency.toUpperCase()) {
            return res.status(400).json({
                error: `Currency mismatch: invoice is ${row.invoice_currency}, proof is ${row.currency}.`,
            });
        }

        const client = await pool.connect();
        let updatedProof;
        try {
            await client.query('BEGIN');
            await client.query(
                `UPDATE payment_proofs
                    SET status = $1, admin_notes = $2,
                        reviewed_by = $3, reviewed_at = NOW(), updated_at = NOW()
                  WHERE id = $4`,
                [newStatus, admin_notes || null, req.user?.id || null, id]
            );

            if (newStatus === 'CONFIRMED') {
                await client.query(
                    `UPDATE invoices
                        SET status = 'PAID', paid_via = 'BANK_TRANSFER', paid_at = NOW(),
                            updated_at = NOW()
                      WHERE id = $1`,
                    [row.invoice_id]
                );
            }

            // Read back the updated proof for the response.
            const r = await client.query(`SELECT * FROM payment_proofs WHERE id = $1`, [id]);
            updatedProof = r.rows[0];

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

        await writeAuditLog({
            action: newStatus === 'CONFIRMED' ? 'PAYMENT_PROOF_CONFIRMED' : 'PAYMENT_PROOF_REJECTED',
            entityType: 'payment_proofs',
            entityId: id,
            details: { invoice_id: row.invoice_id, decision, admin_notes },
            user: req.user,
            ipAddress: getClientIp(req),
        });

        // Email the client. Only on CONFIRM does the project
        // activation message go out — REJECT just notifies.
        const clientEmail = row.submitted_email || row.primary_contact_email;
        if (newStatus === 'CONFIRMED') {
            sendPaymentConfirmedEmail({
                clientEmail,
                clientName: row.client_name,
                invoiceId: row.invoice_id,
                projectName: row.project_name,
                amount: row.amount_paid,
                currency: row.currency,
            }).catch(err => console.error('[Payments] confirmed-email failed:', err.message));
        }

        res.json({
            proof: updatedProof,
            message: newStatus === 'CONFIRMED' ? 'Payment confirmed. Invoice marked PAID.' : 'Proof rejected.',
        });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Payments] reviewProof error:', err.message);
        res.status(500).json({ error: 'Failed to review proof.' });
    }
};

// ── Bank accounts CRUD (admin) ──────────────────────────

/**
 * GET /api/payments/bank-accounts
 */
export const listBankAccounts = async (_req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT * FROM bank_accounts ORDER BY currency ASC, provider ASC`
        );
        res.json(rows);
    } catch (err) {
        console.error('[Payments] listBankAccounts error:', err.message);
        res.status(500).json({ error: 'Failed to load bank accounts.' });
    }
};

const bankAccountSchema = z.object({
    currency: z.string().length(3).refine(
        (c) => SUPPORTED_CURRENCIES.includes(String(c).toUpperCase())
    ),
    provider: z.enum(['GREY', 'PAYSTACK', 'LOCAL']).default('GREY'),
    account_name: z.string().min(1).max(200),
    bank_name: z.string().min(1).max(200),
    account_number: z.string().min(1).max(100),
    routing_code: z.string().max(50).optional().nullable(),
    sort_code: z.string().max(20).optional().nullable(),
    swift_code: z.string().max(20).optional().nullable(),
    iban: z.string().max(50).optional().nullable(),
    reference_hint: z.string().max(200).optional().nullable(),
    is_active: z.boolean().default(true),
});

/**
 * POST /api/payments/bank-accounts
 * Upsert (one row per currency+provider).
 */
export const upsertBankAccount = async (req, res) => {
    try {
        const data = bankAccountSchema.parse(req.body);
        const result = await pool.query(
            `INSERT INTO bank_accounts
                (currency, provider, account_name, bank_name, account_number,
                 routing_code, sort_code, swift_code, iban, reference_hint, is_active, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
             ON CONFLICT (currency, provider) DO UPDATE SET
                 account_name = EXCLUDED.account_name,
                 bank_name = EXCLUDED.bank_name,
                 account_number = EXCLUDED.account_number,
                 routing_code = EXCLUDED.routing_code,
                 sort_code = EXCLUDED.sort_code,
                 swift_code = EXCLUDED.swift_code,
                 iban = EXCLUDED.iban,
                 reference_hint = EXCLUDED.reference_hint,
                 is_active = EXCLUDED.is_active,
                 updated_at = NOW()
             RETURNING *`,
            [
                data.currency.toUpperCase(),
                data.provider,
                data.account_name,
                data.bank_name,
                data.account_number,
                data.routing_code || null,
                data.sort_code || null,
                data.swift_code || null,
                data.iban || null,
                data.reference_hint || null,
                data.is_active,
            ]
        );
        await writeAuditLog({
            action: 'BANK_ACCOUNT_UPSERTED',
            entityType: 'bank_accounts',
            entityId: result.rows[0].id,
            details: { currency: data.currency, provider: data.provider },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Payments] upsertBankAccount error:', err.message);
        res.status(500).json({ error: 'Failed to save bank account.' });
    }
};

/**
 * DELETE /api/payments/bank-accounts/:id
 * Soft-deletes by toggling is_active=false. We never hard-delete
 * a bank account because an old invoice may still reference it.
 */
export const deactivateBankAccount = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `UPDATE bank_accounts SET is_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING *`,
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found.' });
        await writeAuditLog({
            action: 'BANK_ACCOUNT_DEACTIVATED',
            entityType: 'bank_accounts',
            entityId: id,
            user: req.user,
            ipAddress: getClientIp(req),
        });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('[Payments] deactivateBankAccount error:', err.message);
        res.status(500).json({ error: 'Failed to deactivate bank account.' });
    }
};

/**
 * Re-export the email helper so the invoice controller can
 * call it without importing a second file.
 */
export { sendInvoiceEmail };
