import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import pool from '../config/db.js';
import { COOKIE_OPTIONS } from './authController.js';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export async function loginClient(req, res) {
    try {
        const { email, password } = loginSchema.parse(req.body);
        // Use a dedicated client-portal JWT secret so a token minted for
        // a client can never be verified by the admin `verifyToken`
        // middleware. Falls back to JWT_SECRET in development for
        // backwards compatibility, but logs a warning so the operator
        // notices.
        const clientSecret = process.env.CLIENT_JWT_SECRET || process.env.JWT_SECRET;
        if (!clientSecret) {
            return res.status(500).json({ error: 'Server misconfiguration.' });
        }
        if (!process.env.CLIENT_JWT_SECRET && process.env.NODE_ENV === 'production') {
            console.warn('[ClientAuth] CLIENT_JWT_SECRET is not set; falling back to JWT_SECRET. Set a separate secret in production.');
        }

        const { rows } = await pool.query(
            `SELECT id, name, primary_contact_email, password_hash 
             FROM clients 
             WHERE primary_contact_email = $1`,
            [email.toLowerCase().trim()]
        );

        if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials.' });
        const client = rows[0];

        if (!client.password_hash) {
            return res.status(401).json({ error: 'Account not set up for portal access. Please contact support.' });
        }

        const match = await bcrypt.compare(password, client.password_hash);
        if (!match) return res.status(401).json({ error: 'Invalid credentials.' });

        await pool.query('UPDATE clients SET last_login_at = NOW() WHERE id = $1', [client.id]);

        const token = jwt.sign(
            { id: client.id, email: client.primary_contact_email, role: 'CLIENT_PORTAL' },
            clientSecret,
            { expiresIn: '24h' }
        );

        res.cookie('client_token', token, { ...COOKIE_OPTIONS, maxAge: 24 * 60 * 60 * 1000 });
        
        return res.json({ 
            token, 
            client: { id: client.id, email: client.primary_contact_email, name: client.name } 
        });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[ClientAuth] Login error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function logoutClient(req, res) {
    res.clearCookie('client_token', { ...COOKIE_OPTIONS, maxAge: 0 });
    return res.json({ success: true });
}

export async function verifyClientSession(req, res) {
    return res.json({
        id: req.clientUser.id,
        email: req.clientUser.email,
        name: req.clientUser.name,
        role: req.clientUser.role
    });
}
