import pool from '../config/db.js';
import { z } from 'zod';
import { onQuotationAccepted } from '../services/automationService.js';
import { writeAuditLog, getClientIp } from '../utils/auditLog.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

// Validation schema for new quotations. Amount must be a positive
// number — a zero-amount quotation is almost always an admin error
// and could be sent to clients inadvertently.
const createQuotationSchema = z.object({
    lead_id: z.string().optional().nullable(),
    client_id: z.string().optional().nullable(),
    title: z.string().optional(),
    amount: z.number().positive('Amount must be greater than 0.'),
    line_items: z.array(z.any()).optional(),
    notes: z.string().optional().nullable(),
    valid_until: z.string().optional().nullable(),
    // Admin OS Phase 2 — currency + deposit share drive the
    // auto-created deposit invoice when the quote is accepted.
    currency: z.string().length(3).optional(),
    deposit_percent: z.number().int().min(0).max(100).optional(),
}).strict().passthrough();

export const getQuotations = async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT q.*,
                   l.full_name as lead_name,
                   l.email as lead_email,
                   c.name as client_name,
                   di.id AS deposit_invoice_id,
                   di.invoice_number AS deposit_invoice_number,
                   di.status AS deposit_invoice_status,
                   di.amount AS deposit_invoice_amount
            FROM quotations q
            LEFT JOIN leads l ON q.lead_id = l.id
            LEFT JOIN clients c ON q.client_id = c.id
            LEFT JOIN invoices di ON di.quotation_id = q.id
            ORDER BY q.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error('[Quotations] getQuotations error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getQuotationById = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID' });

    try {
        const { rows } = await pool.query(`
            SELECT q.*,
                   l.full_name as lead_name,
                   l.email as lead_email,
                   c.name as client_name,
                   di.id AS deposit_invoice_id,
                   di.invoice_number AS deposit_invoice_number,
                   di.status AS deposit_invoice_status,
                   di.amount AS deposit_invoice_amount
            FROM quotations q
            LEFT JOIN leads l ON q.lead_id = l.id
            LEFT JOIN clients c ON q.client_id = c.id
            LEFT JOIN invoices di ON di.quotation_id = q.id
            WHERE q.id = $1
        `, [id]);

        if (rows.length === 0) return res.status(404).json({ error: 'Quotation not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error('[Quotations] getQuotationById error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createQuotation = async (req, res) => {
    let parsed;
    try {
        parsed = createQuotationSchema.parse(req.body || {});
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors });
        }
        throw err;
    }
    const { lead_id, client_id, title, amount, line_items, notes, valid_until, currency, deposit_percent } = parsed;

    try {
        const { rows } = await pool.query(`
            INSERT INTO quotations (lead_id, client_id, title, amount, line_items, notes, valid_until, status, currency, deposit_percent)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'DRAFT', $8, $9)
            RETURNING *
        `, [
            isUuid(lead_id) ? lead_id : null,
            isUuid(client_id) ? client_id : null,
            title || 'Standard Quotation',
            amount,
            JSON.stringify(line_items || []),
            notes || '',
            valid_until || null,
            (currency || 'NGN').toUpperCase(),
            deposit_percent ?? 50
        ]);

        // Auto-update lead stage if applicable
        if (isUuid(lead_id)) {
            await pool.query(`UPDATE leads SET stage = 'PROPOSAL', updated_at = NOW() WHERE id = $1`, [lead_id]);
        }

        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('[Quotations] createQuotation error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateQuotationStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID' });
    if (!['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'CONVERTED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    // Status machine, keyed by TARGET status → the current statuses it
    // may come from. Terminal states stay terminal: ACCEPTED scope
    // changes go through change requests, CONVERTED is final, and a
    // SUPERSEDED row only moves via versioning. Enforced atomically in
    // the UPDATE's WHERE clause so two racing changes cannot both win.
    const SOURCES_FOR_TARGET = {
        DRAFT: ['DRAFT'],
        SENT: ['DRAFT', 'SENT', 'REJECTED'],
        ACCEPTED: ['DRAFT', 'SENT', 'ACCEPTED'],
        REJECTED: ['DRAFT', 'SENT', 'REJECTED'],
        CONVERTED: ['ACCEPTED', 'CONVERTED'],
    };

    try {
        // Guarded on the current status so two racing status changes
        // cannot both win.
        const { rows } = await pool.query(`
            UPDATE quotations
            SET status = $1,
                sent_at = CASE WHEN $1 = 'SENT' THEN COALESCE(sent_at, NOW()) ELSE sent_at END,
                updated_at = NOW()
            WHERE id = $2
              AND status = ANY($3::text[])
            RETURNING *
        `, [status, id, SOURCES_FOR_TARGET[status]]);

        if (rows.length === 0) {
            const { rows: current } = await pool.query(`SELECT status FROM quotations WHERE id = $1`, [id]);
            if (current.length === 0) return res.status(404).json({ error: 'Quotation not found' });
            return res.status(409).json({
                error: `Cannot move a ${current[0].status} quotation to ${status}. Accepted scope changes go through a change request; converted quotations are final.`,
            });
        }

        // Admin OS Phase 2 — acceptance kicks off the automation
        // chain (client link-up, WON lead, deposit invoice, email).
        // Idempotent: re-accepting an already-processed quote is a
        // no-op. A chain failure never blocks the status change.
        let chain = null;
        if (status === 'ACCEPTED') {
            chain = await onQuotationAccepted({
                quotationId: id,
                user: req.user,
                ipAddress: getClientIp(req),
            });
            if (!chain.ok && chain.reason === 'no_client') {
                return res.json({
                    ...rows[0],
                    chain,
                    warning: 'Quotation accepted, but no client is linked and no lead is attached — link a client to generate the deposit invoice.',
                });
            }
            // Reload — the chain links client_id / accepted_at.
            const refreshed = await pool.query(`SELECT * FROM quotations WHERE id = $1`, [id]);
            return res.json({ ...(refreshed.rows[0] || rows[0]), chain });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('[Quotations] updateQuotationStatus error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// ── Quotation versioning (blueprint §24) ─────────────────
// A version is a NEW row (V1, V2, …) sharing a root_id; the
// previous row moves to SUPERSEDED. Accepted/converted quotes are
// immutable — scope changes after acceptance belong to change
// requests (Phase 3), not silent revisions.

/**
 * GET /api/quotations/:id/versions — every version of the same
 * root, newest first (includes itself).
 */
export const getQuotationVersions = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID' });
    try {
        const { rows } = await pool.query(`
            SELECT id, version, status, amount, currency, title,
                   sent_at, accepted_at, created_at
              FROM quotations
             WHERE id = (SELECT COALESCE(root_id, id) FROM quotations WHERE id = $1)
                OR root_id = (SELECT COALESCE(root_id, id) FROM quotations WHERE id = $1)
             ORDER BY version DESC
        `, [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Quotation not found' });
        res.json(rows);
    } catch (err) {
        console.error('[Quotations] getQuotationVersions error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * POST /api/quotations/:id/new-version — clone as the next DRAFT
 * version and SUPERSEDE the current row. Only allowed while the
 * quote is still DRAFT / SENT / REJECTED.
 */
export const createQuotationVersion = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { rows: qRows } = await client.query(
            `SELECT * FROM quotations WHERE id = $1 FOR UPDATE`,
            [id]
        );
        if (qRows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Quotation not found' });
        }
        const q = qRows[0];

        if (!['DRAFT', 'SENT', 'REJECTED'].includes(q.status)) {
            await client.query('ROLLBACK');
            return res.status(409).json({
                error: `Cannot version a ${q.status} quotation. ${
                    q.status === 'ACCEPTED' || q.status === 'CONVERTED'
                        ? 'Accepted scope changes go through a change request.'
                        : ''
                }`,
            });
        }

        const rootId = q.root_id || q.id;
        const { rows: vRows } = await client.query(
            `SELECT COALESCE(MAX(version), 1) + 1 AS next_version
               FROM quotations
              WHERE id = $1 OR root_id = $1`,
            [rootId]
        );
        const nextVersion = vRows[0].next_version;

        await client.query(
            `UPDATE quotations SET status = 'SUPERSEDED', updated_at = NOW() WHERE id = $1`,
            [id]
        );

        const { rows: newRows } = await client.query(`
            INSERT INTO quotations
                (lead_id, client_id, title, amount, currency, deposit_percent,
                 line_items, notes, valid_until, status, version, root_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, 'DRAFT', $10, $11)
            RETURNING *
        `, [
            q.lead_id, q.client_id, q.title, q.amount, q.currency, q.deposit_percent,
            JSON.stringify(q.line_items || []), q.notes, q.valid_until,
            nextVersion, rootId,
        ]);

        await client.query('COMMIT');

        writeAuditLog({
            action: 'QUOTATION_VERSION_CREATED',
            entityType: 'quotations',
            entityId: newRows[0].id,
            details: { fromVersion: q.version, toVersion: nextVersion, supersededId: id, amount: Number(q.amount) },
            user: req.user,
            ipAddress: getClientIp(req),
        }).catch(() => {});

        res.status(201).json(newRows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[Quotations] createQuotationVersion error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
};

export const convertQuotationToContract = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Lock the row: two racing converts must not create two contracts.
        const { rows: qRows } = await client.query('SELECT * FROM quotations WHERE id = $1 FOR UPDATE', [id]);
        if (qRows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Quotation not found' });
        }

        const quotation = qRows[0];
        if (quotation.status !== 'ACCEPTED') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Quotation must be ACCEPTED to convert to a contract.' });
        }

        // Create the contract record. Currency is carried over from the
        // quotation — without it a USD quote silently becomes an NGN
        // contract (DB default). No terms/signing token are generated
        // here yet: the contract stays a record until the admin sends
        // it through the contract builder (portal shows it as
        // "Processing", never signable without a token).
        const { rows: cRows } = await client.query(`
            INSERT INTO contracts (client_id, quotation_id, contract_type, status, value, amount, currency, title, sent_at)
            VALUES ($1, $2, $3, $4, $5, $5, $6, $7, NOW())
            RETURNING *
        `, [
            quotation.client_id,
            quotation.id,
            'PROJECT_AGREEMENT',
            'SENT',
            quotation.amount,
            quotation.currency || 'NGN',
            quotation.title,
        ]);

        // Status-guarded flip: only an ACCEPTED row can become CONVERTED.
        const { rowCount } = await client.query(
            `UPDATE quotations SET status = 'CONVERTED', updated_at = NOW() WHERE id = $1 AND status = 'ACCEPTED'`,
            [id]
        );
        if (rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'Quotation is no longer convertible.' });
        }

        await client.query('COMMIT');

        res.json({ message: 'Successfully converted to Contract', contract: cRows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[Quotations] convertQuotationToContract error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
};
