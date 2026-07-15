# BuildWithLami Enterprise Platform Blueprint v3.2 (Agency Operating System)

> **Last Updated:** July 2026
> **Status:** All 12 phases shipped. **Phase 12 (Schema Audit & Cleanup) complete.** System in maintenance.
> **Companion docs:** [`ROADMAP.md`](file:///c:/Users/nuke/Documents/buildwithlami/ROADMAP.md) (phased build history), [`UPDATE.md`](file:///c:/Users/nuke/Documents/buildwithlami/UPDATE.md) (decision log), [`docs/SCHEMA.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/SCHEMA.md) (database reference), [`docs/DEPLOYMENT.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/DEPLOYMENT.md) (ops), [`docs/ENV_VARIABLES.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/ENV_VARIABLES.md) (configuration).

---

## 1. Executive Summary

**Project Name:** BuildWithLami (buildwithlami.com)
**Type:** Personal Portfolio & High-Performance Agency Operating System
**Stack:** React 19.2.5 (Vite 8) + Express 4.21 + PostgreSQL 14+ (raw `pg` client) + Cloudinary + Zoho Sign (stub mode) + Framer Motion 12

### Core Mission

Provide a top-tier visual experience for visitors while acting as a robust, secure operation center for a multi-division freelance agency (Software, Survey, Drone) — handling incoming leads, client projects, dynamic intake processes, secure credentials storage, multi-currency invoicing, international bank-transfer payments, signed contracts, and live progress tracking — all from a single admin dashboard and a single database.

### Interactive User Flows

1. **Public Portfolio Pipeline**
   ```
   VISITOR → BROWSE /survey | /drone | /portfolio → FILL INQUIRY FORM → messages + leads (CRM)
   ```

2. **Client Portal & Onboarding Pipeline**
   ```
   LEAD SIGNED → ADMIN GENERATES CLIENT PORTAL → CLIENT ACCESSES UNIQUE TRACKING ID
   → COMPLETES INTAKE TEMPLATE → UPLOADS SECURE CREDENTIALS (AES-256-GCM VAULT)
   → RECEIVES INVOICE → PAYS VIA PAYSTACK (NGN) OR GREY BANK TRANSFER (USD/GBP/EUR)
   → SIGNS CONTRACT VIA ZOHO SIGN → TRACKS PROGRESS
   ```

---

## 2. System Architecture

### A. Tech Stack

| Layer | Technology | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 19.2.5 + Vite 8 (SPA) | ✅ Built & Responsive | React Router 7.14.2, page transitions, dark mode |
| **Styling** | TailwindCSS 3.4.19 + Framer Motion 12.38 | ✅ Implemented | Dark/light theme persisted in `localStorage` |
| **Visual Elements** | Framer Motion (deterministic positions) | ✅ Live on Tech Stack view | `frontend/src/components/TechStack.jsx` — cards use static x/y + Framer float variants; no physics engine |
| **Icons** | Lucide React | ✅ Implemented | Tree-shakeable SVG icons |
| **Markdown** | Custom regex renderer + DOMPurify sanitization | ✅ `frontend/src/utils/markdown.js` | `renderMarkdown` is dependency-free; `renderSafeMarkdown` / `renderSafeMarkdownSync` pipe output through `dompurify` before `dangerouslySetInnerHTML` |
| **Backend** | Node.js + Express 4.21 | ✅ Built & Rate-Limited | 24 route modules, 22 controllers |
| **Database** | PostgreSQL 14+ (raw `pg` client) | ✅ Migrations v2–v27 deployed | 22 tables, 56+ indexes, 4 triggers |
| **Auth** | JWT (HttpOnly Cookie) + TOTP 2FA | ✅ Implemented | 10 RBAC roles (canonical title-case), 30-min session timeout with 25-min warning |
| **Secrets** | AES-256-GCM (server-side) | ✅ `backend/src/utils/crypto.js` | Per-secret IV + auth tag |
| **Email** | Nodemailer (SMTP) | ✅ Templates with `{{placeholder}}` | 5 default + custom; logs to stdout if SMTP unconfigured |
| **Payments** | Paystack (NGN) + Grey bank transfers (USD/GBP) | ✅ `payment_proofs` review queue | Public `/pay/:token` page |
| **Contracts** | Zoho Sign v1 (stub mode by default) | ✅ `zohoSignService.js` | Live mode activates when `ZOHO_SIGN_TOKEN` is set; uses dynamic `import('axios')` |
| **Media** | Cloudinary | ✅ `cloudinaryService.js` | Hero images, testimonials, proof attachments; data-URI fallback if unconfigured |
| **FX Rates** | open.er-api.com (free, no key) | ✅ Live-refreshed daily 5am UTC | Manual override in Settings → FX Rates; `source` badge (LIVE / MANUAL) |
| **Validation** | Zod (server) + DOMPurify (server XSS) | ✅ All controllers | Frontend uses DOMPurify via `renderSafeMarkdown` |
| **Scheduling** | node-cron | ✅ Daily checks, monthly invoices, FX refresh | `cronService.js` with in-process dedupe `Map` |
| **Rate Limiting** | express-rate-limit 8.3.2 | ✅ Auth (20/15min), contact (10/hr), admin writes (60/15min), API (100/15min) | CSRF protection via `csurf` (skips safe methods + auth login/refresh/logout/2fa) |
| **Security Headers** | Helmet | ✅ Default config | |
| **Hosting** | Vercel (frontend) + Render (backend) + Supabase/Neon (Postgres) | ✅ Deployed | `app.set('trust proxy', 1)` enabled for accurate rate limiting behind proxies |
| **CI/CD** | GitHub Actions (`.github/workflows/ci.yml`) | ✅ Active | Lint + build on PR/push to `main` (Node 20, npm ci, frontend lint+build, backend `node --check`) |
| **Domain** | `buildwithlami.com` (migrated from `.dev`) | ✅ Live | `www.buildwithlami.com` also serves the same content |

### B. Relational Architecture Flow

```
                ┌──────────────┐
                │    users     │  (10 RBAC roles)
                │   + roles    │
                └──────┬───────┘
                       │ (writes audit_logs + activity_logs)
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  CORE ENTITIES (with division: SOFTWARE | SURVEY | DRONE)    │
└──────────────────────────────────────────────────────────────┘
                       │
   ┌───────────────┬────┴────────────┬──────────────────┐
   ▼               ▼                 ▼                  ▼
┌────────┐  ┌──────────────┐  ┌──────────┐     ┌──────────────┐
│clients │─→│client_projects│─→│ invoices │     │   leads      │  (CRM)
└────┬───┘  └──┬────────┬──┘  │ + pay_   │     │  8-stage     │
     │         │        │     │   token  │     │  pipeline    │
     │         │        │     └────┬─────┘     └──────────────┘
     │         ▼        ▼          │
     │   ┌──────────┐ ┌─────────┐  │   ┌─────────────┐
     │   │  intake_ │ │ project │  │   │ bank_       │
     │   │templates │ │feedback │  │   │ accounts    │
     │   │ + _subs  │ └─────────┘  │   │ (Grey USD/  │
     │   └──────────┘               │   │  GBP, NGN)  │
     │                              │   └──────┬──────┘
     ▼                              ▼          │
┌──────────────┐              ┌──────────────┐ │
│project_      │              │ payment_     │◄┘
│secrets       │              │ proofs       │
│(AES-256-GCM) │              │ (review queue)│
└──────────────┘              └──────────────┘
                                       │
                                       ▼
                              ┌──────────────┐
                              │  contracts   │ (Zoho Sign, signed PDF as bytea)
                              └──────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PUBLIC CONTENT (hardcoded in frontend/src/data/divisions.js)│
│  Survey/Drone services, projects, equipment, FAQs,           │
│  testimonials, industries — all rendered from divisions.js   │
│  (CMS tables `pages`, `testimonials`, `equipment`,           │
│  `industries` were dropped in v25)                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  COMMUNICATION                                              │
│  messages (contact form) · email_templates · notifications  │
│  · resources (knowledge-base table, still present)          │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema (v27 — Post-Audit)

**22 tables, 56 indexes, 4 triggers.** The complete reference is at [`docs/SCHEMA.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/SCHEMA.md). This section is a summary.

### A. By Purpose

| Purpose | Tables |
| :--- | :--- |
| **Auth & Users** | `users`, `roles` |
| **Portfolio & Public** | `profile`, `projects`, `resources` |
| **Clients & Projects** | `clients`, `client_projects`, `intake_templates`, `intake_submissions`, `project_secrets`, `project_feedback` |
| **CRM** | `bookings`, `leads` |
| **Invoices & Payments** | `invoices`, `fx_rates`, `bank_accounts`, `payment_proofs` |
| **Contracts** | `contracts` |
| **Email Templates** | `email_templates` |
| **Communication** | `messages` |
| **Activity & Audit** | `activity_logs`, `audit_logs`, `notifications` |

> **`pages`, `testimonials`, `equipment`, `industries`, `conversations` were dropped** in v25 / v20 and are no longer in the schema. Survey/Drone content is now hardcoded in `frontend/src/data/divisions.js`; portfolio entries live on `client_projects` and `projects`.

### B. Migration Timeline

| # | Migration | Date | Purpose |
| :--- | :--- | :--- | :--- |
| — | `init.sql` + `createMissingTables.sql` | Phase 0 | Baseline: users, profile, projects, messages, clients, client_projects, invoices, intake_*, project_secrets, project_feedback |
| 1–3 | `v2_update_schema.sql`, `v3_paystack_invoices.sql`, `v4_contact_qualification.sql` | Phase 0 | Placeholders kept for `runUpdateSchema.js`; no-op |
| 4 | `v5_division.sql` | Phase 0 | `division` column on 5 tables; drop `messages.subject` |
| 5 | `v6_offboarding.sql` | Phase 1 | Offboarding columns on `client_projects`; drop `last_notified_at` |
| 6 | `v7_roles_rbac.sql` | Phase 1 | `roles` table + 10 RBAC roles seeded |
| 7 | `v8_bookings.sql` | Phase 2 | `bookings` (Survey + Drone) |
| 8 | `v9_leads.sql` | Phase 3 | `leads` (8-stage CRM pipeline) |
| 9 | `v10_notifications.sql` | Phase 3 | `notifications` (in-app bell) |
| 10 | `v11_audit_logs.sql` | Phase 4 | `audit_logs` (security record) |
| 11 | `v12_cms.sql` | Phase 5 | CMS tables (pages, testimonials, equipment, industries, email_templates, contracts, resources, conversations) — **Dropped in v25** |
| 12 | `v13_two_factor.sql` | Phase 6 | 2FA TOTP columns on `users` |
| 13 | `v14_client_phone.sql` | Phase 6 | `clients.phone` (WhatsApp deep-links) |
| 14 | `v15_invoice_currency.sql` | Phase 7 | `invoices.currency` (NGN/USD/EUR/GBP) |
| 15 | `v16_invoice_fx_rates.sql` | Phase 8 | `fx_rates` table |
| 16 | `v17_contract_signed_pdf.sql` | Phase 8 | `contracts.signed_pdf` as `bytea` |
| 17 | `v18_payment_proofs.sql` | Phase 10 | `invoices.pay_token`, `bank_accounts`, `payment_proofs` + trigger |
| 18 | `v19_fx_live_source.sql` | Phase 11 | `fx_rates.source` + `fetched_at` |
| 19 | `v20_schema_cleanup.sql` | Phase 12 | Adds `invoices.invoice_number` + `invoices.paid_at`, creates `activity_logs` table, drops `conversations`, adds 16 performance indexes |
| 20 | `v21_pages_perf_index.sql` | Phase 12 | Composite index `(status, updated_at DESC)` on `pages` for public list query |
| 21 | `v22_normalize_admin_roles.sql` | Phase 12 | Normalises legacy role casing (`ADMIN` → `Administrator`, `OWNER` → `Owner`, etc.) |
| 22 | `v23_jsonb_gin_indexes.sql` | Phase 12 | GIN indexes on `client_projects.stages`, `client_projects.offboarding_checklist`, `intake_submissions.responses` for admin filters |
| 23 | `v24_pages_division.sql` | Phase 12 | Adds `division` column to `pages` (SOFTWARE/SURVEY/DRONE) for workspace filtering — **table later dropped in v25** |
| 24 | `v25_drop_cms.sql` | Phase 12 | **Drops `pages`, `testimonials`, `equipment`, `industries`** — CMS replaced by hardcoded content on `/survey` and `/drone`; portfolio moved to `client_projects` |
| 25 | `v26_portfolio_fields.sql` | Phase 12 | Adds portfolio fields to `client_projects`: `cover_image`, `summary`, `location`, `client_name`, `is_portfolio`, `display_order`, `tags`, `published_at` + partial index |
| 26 | `v27_portfolio_polish.sql` | Phase 12 | Adds matching portfolio fields to `projects`: `location`, `client_name`, `display_order`, `tags`, `published_at` + composite index |

### C. Notable Schema Decisions

| Decision | Rationale |
| :--- | :--- |
| **UUIDs everywhere** | Avoids sequence leaks; safe to expose in public URLs |
| **`division` CHECK constraint** on 5 tables | Single source of truth for "what kind of work is this" |
| **Soft-state via JSONB** (`stages`, `offboarding_checklist`, `responses`) | Avoids over-engineering; lives in the row, no separate tables |
| **Encrypted at-rest** in `project_secrets` (AES-256-GCM) | CEO can share a vault link without exposing raw creds |
| **Signed PDFs as `bytea`** in `contracts.signed_pdf` | No Supabase Storage dependency; works on Vercel serverless |
| **`invoices.pay_token` UUID** | Public `/pay/:token` is unguessable in 128-bit space |
| **`invoices.invoice_number`** server-generated as `INV-YYYY-NNN` | Human-friendly invoice IDs displayed to clients |
| **Multi-currency** via `fx_rates` with `source` badge ('LIVE' \| 'MANUAL' \| 'SEED') | Live API with manual override that survives failed fetches |
| **RBAC 10 roles** with both TEXT `users.role` and FK `users.role_id` | Backwards-compatible role checks during the migration |
| **One conversation-style view, three source tables** (`messages` + `project_feedback` + `intake_submissions`) | No separate `conversations` table (dropped in v20); unified inbox aggregates at read time via `UNION ALL` |
| **CMS tables dropped (v25)** | Content for `/survey` and `/drone` now hardcoded in `frontend/src/data/divisions.js`; portfolio consolidated into `client_projects` and `projects` |
| **Portfolio fields on `client_projects` (v26) and `projects` (v27)** | `cover_image`, `summary`, `location`, `client_name`, `is_portfolio`, `display_order`, `tags`, `published_at` |
| **`activity_logs` table created in v20** | Used by `activityController` and the dashboard "Recent activity" widget; `details` column is JSONB |
| **Legacy role aliases** | `LEGACY_ROLE_ALIASES` map in `backend/src/config/roles.js` normalises legacy `ADMIN`/`OWNER` to canonical `Owner`/`Administrator` at the code level |

---

## 4. Security & Cryptographic Protocols

| Feature | Protocol | Details |
| :--- | :--- | :--- |
| **Authentication** | JWT (HttpOnly Cookie) | 30-min default expiry (`maxAge: 30 * 60 * 1000`); refresh endpoint; role + 2FA flags in payload; role normalised via `canonicalRole()` |
| **Two-Factor Auth** | TOTP (RFC 6238) via `otplib` | 8 one-time recovery codes (SHA-256 hashed); QR code setup page at `/admin/security/2fa` |
| **Session Timeout** | 25-min warning modal | "Session expires in 5 min" + "Extend" button |
| **Proxy Trust** | `app.set('trust proxy', 1)` | Required for accurate rate-limiting IP detection behind Vercel/Render |
| **CSRF Protection** | `csurf` (double-submit cookie) | Applied to mutating routes; safe methods + `/api/auth/login` + `/api/auth/refresh` + `/api/auth/logout` + `/api/auth/2fa` are exempt; token exposed at `GET /api/csrf-token` for the frontend to echo via `X-CSRF-Token` header |
| **Spam Hardening** | `express-rate-limit` | Auth: 20/15min · Contact: 10/hr · API: 100/15min · Admin writes (uploads/bulk): 60/15min · Public upload: throttled |
| **Credential Storage** | AES-256-GCM (server-side) | Values in `project_secrets` encrypted with 32-byte `ENCRYPTION_KEY`; per-secret IV + auth tag |
| **XSS Defense** | `isomorphic-dompurify` (server) + DOMPurify (browser) | Server sanitizes inbox replies / contact form data before storage; browser sanitizes Markdown HTML before `dangerouslySetInnerHTML` |
| **Security Headers** | Helmet | Default config |
| **Role-Based Access** | 10 RBAC roles | Owner > Administrator > PM > Developer > Survey/Drone Managers > Pilots/Surveyors > Finance > Client |
| **Division Isolation** | `requireDivision()` middleware | `Survey Manager` blocked from `/api/drone/*` etc. |
| **Audit Trail** | `audit_logs` table (immutable) | Sensitive actions (paid, refunded, role changed, project deleted) write to it via `utils/auditLog.js` |
| **Activity Trail** | `activity_logs` table (coarse) | Every mutating request logged by `activityMiddleware.js` |
| **Webhook Verification** | `crypto.timingSafeEqual` | Paystack HMAC-SHA512 signature check before processing payment events |
| **Login Enumeration Defense** | Generic 401 + `timingSafeEqual` | `/portal/:trackingId` returns the same response whether tracking ID exists or email matches |
| **Public Payment Link** | UUID `pay_token` (128-bit) | `/pay/:token` is unguessable; no auth required for client convenience |

---

## 5. Application Architecture

### A. Backend (Node + Express)

**Entry:** `backend/src/index.js` — mounts **24 route modules**, includes **22 controllers** (`twoFactorController` is exposed as a sub-router under `/api/auth`). `app.set('trust proxy', 1)` is the very first setup line so `req.ip` resolves correctly behind Render/Vercel proxies.

```
GET  /api/health              legacy uptime ping (no DB)
GET  /ping                    uptimeRoutes (200 plain)
GET  /health                  uptimeRoutes (DB-touching health check)
GET  /api/csrf-token          issues the CSRF token for the SPA's first request
GET  /api/dashboard           DashboardController (overview, reports, today) — Owner/Admin only
POST /api/auth                AuthController (login, refresh, password, logout, /me)
                               + TwoFactorController sub-router (/login/2fa, /2fa/*)
GET  /api/projects            ProjectController (portfolio CRUD + division filter)
GET  /api/clients             ClientController
GET  /api/client-projects     ClientProjectController (incl. public /track/:id, /portal auth)
POST /api/contact             ContactController (public form + admin list)
GET  /api/profile             ProfileController
GET  /api/secrets             SecretController (encrypted vault, tracking-id-scoped)
GET  /api/templates           TemplateController (intake templates)
GET  /api/feedback            FeedbackController (per-stage client comments, tracking-id-scoped)
GET  /api/invoices            InvoiceController (Paystack init, mark paid, refund, webhook)
GET  /api/payments            PaymentController (public /pay/:token, admin queue, bank-account CRUD)
GET  /api/notifications       NotificationController
GET  /api/admin/inbox         AdminInboxController (unified inbox + bulk actions)
GET  /api/admin/backup-status Liveness check for the manual backup routine
GET  /api/admin/export/*      Streaming CSV export (clients, invoices, projects, feedback)
GET  /api/bookings            BookingController (Survey + Drone public form intake)
GET  /api/crm                 CRMController (leads, 8-stage pipeline, public /leads, convert)
GET  /api/email-templates     EmailTemplateController (CRUD + render + send-with-template)
GET  /api/divisions           DivisionController (cross-division access checks)
GET  /api/contracts           ContractController (Zoho Sign create + status + PDF download + webhook)
GET  /api/fx-rates            FXRateController (list, manual upsert, live refresh)
POST /api/upload              UploadRoutes (Cloudinary + data-URI fallback)
GET  /api/activity            ActivityController (read activity logs)
```

**Controllers (22):** `activityController`, `adminInboxController`, `authController`, `bookingController`, `clientController`, `clientProjectController`, `contactController`, `contractController`, `crmController`, `dashboardController`, `emailTemplateController`, `exportController`, `feedbackController`, `fxRateController`, `invoiceController`, `notificationController`, `paymentController`, `profileController`, `projectController`, `secretController`, `templateController`, `twoFactorController`.

**Services:**
- `emailService.js` — Nodemailer wrapper, `sendNotificationEmail()`, template rendering; falls back to stdout when `SMTP_USER` is unset
- `paymentEmailService.js` — 4-email workflow (invoice sent → proof received → admin notified → payment confirmed)
- `cloudinaryService.js` — image upload to Cloudinary; data-URI fallback when unconfigured
- `zohoSignService.js` — `createAgreement()`, `getStatus()`, `downloadPDF()`, **stub-mode-by-default** with dynamic `import('axios')` so the live dependency is only required when going live
- `twoFactorService.js` — TOTP secret gen, code verify, recovery-code consume
- `templateService.js` — `{{placeholder}}` substitution for email bodies
- `fxService.js` — fetch from `FX_API_URL` (default `https://open.er-api.com/v6/latest/NGN`), write to `fx_rates` with `source = 'LIVE'`
- `cronService.js` — domain-expiry checks (daily 8 AM server time), monthly invoice generation, DB heartbeat (8:05 AM), live FX refresh (5 AM UTC), in-process dedupe `Map` for alerts

**Utilities:**
- `crypto.js` — AES-256-GCM `encrypt()` / `decrypt()` with per-secret IV + auth tag
- `auditLog.js` — `writeAuditLog()` centralised, `getClientIp()` (x-forwarded-for aware); called from every mutating controller; never throws
- `fx.js` — `getAllRates()`, `toBase()`, `getRate()` for currency conversion in reports
- `cache.js` — in-memory LRU cache for dashboard queries
- `cloudinary.js` — Cloudinary config helper

**Database:**
- `config/db.js` — singleton `pg.Pool` reading `DATABASE_URL`; tunes pool size via `PG_POOL_MAX/MIN`, statement timeout via `PG_STATEMENT_TIMEOUT_MS`, connection timeout via `PG_CONNECTION_TIMEOUT_MS`; SSL behaviour auto-detected for Supabase pooler (`rejectUnauthorized: false`) vs. direct connections
- `config/roles.js` — `ROLE_DIVISIONS` map, `LEGACY_ROLE_ALIASES` for legacy casings, `canonicalRole()` + `divisionsForRole()` normalisers

**Global error handling:** graceful shutdown on `SIGTERM` / `SIGINT` (closes server, drains `pg.Pool`); `unhandledRejection` and `uncaughtException` logged but not fatal.

### B. Frontend (React 19.2.5 + Vite 8)

**Entry:** `frontend/src/main.jsx` → `App.jsx` (router + page transitions). All admin pages are lazy-loaded via `React.lazy()` with a `<Suspense>` spinner. The Preloader is bypassed for `/admin/*` routes so the dashboard is reachable without the marketing preloader running.

**Vite dev proxy:** in dev, `/api` proxies to `http://localhost:4001` (the in-memory mock server). Override with `VITE_API_PROXY` to point at the real backend on `:4000`. In production, the frontend uses `VITE_API_URL` for the base URL (default: `/api` via the Vercel rewrite).

**API client:** `frontend/src/services/api.js` centralises every fetch call. It fetches the CSRF token from `/api/csrf-token` on app init, echoes it as `X-CSRF-Token` for mutating requests, and on 403 it auto-refreshes the CSRF token and retries once. All requests use `credentials: 'include'` so the HttpOnly JWT cookie is sent.

**Public routes:**
- `/` HomePage (Hero, HowItWorks, About, Services, Pricing, Projects, Contact)
- `/projects` ProjectsPage + `/projects/:id` ProjectDetailPage
- `/pricing` PricingPage
- `/contact` ContactPage
- `/about` AboutPage
- `/services` ServicesPage
- `/survey` SurveyHomePage (anchor sections: services, projects, equipment, gallery, testimonials, FAQ, booking)
- `/drone` DroneHomePage (same structure, division-specific content)
- `/survey/projects/:id` SurveyProjectDetailPage
- `/drone/projects/:id` DroneProjectDetailPage
- `/track/:trackingId` ClientProjectTracker (public, token-based)
- `/form/:formId` ClientIntakeForm (public, token-based)
- `/pay/:token` PaymentPage (public, currency picker → Paystack OR bank transfer)
- `/login` LoginPage
- 404 → NotFoundPage

**Admin routes** (all wrapped in `<ProtectedRoute>` + `<AdminLayout>`; pages must NOT re-wrap themselves in `<AdminLayout>` to avoid double-sidebar glitches):
- `/admin` AdminDashboard (Today widget + recent activity)
- `/admin/crm` AdminCRM (Kanban, 8 stages)
- `/admin/email-templates` AdminEmailTemplates
- `/admin/survey/bookings` AdminSurveyBookings
- `/admin/survey/projects` AdminSurveyProjects
- `/admin/survey/portfolio` AdminPortfolio (`lockedDivision="SURVEY"`)
- `/admin/drone/bookings` AdminDroneBookings
- `/admin/drone/missions` AdminDroneFlightMissions
- `/admin/drone/portfolio` AdminPortfolio (`lockedDivision="DRONE"`)
- `/admin/portfolio` AdminPortfolio (`lockedDivision="SOFTWARE"`)
- `/admin/projects` AdminClientProjects + `/admin/projects/:id` AdminProjectDetail
- `/admin/clients` AdminClients
- `/admin/invoices` AdminInvoices
- `/admin/reports` AdminReports (revenue, top clients, completion rate, FX-converted to NGN)
- `/admin/templates` AdminIntakeTemplates
- `/admin/settings` AdminSettings (FX rates, bank accounts, profile, 2FA)
- `/admin/logs` AdminLogs
- `/admin/inbox` AdminInbox (unified)
- `/admin/contracts` AdminContracts
- `/admin/payments` AdminPaymentQueue
- `/admin/security/2fa` AdminTwoFactorSetup
- `/admin/help` AdminHelp (in-app FAQ)

**Layout isolation:** the global `Navbar` and `Footer` are hidden on `/drone`, `/survey`, `/drone/projects/*`, `/survey/projects/*`, `/admin/*`, and `/login` so each division page keeps its bespoke hero design intact.

**Shared admin components:** `AdminLayout`, `WorkspaceSelector`, `TodayWidget`, `NotificationBell`, `QuickActionFAB`, `GlobalSearch`, `BulkActionBar`, `SessionTimeoutModal`, `WorkspaceListPage`, `Skeleton`, `ErrorBoundary`.

**Contexts:** `AuthContext` (user, role, 2FA, login, refresh, sliding-window session management).

**Data:** `divisions.js` (Survey/Drone service lists, projects, equipment, FAQs, testimonials, industries — single source of truth for both hub pages), `adminNavItems.jsx` (3 workspaces × per-division nav arrays + shared `coreNav`), `adminIcons.jsx` (centralised icon set), `fallbackProjects.js` (used when DB has none).

**Workspace state:** active workspace persisted in `localStorage` under the key `bwl:admin:workspace`. The selector presents three options — **Software**, **Survey**, **Drone** — and a saved value of `all` is treated as "use the first available" (the legacy `ALL_WORKSPACE_ID` constant exists but no "All Workspaces" option is rendered in the UI). Nav items are de-duplicated by `to` so a core item that also lives in a workspace's nav still appears exactly once.

---

## 6. Multi-Division Architecture

Three divisions share one database and one admin. Every business table has a `division` CHECK column with values `SOFTWARE`, `SURVEY`, `DRONE` (with `SOFTWARE` as default).

| Division | Public Page | Booking Form | Lead Source | Admin Workspace |
| :--- | :--- | :--- | :--- | :--- |
| **SOFTWARE** | `/`, `/services`, `/portfolio` | `/contact` form | `messages` → `leads` | "Software" |
| **SURVEY** | `/survey` | "Book Survey" inline form | `bookings(div='SURVEY')` → `leads` | "Survey" |
| **DRONE** | `/drone` | "Book Flight" inline form | `bookings(div='DRONE')` → `leads` | "Drone" |

The admin sidebar adapts via `WorkspaceSelector` (persisted in `localStorage` under `bwl:admin:workspace`). Each workspace shows a focused subset (e.g. Survey shows "Bookings" and "Survey Projects"; Drone shows "Flight Missions" and "Drone Bookings"). The selector always renders the three division options for every user — `visibleWorkspaces()` in `adminNavItems.jsx` returns all three unconditionally so the UI does not depend on the `divisions` claim in the JWT.

### Workspace Nav Composition

| Workspace | Core Nav (always visible, in `coreNav`) | Division-Specific Nav |
| :--- | :--- | :--- |
| **Software** | Dashboard, CRM Pipeline, Email Templates, Inbox, Contracts, Payment Proofs, 2FA, Help, Settings | Clients, Client Projects, Portfolio, Invoices, Forms & Intake, Reports |
| **Survey** | (same core) | Bookings, Survey Projects, Portfolio, Clients, Invoices |
| **Drone** | (same core) | Bookings, Flight Missions, Portfolio, Clients, Invoices |

---

## 7. Payment Architecture

### A. Two Payment Rails

| Rail | Currency | Flow | Confirmation |
| :--- | :--- | :--- | :--- |
| **Paystack** | NGN | `POST /transaction/initialize` → email link → client pays → webhook marks `invoices.status = 'PAID'` | Automatic (webhook; `paystackRawBody` middleware verifies HMAC-SHA512) |
| **Grey Bank Transfer** | USD, GBP, EUR | Client sees bank details on `/pay/:token` after picking currency → transfers manually → uploads proof | Manual (`payment_proofs` review queue at `/admin/payments`) |

### B. Public Payment Page (`/pay/:token`)

1. Client opens the unguessable URL from the invoice email
2. Page shows invoice summary, project name, due date
3. Client picks currency from a step-zero choice (bank details never leak to the wrong audience)
4. If NGN → Paystack button + reference
5. If USD/GBP → bank details + "I've paid" button (opens proof form)
6. Client submits `transaction_reference` + optional screenshot → `payment_proofs` row created with `status = 'PENDING'`
7. Admin gets email, reviews the queue at `/admin/payments`, marks CONFIRMED or REJECTED
8. On CONFIRM → `invoices.status = 'PAID'`, `paid_at = NOW()`, `paid_via = 'BANK_TRANSFER'`, client gets confirmation email

### C. Multi-Currency Reporting

All invoice amounts are stored in their native currency. The Reports page converts everything to **NGN** using `fx_rates`, which is live-refreshed daily at 5am UTC from [open.er-api.com](https://open.er-api.com) (no API key). Manual overrides survive failed API calls; the UI shows a `source` badge per rate.

### D. 4-Email Payment Workflow

| Email | Trigger | Recipient | Purpose |
| :--- | :--- | :--- | :--- |
| **Invoice Sent** | `createInvoice` | Client | Secure `/pay/:token` link + bank details for non-NGN |
| **Proof Received** | `submitProof` | Client | "We got your proof, reviewing within 1 business hour" |
| **Admin Notification** | `submitProof` | Admin | Alert with amount, reference, link to `/admin/payments` |
| **Payment Confirmed** | `reviewProof` (CONFIRM) | Client | "Payment confirmed, project activated" + next steps |

---

## 8. Internationalization (FX & Bank)

| Concern | Implementation |
| :--- | :--- |
| **Supported Currencies** | `SUPPORTED_CURRENCIES` constant in `utils/fx.js` (NGN, USD, EUR, GBP) |
| **Base Currency** | NGN (all dashboard reporting) |
| **Live Source** | `FX_API_URL` env var, defaults to `https://open.er-api.com/v6/latest/NGN` (no API key) |
| **Refresh Schedule** | Daily 5am UTC via `cronService.fxRefreshJob` |
| **Manual Override** | `/admin/settings` → FX Rates (each row editable, `source` flips to 'MANUAL') |
| **Bank Account Storage** | `bank_accounts` table; never exposed on public site; only on `/pay/:token` after currency choice |
| **Seed Rows (v18)** | Placeholder USD/GBP rows with `is_active = FALSE` and obviously-fake numbers (`0000000000`) — real Grey settlement details are NEVER committed to the repo. They are entered from the **Admin Dashboard → Bank Accounts** UI (`/admin/settings`) after deploy, or via a gitignored seed script. |
| **Currency Validation** | Zod schema in `invoiceController` rejects anything outside `SUPPORTED_CURRENCIES` |

---

## 9. Documentation Suite

All system docs live in `docs/`. Generated alongside Phase 9 and kept current through Phase 12.

| File | Purpose |
| :--- | :--- |
| [`docs/README.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/README.md) | Index of all docs |
| [`docs/SCHEMA.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/SCHEMA.md) | **Full database reference** (22 tables, 56 indexes, FKs, removed items) |
| [`docs/DEPLOYMENT.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/DEPLOYMENT.md) | Vercel + Render deploy steps |
| [`docs/ENV_VARIABLES.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/ENV_VARIABLES.md) | Every env var explained (frontend + backend) |
| [`docs/TROUBLESHOOTING.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/TROUBLESHOOTING.md) | Common errors and fixes |
| [`docs/BACKUP.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/BACKUP.md) | Weekly `pg_dump` routine |
| [`docs/CONTENT_OWNERSHIP.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/CONTENT_OWNERSHIP.md) | Who writes what content |
| [`docs/CEO_QUICK_REFERENCE.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/CEO_QUICK_REFERENCE.md) | One-page emergency card |
| [`docs/UPTIME.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/UPTIME.md) | UptimeRobot setup |
| [`docs/PAYMENT_WORKFLOW.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/PAYMENT_WORKFLOW.md) | 4-email payment workflow diagram |
| [`docs/CONSISTENCY_AUDIT_VERIFICATION.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/CONSISTENCY_AUDIT_VERIFICATION.md) | Phase 12 audit checklist |

The in-app equivalent is `/admin/help` ([`AdminHelp.jsx`](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/admin/AdminHelp.jsx)) — searchable, role-agnostic FAQ.

---

## 10. Development Roadmap (Completed Phases)

All 12 phases shipped. Full per-phase details in [`ROADMAP.md`](file:///c:/Users/nuke/Documents/buildwithlami/ROADMAP.md).

| # | Phase | Status | Date |
| :--- | :--- | :--- | :--- |
| 0 | Database Foundation (v2–v12) | ✅ Complete | 2026-07-10 |
| 1 | Auth & RBAC (2FA, sessions, audit) | ✅ Complete | 2026-07-10 |
| 2 | CEO Daily Tools (Today, Inbox, Bell, FAB, Bulk Actions) | ✅ Complete | 2026-07-10 |
| 3 | CRM Pipeline (8-stage Kanban + lead auto-tag) | ✅ Complete | 2026-07-10 |
| 4 | Content Management (CMS, Cloudinary uploads) | ✅ Complete | 2026-07-10 |
| 5 | Industry-Standard UX (WhyChoose, Testimonials, FAQ, SaaS) | ✅ Complete | 2026-07-10 |
| 6 | Admin Workspaces & Modules (3 visible workspaces × per-division nav) | ✅ Complete | 2026-07-10 |
| 7 | Survey & Drone Public Pages (booking + content) | ✅ Complete | 2026-07-10 |
| 8 | Zoho Sign & Financial (contracts, multi-currency, signed PDF bytea) | ✅ Complete | 2026-07-11 |
| 9 | Documentation & Backup (7 docs + /admin/help) | ✅ Complete | 2026-07-11 |
| 10 | International Payment Workflow (`/pay/:token`, `bank_accounts`, `payment_proofs`) | ✅ Complete | 2026-07-11 |
| 11 | Live FX Rates (source badge, manual override) | ✅ Complete | 2026-07-11 |
| 12 | **Schema Audit & Cleanup** (v20–v27 migrations, 6 redundant scripts removed, CMS tables dropped) | ✅ Complete | 2026-07-11 |

### What Comes After (Backlog)

Parked in [`UPDATE.md` §16.7–16.8](file:///c:/Users/nuke/Documents/buildwithlami/UPDATE.md):

- Team invitation flow (Owner → invite Surveyor/Drone Pilot with email)
- Per-division permissions UI (currently hardcoded in `authMiddleware.js` and `roles.js`)
- Activity audit log page (`/admin/logs` exists for raw read; needs UX polish)
- Decision log page (CEO-only "decisions made" feed)
- Expense tracking (vs. current revenue-only reporting)
- Tax/VAT on invoices (Nigeria 7.5% VAT, US sales tax by state)
- `/portal` logged-in client experience (currently magic-link only)
- Stripe integration (intentionally skipped per project memory — the `paystackService.js` refund branch and the `STRIPE_*` env vars were left out on purpose)
- Team workload view (assign leads to specific Pilot/Surveyor)
- Email-driven Zoho Sign setup (live mode stays dormant until a real account is wired up)
- Per-workspace dashboard widgets (today, recent activity already global)

---

## 11. Environment Configurations

The complete current list is at [`docs/ENV_VARIABLES.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/ENV_VARIABLES.md). Key variables:

```env
# ── Backend (Render) ─────────────────────────────────────
DATABASE_URL=postgresql://...                 # Supabase / Neon pooler URL (port 6543, sslmode=require)
PORT=4000                                     # Render injects this automatically
NODE_ENV=production

# ── Database pool tuning (optional) ─────────────────────
PG_POOL_MAX=10
PG_POOL_MIN=0
PG_CONNECTION_TIMEOUT_MS=10000
PG_IDLE_TIMEOUT_MS=30000
PG_STATEMENT_TIMEOUT_MS=30000                 # refuses a single query >30s

# ── Auth ──────────────────────────────────────────────────
JWT_SECRET=<64+ char random>                  # signs every token (admin + client + 2FA challenge)
JWT_EXPIRES_IN=30m                            # default; cookie maxAge mirrors this
ENCRYPTION_KEY=<32-byte hex, 64 chars>        # AES-256-GCM for project_secrets
COOKIE_DOMAIN=.buildwithlami.com
TOTP_ISSUER=BuildWithLami

# ── CORS ──────────────────────────────────────────────────
FRONTEND_URL=https://buildwithlami.com
ALLOWED_ORIGINS=https://buildwithlami.com,https://www.buildwithlami.com,https://buildwithlami.vercel.app,http://localhost:3000

# ── Email (Nodemailer SMTP) ───────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=<app password>
SMTP_FROM=noreply@buildwithlami.com
# When SMTP_USER is unset, emails are logged to stdout instead of sent
ADMIN_EMAIL=EUGENEODIBENUAH@GMAIL.COM
EMAIL_TO=                                     # legacy fallback for ADMIN_EMAIL

# ── Paystack (NGN only) ───────────────────────────────────
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...

# ── Cloudinary (image hosting) ────────────────────────────
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
CLOUDINARY_FOLDER=buildwithlami
# When unconfigured, uploads return a data: URI fallback so the CMS works locally

# ── Zoho Sign (CONTRACTS) — leave empty for stub mode ─────
ZOHO_SIGN_TOKEN=                              # leave empty for stub mode
ZOHO_SIGN_API_BASE=https://sign.zoho.com/api/v1
ZOHO_SIGN_WEBHOOK_SECRET=

# ── FX Rates ──────────────────────────────────────────────
FX_API_URL=https://open.er-api.com/v6/latest/NGN     # leave empty to disable live refresh

# ── Maintenance ──────────────────────────────────────────
MAINTENANCE_MODE=false

# ── Frontend (Vercel) — build-time ───────────────────────
VITE_API_URL=https://api.buildwithlami.com
VITE_PAYSTACK_PUBLIC_KEY=pk_live_...
VITE_API_PROXY=http://localhost:4000         # dev only; default in vite.config.js is :4001 mock server
```

> **Removed variables (history):** the Blueprint's earlier v2.0 `WHATSAPP_*` env vars are no longer used — WhatsApp deep-links are built from `clients.phone` on the fly (no API needed). The `STRIPE_*` and `paystackService.js` refund variables were intentionally skipped per project memory. Real Grey / Paystack settlement account numbers are entered at runtime via `/admin/settings` → Bank Accounts and are **never** committed to the repo.

---

## 12. Operational Notes

| Concern | Current State |
| :--- | :--- |
| **Backups** | Manual weekly `pg_dump` by CEO; documented in `docs/BACKUP.md`. In-app "Backup Now" endpoint (`/api/admin/backup-status`) is a liveness check only. |
| **Uptime** | UptimeRobot (free) pings `/api/health` every 5 min; alert to `ADMIN_EMAIL` (default: `EUGENEODIBENUAH@GMAIL.COM`). `/ping` and `/health` (with DB check) live in `routes/uptimeRoutes.js`. |
| **Error Monitoring** | Render logs only. Sentry is **explicitly out of scope** per project memory. |
| **CI/CD** | GitHub Actions workflow at `.github/workflows/ci.yml` runs on every PR and push to `main`: Node 20, `npm ci` for both workspaces, frontend `npm run lint` + `npm run build`, backend `node --check` smoke test on `index.js` and `db.js`. Vercel and Render still auto-deploy on `main` merge. |
| **Staging** | None — the CEO tests on the production database after a personal verification pass. |
| **Secrets in Repo** | The `v18_payment_proofs.sql` migration contains only **placeholder** bank-account rows (`0000000000`, `is_active=FALSE`). Real Grey / Paystack settlement details are entered via the **Admin Dashboard → Bank Accounts** UI and are never committed. `.env` files are git-ignored. |

---

*End of Blueprint v3.2. For per-phase build history, see [`ROADMAP.md`](file:///c:/Users/nuke/Documents/buildwithlami/ROADMAP.md). For decision rationale, see [`UPDATE.md`](file:///c:/Users/nuke/Documents/buildwithlami/UPDATE.md). For database details, see [`docs/SCHEMA.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/SCHEMA.md). For per-environment variable details, see [`docs/ENV_VARIABLES.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/ENV_VARIABLES.md).*