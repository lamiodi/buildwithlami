// ─── src/utils/paymentConfirmation.js ───────────────────
// Reusable helper for "manually mark an invoice as PAID".
//
// The /api/payments/proofs/:id/review endpoint already does
// the right thing (atomic UPDATE of payment_proofs +
// invoices inside a transaction). This module provides the
// same guarantees for the *admin*'s direct /pay endpoint,
// which previously had no proof / reference / 2FA requirements.
//
// Rules enforced:
//   1. The invoice must currently be PENDING (or PARTIAL for
//      split payments). REFUNDED / CANCELLED are terminal.
//   2. The caller MUST provide a `paymentReference`
//      (transaction ref, wire ID, etc.) — no naked "mark paid".
//   3. The caller SHOULD reference a payment_proofs row
//      (proofId) so the audit trail ties back to the
//      client-submitted evidence. If proofId is supplied,
//      the referenced proof must exist and not be REJECTED.
//   4. If the invoice amount exceeds the configured threshold
//      AND the acting user has 2FA enabled, the caller MUST
//      supply a fresh 2FA code in the same request and it
//      must verify.
//   5. The DB update is atomic: invoice status, paid_at,
//      manual_payment_reference, manual_payment_proof_id,
//      manual_paid_via are all written in a single
//      transaction alongside an audit log entry.
//   6. A re-attempt on a PAID invoice is a no-op that returns
//      the existing row (idempotent) — never a 500.
//
// Returns { ok, invoice, reason } where reason is one of:
//   'paid'              — invoice transitioned to PAID
//   'already_paid'      — already PAID, no change made
//   'invalid_state'     — invoice in a non-confirmable state
//   'proof_not_found'   — proofId provided but row missing
//   'proof_rejected'    — proofId points at a REJECTED proof
//   'two_factor_required' — amount above threshold, no code
//   'two_factor_invalid'  — amount above threshold, bad code
//   'amount_mismatch'   — currency / amount don't match the proof
//   'threshold'         — env mis-configured (logged)
// ──────────────────────────────────────────────────────────

import pool from '../config/db.js';
import { writeAuditLog } from './auditLog.js';
import { consumeTwoFactorCredential } from '../services/twoFactorService.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

/**
 * Resolve the "above-threshold" cutoff in the invoice's
 * currency. The env var is the *minor unit* of the invoice's
 * currency (kobo for NGN, cents for USD, pence for GBP).
 *
 * Why a numeric threshold instead of "always require 2FA"?
 * The studio Owner occasionally clears a 5k NGN invoice by
 * hand. Forcing 2FA on every manual confirmation is friction
 * without security value at that scale. The audit log + the
 * proof/reference requirements are the always-on controls;
 * 2FA is the *additional* control above the threshold.
 */
function readThresholdMinorUnits() {
    const raw = process.env.MANUAL_PAYMENT_THRESHOLD_MINOR;
    const n = raw ? Number(raw) : 10_000_000; // default ₦100,000 / $200 / £200
    if (!Number.isFinite(n) || n < 0) {
        console.warn('[Payment] MANUAL_PAYMENT_THRESHOLD_MINOR is invalid — falling back to default.');
        return 10_000_000;
    }
    return n;
}

/**
 * Convert a major-unit amount to minor units using the
 * standard 100x convention. (The studio doesn't deal in
 * three-decimal currencies, so the simple rule holds.)
 */
function toMinorUnits(majorAmount) {
    const n = Number(majorAmount);
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.round(n * 100);
}

/**
 * Confirm an invoice as paid manually.
 *
 * @param {object} args
 * @param {string} args.invoiceId        - required
 * @param {string} args.userId           - admin performing the action
 * @param {string} args.user             - req.user (for audit log)
 * @param {string} args.ipAddress        - for audit log
 * @param {string} args.paymentReference - required, free-text
 * @param {string} [args.proofId]        - optional payment_proofs row
 * @param {string} [args.paidVia]        - e.g. 'BANK_TRANSFER_CONFIRMED'
 * @param {string} [args.twoFactorCode]  - required above threshold if user has 2FA
 * @returns {Promise<{ok: boolean, invoice?: object, reason: string}>}
 */
export async function confirmManualPayment({
    invoiceId,
    userId,
    user,
    ipAddress,
    paymentReference,
    proofId = null,
    paidVia = null,
    twoFactorCode = null,
}) {
    if (!isUuid(invoiceId)) {
        return { ok: false, reason: 'invalid_invoice_id' };
    }
    if (typeof paymentReference !== 'string' || paymentReference.trim().length < 3) {
        return { ok: false, reason: 'reference_required' };
    }
    const trimmedRef = paymentReference.trim().slice(0, 200);
    if (proofId !== null && proofId !== undefined && !isUuid(proofId)) {
        return { ok: false, reason: 'invalid_proof_id' };
    }

    // Load the invoice + the caller's 2FA status in a single
    // round trip so we can decide whether the step-up is
    // needed before opening a transaction.
    const { rows: invRows } = await pool.query(
        `SELECT i.id, i.status, i.amount, i.currency, i.client_id, i.project_id,
                i.invoice_number, i.paid_at,
                u.two_factor_enabled
           FROM invoices i
           LEFT JOIN users u ON u.id = $2
          WHERE i.id = $1`,
        [invoiceId, userId]
    );
    if (invRows.length === 0) {
        return { ok: false, reason: 'invoice_not_found' };
    }
    const inv = invRows[0];

    if (inv.status === 'PAID') {
        // Idempotent: re-running /pay on a paid invoice is a no-op.
        return { ok: true, invoice: inv, reason: 'already_paid' };
    }
    if (!['PENDING', 'OVERDUE', 'PARTIAL'].includes(inv.status)) {
        return { ok: false, reason: 'invalid_state' };
    }

    // Threshold-based 2FA step-up. We compare in the invoice's
    // minor unit (kobo / cents) so a ₦100,000 / $200 cutoff
    // works uniformly across currencies.
    const threshold = readThresholdMinorUnits();
    const amountMinor = toMinorUnits(inv.amount);
    const needsTwoFactor = amountMinor >= threshold && inv.two_factor_enabled;
    if (needsTwoFactor) {
        if (!twoFactorCode || typeof twoFactorCode !== 'string') {
            return { ok: false, reason: 'two_factor_required' };
        }
        const tfa = await consumeTwoFactorCredential(userId, twoFactorCode.trim());
        if (!tfa.ok) {
            return { ok: false, reason: 'two_factor_invalid' };
        }
    }

    // If a proof is referenced, validate it belongs to this
    // invoice and isn't REJECTED. (CONFIRMED is allowed; some
    // admins confirm a proof and then re-derive the payment
    // from it for the invoice.)
    if (proofId) {
        const { rows: proofRows } = await pool.query(
            `SELECT id, invoice_id, status, currency, amount_paid
               FROM payment_proofs WHERE id = $1`,
            [proofId]
        );
        if (proofRows.length === 0) {
            return { ok: false, reason: 'proof_not_found' };
        }
        const proof = proofRows[0];
        if (proof.invoice_id !== invoiceId) {
            return { ok: false, reason: 'proof_mismatch' };
        }
        if (proof.status === 'REJECTED') {
            return { ok: false, reason: 'proof_rejected' };
        }
        if (proof.currency && inv.currency && String(proof.currency).toUpperCase() !== String(inv.currency).toUpperCase()) {
            return { ok: false, reason: 'amount_mismatch' };
        }
    }

    // Atomic UPDATE. We re-check status in the WHERE so two
    // concurrent calls can't both flip the same invoice.
    const client = await pool.connect();
    let updated;
    try {
        await client.query('BEGIN');
        const upd = await client.query(
            `UPDATE invoices
                SET status = 'PAID',
                    paid_at = NOW(),
                    paid_via = COALESCE($2, paid_via),
                    manual_payment_reference = $3,
                    manual_payment_proof_id  = $4,
                    manual_paid_via          = $5,
                    updated_at = NOW()
              WHERE id = $1
                AND status IN ('PENDING', 'OVERDUE', 'PARTIAL')
              RETURNING *`,
            [invoiceId, paidVia || 'MANUAL_ADMIN', trimmedRef, proofId, paidVia]
        );
        if (upd.rows.length === 0) {
            // Someone else flipped it between our SELECT and
            // our UPDATE. Read the current state for the
            // response so the UI can refresh.
            await client.query('ROLLBACK');
            const cur = await client.query(`SELECT * FROM invoices WHERE id = $1`, [invoiceId]);
            if (cur.rows[0]?.status === 'PAID') {
                return { ok: true, invoice: cur.rows[0], reason: 'already_paid' };
            }
            return { ok: false, reason: 'invalid_state' };
        }
        updated = upd.rows[0];

        // If the proof is still PENDING, mark it CONFIRMED
        // too — the manual /pay flow is the operator's
        // decision that the money cleared.
        if (proofId) {
            await client.query(
                `UPDATE payment_proofs
                    SET status = 'CONFIRMED',
                        reviewed_by = $2,
                        reviewed_at = NOW(),
                        updated_at = NOW()
                  WHERE id = $1
                    AND status = 'PENDING'`,
                [proofId, userId]
            );
        }

        // 3.4 Invoice to Project: same behaviour as the
        // proof review endpoint — flip the project to
        // PAID/PARTIAL based on the aggregate.
        if (updated.project_id) {
            const { rows: agg } = await client.query(
                `SELECT
                    COALESCE(SUM(amount) FILTER (WHERE status = 'PAID'), 0) AS paid_total,
                    (SELECT amount_due FROM client_projects WHERE id = $1) AS amount_due
                 FROM invoices
                 WHERE project_id = $1`,
                [updated.project_id]
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
                await client.query(
                    `UPDATE client_projects SET payment_status = $1, updated_at = NOW() WHERE id = $2`,
                    [newStatus, updated.project_id]
                );
            }
        }

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }

    // Audit log (fire-and-forget — writeAuditLog never throws).
    await writeAuditLog({
        action: 'INVOICE_MANUAL_PAID',
        entityType: 'invoices',
        entityId: invoiceId,
        details: {
            paymentReference: trimmedRef,
            proofId,
            paidVia: paidVia || 'MANUAL_ADMIN',
            twoFactorStepUp: needsTwoFactor,
            amount: updated.amount,
            currency: updated.currency,
        },
        user,
        ipAddress,
    });

    return { ok: true, invoice: updated, reason: 'paid' };
}
