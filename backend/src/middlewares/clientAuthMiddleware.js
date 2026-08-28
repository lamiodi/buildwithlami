import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

function extractClientToken(req) {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) return header.split(' ')[1];
    
    if (req.cookies && req.cookies.client_token) {
        return req.cookies.client_token;
    }
    return null;
}

export async function verifyClientToken(req, res, next) {
    const token = extractClientToken(req);

    if (!token) {
        return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
    }

    // Use the dedicated CLIENT_JWT_SECRET so admin tokens (signed
    // with JWT_SECRET) cannot be replayed against the client portal.
    // Falls back to JWT_SECRET in dev for backwards compatibility.
    const clientSecret = process.env.CLIENT_JWT_SECRET || process.env.JWT_SECRET;
    if (!clientSecret) {
        console.error('[ClientAuth] CLIENT_JWT_SECRET / JWT_SECRET is not configured.');
        return res.status(500).json({ error: 'Internal server error.' });
    }

    try {
        const verified = jwt.verify(token, clientSecret);

        if (verified.role !== 'CLIENT_PORTAL' || !verified.id) {
            return res.status(401).json({ error: 'Invalid client token.' });
        }

        // Optional: Ensure the client still exists in DB and get their name
        const { rows } = await pool.query('SELECT name FROM clients WHERE id = $1', [verified.id]);
        if (rows.length === 0) {
             return res.status(401).json({ error: 'Client account no longer exists.' });
        }

        req.clientUser = {
            id: verified.id,
            email: verified.email,
            name: rows[0].name,
            role: verified.role
        };

        return next();
    } catch (_err) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
}
