# BuildWithLami — Production-Readiness Audit

**Audit date:** 2026-09-07
**Scope:** Full monorepo (`frontend/`, `backend/`, root configs, public assets, docs)
**Audit type:** Static review (no runtime checks)
**Auditor:** Automated multi-agent audit pass + manual verification of high-impact claims

> **Note:** This document augments the existing `docs/PRODUCTION_READINESS_AUDIT.md`. It does not replace it. Sections are grouped by severity and topic; every finding includes a one-line fix.

---

## Severity legend

| Tag | Meaning |
| --- | --- |
| 🔴 **BLOCKER** | Breaks the build, blocks production logins, ships customer PII to logs, fabricates content, or causes a runtime crash. Must fix before deploy. |
| 🟠 **HIGH** | Visible bugs, security gaps, brand/trust issues, missing SEO meta on indexable pages, broken a11y on primary flows. |
| 🟡 **MEDIUM** | Polish, consistency, perf, hardening. Fix in next sprint. |
| 🟢 **LOW** | Nice-to-have, comment hygiene, minor drift. |

---

## 🔴 BLOCKERS (must fix before deploy)

### B1. `frontend/package.json` — non-existent major versions of Vite, ESLint, `@eslint/js`
- **File:** [frontend/package.json](file:///c:/Users/nuke/Documents/buildwithlami/frontend/package.json) lines 35, 40, 47
- **Versions:** `vite@^8.0.10`, `eslint@^10.2.1`, `@eslint/js@^10.0.1`
- **Problem:** As of Jan 2026 these majors do not exist on npm (latest stable: Vite 6.x, ESLint 9.x). `npm ci` / `npm install` will fail, breaking every CI run and every fresh clone.
- **Fix:** Pin to real majors — e.g. `vite@^6.0.0`, `eslint@^9.x`, `@eslint/js@^9.x` — and re-generate `package-lock.json`. Audit `lucide-react@^1.11.0` (likely should be `^0.4xx`) at the same time.

### B2. `ContactPage.jsx` — `serviceParam/tierParam/currencyParam` referenced outside their scope
- **File:** [frontend/src/pages/ContactPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ContactPage.jsx) lines 110–113 vs 152–154
- **Problem:** The three URL params are declared `const` inside the `useEffect` at line 99. `handleSubmit` (line 136) closes over the component scope and tries to read them at lines 152–154, throwing `ReferenceError: serviceParam is not defined` whenever a visitor arrives with `?service=…&tier=…&currency=…` (the exact path used by the Pricing CTA buttons).
- **Impact:** Every "Start this package" button from `/pricing` crashes the contact form.
- **Fix:** Hoist `serviceParam/tierParam/currencyParam` into component state (e.g. `useState` initialised from `location.search`) or read `new URLSearchParams(window.location.search)` directly inside `handleSubmit`.

### B3. Backend CORS allows only the Vercel preview, blocks apex domain
- **File:** [backend/src/index.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/index.js) lines 107–113
- **Problem:** CORS allowlist contains only `https://buildwithlami.vercel.app`. Production apex `https://buildwithlami.com` and `www.buildwithlami.com` are not allowed. With `credentials: true`, an unmatched origin returns no `Access-Control-Allow-Origin` header and **all production logins fail**.
- **Fix:** Replace the static array with a function-based `origin` callback that matches `process.env.FRONTEND_URL`, `buildwithlami.com`, `www.buildwithlami.com`, plus any `*.vercel.app` preview host.

### B4. Missing security response headers (CSP, HSTS, X-CTO, Referrer-Policy, Permissions-Policy)
- **File:** [frontend/vercel.json](file:///c:/Users/nuke/Documents/buildwithlami/frontend/vercel.json) lines 10–42
- **Problem:** Only `Cache-Control` and `Content-Type` are set. The site serves a login form, contact form, and admin dashboard; missing HSTS and CSP is an OWASP fail.
- **Fix:** Add the standard header set: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and a `Content-Security-Policy` allowing only the Render API and self-hosted assets.

### B5. `public/404.html` script is broken and exposes hosting ambiguity
- **File:** [frontend/public/404.html](file:///c:/Users/nuke/Documents/buildwithlami/frontend/public/404.html) lines 10–14
- **Problem:** The `l.replace(...)` call builds a broken URL concatenation and does not forward to `/index.html`. On a Vercel deploy (where `vercel.json` already rewrites), this means deep-link refreshes (e.g. `/projects/abc`) hit a real 404 page with no SPA fallback, breaking share previews and SEO indexing of inner routes.
- **Fix:** Delete `public/404.html` if Vercel-only, OR simplify to `l.replace(l.pathname + l.search + l.hash)` and document that the file is for Cloudflare Pages only. Pick one host and delete the other's config (also see M10).

### B6. `robots.txt` does not block `/portal`, `/sign`, `/contracts/sign`, `/pay`, `/form`, `/track`
- **File:** [frontend/public/robots.txt](file:///c:/Users/nuke/Documents/buildwithlami/frontend/public/robots.txt) lines 4–8
- **Problem:** Blocks `/admin` and `/account` but not the client-portal surfaces, signature flows, payment, intake, or tracking URLs. Google can index authenticated client data.
- **Fix:** Add `Disallow: /portal`, `Disallow: /portal/*`, `Disallow: /sign`, `Disallow: /sign/*`, `Disallow: /contracts/sign`, `Disallow: /contracts/sign/*`, `Disallow: /pay`, `Disallow: /form`, `Disallow: /track`, `Disallow: /forgot-password`, `Disallow: /reset-password`. Also add `<meta name="robots" content="noindex,nofollow">` on every protected route.

### B7. `lazyWithRetry.js` returns a Promise that never resolves during chunk reload
- **File:** [frontend/src/utils/lazyWithRetry.js](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/utils/lazyWithRetry.js) lines 21–22
- **Problem:** `window.location.reload()` triggers a reload but `return new Promise(() => {})` leaves Suspense suspended indefinitely. If the reload is blocked (browser back-forward cache, offline tab), the page hangs. Also, `componentImport.toString().slice(0, 40)` is a non-stable fingerprint — the sessionStorage key varies per call, so the retry flag never re-uses.
- **Fix:** Use a stable fingerprint (e.g. extract the path from the import URL), throw a sentinel error so Suspense falls back to the ErrorBoundary reload handler, and remove the hanging-promise pattern. Rely on `main.jsx`'s existing `vite:preloadError` reload handler instead of duplicating it here.

### B8. Pricing "Save ₦350k" claim on Pro Care is mathematically wrong
- **File:** [frontend/src/config/pricing.js](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/config/pricing.js) lines 180–183
- **Math:** `priceNGN = 350000`, `annualPriceNGN = 4200000`. Monthly × 12 = ₦4,200,000. The displayed annual is **₦3,850,000** with copy "Save ₦350k". Either the price is wrong or the badge is wrong — there is no actual saving versus the monthly plan.
- **Impact:** Misleading pricing on the public pricing page. Trust + legal risk.
- **Fix:** Set `annualPriceNGN = 3500000` and the formatted string to `"3,500,000 / yr (Save ₦700k vs monthly)"`, OR remove the "Save" badge and re-format as a single line.

### B9. `optimize-images.js` is not wired into `package.json`
- **File:** [frontend/scripts/optimize-images.js](file:///c:/Users/nuke/Documents/buildwithlami/frontend/scripts/optimize-images.js) vs [frontend/package.json](file:///c:/Users/nuke/Documents/buildwithlami/frontend/package.json) lines 6–11
- **Problem:** `sharp@^0.35.4` is installed as a dev dependency but no `npm` script invokes `optimize-images.js`. The hero `/1.png`, `/2.png`, etc. ship uncompressed.
- **Fix:** Add `"optimize:images": "node scripts/optimize-images.js"` and run it as part of CI / pre-build. Also ensure the script is idempotent and skips already-optimised assets.

### B10. `WhatsAppWidget` shows on `/admin/*` and `/portal/login`
- **File:** [frontend/src/App.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/App.jsx) lines 302–303
- **Problem:** `hideGlobalLayout` hides Navbar/Footer on auth/portal/admin routes, but `<WhatsAppWidget />` is rendered unconditionally. A floating WhatsApp chat bubble overlays the admin dashboard and the client login — visually wrong and a privacy leak.
- **Fix:** Wrap `WhatsAppWidget` in the same `!hideGlobalLayout` condition (or compute its own `hideOnPortal` boolean).

---

## 🟠 HIGH

### H1. `SendTestEmail.js` logs SMTP credentials
- **File:** [backend/src/scripts/sendTestEmail.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/scripts/sendTestEmail.js) lines 13–16
- **Problem:** `console.log` of `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `EMAIL_FROM` to stdout. If ever run in CI logs or accidentally committed, secrets leak.
- **Fix:** Mask with `<set>` / `<unset>` placeholders, or guard behind `if (process.env.DEBUG)`.

### H2. Mock-email fallbacks log full `mailOptions` including PII
- **Files:** [backend/src/services/emailService.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/services/emailService.js) line 82–89, [backend/src/services/templateService.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/services/templateService.js) lines 71–77, [backend/src/services/paymentEmailService.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/services/paymentEmailService.js) line 31
- **Problem:** When SMTP is misconfigured, `console.log` outputs `to`, `subject`, `html` — full message bodies containing customer PII.
- **Fix:** Log only masked recipient + messageId; never the body.

### H3. `App.jsx` runs duplicate scroll-to-top logic
- **File:** [frontend/src/App.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/App.jsx) lines 85–91 vs 138–151
- **Problem:** Two implementations of "scroll to top on route change" — `<ScrollToTop />` and a `useEffect` inside `App`. Both fire on every `pathname` change, racing each other for hash vs top.
- **Fix:** Delete `<ScrollToTop />`. Keep the in-effect logic that handles both hash and top.

### H4. `ErrorBoundary` wraps the entire chrome; one widget crash takes down nav
- **File:** [frontend/src/App.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/App.jsx) line 220
- **Problem:** `<ErrorBoundary>` wraps Navbar, Footer, WhatsAppWidget, Toaster, SoundEffects, ToastHost. A throw inside any of them kills the entire app chrome — the user sees the error fallback without nav and cannot escape except via the in-page buttons.
- **Fix:** Move the `<ErrorBoundary>` to wrap just `<main>` (the `<Routes>`). Wrap individual widgets (`WhatsAppWidget`, `SoundEffects`, `ToastHost`) in their own small silent boundaries.

### H5. Three modals missing body-scroll-lock, ESC, focus-trap, and ARIA
- **Files:** [frontend/src/pages/drone/DroneHomePage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/drone/DroneHomePage.jsx) lines 1492–1601 (3 modals), [frontend/src/pages/survey/SurveyHomePage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/survey/SurveyHomePage.jsx) lines 1622–1835 (3 modals), [frontend/src/components/FilePreviewModal.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/FilePreviewModal.jsx) (iframes swallow ESC, no focus restore)
- **Problem:** No `role="dialog"` / `aria-modal`, no body overflow lock, no focus trap, no focus restore on close. Mobile users can scroll the page behind the modal; screen-reader users get no semantics.
- **Fix:** Extract one shared `<Modal>` component (`focus-trap-react` + body-lock + ESC + ARIA) and refactor all six modals + `FilePreviewModal` to use it.

### H6. Brand string inconsistency — 4+ variants of "BuildWithLami" in production
- **Files:** 28+ files including [frontend/src/components/Navbar.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Navbar.jsx) lines 83/87/92/96/203/289, [frontend/src/components/Footer.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Footer.jsx) lines 66/74/126/141, [frontend/src/components/Preloader.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Preloader.jsx) lines 180/186/195–196, [frontend/src/pages/AboutPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/AboutPage.jsx) passim
- **Variants in active use:** `Buildwith_lami`, `BuildWith_Lami`, `BuildWithLami`, `BUILDWITH_LAMI`, `buildwithlami` (slug).
- **Problem:** Screen readers may treat them as different words; SEO deduplication is inconsistent; visible text in preloader vs footer disagrees.
- **Fix:** Add `config/brand.js` with `BRAND = { name: 'BuildWith_Lami', slug: 'buildwithlami', legalName: 'BuildWith_Lami Studios' }`. Replace every literal with `BRAND.name`. The "BUILDWITH_LAMI" CSS-uppercase headline should be CSS `uppercase`, not a separate literal.

### H7. Hardcoded URLs duplicated across components instead of using `config/`
- **Files:** [frontend/src/components/Footer.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Footer.jsx) lines 46/58/110, [frontend/src/components/DroneFooter.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/DroneFooter.jsx) lines 70/104/267/274/275, [frontend/src/components/WhatsAppWidget.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/WhatsAppWidget.jsx) lines 36/170/305
- **Problem:** TikTok URL repeated 3× in Footer; WhatsApp number fallback `'2349064185442'` in DroneFooter (drift risk); LinkedIn placeholder `linkedin.com` (broken); Instagram hardcoded.
- **Fix:** Centralize social URLs in `config/social.js`. Replace `|| '2349064185442'` fallback with the canonical `CONTACT.phoneE164` from `config/contact.js`. Remove or correct the LinkedIn placeholder.

### H8. Many `<button>` elements missing `type="button"`
- **Files:** [frontend/src/pages/drone/DroneHomePage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/drone/DroneHomePage.jsx) (multiple), [frontend/src/pages/drone/DroneProjectDetailPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/drone/DroneProjectDetailPage.jsx) lines 1143/1150/1156, [frontend/src/pages/survey/SurveyHomePage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/survey/SurveyHomePage.jsx) lines 131–140/200–205/566–591/1380–1391, [frontend/src/pages/AboutPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/AboutPage.jsx) line 587 (OK; verify all tabs), [frontend/src/pages/PricingPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/PricingPage.jsx), [frontend/src/pages/ServicesPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ServicesPage.jsx) lines 2/11 (also dead `useNavigate` import)
- **Problem:** Default `type="submit"` can accidentally submit ancestor forms if any are ever added.
- **Fix:** Add `type="button"` to every non-submit button globally.

### H9. `useReducedMotion()` ignored on Drone/Survey/Project pages
- **Files:** [frontend/src/pages/drone/DroneHomePage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/drone/DroneHomePage.jsx) line 82 (`reduce` aliased, never used), [frontend/src/pages/drone/DroneProjectDetailPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/drone/DroneProjectDetailPage.jsx) line 1191 (called inside JSX — also Rules of Hooks violation), [frontend/src/pages/survey/SurveyProjectDetailPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/survey/SurveyProjectDetailPage.jsx) line 1471–1507 (called inside JSX), [frontend/src/pages/ServicesPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ServicesPage.jsx) (never consulted), [frontend/src/components/SoundEffects.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/SoundEffects.jsx) (never consulted — WCAG 2.2 SC 2.3.3 violation)
- **Problem:** Reduced-motion users still get full parallax/animations/sound. Rules of Hooks violations will break with stricter enforcement.
- **Fix:** Move every `useReducedMotion()` call to the top of its component. Branch all `whileHover`, `whileInView`, motion props on `shouldReduce`. Gate `SoundEffects` on `!shouldReduce`.

### H10. ProjectDetailPage falls back to `simpleicons.org` CDN for unknown tech icons
- **File:** [frontend/src/pages/ProjectDetailPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ProjectDetailPage.jsx) lines 250–272
- **Problem:** When a project references a tech not in `TechIcon`, the component silently hits `https://cdn.simpleicons.org/${slug}.svg`. If simpleicons is unreachable or lacks the slug, broken icons appear with no error UI.
- **Fix:** Add `onError` handler to swap to a generic `Code` icon, OR require explicit icons per project (no remote fallback).

### H11. Survey project detail page **fabricates** numeric stats when API data is missing
- **File:** [frontend/src/pages/survey/SurveyProjectDetailPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/survey/SurveyProjectDetailPage.jsx) lines 280–292
- **Problem:** `deriveResults` returns hardcoded defaults (`'12.4 ha'`, `28`, `6`, `'14.2 m'`, `'36 h'`, `'±0.02 m'`, `'14 days'`, `7`) for every project whose API response lacks `stats`. This **silently invents survey metrics** and presents them as real.
- **Impact:** Misrepresentation risk. Survey deliverables are legally binding documents.
- **Fix:** Return `null` for unavailable stats and hide the corresponding card. If metrics are illustrative, label them clearly.

### H12. Drone project detail equipment catalog is fabricated
- **File:** [frontend/src/pages/drone/DroneProjectDetailPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/drone/DroneProjectDetailPage.jsx) lines 113–150/157–193
- **Problem:** Equipment/deliverable catalogs hardcode stock descriptions and `images.unsplash.com` URLs that do not match real owned gear (the Survey division explicitly listed only DJI Mini 4K, DGPS, Handheld GPS, Auto Level as owned).
- **Fix:** Mirror the Survey "real kit only" pattern; remove inflated specs; host real equipment photos locally.

### H13. Project "Featured" logic hardcoded by string id
- **File:** [frontend/src/pages/ProjectsPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ProjectsPage.jsx) line 67
- **Problem:** `p.id === 'VonneX2X'` — when the real API replaces fallback data, the featured slot breaks silently.
- **Fix:** Add a `featured: true` flag from the API, or use `p.tags?.includes('featured')`.

### H14. Service-side `index.js` has a stale "Removed formRoutes" comment
- **File:** [backend/src/index.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/index.js) line 20
- **Problem:** `// Removed formRoutes as it was replaced by templateRoutes` — stale dev comment imported into the production code path.
- **Fix:** Delete the comment.

### H15. Inconsistent Google Fonts injection leaves orphan `<style>` nodes
- **Files:** [frontend/src/pages/drone/DroneHomePage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/drone/DroneHomePage.jsx) lines 28–78, [frontend/src/pages/survey/SurveyHomePage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/survey/SurveyHomePage.jsx) lines 53–124
- **Problem:** `useFontsEffect` re-injects Google Fonts `<link>` tags on every mount and on every render via `useLayoutEffect`. Navigating in/out of `/drone` and `/survey` can leak multiple `<style data-*-fonts>` nodes.
- **Fix:** Store created nodes in a `useRef([])` and remove only the nodes the hook created on cleanup. Use a global font registry to dedupe across pages.

### H16. `notify.js` lacks dedupe and queue cap
- **File:** [frontend/src/services/notify.js](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/services/notify.js)
- **Problem:** Any module can call `notify.*` rapidly (e.g. on form submit error loops). With no dedupe and no queue cap, the toast stack grows unbounded; React renders dozens of identical toasts. `dismiss(id)` returns nothing (silent no-op for callers that expected confirmation).
- **Fix:** Add a short dedupe window (e.g. ignore identical `(type, message)` within 1s) and a max-queue cap (e.g. 4). Return a boolean from `dismiss(id)`.

### H17. `<select>` forced white-on-white option styling breaks high-contrast
- **File:** [frontend/src/index.css](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/index.css) lines 119–149
- **Problem:** `.dark select option { background: #141414; color: #f3f3f3 }` overrides OS color schemes; Windows high-contrast mode can render options white-on-white. Chevron SVG `stroke=%238888` fails WCAG non-text UI contrast (≥3:1).
- **Fix:** Drop the `option` overrides, or set both with verified contrast. Use mask-image so the chevron inherits the current `color`.

### H18. No skip-to-content link; `<main>` has no `id` or `tabIndex`
- **File:** [frontend/src/App.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/App.jsx) line 222–301
- **Fix:** Add `<a href="#main" className="sr-only focus:not-sr-only …">Skip to content</a>` as the first child of the wrapper, and `id="main" tabIndex={-1}` on `<main>`.

### H19. Custom outline removal without replacement on `.bwl-input`
- **File:** [frontend/src/index.css](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/index.css) line 201
- **Problem:** `.bwl-input { … focus:outline-none focus:border-accent … }` removes the browser focus ring and replaces it with a 1px accent border — fails WCAG 2.4.7 Focus Visible.
- **Fix:** Standardize on `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none`.

### H20. Forms missing `aria-invalid` / `aria-describedby`
- **Files:** [frontend/src/components/Contact.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Contact.jsx), [frontend/src/pages/LoginPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/LoginPage.jsx) (labels missing `htmlFor`), [frontend/src/pages/ContactPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ContactPage.jsx)
- **Fix:** Wire `id` ↔ `htmlFor`, add `aria-invalid={!!err}` and `aria-describedby={err ? \`\${id}-err\` : undefined}` to every form field.

### H21. `og:type` mutated to `profile` on About and never reset
- **File:** [frontend/src/pages/AboutPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/AboutPage.jsx) line 297
- **Problem:** Subsequent page navigations still report `og:type=profile` until manually reset.
- **Fix:** Build a shared `usePageMeta({ title, description, ogType, ogImage, canonical })` hook that **always sets** all known tags to a known state on mount.

### H22. Missing per-page OG/Twitter/canonical on most pages
- **Files:** Every page — only `HomePage` partially sets `og:*`; `PricingPage` sets only title; `Services/Contact/Projects` set only title + description.
- **Fix:** Adopt the `usePageMeta` helper from H21, set canonical to absolute URL per page.

### H23. Sitemap URLs missing `<lastmod>` and `/software`
- **File:** [frontend/public/sitemap.xml](file:///c:/Users/nuke/Documents/buildwithlami/frontend/public/sitemap.xml)
- **Fix:** Add `<lastmod>` (ISO 8601) per URL; add `/software` route (exists in `App.jsx`).

### H24. `index.html` missing OG image, Twitter image, apple-touch-icon
- **File:** [frontend/index.html](file:///c:/Users/nuke/Documents/buildwithlami/frontend/index.html) lines 31–40
- **Fix:** Add `og:image` (1200×630 ≤200KB), `twitter:image`, `<link rel="apple-touch-icon">`. The `og:url` and canonical are absolute homepage on every page — wrong.

### H25. No structured data (JSON-LD) anywhere
- **File:** [frontend/index.html](file:///c:/Users/nuke/Documents/buildwithlami/frontend/index.html) and all pages
- **Fix:** Inject via the per-page meta helper — Person schema on `/about`, Organization everywhere, WebSite + SearchAction on the homepage, BreadcrumbList on inner pages.

### H26. `index.html` preloads `/eugene-hero.webp` only above 768px
- **File:** [frontend/index.html](file:///c:/Users/nuke/Documents/buildwithlami/frontend/index.html) line 16
- **Problem:** Mobile users get no LCP preload → slower LCP.
- **Fix:** Add a second `<link rel="preload" media="(max-width: 767px)" href="/eugene-hero-400.webp">`.

### H27. Navbar admin link visible to client-portal users
- **File:** [frontend/src/components/Navbar.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Navbar.jsx) lines 129–136
- **Problem:** "Admin" link shows when `getAuthToken()` returns truthy. If a client-portal user has any admin token in the same key prefix (cross-portal leak risk), they see a link they cannot use.
- **Fix:** Verify `getAuthToken()` reads only the admin-namespaced key (`bwl:admin:token`). Render the link only when `user?.role === 'admin'`, not just on token presence. Add a "Log Out" item to the mobile drawer when `isLoggedIn`.

### H28. ClientPortalLayout logout uses `window.location.href` (full reload)
- **File:** [frontend/src/components/ClientPortalLayout.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/ClientPortalLayout.jsx) lines 22–25
- **Problem:** Breaks SPA navigation, flickers the preloader.
- **Fix:** Use `navigate('/portal/login', { replace: true })`.

### H29. Two competing SPA-fallback rewrites (`vercel.json` + `_redirects`)
- **Files:** [frontend/vercel.json](file:///c:/Users/nuke/Documents/buildwithlami/frontend/vercel.json) lines 2–9, [frontend/public/_redirects](file:///c:/Users/nuke/Documents/buildwithlami/frontend/public/_redirects) lines 1–2
- **Problem:** Both files declare SPA fallback. One is dead weight per host.
- **Fix:** Document the primary host in `README.md`. Delete the unused config.

### H30. `AdminLayout` sidebar branded "LAMI ODI CRM" — inconsistent with the rest of the studio
- **File:** [frontend/src/components/AdminLayout.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/AdminLayout.jsx) lines 122/124/202
- **Fix:** Use the same brand mark as the rest of the site (e.g. "BuildWith_Lami Admin"). Drop "CRM" or rename to "Workspace".

---

## 🟡 MEDIUM

### M1. `lucide-react@^1.11.0` — likely wrong major
- **File:** [frontend/package.json](file:///c:/Users/nuke/Documents/buildwithlami/frontend/package.json) line 25
- **Fix:** Confirm latest published major (likely `^0.4xx` as of Jan 2026) and pin.

### M2. React 19 peer-dependency risk on Radix UI
- **File:** [frontend/package.json](file:///c:/Users/nuke/Documents/buildwithlami/frontend/package.json) lines 13–20
- **Problem:** Some Radix packages have not published 19-compatible peer ranges.
- **Fix:** Verify `npm install` resolves cleanly; consider React 18 fallback if any peer conflict surfaces.

### M3. `fetchPriority` JSX attr is React 19+ only
- **File:** [frontend/src/components/Hero.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Hero.jsx) line 101
- **Fix:** If sticking with React 18, use imperative `setAttribute` via `useEffect`; or upgrade to React 19.

### M4. `PostCSS` mixes ESM + CommonJS
- **Files:** [frontend/postcss.config.js](file:///c:/Users/nuke/Documents/buildwithlami/frontend/postcss.config.js) (ESM), [frontend/tailwind.config.js](file:///c:/Users/nuke/Documents/buildwithlami/frontend/tailwind.config.js) line 75 (`require("tailwindcss-animate")`)
- **Fix:** Use ESM `import` for `tailwindcss-animate` in `tailwind.config.js`, or rename to `tailwind.config.cjs`.

### M5. `tailwind.config.js` `accent.DEFAULT` is a hardcoded hex while every other token uses CSS vars
- **File:** [frontend/tailwind.config.js](file:///c:/Users/nuke/Documents/buildwithlami/frontend/tailwind.config.js) line 36
- **Problem:** `accent.DEFAULT = "#F44A22"` will drift if `--accent` HSL in `index.css` changes.
- **Fix:** Set to `hsl(var(--accent) / <alpha-value>)` like the rest.

### M6. `fontFamily.handwritten` theme token declared but never used
- **Files:** [frontend/tailwind.config.js](file:///c:/Users/nuke/Documents/buildwithlami/frontend/tailwind.config.js) line 56, [frontend/src/index.css](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/index.css) line 230–232
- **Problem:** `font-signature` uses raw `Caveat` string, bypassing the theme token.
- **Fix:** Either delete `handwritten` token or replace raw `Caveat` in `.font-signature` with `theme('fontFamily.handwritten')`.

### M7. `jsconfig.json` missing Vite/React-friendly module resolution
- **File:** [frontend/jsconfig.json](file:///c:/Users/nuke/Documents/buildwithlami/frontend/jsconfig.json)
- **Fix:** Add `allowJs: true`, `moduleResolution: "bundler"`, `checkJs: false`.

### M8. Inline theme script can race React StrictMode double-invoke
- **File:** [frontend/index.html](file:///c:/Users/nuke/Documents/buildwithlami/frontend/index.html) lines 42–55
- **Fix:** Consider `useSyncExternalStore` for theme state, OR ensure the inline script also writes `localStorage.setItem('theme', …)` so the auto-detect toast in App.jsx doesn't re-fire.

### M9. `Cache-Control: must-revalidate` on entry HTML pairs fragile with hashed JS
- **File:** [frontend/vercel.json](file:///c:/Users/nuke/Documents/buildwithlami/frontend/vercel.json) lines 12–21
- **Fix:** Add `stale-while-revalidate=60` to the HTML policy.

### M10. `vercel.json` and `_redirects` duplicate SPA rewrite — pick a host
- See H29.

### M11. `/api/*` proxy points at Render — verify Render CORS / TLS / rate-limit
- **File:** [frontend/vercel.json](file:///c:/Users/nuke/Documents/buildwithlami/frontend/vercel.json) lines 4–7
- **Fix:** Lock Render CORS to exactly `https://buildwithlami.com`. Ensure cookies are `Secure; HttpOnly; SameSite=Lax`.

### M13. Inline theme script will break strict CSP
- See H4 of security audit.
- **Fix:** Use nonce-based CSP if enforcing strict, or `script-src 'self' 'unsafe-inline'` and document the trade-off.

### M14. `style={{ touchAction: 'manipulation' }}` repeated on every Link
- **Files:** [frontend/src/pages/AboutPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/AboutPage.jsx) lines 749/759, [frontend/src/pages/ServicesPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ServicesPage.jsx) lines 273/372/395, [frontend/src/pages/ProjectsPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ProjectsPage.jsx) lines 239/249/349/359/404/413
- **Fix:** Remove; rely on `.btn-*` classes (which already include it).

### M15. `<img>` without explicit `decoding="async"`
- **Files:** [frontend/src/pages/ProjectsPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ProjectsPage.jsx) lines 172/303, [frontend/src/components/Hero.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Hero.jsx)
- **Fix:** Add `decoding="async"` to all `<img>` tags.

### M16. `<img>` logo missing `width`/`height` (CLS)
- **File:** [frontend/src/components/Navbar.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Navbar.jsx) lines 85–94
- **Fix:** Add `width="48" height="48"` (or use `<picture>` with `<source media="(prefers-color-scheme: dark)">`).

### M17. `Footer.jsx` year hardcoded as `2026`
- **File:** [frontend/src/components/Footer.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Footer.jsx) line 7
- **Fix:** Use `new Date().getFullYear()`.

### M18. `Footer.jsx`, `DroneFooter.jsx`, `SurveyFooter.jsx` use different copyright patterns
- **Files:** [frontend/src/components/Footer.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Footer.jsx) line 141, [frontend/src/components/DroneFooter.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/DroneFooter.jsx) line 263, [frontend/src/components/SurveyFooter.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/SurveyFooter.jsx) line 98
- **Fix:** Centralize as a `<Copyright />` component.

### M19. Footer primary CTA labels diverge across divisions
- **Files:** [frontend/src/components/Footer.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Footer.jsx) ("Inquiries"), [frontend/src/components/DroneFooter.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/DroneFooter.jsx) ("Book a Flight"), [frontend/src/components/SurveyFooter.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/SurveyFooter.jsx) (no CTA), [frontend/src/components/Navbar.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Navbar.jsx) ("Start a Project")
- **Fix:** Per-division CTA map in one config.

### M20. Preloader overlay can trap focus
- **File:** [frontend/src/components/Preloader.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Preloader.jsx) and [frontend/src/App.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/App.jsx) lines 217–219
- **Fix:** Add `aria-live="polite"`, hide from a11y tree once finished, never trap focus.

### M21. Theme toggle button missing `aria-pressed`
- **File:** [frontend/src/components/Navbar.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Navbar.jsx) lines 305–321
- **Fix:** Add `aria-pressed={isDark}` and `aria-label={\`Switch to \${isDark ? 'light' : 'dark'} mode\`}`.

### M22. AdminLayout breadcrumb uppercases raw URL segments
- **File:** [frontend/src/components/AdminLayout.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/AdminLayout.jsx) lines 106–110
- **Problem:** "Crm" instead of "CRM", "2fa" instead of "2FA Security".
- **Fix:** Add label map (e.g. `{ crm: 'CRM', 'email-templates': 'Email Templates', '2fa': '2FA Security' }`).

### M23. AdminLayout `Outlet` missing `key` for animation continuity
- **File:** [frontend/src/components/AdminLayout.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/AdminLayout.jsx) line 292
- **Fix:** Match the `key={location.pathname}` pattern from `ClientPortalLayout`.

### M24. Contact form honeypot uses `hidden md:block` instead of `sr-only`
- **File:** [frontend/src/pages/ContactPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ContactPage.jsx) lines 227–238
- **Fix:** Use `className="sr-only"` + `tabIndex={-1}` + `aria-hidden="true"` on the input.

### M25. Contact form budget field is missing
- **File:** [frontend/src/pages/ContactPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ContactPage.jsx)
- **Fix:** Either render a budget `<select>` or remove the unused `budget` state.

### M26. `color-contrast`: `text-gray-400` on white fails WCAG AA
- **Files:** [frontend/src/pages/ContactPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ContactPage.jsx), [frontend/src/pages/ServicesPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ServicesPage.jsx)
- **Fix:** Use `text-gray-600` on white backgrounds; audit all `text-gray-400` on light surfaces.

### M27. `index.css` lacks `scroll-behavior: smooth`
- **File:** [frontend/src/index.css](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/index.css)
- **Fix:** Add `html { scroll-behavior: smooth }` (and respect `prefers-reduced-motion`).

### M28. `_redirects` `200` (vs `301`) for favicon means no caching
- **File:** [frontend/public/_redirects](file:///c:/Users/nuke/Documents/buildwithlami/frontend/public/_redirects) line 1
- **Fix:** Document intent in a header comment.

### M29. CSV helpers (`utils/csv.jsx`) — XSS surface and CSV injection
- **File:** [frontend/src/utils/csv.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/utils/csv.jsx)
- **Problem 1:** `HighlightedText` builds markup from regex without HTML-escaping the search term → XSS if search contains `<`.
- **Problem 2:** `toCSV` doesn't escape leading `=`/`+`/`-`/`@` → Excel formula execution.
- **Fix:** HTML-escape the search term before injecting. Prefix unsafe leading characters with `'` in CSV output.

### M30. `config/pricing.js` `Pro Care` — see B8 for the math fix
- Already in BLOCKERs.

### M31. `csv.jsx` `find`/`findIndex` micro-perf
- **File:** [frontend/src/pages/ProjectsPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ProjectsPage.jsx) lines 67–70
- **Fix:** Single pass with `reduce` or memoize the derived arrays.

### M32. Inline SVGs (Star, Arrow, Pill) defined per-file instead of shared
- **Files:** [frontend/src/pages/AboutPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/AboutPage.jsx) lines 191–231, [frontend/src/pages/NotFoundPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/NotFoundPage.jsx) passim, [frontend/src/pages/ProjectDetailPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ProjectDetailPage.jsx) lines 25–246
- **Fix:** Extract to `components/icons.jsx` or use lucide-react exclusively.

### M33. Two parallel toast systems (`ToastHost` + `Toaster` from sonner)
- **File:** [frontend/src/App.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/App.jsx) lines 308–309
- **Problem:** Both mounted — duplicate toasts possible.
- **Fix:** Grep `notify.*` callers; if unused, delete `ToastHost.jsx` and its import.

### M34. Routes `/pay`, `/form`, `/track` not in `hideGlobalLayout`
- **File:** [frontend/src/App.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/App.jsx) lines 277–281, 303
- **Problem:** Global Navbar/Footer and WhatsApp widget still render on full-screen payment/intake/tracking flows.
- **Fix:** Add `startsWith('/pay')`, `/form`, `/track` to the hide list.

### M35. DroneFooter has Studio Network link to `/software`; Software footer has no reciprocal link
- **File:** [frontend/src/components/DroneFooter.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/DroneFooter.jsx) line 231 vs [frontend/src/components/Footer.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Footer.jsx)
- **Fix:** Add reciprocal links to `/drone` and `/survey` in `Footer.jsx`.

### M36. `App.jsx` `<ScrollToTop />` + useEffect duplicate (see H3)
- Already in HIGHs.

### M37. `AdminLayout` mobile sidebar close uses inline SVG instead of lucide `X`
- **File:** [frontend/src/components/AdminLayout.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/AdminLayout.jsx) line 204
- **Fix:** Replace with `<X />` from lucide-react.

### M38. `ThemeToast` runs on every fresh device visit
- **File:** [frontend/src/App.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/App.jsx) lines 123–135
- **Fix:** Drop the toast or move behind an explicit user gesture.

### M39. `index.html` missing `<noscript>` fallback
- **File:** [frontend/index.html](file:///c:/Users/nuke/Documents/buildwithlami/frontend/index.html)
- **Fix:** Add a short JS-required notice inside `<body>`.

### M40. `_redirects` uses `200` (no cache) — see M28

### M41. `Star Pre-Production Audit Report Review.md` committed in `backend/src/scripts/`
- **File:** [backend/src/scripts/Senior Pre-Production Audit Report Review.md](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/scripts/Senior%20Pre-Production%20Audit%20Report%20Review.md)
- **Problem:** 2000+ line audit committed inside `src/`. Bloats repo, pollutes the runtime tree.
- **Fix:** Move to `docs/audits/` and delete from `src/scripts/`.

---

## 🟢 LOW

### L1. `index.html` `<html>` missing explicit `dir="ltr"`
- **File:** [frontend/index.html](file:///c:/Users/nuke/Documents/buildwithlami/frontend/index.html) line 2

### L2. `Footer.jsx` missing `<nav aria-label="Footer">`
- **File:** [frontend/src/components/Footer.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Footer.jsx) line 102

### L3. `Footer.jsx` QR image missing `loading="lazy"` + `width`/`height`
- **File:** [frontend/src/components/Footer.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Footer.jsx) lines 64–69

### L4. Hardcoded TikTok `↗` unicode arrows across footers
- **Files:** [frontend/src/components/Footer.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Footer.jsx), [frontend/src/components/DroneFooter.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/DroneFooter.jsx), [frontend/src/components/SurveyFooter.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/SurveyFooter.jsx)
- **Fix:** Use lucide `<ArrowUpRight />` with `<span className="sr-only"> (external link)</span>`.

### L5. Root `.gitignore` duplicates `frontend/.env` (lines 14, 32)
- **File:** [.gitignore](file:///c:/Users/nuke/Documents/buildwithlami/.gitignore)

### L6. `frontend/.gitignore` includes stale `dist-ssr`
- **File:** [frontend/.gitignore](file:///c:/Users/nuke/Documents/buildwithlami/frontend/.gitignore) line 12

### L7. `backend/.gitignore` missing `coverage/`, `.nyc_output/`, `npm-debug.log*`, `*.pem`/`*.key`/`*.crt`/`*.p12`
- **File:** [backend/.gitignore](file:///c:/Users/nuke/Documents/buildwithlami/backend/.gitignore)

### L8. `backend/package.json` `main` field misleading
- **File:** [backend/package.json](file:///c:/Users/nuke/Documents/buildwithlami/backend/package.json) line 8
- **Fix:** Remove `main` or set `private: true`.

### L9. `backend/src/index.js` startup log uses emoji + `localhost`
- **File:** [backend/src/index.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/index.js) line 210
- **Fix:** Use `0.0.0.0:${PORT}`; drop emoji.

### L10. `404.html` exposes internal architecture comments
- **File:** [frontend/public/404.html](file:///c:/Users/nuke/Documents/buildwithlami/frontend/public/404.html) lines 7–17

### L11. `key={idx}` (index) used in lists — animation continuity breaks on reorder
- **Files:** [frontend/src/pages/ServicesPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ServicesPage.jsx) line 261, [frontend/src/pages/ProjectsPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ProjectsPage.jsx) lines 226/338
- **Fix:** Use stable identifiers.

### L12. `framer-motion` animation density on every page mount
- **Files:** All pages — `motion.div` / `AnimatePresence` extensively.
- **Fix:** Honor `prefers-reduced-motion` more aggressively (see H9).

### L13. `SecurityPopup` defined but never imported
- **File:** [frontend/src/components/SecurityPopup.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/SecurityPopup.jsx) — dead code.
- **Fix:** Remove or wire it up (intended location: GitHub link in `AboutPage` / `ProjectsPage`).

### L14. `services/auth.js` is dead code that *would* lose the token
- **File:** [frontend/src/services/auth.js](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/services/auth.js) — if anyone imports it, the storage key differs from `AuthContext`'s.
- **Fix:** Delete, OR refactor to import from `AuthContext` directly.

### L15. "Lagos Base // Deployments Nationwide" duplicated in DroneFooter + SurveyFooter
- **Files:** [frontend/src/components/DroneFooter.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/DroneFooter.jsx) line 116, [frontend/src/components/SurveyFooter.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/SurveyFooter.jsx) line 101
- **Fix:** Extract to `config/contact.js` as `CONTACT.serviceArea`.

### L16. `helmet()` called without options
- **File:** [backend/src/index.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/index.js) line 106
- **Fix:** Configure `helmet({ contentSecurityPolicy: { directives: { … } } })` to mirror Vercel CSP.

### L17. `db.js` `allowExitOnIdle: false` contradicts its own comment
- **File:** [backend/src/config/db.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/config/db.js) line 40

### L18. `HomePage.jsx` title format uses em-dash, others use `|`
- **File:** [frontend/src/pages/HomePage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/HomePage.jsx) lines 14–18
- **Fix:** Standardise on `"Page Title | Buildwith_lami"`.

### L19. `NotFoundPage` lacks `noindex` meta — search engines can index 404s
- **File:** [frontend/src/pages/NotFoundPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/NotFoundPage.jsx) lines 12–14

### L20. `ProjectDetailPage` Quick stats strip lacks `<dl>/<dt>/<dd>` semantics
- **File:** [frontend/src/pages/ProjectDetailPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ProjectDetailPage.jsx) line 691

---

## Appendix A — Confirmed BLOCKER details (line-by-line)

### B1 — `frontend/package.json`

```json
{
  "devDependencies": {
    "@eslint/js": "^10.0.1",          // ← BLOCKER: 10.x not published as of Jan 2026
    "eslint": "^10.2.1",              // ← BLOCKER: 10.x not published
    "vite": "^8.0.10"                 // ← BLOCKER: 8.x not published
  }
}
```

Latest published majors (Jan 2026): `vite@6.x`, `eslint@9.x`, `@eslint/js@9.x`. `lucide-react@1.11.0` is also suspect (likely should be `^0.4xx`).

### B2 — `ContactPage.jsx`

`useEffect` (lines 99–134) declares three `const` URL params inside the effect scope:

```jsx
useEffect(() => {
  …
  const params = new URLSearchParams(location.search);
  const serviceParam = params.get('service');   // ← declared inside effect
  const tierParam = params.get('tier');
  const currencyParam = params.get('currency');
  …
}, [location.search]);
```

`handleSubmit` (line 136) closes over the component scope and references them:

```jsx
const res = await api.post('/contact', {
  …
  service: serviceParam || null,   // ← ReferenceError if URL had ?service=…
  tier: tierParam || null,
  currency: currencyParam || null,
  …
});
```

Repro: open `/contact?service=ecommerce&tier=Growth` (the exact path used by Pricing CTAs) and submit. The browser console will show `ReferenceError: serviceParam is not defined`.

### B7 — `lazyWithRetry.js`

```js
return React.lazy(async () => {
  const sessionKey = `retry_import_${componentImport.toString().slice(0, 40)}`;
  …
  try {
    const module = await componentImport();
    …
  } catch (error) {
    if (!hasRetried) {
      sessionStorage.setItem(sessionKey, 'true');
      window.location.reload();           // ← triggers reload
      return new Promise(() => {});       // ← Suspense hangs forever if reload is blocked
    }
    …
  }
});
```

The `slice(0, 40)` of `toString()` produces different strings on every call (e.g. arrow-function bodies, whitespace), so the sessionStorage flag is never reused — the `if (!hasRetried)` always fires and the page always reloads.

### B8 — `config/pricing.js` Pro Care

```js
priceNGN: 350000,                    // ₦350,000/mo
priceFormatted: '350,000 / mo',
annualPriceNGN: 4200000,             // ← 350000 × 12 = 4,200,000 (no discount)
annualPriceFormatted: '3,850,000 / yr (Save ₦350k)',  // ← contradicts both numbers
```

Either the annual is wrong (should be `3500000` for an actual ₦700k saving) or the copy is wrong (no actual saving at the current numbers).

---

## Appendix B — Files covered by this audit

### Frontend (`c:\Users\nuke\Documents\buildwithlami\frontend`)
- Configs: `package.json`, `vite.config.js`, `index.html`, `tailwind.config.js`, `postcss.config.js`, `jsconfig.json`, `components.json`, `eslint.config.js`, `vercel.json`
- Public: `_redirects`, `robots.txt`, `sitemap.xml`, `404.html`
- Entry: `src/main.jsx`, `src/App.jsx`, `src/index.css`
- All components in `src/components/` (Navbar, Footer, DroneFooter, SurveyFooter, AdminLayout, ClientPortalLayout, ErrorBoundary, ProtectedRoute, ClientProtectedRoute, Preloader, ThemeToast, ToastHost, WhatsAppWidget, SecurityPopup, FilePreviewModal, Hero, About, Services, Projects, Contact, Pricing, WhyChoose, WhyAndHow, HowItWorks, FAQ, Testimonials, TechStack, TechIcon, SoundEffects, Skeleton, CheckIcon, all admin/widgets/, all ui/)
- All pages in `src/pages/` (full read of all top-level pages; admin + client portal pages sampled for patterns)
- All contexts (`AuthContext`, `ClientAuthContext`)
- All utils (`motion`, `sound`, `csv`, `currency`, `formValidation`, `lazyWithRetry`, `markdown`, `placeholders`)
- All services (`api`, `auth`, `notify`)
- All configs (`contact`, `frontend`, `pricing`)
- All data files (`divisions`, `fallbackProjects`, `adminIcons`, `adminNavItems`)
- Scripts: `optimize-images.js`

### Backend (`c:\Users\nuke\Documents\buildwithlami\backend`)
- `package.json`, `eslint.config.js`, `.gitignore`
- `src/index.js`, `src/config/db.js`, `src/config/roles.js`
- Sampled services (`emailService`, `templateService`, `paymentEmailService`)
- Sampled scripts (`sendTestEmail`, `syncSoftwareProjects`, `resetPassword`)
- Confirmed existence of migrations (readme + 47 versioned files)

### Root
- `.gitignore`, `.github/workflows/ci.yml`

---

## Appendix C — Recommended fix order

1. **Pre-deploy BLOCKERS (B1–B10)** — these prevent install, crash the contact form, leak credentials, or break security headers.
3. **HIGH trust/SEO/a11y (H1–H30)** — public-facing issues that hurt conversions, search ranking, and screen-reader experience.
4. **Brand/CTA consistency (H6, H7, M18, M19, M32, L4)** — single biggest perceived-quality win.
5. **Per-page polish (M1–M41)** — incremental wins per file.
6. **LOW (L1–L20)** — comment hygiene and minor drift.

Total: 10 BLOCKER · 30 HIGH · 41 MEDIUM · 20 LOW = **101 findings**.