// ─── src/services/aiService.js ────────────────────────────
// Admin OS Phase 6 (Intelligence) — optional AI layer.
//
// Backs §91 Phase 6's AI-assisted features: client summaries,
// outreach drafts, quotation generation and the admin
// assistant. Every caller MUST have a deterministic fallback —
// the product works fully without a key (blueprint §97.16:
// stubbed integrations are marked, never faked).
//
// Configuration (env):
//   AI_API_KEY   — required to enable. No key ⇒ isAiConfigured()
//                  is false and callers use their rules fallback.
//   AI_BASE_URL  — OpenAI-compatible endpoint. Defaults to
//                  z.ai's chat endpoint (GLM family).
//   AI_MODEL     — defaults to glm-4.6.
//   AI_TIMEOUT_MS — per-request timeout, default 20000.
//
// Secrets never appear in logs; errors carry a `reason`, not
// the key or raw headers.
// ──────────────────────────────────────────────────────────

const DEFAULT_BASE_URL = 'https://api.z.ai/api/paas/v4';
const DEFAULT_MODEL = 'glm-4.6';
const DEFAULT_TIMEOUT_MS = 20000;

export class AiUnavailableError extends Error {
    /**
     * @param {string} reason  'not_configured' | 'http_<status>' |
     *                         'network' | 'empty' | 'parse'
     * @param {string} detail  safe, human-readable context
     */
    constructor(reason, detail = '') {
        super(detail ? `AI unavailable (${reason}): ${detail}` : `AI unavailable (${reason})`);
        this.name = 'AiUnavailableError';
        this.reason = reason;
    }
}

export function isAiConfigured() {
    return Boolean(process.env.AI_API_KEY);
}

const aiBaseUrl = () => (process.env.AI_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
const aiModel = () => process.env.AI_MODEL || DEFAULT_MODEL;

/**
 * One chat completion. `messages` follows the OpenAI shape:
 * [{ role: 'system'|'user'|'assistant', content }, …]
 *
 * @returns {Promise<string>} the assistant message content
 * @throws {AiUnavailableError}
 */
export async function chat(messages, { temperature = 0.4, maxTokens = 900, timeoutMs } = {}) {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) throw new AiUnavailableError('not_configured', 'AI_API_KEY is not set');

    const timeout = Number(process.env.AI_TIMEOUT_MS) || timeoutMs || DEFAULT_TIMEOUT_MS;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    let res;
    try {
        res = await fetch(`${aiBaseUrl()}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: aiModel(),
                messages,
                temperature,
                max_tokens: maxTokens,
            }),
            signal: controller.signal,
        });
    } catch (err) {
        const detail = err?.name === 'AbortError' ? `timed out after ${timeout}ms` : 'network error';
        throw new AiUnavailableError('network', detail);
    } finally {
        clearTimeout(timer);
    }

    if (!res.ok) {
        let body = '';
        try { body = (await res.text()).slice(0, 200); } catch { /* ignore */ }
        throw new AiUnavailableError(`http_${res.status}`, body);
    }

    let data;
    try {
        data = await res.json();
    } catch {
        throw new AiUnavailableError('parse', 'response was not JSON');
    }
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
        throw new AiUnavailableError('empty', 'no assistant content in response');
    }
    return content.trim();
}

/**
 * Chat that must return JSON. Tolerates markdown fences and
 * surrounding prose by extracting the outermost {...} or [...]
 * block before parsing.
 *
 * @returns {Promise<*>} parsed JSON value
 * @throws {AiUnavailableError} including reason 'parse'
 */
export async function chatJson(messages, opts = {}) {
    const raw = await chat(messages, { temperature: 0.2, ...opts });
    return parseJsonLoose(raw);
}

export function parseJsonLoose(raw) {
    let text = String(raw).trim();
    // Strip ```json … ``` fences.
    const fence = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    if (fence) text = fence[1].trim();

    try {
        return JSON.parse(text);
    } catch { /* fall through to block extraction */ }

    // First {…} or […] block that parses (models sometimes wrap
    // JSON in a sentence).
    for (const [open, close] of [['{', '}'], ['[', ']']]) {
        const start = text.indexOf(open);
        const end = text.lastIndexOf(close);
        if (start !== -1 && end > start) {
            try {
                return JSON.parse(text.slice(start, end + 1));
            } catch { /* try next shape */ }
        }
    }
    throw new AiUnavailableError('parse', `could not extract JSON from: ${text.slice(0, 120)}`);
}
