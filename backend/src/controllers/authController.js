import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import pool from '../config/db.js';
import { canonicalRole, divisionsForRole } from '../config/roles.js';

// Cookie options for HttpOnly JWT cookie
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 60 * 1000, // 30 minutes (matches JWT_EXPIRES_IN)
    path: '/'
};

// ── Validation Schemas ───────────────────────────────────
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

// ── Owner Login ──────────────────────────────────────────
export async function login(req, res) {
    try {
        const { email, password } = loginSchema.parse(req.body);

        // Fail fast if JWT_SECRET isn't set — silent "Internal server
        // error" 500s make auth debugging miserable. Surface it clearly.
        if (!process.env.JWT_SECRET) {
            console.error('[Auth] JWT_SECRET is not set in environment variables.');
            return res.status(500).json({ error: 'Server misconfiguration. Contact admin.' });
        }

        const { rows } = await pool.query(
            `SELECT id, email, password, role, two_factor_enabled
               FROM users WHERE email = $1`,
            [email.toLowerCase().trim()],
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const user = rows[0];
        // Normalise legacy casings (e.g. 'ADMIN' → 'Administrator',
        // 'OWNER' → 'Owner') so a token issued today works against
        // every role-gated route, even if the DB row still has a
        // legacy value. Mirrors v22_normalize_admin_roles.sql.
        user.role = canonicalRole(user.role);

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // 2FA is enabled → mint a short-lived challenge token instead
        // of the real admin JWT. The frontend exchanges it for the real
        // token at /api/auth/login/2fa with a TOTP code.
        if (user.two_factor_enabled) {
            const challengeToken = jwt.sign(
                { id: user.id, purpose: '2fa' },
                process.env.JWT_SECRET,
                { expiresIn: '5m' }
            );
            return res.json({
                requires2fa: true,
                challengeToken,
                user: { id: user.id, email: user.email, role: user.role, divisions: divisionsForRole(user.role) },
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '30m' },
        );

        // Set HttpOnly cookie for browser clients
        res.cookie('access_token', token, COOKIE_OPTIONS);

        return res.json({ token, user: { id: user.id, email: user.email, role: user.role, divisions: divisionsForRole(user.role) } });
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
// Also returns `divisions` so the workspace switcher / nav
// gating in `data/adminNavItems.js` knows which divisions
// the user can act on. The list is derived from the role
// (mirrors `authMiddleware.js#ROLE_DIVISIONS`) so the
// frontend can stay in sync without a separate API call.

export async function getMe(req, res) {
    // req.user is set by the verifyToken middleware (which already
    // normalises the role). Re-normalise here as a safety net in case
    // a token was issued before the normalisation fix landed.
    const role = canonicalRole(req.user.role);
    return res.json({
        id: req.user.id,
        email: req.user.email,
        role,
        divisions: divisionsForRole(role),
    });
}

// ── Refresh JWT ──────────────────────────────────────────
// Mints a fresh admin JWT for the current user. Used by the
// SessionTimeoutModal "Extend session" button — same identity,
// fresh 30-min window, no password re-prompt.
export async function refresh(req, res) {
    if (!process.env.JWT_SECRET) {
        console.error('[Auth] JWT_SECRET is not set in environment variables.');
        return res.status(500).json({ error: 'Server misconfiguration. Contact admin.' });
    }
    const token = jwt.sign(
        { id: req.user.id, email: req.user.email, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '30m' },
    );
    
    // Set HttpOnly cookie for browser clients
    res.cookie('access_token', token, COOKIE_OPTIONS);
    
    return res.json({
        token,
        user: { id: req.user.id, email: req.user.email, role: req.user.role, divisions: divisionsForRole(req.user.role) },
    });
}
