// ─── Centralized API Client ───────────────────────────────
// All fetch calls go through here — no more hardcoded localhost URLs.
// In dev, Vite proxies /api → backend. In production, use VITE_API_URL.
//
// Cookies (JWT + CSRF) are sent automatically with credentials: 'include'.
// CSRF token is fetched from /api/csrf-token on app init and cached.
// ────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Default request timeout (ms). Avoids hanging the UI on a dead connection.
const DEFAULT_TIMEOUT_MS = 15_000;

// Cache for CSRF token
let csrfTokenCache = null;
let csrfTokenPromise = null;

/**
 * Fetch CSRF token from backend. Called on app initialization.
 * Token is cached and refreshed on 403 errors.
 */
async function getCsrfToken() {
    if (csrfTokenCache) return csrfTokenCache;
    
    if (csrfTokenPromise) return csrfTokenPromise;
    
    csrfTokenPromise = (async () => {
        try {
            const res = await fetch(`${API_BASE}/csrf-token`, {
                method: 'GET',
                credentials: 'include', // Important: send/receive cookies
            });
            if (res.ok) {
                const data = await res.json();
                csrfTokenCache = data.csrfToken;
                return csrfTokenCache;
            }
        } catch (err) {
            console.warn('[API] Failed to fetch CSRF token:', err.message);
        }
        return null;
    })();
    
    return csrfTokenPromise;
}

/**
 * Clear cached CSRF token (e.g., after logout or 403)
 */
function clearCsrfToken() {
    csrfTokenCache = null;
    csrfTokenPromise = null;
}

/**
 * Build request config with timeout, credentials, and CSRF token
 */
function buildConfig(options, needsCsrf = false) {
    // The client may pass its own AbortController (for request
    // cancellation on every-new-keystroke search inputs). Chain
    // the caller's signal with the timeout signal so aborting
    // either side still cancels the request.
    const internalController = new AbortController();
    const timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;
    const timer = setTimeout(() => internalController.abort(), timeout);

    if (options.signal) {
        // If the caller already aborted before we even got here,
        // propagate immediately.
        if (options.signal.aborted) {
            internalController.abort();
        } else {
            options.signal.addEventListener('abort', () => internalController.abort(), { once: true });
        }
    }

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    // Add CSRF token for mutating requests
    if (needsCsrf && csrfTokenCache) {
        headers['X-CSRF-Token'] = csrfTokenCache;
    }

    const config = {
        ...options,
        headers,
        credentials: 'include', // Send cookies with every request
        signal: internalController.signal,
    };

    return { config, timer, internalController };
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

async function request(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const method = (options.method || 'GET').toUpperCase();
    const needsCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    
    // Ensure CSRF token is available for mutating requests
    if (needsCsrf && !csrfTokenCache) {
        await getCsrfToken();
    }

    const { config, timer } = buildConfig(options, needsCsrf);

    try {
        return await fetch(url, config);
    } finally {
        clearTimeout(timer);
    }
}

export const api = {
    /** Initialize API client - fetch CSRF token on app start */
    async init() {
        await getCsrfToken();
    },

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
            // If 403, clear CSRF token and retry once
            if (res.status === 403) {
                clearCsrfToken();
                await getCsrfToken();
                const retryRes = await request(path, {
                    method: 'POST',
                    body: body !== undefined ? JSON.stringify(body) : undefined,
                    ...opts,
                });
                return parse(retryRes);
            }
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
            if (res.status === 403) {
                clearCsrfToken();
                await getCsrfToken();
                const retryRes = await request(path, {
                    method: 'PUT',
                    body: body !== undefined ? JSON.stringify(body) : undefined,
                    ...opts,
                });
                return parse(retryRes);
            }
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
            if (res.status === 403) {
                clearCsrfToken();
                await getCsrfToken();
                const retryRes = await request(path, {
                    method: 'PATCH',
                    body: body !== undefined ? JSON.stringify(body) : undefined,
                    ...opts,
                });
                return parse(retryRes);
            }
            return parse(res);
        } catch (err) {
            console.error(`[API] PATCH ${path} failed:`, err.message);
            return { ok: false, status: 0, error: err.name === 'AbortError' ? 'Request timed out' : err.message };
        }
    },

    delete: async (path, opts = {}) => {
        try {
            const res = await request(path, { method: 'DELETE', ...opts });
            if (res.status === 403) {
                clearCsrfToken();
                await getCsrfToken();
                const retryRes = await request(path, { method: 'DELETE', ...opts });
                return parse(retryRes);
            }
            return parse(res);
        } catch (err) {
            console.error(`[API] DELETE ${path} failed:`, err.message);
            return { ok: false, status: 0, error: err.name === 'AbortError' ? 'Request timed out' : err.message };
        }
    },

    /**
     * Multipart upload — sends a single `file` field. Used by the
     * CMS hero-image picker and the testimonial avatar picker.
     * The Content-Type header is intentionally left unset so the browser
     * generates the correct multipart boundary.
     */
    upload: async (path, file, opts = {}) => {
        try {
            const form = new FormData();
            form.append('image', file);
            
            // Get CSRF token for upload
            if (!csrfTokenCache) await getCsrfToken();
            
            const res = await fetch(`${API_BASE}${path}`, {
                method: 'POST',
                credentials: 'include', // Send cookies
                headers: csrfTokenCache ? { 'X-CSRF-Token': csrfTokenCache } : {},
                body: form,
            });
            return parse(res);
        } catch (err) {
            console.error(`[API] UPLOAD ${path} failed:`, err.message);
            return { ok: false, status: 0, error: err.name === 'AbortError' ? 'Request timed out' : err.message };
        }
    },
};