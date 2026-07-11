// ─── src/utils/auditLog.js ───────────────────────────────
// Centralised helper for writing to the `audit_logs` table.
//
// Why this lives in utils/, not middleware/: the audit row needs
// the request context (user, IP) AND the *outcome* of the
// mutation. Middleware can capture the request, but not the
// "did this row actually change?" part. So we expose a single
// `writeAuditLog` that controllers call after a successful
// mutation. Logging never throws — a failed log entry must
// never roll back the real business operation.
// ──────────────────────────────────────────────────────────

import pool from '../config/db.js';

/**
 * Append a row to `audit_logs`.
 *
 * @param {object} args
 * @param {string} args.action        — verb-noun, e.g. 'INVOICE_PAID'.
 * @param {string} args.entityType    — table name, e.g. 'invoices'.
 * @param {string|null} [args.entityId]   — UUID of the row touched.
 * @param {object} [args.details]     — free-form JSON diff (old/new, etc.).
 * @param {object} [args.user]        — `req.user` from authMiddleware.
 * @param {string} [args.ipAddress]   — raw client IP (x-forwarded-for aware).
 * @returns {Promise<void>}
 */
export async function writeAuditLog({
    action,
    entityType,
    entityId = null,
    details = null,
    user = null,
    ipAddress = null,
}) {
    if (!action || !entityType) {
        console.warn('[Audit] writeAuditLog called without action/entityType — skipping.');
        return;
    }

    try {
        await pool.query(
            `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                user?.id || null,
                action,
                entityType,
                entityId,
                details ? JSON.stringify(details) : null,
                ipAddress || null,
            ]
        );
    } catch (err) {
        // Audit writes must never break the caller — log and move on.
        console.error('[Audit] Failed to write audit log:', err.message, {
            action,
            entityType,
            entityId,
        });
    }
}

/**
 * Best-effort client IP extraction. Trusts the first hop in
 * `x-forwarded-for` when present (Render / Vercel set this),
 * otherwise falls back to the socket remote address.
 */
export function getClientIp(req) {
    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string' && xff.length > 0) {
        return xff.split(',')[0].trim();
    }
    return req.ip || req.connection?.remoteAddress || null;
}
