// ─── src/middlewares/authMiddleware.js ────────────────────
// Verifies the JWT from the Authorization header and
// attaches the decoded payload to `req.user`.
// ──────────────────────────────────────────────────────────

import jwt from 'jsonwebtoken';

/**
 * Protect routes — requires a valid Bearer token.
 */
export function verifyToken(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
    }

    const token = header.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, email, role, iat, exp }
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
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
