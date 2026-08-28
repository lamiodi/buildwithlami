// ─── src/services/twoFactorService.js ────────────────────
// TOTP-based 2FA (RFC 6238) using `otplib`. Recovery codes
// are stored as SHA-256 hashes in `users.two_factor_recovery_codes`.
// The plain codes are returned to the user *once* at setup
// time and never persisted in clear text.
//
// At-rest protection:
//   The TOTP secret is persisted in `users.totp_secret_encrypted`
//   (renamed from `two_factor_secret` in v39) as an
//   AES-256-GCM envelope via utils/twoFactorCrypto.js. The
//   plaintext only exists in memory long enough to call
//   otplib.verify — it is never returned by an API, never
//   written to logs, and never shown in the admin UI.
//
// Legacy back-compat: rows that still contain a raw base32
// secret (no JSON envelope) are treated as plaintext and
// re-encrypted on the next successful verification.
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
import {
    encryptTotpSecret,
    decryptTotpSecret,
} from '../utils/twoFactorCrypto.js';

const ISSUER = 'BuildWithLami';
const RECOVERY_CODE_COUNT = 8;
const RECOVERY_CODE_BYTES = 5; // 10 hex chars — easy to type, plenty of entropy.

// Postgres column the encrypted envelope is stored in. Kept
// as a constant so the back-compat view and tests can refer
// to the same name without stringly-typed drift.
const TOTP_COLUMN = 'totp_secret_encrypted';

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
 *
 * `secret` MUST be a plaintext base32 string — never the
 * ciphertext stored in the DB. Use `resolveTotpSecretForUser`
 * to load + decrypt the per-user value safely.
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
 * Decrypt the stored TOTP secret for `userId`. Returns the
 * plaintext base32 secret, or null if the row is missing,
 * the ciphertext is unreadable, or the column is empty.
 *
 * The plaintext is intended to live only long enough to call
 * `verifyCode` — it must never be returned to the caller of
 * this module's public surface (controllers, logs, API
 * responses, error messages).
 */
export async function resolveTwoFactorSecret(userId) {
    return resolveTotpSecretForUser(userId);
}

/**
 * Encrypt and store an unconfirmed TOTP secret. Used by the
 * /setup endpoint so the next /confirm call can read it back.
 */
export async function stageTwoFactorSecret(userId, plaintext) {
    if (typeof plaintext !== 'string' || plaintext.length === 0) {
        throw new Error('[twoFactorService] stageTwoFactorSecret: plaintext required.');
    }
    const envelope = encryptTotpSecret(plaintext);
    await pool.query(
        `UPDATE users SET ${TOTP_COLUMN} = $1 WHERE id = $2`,
        [envelope, userId],
    );
}

async function resolveTotpSecretForUser(userId) {
    const { rows } = await pool.query(
        `SELECT ${TOTP_COLUMN} AS ct FROM users WHERE id = $1`,
        [userId],
    );
    if (rows.length === 0) return null;
    const stored = rows[0].ct;
    if (!stored) return null;

    // Heuristic: an envelope is a JSON object with a `v` field.
    // Anything else is treated as legacy plaintext so the
    // existing user can still log in while the row is upgraded.
    const trimmed = String(stored).trim();
    if (trimmed.startsWith('{')) {
        return decryptTotpSecret(trimmed);
    }
    return trimmed; // legacy plaintext
}

/**
 * Re-encrypt a legacy plaintext secret in place. Called
 * opportunistically after a successful verification so the
 * database naturally migrates to the new envelope format
 * without a separate, blocking migration step.
 */
async function upgradeLegacySecretIfNeeded(userId, plaintext) {
    const { rows } = await pool.query(
        `SELECT ${TOTP_COLUMN} AS ct FROM users WHERE id = $1`,
        [userId],
    );
    if (rows.length === 0) return;
    const stored = rows[0].ct;
    if (!stored) return;
    const trimmed = String(stored).trim();
    if (!trimmed.startsWith('{')) {
        const envelope = encryptTotpSecret(plaintext);
        await pool.query(
            `UPDATE users SET ${TOTP_COLUMN} = $1 WHERE id = $2`,
            [envelope, userId],
        );
    }
}

/**
 * Persist a confirmed secret + recovery codes for the user and
 * flip `two_factor_enabled = true`. This is the only place
 * 2FA is enabled; setup endpoints must call this *after*
 * verifying the user can produce a valid code from the secret.
 */
export async function enableTwoFactor(userId, secret, recoveryCodesHashed) {
    const envelope = encryptTotpSecret(secret);
    await pool.query(
        `UPDATE users
            SET ${TOTP_COLUMN}             = $1,
                two_factor_enabled         = true,
                two_factor_confirmed_at    = NOW(),
                two_factor_recovery_codes  = $2
          WHERE id = $3`,
        [envelope, recoveryCodesHashed, userId]
    );
}

/**
 * Disable 2FA. Wipes the secret, recovery codes, and the
 * enabled flag. Idempotent — safe to call on a user without 2FA.
 */
export async function disableTwoFactor(userId) {
    await pool.query(
        `UPDATE users
            SET ${TOTP_COLUMN}              = NULL,
                two_factor_enabled          = false,
                two_factor_confirmed_at     = NULL,
                two_factor_recovery_codes   = ARRAY[]::TEXT[]
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
        `SELECT two_factor_enabled, two_factor_recovery_codes
           FROM users WHERE id = $1`,
        [userId]
    );
    if (rows.length === 0 || !rows[0].two_factor_enabled) return { ok: false };
    const recoveryCodes = rows[0].two_factor_recovery_codes;

    // 1. Try TOTP first (it's the normal path).
    const secret = await resolveTotpSecretForUser(userId);
    if (secret && verifyCode(secret, trimmed)) {
        // Opportunistically upgrade legacy plaintext rows.
        await upgradeLegacySecretIfNeeded(userId, secret);
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
