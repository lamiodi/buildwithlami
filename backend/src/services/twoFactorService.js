// ─── src/services/twoFactorService.js ────────────────────
// TOTP-based 2FA (RFC 6238) using `otplib`. Recovery codes
// are stored as SHA-256 hashes in `users.two_factor_recovery_codes`.
// The plain codes are returned to the user *once* at setup
// time and never persisted in clear text.
//
// 2FA flow:
//   1. Setup  → generateSecret → user scans QR → confirmSecret
//   2. Login  → /login returns { requires2fa: true } if the
//               account has 2FA enabled; the user submits a
//               TOTP code (or recovery code) to /login/2fa to
//               mint the real JWT.
// ──────────────────────────────────────────────────────────

import crypto from 'crypto';
import { generateSecret as otpGenerateSecret, generateURI, verifySync } from 'otplib';
import QRCode from 'qrcode';
import pool from '../config/db.js';

const ISSUER = 'buildwithlami';
const RECOVERY_CODE_COUNT = 8;
const RECOVERY_CODE_BYTES = 5; // 10 hex chars — easy to type, plenty of entropy.

/**
 * Generate a fresh TOTP secret for the given user. Does NOT
 * persist it — the caller must call `confirmSecret` once the
 * user has verified their first code.
 */
export async function generateSecret(email) {
    const secret = otpGenerateSecret();
    const otpauth = generateURI({ issuer: ISSUER, label: email, secret });
    // Render the QR as a data-URL so the setup page can drop it
    // straight into an <img src=…> without an extra round-trip.
    const qrDataUrl = await QRCode.toDataURL(otpauth, { errorCorrectionLevel: 'M', margin: 1 });
    return { secret, otpauth, qrDataUrl };
}

/**
 * Verify a TOTP code against the given secret. Returns true on
 * success, false on failure. Used by both setup (confirm the
 * user scanned the right code) and login (re-verify each time).
 */
export function verifyCode(secret, code) {
    if (!secret || typeof code !== 'string') return false;
    // Reject anything that isn't 6 digits — saves a round-trip
    // through the otplib verifier for obvious junk input.
    if (!/^\d{6}$/.test(code.trim())) return false;
    try {
        const res = verifySync({ token: code.trim(), secret, window: 1, step: 30 });
        return !!res.valid;
    } catch {
        return false;
    }
}

/**
 * Generate a fresh set of one-time recovery codes. Each code is
 * 10 hex chars (≈40 bits of entropy). The returned array has
 * two parallel views: `plain` (show to the user once) and
 * `hashed` (persist in the DB).
 */
export function generateRecoveryCodes() {
    const plain = [];
    const hashed = [];
    for (let i = 0; i < RECOVERY_CODE_COUNT; i += 1) {
        const code = crypto.randomBytes(RECOVERY_CODE_BYTES).toString('hex');
        plain.push(code);
        hashed.push(hashRecoveryCode(code));
    }
    return { plain, hashed };
}

export function hashRecoveryCode(code) {
    return crypto.createHash('sha256').update(String(code).toLowerCase()).digest('hex');
}

/**
 * Persist a confirmed secret + recovery codes for the user and
 * flip `two_factor_enabled = true`. This is the only place
 * 2FA is enabled; setup endpoints must call this *after*
 * verifying the user can produce a valid code from the secret.
 */
export async function enableTwoFactor(userId, secret, recoveryCodesHashed) {
    await pool.query(
        `UPDATE users
            SET two_factor_secret         = $1,
                two_factor_enabled        = true,
                two_factor_confirmed_at   = NOW(),
                two_factor_recovery_codes = $2
          WHERE id = $3`,
        [secret, recoveryCodesHashed, userId]
    );
}

/**
 * Disable 2FA. Wipes the secret, recovery codes, and the
 * enabled flag. Idempotent — safe to call on a user without 2FA.
 */
export async function disableTwoFactor(userId) {
    await pool.query(
        `UPDATE users
            SET two_factor_secret         = NULL,
                two_factor_enabled        = false,
                two_factor_confirmed_at   = NULL,
                two_factor_recovery_codes = ARRAY[]::TEXT[]
          WHERE id = $1`,
        [userId]
    );
}

/**
 * If the supplied token is a valid TOTP code, returns { ok: true, kind: 'totp' }.
 * If it matches a recovery code, consumes it (removes it from the array) and
 * returns { ok: true, kind: 'recovery' }. Returns { ok: false } otherwise.
 */
export async function consumeTwoFactorCredential(userId, token) {
    if (typeof token !== 'string' || token.length === 0) {
        return { ok: false };
    }

    const trimmed = token.trim();
    const { rows } = await pool.query(
        `SELECT two_factor_secret, two_factor_recovery_codes
           FROM users WHERE id = $1`,
        [userId]
    );
    if (rows.length === 0) return { ok: false };
    const { two_factor_secret: secret, two_factor_recovery_codes: recoveryCodes } = rows[0];

    // 1. Try TOTP first (it's the normal path).
    if (verifyCode(secret, trimmed)) {
        return { ok: true, kind: 'totp' };
    }

    // 2. Try recovery codes (case-insensitive hex).
    if (Array.isArray(recoveryCodes) && recoveryCodes.length > 0) {
        const incomingHash = hashRecoveryCode(trimmed);
        const idx = recoveryCodes.indexOf(incomingHash);
        if (idx !== -1) {
            // Consume the code so it can't be re-used.
            const next = recoveryCodes.filter((_, i) => i !== idx);
            await pool.query(
                `UPDATE users SET two_factor_recovery_codes = $1 WHERE id = $2`,
                [next, userId]
            );
            return { ok: true, kind: 'recovery' };
        }
    }

    return { ok: false };
}
