// ─── src/services/receiptService.js ───────────────────────
// Admin OS Phase 2 — Receipts (blueprint §45).
//
// ensureReceiptForInvoice({ invoiceId, paidVia }) generates the
// durable, numbered record for a PAID invoice: receipt number
// (RCP-YYYY-NNN), amount + currency, payment method/date, and the
// client's remaining balance in the SAME currency at the moment of
// payment (never mixed across currencies — §42).
//
// Idempotent: `receipts.invoice_id` is UNIQUE, so re-running on the
// same invoice returns the existing receipt. Never throws — a
// receipt failure must not break a payment confirmation.
// ──────────────────────────────────────────────────────────

import pool from '../config/db.js';
import { writeAuditLog } from '../utils/auditLog.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

export async function ensureReceiptForInvoice({ invoiceId, paidVia = null, user = null, ipAddress = null }) {
    try {
        if (!isUuid(invoiceId)) return { ok: false, reason: 'invalid_id' };

        const { rows: invRows } = await pool.query(
            `SELECT id, invoice_number, client_id, project_id, amount, currency, status, paid_at, paid_via
               FROM invoices WHERE id = $1`,
            [invoiceId]
        );
        if (invRows.length === 0) return { ok: false, reason: 'invoice_not_found' };
        const invoice = invRows[0];

        if (invoice.status !== 'PAID') {
            return { ok: false, reason: 'not_paid' };
        }

        // Idempotency: one receipt per invoice, enforced by UNIQUE.
        const existing = await pool.query(
            `SELECT * FROM receipts WHERE invoice_id = $1`,
            [invoiceId]
        );
        if (existing.rows.length > 0) {
            return { ok: true, receipt: existing.rows[0], created: false };
        }

        // Remaining balance: the client's other unpaid invoices in
        // the same currency only.
        const { rows: balRows } = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS balance
               FROM invoices
              WHERE client_id = $1
                AND currency = $2
                AND status IN ('PENDING', 'OVERDUE')
                AND id <> $3`,
            [invoice.client_id, invoice.currency, invoiceId]
        );

        // RCP-YYYY-NNN with the same collision-retry loop as invoices.
        const yearPrefix = `RCP-${new Date().getFullYear()}-`;
        let receipt = null;
        let attempts = 0;
        while (!receipt && attempts < 5) {
            attempts++;
            const { rows: seqRows } = await pool.query(
                `SELECT COALESCE(MAX(NULLIF(regexp_replace(receipt_number, '^RCP-[0-9]+-', ''), '')::int), 0) AS max_seq
                   FROM receipts WHERE receipt_number LIKE $1`,
                [yearPrefix + '%']
            );
            try {
                const { rows } = await pool.query(
                    `INSERT INTO receipts
                        (receipt_number, invoice_id, client_id, project_id, amount, currency, paid_via, paid_at, remaining_balance)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                     RETURNING *`,
                    [
                        yearPrefix + String((seqRows[0]?.max_seq || 0) + attempts).padStart(3, '0'),
                        invoice.id,
                        invoice.client_id,
                        invoice.project_id,
                        invoice.amount,
                        invoice.currency,
                        paidVia || invoice.paid_via || 'MANUAL',
                        invoice.paid_at || new Date(),
                        Number(balRows[0]?.balance || 0),
                    ]
                );
                receipt = rows[0];
            } catch (insertErr) {
                if (insertErr.code === '23505' && insertErr.constraint === 'receipts_receipt_number_key') {
                    continue; // sequence collision — retry
                }
                if (insertErr.code === '23505' && insertErr.constraint === 'receipts_invoice_id_key') {
                    // Concurrent generation raced us — return the winner.
                    const raced = await pool.query(`SELECT * FROM receipts WHERE invoice_id = $1`, [invoiceId]);
                    return { ok: true, receipt: raced.rows[0], created: false };
                }
                throw insertErr;
            }
        }
        if (!receipt) return { ok: false, reason: 'number_failed' };

        writeAuditLog({
            action: 'RECEIPT_GENERATED',
            entityType: 'receipts',
            entityId: receipt.id,
            details: {
                receiptNumber: receipt.receipt_number,
                invoiceId: invoice.id,
                invoiceNumber: invoice.invoice_number,
                amount: Number(receipt.amount),
                currency: receipt.currency,
                remainingBalance: Number(receipt.remaining_balance),
            },
            user,
            ipAddress,
        }).catch(() => {});

        return { ok: true, receipt, created: true };
    } catch (err) {
        console.error('[Receipts] ensureReceiptForInvoice error:', err.message);
        writeAuditLog({
            action: 'AUTOMATION_FAILED',
            entityType: 'receipts',
            entityId: invoiceId,
            details: { trigger: 'payment.paid', error: err.message },
        }).catch(() => {});
        return { ok: false, reason: 'error' };
    }
}
