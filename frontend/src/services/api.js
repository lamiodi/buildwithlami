// ── Centralized API Client ───────────────────────────────
// All fetch calls go through here — no more hardcoded localhost URLs.
// In dev, Vite proxies /api → backend. In production, use VITE_API_URL.

import { getAuthToken } from './auth.js';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Default request timeout (ms). Avoids hanging the UI on a dead connection.
const DEFAULT_TIMEOUT_MS = 15_000;

async function request(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const { timeout = DEFAULT_TIMEOUT_MS, token, ...rest } = options;

    // Resolve the bearer token: explicit per-request token wins, otherwise
    // fall back to the globally-stored admin token.
    const effectiveToken = token ?? getAuthToken();

    const headers = {
        'Content-Type': 'application/json',
        ...(effectiveToken ? { Authorization: `Bearer ${effectiveToken}` } : {}),
        ...(rest.headers || {}),
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const config = {
        ...rest,
        headers,
        signal: controller.signal,
    };

    try {
        return await fetch(url, config);
    } finally {
        clearTimeout(timer);
    }
}

// Normalized result shape:
//   { ok: true,  status, data }
//   { ok: false, status, error, data? }
async function parse(res) {
    let data = null;
    const text = await res.text();
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = { raw: text };
        }
    }
    if (res.ok) return { ok: true, status: res.status, data };
    const message = (data && (data.error?.message || data.message)) || res.statusText || 'Request failed';
    return { ok: false, status: res.status, error: message, data };
}

export const api = {
    /** GET — returns the parsed result envelope. */
    get: async (path, opts = {}) => {
        try {
            const res = await request(path, { method: 'GET', ...opts });
            return parse(res);
        } catch (err) {
            console.error(`[API] GET ${path} failed:`, err.message);
            return { ok: false, status: 0, error: err.name === 'AbortError' ? 'Request timed out' : err.message };
        }
    },

    /** POST — returns the parsed result envelope. */
    post: async (path, body, opts = {}) => {
        try {
            const res = await request(path, {
                method: 'POST',
                body: body !== undefined ? JSON.stringify(body) : undefined,
                ...opts,
            });
            return parse(res);
        } catch (err) {
            console.error(`[API] POST ${path} failed:`, err.message);
            return { ok: false, status: 0, error: err.name === 'AbortError' ? 'Request timed out' : err.message };
        }
    },

    put: async (path, body, opts = {}) => {
        try {
            const res = await request(path, {
                method: 'PUT',
                body: body !== undefined ? JSON.stringify(body) : undefined,
                ...opts,
            });
            return parse(res);
        } catch (err) {
            console.error(`[API] PUT ${path} failed:`, err.message);
            return { ok: false, status: 0, error: err.name === 'AbortError' ? 'Request timed out' : err.message };
        }
    },

    patch: async (path, body, opts = {}) => {
        try {
            const res = await request(path, {
                method: 'PATCH',
                body: body !== undefined ? JSON.stringify(body) : undefined,
                ...opts,
            });
            return parse(res);
        } catch (err) {
            console.error(`[API] PATCH ${path} failed:`, err.message);
            return { ok: false, status: 0, error: err.name === 'AbortError' ? 'Request timed out' : err.message };
        }
    },

    delete: async (path, opts = {}) => {
        try {
            const res = await request(path, { method: 'DELETE', ...opts });
            return parse(res);
        } catch (err) {
            console.error(`[API] DELETE ${path} failed:`, err.message);
            return { ok: false, status: 0, error: err.name === 'AbortError' ? 'Request timed out' : err.message };
        }
    },
};
