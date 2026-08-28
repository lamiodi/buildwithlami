// ─── utils/webhookVerify.js ───────────────────────────────
// Reusable HMAC-SHA256 signature verification for inbound
// webhooks. Uses the raw request body, a timing-safe
// comparison, and explicit handling of missing / malformed
// inputs.
//
// Why raw body?
//   Express's `express.json()` mutates the body before our
//   handler runs. Webhook signatures are computed against
//   the exact byte stream the sender transmitted, so any
//   re-serialization (e.g. trimming whitespace, reordering
//   keys) would break verification. Mount the raw body
//   parser ahead of any JSON middleware on the route.
//
// Header conventions:
//   * `X-Webhook-Signature` — base64 HMAC-SHA256 of the
//     raw body using the configured secret.
//   * `X-Webhook-Timestamp` (optional) — unix seconds. If
//     present, requests older than MAX_SKEW_SECONDS are
//     rejected to defeat replay attacks.
//
// Stub mode:
//   When ZOHO_SIGN_TOKEN is not set, the caller may supply
//   STUB_WEBHOOK_SECRET instead. The same helper verifies
//   stub webhooks so an unauthenticated POST can never
//   transition business state in dev.
// ──────────────────────────────────────────────────────────

import crypto from 'node:crypto';

const MAX_SKEW_SECONDS = Number(process.env.WEBHOOK_MAX_SKEW_SECONDS || 300);

/**
 * Constant-time compare two equal-length hex/base64 strings.
 * Returns false when lengths differ — `crypto.timingSafeEqual`
 * throws on length mismatch, so we short-circuit safely.
 */
function safeEqual(expected, supplied) {
    if (typeof expected !== 'string' || typeof supplied !== 'string') return false;
    if (expected.length !== supplied.length) return false;
    try {
        return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
    } catch {
        return false;
    }
}

/**
 * Build a verification middleware for a given shared secret.
 *
 * @param {object} options
 * @param {string|undefined} options.secret - the shared HMAC secret.
 *        If empty, the middleware REFUSES the request (fail-closed).
 * @param {string} [options.headerName='x-webhook-signature']
 * @param {string} [options.timestampHeader='x-webhook-timestamp']
 * @param {number} [options.maxSkewSeconds=300]
 * @param {string} [options.encoding='base64'] - 'base64' or 'hex'
 */
export function verifyWebhookSignature({
    secret,
    headerName = 'x-webhook-signature',
    timestampHeader = 'x-webhook-timestamp',
    maxSkewSeconds = MAX_SKEW_SECONDS,
    encoding = 'base64',
} = {}) {
    return function webhookSignatureMiddleware(req, res, next) {
        if (!secret || typeof secret !== 'string' || secret.length === 0) {
            // Fail-closed: an unconfigured webhook endpoint must
            // not accept any request.
            return res.status(503).json({ error: 'Webhook is not configured.' });
        }

        const supplied = req.get(headerName) || '';
        if (!supplied) {
            return res.status(401).json({ error: 'Missing webhook signature.' });
        }

        // Optional timestamp check.
        const tsHeader = req.get(timestampHeader);
        if (tsHeader) {
            const ts = Number(tsHeader);
            if (!Number.isFinite(ts)) {
                return res.status(401).json({ error: 'Invalid webhook timestamp.' });
            }
            const now = Math.floor(Date.now() / 1000);
            if (Math.abs(now - ts) > maxSkewSeconds) {
                return res.status(401).json({ error: 'Stale webhook timestamp.' });
            }
        }

        // Compute HMAC over the raw body bytes. `req.rawBody`
        // is populated by the `verify` hook in express.json() —
        // see index.js for the parser config. We accept either
        // a Buffer (preserved by some parsers) or a UTF-8 string.
        const raw = req.rawBody;
        if (!raw) {
            return res.status(400).json({ error: 'Raw body unavailable for signature verification.' });
        }
        const expected = crypto
            .createHmac('sha256', secret)
            .update(Buffer.isBuffer(raw) ? raw : Buffer.from(String(raw), 'utf8'))
            .digest(encoding);

        if (!safeEqual(expected, supplied)) {
            return res.status(401).json({ error: 'Invalid webhook signature.' });
        }

        return next();
    };
}
