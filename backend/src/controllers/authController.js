// ─── src/controllers/authController.js ───────────────────
// Handles admin login, magic-link generation for clients,
// and magic-link verification — all via raw SQL.
// ──────────────────────────────────────────────────────────

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import pool from '../config/db.js';

// ── Validation Schemas ───────────────────────────────────
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

const magicLinkRequestSchema = z.object({
    email: z.string().email(),
});

const magicLinkVerifySchema = z.object({
    token: z.string().min(1),
});

// ── Admin Login ──────────────────────────────────────────
export async function login(req, res) {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const { rows } = await pool.query(
            `SELECT id, email, password, role FROM users WHERE email = $1`,
            [email],
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const user = rows[0];

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
        );

        return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors });
        }
        console.error('[Auth] Login error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Generate Magic Link ──────────────────────────────────
export async function generateMagicLink(req, res) {
    try {
        const { email } = magicLinkRequestSchema.parse(req.body);

        const { rows } = await pool.query(
            `SELECT id FROM clients WHERE email = $1`,
            [email],
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No client found with that email.' });
        }

        const token = crypto.randomBytes(48).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await pool.query(
            `UPDATE clients
       SET magic_link_token = $1, magic_link_expires = $2, updated_at = NOW()
       WHERE email = $3`,
            [token, expires, email],
        );

        const link = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;
        console.log(`[Auth] Magic link for ${email}: ${link}`);

        return res.json({ message: 'Magic link generated.', link });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors });
        }
        console.error('[Auth] Magic-link generation error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Verify Magic Link ────────────────────────────────────
export async function verifyMagicLink(req, res) {
    try {
        const { token } = magicLinkVerifySchema.parse(req.query);

        const { rows } = await pool.query(
            `SELECT id, full_name, email, phone, magic_link_expires
       FROM clients WHERE magic_link_token = $1`,
            [token],
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid or expired magic link.' });
        }

        const client = rows[0];

        // Enforce time-based expiry
        if (!client.magic_link_expires || new Date() > new Date(client.magic_link_expires)) {
            await pool.query(
                `UPDATE clients SET magic_link_token = NULL, magic_link_expires = NULL, updated_at = NOW() WHERE id = $1`,
                [client.id],
            );
            return res.status(401).json({
                error: 'Magic link has expired. Please request a new one.',
            });
        }

        // Invalidate after use (one-time link)
        await pool.query(
            `UPDATE clients SET magic_link_token = NULL, magic_link_expires = NULL, updated_at = NOW() WHERE id = $1`,
            [client.id],
        );

        const jwtToken = jwt.sign(
            { id: client.id, email: client.email, role: 'CLIENT' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
        );

        return res.json({
            token: jwtToken,
            client: { id: client.id, full_name: client.full_name, email: client.email, phone: client.phone },
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors });
        }
        console.error('[Auth] Magic-link verify error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
