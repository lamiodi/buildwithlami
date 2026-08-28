// ─── src/middlewares/authMiddleware.js ────────────────────
// Verifies the JWT from the Authorization header OR HttpOnly cookie
// and attaches the decoded payload to `req.user`.
// ──────────────────────────────────────────────────────────

import jwt from 'jsonwebtoken';
import { ROLE_DIVISIONS, canonicalRole } from '../config/roles.js';

/**
 * Extract JWT from request - checks Authorization header first,
 * then falls back to HttpOnly cookie (for browser clients).
 */
function extractToken(req) {
    // 1. Check Authorization header (for API clients, mobile apps)
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
        return header.split(' ')[1];
    }
    
    // 2. Check HttpOnly cookie (for browser clients)
    if (req.cookies && req.cookies.access_token) {
        return req.cookies.access_token;
    }
    
    return null;
}

/**
 * Protect routes — requires a valid JWT from header or cookie.
 *
 * All tokens (admin/owner/client) are signed with the single `JWT_SECRET`.
 * The `role` and (for clients) `trackingId` claims are part of the signed
 * payload, so we read them only after `jwt.verify()` succeeds. No trust is
 * placed in any data decoded before signature verification.
 */
export function verifyToken(req, res, next) {
    const token = extractToken(req);

    if (!token) {
        return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
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

        req.user = { ...verified, role: canonicalRole(verified.role) };
        return next();
    } catch (_err) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
}

/**
 * Restrict to specific roles. Case-insensitive — accepts legacy
 * `'ADMIN'` and the canonical `'Owner'` interchangeably so any
 * un-migrated JWT or DB row still passes.
 *
 * In Buildwith_lami's one-man studio the only admin role is `'Owner'`,
 * and clients authenticate into the separate `/portal` surface via
 * `verifyClientToken` instead of this middleware. New routes should
 * always call `requireRole('Owner')` (or `requireRole('Owner', 'Client')`
 * if a client is also allowed to hit the endpoint).
 *
 * Usage: requireRole('Owner')
 *        requireRole('Owner', 'Client')
 */
export function requireRole(...allowed) {
    const flatAllowed = allowed.flat();
    const allowedSet = new Set(flatAllowed.map((r) => String(r).toLowerCase()));
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
 * `Owner` always passes (granted `'*'` in `ROLE_DIVISIONS`).
 *
 * NOTE: Buildwith_lami is a one-man studio, so in practice the only
 * role that can reach this middleware is `Owner`, and `Owner` always
 * passes. The per-division router in `routes/divisionRoutes.js`
 * is still useful for keeping the URL surface clean — the gate is
 * defence-in-depth, not a hard restriction.
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
