# buildwithlami.dev — Technical Blueprint v3.0 (Agency Operating System)

> **Last Updated:** July 2026
> **Status:** All 12 phases shipped. **Phase 12 (Schema Audit & Cleanup) complete.** System in maintenance.
> **Companion docs:** [`ROADMAP.md`](file:///c:/Users/nuke/Documents/buildwithlami/ROADMAP.md) (phased build history), [`UPDATE.md`](file:///c:/Users/nuke/Documents/buildwithlami/UPDATE.md) (decision log), [`docs/SCHEMA.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/SCHEMA.md) (database reference), [`docs/DEPLOYMENT.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/DEPLOYMENT.md) (ops), [`docs/ENV_VARIABLES.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/ENV_VARIABLES.md) (configuration).

---

## 1. Executive Summary

**Project Name:** buildwithlami.dev
**Type:** Personal Portfolio & High-Performance Agency Operating System
**Stack:** React 19 (Vite) + Express.js + PostgreSQL (raw `pg` client) + Cloudinary + Zoho Sign (stub mode) + Matter.js

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
   → RECEIVES INVOICE → PAYS VIA PAYSTACK (NGN) OR GREY BANK TRANSFER (USD/GBP)
   → SIGNS CONTRACT VIA ZOHO SIGN → TRACKS PROGRESS
   ```

---

## 2. System Architecture

### A. Tech Stack

| Layer | Technology | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 19 + Vite 8 (SPA) | ✅ Built & Responsive | React Router 7, page transitions, dark mode |
| **Styling** | TailwindCSS 3 + Framer Motion 12 | ✅ Implemented | Dark/light theme persisted in `localStorage` |
| **Visual Elements** | Matter.js 2D Physics Engine | ✅ Live on Tech Stack view | `frontend/src/components/TechStack.jsx` |
| **Icons** | Lucide React | ✅ Implemented | Tree-shakeable SVG icons |
| **Markdown** | Custom dependency-free regex renderer | ✅ `frontend/src/utils/markdown.js` | Used by CMS, testimonials, intake |
| **Backend** | Node.js + Express 4 | ✅ Built & Rate-Limited | 25 route modules, 19 controllers |
| **Database** | PostgreSQL 14+ (raw `pg` client) | ✅ Migrations v2–v20 deployed | 22 tables, 56 indexes |
| **Auth** | JWT (HttpOnly Cookie) + TOTP 2FA | ✅ Implemented | 10 RBAC roles, 30-min session timeout |
| **Secrets** | AES-256-GCM (server-side) | ✅ `backend/src/utils/crypto.js` | Per-secret IV + auth tag |
| **Email** | Nodemailer (SMTP) | ✅ Templates with `{{placeholder}}` | 5 default + custom |
| **Payments** | Paystack (NGN) + Grey bank transfers (USD/GBP) | ✅ `payment_proofs` review queue | Public `/pay/:token` page |
| **Contracts** | Zoho Sign v1 (stub mode by default) | ✅ `zohoSignService.js` | Switches live when `ZOHO_SIGN_TOKEN` is set |
| **Media** | Cloudinary (free tier) | ✅ `cloudinaryService.js` | Hero images, testimonials, proof attachments |
| **FX Rates** | open.er-api.com (free, no key) | ✅ Live-refreshed daily 5am UTC | Manual override in Settings → FX Rates |
| **Validation** | Zod (server) | ✅ All controllers | DOMPurify for XSS defense on contact form |
| **Scheduling** | node-cron | ✅ Domain expiry, FX refresh | `cronService.js` |
| **Rate Limiting** | express-rate-limit | ✅ Auth (20/15min), contact (10/hr), admin writes (60/15min) | |
| **Security Headers** | Helmet | ✅ Default config + CSP-friendly | |
| **Hosting** | Vercel (frontend) + Render/Railway (backend) + Supabase or Neon (Postgres) | ✅ Deployed | |

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
     │   ┌──────────┐ ┌─────────┐  │
     │   │  intake_ │ │ project │  │   ┌─────────────┐
     │   │templates │ │feedback │  │   │ bank_       │
     │   │ + _subs  │ └─────────┘  │   │ accounts    │
     │   └──────────┘               │   │ (Grey USD/  │
     │                              │   │  GBP, NGN)  │
     ▼                              ▼   └──────┬──────┘
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
│  PUBLIC CONTENT (CMS)                                       │
│  pages · resources · testimonials · equipment · industries │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  COMMUNICATION                                              │
│  messages (contact form) · email_templates · notifications │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema (v20 — Post-Audit)

**22 tables, 56 indexes, 4 triggers.** The complete reference is at [`docs/SCHEMA.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/SCHEMA.md). This section is a summary.

### A. By Purpose

| Purpose | Tables |
| :--- | :--- |
| **Auth & Users** | `users`, `roles` |
| **Portfolio & Public** | `profile`, `projects`, `pages`, `resources`, `testimonials` |
| **Clients & Projects** | `clients`, `client_projects`, `intake_templates`, `intake_submissions`, `project_secrets`, `project_feedback` |
| **CRM** | `bookings`, `leads` |
| **Invoices & Payments** | `invoices`, `fx_rates`, `bank_accounts`, `payment_proofs` |
| **Contracts** | `contracts` |
| **CMS Content** | `equipment`, `industries`, `email_templates` |
| **Communication** | `messages` |
| **Activity & Audit** | `activity_logs`, `audit_logs`, `notifications` |

### B. Migration Timeline

| # | Migration | Date | Purpose |
| :--- | :--- | :--- | :--- |
| — | `init.sql` + `createMissingTables.sql` | Phase 0 | Baseline: users, profile, projects, messages, clients, client_projects, invoices, intake_*, project_secrets, project_feedback |
| 1–3 | v2/v3/v4 (placeholders) | Phase 0 | Kept for `runUpdateSchema.js`; no-op |
| 4 | `v5_division.sql` | Phase 0 | `division` column on 5 tables; drop `messages.subject` |
| 5 | `v6_offboarding.sql` | Phase 1 | Offboarding columns on `client_projects`; drop `last_notified_at` |
| 6 | `v7_roles_rbac.sql` | Phase 1 | `roles` table + 10 RBAC roles seeded |
| 7 | `v8_bookings.sql` | Phase 2 | `bookings` (Survey + Drone) |
| 8 | `v9_leads.sql` | Phase 3 | `leads` (8-stage CRM pipeline) |
| 9 | `v10_notifications.sql` | Phase 3 | `notifications` (in-app bell) |
| 10 | `v11_audit_logs.sql` | Phase 4 | `audit_logs` (security record) |
| 11 | `v12_cms.sql` | Phase 5 | 8 CMS tables (pages, testimonials, equipment, industries, email_templates, contracts, resources, conversations) |
| 12 | `v13_two_factor.sql` | Phase 6 | 2FA TOTP columns on `users` |
| 13 | `v14_client_phone.sql` | Phase 6 | `clients.phone` (WhatsApp deep-links) |
| 14 | `v15_invoice_currency.sql` | Phase 7 | `invoices.currency` (NGN/USD/EUR/GBP) |
| 15 | `v16_invoice_fx_rates.sql` | Phase 8 | `fx_rates` table |
| 16 | `v17_contract_signed_pdf.sql` | Phase 8 | `contracts.signed_pdf` as `bytea` |
| 17 | `v18_payment_proofs.sql` | Phase 10 | `invoices.pay_token`, `bank_accounts`, `payment_proofs` + trigger |
| 18 | `v19_fx_live_source.sql` | Phase 11 | `fx_rates.source` + `fetched_at` |
| 19 | `v20_schema_cleanup.sql` | Phase 12 | **Adds `invoices.invoice_number` + `invoices.paid_at`, creates `activity_logs` table, drops unused `conversations`, adds 16 performance indexes** |

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
| **Multi-currency** via `fx_rates` with `source` badge ('LIVE' | 'MANUAL' | 'SEED') | Live API with manual override that survives failed fetches |
| **RBAC 10 roles** with both TEXT `users.role` and FK `users.role_id` | Backwards-compatible role checks during the migration |
| **One conversation-style view, three source tables** (`messages` + `project_feedback` + `intake_submissions`) | No separate `conversations` table; unified inbox aggregates at read time |

---

## 4. Security & Cryptographic Protocols

| Feature | Protocol | Details |
| :--- | :--- | :--- |
| **Authentication** | JWT (HttpOnly Cookie) | 30-min default expiry; refresh endpoint; role + 2FA flags in payload |
| **Two-Factor Auth** | TOTP (RFC 6238) via `otplib` | 8 one-time recovery codes (SHA-256 hashed); QR code setup page |
| **Session Timeout** | 25-min warning modal | "Session expires in 5 min" + "Extend" button |
| **Spam Hardening** | `express-rate-limit` | Auth: 20/15min · Contact: 10/hr · Admin writes: 60/15min · Public upload: throttled |
| **Credential Storage** | AES-256-GCM (server-side) | Values in `project_secrets` are encrypted with a 32-byte `ENCRYPTION_KEY`; per-secret IV + auth tag |
| **XSS Defense** | DOMPurify + custom Markdown | Sanitizes contact form, intake submissions, CMS Markdown |
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

**Entry:** `backend/src/index.js` — mounts 25 route modules.

```
/api/health              uptime
/api/dashboard           DashboardController (overview, reports, today)
/api/auth                AuthController + TwoFactorController (login, 2FA, refresh)
/api/projects            ProjectController (portfolio CRUD)
/api/clients             ClientController
/api/client-projects     ClientProjectController (incl. public /track/:id, /portal auth)
/api/contact             ContactController (public form + admin list)
/api/profile             ProfileController
/api/secrets             SecretController (encrypted vault)
/api/templates           TemplateController (intake templates)
/api/feedback            FeedbackController (per-stage client comments)
/api/invoices            InvoiceController (Paystack init, mark paid, refund, webhook)
/api/payments            PaymentController (public /pay/:token, admin queue, bank-account CRUD)
/api/notifications       NotificationController
/api/admin/inbox         AdminInboxController (unified inbox + bulk actions)
/api/bookings            BookingController (Survey + Drone)
/api/crm                 CRMController (leads, 8-stage pipeline, convert)
/api/email-templates     EmailTemplateController (CRUD + send-with-template)
/api/cms                 CMSController (pages, testimonials, equipment, industries, contracts, resources)
/api/divisions           DivisionController (cross-division access checks)
/api/contracts           ContractController (Zoho Sign, PDF download)
/api/fx-rates            FXRateController (live + manual rates)
/api/upload              UploadRoutes (Cloudinary)
/api/activity            ActivityController (read activity logs)
```

**Services:**
- `emailService.js` — Nodemailer wrapper, `sendNotificationEmail()`, template rendering
- `paymentEmailService.js` — invoice/proof/confirmation emails
- `cloudinaryService.js` — image upload to Cloudinary
- `zohoSignService.js` — `createAgreement()`, `getStatus()`, `downloadPDF()`, **stub-mode-by-default**
- `twoFactorService.js` — TOTP secret gen, code verify, recovery-code consume
- `templateService.js` — `{{placeholder}}` substitution for email bodies
- `fxService.js` — fetch from open.er-api.com, write to `fx_rates` with `source = 'LIVE'`
- `cronService.js` — daily FX refresh (5am UTC), domain-expiry checks, in-process dedupe `Map`
- `paymentEmailService.js` — 4-email workflow (invoice sent → proof received → admin notified → payment confirmed)

**Utilities:**
- `crypto.js` — AES-256-GCM `encrypt()` / `decrypt()` with per-secret IV + auth tag
- `auditLog.js` — `writeAuditLog()` centralised; called from every mutating controller
- `fx.js` — `getAllRates()`, `toBase()` for currency conversion in reports

### B. Frontend (React 19 + Vite)

**Entry:** `frontend/src/main.jsx` → `App.jsx` (router + page transitions).

**Public routes:**
- `/` HomePage (Hero, HowItWorks, About, Services, Pricing, Projects, Contact)
- `/portfolio` PortfolioPage (CMS-driven)
- `/projects` ProjectsPage + `/projects/:slug` ProjectDetailPage
- `/services` ServicesPage
- `/pricing` PricingPage (CMS-driven)
- `/about` AboutPage
- `/contact` ContactPage
- `/resources` ResourcesPage (CMS-driven)
- `/survey` SurveyHomePage (anchor sections: services, projects, equipment, gallery, testimonials, FAQ, booking)
- `/drone` DroneHomePage (same structure, division-specific content)
- `/track/:trackingId` ClientProjectTracker (public, token-based)
- `/intake/:templateId` ClientIntakeForm (public, token-based)
- `/pay/:token` PaymentPage (public, currency picker → Paystack OR bank transfer)
- `/login` LoginPage
- `/portal/:trackingId` Magic-link client portal
- `/admin/*` (see below)
- 404 → NotFoundPage

**Admin routes (all wrapped in `<ProtectedRoute>` + `<AdminLayout>`):**
- `/admin` AdminDashboard (Today widget + recent activity)
- `/admin/workspace-selector` (component, not a route)
- `/admin/clients` AdminClients
- `/admin/projects` AdminClientProjects + `/admin/projects/:id` AdminProjectDetail
- `/admin/leads` AdminCRM (Kanban, 8 stages)
- `/admin/invoices` AdminInvoices
- `/admin/payment-queue` AdminPaymentQueue
- `/admin/bookings` AdminSurveyBookings + AdminDroneBookings
- `/admin/flight-missions` AdminDroneFlightMissions
- `/admin/survey-projects` AdminSurveyProjects
- `/admin/contracts` AdminContracts
- `/admin/cms` AdminCMS (pages)
- `/admin/email-templates` AdminEmailTemplates
- `/admin/testimonials` AdminTestimonials
- `/admin/equipment` AdminEquipment
- `/admin/industries` AdminIndustries
- `/admin/portfolio` AdminPortfolio
- `/admin/reports` AdminReports (revenue, top clients, completion rate, FX-converted to NGN)
- `/admin/logs` AdminLogs
- `/admin/inbox` AdminInbox (unified)
- `/admin/intake-templates` AdminIntakeTemplates
- `/admin/settings` AdminSettings (FX rates, bank accounts, profile, 2FA)
- `/admin/help` AdminHelp (in-app FAQ)
- `/admin/2fa` AdminTwoFactorSetup

**Shared admin components:** `AdminLayout`, `WorkspaceSelector`, `TodayWidget`, `NotificationBell`, `QuickActionFAB`, `GlobalSearch`, `BulkActionBar`, `SessionTimeoutModal`, `WorkspaceListPage`, `Skeleton`, `ErrorBoundary`.

**Contexts:** `AuthContext` (user, role, 2FA, login, refresh).

**Data:** `divisions.js` (Survey/Drone service lists), `adminNavItems.jsx` (4 workspaces × ~14 modules each), `fallbackProjects.js` (used when DB has none).

---

## 6. Multi-Division Architecture

Three divisions share one database and one admin. Every business table has a `division` CHECK column with values `SOFTWARE`, `SURVEY`, `DRONE` (with `SOFTWARE` as default).

| Division | Public Page | Booking Form | Lead Source | Admin Workspace |
| :--- | :--- | :--- | :--- | :--- |
| **SOFTWARE** | `/`, `/services`, `/portfolio` | `/contact` form | `messages` → `leads` | "Global" + "Software" |
| **SURVEY** | `/survey` | "Book Survey" inline form | `bookings(div='SURVEY')` → `leads` | "Survey" |
| **DRONE** | `/drone` | "Book Flight" inline form | `bookings(div='DRONE')` → `leads` | "Drone" |

The admin nav adapts via `WorkspaceSelector` (persisted in `localStorage.admin_workspace`). Each workspace shows division-specific modules (e.g. Survey shows "Coordinate Files" and "AutoCAD" placeholders; Drone shows "Flight Missions" and "Battery Health").

---

## 7. Payment Architecture

### A. Two Payment Rails

| Rail | Currency | Flow | Confirmation |
| :--- | :--- | :--- | :--- |
| **Paystack** | NGN | `POST /transaction/initialize` → email link → client pays → webhook marks `invoices.status = 'PAID'` | Automatic (webhook) |
| **Grey Bank Transfer** | USD, GBP (configurable for EUR) | Client sees bank details on `/pay/:token` after picking currency → transfers manually → uploads proof | Manual (`payment_proofs` review queue) |

### B. Public Payment Page (`/pay/:token`)

1. Client opens the unguessable URL from the invoice email
2. Page shows invoice summary, project name, due date
3. Client picks currency from a step-zero choice (bank details never leak to the wrong audience)
4. If NGN → Paystack button + reference
5. If USD/GBP → bank details + "I've paid" button (opens proof form)
6. Client submits `transaction_reference` + optional screenshot → `payment_proofs` row created with `status = 'PENDING'`
7. Admin gets email, reviews the queue at `/admin/payment-queue`, marks CONFIRMED or REJECTED
8. On CONFIRM → `invoices.status = 'PAID'`, `paid_at = NOW()`, `paid_via = 'BANK_TRANSFER'`, client gets confirmation email

### C. Multi-Currency Reporting

All invoice amounts are stored in their native currency. The Reports page converts everything to **NGN** using `fx_rates`, which is live-refreshed daily at 5am UTC from [open.er-api.com](https://open.er-api.com) (no API key). Manual overrides survive failed API calls; the UI shows a `source` badge per rate.

---

## 8. Internationalization (FX & Bank)

| Concern | Implementation |
| :--- | :--- |
| **Supported Currencies** | `SUPPORTED_CURRENCIES` constant in `utils/fx.js` (NGN, USD, EUR, GBP) |
| **Base Currency** | NGN (all dashboard reporting) |
| **Live Source** | `https://open.er-api.com/v6/latest/NGN` (no API key) |
| **Refresh Schedule** | Daily 5am UTC via `cronService.fxRefreshJob` |
| **Manual Override** | `/admin/settings` → FX Rates (each row editable, `source` flips to 'MANUAL') |
| **Bank Account Storage** | `bank_accounts` table; never exposed on public site; only on `/pay/:token` after currency choice |
| **Seeded Accounts** (v18) | Lead Bank USD `210837680768` (Grey), Clear Junction GBP `43014342` (Grey) |
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
| 6 | Admin Workspaces & Modules (4 workspaces × ~14 modules) | ✅ Complete | 2026-07-10 |
| 7 | Survey & Drone Public Pages (booking + content) | ✅ Complete | 2026-07-10 |
| 8 | Zoho Sign & Financial (contracts, multi-currency, signed PDF bytea) | ✅ Complete | 2026-07-11 |
| 9 | Documentation & Backup (7 docs + /admin/help) | ✅ Complete | 2026-07-11 |
| 10 | International Payment Workflow (`/pay/:token`, `bank_accounts`, `payment_proofs`) | ✅ Complete | 2026-07-11 |
| 11 | Live FX Rates (source badge, manual override) | ✅ Complete | 2026-07-11 |
| 12 | **Schema Audit & Cleanup** (v20 migration, 6 redundant scripts removed) | ✅ Complete | 2026-07-11 |

### What Comes After (Backlog)

Parked in [`UPDATE.md` §16.7–16.8](file:///c:/Users/nuke/Documents/buildwithlami/UPDATE.md):

- Team invitation flow (Owner → invite Surveyor/Drone Pilot with email)
- Per-division permissions UI (currently hardcoded in `authMiddleware.js`)
- Activity audit log page (`/admin/logs` exists for raw read; needs UX polish)
- Decision log page (CEO-only "decisions made" feed)
- Expense tracking (vs. current revenue-only reporting)
- Tax/VAT on invoices (Nigeria 7.5% VAT, US sales tax by state)
- `/portal` logged-in client experience (currently magic-link only)
- Stripe integration (skeleton `clients.stripe_customer_id` column already in place)
- Team workload view (assign leads to specific Pilot/Surveyor)

---

## 11. Environment Configurations

The complete current list is at [`docs/ENV_VARIABLES.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/ENV_VARIABLES.md). Key variables:

```env
# ── Backend (Render / Railway) ────────────────────────────
DATABASE_URL=postgresql://...                 # Supabase or Neon pooled connection
PORT=4000
NODE_ENV=production

# ── Auth ──────────────────────────────────────────────────
JWT_SECRET=<32+ char random>
ENCRYPTION_KEY=<32-byte hex, 64 chars>        # AES-256-GCM
COOKIE_DOMAIN=.buildwithlami.dev

# ── CORS ──────────────────────────────────────────────────
FRONTEND_URL=https://buildwithlami.vercel.app
ALLOWED_ORIGINS=https://buildwithlami.vercel.app,https://buildwithlami.com

# ── Email (Nodemailer SMTP) ───────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=...
SMTP_PASS=<app password>
CEO_EMAIL=EUGENEODIBENUAH@GMAIL.COM

# ── Paystack (NGN only) ───────────────────────────────────
PAYSTACK_SECRET_KEY=sk_live_...

# ── Cloudinary (image hosting) ────────────────────────────
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# ── Zoho Sign (CONTRACTS) — leave empty for stub mode ─────
ZOHO_SIGN_TOKEN=                              # leave empty for stub mode
ZOHO_SIGN_API_URL=https://sign.zoho.com/api/v1

# ── Frontend (Vercel) ─────────────────────────────────────
VITE_API_URL=https://api.buildwithlami.dev
```

> **Note:** The Blueprint's earlier v2.0 `WHATSAPP_*` env vars are no longer used. WhatsApp deep-links are now built from `clients.phone` on the fly (no API needed). The `STRIPE_*` and `paystackService.js` refund variables were intentionally skipped per [`UPDATE.md` lessons learned](file:///c:/Users/nuke/Documents/buildwithlami/UPDATE.md).

---

## 12. Operational Notes

| Concern | Current State |
| :--- | :--- |
| **Backups** | Manual weekly `pg_dump` by CEO; documented in `docs/BACKUP.md`. In-app "Backup Now" button is a liveness check only. |
| **Uptime** | UptimeRobot (free) pings `/api/health` every 5 min; alert to `EUGENEODIBENUAH@GMAIL.COM`. |
| **Error Monitoring** | None wired up yet — Render logs only. (Backlog: Sentry or similar.) |
| **CI/CD** | Vercel auto-deploy on `main` push for frontend; Render auto-deploy for backend. No CI pipeline yet. |
| **Staging** | None — the CEO tests on the production database after a personal verification pass. |
| **Secrets in Repo** | The `v18_payment_proofs.sql` migration contains the CEO's real Grey account numbers. If the repo ever goes public, move them to a gitignored secrets migration. |

---

*End of Blueprint v3.0. For per-phase build history, see [`ROADMAP.md`](file:///c:/Users/nuke/Documents/buildwithlami/ROADMAP.md). For decision rationale, see [`UPDATE.md`](file:///c:/Users/nuke/Documents/buildwithlami/UPDATE.md). For database details, see [`docs/SCHEMA.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/SCHEMA.md).*
