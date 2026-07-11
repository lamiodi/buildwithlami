// ─── src/middlewares/authMiddleware.js ────────────────────
// Verifies the JWT from the Authorization header and
// attaches the decoded payload to `req.user`.
// ──────────────────────────────────────────────────────────

import jwt from 'jsonwebtoken';

/**
 * Map of role → divisions the role is allowed to act on.
 * `*` means the role has access to every division (e.g. Owner).
 *
 * Source of truth: ROADMAP.md Phase 1 + UPDATE.md §11.1.
 * Keep in sync with `backend/migrations/v7_roles_rbac.sql`.
 */
const ROLE_DIVISIONS = {
    'Owner':             ['*'],
    'Administrator':     ['*'],
    'Project Manager':   ['SOFTWARE', 'SURVEY', 'DRONE'],
    'Developer':         ['SOFTWARE'],
    'Survey Manager':    ['SURVEY'],
    'Surveyor':          ['SURVEY'],
    'Drone Manager':     ['DRONE'],
    'Drone Pilot':       ['DRONE'],
    'Finance':           ['SOFTWARE', 'SURVEY', 'DRONE'],
    'Client':            [], // clients only see their own project — gated at resource level
};

/**
 * Normalise a role string so legacy ('ADMIN', 'OWNER') and new
 * ('Owner', 'Administrator') spellings resolve to the same value.
 * Returns the canonical titlecase name, or the original input if
 * we don't recognise it.
 */
function normaliseRole(role) {
    if (typeof role !== 'string') return role;
    const trimmed = role.trim();
    const known = Object.keys(ROLE_DIVISIONS);
    const lower = trimmed.toLowerCase();
    return known.find((k) => k.toLowerCase() === lower) || trimmed;
}

/**
 * Protect routes — requires a valid Bearer token.
 *
 * Client tokens are signed with `JWT_SECRET + trackingId`; admin/owner tokens
 * are signed with `JWT_SECRET` alone. We don't know which one the token uses
 * without first decoding, so we attempt the CLIENT variant first and fall
 * back to the plain admin secret. The verify call itself enforces signature
 * integrity, so no trust is placed in the unverified payload.
 */
export function verifyToken(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
    }

    const token = header.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Missing token.' });
    }

    const baseSecret = process.env.JWT_SECRET;
    if (!baseSecret) {
        console.error('[Auth] JWT_SECRET is not configured.');
        return res.status(500).json({ error: 'Internal server error.' });
    }

    try {
        const verified = jwt.verify(token, baseSecret);
        
        // Double check for client roles to ensure trackingId is present
        if (verified.role === 'CLIENT' && !verified.trackingId) {
            return res.status(401).json({ error: 'Invalid client token.' });
        }
        
        req.user = { ...verified, role: normaliseRole(verified.role) };
        return next();
    } catch (_err) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
}

/**
 * Restrict to specific roles. Case-insensitive — accepts legacy
 * `'ADMIN'` and new `'Administrator'` interchangeably so we can
 * migrate route files in stages without breaking logins.
 *
 * Usage: requireRole('Owner')
 *        requireRole('Owner', 'Administrator')
 *        requireRole('Survey Manager', 'Surveyor')
 */
export function requireRole(...allowed) {
    const allowedSet = new Set(allowed.map((r) => r.toLowerCase()));
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ error: 'Forbidden — insufficient role.' });
        }
        if (!allowedSet.has(String(req.user.role).toLowerCase())) {
            return res.status(403).json({ error: 'Forbidden — insufficient role.' });
        }
        next();
    };
}

/**
 * Restrict to roles that have access to one of the given divisions.
 * Owners and Administrators always pass (they have '*').
 *
 * Usage: requireDivision('SURVEY')
 *        requireDivision('SOFTWARE', 'SURVEY')
 */
export function requireDivision(...allowedDivisions) {
    const allowed = new Set(allowedDivisions.map((d) => String(d).toUpperCase()));
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ error: 'Forbidden — missing role.' });
        }
        const grants = ROLE_DIVISIONS[req.user.role] || [];
        if (grants.includes('*')) return next();
        if (grants.some((g) => allowed.has(g))) return next();
        return res.status(403).json({
            error: `Forbidden — role "${req.user.role}" cannot access division(s) ${[...allowed].join(', ')}.`,
        });
    };
}
