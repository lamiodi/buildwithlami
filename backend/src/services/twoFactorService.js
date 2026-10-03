// ─── src/services/twoFactorService.js ────────────────────────
// Email-OTP based 2FA.
//
// Flow:
//   SETUP:
//     1. POST /api/auth/2fa/setup  → generateAndSendOtp(userId, email)
//        Generates a 6-digit OTP, SHA-256 hashes it, stores hash +
//        expiry (10 min) in users.email_otp_hash / email_otp_expires_at,
//        and sends the plain code to the user's email.
//     2. POST /api/auth/2fa/confirm { code } → verifyOtp(userId, code) + enableTwoFactor(userId)
//        Verifies hash, flips two_factor_enabled = true, clears OTP cols.
//
//   LOGIN (when two_factor_enabled = true):
//     1. POST /api/auth/login  → returns { requires2fa: true, challengeToken }
//        AND calls generateAndSendOtp to email a fresh OTP.
//     2. POST /api/auth/login/2fa { challengeToken, code }
//        → verifyOtp(userId, code) — checks hash + expiry, issues JWT.
//     3. POST /api/auth/login/2fa/resend { challengeToken }
//        → generateAndSendOtp(userId, email) — sends a new code.
//
//   DISABLE:
//     POST /api/auth/2fa/disable { password } → disableTwoFactor(userId)
// ─────────────────────────────────────────────────────────────

import crypto from 'crypto';
import pool from '../config/db.js';
import { createTransporter, renderEmailShell, escapeHtml } from './emailLayout.js';

const OTP_TTL_MINUTES = 10;
const OTP_DIGITS = 6;

// ── Crypto helpers ────────────────────────────────────────────

/** Generate a zero-padded 6-digit numeric OTP. */
function generateOtpPlain() {
    const max = 10 ** OTP_DIGITS; // 1_000_000
    const val = crypto.randomInt(0, max);
    return String(val).padStart(OTP_DIGITS, '0');
}

/** SHA-256 hash of the plain code — stored at rest, never the plain code. */
function hashOtp(plain) {
    return crypto.createHash('sha256').update(String(plain)).digest('hex');
}

// ── Email sender ──────────────────────────────────────────────

export async function sendOtpEmail(toEmail, otp) {
    const transporter = createTransporter();
    const from = process.env.EMAIL_FROM || '"BuildWith_Lami" <buildwithlami@gmail.com>';

    const bodyHtml = `
        <p style="margin:0 0 16px 0; font-size:15px; color:#334155;">
            Your two-factor authentication code is:
        </p>
        <div style="text-align:center; margin:28px 0;">
            <span style="
                display:inline-block;
                font-size:36px;
                font-weight:800;
                letter-spacing:12px;
                color:#ff5500;
                background:#fff7f5;
                border:2px solid #ff5500;
                border-radius:12px;
                padding:16px 32px;
                font-family:monospace;
            ">${escapeHtml(otp)}</span>
        </div>
        <p style="margin:0 0 8px 0; font-size:14px; color:#64748b;">
            This code expires in <strong>10 minutes</strong>.
            If you did not request this code, someone may be attempting
            to access your account — you can safely ignore this email.
        </p>`;

    const html = renderEmailShell({
        preheader: `Your BuildWith_Lami login code: ${otp}`,
        bodyHtml,
        footerNote: 'Never share this code with anyone.',
    });

    await transporter.sendMail({
        from,
        to: toEmail,
        subject: `${otp} — Your BuildWith_Lami sign-in code`,
        html,
    });
}

// ── Core service ──────────────────────────────────────────────

/**
 * Generate a fresh OTP for `userId`, persist the hash + expiry,
 * and return the plain code.
 *
 * @returns {string} plain 6-digit OTP
 */
export async function generateOtp(userId) {
    const plain = generateOtpPlain();
    const hash = hashOtp(plain);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await pool.query(
        `UPDATE users
            SET email_otp_hash       = $1,
                email_otp_expires_at = $2
          WHERE id = $3`,
        [hash, expiresAt, userId]
    );

    return plain;
}

/**
 * Generate OTP and immediately dispatch the branded email.
 */
export async function generateAndSendOtp(userId, email) {
    const plain = await generateOtp(userId);
    await sendOtpEmail(email, plain);
    return plain;
}

/**
 * Verify a user-supplied OTP. Returns true if the code is correct
 * and not expired; false otherwise. Clears the OTP regardless of
 * outcome to prevent brute-force reuse.
 *
 * @param {string} userId
 * @param {string} code   — raw digits from the request body
 */
export async function verifyOtp(userId, code) {
    if (typeof code !== 'string' || !/^\d{6}$/.test(code.trim())) {
        return false;
    }

    const { rows } = await pool.query(
        `SELECT email_otp_hash, email_otp_expires_at FROM users WHERE id = $1`,
        [userId]
    );

    if (rows.length === 0) return false;
    const { email_otp_hash: stored, email_otp_expires_at: expiresAt } = rows[0];

    // Always clear the OTP after one attempt.
    await pool.query(
        `UPDATE users
            SET email_otp_hash       = NULL,
                email_otp_expires_at = NULL
          WHERE id = $1`,
        [userId]
    );

    if (!stored || !expiresAt) return false;
    if (new Date() > new Date(expiresAt)) return false; // expired

    const incoming = hashOtp(code.trim());
    return crypto.timingSafeEqual(Buffer.from(incoming), Buffer.from(stored));
}

/**
 * Flip two_factor_enabled = true for the user.
 * Called by /confirm after a successful OTP verification.
 */
export async function enableTwoFactor(userId) {
    await pool.query(
        `UPDATE users
            SET two_factor_enabled      = true,
                two_factor_confirmed_at = NOW()
          WHERE id = $1`,
        [userId]
    );
}

/**
 * Disable 2FA — wipes flag, confirmed_at, and any leftover OTP.
 * Idempotent.
 */
export async function disableTwoFactor(userId) {
    await pool.query(
        `UPDATE users
            SET two_factor_enabled      = false,
                two_factor_confirmed_at = NULL,
                email_otp_hash          = NULL,
                email_otp_expires_at    = NULL,
                two_factor_recovery_codes = ARRAY[]::TEXT[]
          WHERE id = $1`,
        [userId]
    );
}
