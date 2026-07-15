# UPDATE.md — BuildWithLami Working Document

> **Companion to:** `Blueprint.md` (v2.0, historical), `ROADMAP.md` (phased build plan)
> **Purpose:** Single source of truth for what's currently in the code vs what the vision documents propose. Every item has a **Status** field you can mark.
> **Last updated:** July 2026

---

## How to Use This File

### Status Legend

Pick **one** for each row and replace `[ ]`:

| Status | Meaning |
| :--- | :--- |
| `[ ]` | Undecided — review needed |
| `[x] KEEP` | Build / keep as proposed |
| `[x] DROP` | Do not build / remove |
| `[x] LATER` | Park for a future phase |
| `[x] MODIFY` | Build but with a change (write the change in the Notes column) |

### How to Triage

1. Go section by section.
2. Replace `[ ]` with one of the four statuses.
3. Anything marked `DROP` or `LATER` will be moved to `BACKLOG.md` so this file only shows what you're actually shipping.
4. Anything marked `MODIFY` — add a short note in the Notes column explaining how.

---

## 1. Vision & Philosophy (Reference — Do Not Edit)

> **One Company. One Brand. One Codebase. One Database. One Authentication System. One CRM. One Admin Dashboard. One Client Portal. Multiple Business Divisions.**

Software Development is the primary business. Survey and Drone are secondary divisions sharing the same backend.

---

## 2. Primary Domain

**Current state:** `https://buildwithlami.com` is the **official** BuildWithLami public identity.
**Legacy fallback:** `https://buildwithlami.vercel.app` (Vercel default) is still served for backwards compatibility.

| Option | Status | Notes |
| :--- | :--- | :--- |
| `buildwithlami.com` (official) | `[x] PRIMARY` | Domain bought, DNS pointed to Vercel, CORS updated in `backend/src/index.js`, `FRONTEND_URL` env on Render updated, Vercel env updated |
| `buildwithlami.vercel.app` (legacy) | `[x] KEEP` | Vercel fallback kept in CORS `allowedOrigins` and the `FRONTEND_URL` env defaults — used until the `.com` domain is fully cut over |

**Migration checklist (DONE — 2026-07-15):**
- [x] Buy `buildwithlami.com`
- [x] Add domain to Vercel project
- [x] Update DNS records
- [x] Update `allowedOrigins` in `backend/src/index.js` (`.com` primary, `.vercel.app` fallback)
- [x] Update `FRONTEND_URL` env var on Render
- [x] Update `VITE_API_URL` env var on Vercel
- [x] Test end-to-end
- [x] Update README + any hardcoded URLs in seed scripts, emails, sitemap, robots.txt, social meta

**Decision:** `buildwithlami.com` is the single public identity. The Vercel-hosted URL is kept as a redirect/fallback only.

---

## 3. Existing Software Homepage (✅ LEAVE UNTOUCHED)

The current `HomePage.jsx` renders this section order:

```
Hero → HowItWorks → About → Services → Pricing → Projects → Contact
```

All seven components exist in [frontend/src/components/](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/) and are working.

**Rule: do not modify, remove, or reorder any of these without an explicit decision below.**

| Section | Component | Status | Notes |
| :--- | :--- | :--- | :--- |
| Hero | [Hero.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Hero.jsx) | `[x] KEEP` | Do not touch |
| How It Works | [HowItWorks.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/HowItWorks.jsx) | `[x] KEEP` | Do not touch |
| About | [About.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/About.jsx) | `[x] KEEP` | Do not touch |
| Services | [Services.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Services.jsx) | `[x] KEEP` | Do not touch |
| Pricing | [Pricing.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Pricing.jsx) | `[x] KEEP` | Do not touch |
| Projects | [Projects.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Projects.jsx) | `[x] KEEP` | Do not touch |
| Contact | [Contact.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Contact.jsx) | `[x] KEEP` | Do not touch |

### Optional Additions to the Homepage (Will Not Replace Existing Sections)

The v5.0/v6.0 docs add these sections. They can be **inserted** into `HomePage.jsx` between the existing ones without breaking what's already there.

| Section | Component to Add | Status | Notes |
| :--- | :--- | :--- | :--- |
| Why Choose BuildWithLami | `components/WhyChoose.jsx` (new) | `[KEEP ]` | Where to insert? |
| SaaS Products | `components/SaaSProducts.jsx` (new) | `[KEEP ]` | Required by v5.0 nav addition |
| Client Testimonials | `components/Testimonials.jsx` (new) | `[KEEP ]` | Needs data source |
| FAQ | `components/FAQ.jsx` (new) | `[KEEP ]` | Static or DB-driven? |
| Tech Stack | [TechStack.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/TechStack.jsx) (exists, not on homepage) | `[DROP ]` | Add to homepage? |

---

## 4. Public Website Routes

### 4.1 Current Routes (Do Not Remove Without Decision)

| Route | Status | Notes |
| :--- | :--- | :--- |
| `/` (HomePage) | `[x] KEEP` | Homepage, software-focused |
| `/projects` (ProjectsPage) | `[x] KEEP` | Portfolio listing |
| `/projects/:id` (ProjectDetailPage) | `[x] KEEP` | Case study |
| `/services` (ServicesPage) | `[x] KEEP` | Service list |
| `/about` (AboutPage) | `[x] KEEP` | Company bio |
| `/contact` (ContactPage) | `[x] KEEP` | Contact form |
| `/login` (LoginPage) | `[x] KEEP` | Admin auth |
| `/admin/*` (AdminLayout + 9 pages) | `[x] KEEP` | Owner dashboard |
| `/track/:trackingId` (ClientProjectTracker) | `[x] KEEP` | Public client tracker |
| `/form/:formId` (ClientIntakeForm) | `[x] KEEP` | Intake form |

### 4.2 New Routes Proposed by v5.0/v6.0

> **Note (user decision):** Survey and Drone are built as **one page each** (single scrollable page with all sections). No sub-routes. This keeps the build small and the content discoverable.

| Route | Proposed Page | Status | Notes |
| :--- | :--- | :--- | :--- |
| `/survey` | `pages/survey/SurveyHomePage.jsx` | `[KEEP ]` | **Single page** — all sections in one scroll |
| `/drone` | `pages/drone/DroneHomePage.jsx` | `[KEEP ]` | **Single page** — all sections in one scroll |
| `/portfolio` | `pages/PortfolioPage.jsx` | `[KEEP ]` | Alias of `/projects`? Or new design? |
| `/resources` | `pages/ResourcesPage.jsx` | `[KEEP ]` | Blog + knowledge base |
| `/pricing` | `pages/PricingPage.jsx` | `[KEEP ]` | Or use existing `Pricing` component on home only? |
| `/portal` | `pages/portal/PortalDashboard.jsx` | `[LATER]` | Logged-in client portal (separate from `/track/:id`) |

---

## 5. Navigation

### 5.1 Current Main Navbar ([Navbar.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Navbar.jsx#L6-L13)) — **FINAL (after Option A)**

```
Home | Projects | About | Services | Portfolio | SaaS Products | Pricing | Contact  [KEEP]
```

> **Note:** The actual `Navbar.jsx` currently has `Home | Projects | About | Services | Pricing | Contact` (no Portfolio, no SaaS Products yet). This line shows the **target** state after Option A is implemented.

### 5.2 Proposed Navbar (v5.0/v6.0) — **DROPPED (Option A)**

```
Home | Services | Portfolio | SaaS Products | Pricing | Contact  [DROP]
```

> **Decision:** Not adopting the v5.0/v6.0 proposed nav. We keep the current nav (with Portfolio and SaaS Products added) instead.

### 5.3 Decision Matrix (Option A)

| Action | Item | Status | Notes |
| :--- | :--- | :--- | :--- |
| Keep | Home | `[x] KEEP` | Anchor to `#home` |
| Keep | Projects link | `[x] KEEP` | Existing in nav |
| Keep | About link | `[x] KEEP` | Existing in nav |
| Keep | Services | `[x] KEEP` | Existing in nav |
| Modify | Pricing | `[KEEP ]` | Build `/pricing` page (you KEEP'd in §4.2); keep section on home too |
| Keep | Contact | `[x] KEEP` | Existing in nav |
| Add | Portfolio | `[KEEP ]` | New link between Services and SaaS Products |
| Add | SaaS Products | `[KEEP ]` | New link between Portfolio and Pricing |
| Add (footer only) | Resources | `[DROP ]` | Page exists in §4.2 but only linked in footer, not main nav |

---

## 6. Division Pages (Survey & Drone)

> **User decision:** Each division is **one scrollable page**. No sub-routes, no sub-folders with multiple page files. All content lives inside the single hub page component.

### 6.1 Survey Division (`/survey`)

| Item | Status | Notes |
| :--- | :--- | :--- |
| Build `/survey` as one page | `[KEEP]` | `SurveyHomePage.jsx` — orchestrator only |
| Hero section (in-page) | `[KEEP]` | Top of the page |
| Services section (in-page) — 9 items | `[KEEP]` | Hardcode in `data/divisions.js` |
| Projects section (in-page) | `[KEEP]` | Past work, can pull from DB later |
| Equipment section (in-page) | `[KEEP]` | Static grid of gear |
| Gallery section (in-page) | `[KEEP]` | Image grid |
| Testimonials section (in-page) | `[KEEP]` | Client feedback |
| FAQ section (in-page) | `[KEEP]` | Common questions |
| Book Survey form (in-page) | `[KEEP]` | Inline form, submits to `/api/bookings` |
| Contact section (in-page) | `[KEEP]` | Uses existing Contact form pattern |
| Nav links (anchor scroll) | `[KEEP]` | All nav items point to `#section-id` on the same page, not new routes |
| Bookings table migration | `[KEEP]` | Shared with drone — one `bookings` table with `division` column |

**File structure:**
```
pages/survey/
└── SurveyHomePage.jsx    ← single file, contains all sections
```

**Shared data file:** `data/divisions.js` exports `SURVEY_SERVICES` constant.

### 6.2 Drone Division (`/drone`)

| Item | Status | Notes |
| :--- | :--- | :--- |
| Build `/drone` as one page | `[KEEP]` | `DroneHomePage.jsx` — orchestrator only |
| Hero section (in-page) | `[KEEP]` | Top of the page |
| Services section (in-page) — 9 items | `[KEEP]` | Hardcode in `data/divisions.js` |
| Portfolio section (in-page) | `[KEEP]` | Past flights, can pull from DB later |
| Gallery section (in-page) | `[KEEP]` | Image grid |
| Industries section (in-page) | `[KEEP]` | Verticals served |
| Pricing section (in-page) | `[KEEP]` | Package pricing |
| Book Flight form (in-page) | `[KEEP]` | Inline form, submits to `/api/bookings` |
| Contact section (in-page) | `[KEEP]` | Uses existing Contact form pattern |
| Nav links (anchor scroll) | `[KEEP]` | All nav items point to `#section-id` on the same page, not new routes |

**File structure:**
```
pages/drone/
└── DroneHomePage.jsx    ← single file, contains all sections
```

**Shared data file:** `data/divisions.js` exports `DRONE_SERVICES` constant.

---

## 7. Admin Workspace Selector

Current: single nav with 9 items in [AdminLayout.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/AdminLayout.jsx#L21-L31).

Proposed: 4 workspaces (Global / Software / Survey / Drone), each with its own module list.

| Item | Status | Notes |
| :--- | :--- | :--- |
| Add workspace selector dropdown | `[KEEP]` | — |
| Global workspace modules | `[KEEP ]` | Revenue, Leads, Clients, Projects, Payments, Notifications, Analytics |
| Software workspace modules | `[KEEP]` | 18 modules — most already exist; CRM/Proposals/Contracts/SaaS/Blog/Resources/Support/Team/Calendar missing |
| Survey workspace modules | `[KEEP]` | 14 modules — all new except shared ones |
| Drone workspace modules | `[ KEEP]` | 14 modules — all new except shared ones |
| Persist selection in `localStorage` | `[KEEP]` | `admin_workspace` key |

---

## 8. CRM Pipeline (New)

| Item | Status | Notes |
| :--- | :--- | :--- |
| `leads` table (8-stage pipeline) | `[KEEP ]` | Migration `v10_crm_leads.sql` |
| `POST /api/crm/leads` (public submission) | `[KEEP ]` | Rate-limited |
| `GET /api/crm/leads` (admin list) | `[KEEP ]` | Filter by stage + division |
| `PATCH /api/crm/leads/:id/stage` | `[KEEP ]` | Stage transition |
| `POST /api/crm/leads/:id/convert` | `[KEEP ]` | Promote to client |
| Admin Kanban page | `[   KEEP     ]` | 8 columns, drag-drop or dropdown |
| Auto-tag division on submission | `[KEEP]` | Based on which form was submitted |

---

## 9. Client Portal (`/portal`)

Separate from the public `/track/:trackingId` flow. This is a logged-in client experience.

> **Status:** Entire section is `LATER` (parked). The existing `/track/:trackingId` flow handles the public client view; the logged-in portal is a future enhancement.

| Feature | Status | Notes |
| :--- | :--- | :--- |
| Portal login | `[LATER]` | Or reuse `/login` with role check? |
| Portal dashboard | `[LATER]` | Active projects, recent activity, outstanding invoices |
| Portal projects | `[LATER]` | Progress, milestones, status |
| Portal downloads | `[LATER]` | Survey plans, coordinate files, photos, videos, deliverables |
| Portal invoices | `[LATER]` | View + download PDF (Paystack receipt) |
| Portal support | `[LATER]` | Contact PM + WhatsApp link |

---

## 10. Database

### 10.1 Existing Tables (Do Not Drop)

`users`, `profile`, `projects`, `messages`, `clients`, `client_projects`, `intake_templates`, `intake_submissions`, `project_secrets`, `invoices`, `project_feedback`.

### 10.2 Missing Tables (Per v5.0/v6.0 + CEO Improvements)

| Table | Status | Notes |
| :--- | :--- | :--- |
| `roles` | `[KEEP]` | RBAC — 10 roles (§11) |
| `bookings` | `[KEEP]` | Survey + Drone booking forms (§6) |
| `tasks` | `[DROP]` | Team task management — not in scope |
| `documents` | `[DROP]` | Generic file storage — not in scope |
| `notifications` | `[KEEP]` | **Required by §16.1 notification center** — was DROP, now KEEP |
| `payments` | `[DROP]` | `invoices.paystack_reference` is enough |
| `contracts` | `[KEEP]` | Zoho Sign PDF archive (Zoho Sign is KEEP in §12) |
| `media` | `[DROP]` | Cloudinary/Supabase Storage refs — not in scope |
| `resources` | `[KEEP]` | Knowledge base articles (powers `/resources` page) |
| `blog_posts` | `[DROP]` | Blog engine — not in scope (use `pages` table instead) |
| `support_tickets` | `[DROP]` | Client support flow — not in scope (use unified inbox) |
| `audit_logs` | `[KEEP]` | Referenced in queries but no `CREATE TABLE` (§16.6) |
| `leads` | `[KEEP]` | CRM pipeline (see §8) |
| `pages` | `[KEEP]` | **NEW §16.4** — CMS for /resources, /portfolio, /pricing |
| `testimonials` | `[KEEP]` | **NEW §16.4** — client quotes on home, /survey, /drone |
| `equipment` | `[KEEP]` | **NEW §16.4** — Survey + Drone gear lists |
| `industries` | `[KEEP]` | **NEW §16.4** — Drone verticals |
| `email_templates` | `[KEEP]` | **NEW §16.5** — saved email bodies with placeholders |
| `expenses` | `[LATER]` | **NEW §16.8** — basic expense tracking (when team grows) |
| `conversations` | `[KEEP]` | **NEW §16.9** — unified inbox threads; status field (New/In Progress/Resolved) |

### 10.3 Column Additions

| Table | Column | Status | Notes |
| :--- | :--- | :--- | :--- |
| `clients` | `division` | `[KEEP]` | Default `'SOFTWARE'`, check constraint |
| `client_projects` | `division` | `[KEEP]` | Same |
| `projects` | `division` | `[KEEP]` | Same |
| `messages` | `division` | `[KEEP]` | Same |
| `invoices` | `division` | `[KEEP]` | Same |
| `users` | `role_id` (FK to `roles`) | `[KEEP]` | Replaces TEXT role column (paired with `roles` table) |
| `client_projects` | `offboarding_status` | `[KEEP]` | Referenced in createMissingTables.sql |
| `client_projects` | `offboarding_checklist` | `[KEEP]` | Same |
| `client_projects` | `payment_status` | `[KEEP]` | Same |
| `client_projects` | `last_notified_at` | `[KEEP]` | Referenced in `cronService.js` |

### 10.4 Migrations Folder

`runUpdateSchema.js` references `migrations/v2_update_schema.sql`, `v3_paystack_invoices.sql`, `v4_contact_qualification.sql` but **the folder does not exist**.

| Action | Status | Notes |
| :--- | :--- | :--- |
| Create `backend/migrations/` folder | `[KEEP]` | Required for `runUpdateSchema.js` to work |
| Create v2/v3/v4 placeholder files | `[KEEP]` | Or rewrite the script to use the new naming |
| Add v5–v11 migration files | `[KEEP]` | See [ROADMAP.md §Phase 0](file:///c:/Users/nuke/Documents/buildwithlami/ROADMAP.md#phase-0--database-foundation) for full SQL templates |

---

## 11. Authentication & RBAC

> **Owner / CEO:** **Odibenuah Eugene** (the platform's sole proprietor at launch). All other roles can be filled by team members as the company grows; unassigned roles are open slots.

| Item | Status | Notes |
| :--- | :--- | :--- |
| Current JWT bearer auth | `[x] KEEP` | Working |
| Add `roles` table with 10 seed roles | `[KEEP]` | See role assignments below |
| Refactor `authMiddleware.js` to read role from DB | `[KEEP]` | Replaces env-based check |
| Add `requireDivision()` middleware | `[KEEP]` | Gates workspace-specific routes |
| Add refresh tokens | `[DROP]` | Not needed for MVP — JWT only is fine |
| HttpOnly cookies | `[DROP]` | Current bearer token works; cookies are nice-to-have |

### 11.1 Role Assignments

| Role | Currently Filled By | Status |
| :--- | :--- | :--- |
| **Owner** | **Odibenuah Eugene (CEO)** — `EUGENEODIBENUAH@GMAIL.COM` | ✅ Active — sole account at launch |
| Administrator | — | Open |
| Project Manager | — | Open |
| Developer | — | Open |
| Survey Manager | — | Open |
| Surveyor | — | Open |
| Drone Manager | — | Open |
| Drone Pilot | — | Open |
| Finance | — | Open |
| Client | External clients (via portal) | Future (tied to `/portal`, currently LATER) |

### 11.2 Seed SQL (for `v8_roles_rbac.sql`)

```sql
-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

INSERT INTO roles (name) VALUES
  ('Owner'),
  ('Administrator'),
  ('Project Manager'),
  ('Developer'),
  ('Survey Manager'),
  ('Surveyor'),
  ('Drone Manager'),
  ('Drone Pilot'),
  ('Finance'),
  ('Client')
ON CONFLICT (name) DO NOTHING;

-- Backfill: existing admin user (Odibenuah Eugene) gets the Owner role
UPDATE users
SET role = 'Owner'
WHERE email = 'EUGENEODIBENUAH@GMAIL.COM';
```

> **Note:** The above hardcodes the Owner email. If you ever change your login email, re-run this UPDATE with the new address. The case-sensitive match uses the exact email you log in with.

---

## 12. Integrations

| Integration | Current State | v5.0/v6.0 Status | Action | Status |
| :--- | :--- | :--- | :--- | :--- |
| Paystack | ✅ Live (`invoiceController.js` + webhook) | Current | None | `[x] KEEP` |
| Nodemailer (email) | ✅ Live (mocked when no SMTP env) | Not in v5.0/v6.0 | Replace with Resend OR keep | `[DROP ]` |
| Resend | ❌ | Current | Build if replacing Nodemailer | `[ ]` |
| Cloudinary | ⚠️ Utility exists, not wired centrally | Current | Wire to `/api/upload` | `[KEEP ]` |
| Supabase Storage | ❌ | Current | Wire to `/api/upload` | `[KEEP ]` |
| Zoho Sign | ❌ | Current | Build `zohoSignService.js` + `/api/contracts` | `[KEEP ]` |
| Stripe | ❌ | Future | Not in scope | `[x] DROP` |
| Google Maps | ❌ | Future | Not in scope | `[x] DROP` |
| Google Calendar | ❌ | Future | Not in scope | `[x] DROP` |
| WhatsApp Business API | ❌ (Widget exists, not API) | Future | Not in scope | `[x] DROP` |

---

## 13. Technology Stack

| Layer | Technology | Current Code | v5.0/v6.0 Doc | Action | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Frontend | React 19 | ✅ | ✅ | None | `[x] KEEP` |
| Frontend | Vite | ✅ | ✅ | None | `[x] KEEP` |
| Frontend | Tailwind CSS | ✅ | ✅ | None | `[x] KEEP` |
| Frontend | Framer Motion | ✅ | ✅ | None | `[x] KEEP` |
| Frontend | React Router v7 | ✅ | ✅ | None | `[x] KEEP` |
| Backend | Node.js + Express | ✅ | ✅ | None | `[x] KEEP` |
| DB | PostgreSQL via Supabase | ✅ | ✅ | None | `[x] KEEP` |
| ORM | Raw `pg` queries | ✅ | — | None | `[x] KEEP` |
| ORM | Prisma | ❌ | ✅ Listed in v6.0 | Decide: adopt or remove from doc | `[DROP]` | Keep raw `pg` — works fine |
| Auth | JWT | ✅ | ✅ | None | `[x] KEEP` |
| Storage | Cloudinary | ⚠️ Utility only | ✅ | Wire it | `[KEEP]` | Pair with §12 KEEP |
| Deploy | Vercel (frontend) | ✅ | ✅ | None | `[x] KEEP` |
| Deploy | Render (backend) | ✅ | ✅ | None | `[x] KEEP` |

---

## 14. Phases

| Phase | v5.0/v6.0 Says | Code Reality | Status |
| :--- | :--- | :--- | :--- |
| Phase 1 — Public + admin + auth | Done | Public ✅, admin ✅, auth ⚠️ (no RBAC), CRM ❌ | `[KEEP]` |
| Phase 2 — Portal + payments + Zoho Sign | Done | Portal ⚠️ (only `/track/:id`), payments ✅, Zoho Sign ❌ | `[KEEP]` |
| Phase 3 — Survey + Drone workspaces | Planned | ❌ Not started | `[KEEP]` |
| Phase 4 — SaaS products, AI, mobile app | Future | ❌ Not started | `[DROP]` |

**Recommendation:** rename the phases in the doc to honestly reflect that Phase 1 and Phase 2 are only partially done. Or update the code to complete them. Mark the option you choose above.

---

## 15. Out of Scope (For Reference)

These are listed in the v5.0/v6.0 docs but the user has indicated they may not be needed. They will move to `BACKLOG.md` if marked `DROP` or `LATER`.

- SaaS Products module and homepage section
- AI Features (Phase 4)
- Mobile App (Phase 4)
- Automation (Phase 4)
- Future divisions (Academy, AI Solutions, Consulting, Photography, Real Estate Tech)
- Survey Plan Generator, Coordinate Converter, Area Calculator, Traverse Adjustment, GNSS Job Processing (Survey "Future Modules")
- Weather Integration, Pilot Checklist, Mission Planning, Asset Tracking (Drone "Future Modules")
- Knowledge Base (separate from Resources)
- Tasks module
- Calendar module
- Team module
- Blog engine
- Resend email (if keeping Nodemailer)
- Stripe (future)
- Prisma ORM (if keeping raw `pg`)

---

## 16. CEO Operations Improvements

> **Purpose:** Items the CEO (Odibenuah Eugene) needs to run the business smoothly on a daily basis. These are **not in the v5.0/v6.0 vision** — they're operational must-haves for solo operation. Tagged KEEP = build; LATER = when team grows.

### 16.1 Daily Operations Dashboard (Priority 1)

| Item | Status | Notes |
| :--- | :--- | :--- |
| "Today" widget at top of `/admin` | `[KEEP]` | One-glance view: "5 leads need reply, 2 invoices overdue, 1 domain expiring, 3 projects in review" |
| Unified messages inbox | `[KEEP]` | Merge `messages` + `project_feedback` + `intake_submissions` into a single reply queue with division filter |
| Notification center (bell icon) | `[KEEP]` | In-app list of "what needs your attention", persisted in `notifications` table |
| Quick Action floating button | `[KEEP]` | "+ New Lead", "Send Invoice", "View Today" from any admin page |
| Personal backup routine (manual) | `[KEEP]` | Export Supabase weekly to your Google Drive until automated backup is built |

### 16.2 Mobile & Accessibility (Priority 1)

| Item | Status | Notes |
| :--- | :--- | :--- |
| Mobile-responsive admin layout | `[KEEP]` | `/admin/*` works on phone (collapsible sidebar, stacked cards) |
| Mobile-friendly "Today" page | `[KEEP]` | A simplified `/admin/today` view that loads fast on 4G |
| Touch-friendly tables | `[KEEP]` | Swipe actions on mobile (mark as read, archive) |

### 16.3 Search & Bulk Actions (Priority 1)

| Item | Status | Notes |
| :--- | :--- | :--- |
| Global search bar in admin | `[KEEP]` | Search across leads, clients, projects, invoices, messages by name/email/tracking_id |
| Bulk actions on tables | `[KEEP]` | Multi-select rows → mark paid / archive / reassign / delete |
| CSV export everywhere | `[KEEP]` | Already exists in `utils/csv.jsx` — extend to all admin tables |
| PDF export for invoices | `[KEEP]` | Use existing Paystack receipt or generate branded PDF |

### 16.4 Content Management (CMS) — Priority 2

> **Why:** You can't edit `/resources`, `/portfolio`, `/pricing`, or `/blog` content without a code deploy. Building a simple CMS lets you update text and images from the admin.

| Item | Status | Notes |
| :--- | :--- | :--- |
| `pages` table (CMS content) | `[KEEP]` | Stores title, slug, body (Markdown), hero_image, meta_description |
| `/admin/cms` page | `[KEEP]` | List, edit, publish pages; Markdown editor |
| Public pages read from `pages` table | `[KEEP]` | `/resources`, `/portfolio`, `/pricing` render from CMS (not hardcoded) |
| Image upload via Cloudinary | `[KEEP]` | Pairs with §12 Cloudinary KEEP |
| `testimonials` table | `[KEEP]` | Stores client_name, division, quote, avatar, is_featured |
| `/admin/testimonials` page | `[KEEP]` | CRUD for testimonials; shown on home, /survey, /drone |
| `equipment` table (Survey + Drone) | `[KEEP]` | name, image, description, division |
| `industries` table (Drone) | `[KEEP]` | name, description, icon, sample_image |
| Auto-generate client onboarding checklist | `[KEEP]` | When a project reaches "Won" stage, generate a default checklist in `client_projects.stages` |

### 16.5 Email & Templates (Priority 2)

| Item | Status | Notes |
| :--- | :--- | :--- |
| `email_templates` table | `[KEEP]` | Stores template name, subject, body (with placeholders like `{{client_name}}`) |
| Template picker in CRM | `[KEEP]` | When moving a lead to "Proposal" stage, pick from saved templates |
| Default templates seeded | `[KEEP]` | Welcome, Proposal Sent, Invoice Sent, Project Complete, Testimonial Request |
| Testimonial request automation | `[KEEP]` | Auto-send 7 days after project marked Complete (uses `emailService.js`) |

### 16.6 Security & Reliability (Priority 1)

| Item | Status | Notes |
| :--- | :--- | :--- |
| 2FA for admin login | `[KEEP]` | TOTP via authenticator app — protects `EUGENEODIBENUAH@GMAIL.COM` account |
| Session timeout warning | `[KEEP]` | Modal at 25 min: "Session expires in 5 min — extend?" |
| Audit trail for sensitive actions | `[KEEP]` | Log: who deleted a lead, who marked invoice paid, who changed a role |
| Backup automation (Supabase → Cloudinary) | `[LATER]` | Daily cron dumps `pg_dump` to a private Cloudinary folder |
| Uptime monitoring (UptimeRobot) | `[KEEP]` | External ping of `/api/health`; alert CEO via email if down > 5 min |
| Rate limit on admin writes | `[KEEP]` | Existing rate limiters cover public routes; add for `/api/crm/*` and `/api/upload` |

### 16.7 Team & Delegation (Priority 3 — LATER)

| Item | Status | Notes |
| :--- | :--- | :--- |
| Team invitation flow | `[LATER]` | Email invite → new user sets password → assigned role from `roles` table |
| Activity audit log UI | `[LATER]` | `/admin/activity` page showing who did what (uses `audit_logs` table) |
| Per-division permissions | `[LATER]` | `requireDivision()` middleware (already planned in §11) — actually applied to routes |
| Decision log page in admin | `[LATER]` | `/admin/decisions` — private notes ("Why we chose Paystack over Stripe") |

### 16.8 Financial Operations (Priority 2)

| Item | Status | Notes |
| :--- | :--- | :--- |
| Refund handling | `[KEEP]` | `invoices.status` already supports `CANCELLED`; add `/api/invoices/:id/refund` |
| Multi-currency display | `[KEEP]` | Store amounts in NGN, allow display in USD/EUR/GBP for international clients |
| Expense tracking (basic) | `[LATER]` | Simple `expenses` table: amount, category, date, receipt_url — for tax purposes |
| Tax/VAT field on invoices | `[LATER]` | Add `tax_rate` and `tax_amount` columns; auto-compute |

### 16.9 Customer Support Tools (Priority 1)

| Item | Status | Notes |
| :--- | :--- | :--- |
| Reply-from-admin button | `[KEEP]` | On each message in unified inbox, click "Reply" → sends email back via `emailService.js` |
| Conversation thread view | `[KEEP]` | See full history with a client (emails + intake + feedback) in one place |
| Status labels on conversations | `[KEEP]` | Mark as: New / In Progress / Waiting on Client / Resolved |
| WhatsApp deep-link button | `[KEEP]` | One-click open WhatsApp chat with the client (uses their phone from `clients.primary_contact_email` lookup or new `phone` column) |

### 16.10 Documentation & Self-Notes (Priority 1)

| Item | Status | Notes |
| :--- | :--- | :--- |
| `docs/` folder in repo | `[KEEP]` | Markdown files for runbooks, deployment steps, troubleshooting |
| `/admin/help` page | `[KEEP]` | In-app reference: how to do common tasks (create invoice, send proposal, add user) |
| CEO quick-reference card | `[KEEP]` | One-page PDF with: emergency contacts, env var locations, rollback steps |

---

## 17. Triage Complete ✓

All sections have been tagged. Summary of decisions:

| Status | Count (approx) | Sections |
| :--- | :--- | :--- |
| `[x] KEEP` (existing) | ~20 | §2, §3, §4.1, §11 (current JWT), §12 (Paystack), §13 (current stack) |
| `[KEEP]` (new) | ~85 | §3 additions, §4.2, §5 (Option A), §6, §7, §8, §10.2 (12 tables), §10.3 (10 columns), §10.4, §11 (RBAC), §12 (Cloudinary/Supabase/Zoho), §13 (Cloudinary), §14 (Phases 1–3), **§16 (CEO improvements — 30+ items across 10 subsections)** |
| `[LATER]` | 11 | §4.2 (`/portal`), §9 (entire client portal), **§16.7 (4 team items)**, **§16.8 (2 financial items)**, `expenses` table |
| `[DROP]` | ~16 | §3 (TechStack on home), §5.3 (Resources in nav), §10.2 (5 tables), §11 (refresh tokens, cookies), §12 (Resend/Stripe/Maps/Calendar/WhatsApp), §13 (Prisma), §14 (Phase 4) |
| `[ ]` (untagged) | 2 | Resend in §12 (manual revert), status legend (line 17, keep as template) |

### New in §16 (CEO Improvements)

10 subsections covering the operational needs of a solo CEO:
- **16.1** Daily Operations Dashboard (5 items — KEEP)
- **16.2** Mobile & Accessibility (3 items — KEEP)
- **16.3** Search & Bulk Actions (4 items — KEEP)
- **16.4** Content Management CMS (9 items — KEEP)
- **16.5** Email & Templates (4 items — KEEP)
- **16.6** Security & Reliability (6 items — 5 KEEP, 1 LATER)
- **16.7** Team & Delegation (4 items — LATER)
- **16.8** Financial Operations (4 items — 2 KEEP, 2 LATER)
- **16.9** Customer Support Tools (4 items — KEEP)
- **16.10** Documentation & Self-Notes (3 items — KEEP)

### Next Steps (Pick One)

Reply with one of these to proceed:

1. **"Generate BACKLOG + ROADMAP"** — I'll create `BACKLOG.md` (all DROP/LATER items) and `ROADMAP.md` (phased KEEP items, ordered by priority).
2. **"Update Blueprint.md"** — I'll edit `Blueprint.md` to reference `UPDATE.md` as the source of truth and align its tables with the new decisions.
3. **"Start implementation"** — I'll begin with Phase 1 of the new roadmap: migrations folder, RBAC, division column, "Today" widget, notification center, unified inbox.
