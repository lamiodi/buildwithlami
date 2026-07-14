// ─── src/controllers/exportController.js ────────────────
// Streaming CSV export endpoint. Uses pg-query-stream so
// the entire result set is never loaded into memory at once
// — even for 50,000+ rows, the server RAM stays flat.
// ──────────────────────────────────────────────────────────

import pool from '../config/db.js';
import QueryStream from 'pg-query-stream';

/**
 * Escape a value for CSV output. RFC 4180:
 *   - always wrap in double quotes
 *   - double any embedded quotes
 *   - replace nulls/undefined with empty string
 */
function csvCell(v) {
    if (v === null || v === undefined) return '""';
    const s = String(v);
    return `"${s.replace(/"/g, '""')}"`;
}

function csvRow(values) {
    return values.map(csvCell).join(',') + '\r\n';
}

/**
 * Stream a CSV from a SQL query.
 *
 * @param {Object} args
 * @param {import('pg').PoolClient} args.client - already-acquired pool client
 * @param {string} args.sql - the query to run
 * @param {Array} args.params - parameter array for the query
 * @param {string[]} args.columns - column headers in the order you want them
 * @param {import('express').Response} args.res - the response to stream into
 * @param {number} args.batchSize - rows per fetch (default 500)
 */
async function streamQueryAsCSV({ client, sql, params = [], columns, res, batchSize = 500 }) {
    const qs = new QueryStream(sql, params, { batchSize });
    const stream = client.query(qs);

    // Send headers immediately (chunked transfer encoding)
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="export-${Date.now()}.csv"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Header row
    res.write(csvRow(columns));

    return new Promise((resolve, reject) => {
        stream.on('data', (row) => {
            res.write(csvRow(columns.map((c) => row[c])));
        });
        stream.on('end', () => {
            res.end();
            resolve();
        });
        stream.on('error', (err) => {
            // We can't change the response status now (we already
            // wrote 200 OK headers), so just log and abort the
            // stream. The client will see a truncated CSV.
            console.error('[Export] stream error:', err.message);
            res.destroy(err);
            reject(err);
        });
    });
}

// ── /api/admin/export/clients ────────────────────────────
export const exportClients = async (req, res, next) => {
    const client = await pool.connect();
    try {
        await streamQueryAsCSV({
            client,
            sql: 'SELECT id, name, primary_contact_email, billing_email, phone, division, notes, created_at FROM clients ORDER BY created_at DESC',
            columns: ['id', 'name', 'primary_contact_email', 'billing_email', 'phone', 'division', 'notes', 'created_at'],
            res,
        });
    } catch (err) {
        next(err);
    } finally {
        client.release();
    }
};

// ── /api/admin/export/invoices ───────────────────────────
export const exportInvoices = async (req, res, next) => {
    const client = await pool.connect();
    try {
        await streamQueryAsCSV({
            client,
            sql: `SELECT i.id, c.name AS client_name, i.amount, i.currency,
                         i.status, i.due_date, i.paid_at, i.created_at
                    FROM invoices i
                    LEFT JOIN clients c ON c.id = i.client_id
                   ORDER BY i.created_at DESC`,
            columns: ['id', 'client_name', 'amount', 'currency', 'status', 'due_date', 'paid_at', 'created_at'],
            res,
        });
    } catch (err) {
        next(err);
    } finally {
        client.release();
    }
};

// ── /api/admin/export/projects ───────────────────────────
export const exportProjects = async (req, res, next) => {
    const client = await pool.connect();
    try {
        await streamQueryAsCSV({
            client,
            sql: 'SELECT id, title, division, status, category, published_at, created_at FROM projects ORDER BY created_at DESC',
            columns: ['id', 'title', 'division', 'status', 'category', 'published_at', 'created_at'],
            res,
        });
    } catch (err) {
        next(err);
    } finally {
        client.release();
    }
};

// ── /api/admin/export/feedback ───────────────────────────
export const exportFeedback = async (req, res, next) => {
    const client = await pool.connect();
    try {
        await streamQueryAsCSV({
            client,
            sql: 'SELECT id, client_name, client_email, rating, client_comment, status, created_at FROM project_feedback ORDER BY created_at DESC',
            columns: ['id', 'client_name', 'client_email', 'rating', 'client_comment', 'status', 'created_at'],
            res,
        });
    } catch (err) {
        next(err);
    } finally {
        client.release();
    }
};
