// ─── Centralized API Client ───────────────────────────────
// All fetch calls go through here — no more hardcoded localhost URLs.
//
// Routing:
//   - In dev:        Vite proxies /api → the backend (see vite.config.js).
//   - In production: Vercel rewrites /api/* → Render (see vercel.json).
//
// In both cases the frontend uses a SAME-ORIGIN path (/api/...) which
// means the HttpOnly `access_token` cookie is treated as a first-party
// cookie by the browser. Going cross-origin to onrender.com directly
// caused the cookie to be silently dropped by modern browsers' third-
// party cookie protections, which surfaced as 401s on every admin
// endpoint after a successful login.
//
// Authentication model (see docs/AUTH_MODEL.md):
//   * Admin  → Authorization: Bearer <adminToken>  (primary)
//              + `access_token`  HttpOnly cookie  (same-origin helper)
//   * Client → Authorization: Bearer <clientToken> (primary, REQUIRED)
//              + `client_token`  HttpOnly cookie  (same-origin helper)
//
// We send BOTH the Bearer header and the cookie. The header is the
// authoritative credential; the cookie is a same-origin convenience so
// direct browser navigation to /admin/... still works. Cross-origin
// callers (none expected) would need the Bearer header.
// ────────────────────────────────────────────────────────────

// Only honour VITE_API_URL if it points to the same origin (relative
// path) or to a localhost address (local dev convenience). An absolute
// URL pointing to a remote host (e.g. https://buildwithlami.onrender.com/api)
// would force every request to be cross-origin and re-introduce the
// third-party cookie problem — browsers silently drop the HttpOnly
// `access_token` cookie, and every admin endpoint returns 401.
//
// Fall back to '/api' so the Vercel rewrite (vercel.json) handles
// routing and the cookie stays first-party.
const API_BASE = (() => {
    const env = import.meta.env.VITE_API_URL;
    if (!env) return '/api';
    if (env.startsWith('/')) return env;
    try {
        const u = new URL(env);
        if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return env;
    } catch {
        // Malformed — fall through to the default below.
    }
    return '/api';
})();

// Default request timeout (ms). Avoids hanging the UI on a dead connection.
const DEFAULT_TIMEOUT_MS = 15_000;

// ── Token storage ─────────────────────────────────────────
// We deliberately read tokens from localStorage (set by the
// AuthContext / ClientAuthContext). They are returned in JSON
// responses by /auth/login and /client-auth/login respectively.
// localStorage is acceptable here because:
//   1. The cookie + SameSite=Strict already defends against CSRF.
//   2. The frontend is a single-page app; XSS would already be
//      catastrophic and is mitigated by React + DOMPurify.
//   3. Keeping a JS-accessible token lets us send it in the
//      Authorization header (the authoritative credential).
const getAdminToken = () => {
    try { return localStorage.getItem('admin_token') || null; } catch { return null; }
};
const getClientToken = () => {
    try { return localStorage.getItem('client_token') || null; } catch { return null; }
};

function formatEndpoint(path) {
    if (!path) return API_BASE;
    if (path.startsWith('/api/')) return `${API_BASE}${path.slice(4)}`;
    if (path === '/api') return API_BASE;
    return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Build request config with timeout, credentials, and the appropriate
 * Bearer token. `auth` controls which token is attached:
 *   'admin'  → admin token (default)
 *   'client' → client token
 *   'none'   → public endpoint, no token
 */
function buildConfig(options, { auth = 'admin' } = {}) {
    const internalController = new AbortController();
    const timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;
    const timer = setTimeout(() => internalController.abort(), timeout);

    if (options.signal) {
        if (options.signal.aborted) {
            internalController.abort();
        } else {
            options.signal.addEventListener('abort', () => internalController.abort(), { once: true });
        }
    }

    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers || {}),
    };
    if (isFormData && headers['Content-Type']) {
        delete headers['Content-Type']; // Let browser set multipart boundary
    }

    if (auth === 'admin') {
        const token = getAdminToken();
        if (token) headers.Authorization = `Bearer ${token}`;
    } else if (auth === 'client') {
        const token = getClientToken();
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
        credentials: 'include', // Send the HttpOnly cookie too
        signal: internalController.signal,
    };

    return { config, timer, internalController };
}

const prepareBody = (body) => {
    if (body === undefined) return undefined;
    if (typeof FormData !== 'undefined' && body instanceof FormData) return body;
    return typeof body === 'string' ? body : JSON.stringify(body);
};

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
    let message = (data && (data.error?.message || data.message)) || res.statusText || 'Request failed';
    // 413 — Payload Too Large. Express' built-in body parser emits a
    // generic "request entity too large" message. Replace it with an
    // explicit, human-readable string the UI can show verbatim.
    if (res.status === 413) {
        message = 'The file you selected is too large. Please pick a smaller file (max 25 MB) and try again.';
    }
    return { ok: false, status: res.status, error: message, data };
}

async function request(path, options = {}, { auth = 'admin' } = {}) {
    const url = formatEndpoint(path);
    const { config, timer } = buildConfig(options, { auth });

    try {
        return await fetch(url, config);
    } finally {
        clearTimeout(timer);
    }
}

export const api = {
    /** Initialize API client — kept for backwards compatibility. */
    async init() { return; },

    /** GET — returns the parsed result envelope. */
    get: async (path, opts = {}, auth = 'admin') => {
        try {
            const res = await request(path, { method: 'GET', ...opts }, { auth });
            return parse(res);
        } catch (err) {
            console.error(`[API] GET ${path} failed:`, err.message);
            return { ok: false, status: 0, error: err.name === 'AbortError' ? 'Request timed out' : err.message };
        }
    },

    /** POST — returns the parsed result envelope. */
    post: async (path, body, opts = {}, auth = 'admin') => {
        try {
            const res = await request(path, {
                method: 'POST',
                body: prepareBody(body),
                ...opts,
            }, { auth });
            return parse(res);
        } catch (err) {
            console.error(`[API] POST ${path} failed:`, err.message);
            return { ok: false, status: 0, error: err.name === 'AbortError' ? 'Request timed out' : err.message };
        }
    },

    put: async (path, body, opts = {}, auth = 'admin') => {
        try {
            const res = await request(path, {
                method: 'PUT',
                body: prepareBody(body),
                ...opts,
            }, { auth });
            return parse(res);
        } catch (err) {
            console.error(`[API] PUT ${path} failed:`, err.message);
            return { ok: false, status: 0, error: err.name === 'AbortError' ? 'Request timed out' : err.message };
        }
    },

    patch: async (path, body, opts = {}, auth = 'admin') => {
        try {
            const res = await request(path, {
                method: 'PATCH',
                body: prepareBody(body),
                ...opts,
            }, { auth });
            return parse(res);
        } catch (err) {
            console.error(`[API] PATCH ${path} failed:`, err.message);
            return { ok: false, status: 0, error: err.name === 'AbortError' ? 'Request timed out' : err.message };
        }
    },

    delete: async (path, opts = {}, auth = 'admin') => {
        try {
            const res = await request(path, { method: 'DELETE', ...opts }, { auth });
            return parse(res);
        } catch (err) {
            console.error(`[API] DELETE ${path} failed:`, err.message);
            return { ok: false, status: 0, error: err.name === 'AbortError' ? 'Request timed out' : err.message };
        }
    },

    /**
     * Multipart upload — sends a single `file` field. Used by the
     * portfolio image picker and the admin upload route.
     * The Content-Type header is intentionally left unset so the browser
     * generates the correct multipart boundary.
     *
     * Recognises HTTP 413 (Payload Too Large) so the UI can show a
     * clear, actionable error instead of a generic failure.
     */
    upload: async (path, file, { auth = 'admin' } = {}) => {
        try {
            const form = new FormData();
            form.append('image', file);

            const headers = {};
            if (auth === 'admin') {
                const token = getAdminToken();
                if (token) headers.Authorization = `Bearer ${token}`;
            } else if (auth === 'client') {
                const token = getClientToken();
                if (token) headers.Authorization = `Bearer ${token}`;
            }

            const res = await fetch(formatEndpoint(path), {
                method: 'POST',
                credentials: 'include',
                headers,
                body: form,
            });

            return parse(res);
        } catch (err) {
            console.error(`[API] UPLOAD ${path} failed:`, err.message);
            return { ok: false, status: 0, error: err.name === 'AbortError' ? 'Request timed out' : err.message };
        }
    },
};
