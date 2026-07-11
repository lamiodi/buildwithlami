// ── utils/fx.js ──────────────────────────────────────────
// Multi-currency conversion helpers (Phase 8).
// The system stores invoice amounts in their native currency
// (USD invoice stays USD, NGN invoice stays NGN). The
// conversion to a base currency (NGN) is a *display/reporting*
// concern — it never modifies the underlying invoice row.
//
// All amounts are returned as JS numbers (not strings) so the
// dashboard reducer can sum them safely.

import pool from '../config/db.js';

export const BASE_CURRENCY = 'NGN';

// Supported currencies shown in the create-invoice form. Keep
// in sync with the dropdown in AdminInvoices.jsx.
export const SUPPORTED_CURRENCIES = ['NGN', 'USD', 'EUR', 'GBP'];

// Symbol map for pretty display. The frontend also has its
// own map; this is used by the server-side CSV / report
// builders if any are added later.
export const CURRENCY_SYMBOLS = {
    NGN: '\u20A6', // ₦
    USD: '$',
    EUR: '\u20AC', // €
    GBP: '\u00A3', // £
};

/**
 * Look up the FX rate for a target currency (target per 1 base).
 * Returns null if no rate is configured.
 */
export async function getRate(targetCurrency) {
    if (!targetCurrency) return null;
    const code = String(targetCurrency).toUpperCase();
    if (code === BASE_CURRENCY) return 1;
    const { rows } = await pool.query(
        `SELECT rate FROM fx_rates WHERE base_currency = $1 AND target_currency = $2`,
        [BASE_CURRENCY, code]
    );
    if (rows.length === 0) return null;
    return parseFloat(rows[0].rate);
}

/**
 * Convert an amount from its native currency to NGN (base).
 * If no FX rate is found, returns null so the caller can decide
 * what to do (we never silently fall back to the original
 * amount — that would mix currencies and corrupt reports).
 */
export async function toBase(amount, fromCurrency) {
    const code = String(fromCurrency || BASE_CURRENCY).toUpperCase();
    const rate = await getRate(code);
    if (rate === null) return null;
    return Number(amount || 0) * rate;
}

/**
 * Convenience: get all current rates as a plain object:
 *   { USD: 0.00065, EUR: 0.00060, GBP: 0.00052 }
 * Used by the frontend to compute "Total Revenue (NGN equivalent)".
 * Includes `source` and `fetched_at` for the UI to show the
 * "live · 2h ago" vs. "manual · 3w ago" indicator.
 */
export async function getAllRates() {
    const { rows } = await pool.query(
        `SELECT target_currency, rate, source, fetched_at, updated_at
         FROM fx_rates
         WHERE base_currency = $1
         ORDER BY target_currency ASC`,
        [BASE_CURRENCY]
    );
    const out = {};
    for (const r of rows) {
        out[r.target_currency] = {
            rate: parseFloat(r.rate),
            source: r.source || 'MANUAL',
            fetched_at: r.fetched_at,
            updated_at: r.updated_at,
        };
    }
    return out;
}
