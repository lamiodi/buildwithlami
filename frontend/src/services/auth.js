// ─── Auth Service ─────────────────────────────────────────
// JWT is now stored in HttpOnly cookie (set by backend).
// This service is kept for backward compatibility but no longer
// stores tokens in localStorage (XSS-vulnerable).
//
// The token retrieval functions now return null since the cookie
// is HttpOnly and cannot be read by JavaScript. Authentication
// state is managed via /api/auth/me in AuthContext.
// ──────────────────────────────────────────────────────────

const USER_KEY = 'adminUser';

/**
 * @deprecated Tokens are now in HttpOnly cookies.
 * Returns null - the cookie is HttpOnly and not accessible to JS.
 */
export function getAuthToken() {
    return null;
}

/**
 * @deprecated Tokens are now in HttpOnly cookies.
 * Token storage is a no-op. Only user data is persisted.
 */
export function setAuthToken(token, user) {
    if (user) {
        try {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        } catch {
            /* ignore quota errors */
        }
    }
}

/**
 * Get cached user from localStorage.
 * Used for optimistic UI rendering before /auth/me completes.
 */
export function getAuthUser() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/**
 * Clear cached user data.
 * The HttpOnly cookie is cleared by the backend on logout.
 */
export function clearAuth() {
    localStorage.removeItem(USER_KEY);
}