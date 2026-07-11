// ── services/fxService.js ────────────────────────────────
// Phase 11 — Live FX rate fetcher.
//
// Fetches rates from open.er-api.com (free, no API key,
// daily updates). The response format matches our fx_rates
// table exactly (1 base = X target), so we can apply
// directly. USD/EUR/GBP are extracted; other currencies are
// ignored.
//
// API: GET https://open.er-api.com/v6/latest/NGN
// Response:
//   { result: 'success', base_code: 'NGN', rates: { USD: 0.00065, ... }, time_last_update_unix: 1720000000 }
//
// The fetched rates are written to fx_rates with
// source='LIVE' and fetched_at=NOW(). Manual edits (source='MANUAL')
// are preserved if the API doesn't return a rate for that
// currency.

import pool from '../config/db.js';
import { BASE_CURRENCY, SUPPORTED_CURRENCIES } from '../utils/fx.js';

const FX_API_URL = process.env.FX_API_URL || 'https://open.er-api.com/v6/latest/NGN';
const FX_API_TIMEOUT_MS = 8000;

/**
 * Fetch live FX rates from the configured API.
 * Returns a map { USD: 0.00065, EUR: 0.00060, GBP: 0.00052 }
 * (only the supported currencies; others are filtered out).
 */
export const fetchLiveRates = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FX_API_TIMEOUT_MS);

    try {
        const res = await fetch(FX_API_URL, { signal: controller.signal });
        if (!res.ok) {
            throw new Error(`FX API responded with ${res.status}`);
        }
        const data = await res.json();

        if (data.result !== 'success') {
            throw new Error(`FX API error: ${data['error-type'] || 'unknown'}`);
        }
        if (data.base_code && data.base_code !== BASE_CURRENCY) {
            throw new Error(`FX API base is ${data.base_code}, expected ${BASE_CURRENCY}`);
        }
        if (!data.rates || typeof data.rates !== 'object') {
            throw new Error('FX API response missing rates');
        }

        // Filter to our supported currencies (skip the base NGN row,
        // skip any unknown codes, skip non-positive rates).
        const out = {};
        for (const code of SUPPORTED_CURRENCIES) {
            if (code === BASE_CURRENCY) continue;
            const v = data.rates[code];
            const num = parseFloat(v);
            if (Number.isFinite(num) && num > 0) {
                out[code] = {
                    rate: num,
                    upstream_updated_at: data.time_last_update_unix
                        ? new Date(data.time_last_update_unix * 1000).toISOString()
                        : null,
                };
            }
        }
        return { rates: out, raw: data };
    } finally {
        clearTimeout(timeoutId);
    }
};

/**
 * Apply a fresh live-rate snapshot to the database.
 * Uses an UPSERT that overwrites the rate + source + fetched_at
 * but leaves the `updated_by` field alone (it's still us, the
 * system, not a specific user). Manual edits are NOT protected
 * here — a live refresh overwrites manual rates. Use this
 * function intentionally.
 *
 * Returns the number of rows upserted.
 */
export const applyLiveRates = async (rates) => {
    const entries = Object.entries(rates);
    if (entries.length === 0) return 0;

    const client = await pool.connect();
    let count = 0;
    try {
        await client.query('BEGIN');
        for (const [code, info] of entries) {
            const r = await client.query(
                `INSERT INTO fx_rates (base_currency, target_currency, rate, source, fetched_at, updated_at)
                 VALUES ($1, $2, $3, 'LIVE', NOW(), NOW())
                 ON CONFLICT (base_currency, target_currency) DO UPDATE SET
                     rate = EXCLUDED.rate,
                     source = 'LIVE',
                     fetched_at = NOW(),
                     updated_at = NOW()
                 RETURNING target_currency`,
                [BASE_CURRENCY, code, info.rate]
            );
            count += r.rowCount;
        }
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
    return count;
};

/**
 * Refresh + apply in one call. Returns a summary the controller
 * can return to the admin UI.
 */
export const refreshAndApply = async () => {
    const { rates, raw } = await fetchLiveRates();
    const applied = await applyLiveRates(rates);
    return {
        applied_count: applied,
        currencies: Object.keys(rates),
        upstream_updated_at: raw?.time_last_update_unix
            ? new Date(raw.time_last_update_unix * 1000).toISOString()
            : null,
        fetched_at: new Date().toISOString(),
        source: 'open.er-api.com',
    };
};
