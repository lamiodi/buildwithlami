import crypto from 'node:crypto';

// ─── utils/twoFactorCrypto.js ────────────────────────────
// Narrow AES-256-GCM helper for TOTP secrets. Uses its own
// key (TWOFA_ENCRYPTION_KEY) so it can be rotated independently
// of the general vault key.
//
// Stored payload format (JSON, base64url-safe):
//   {"v":1,"iv":"<hex>","tag":"<hex>","ct":"<hex>"}
//
// The version byte lets us migrate to a new algorithm/key
// without losing access to existing rows.
//
// IMPORTANT: callers must NEVER log, render, or echo the
// plaintext secret anywhere outside the TOTP verification
// path. Use `decryptTotpSecret(userId)` only from inside
// the twoFactorService.verifyCode flow.
// ──────────────────────────────────────────────────────────

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // recommended for GCM

const TWOFA_KEY = process.env.TWOFA_ENCRYPTION_KEY;
if (!TWOFA_KEY) {
    throw new Error(
        '[twoFactorCrypto] TWOFA_ENCRYPTION_KEY is not set. Refusing to start: a ' +
        'hardcoded fallback would make every 2FA secret in the database decryptable ' +
        'by anyone with code access.',
    );
}
if (!/^[0-9a-f]{64}$/i.test(TWOFA_KEY)) {
    throw new Error('[twoFactorCrypto] TWOFA_ENCRYPTION_KEY must be a 64-character hex string (32 bytes).');
}

const KEY = Buffer.from(TWOFA_KEY, 'hex');

/**
 * Encrypts a TOTP base32 secret and returns a self-describing
 * string ready to be persisted in `users.totp_secret_encrypted`.
 */
export function encryptTotpSecret(plainSecret) {
    if (typeof plainSecret !== 'string' || plainSecret.length === 0) {
        throw new Error('[twoFactorCrypto] encryptTotpSecret: input must be a non-empty string.');
    }
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    const encrypted = Buffer.concat([
        cipher.update(plainSecret, 'utf8'),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return JSON.stringify({
        v: 1,
        iv: iv.toString('hex'),
        tag: authTag.toString('hex'),
        ct: encrypted.toString('hex'),
    });
}

/**
 * Decrypts a value previously produced by `encryptTotpSecret`.
 * Returns null on any structural / authentication failure so
 * callers can surface a generic "invalid 2FA" path instead of
 * leaking crypto internals.
 */
export function decryptTotpSecret(payload) {
    if (!payload || typeof payload !== 'string') return null;
    let parsed;
    try {
        parsed = JSON.parse(payload);
    } catch {
        return null;
    }
    if (!parsed || parsed.v !== 1) return null;
    const { iv, tag, ct } = parsed;
    if (!iv || !tag || !ct) return null;
    if (!/^[0-9a-f]+$/i.test(iv) || !/^[0-9a-f]+$/i.test(tag) || !/^[0-9a-f]+$/i.test(ct)) {
        return null;
    }
    try {
        const decipher = crypto.createDecipheriv(
            ALGORITHM,
            KEY,
            Buffer.from(iv, 'hex'),
        );
        decipher.setAuthTag(Buffer.from(tag, 'hex'));
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(ct, 'hex')),
            decipher.final(),
        ]);
        return decrypted.toString('utf8');
    } catch {
        // Auth tag mismatch, wrong key, tampered ciphertext.
        return null;
    }
}
