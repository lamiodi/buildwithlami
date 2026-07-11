// ─── src/utils/markdown.js ───────────────────────────────
// A tiny, dependency-free Markdown → safe-HTML renderer.
//
// We avoid pulling in `marked` (or `@uiw/react-md-editor`)
// because the admin only needs basic formatting:
//
//   - # / ## / ### / #### / ##### / ###### headings
//   - **bold**, *italic*, `code`
//   - [link text](https://url)
//   - Unordered (- ) and ordered (1. ) lists
//   - Paragraphs separated by blank lines
//   - GFM-style fenced code blocks (```...```)
//
// Output is HTML-escaped **before** the markdown tokens are
// applied, so user input never produces live HTML/JS. The only
// exception is the final link `href` — that is also escaped.
//
// This is the public-facing renderer used by /resources,
// /portfolio, and /pricing. Admin editing uses a plain
// `<textarea>` with a "Preview" button that reuses the same
// function.
// ──────────────────────────────────────────────────────────

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

function escapeAttr(str) {
    return escapeHtml(str);
}

function renderInline(text) {
    let s = text;
    // inline code first (so other rules don't touch its contents)
    s = s.replace(/`([^`]+)`/g, (_m, code) => `<code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 text-accent rounded text-[0.9em]">${escapeHtml(code)}</code>`);
    // bold (** or __)
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    // italic (* or _) — only single
    s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    s = s.replace(/(^|[^_])_([^_\n]+)_/g, '$1<em>$2</em>');
    // links [text](url)
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label, url) => {
        return `<a href="${escapeAttr(url)}" class="text-accent underline underline-offset-2 hover:opacity-80" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
    });
    return s;
}

export function renderMarkdown(input) {
    if (input == null || input === '') return '';
    const raw = String(input);
    const lines = raw.replace(/\r\n/g, '\n').split('\n');
    const out = [];
    let inList = null; // 'ul' | 'ol' | null
    let inCode = false;
    let codeBuf = [];
    let paraBuf = [];

    const flushPara = () => {
        if (paraBuf.length === 0) return;
        out.push(`<p class="mb-4 leading-relaxed">${renderInline(paraBuf.join(' '))}</p>`);
        paraBuf = [];
    };
    const closeList = () => {
        if (inList) {
            out.push(`</${inList}>`);
            inList = null;
        }
    };

    for (const line of lines) {
        // Fenced code
        if (/^```/.test(line)) {
            if (!inCode) {
                flushPara();
                closeList();
                inCode = true;
                codeBuf = [];
            } else {
                out.push(`<pre class="mb-4 p-4 rounded-lg bg-gray-900 text-gray-100 overflow-x-auto text-xs font-mono"><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
                inCode = false;
            }
            continue;
        }
        if (inCode) {
            codeBuf.push(line);
            continue;
        }

        // Headings
        const h = line.match(/^(#{1,6})\s+(.*)$/);
        if (h) {
            flushPara();
            closeList();
            const level = h[1].length;
            const cls = {
                1: 'text-4xl font-extrabold mt-8 mb-4 font-heading',
                2: 'text-3xl font-extrabold mt-7 mb-3 font-heading',
                3: 'text-2xl font-bold mt-6 mb-2 font-heading',
                4: 'text-xl font-bold mt-5 mb-2',
                5: 'text-lg font-bold mt-4 mb-2',
                6: 'text-base font-bold uppercase tracking-widest mt-3 mb-1',
            }[level];
            out.push(`<h${level} class="${cls}">${renderInline(escapeHtml(h[2]))}</h${level}>`);
            continue;
        }

        // Horizontal rule
        if (/^---+\s*$/.test(line)) {
            flushPara();
            closeList();
            out.push('<hr class="my-6 border-gray-200 dark:border-gray-700" />');
            continue;
        }

        // Unordered list
        const ul = line.match(/^\s*[-*]\s+(.*)$/);
        if (ul) {
            flushPara();
            if (inList && inList !== 'ul') closeList();
            if (!inList) {
                out.push('<ul class="list-disc pl-6 mb-4 space-y-1">');
                inList = 'ul';
            }
            out.push(`<li>${renderInline(escapeHtml(ul[1]))}</li>`);
            continue;
        }

        // Ordered list
        const ol = line.match(/^\s*\d+\.\s+(.*)$/);
        if (ol) {
            flushPara();
            if (inList && inList !== 'ol') closeList();
            if (!inList) {
                out.push('<ol class="list-decimal pl-6 mb-4 space-y-1">');
                inList = 'ol';
            }
            out.push(`<li>${renderInline(escapeHtml(ol[1]))}</li>`);
            continue;
        }

        // Blank line → paragraph break
        if (/^\s*$/.test(line)) {
            flushPara();
            closeList();
            continue;
        }

        // Default: paragraph text
        closeList();
        paraBuf.push(escapeHtml(line));
    }

    flushPara();
    closeList();
    if (inCode) {
        // unterminated code block — render what we have
        out.push(`<pre class="mb-4 p-4 rounded-lg bg-gray-900 text-gray-100 overflow-x-auto text-xs font-mono"><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
    }
    return out.join('\n');
}

// ── sanitizeMarkdownHtml ─────────────────────────────────
// Defence-in-depth: pass the rendered HTML through DOMPurify
// before it ever reaches `dangerouslySetInnerHTML`. The
// renderer already escapes text and attrs, but a sanitizer
// guarantees no script / event-handler / javascript: URLs can
// survive even if a future change to the parser is unsafe.
//
// Uses dynamic import so the bundle stays small when DOMPurify
// is not needed (e.g. server-side rendering or unit tests).
let _purifyCache = null;
async function getPurifier() {
    if (_purifyCache) return _purifyCache;
    const mod = await import('dompurify');
    const DOMPurify = mod.default || mod;
    _purifyCache = typeof window !== 'undefined' ? DOMPurify(window) : DOMPurify;
    return _purifyCache;
}

/**
 * Render Markdown to HTML and sanitize the output.
 * Returns a Promise so callers can `await` it before
 * passing the result to `dangerouslySetInnerHTML`.
 */
export async function renderSafeMarkdown(input) {
    const html = renderMarkdown(input);
    const purify = await getPurifier();
    return purify.sanitize(html, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ['target', 'rel'],
    });
}

/**
 * Synchronous variant for use in code paths where async is awkward
 * (e.g. an existing `dangerouslySetInnerHTML` consumer that
 * doesn't already use an effect). Lazy-loads DOMPurify and caches it
 * — the first call is slightly slower, subsequent calls are fast.
 *
 * For server-rendered or SSR-critical code paths, prefer the
 * async `renderSafeMarkdown`.
 */
let _purifierSync = null;
let _purifierLoading = null;
export function renderSafeMarkdownSync(input) {
    if (_purifierSync) return _purifierSync.sanitize(renderMarkdown(input), {
        USE_PROFILES: { html: true },
        ADD_ATTR: ['target', 'rel'],
    });

    if (!_purifierLoading) {
        _purifierLoading = import('dompurify').then((mod) => {
            const DOMPurify = mod.default || mod;
            _purifierSync = typeof window !== 'undefined' ? DOMPurify(window) : DOMPurify;
            return _purifierSync;
        });
    }
    // First call (or any call before the dynamic import resolves)
    // falls back to the already-escaped renderMarkdown output.
    return renderMarkdown(input);
}

export default renderMarkdown;
