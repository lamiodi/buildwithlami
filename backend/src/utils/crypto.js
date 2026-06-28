import crypto from 'node:crypto';

// Use a 256-bit (32 byte) key for AES-256-GCM
// Generate a proper 64-character hex string: crypto.randomBytes(32).toString('hex')
// MUST be provided via environment. Refuse to start without it.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
    throw new Error(
        '[crypto] ENCRYPTION_KEY is not set. Refusing to start: a hardcoded fallback ' +
        'would make every encrypted secret in the vault decryptable by anyone with code access.'
    );
}
if (!/^[0-9a-f]{64}$/i.test(ENCRYPTION_KEY)) {
    throw new Error('[crypto] ENCRYPTION_KEY must be a 64-character hex string (32 bytes).');
}

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(ENCRYPTION_KEY, 'hex');

/**
 * Encrypts `text` with AES-256-GCM.
 * Returns { iv, encryptedData, authTag } — all hex-encoded.
 * The auth tag MUST be stored alongside the ciphertext and passed back to `decrypt`.
 */
export function encrypt(text) {
    const iv = crypto.randomBytes(12); // 12 bytes is the recommended IV size for GCM
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted,
        authTag: authTag.toString('hex'),
    };
}

/**
 * Decrypts a value previously produced by `encrypt`.
 * Throws if the auth tag does not verify — i.e. the ciphertext was tampered with
 * or the wrong key/iv/tag combination is supplied.
 */
export function decrypt(encryptedData, iv, authTag) {
    if (!authTag) {
        throw new Error('[crypto] decrypt: authTag is required for AES-256-GCM.');
    }
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
