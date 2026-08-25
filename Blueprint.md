# BuildWithLami Enterprise Platform Blueprint v3.5 (Digital Product Studio & Agency OS)

> **Last Updated:** August 2026  
> **Status:** Production live & 100% feature complete. Includes Universal Design System, GoodFound-inspired dual-currency pricing architecture, 4-step interactive Quotation Builder, 50/50 milestone calculation, Matter.js interactive physics, Vercel API rewrites, cross-origin HttpOnly cookie strategy, 2FA persistence, Client Portal SPA, Project Milestones & Timeline, 1-Click Quotation-to-Contract Pipeline, Flagship Invoice Generator with QR codes & partial payments, Categorized Document Repository, Zoho Sign contracts, and Nigerian & International market workflows.  
> **Companion docs:** [`ROADMAP.md`](file:///c:/Users/nuke/Documents/buildwithlami/ROADMAP.md) (phased build history), [`UPDATE.md`](file:///c:/Users/nuke/Documents/buildwithlami/UPDATE.md) (decision log), [`docs/GOODFOUND_STUDIO_PORTFOLIO_LEARNINGS.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/GOODFOUND_STUDIO_PORTFOLIO_LEARNINGS.md) (competitive tear-down), [`docs/SCHEMA.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/SCHEMA.md) (database reference), [`docs/DEPLOYMENT.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/DEPLOYMENT.md) (ops), [`docs/ENV_VARIABLES.md`](file:///c:/Users/nuke/Documents/buildwithlami/docs/ENV_VARIABLES.md) (configuration).

---

## 1. Executive Summary

**Project Name:** BuildWithLami (`buildwithlami.com` / `buildwithlami.vercel.app`)  
**Type:** Digital Product Studio Portfolio & High-Performance Agency Operating System  
**Founder & Lead Engineer:** Eugene Odibenuah (Lagos, Nigeria · Worldwide Remote)  
**Stack:** React 19.2.5 (Vite 8) + TailwindCSS 3.4.19 + Framer Motion 12 + Express 4.21 + PostgreSQL 14+ (raw `pg` client) + Matter.js 0.19 + Cloudinary + Zoho Sign (stub & live modes)

### Core Mission

Provide a world-class, conversion-focused digital studio experience for prospective clients while acting as a robust, automated operation center for freelance engineering (Web Applications, E-Commerce Platforms, Custom Software, APIs, Technical SEO, and UI/UX) — handling inbound leads, client onboarding, dynamic intake, credential vaulting, multi-currency 50/50 milestone invoicing, international wire/bank-transfer verification, signed contracts, quotation conversion, project document management, and live milestone tracking from a single dashboard.

### Dual-Audience Pricing Architecture

* **International Clients (Outside Africa - USD $)**: Exact GoodFound Studio standard figures ($899 Web, $1,799 E-Commerce, $3,200 Custom Software, $699 UI/UX, $599 Branding, $599 SEO, $699 Marketing, $1,199 AI, $149/mo Maintenance Retainer).
* **Local Clients (Nigeria - NGN ₦)**: Tailored local figures (₦350k Web, ₦650k E-Commerce, ₦1.2M Custom Software, ₦280k UI/UX, ₦250k Branding, ₦220k SEO, ₦250k Marketing, ₦450k AI, ₦60k/mo Maintenance Retainer).
* **Enterprise Cloud Guarantee**: Global Edge CDN, automated backups, 99.9% uptime architecture, and 100% IP code ownership transfer included across all tiers without confusing infrastructure choices.
* **Transparent Scoping**: Explicit *"What's NOT Included"* lists on every tier card to prevent scope creep and eliminate ambiguity.
* **50/50 Milestone Terms**: 50% upfront deposit to commence engineering, 50% balance upon final staging approval and production handoff.

### Interactive User Flows

1. **Public Portfolio & Discovery Pipeline**
   ```
   VISITOR → BROWSE /projects | /services | /pricing → INTERACTIVE QUOTE BUILDER
   → PRE-FILLED INTAKE BRIEF (/contact?service=...&tier=...) → messages + leads (CRM)
   ```

2. **Client Portal & Delivery Pipeline**
   ```
   LEAD CONVERTED → ADMIN GENERATES CLIENT PORTAL → CLIENT ACCESSES UNIQUE TRACKING ID
   → COMPLETES INTAKE TEMPLATE → VAULTS CREDENTIALS (AES-256-GCM)
   → SIGNS CONTRACT VIA ZOHO SIGN → PAYS 50% MILESTONE (PAYSTACK NGN / GREY USD)
   → TRACKS 5-STAGE SPRINT TIMELINE → DOWNLOADS DELIVERABLE ASSETS
   ```

---

## 2. System Architecture

### A. Tech Stack & Library Standards

| Layer | Technology | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 19.2.5 + Vite 8 (SPA) | ✅ Built & Responsive | React Router v6/v7, lazy-loaded admin routes & client portal, automated currency detector (`currency.js`) |
| **Styling** | TailwindCSS 3.4.19 + Framer Motion 12 | ✅ Standardized | Unified design system tokens, `dark:bg-[#141414]` surfaces, custom select/input styles |
| **Design System** | BuildWithLami Universal Button & Card System | ✅ Standardized | Razor-sharp architectural buttons (`text-[11px] font-bold uppercase tracking-[0.15em] px-10 py-4`), `rounded-2xl` cards |
| **Visual Elements** | Matter.js 0.19 2D Physics Canvas | ✅ Live on Footer & TechStack | Interactive floating cards with collision boundaries and reduced-motion fallbacks |
| **Icons** | Lucide React + Stroke-based SVGs (1.5px) | ✅ Standardized | Clean architectural stroke icons; informal emojis removed from structural cards |
| **Markdown** | Custom regex parser + DOMPurify | ✅ `utils/markdown.js` | Dependency-free parsing with safe HTML sanitization |
| **Backend** | Node.js + Express 4.21 | ✅ Built & Rate-Limited | 26 route modules, 24 controllers |
| **Database** | PostgreSQL 14+ (raw `pg` client) | ✅ Migrations v2–v35 deployed | 24 tables, 58+ indexes, 4 triggers |
| **Auth** | JWT (HttpOnly Cookie) + TOTP 2FA | ✅ Implemented | Admin & Client auth contexts; 5 RBAC roles, cookie persistence across domains |
| **Proxy & Rewrites** | Vercel Rewrite (`/api/*` → Render) | ✅ Active | `frontend/vercel.json` proxies `/api/*` to Render backend for first-party cookie compliance |
| **Secrets Vault** | AES-256-GCM (server-side) | ✅ `backend/src/utils/crypto.js` | Per-secret IV + auth tag encryption for client server credentials |
| **Email Service** | Nodemailer (SMTP) | ✅ Templates with `{{placeholder}}` | 5 core templates; falls back to stdout during development |
| **Payment Rails** | Paystack (NGN) + Grey Bank Transfer (USD/GBP/EUR) | ✅ `payment_proofs` review queue | Public `/pay/:token` page with currency selection |
| **Contracts** | Zoho Sign v1 (stub + live modes) | ✅ `zohoSignService.js` | Generates legally binding contracts, stores signed PDFs as `bytea` |
| **Media Hosting** | Cloudinary + Local Fallbacks | ✅ Implemented | Hero imagery, project attachments, and payment proof uploads |
| **Live FX Rates** | open.er-api.com (free, no key) | ✅ Daily 5am UTC cron | Automated NGN conversion with manual admin overrides |

---

## 3. Design System & Visual Baseline

The BuildWithLami design language is defined by a rigorous, high-contrast, architectural aesthetic.

### A. The Master Button System

All buttons across the platform derive from the user-approved **Hero Section Button Pair**:

```jsx
/* 1. PRIMARY CONVERSION CTA (e.g. Start a Project, Request Proposal) */
<Link
  to="/contact"
  className="bg-accent text-white font-heading font-bold uppercase text-[11px] px-8 sm:px-10 py-4 tracking-[0.15em] hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all duration-300 inline-flex items-center justify-center text-center shadow-lg hover:shadow-accent/30 active:scale-[0.98] cursor-pointer"
>
  Start a Project
</Link>

/* 2. SECONDARY OUTLINE CTA (e.g. See My Work, WhatsApp Direct) */
<Link
  to="/projects"
  className="border border-gray-300 dark:border-white/15 text-gray-900 dark:text-gray-100 font-heading font-bold text-[11px] uppercase tracking-[0.15em] hover:border-accent hover:text-accent transition-all duration-300 inline-flex items-center justify-center text-center py-4 px-8 sm:px-10 active:scale-[0.98] bg-transparent cursor-pointer"
>
  See My Work
</Link>

/* 3. CARD-LEVEL ACTION (e.g. Scope & Specs, Case Study) */
<button
  type="button"
  className="bg-black dark:bg-white text-white dark:text-black hover:bg-accent dark:hover:bg-accent dark:hover:text-white font-heading text-[11px] font-bold uppercase tracking-[0.15em] px-6 py-3.5 transition-all duration-300 inline-flex items-center justify-center text-center shadow-md active:scale-[0.98] cursor-pointer"
>
  View Case Study →
</button>
```

### B. Color Tokens & Surface Hierarchy

```css
:root {
  --bg-canvas: 0 0% 100%;             /* #ffffff - Page Background */
  --bg-surface: 0 0% 98%;            /* #fafafa - Light Card Surface */
  --accent: 12 90% 55%;              /* #F44A22 - Flame Red-Orange */
  --accent-foreground: 0 0% 100%;    /* #ffffff */
  --text-primary: 0 0% 9%;           /* #171717 */
  --text-secondary: 0 0% 40%;        /* #666666 */
  --border-subtle: 0 0% 90%;         /* #e5e5e5 */
}

.dark {
  --bg-canvas: 0 0% 8.6%;            /* #161616 - Dark Canvas */
  --bg-surface: 0 0% 8%;             /* #141414 - Consolidated Card Surface */
  --border-subtle: 0 0% 100% / 0.10; /* 10% White Border */
  --text-primary: 0 0% 98%;          /* #fafafa */
  --text-secondary: 0 0% 70%;        /* #b3b3b3 */
}
```

### C. Typography Scale

* **Headings**: `Space Grotesk` (`font-heading`) — Bold, geometric, modern engineering character.
* **Body Text**: `Advent Pro` (`font-body`) — Clean, readable, light aesthetic.
* **Badges & Meta**: `JetBrains Mono` / monospace (`font-mono`) — Technical credibility.
* **Founder Signature**: `Caveat` (`font-handwritten` / `font-signature`) — Authentic founder stamp.

---

## 4. Public Navigation & Routing Map

| Route | View Component | Description |
| :--- | :--- | :--- |
| `/` | `HomePage.jsx` | Hero, Selected Works showcase, Services overview, Founder story, Pricing preview, Contact intake |
| `/projects` | `ProjectsPage.jsx` | Full case-study portfolio with category filter tabs (Web Apps, E-Commerce, SaaS, Business Systems) |
| `/projects/:id` | `ProjectDetailPage.jsx` | In-depth engineering case study (Problem $\to$ Strategy $\to$ Architecture $\to$ Deliverables $\to$ Outcome) |
| `/services` | `ServicesPage.jsx` | Full capabilities catalog with outcome-driven descriptions, deliverables, and interactive scope modal |
| `/pricing` | `PricingPage.jsx` | GoodFound dual-currency pricing tiers, 4-step interactive Quote Builder, and 50/50 milestone calculation |
| `/about` | `AboutPage.jsx` | Founder background, engineering philosophy, education, tech stack breakdown, and work history |
| `/contact` | `ContactPage.jsx` | Project intake form with URL parameter pre-filling (`?service=...&tier=...`), 3-step "What Happens Next" box, and WhatsApp direct reach |
| `/pay/:token` | `PaymentPage.jsx` | Token-gated public checkout (Paystack NGN or Grey bank wire for USD/GBP/EUR) |
| `/track/:id` | `ClientProjectTracker.jsx`| Real-time milestone tracker for clients |
| `/portal/*` | `ClientPortalLayout.jsx` | Authenticated client dashboard, invoices, contracts, credentials vault, and deliverables repository |
| `/admin/*` | `AdminLayout.jsx` | Founder operations center (CRM, Quotations, Invoices, Contracts, Payments, Reports, Settings) |

---

## 5. Pricing & Quotation Engine Architecture

### A. Tier Structure by Service Category

```
1. Business Websites & Web Portals (Starter · Growth [Popular] · Enterprise)
2. Digital Storefronts & E-Commerce (Starter · Growth [Popular] · Scale)
3. Custom Software & Internal Platforms (MVP Sprint · Production Platform · Enterprise Suite)
4. UI/UX Interface Design (Design Sprint · Complete System · Design Retainer)
5. Brand Identity & Visual Assets (Core Brand · Brand System · Full Studio Identity)
6. Technical SEO & Organic Visibility (Audit · Growth Implementation · Monthly Retainer)
7. Digital Marketing & Campaigns (Campaign Strategy · Growth Launch · Full Funnel)
8. AI Integration & Workflow Automation (Audit & PoC · Production AI · Autonomous Agents)
9. Maintenance & SLA Support (Starter Maintenance · Growth SLA · Enterprise Retainer)
```

### B. Interactive Quotation Builder Flow

```
[ Step 1: Core Category ] ──▶ [ Step 2: Deliverables Tier ] ──▶ [ Step 3: Optional Add-ons ]
                                                                             │
                                                                             ▼
[ Request Proposal CTA ] ◀── [ 50/50 Milestone Terms ] ◀── [ Enterprise Cloud Guarantee ]
(/contact?service=...&tier=...) (50% Kickoff / 50% Delivery)    (CDN, SSL, Backups, 100% IP)
```

---

## 6. Client Portal & Operations Workflow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  CRM Lead    │ ──▶ │  Quotation   │ ──▶ │ Zoho Sign    │ ──▶ │  50% Deposit │
│  (Inquiry)   │     │  (1-Click)   │     │  Contract    │     │  (Paystack/  │
└──────────────┘     └──────────────┘     └──────────────┘     │   Grey Wire) │
                                                               └──────┬───────┘
                                                                      │
┌──────────────┐     ┌──────────────┐     ┌──────────────┐            ▼
│ Final 50%    │ ◀── │ Staging QA   │ ◀── │ 5-Stage      │ ◀── ┌──────────────┐
│ Payment & IP │     │ & Client     │     │ Milestone    │     │ Client Portal│
│ Handover     │     │ Sign-off     │     │ Sprints      │     │ & Credential │
└──────────────┘     └──────────────┘     └──────────────┘     │ Vault Active │
                                                               └──────────────┘
```

---

## 7. Security, Privacy & Reliability Standards

* **Cookie Authentication**: JWT stored in secure HttpOnly cookies with `sameSite: 'none'` + `secure: true` in production, routed via first-party Vercel rewrites.
* **Zero Client Infrastructure Demands**: Clients never manage Redis configurations or server clusters; all builds receive managed high-availability cloud deployments.
* **Credential Vaulting**: Sensitive production API keys and database strings are encrypted server-side with **AES-256-GCM** (unique IV + 128-bit authentication tag).
* **Payment Security**: Paystack webhooks verified via HMAC-SHA512 `crypto.timingSafeEqual` signatures; international bank transfers verified in `/admin/payments` review queue.
* **XSS Defense**: Dual-layer sanitization with `isomorphic-dompurify` on server inputs and browser DOMPurify on Markdown renders.
* **Zero Build Errors SLA**: Automated CI pipeline enforces zero-warning Vite bundle compilation on every commit.

---

## 8. Development Roadmap & Milestones

| # | Milestone | Status | Completed |
| :--- | :--- | :--- | :--- |
| **01–12** | Core OS Architecture (Auth, CRM, Invoicing, Zoho Contracts, Multi-Division) | ✅ Complete | July 2026 |
| **13–19** | Client Portal SPA, Project Milestones, Expense Engine, Document Repo | ✅ Complete | July 2026 |
| **20** | **GoodFound Pricing Architecture & Cognitive Load Simplification** (Dual USD/NGN pricing, explicit exclusions, 4-step quote calculator, 50/50 milestones) | ✅ Complete | August 2026 |
| **21** | **Universal Design System & Visual Consistency Overhaul** (Hero button baseline, surface token consolidation, Lucide icon standardization, container width alignment) | ✅ Complete | August 2026 |

---

*End of Blueprint v3.5. Maintained and governed by BuildWithLami.*