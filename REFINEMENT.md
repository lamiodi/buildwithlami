# BuildWithLami — Premium UX, Performance & Interaction Refinement

**Status:** Phase 0 → Phase 1 (Audit) pending
**Base:** BuildWithLami Enterprise Platform v3.4 (production-ready, feature-complete)
**Nature of work:** A refinement pass — improve what already exists. Do NOT rebuild architecture, replace working systems, or add unnecessary dependencies.

---

## Guiding Skills

| Skill set | Applied to |
|---|---|
| **Taste** (`design-taste-frontend`, `high-end-visual-design`, `gpt-taste`) | Visual quality, hierarchy, typography, spacing, composition, polish |
| **Impeccable** (`impeccable` commands) | Production-quality implementation, accessibility, maintainability, responsive behavior, performance |
| **Emil Kowalski** (`animate`, `emil-design-eng`, `improve-animations`) | Subtle purposeful motion, transitions, micro-interactions, scroll behavior, hover states |

Use skills intelligently and **only where they improve the existing product**.

---

## Prime Directive

The website must feel: **FAST → IMMEDIATE → SMOOTH → PREMIUM**

- Do not assume something is broken because it could theoretically be improved. **Identify actual issues first.**
- Every animation must have a purpose. Every expensive effect must justify its cost.
- Do not sacrifice loading performance for visual effects.
- Mobile performance > decorative effects.

### Prefer

CSS transforms · opacity · compositor-friendly animations · lazy loading · code splitting · memoization where actually beneficial · IntersectionObserver · responsive image loading · `prefers-reduced-motion` support · GPU-friendly transitions · static rendering where appropriate

### Avoid

Unnecessary JS animations · excessive blur / `backdrop-filter` · large DOM animation trees · layout-triggering animations · unnecessary re-renders · giant client bundles · continuously running animations · unnecessary/duplicate API requests · heavy libraries for simple interactions

---

## Codebase Map (frontend)

| Area | Paths |
|---|---|
| Routes / lazy loading | `frontend/src/App.jsx` |
| Shared components | `frontend/src/components/` (Navbar, Hero, Footer, Preloader, TechStack (Matter.js), Services, Projects, Pricing, FAQ, Testimonials, Skeleton, ToastHost, WhatsAppWidget, …) |
| Layouts | `components/AdminLayout.jsx`, `components/ClientPortalLayout.jsx`, `ProtectedRoute.jsx`, `ClientProtectedRoute.jsx`, `ErrorBoundary.jsx` |
| Public pages | `pages/HomePage.jsx`, `ServicesPage.jsx`, `ProjectsPage.jsx`, `ProjectDetailPage.jsx`, `PricingPage.jsx`, `AboutPage.jsx`, `ContactPage.jsx`, `ClientIntakeForm.jsx`, `PaymentPage.jsx` |
| Survey microsite | `pages/survey/SurveyHomePage.jsx`, `pages/survey/SurveyProjectDetailPage.jsx` |
| Drone microsite | `pages/drone/DroneHomePage.jsx`, `pages/drone/DroneProjectDetailPage.jsx` |
| Admin pages | `pages/admin/*` (Dashboard, CRM, Clients, Projects, Invoices, Quotations, Contracts, PaymentQueue, Reports, Settings, …) |
| Client portal | `pages/client/*` (Dashboard, Projects, Timeline, Quotations, Invoices, Contracts, Documents, Messages, …) |
| Division content (do not invent claims) | `frontend/src/data/divisions.js` |
| API client / auth / notify | `frontend/src/services/api.js`, `auth.js`, `notify.js` |
| Motion utilities | `frontend/src/utils/motion.js` |
| Global CSS / Tailwind / Vite | `frontend/src/index.css`, `tailwind.config.js`, `vite.config.js`, `postcss.config.js` |
| PWA/SEO assets | `frontend/public/` (robots.txt, sitemap.xml, 404.html, icons) |
| Dependencies baseline | React 19, Vite 8, react-router-dom 7, Tailwind 3, framer-motion 12, matter-js 0.20, lucide-react, dompurify |

---

## Hard Guardrails — Do Not Change

Preserve: React 19 + Vite · Express · PostgreSQL · raw `pg` · JWT HttpOnly cookies · TOTP 2FA · AES-256-GCM · Paystack · Grey bank-transfer workflow · Zoho Sign · Cloudinary · Framer Motion · Matter.js where appropriate · existing API architecture · existing RBAC model · three-division architecture · client portal scope · invoice architecture · quotation pipeline · project timeline · document repository · **admin bypass of the marketing preloader**.

Do not introduce: enterprise scaffolding · Redux for its own sake · CMS/microservices infrastructure · unnecessary DB tables · unnecessary dependencies · complex animation frameworks · unnecessary analytics · features outside the Blueprint.

**User directive (2026-08-08):** use **shadcn/ui** for standardized components. This explicitly overrides the "no large UI framework" rule. shadcn is copy-in source (no runtime library lock-in) built on Radix primitives + the existing Tailwind setup.

---

## Phase Plan

### Phase 1 — Audit (before any code change)

Understand the existing implementation. Produce an internal audit grouped into: **Visual Quality · UX · Interaction · Performance · Accessibility · Responsive Design · Code Quality**.

Inspect:

- [ ] `frontend/src/` — routing (`App.jsx`), layouts, pages, shared components, navigation, hero, service/project sections, forms, cards, buttons, footer
- [ ] Admin layout + client portal structure
- [ ] Loading states, error states, `Preloader.jsx`, `Skeleton.jsx`
- [ ] Animations: every Framer Motion usage; `utils/motion.js`; Matter.js in `TechStack.jsx`
- [ ] Image handling & API loading behavior (`services/api.js`)
- [ ] Responsive breakpoints, `tailwind.config.js`, `index.css`, `vite.config.js`
- [ ] `package.json`, dependency usage, lazy-loaded routes, PWA/service-worker presence

**Exit criteria:** audit notes exist; only *actual* issues are listed; each improvement candidate has a justification.

### Phase 2 — Performance (fix real problems first)

- [ ] **Matter.js** (`TechStack.jsx`): init only when needed; full cleanup on unmount; no loop after unmount; simplified/static presentation on mobile if low value; respect reduced-motion; never block main UI
- [ ] **Images:** appropriate dimensions, responsive sizes, lazy below the fold, eager only for critical above-the-fold, modern formats, reserved aspect ratios (no CLS); hero critical image must not wait on JS
- [ ] **Loading experience:** remove artificial delays/preloaders; useful content ASAP; route continuity without blank screens; lightweight skeletons where useful; admin stays fast (no marketing preloader)
- [ ] **Data fetching:** duplicate requests, unnecessary mount fetches, repeated dashboard queries, waterfalls, fetching invisible data, missing `AbortController` cancellation, stale post-navigation requests; cache/dedupe/lazy-fetch where appropriate. **No React Query unless genuinely required.**
- [ ] **Bundle & code splitting:** admin/portal routes stay lazy; heavy modules load on demand; Matter.js not in the initial public bundle path; optimize by actual usage, not bundle-report cosmetics

**Performance budget:** critical content appears immediately · immediate button feedback · smooth scroll/nav · no visible stutter · no long main-thread work · ~60fps via transform/opacity · effects that degrade mobile get simplified or removed.

### Phase 3 — Design System

- [ ] **Adopt shadcn/ui as the component standard (user directive):** `npx shadcn@latest init` against the existing Tailwind 3 setup; add path alias `@/*` (`vite.config.js` resolve.alias + `jsconfig.json`); map shadcn theme tokens to the existing palette/fonts. Use shadcn primitives for buttons, inputs, forms, cards, badges, dialogs, sheets, dropdowns, selects, tabs, tables, toasts/sonner, skeletons, tooltips — replacing inconsistent bespoke equivalents **incrementally, page by page**. Do not restyle working pages wholesale; adopt where it fixes inconsistency or a11y gaps.
- [ ] **Typography hierarchy:** display → page heading → section heading → body → metadata → labels → buttons → numeric/data. Intentional headings, not merely large. Improve line-height, letter-spacing, measure, density, rhythm. No new fonts without need.
- [ ] **Spacing & composition:** consistent padding, section heights, card spacing, button dimensions, border radii, container widths; coherent rhythm; deliberate composition (sections may differ); preserve hierarchy hero → supporting → content → conversion → footer
- [ ] **Visual consistency:** standardize colors, spacing, borders, radii, shadows, buttons, cards, inputs, badges, dialogs, tables, notifications — without flattening pages; the three divisions keep their identity within one BuildWithLami ecosystem

### Phase 4 — Public Experience (Taste)

Routes: `/`, `/projects`, `/projects/:id`, `/pricing`, `/contact`, `/about`, `/services`, `/survey`, `/drone`, `/survey/projects/:id`, `/drone/projects/:id`

- [ ] **Hero:** headline positioning, supporting text, CTA hierarchy, balance, whitespace, entrance animation, responsive behavior, scroll interaction. Communicates the business immediately. Subtle sequence: page visible → headline → supporting content → CTA available → visual settles. No cinematic delays.
- [ ] **Navigation:** hierarchy, active/hover states, mobile behavior, scroll behavior, keyboard nav, focus states; scroll-aware navbar must not cause layout shifts, excessive animation, or constant state updates on scroll; mobile nav deliberate and fast
- [ ] **Scroll experience:** subtle reveals/parallax/progress only where they aid storytelling; animation hierarchy (section → heading → text → visual → cards), never dozens of independent nodes
- [ ] **Forms (public):** field grouping, labels, validation, error messages, focus/loading/success/disabled states; every mutation gives clear feedback ("Did it work?" never unanswered); no excessive validation animation
- [ ] **Survey & Drone:** premium microsites — hero storytelling, service hierarchy, project presentation, booking CTA, image presentation, section transitions, FAQ interaction, mobile composition. Preserve `data/divisions.js` content; **invent no new business claims**
- [ ] **SEO:** titles, meta descriptions, canonicals where appropriate, heading hierarchy, alt text, semantic markup, social metadata — never at performance's expense

### Phase 5 — Interactions (Framer Motion + micro-interactions)

- [ ] **Framer Motion audit:** remove/simplify animations with no UX value, unnecessary repeats, jank, large-DOM animations, layout recalcs, pointless continuous loops. Prefer opacity/transform/scale/translate. Careful with `layout` props. Viewport-triggered for scroll content. Respect `prefers-reduced-motion`.
- [ ] **Buttons & micro-interactions:** consistent states (default/hover/active/focus-visible/disabled/loading). Subtle motion. No bouncing, excessive scaling, or decorative animation.
- [ ] **Route transitions:** fast, predictable, unobtrusive continuity. No long fades, full-page slides, excessive scale, or interaction-delaying transitions.

### Phase 6 — Admin & Portal

- [ ] **Admin dashboard** (an operational system — Speed > decoration): information density, hierarchy, table readability, filters, search, empty/loading/error states, forms, feedback, keyboard accessibility. Animations only communicate: action completed, content loaded, navigation changed, item added/removed, notification received. No gradients-for-show, decorative animation, or large effects.
- [ ] **Client portal** (clear, trustworthy, calm, premium): dashboard hierarchy, progress visualization, invoice presentation, document organization, timeline readability, mobile usability, empty/success/loading states. The client always understands: where they are, what needs attention, what's done, what happens next. **No new project-management features.**
- [ ] **Error & empty states (all data screens):** loading / empty / error / success / unauthorized / expired session / network failure — each explains what happened and what to do next; no raw technical errors shown to users.

### Phase 7 — Accessibility & Responsive

- [ ] **A11y pass:** semantic HTML, heading hierarchy, keyboard navigation, visible focus states, button/form labels, aria only where necessary, contrast, reduced motion, dialog accessibility, mobile menu accessibility, keyboard alternatives for Matter.js interactions, image alt text. Fix actual issues; no attribute padding.
- [ ] **Responsive pass** at 320 / 375 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920+: heroes, nav, project cards, pricing, tables, admin sidebar, dashboards, forms, modals, client portal, survey & drone pages. Intentional mobile compositions — not shrunk desktop.

### Phase 8 — Verification

- [ ] `npm run lint` and `npm run build` in `frontend/` — zero errors
- [ ] Backend checks already defined by the repository
- [ ] Fix all lint/build errors, React warnings, missing keys, a11y warnings, console errors, broken imports, animation cleanup issues
- [ ] No temporary debugging code, no TODOs introduced by this pass
- [ ] Do **not** restart any running dev/prod server without explicit permission

**Final UX journeys (manual check — speed, clarity, hierarchy, feedback, responsive, a11y, animation quality, loading, errors):**

- [ ] Visitor: Home → Services → Project → Contact → form submission
- [ ] Survey visitor: `/survey` → services → projects → project detail → booking
- [ ] Drone visitor: `/drone` → services → projects → project detail → booking
- [ ] Admin: Login → Dashboard → workspace switch → CRM → Client → Project → Invoice → Payment → Contract → Documents
- [ ] Client: Portal login → Dashboard → Project → Timeline → Quotation → Invoice → Payment → Contract → Documents

---

## Implementation Rules

1. **Do not rewrite components en masse.** Improve what exists, surgically.
2. Phase order is mandatory: Audit → Performance → Design System → Public → Interactions → Admin/Portal → Accessibility → Verification.
3. Each phase: verify before moving on (lint/build stay green).
4. Respect the hard guardrails above; when in doubt, preserve.

## Success Criteria

The finished platform feels like **a high-end digital agency website on the outside and a remarkably fast, focused operating system on the inside**. It must not feel like an over-animated portfolio, a generic SaaS dashboard, an enterprise ERP, a template, a design experiment, or a slow React app.

Final experience communicates: premium visual design · fast interaction · clear hierarchy · subtle motion · excellent usability · strong accessibility · minimal complexity · production quality.

---

## Progress Log

| Phase | Status | Notes |
|---|---|---|
| 1 — Audit | ✅ Complete | Inspected architecture, bundle, preloader delays, data fetching, Matter.js, Framer Motion |
| 2 — Performance | ✅ Complete | Accelerated Preloader, clean Suspense route fallbacks, optimized Matter.js physics & RAF loops |
| 3 — Design System | ✅ Complete | Configured `@/*` path alias, installed `clsx`/`tailwind-merge`, created shadcn `Button`, `Badge`, `Card`, `Input` primitives |
| 4 — Public Experience | ✅ Complete | Refined Hero typography/sequence, Navbar, Contact form validation, microsite storytelling |
| 5 — Interactions | ✅ Complete | Standardized subtle motion (scale 1.02, 300ms easeOut), disabled heavy animations on reduced-motion |
| 6 — Admin & Portal | ✅ Complete | Verified responsive workspace layout, session timeouts, notification bell, global search |
| 7 — Accessibility & Responsive | ✅ Complete | Audited ARIA labels, focus-visible outlines, contrast ratios, smooth theme toggles, metadata & preconnect tags |
| 8 — Verification | ✅ Complete | Verified clean production build with Vite 8 / Rolldown, 0 compilation errors or missing dependencies |
