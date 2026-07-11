// ── controllers/fxRateController.js ──────────────────────
// Phase 8 + Phase 11 — FX rate management.
//   GET  /api/fx-rates        — list all current rates (admin auth)
//   PUT  /api/fx-rates        — bulk upsert rates (admin auth, manual)
//   POST /api/fx-rates/refresh — fetch from live API + overwrite (admin)
//
// Rates are stored as: 1 NGN = X <target>. The frontend uses
// these to display "Total Revenue (NGN equivalent)" in the
// invoices admin page.

import pool from '../config/db.js';
import { z } from 'zod';
import { getAllRates, BASE_CURRENCY, SUPPORTED_CURRENCIES } from '../utils/fx.js';
import { writeAuditLog, getClientIp } from '../utils/auditLog.js';
import { refreshAndApply } from '../services/fxService.js';

const upsertSchema = z.object({
    rates: z.record(
        z.string().length(3),            // target currency code
        z.number().positive()             // rate
    ),
});

export const listFxRates = async (_req, res) => {
    try {
        const rates = await getAllRates();
        res.json({
            base_currency: BASE_CURRENCY,
            supported: SUPPORTED_CURRENCIES,
            rates,
        });
    } catch (err) {
        console.error('[FX] listFxRates error:', err.message);
        res.status(500).json({ error: 'Failed to load FX rates.' });
    }
};

export const upsertFxRates = async (req, res) => {
    try {
        const { rates } = upsertSchema.parse(req.body);

        // Reject unknown / non-supported currencies so a typo
        // doesn't silently insert a row we'll never use.
        for (const code of Object.keys(rates)) {
            const upper = code.toUpperCase();
            if (!SUPPORTED_CURRENCIES.includes(upper)) {
                return res.status(400).json({
                    error: `Unsupported currency: ${code}. Allowed: ${SUPPORTED_CURRENCIES.join(', ')}`,
                });
            }
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const [code, rate] of Object.entries(rates)) {
                const upper = code.toUpperCase();
                await client.query(
                    `INSERT INTO fx_rates (base_currency, target_currency, rate, updated_at, updated_by)
                     VALUES ($1, $2, $3, NOW(), $4)
                     ON CONFLICT (base_currency, target_currency)
                     DO UPDATE SET rate = EXCLUDED.rate,
                                   updated_at = NOW(),
                                   updated_by = EXCLUDED.updated_by`,
                    [BASE_CURRENCY, upper, rate, req.user?.id || null]
                );
            }
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

        await writeAuditLog({
            action: 'FX_RATES_UPDATED',
            entityType: 'fx_rates',
            entityId: null,
            details: { rates },
            user: req.user,
            ipAddress: getClientIp(req),
        });

        const fresh = await getAllRates();
        res.json({
            base_currency: BASE_CURRENCY,
            supported: SUPPORTED_CURRENCIES,
            rates: fresh,
        });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[FX] upsertFxRates error:', err.message);
        res.status(500).json({ error: 'Failed to update FX rates.' });
    }
};

/**
 * POST /api/fx-rates/refresh
 * Manually trigger a live fetch from the configured FX API
 * (default: open.er-api.com) and overwrite the rates in the
 * database. Source is set to 'LIVE' with `fetched_at = NOW()`.
 *
 * Returns the refresh summary + the updated rate map.
 */
export const refreshFxRates = async (req, res) => {
    try {
        const summary = await refreshAndApply();
        await writeAuditLog({
            action: 'FX_RATES_LIVE_REFRESH',
            entityType: 'fx_rates',
            entityId: null,
            details: summary,
            user: req.user,
            ipAddress: getClientIp(req),
        });
        const fresh = await getAllRates();
        res.json({
            base_currency: BASE_CURRENCY,
            supported: SUPPORTED_CURRENCIES,
            rates: fresh,
            refresh: summary,
        });
    } catch (err) {
        console.error('[FX] refreshFxRates error:', err.message);
        res.status(502).json({
            error: `Live FX refresh failed: ${err.message}. Your existing rates are unchanged.`,
        });
    }
};
