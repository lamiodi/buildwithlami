// ─── src/utils/cache.js ───────────────────────────────────
// Tiny in-memory TTL cache for the public, low-mutation CMS
// reads. Marketing content (testimonials, equipment, pages)
// changes weekly at most; a 60-120s cache is invisible to
// visitors and removes those endpoints from the DB hot path.
//
// State is per-process. If the backend ever scales to multiple
// nodes, swap this for a shared store (Redis or a small
// `cms_cache` table). For a single Render instance, the in-memory
// map is the right trade-off — no new infra, no network hops.
// ──────────────────────────────────────────────────────────

const store = new Map();

/**
 * Read a cached value if it's still fresh.
 * @param {string} key
 * @returns {{hit: true, value: any} | {hit: false}}
 */
export function cacheGet(key) {
    const entry = store.get(key);
    if (!entry) return { hit: false };
    if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return { hit: false };
    }
    return { hit: true, value: entry.value };
}

/**
 * Store a value with a time-to-live in milliseconds.
 */
export function cacheSet(key, value, ttlMs) {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/**
 * Drop every cache entry whose key starts with the given prefix.
 * Called by admin write endpoints so a fresh publish is visible
 * to the next public read.
 */
export function cacheInvalidatePrefix(prefix) {
    for (const key of store.keys()) {
        if (key.startsWith(prefix)) store.delete(key);
    }
}

/**
 * Express middleware factory. Wraps a handler with cache lookup
 * and Cache-Control header injection.
 *
 * @param {object} opts
 * @param {number} opts.ttlMs           how long responses stay fresh
 * @param {string} opts.keyPrefix       namespace for invalidation
 * @param {string} [opts.cacheControl]  Cache-Control value to set on hits
 * @param {number} [opts.cacheControlSMaxAge] s-maxage override for CDN
 */
export function withCache({ ttlMs, keyPrefix, cacheControl = 'public, max-age=60, s-maxage=300' }) {
    return async (req, res, next) => {
        // Build a deterministic key from the route + sorted query params.
        const queryKeys = Object.keys(req.query).sort();
        const queryString = queryKeys.map((k) => `${k}=${String(req.query[k])}`).join('&');
        const key = `${keyPrefix}:${req.path}:${queryString}`;

        const cached = cacheGet(key);
        if (cached.hit) {
            res.set('Cache-Control', cacheControl);
            res.set('X-Cache', 'HIT');
            return res.json(cached.value);
        }

        // Intercept res.json to capture the response body for the next caller.
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            // Only cache successful 200 responses with a non-empty body.
            if (res.statusCode === 200 && body !== null && body !== undefined) {
                cacheSet(key, body, ttlMs);
            }
            res.set('Cache-Control', cacheControl);
            res.set('X-Cache', 'MISS');
            return originalJson(body);
        };

        next();
    };
}
