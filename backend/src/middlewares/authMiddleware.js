// ─── src/middlewares/authMiddleware.js ────────────────────
// Verifies the JWT from the Authorization header and
// attaches the decoded payload to `req.user`.
// ──────────────────────────────────────────────────────────

import jwt from 'jsonwebtoken';

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

    // Try the plain admin/owner secret first (most common case).
    try {
        const verified = jwt.verify(token, baseSecret);
        req.user = verified;
        return next();
    } catch (_err) {
        // Fall through to client-secret variants below.
    }

    // For client tokens we don't know the trackingId without decoding.
    // Decode WITHOUT verifying (this is safe — we never trust unverified data;
    // we only use the claimed trackingId to construct the candidate secret).
    const unverified = jwt.decode(token);
    if (unverified && unverified.role === 'CLIENT' && unverified.trackingId) {
        try {
            const verified = jwt.verify(token, baseSecret + unverified.trackingId);
            req.user = verified;
            return next();
        } catch (_err) {
            // fall through
        }
    }

    return res.status(401).json({ error: 'Invalid or expired token.' });
}

/**
 * Restrict to specific roles.
 * Usage: requireRole('ADMIN') or requireRole('ADMIN', 'SUPER_ADMIN')
 */
export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden — insufficient role.' });
        }
        next();
    };
}
