// ─── src/controllers/twoFactorController.js ─────────────
// HTTP layer for TOTP-based 2FA. See twoFactorService.js
// for the underlying crypto + DB primitives.
//
// Endpoints (all require `verifyToken` unless noted):
//   GET  /api/auth/2fa/status             → { enabled, confirmedAt }
//   POST /api/auth/2fa/setup              → { secret, otpauth, qrDataUrl }
//   POST /api/auth/2fa/confirm            → flips enabled=true
//   POST /api/auth/2fa/disable            → wipes secret + recovery codes
//   POST /api/auth/2fa/recovery-codes/regenerate → new set
//   POST /api/auth/login/2fa              → (public) trade challenge token + code for a JWT
// ──────────────────────────────────────────────────────────

import pool from '../config/db.js';
import { canonicalRole, divisionsForRole } from '../config/roles.js';
import {
    generateSecret,
    verifyCode,
    generateRecoveryCodes,
    enableTwoFactor,
    disableTwoFactor,
    consumeTwoFactorCredential,
} from '../services/twoFactorService.js';
import { writeAuditLog, getClientIp } from '../utils/auditLog.js';

// ── Helpers ──────────────────────────────────────────────
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

// ── GET /api/auth/2fa/status ─────────────────────────────
export async function getTwoFactorStatus(req, res) {
    try {
        const { rows } = await pool.query(
            `SELECT two_factor_enabled, two_factor_confirmed_at,
                    COALESCE(array_length(two_factor_recovery_codes, 1), 0) AS recovery_codes_remaining
               FROM users WHERE id = $1`,
            [req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });
        const r = rows[0];
        return res.json({
            enabled: !!r.two_factor_enabled,
            confirmedAt: r.two_factor_confirmed_at,
            recoveryCodesRemaining: Number(r.recovery_codes_remaining || 0),
        });
    } catch (err) {
        console.error('[2FA] status error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── POST /api/auth/2fa/setup ────────────────────────────
// Generates a fresh secret + QR for the caller. Does NOT
// enable 2FA — that only happens after /confirm succeeds.
export async function setupTwoFactor(req, res) {
    try {
        const { secret, otpauth, qrDataUrl } = await generateSecret(req.user.email);
        // Stash the unconfirmed secret in a column so the next
        // /confirm can read it back. The `enable` flag is still
        // false until the user proves they scanned the right QR.
        await pool.query(
            `UPDATE users SET two_factor_secret = $1 WHERE id = $2`,
            [secret, req.user.id]
        );
        return res.json({ secret, otpauth, qrDataUrl });
    } catch (err) {
        console.error('[2FA] setup error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── POST /api/auth/2fa/confirm ───────────────────────────
// First successful TOTP code → 2FA is enabled.
const confirmSchema = { code: String };
function parseConfirmBody(req) {
    const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
    if (!/^\d{6}$/.test(code)) return { error: 'Code must be 6 digits.' };
    return { code };
}

export async function confirmTwoFactor(req, res) {
    const parsed = parseConfirmBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });

    try {
        const { rows } = await pool.query(
            `SELECT two_factor_secret, two_factor_enabled FROM users WHERE id = $1`,
            [req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });
        const { two_factor_secret: secret, two_factor_enabled: alreadyEnabled } = rows[0];

        if (!secret) return res.status(400).json({ error: 'No 2FA setup in progress. Call /setup first.' });
        if (alreadyEnabled) return res.status(409).json({ error: '2FA is already enabled.' });

        if (!verifyCode(secret, parsed.code)) {
            return res.status(401).json({ error: 'Invalid code. Please try again.' });
        }

        const { plain, hashed } = generateRecoveryCodes();
        await enableTwoFactor(req.user.id, secret, hashed);
        await writeAuditLog({
            action: 'TWO_FACTOR_ENABLED',
            entityType: 'users',
            entityId: req.user.id,
            user: req.user,
            ipAddress: getClientIp(req),
        });

        // Recovery codes are returned ONCE — never persisted in cleartext.
        return res.json({ recoveryCodes: plain });
    } catch (err) {
        console.error('[2FA] confirm error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── POST /api/auth/2fa/disable ───────────────────────────
const disableSchema = { password: String };
export async function disableTwoFactorController(req, res) {
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (password.length === 0) return res.status(400).json({ error: 'Password required to disable 2FA.' });

    try {
        const { rows } = await pool.query(
            `SELECT password, two_factor_enabled FROM users WHERE id = $1`,
            [req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });

        const bcrypt = (await import('bcrypt')).default;
        const ok = await bcrypt.compare(password, rows[0].password);
        if (!ok) return res.status(401).json({ error: 'Incorrect password.' });

        await disableTwoFactor(req.user.id);
        await writeAuditLog({
            action: 'TWO_FACTOR_DISABLED',
            entityType: 'users',
            entityId: req.user.id,
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.json({ success: true });
    } catch (err) {
        console.error('[2FA] disable error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── POST /api/auth/2fa/recovery-codes/regenerate ─────────
export async function regenerateRecoveryCodes(req, res) {
    try {
        const { rows } = await pool.query(
            `SELECT two_factor_enabled FROM users WHERE id = $1`,
            [req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });
        if (!rows[0].two_factor_enabled) {
            return res.status(400).json({ error: '2FA is not enabled.' });
        }
        const { plain, hashed } = generateRecoveryCodes();
        await pool.query(
            `UPDATE users SET two_factor_recovery_codes = $1 WHERE id = $2`,
            [hashed, req.user.id]
        );
        await writeAuditLog({
            action: 'TWO_FACTOR_RECOVERY_CODES_REGENERATED',
            entityType: 'users',
            entityId: req.user.id,
            user: req.user,
            ipAddress: getClientIp(req),
        });
        return res.json({ recoveryCodes: plain });
    } catch (err) {
        console.error('[2FA] regenerate recovery codes error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── POST /api/auth/login/2fa (public) ────────────────────
// Trade the short-lived `challengeToken` from /login + a
// TOTP code (or recovery code) for a real JWT. The challenge
// token only carries `{ id, purpose: '2fa' }` and expires in
// 5 minutes (see authController for the signing path).
export async function verifyLoginTwoFactor(req, res) {
    const challengeToken = typeof req.body?.challengeToken === 'string' ? req.body.challengeToken : '';
    const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
    if (!challengeToken || !code) {
        return res.status(400).json({ error: 'challengeToken and code are required.' });
    }

    const jwt = (await import('jsonwebtoken')).default;
    let payload;
    try {
        payload = jwt.verify(challengeToken, process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({ error: 'Invalid or expired challenge token.' });
    }
    if (payload.purpose !== '2fa' || !payload.id) {
        return res.status(401).json({ error: 'Invalid challenge token.' });
    }
    if (!isUuid(payload.id)) {
        return res.status(401).json({ error: 'Invalid challenge token.' });
    }

    const result = await consumeTwoFactorCredential(payload.id, code);
    if (!result.ok) {
        return res.status(401).json({ error: 'Invalid 2FA code.' });
    }

    // Issue the real admin JWT now that 2FA is satisfied.
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
        action: result.kind === 'recovery' ? 'LOGIN_2FA_VIA_RECOVERY' : 'LOGIN_2FA_SUCCESS',
        entityType: 'users',
        entityId: user.id,
        user: { id: user.id, email: user.email, role: user.role },
        ipAddress: getClientIp(req),
    });

    return res.json({
        token,
        user: { id: user.id, email: user.email, role: user.role, divisions: divisionsForRole(user.role) },
        method: result.kind, // 'totp' or 'recovery'
    });
}
