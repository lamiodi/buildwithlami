// ─── src/controllers/twoFactorController.js ──────────────────
// Email-OTP 2FA. No QR codes, no authenticator apps.
//
// Endpoints:
//   GET  /api/auth/2fa/status              → { enabled, confirmedAt, method: 'email' }
//   POST /api/auth/2fa/setup               → generates + emails OTP to owner
//   POST /api/auth/2fa/confirm  { code }   → flips enabled=true
//   POST /api/auth/2fa/disable  { password }
//   POST /api/auth/login/2fa (public)      → challengeToken + code → JWT
//   POST /api/auth/login/2fa/resend (public) → challengeToken → fresh OTP emailed
// ─────────────────────────────────────────────────────────────

import pool from '../config/db.js';
import { z } from 'zod';
import { canonicalRole, divisionsForRole } from '../config/roles.js';
import {
    generateAndSendOtp,
    verifyOtp,
    enableTwoFactor,
    disableTwoFactor,
} from '../services/twoFactorService.js';
import { writeAuditLog, getClientIp } from '../utils/auditLog.js';
import { COOKIE_OPTIONS } from './authController.js';

// ── Schemas ───────────────────────────────────────────────────
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

const codeSchema = z.object({
    code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits.'),
});
const disableSchema = z.object({
    password: z.string().min(1).max(200),
});
const verifyLoginSchema = z.object({
    challengeToken: z.string().min(10).max(4096),
    code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits.'),
});
const resendLoginSchema = z.object({
    challengeToken: z.string().min(10).max(4096),
});

// ── GET /api/auth/2fa/status ──────────────────────────────────
export async function getTwoFactorStatus(req, res) {
    try {
        const { rows } = await pool.query(
            `SELECT two_factor_enabled, two_factor_confirmed_at
               FROM users WHERE id = $1`,
            [req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });
        const r = rows[0];
        return res.json({
            enabled: !!r.two_factor_enabled,
            confirmedAt: r.two_factor_confirmed_at,
            method: 'email',
        });
    } catch (err) {
        console.error('[2FA] status error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── POST /api/auth/2fa/setup ──────────────────────────────────
export async function setupTwoFactor(req, res) {
    try {
        const { rows } = await pool.query(
            `SELECT email, two_factor_enabled FROM users WHERE id = $1`,
            [req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });
        if (rows[0].two_factor_enabled) {
            return res.status(409).json({ error: '2FA is already enabled.' });
        }

        const email = rows[0].email;
        await generateAndSendOtp(req.user.id, email);

        console.log('[2FA] setup OTP emailed to', email);
        return res.json({
            success: true,
            email,
            message: `A 6-digit verification code has been sent to ${email}. It expires in 10 minutes.`,
        });
    } catch (err) {
        console.error('[2FA] setup error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── POST /api/auth/2fa/confirm ────────────────────────────────
export async function confirmTwoFactor(req, res) {
    const parsed = codeSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Code must be exactly 6 digits.' });
    }

    try {
        const { rows: meta } = await pool.query(
            `SELECT two_factor_enabled FROM users WHERE id = $1`,
            [req.user.id]
        );
        if (meta.length === 0) return res.status(404).json({ error: 'User not found.' });
        if (meta[0].two_factor_enabled) {
            return res.status(409).json({ error: '2FA is already enabled.' });
        }

        const ok = await verifyOtp(req.user.id, parsed.data.code);
        if (!ok) {
            return res.status(401).json({ error: 'Invalid or expired code. Please request a new code.' });
        }

        await enableTwoFactor(req.user.id);
        await writeAuditLog({
            action: 'TWO_FACTOR_ENABLED',
            entityType: 'users',
            entityId: req.user.id,
            user: req.user,
            ipAddress: getClientIp(req),
        });

        return res.json({ success: true, message: 'Two-factor authentication is now active via email OTP.' });
    } catch (err) {
        console.error('[2FA] confirm error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── POST /api/auth/2fa/disable ────────────────────────────────
export async function disableTwoFactorController(req, res) {
    const parsed = disableSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Password required to disable 2FA.' });
    }

    try {
        const { rows } = await pool.query(
            `SELECT password FROM users WHERE id = $1`,
            [req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });

        const bcrypt = (await import('bcrypt')).default;
        const ok = await bcrypt.compare(parsed.data.password, rows[0].password);
        if (!ok) return res.status(401).json({ error: 'Incorrect password.' });

        await disableTwoFactor(req.user.id);
        await writeAuditLog({
            action: 'TWO_FACTOR_DISABLED',
            entityType: 'users',
            entityId: req.user.id,
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.json({ success: true, message: '2FA has been disabled.' });
    } catch (err) {
        console.error('[2FA] disable error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── POST /api/auth/login/2fa (public) ────────────────────────
export async function verifyLoginTwoFactor(req, res) {
    const parsed = verifyLoginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'challengeToken and code are required.' });
    }
    const { challengeToken, code } = parsed.data;

    const jwt = (await import('jsonwebtoken')).default;
    let payload;
    try {
        payload = jwt.verify(challengeToken, process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({ error: 'Invalid or expired challenge token.' });
    }
    if (payload.purpose !== '2fa' || !isUuid(payload.id)) {
        return res.status(401).json({ error: 'Invalid challenge token.' });
    }

    const ok = await verifyOtp(payload.id, code);
    if (!ok) {
        return res.status(401).json({ error: 'Invalid or expired code.' });
    }

    const { rows } = await pool.query(
        `SELECT id, email, role FROM users WHERE id = $1`,
        [payload.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });

    const user = rows[0];
    user.role = canonicalRole(user.role);

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '30m' }
    );

    await writeAuditLog({
        action: 'LOGIN_2FA_SUCCESS',
        entityType: 'users',
        entityId: user.id,
        user: { id: user.id, email: user.email, role: user.role },
        ipAddress: getClientIp(req),
    });

    res.cookie('access_token', token, COOKIE_OPTIONS);
    return res.json({
        token,
        user: { id: user.id, email: user.email, role: user.role, divisions: divisionsForRole(user.role) },
        method: 'email_otp',
    });
}

// ── POST /api/auth/login/2fa/resend (public) ─────────────────
export async function resendLoginOtp(req, res) {
    const parsed = resendLoginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'challengeToken is required.' });
    }
    const { challengeToken } = parsed.data;

    const jwt = (await import('jsonwebtoken')).default;
    let payload;
    try {
        payload = jwt.verify(challengeToken, process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({ error: 'Invalid or expired challenge token.' });
    }
    if (payload.purpose !== '2fa' || !isUuid(payload.id)) {
        return res.status(401).json({ error: 'Invalid challenge token.' });
    }

    const { rows } = await pool.query(
        `SELECT email FROM users WHERE id = $1`,
        [payload.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });

    await generateAndSendOtp(payload.id, rows[0].email);
    return res.json({ success: true, message: `New verification code sent to ${rows[0].email}.` });
}
