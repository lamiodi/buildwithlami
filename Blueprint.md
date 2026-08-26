# BuildWithLami Enterprise Platform Blueprint v4.0 (Agency OS & Multi-Division Studio)

> **Last Updated:** August 2026  
> **Status:** Production live & 100% feature complete. Includes Universal Design System, 3-Division Architecture (Software · Cadastral Survey · Commercial Drone), Solo Founder Operator OS, GoodFound-inspired dual-currency pricing architecture, 4-step interactive Quotation Builder, 50/50 milestone calculation, Matter.js interactive physics, Vercel API rewrites, cross-origin HttpOnly cookie strategy, 2FA persistence, Client Portal SPA, Project Milestones & Timeline, 1-Click Quotation-to-Contract Pipeline, Flagship Invoice Generator with QR codes & partial payments, Categorized Document Repository, Zoho Sign contracts, and Nigerian & International market workflows.  
> **Companion docs:** [`ROADMAP.md`](file:///c:/Users/nuke/Documents/buildwithlami/ROADMAP.md) (phased build history), [`UPDATE.md`](file:///c:/Users/nuke/Documents/buildwithlami/UPDATE.md) (decision log), [`docs/GOODFOUND_STUDIO_PORTFOLIO_LEARNINGS.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/GOODFOUND_STUDIO_PORTFOLIO_LEARNINGS.md) (competitive tear-down), [`docs/SCHEMA.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/SCHEMA.md) (database reference), [`docs/DEPLOYMENT.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/DEPLOYMENT.md) (ops), [`docs/ENV_VARIABLES.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/ENV_VARIABLES.md) (configuration).

---

## 1. Executive Summary

**Project Name:** BuildWithLami (`buildwithlami.com` / `buildwithlami.vercel.app`)  
**Type:** Multi-Division Digital Product Studio & Solo-Founder Operating System  
**Founder & Technical Principal:** Eugene Odibenuah (Lagos, Nigeria · Worldwide Remote)  
**Stack:** React 19.2.5 (Vite 8) + TailwindCSS 3.4.19 + Framer Motion 12 + Express 4.21 + PostgreSQL 14+ (raw `pg` client) + Matter.js 0.19 + Cloudinary + Paystack + Nodemailer

### Core Mission & Operator Model

BuildWithLami operates as a **high-leverage Solo-Founder Operating System (One-Man Agency)**. The platform is architected so a single technical principal can seamlessly manage three integrated commercial divisions from a unified command center without administrative friction:

1. **Digital Product Studio & Software Engineering** (`/`): High-performance Web Applications, E-Commerce, SaaS Platforms, APIs, UI/UX Systems, and Technical SEO.
2. **Cadastral & Land Surveying Division** (`/survey`): Boundary Surveys, Beacon Installations, Layout Demarcations, Topographical & Contour Mapping, and Land Registry compliance.
3. **Commercial Drone & Aerial Data Division** (`/drone`): High-resolution Orthomosaics, Construction Progress Telemetry, Real Estate Aerial Media, and 4K Volumetric/Visual Inspections.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   SOLO FOUNDER (EUGENE ODIBENUAH)                            │
│                 Unified Admin Operations Center (/admin)                    │
├──────────────────────┬──────────────────────────────┬───────────────────────┤
│ SOFTWARE STUDIO      │ SURVEY DIVISION              │ DRONE DIVISION        │
│ • Web & Mobile Apps  │ • Boundary Demarcation       │ • 4K Drone Media      │
│ • Custom SaaS/APIs   │ • Topographical / Contours   │ • Orthomosaics / DSM  │
│ • Technical SEO/AI   │ • Land Registry & Beacons    │ • Site Monitoring     │
├──────────────────────┴──────────────────────────────┴───────────────────────┤
│ SHARED BACKEND ENGINE: Auth (2FA) · CRM · Invoicing · Payments · Client Portal │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Dual-Audience Pricing Architecture

* **International Clients (Outside Africa - USD $)**: Exact GoodFound Studio standard figures ($899 Web, $1,799 E-Commerce, $3,200 Custom Software, $699 UI/UX, $599 Branding, $599 SEO, $699 Marketing, $1,199 AI, $149/mo Maintenance Retainer).
* **Local Clients (Nigeria - NGN ₦)**: Tailored local figures (₦350k Web, ₦650k E-Commerce, ₦1.2M Custom Software, ₦280k UI/UX, ₦250k Branding, ₦220k SEO, ₦250k Marketing, ₦450k AI, ₦60k/mo Maintenance Retainer).
* **Survey & Drone Service Tiers**: Flat NGN rate cards (₦150k Standard Plot Survey, ₦350k Perimeter & Topography, ₦150k Aerial Photography, ₦300k Orthomosaic Photogrammetry Mapping).
* **Enterprise Cloud Guarantee**: Global Edge CDN, automated backups, 99.9% uptime architecture, and 100% IP code ownership transfer included across all tiers.
* **Transparent Scoping**: Explicit *"What's NOT Included"* lists on every tier card to prevent scope creep and eliminate ambiguity.
* **50/50 Milestone Terms**: 50% upfront deposit to commence engineering, 50% balance upon final staging approval and production handoff.

---

## 3. System Architecture & Technical Specifications

| Layer | Technology | Status | Implementation Notes |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 19.2.5 + Vite 8 (SPA) | ✅ Production Ready | React Router v6/v7, lazy-loaded admin routes & client portal, automated currency detector (`currency.js`) |
| **Styling** | TailwindCSS 3.4.19 + Framer Motion 12 | ✅ Standardized | Unified design system tokens, `dark:bg-[#141414]` surfaces, division-specific theme accents |
| **Design System** | BuildWithLami Universal Button & Card System | ✅ Standardized | Razor-sharp architectural buttons (`text-[11px] font-bold uppercase tracking-[0.15em] px-10 py-4`), `rounded-2xl` cards |
| **Visuals** | Matter.js 0.19 2D Physics Canvas | ✅ Live on Footer & TechStack | Interactive floating cards with collision boundaries and reduced-motion fallbacks |
| **Icons** | Lucide React + Stroke-based SVGs (1.5px) | ✅ Standardized | Clean architectural stroke icons; informal emojis removed from structural cards |
| **WhatsApp Widgets** | Adaptive Division HUDs | ✅ Live across all 3 pages | Context-aware WhatsApp contact widgets for Software, Survey, and Drone with collision avoidance |
| **Backend** | Node.js + Express 4.21 | ✅ Audited & Hardened | 28 route modules, 24 controllers, global raw body capture for webhooks, CSRF-gated |
| **Database** | PostgreSQL 14+ (raw `pg` client) | ✅ Migrations v1–v35 | 24 tables, 58+ indexes, automated sequences, atomic invoice number generator |
| **Auth & Security** | JWT (HttpOnly Cookie) + TOTP 2FA + RBAC | ✅ Audited & Hardened | 10 canonical roles, dual-secret client token architecture, CSRF double-submit protection |
| **Proxy & Rewrites** | Vercel Rewrite (`/api/*` → Render) | ✅ Active | `frontend/vercel.json` proxies `/api/*` to Render backend for first-party cookie compliance |
| **Secrets Vault** | AES-256-GCM (server-side) | ✅ `backend/src/utils/crypto.js` | Per-secret IV + auth tag encryption for client server credentials |
| **Email Service** | Nodemailer (SMTP) | ✅ Production Safe | Graceful dev mock logging with strict production alerting and failure notifications |
| **Payment Rails** | Paystack (NGN) + Grey Bank Transfer (USD/GBP/EUR) | ✅ Production Verified | Cryptographic HMAC-SHA512 webhook verification + manual `/admin/payments` review queue |
| **Contracts** | Zoho Sign v1 (stub + live modes) | ✅ `zohoSignService.js` | Generates legally binding contracts, stores signed PDFs as `bytea` |
| **Media Hosting** | Cloudinary CDN | ✅ Production Safe | Hero imagery, project attachments, and payment proof uploads with strict 503 fallback guards |
| **Live FX Rates** | open.er-api.com | ✅ Daily 5am UTC cron | Automated NGN conversion with manual admin overrides in `/admin/settings` |

---

## 4. Master Design System Tokens

```css
/* Light Mode Canvas */
:root {
  --bg-canvas: 0 0% 100%;             /* #ffffff - Page Background */
  --bg-surface: 0 0% 98%;            /* #fafafa - Light Card Surface */
  --accent: 12 90% 55%;              /* #F44A22 - Flame Red-Orange */
  --accent-foreground: 0 0% 100%;    /* #ffffff */
  --text-primary: 0 0% 9%;           /* #171717 */
  --text-secondary: 0 0% 40%;        /* #666666 */
  --border-subtle: 0 0% 90%;         /* #e5e5e5 */
}

/* Dark Mode Canvas */
.dark {
  --bg-canvas: 0 0% 8.6%;            /* #161616 - Dark Canvas */
  --bg-surface: 0 0% 8%;             /* #141414 - Consolidated Card Surface */
  --border-subtle: 0 0% 100% / 0.10; /* 10% White Border */
  --text-primary: 0 0% 98%;          /* #fafafa */
  --text-secondary: 0 0% 70%;        /* #b3b3b3 */
}
```

### Typography Scale
* **Headings**: `Space Grotesk` (`font-heading`) — Geometric modern engineering structure.
* **Body Text**: `Advent Pro` (`font-body`) — Clean, light, high-legibility character.
* **Technical Data**: `JetBrains Mono` / monospace (`font-mono`) — Precision coordinates, invoice numbers, metadata.
* **Signature**: `Caveat` (`font-handwritten` / `font-signature`) — Founder verification mark.

---

## 5. Navigation & Public Routing Topology

| Route | View Component | Division | Description |
| :--- | :--- | :--- | :--- |
| `/` | `SoftwareHomePage.jsx` | Software | Flagship Studio Hero, Selected Works, Capabilities, Pricing Preview, Physics Canvas |
| `/survey` | `SurveyHomePage.jsx` | Survey | Cadastral Land Surveying, Boundary Demarcation, Beaconing, GIS/Topo Mapping, Custom Survey Footer & WhatsApp HUD |
| `/drone` | `DroneHomePage.jsx` | Drone | Commercial Drone Services, Orthomosaic Photogrammetry, 4K Aerial Videography, Custom Drone Footer & WhatsApp HUD |
| `/projects` | `ProjectsPage.jsx` | Universal | Multi-division case-study portfolio with category tabs (Web Apps, E-Commerce, Survey, Drone) |
| `/projects/:id` | `ProjectDetailPage.jsx` | Universal | Deep engineering case study (Problem $\to$ Strategy $\to$ Architecture $\to$ Deliverables $\to$ Outcome) |
| `/services` | `ServicesPage.jsx` | Software | Full capabilities catalog with outcome-driven descriptions and deliverables |
| `/pricing` | `PricingPage.jsx` | Software | Dual-currency pricing tiers, 4-step interactive Quote Builder, and 50/50 milestone calculation |
| `/about` | `AboutPage.jsx` | Universal | Founder background, engineering philosophy, tech stack breakdown, and career timeline |
| `/contact` | `ContactPage.jsx` | Universal | Inbound intake with URL pre-fill (`?service=...&tier=...`) and instant CRM auto-tagging |
| `/pay/:token` | `PaymentPage.jsx` | Universal | Token-gated public invoice checkout (Paystack NGN card/transfer or Grey USD/GBP/EUR bank transfer) |
| `/portal/*` | `ClientPortalLayout.jsx` | Universal | Client dashboard: Billing & Invoices, Deliverables Repository, Credential Vault, and Milestones |
| `/admin/*` | `AdminLayout.jsx` | Solo Founder | Master operating system: Unified Inbox, CRM Kanban, Quotations, Invoices, Proof Review, Reports, Settings |

---

## 6. Solo-Founder Operating Workflows

### A. Discovery to Project Initiation Flow
```
VISITOR (Software, Survey, or Drone)
  │
  ├──► SUBMITS INTAKE BRIEF (/contact or /survey or /drone)
  │       │
  │       ▼
  └──► AUTO-GENERATES CRM LEAD IN DATABASE (backend/src/controllers/contactController.js)
          │
          ▼
       FOUNDER REVIEWS IN UNIFIED ADMIN INBOX (/admin/inbox)
          │
          ├──► GENERATES MODULAR 3-TIER QUOTATION (/admin/quotations)
          │       │
          │       ▼
          ├──► 1-CLICK CONVERTS TO CONTRACT VIA ZOHO SIGN (/admin/contracts)
          │       │
          │       ▼
          └──► ISSUES 50% KICKOFF INVOICE WITH PAYSTACK/GREY TOKEN (/admin/invoices)
                  │
                  ▼
               CLIENT PAYS VIA /pay/:token
                  │
                  ├──► PAYSTACK WEBHOOK CONFIRMS (HMAC-SHA512 Verified)
                  │       OR
                  └──► FOUNDER CONFIRMS BANK TRANSFER IN REVIEW QUEUE (/admin/payments)
                          │
                          ▼
                       PROJECT AUTO-ACTIVATES IN DATABASE (`client_projects`)
                          │
                          ▼
                       CLIENT ACCESSES SECURE PORTAL (`/portal`)
```

### B. Client Self-Service & Delivery Pipeline
```
CLIENT PORTAL (/portal)
  ├── 1. PROJECT TIMELINE & 5-STAGE SPRINT TRACKER
  ├── 2. INVOICES & RECEIPT ARCHIVE (Linked to live /pay/:token receipts)
  ├── 3. CREDENTIAL VAULT (AES-256-GCM encrypted submission for hosting & API keys)
  ├── 4. DOCUMENT & DELIVERABLE REPOSITORY (CAD files, drone footage, ZIP bundles)
  └── 5. 50% FINAL BALANCE SETTLEMENT & IP OWNERSHIP HANDOVER
```

---

## 7. Production Reliability & Security Baseline

1. **Deterministic Webhook Verification**:
   - Paystack webhooks processed with `req.rawBody` captured at global parser level.
   - Constant-time HMAC-SHA512 hash validation prevents timing attacks.
   - Server-side amount matching (`AND amount = event.data.amount / 100`) eliminates client-side payment tampering.

2. **Atomic Invoice Sequence Generator**:
   - `invoice_number` sequence computed using numeric regex extraction + automated retry loop on collision (PostgreSQL error 23505), guaranteeing race-condition-free invoice generation.

3. **RBAC & Role Normalisation**:
   - Full 10-role specification in `roles.js` (`Owner`, `Administrator`, `Finance`, `Project Manager`, `Developer`, `Survey Manager`, `Surveyor`, `Drone Manager`, `Drone Pilot`, `Staff`).
   - Clean permission boundaries for solo-founder administration and client portal segregation.

4. **CSRF & Cookie Protection**:
   - Double-submit CSRF cookie protection across all authenticated routes.
   - Explicit `skipPaths` whitelist for third-party webhooks (`/api/invoices/webhook/paystack`) and token-gated public checkouts (`/api/payments/public`).

5. **Zero Build Warnings & Continuous Verification**:
   - Frontend compiles with Rolldown/Vite with zero errors or bundle warnings.
   - Backend boots with zero deprecation warnings and scheduled daily health checks.

---

*End of Blueprint v4.0. Maintained and governed by BuildWithLami.*