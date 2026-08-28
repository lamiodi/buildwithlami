// ─── src/utils/cache.js ───────────────────────────────────
// Tiny bounded in-memory LRU + TTL cache for the public, low-mutation
// marketing reads. State is per-process.
//
// Hard caps are enforced so a pathological query distribution
// (unique keys, e.g. attacker scanning with random params) cannot
// grow the map without limit:
//   - MAX_ENTRIES:   1000 entries  (oldest evicted on insert)
//   - DEFAULT_TTL:   60_000 ms     (overridable per cacheSet)
//
// If the backend ever scales to multiple nodes, swap this for
// a shared store (Redis or a small `cache` table). For a
// single Render instance, the in-memory LRU is the right
// trade-off — no new infra, no network hops.
// ──────────────────────────────────────────────────────────

const MAX_ENTRIES = 1000;
const DEFAULT_TTL_MS = 60_000;

/**
 * Internal entry: { value, expiresAt }.
 * Map iteration order is insertion order, so the first key is
 * the oldest — perfect for LRU eviction on overflow.
 */
const store = new Map();

/**
 * Insert an entry, enforcing the size cap. If we are at capacity,
 * evict the oldest (first-inserted) entry. Newly inserted entries
 * are moved to the "most recent" end by re-setting the same key.
 */
function setEntry(key, entry) {
    if (store.has(key)) {
        store.delete(key);
    } else if (store.size >= MAX_ENTRIES) {
        // Evict oldest — first key returned by iterator.
        const oldestKey = store.keys().next().value;
        if (oldestKey !== undefined) store.delete(oldestKey);
    }
    store.set(key, entry);
}

/**
 * Lazily prune expired entries on every read so the map
 * cannot slowly fill with stale items.
 */
function pruneExpired() {
    const now = Date.now();
    for (const [key, entry] of store) {
        if (now > entry.expiresAt) store.delete(key);
    }
}

/**
 * Read a cached value if it's still fresh.
 * Returns { hit: true, value } or { hit: false }.
 * @param {string} key
 */
export function cacheGet(key) {
    const entry = store.get(key);
    if (!entry) return { hit: false };
    if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return { hit: false };
    }
    // LRU touch: re-insert so this key is the most recent.
    setEntry(key, entry);
    return { hit: true, value: entry.value };
}

/**
 * Store a value with a time-to-live in milliseconds.
 * @param {string} key
 * @param {*} value
 * @param {number} [ttlMs] defaults to DEFAULT_TTL_MS
 */
export function cacheSet(key, value, ttlMs = DEFAULT_TTL_MS) {
    if (ttlMs <= 0) return; // ttl <= 0 means "do not cache"
    setEntry(key, { value, expiresAt: Date.now() + ttlMs });
}

/**
 * Drop every cache entry whose key starts with the given prefix.
 * Called by admin write endpoints so a fresh publish is visible
 * to the next public read.
 * @param {string} prefix
 */
export function cacheInvalidatePrefix(prefix) {
    for (const key of store.keys()) {
        if (key.startsWith(prefix)) store.delete(key);
    }
}

/**
 * Drop every cache entry. Use sparingly — primarily for tests.
 */
export function cacheClear() {
    store.clear();
}

/**
 * Cache stats for diagnostics / tests.
 * @returns {{ size: number, maxEntries: number, defaultTtlMs: number }}
 */
export function cacheStats() {
    pruneExpired();
    return {
        size: store.size,
        maxEntries: MAX_ENTRIES,
        defaultTtlMs: DEFAULT_TTL_MS,
    };
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
