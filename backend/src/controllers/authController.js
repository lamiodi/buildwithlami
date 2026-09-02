import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import pool from '../config/db.js';
import { canonicalRole, divisionsForRole } from '../config/roles.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

// Cookie options for the HttpOnly JWT cookie.
//
// Security model (see docs/AUTH_MODEL.md):
//   * httpOnly        → JS cannot read the token, defeating XSS exfil.
//   * secure          → only sent over HTTPS in production.
//   * sameSite=Strict → browser refuses to send this cookie on any
//                       cross-site navigation, which is the modern
//                       defence against CSRF. The frontend is
//                       same-origin (Vite dev proxy / Vercel rewrite)
//                       so Strict does not break the happy path.
export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 60 * 1000, // 30 minutes (matches JWT_EXPIRES_IN)
    path: '/',
};

// ── Account lockout thresholds ───────────────────────────
// Defends against distributed brute-force that bypasses the
// per-IP `authLimiter`. The two are complementary: authLimiter
// blocks a single IP after 20 attempts/15min, while the
// account-level lockout blocks the email itself after
// MAX_FAILED_LOGINS failures inside LOCKOUT_WINDOW_MINUTES.
const MAX_FAILED_LOGINS = 10;
const LOCKOUT_WINDOW_MINUTES = 15;
const LOCKOUT_DURATION_MINUTES = 15;

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
            `SELECT id, email, password, role, two_factor_enabled,
                    failed_login_count, first_failed_at, locked_until
               FROM users WHERE email = $1`,
            [email.toLowerCase().trim()],
        );

        if (rows.length === 0) {
            // Constant-time-ish: still call bcrypt against a dummy hash
            // so the response time is comparable to a known-user
            // failure. Defends against user-enumeration via timing.
            await bcrypt.compare(password, '$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi');
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const user = rows[0];

        // Account lockout check (P2-1). The lockout window is
        // bounded by `locked_until`; the rolling counter is reset
        // on a successful login or after the first_failed_at
        // window has elapsed.
        const now = new Date();
        if (user.locked_until && new Date(user.locked_until) > now) {
            return res.status(423).json({
                error: 'Account temporarily locked due to too many failed attempts. Try again later.',
            });
        }

        // Normalise the role so a token issued today works against
        // every role-gated route, even if the DB row still has a
        // legacy value. In the one-man studio, every admin-shaped
        // alias collapses to 'Owner' and every client-shaped alias
        // collapses to 'Client' / 'CLIENT_PORTAL'. Mirrors
        // v38_simplify_roles.sql on the data side.
        user.role = canonicalRole(user.role);

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            // Bump the rolling failure counter. If the counter
            // exceeds MAX_FAILED_LOGINS within the window, set
            // locked_until. The counter resets when the first
            // failure was longer than the window ago.
            const firstFailedAt = user.first_failed_at ? new Date(user.first_failed_at) : null;
            const windowExpired = !firstFailedAt ||
                (now - firstFailedAt) > LOCKOUT_WINDOW_MINUTES * 60 * 1000;

            const newCount = windowExpired ? 1 : (user.failed_login_count || 0) + 1;
            const lockUntil = newCount >= MAX_FAILED_LOGINS
                ? new Date(now.getTime() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
                : null;

            await pool.query(
                `UPDATE users
                    SET failed_login_count = $1,
                        first_failed_at    = $2,
                        locked_until       = $3
                  WHERE id = $4`,
                [newCount, windowExpired ? now : firstFailedAt, lockUntil, user.id]
            );

            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Successful login: reset the failure counters.
        if (user.failed_login_count > 0 || user.locked_until) {
            await pool.query(
                `UPDATE users
                    SET failed_login_count = 0,
                        first_failed_at    = NULL,
                        locked_until       = NULL
                  WHERE id = $1`,
                [user.id]
            );
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
        console.error('[Auth] Login error:', err.message, err.stack);
        return res.status(500).json({ error: 'Internal server error.', detail: err.message });
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
// gating in `data/adminNavItems.js` stays in sync — in a
// one-man studio the admin always gets `['*']`.

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

// ── Password Reset Schemas ──────────────────────────────
const forgotPasswordSchema = z.object({
    email: z.string().email('Valid email is required.'),
});

const resetPasswordSchema = z.object({
    token: z.string().min(32, 'Valid reset token is required.'),
    password: z.string().min(8, 'Password must be at least 8 characters long.').max(128),
});

// ── POST /api/auth/forgot-password ──────────────────────
export async function forgotPassword(req, res) {
    try {
        const { email } = forgotPasswordSchema.parse(req.body);
        const normalizedEmail = email.toLowerCase().trim();

        // 1. Check users (admin) table
        let userType = null;
        const { rows: userRows } = await pool.query(
            `SELECT id, email FROM users WHERE email = $1`,
            [normalizedEmail]
        );

        if (userRows.length > 0) {
            userType = 'USER';
        } else {
            // 2. Check clients table
            const { rows: clientRows } = await pool.query(
                `SELECT id, primary_contact_email FROM clients WHERE primary_contact_email = $1`,
                [normalizedEmail]
            );
            if (clientRows.length > 0) {
                userType = 'CLIENT';
            }
        }

        // Generic response to avoid email enumeration
        const genericMessage = 'If an account exists with this email, a password reset link has been dispatched.';

        if (!userType) {
            return res.json({ success: true, message: genericMessage });
        }

        // Generate cryptographically secure token
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Invalidate any active unused tokens for this email
        await pool.query(
            `UPDATE password_reset_tokens SET used_at = NOW() WHERE email = $1 AND used_at IS NULL`,
            [normalizedEmail]
        );

        // Store new token
        await pool.query(
            `INSERT INTO password_reset_tokens (email, user_type, token_hash, expires_at)
             VALUES ($1, $2, $3, $4)`,
            [normalizedEmail, userType, tokenHash, expiresAt]
        );

        const frontendUrl = process.env.FRONTEND_URL || 'https://buildwithlami.com';
        const resetUrl = `${frontendUrl.replace(/\/+$/, '')}/reset-password/${rawToken}`;

        await sendPasswordResetEmail({ toEmail: normalizedEmail, resetUrl });

        return res.json({ success: true, message: genericMessage });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0]?.message || 'Invalid input.' });
        }
        console.error('[Auth] forgotPassword error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── POST /api/auth/reset-password ───────────────────────
export async function resetPassword(req, res) {
    try {
        const { token, password } = resetPasswordSchema.parse(req.body);
        const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

        const { rows } = await pool.query(
            `SELECT id, email, user_type, expires_at, used_at
             FROM password_reset_tokens
             WHERE token_hash = $1`,
            [tokenHash]
        );

        if (rows.length === 0 || rows[0].used_at !== null) {
            return res.status(400).json({ error: 'This password reset link is invalid or has already been used.' });
        }

        const resetRecord = rows[0];
        if (new Date(resetRecord.expires_at) < new Date()) {
            return res.status(400).json({ error: 'This password reset link has expired. Please request a new one.' });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        if (resetRecord.user_type === 'USER') {
            await pool.query(
                `UPDATE users 
                 SET password = $1, failed_login_count = 0, first_failed_at = NULL, locked_until = NULL 
                 WHERE email = $2`,
                [passwordHash, resetRecord.email]
            );
        } else if (resetRecord.user_type === 'CLIENT') {
            await pool.query(
                `UPDATE clients 
                 SET password_hash = $1 
                 WHERE primary_contact_email = $2`,
                [passwordHash, resetRecord.email]
            );
        }

        // Invalidate token
        await pool.query(
            `UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1`,
            [resetRecord.id]
        );

        return res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0]?.message || 'Invalid input.' });
        }
        console.error('[Auth] resetPassword error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

