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

    const baseSecret = process.env.JWT_SECRET;
    if (!baseSecret) {
        console.error('[ClientAuth] JWT_SECRET is not configured.');
        return res.status(500).json({ error: 'Internal server error.' });
    }

    try {
        const verified = jwt.verify(token, baseSecret);

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
