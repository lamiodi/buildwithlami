// ── Auth Token Storage ─────────────────────────────────
// Persists the admin JWT in localStorage so it survives page reloads.
// Exposes a small setter/getter/clearer API; the api client reads
// from here on every request to attach the Authorization header.

const TOKEN_KEY = 'adminToken';
const USER_KEY = 'adminUser';

export function setAuthToken(token, user) {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    }
    if (user) {
        try {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        } catch {
            /* ignore quota errors */
        }
    }
}

export function getAuthToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function getAuthUser() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}
