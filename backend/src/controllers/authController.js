import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import pool from '../config/db.js';

// ── Validation Schemas ───────────────────────────────────
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

// ── Owner Login ──────────────────────────────────────────
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

// ── Change Password ──────────────────────────────────────
const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
});

export async function changePassword(req, res) {
    try {
        const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

        const { rows } = await pool.query(
            `SELECT password FROM users WHERE id = $1`,
            [req.user.id],
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const match = await bcrypt.compare(currentPassword, rows[0].password);
        if (!match) {
            return res.status(401).json({ error: 'Current password is incorrect.' });
        }

        const hash = await bcrypt.hash(newPassword, 12);
        await pool.query(
            `UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2`,
            [hash, req.user.id],
        );

        return res.json({ message: 'Password changed successfully.' });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors });
        }
        console.error('[Auth] changePassword error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── Verify Current Session ───────────────────────────────
// Called by the frontend ProtectedRoute to check if the
// admin's JWT is still valid before rendering admin pages.
export async function getMe(req, res) {
    // req.user is set by the verifyToken middleware
    return res.json({ id: req.user.id, email: req.user.email, role: req.user.role });
}
