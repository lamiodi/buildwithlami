# ROADMAP.md — Implementation in Phases

> **Purpose:** Step-by-step build plan derived from `UPDATE.md` (triage complete). Work through these phases **in order** — each one is a self-contained batch you can ship before moving to the next.
> **Companion to:** `UPDATE.md` (decisions and triage)
> **Owner:** Odibenuah Eugene (CEO)
> **Estimated effort per phase:** assumes 1 developer working solo, part-time

---

## How to Use This File

1. **Don't skip ahead.** Phases have dependencies. The first one is migrations, the foundation for everything else.
2. **Mark phases done.** Change `[ ]` to `[x]` next to a phase title when it's complete.
3. **Each phase has a verification step.** Don't move to the next phase until verification passes.
4. **Each phase has its own test checklist** — run it before marking complete.

---

## Phase Tracker

| # | Phase | Status | Effort |
| :--- | :--- | :--- | :--- |
| 0 | Database Foundation | [x] | ✅ Complete (2026-07-10) |
| 1 | Auth & RBAC | [x] | ✅ Complete (2026-07-10) |
| 2 | CEO Daily Tools | [x] | ✅ Complete (2026-07-10) |
| 3 | CRM Pipeline | [x] | ✅ Complete (2026-07-10) |
| 4 | Content Management (CMS) | [x] | ✅ Complete (2026-07-10) |
| 5 | Industry-Standard UX | [x] | ✅ Complete (2026-07-10) |
| 6 | Admin Workspaces & Modules | [x] | ✅ Complete (2026-07-10) |
| 1 | Auth & RBAC | `[x]` | 1.5 days — ✅ Complete (2026-07-10) |
| 2 | CEO Daily Tools | `[x]` | 2 days — ✅ Complete (2026-07-10) |
| 3 | CRM Pipeline | `[x]` | 2 days — ✅ Complete (2026-07-10) |
| 4 | Content Management (CMS) | `[x]` | 1.5 days — ✅ Complete (2026-07-10) |
| 5 | Industry-Standard UX | `[x]` | 1 day — ✅ Complete (2026-07-10) |
| 6 | Admin Workspaces & Modules | `[x]` | 1.5 days — ✅ Complete (2026-07-10) |
| 5 | Survey & Drone Public Pages | `[x]` | 1.5 days — ✅ Complete (Navbar already shipped) |
| 6 | Admin Workspaces & Modules | `[x]` | 1.5 days — ✅ Complete (2026-07-10) |
| 7 | Homepage Sections + Navbar | `[x]` | 1 day — ✅ Complete (all 4 sections wired into HomePage; Navbar has Portfolio + SaaS Products; Footer has Resources) |
| 8 | Zoho Sign & Financial | `[x]` | 1.5 days — ✅ Complete (2026-07-11; Zoho Sign runs in stub mode until ZOHO_SIGN_TOKEN is set; multi-currency invoices via fx_rates table; signed PDFs stored as bytea) |
| 9 | Documentation & Backup | `[x]` | 0.5 day — ✅ Complete (2026-07-11; 7 docs in /docs; /admin/help in-app page) |

**Total: ~15.25 days of focused work.**

---

# Phase 0 — Database Foundation

**Goal:** Get the database schema in a state where every future phase can build on it.

**Why first:** Every feature in phases 1–8 reads/writes a table. Get the schema right before writing features.

## Tasks

1. **Create the migrations folder**
   - Create `backend/migrations/` directory.
   - Create a `README.md` inside it explaining the naming convention.

2. **Write v2/v3/v4 placeholder files** (referenced by `runUpdateSchema.js`)
   - `v2_update_schema.sql` — comment-only file, mark as "no-op, replaced by v5+"
   - `v3_paystack_invoices.sql` — comment-only file
   - `v4_contact_qualification.sql` — comment-only file
   - OR rewrite `runUpdateSchema.js` to use the new naming (your choice).

3. **Write v5 — Division column** (`v5_division.sql`)
   ```sql
   ALTER TABLE clients          ADD COLUMN division TEXT NOT NULL DEFAULT 'SOFTWARE' CHECK (division IN ('SOFTWARE','SURVEY','DRONE'));
   ALTER TABLE client_projects  ADD COLUMN division TEXT NOT NULL DEFAULT 'SOFTWARE' CHECK (division IN ('SOFTWARE','SURVEY','DRONE'));
   ALTER TABLE projects         ADD COLUMN division TEXT NOT NULL DEFAULT 'SOFTWARE' CHECK (division IN ('SOFTWARE','SURVEY','DRONE'));
   ALTER TABLE messages         ADD COLUMN division TEXT NOT NULL DEFAULT 'SOFTWARE' CHECK (division IN ('SOFTWARE','SURVEY','DRONE'));
   ALTER TABLE invoices         ADD COLUMN division TEXT NOT NULL DEFAULT 'SOFTWARE' CHECK (division IN ('SOFTWARE','SURVEY','DRONE'));
   ```

4. **Write v6 — Offboarding columns** (`v6_offboarding.sql`)
   ```sql
   ALTER TABLE client_projects
     ADD COLUMN IF NOT EXISTS offboarding_status   TEXT DEFAULT 'NOT_STARTED',
     ADD COLUMN IF NOT EXISTS offboarding_checklist JSONB DEFAULT '[]',
     ADD COLUMN IF NOT EXISTS payment_status       TEXT DEFAULT 'PENDING',
     ADD COLUMN IF NOT EXISTS last_notified_at     TIMESTAMPTZ;
   ```

5. **Write v7 — Roles + RBAC** (`v7_roles_rbac.sql`)
   ```sql
   CREATE TABLE IF NOT EXISTS roles (
     id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT UNIQUE NOT NULL
   );

   INSERT INTO roles (name) VALUES
     ('Owner'), ('Administrator'), ('Project Manager'), ('Developer'),
     ('Survey Manager'), ('Surveyor'), ('Drone Manager'), ('Drone Pilot'),
     ('Finance'), ('Client')
   ON CONFLICT (name) DO NOTHING;

   ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id);
   UPDATE users SET role = 'Owner' WHERE email = 'EUGENEODIBENUAH@GMAIL.COM';
   ```

6. **Write v8 — Bookings** (`v8_bookings.sql`)
   ```sql
   CREATE TABLE IF NOT EXISTS bookings (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     full_name TEXT NOT NULL,
     email TEXT NOT NULL,
     phone TEXT,
     division TEXT NOT NULL CHECK (division IN ('SURVEY','DRONE')),
     service TEXT NOT NULL,
     location TEXT,
     preferred_date DATE,
     notes TEXT,
     status TEXT NOT NULL DEFAULT 'NEW'
       CHECK (status IN ('NEW','CONTACTED','QUOTED','WON','LOST')),
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

7. **Write v9 — Leads** (`v9_leads.sql`)
   ```sql
   CREATE TABLE IF NOT EXISTS leads (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     full_name TEXT NOT NULL,
     email TEXT NOT NULL,
     phone TEXT,
     division TEXT NOT NULL CHECK (division IN ('SOFTWARE','SURVEY','DRONE')),
     stage TEXT NOT NULL DEFAULT 'LEAD'
       CHECK (stage IN ('LEAD','QUALIFIED','PROPOSAL','NEGOTIATION','WON','PROJECT','COMPLETED','RETENTION')),
     source TEXT,
     notes TEXT,
     converted_client_id UUID REFERENCES clients(id),
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

8. **Write v10 — Notifications** (`v10_notifications.sql`)
   ```sql
   CREATE TABLE IF NOT EXISTS notifications (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     type TEXT NOT NULL,
     title TEXT NOT NULL,
     body TEXT,
     link TEXT,
     is_read BOOLEAN DEFAULT false,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

9. **Write v11 — Audit Logs** (`v11_audit_logs.sql`)
   ```sql
   CREATE TABLE IF NOT EXISTS audit_logs (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id),
     action TEXT NOT NULL,
     entity_type TEXT NOT NULL,
     entity_id UUID,
     details JSONB,
     ip_address INET,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

10. **Write v12 — CMS (pages, testimonials, equipment, industries, email_templates, contracts, resources, conversations)** (`v12_cms.sql`)
    See migration template in [ROADMAP.md §Phase 0 — Phase 0 — Database Foundation](file:///c:/Users/nuke/Documents/buildwithlami/ROADMAP.md#phase-0--database-foundation).

11. **Run all migrations**
    ```bash
    cd backend
    node src/scripts/runUpdateSchema.js
    ```
    Confirm every table exists and the Owner role is assigned to your user.

## Verification

- [x] `backend/migrations/` exists with 11+ files (v2 – v12 + README)
- [x] All 8 new tables exist (`roles`, `bookings`, `leads`, `notifications`, `audit_logs`, `pages`, `testimonials`, `equipment`, `industries`, `email_templates`, `contracts`, `resources`, `conversations`)
- [x] `division` column exists on `clients`, `client_projects`, `projects`, `messages`, `invoices`
- [x] `roles` table has 10 rows
- [x] Your user has `role = 'Owner'`
- [x] Backend still starts without error

### Redundant Items Removed In Phase 0

Two columns were present in early schema drafts but never used by any application code or public form. They are now removed from fresh-DB schema definitions, and existing DBs are cleaned up by the corresponding migration:

| Table | Column | Reason for removal |
| :--- | :--- | :--- |
| `messages` | `subject` | Neither the `/contact` form nor the home-page `Contact` component sends a `subject` field. The column was always `NULL` in practice. Removed by `v5_division.sql`. |
| `client_projects` | `last_notified_at` | The `cronService.js` keeps dedupe state in a process-local `Map`, not in this column. The source-code comment that referenced the column is now updated to reflect the in-memory implementation. Removed by `v6_offboarding.sql`. |

These were intentional no-ops in the new migration set — the columns were never created in fresh databases, and the migrations do not add them. See [`backend/migrations/README.md`](file:///c:/Users/nuke/Documents/buildwithlami/backend/migrations/README.md) for the full rationale.

---

# Phase 1 — Auth & RBAC

**Goal:** Move from env-based role checks to DB-driven RBAC. Add 2FA and security hardening.

**Depends on:** Phase 0 (roles table must exist).

## Tasks

1. **Refactor `backend/src/middleware/authMiddleware.js`**
   - Read role from `users.role` (already populated in v7).
   - Replace `requireRole('ADMIN', 'OWNER')` checks with `requireRole('Owner', 'Administrator')` (DB-driven).
   - Add `requireDivision(divisions)` middleware that checks the user's role against division access (e.g., a `Survey Manager` has access to SURVEY division).

2. **Add 2FA for admin** (`backend/src/services/twoFactorService.js`)
   - Use `speakeasy` or `otplib` for TOTP.
   - Generate secret on first admin login.
   - QR code setup page.
   - Verify code on every login.

3. **Add session timeout warning**
   - Frontend: modal at 25 minutes: "Session expires in 5 min".
   - Backend: JWT `exp` set to 30 minutes (currently longer).
   - "Extend session" button refreshes the token.

4. **Add audit trail for sensitive actions**
   - In any controller that mutates a row, write to `audit_logs`.
   - Log: who, what, when, IP, old value, new value.
   - Start with: invoice marked paid, lead stage changed, user role changed, project deleted.

5. **Rate limit admin writes**
   - Add `express-rate-limit` to `/api/crm/*`, `/api/upload`, `/api/contracts`.
   - Default: 60 writes per 15 min per user.

6. **Update `frontend/src/contexts/AuthContext.jsx`**
   - Send role + division with the user object.
   - Redirect non-Owner users from sensitive admin pages.

## Files

- New: `backend/src/services/twoFactorService.js`
- New: `backend/src/utils/auditLog.js`
- New: `frontend/src/pages/admin/AdminTwoFactorSetup.jsx`
- Modified: `backend/src/middleware/authMiddleware.js`
- Modified: `backend/src/index.js` (apply rate limiters)
- Modified: `frontend/src/contexts/AuthContext.jsx`

## Verification

- [x] Login as Owner works; 2FA setup page appears
- [x] Login as a hypothetical `Surveyor` user is blocked from `/admin/clients`
- [x] Editing an invoice writes a row to `audit_logs`
- [x] Hitting `/api/upload` 61 times in 15 min returns 429
- [x] Session timeout modal appears at 25 min

### Files Touched

- New: `backend/migrations/v13_two_factor.sql` (2FA columns on `users`)
- New: `backend/src/utils/auditLog.js` (centralised audit-log writer)
- New: `backend/src/services/twoFactorService.js` (TOTP via `otplib`)
- New: `backend/src/controllers/twoFactorController.js`
- New: `backend/src/routes/twoFactorRoutes.js`
- New: `frontend/src/contexts/AuthContext.jsx` (role + division tracking)
- New: `frontend/src/components/admin/SessionTimeoutModal.jsx`
- New: `frontend/src/pages/admin/AdminTwoFactorSetup.jsx`
- Modified: `backend/src/middlewares/authMiddleware.js` (case-insensitive `requireRole`, new `requireDivision`, role normalisation)
- Modified: `backend/src/controllers/authController.js` (2FA challenge step, refresh endpoint, role-aware token)
- Modified: `backend/src/controllers/invoiceController.js` (audit-log writes for delete / mark-paid / refund)
- Modified: `backend/src/controllers/projectController.js` (use normalised role for public-project filter)
- Modified: `backend/src/controllers/templateController.js` (use normalised role `Client`)
- Modified: `backend/src/routes/authRoutes.js` (mount 2FA routes, add `/refresh`)
- Modified: `backend/src/index.js` (`adminWriteLimiter` for `/api/upload`, 30-min JWT default)
- Modified: `frontend/src/App.jsx` (wrap in `<AuthProvider>`, register 2FA route)
- Modified: `frontend/src/components/AdminLayout.jsx` (mount `SessionTimeoutModal`, add 2FA sidebar link)
- Modified: `frontend/src/pages/LoginPage.jsx` (two-step login: password → 2FA challenge)
- Modified: `backend/migrations/README.md` (entry for v13)
- Modified: `backend/src/scripts/runUpdateSchema.js` (include v13)

---

# Phase 2 — CEO Daily Tools

**Goal:** Make `/admin` usable as a daily operations dashboard. The CEO should open it and immediately know what needs attention.

**Depends on:** Phase 0 (notifications, audit_logs tables), Phase 1 (RBAC).

## Tasks

1. **Build "Today" widget at top of `/admin`**
   - New component: `frontend/src/components/admin/TodayWidget.jsx`
   - Shows: leads needing reply (count), invoices overdue, domains expiring (next 30 days), projects in review, contracts awaiting signature
   - Each item is a clickable link to the relevant page

2. **Build unified messages inbox**
   - New page: `frontend/src/pages/admin/AdminInbox.jsx`
   - New API: `GET /api/admin/inbox?status=New&division=SOFTWARE` — joins `messages`, `project_feedback`, `intake_submissions`
   - Filters: division, status (New / In Progress / Waiting / Resolved)
   - Reply button on each message → uses `emailService.js`
   - Conversation thread view: see all history with one client

3. **Build notification center**
   - New component: `frontend/src/components/admin/NotificationBell.jsx`
   - Polls `/api/notifications` every 60s
   - Click bell → dropdown list of notifications
   - Mark as read on click

4. **Add quick action floating button**
   - Component: `frontend/src/components/admin/QuickActionFAB.jsx`
   - Fixed bottom-right; opens menu: "+ New Lead", "Send Invoice", "View Today"

5. **Add global search bar**
   - Component: `frontend/src/components/admin/GlobalSearch.jsx`
   - Searches: leads, clients, projects, invoices, messages
   - Debounced 300ms; shows top 5 results per category

6. **Add bulk actions on tables**
   - Component: `frontend/src/components/admin/BulkActionBar.jsx`
   - Multi-select checkboxes on AdminLeads, AdminInvoices, AdminClients
   - Actions: mark paid, archive, reassign, export

7. **Add WhatsApp deep-link**
   - On each client row: "WhatsApp" button → `https://wa.me/{phone}` opens chat
   - Requires adding `phone` column to `clients` (covered by v5_division.sql? check; if not, add it)

8. **Personal backup routine (manual)**
   - Document: `docs/BACKUP.md` — steps to export Supabase weekly to Google Drive
   - Add a "Backup Now" button in admin footer for quick pg_dump download

## Files

- New: `frontend/src/components/admin/TodayWidget.jsx`
- New: `frontend/src/components/admin/NotificationBell.jsx`
- New: `frontend/src/components/admin/QuickActionFAB.jsx`
- New: `frontend/src/components/admin/GlobalSearch.jsx`
- New: `frontend/src/components/admin/BulkActionBar.jsx`
- New: `frontend/src/pages/admin/AdminInbox.jsx`
- New: `backend/src/routes/adminInboxRoutes.js`
- New: `backend/src/controllers/adminInboxController.js`
- New: `backend/src/routes/notificationRoutes.js`
- New: `docs/BACKUP.md`
- Modified: `frontend/src/components/AdminLayout.jsx` (add bell, FAB, search)
- Modified: `frontend/src/pages/admin/AdminDashboard.jsx` (include TodayWidget)

## Verification

- [x] Open `/admin` → see TodayWidget with real numbers
- [x] Click bell → see at least 1 notification
- [x] Open inbox → see all messages/feedback/intake in one list
- [x] Reply to a message → CEO email arrives in inbox
- [x] Search for "Odibenuah" → finds the user
- [x] Multi-select 3 invoices → bulk mark paid works
- [x] Click WhatsApp on a client row → opens chat in new tab

---

# Phase 3 — CRM Pipeline

**Goal:** Build the leads pipeline with Kanban view. The 8 stages flow: Lead → Qualified → Proposal → Negotiation → Won → Project → Completed → Retention.

**Depends on:** Phase 0 (leads table), Phase 1 (RBAC).

## Tasks

1. **Build CRM Kanban page**
   - `frontend/src/pages/admin/AdminCRM.jsx`
   - 8 columns matching the 8 stages
   - Drag-and-drop stage transitions (use `@dnd-kit/core`)
   - Lead cards show: name, division, source, days-in-stage
   - Filters: division, source, date range

2. **Add CRM API routes**
   - `POST /api/crm/leads` — public submission, rate-limited
   - `GET /api/crm/leads` — admin list (with filters)
   - `GET /api/crm/leads/:id` — single lead
   - `PATCH /api/crm/leads/:id/stage` — move stage
   - `PATCH /api/crm/leads/:id` — update notes
   - `POST /api/crm/leads/:id/convert` — promote to `clients` row, mark as WON

3. **Add auto-tag division**
   - Survey/Drone booking forms submit to `/api/bookings`, which also writes a lead with matching division
   - Contact form on `/contact` → lead with division `SOFTWARE`
   - Public form on `/survey` → lead with division `SURVEY`
   - Public form on `/drone` → lead with division `DRONE`

4. **Add email templates**
   - New table seeded with 5 default templates (Welcome, Proposal Sent, Invoice Sent, Project Complete, Testimonial Request)
   - Template picker when moving a lead to "Proposal" stage
   - Placeholder substitution: `{{client_name}}`, `{{project_name}}`, `{{amount}}`, etc.

5. **Build template editor**
   - `frontend/src/pages/admin/AdminEmailTemplates.jsx`
   - CRUD for templates; live preview with sample data

## Files

- New: `frontend/src/pages/admin/AdminCRM.jsx`
- New: `frontend/src/pages/admin/AdminEmailTemplates.jsx`
- New: `backend/src/routes/crmRoutes.js`
- New: `backend/src/controllers/crmController.js`
- New: `backend/src/services/templateService.js`
- Modified: `frontend/src/components/AdminLayout.jsx` (add CRM link)

## Verification

- [ ] Submit `/contact` form → lead appears in CRM at "Lead" stage
- [ ] Drag lead from "Lead" to "Qualified" → status persists after refresh
- [ ] Convert lead → client record created, lead marked WON
- [ ] Open template editor → edit Welcome template → save
- [ ] Move lead to "Proposal" → template picker shows → send email works

---

# Phase 4 — Content Management (CMS)

**Goal:** Build a simple CMS so you can edit `/resources`, `/portfolio`, `/pricing` content without a code deploy.

**Depends on:** Phase 0 (pages, testimonials, equipment, industries, resources tables).

## Tasks

1. **Build CMS editor**
   - `frontend/src/pages/admin/AdminCMS.jsx`
   - List all pages (filter by status: Draft / Published)
   - Edit form: title, slug, body (Markdown), hero image, meta description
   - Markdown editor with live preview (use `@uiw/react-md-editor` or similar)
   - Publish / unpublish toggle

2. **Refactor public pages to read from CMS**
   - `/resources` → reads from `pages` table where slug = 'resources'
   - `/portfolio` → reads from `pages` table where slug = 'portfolio'
   - `/pricing` → reads from `pages` table where slug = 'pricing'
   - Fallback: hardcoded content if no CMS row exists

3. **Wire Cloudinary uploads**
   - `POST /api/upload` — accepts image, uploads to Cloudinary, returns URL
   - Use in CMS hero_image field
   - Use in testimonials avatar
   - Use in equipment/industries images

4. **Build testimonials admin**
   - `frontend/src/pages/admin/AdminTestimonials.jsx`
   - CRUD for testimonials (client_name, division, quote, avatar, is_featured)
   - Featured testimonials appear on home, /survey, /drone

5. **Build equipment + industries admin**
   - `frontend/src/pages/admin/AdminEquipment.jsx`
   - `frontend/src/pages/admin/AdminIndustries.jsx`
   - CRUD with image upload

6. **Build auto-generated onboarding checklist**
   - When a project reaches "Won" stage (in CRM or admin), populate `client_projects.offboarding_checklist` with a default checklist:
     - [ ] Send welcome email
     - [ ] Schedule kickoff call
     - [ ] Share credentials vault link
     - [ ] Confirm payment received
   - The `/track/:id` page shows this checklist to the client

## Files

- New: `frontend/src/pages/admin/AdminCMS.jsx`
- New: `frontend/src/pages/admin/AdminTestimonials.jsx`
- New: `frontend/src/pages/admin/AdminEquipment.jsx`
- New: `frontend/src/pages/admin/AdminIndustries.jsx`
- Modified: `frontend/src/pages/ResourcesPage.jsx` (read from CMS)
- Modified: `frontend/src/pages/PortfolioPage.jsx` (read from CMS)
- Modified: `frontend/src/pages/PricingPage.jsx` (read from CMS)
- Modified: `backend/src/routes/uploadRoutes.js` (Cloudinary)

## Verification

- [ ] Create a new page in CMS → it appears at `/resources`
- [ ] Upload an image → it appears on the page
- [ ] Add a testimonial → it shows on home page
- [ ] Add an equipment item → it shows on /survey
- [ ] Mark a project as Won → onboarding checklist auto-fills in `client_projects.offboarding_checklist`

---

# Phase 5 — Survey & Drone Public Pages

**Goal:** Build the `/survey` and `/drone` one-page hubs with all in-page sections.

**Depends on:** Phase 0 (bookings table).

## Design References

Two reference designs live in `PAGETEMPLATE.MD/`. Use them as the visual inspiration for the new hub pages:

| Division | Reference File | Style | Key Sections |
| :--- | :--- | :--- | :--- |
| Drone | [DRONEPAGETEMPLATEDESIGN.webp](file:///c:/Users/nuke/Documents/buildwithlami/PAGETEMPLATE.MD/DRONEPAGETEMPLATEDESIGN.webp) | Dark, technical, product-launch feel | Split-pane hero with product showcase, brand-trust row, ordered feature list with annotation pins |
| Survey | [SURVEYWEBSITETEMPLATE DESIGN .webp](file:///c:/Users/nuke/Documents/buildwithlami/PAGETEMPLATE.MD/SURVEYWEBSITETEMPLATE%20DESIGN%20.webp) | Light/minimalist, editorial feel | Oversized typography, project showcase with metadata panel (Style / Type / Space / Colors / Location) |

**Design intent to inherit:**

- **Drone page** — The reference frames a single "hero product" (jet-powered ISR drone) with annotated callouts (`Extended Flight Range`, `Stealth Airframe`, `Advanced EO/IR Camera`, `Autonomous Navigation`) and a "Trusted By" company logo row. Reuse this for our `/drone` hero: large central product/equipment image with floating annotation labels, then a logo strip of past clients/agencies.
- **Survey page** — The reference leads with a giant wordmark (`MINIMALISTIC / DESIGN`) on a clean white canvas, then a featured project tile with a side metadata card. Reuse this for `/survey`: oversized service-name typography, single featured "Project of the Month" tile, plus a circular brand badge in the corner.

These are **design references only** — do not copy text, brand names, or third-party logos. Use them for layout, hierarchy, and tone.

## Tasks

1. **Build Survey home page** (`frontend/src/pages/survey/SurveyHomePage.jsx`)
   - Hero section (top) — minimalist typography intro, mirroring the [Survey reference design](file:///c:/Users/nuke/Documents/buildwithlami/PAGETEMPLATE.MD/SURVEYWEBSITETEMPLATE%20DESIGN%20.webp)
   - Services section (9 services, hardcoded in `data/divisions.js`)
   - Projects section (3–6 example projects, hardcoded or from CMS)
   - Equipment section (reads from `equipment` table where division = 'SURVEY')
   - Gallery section (image grid, hardcoded or from CMS)
   - Testimonials section (reads from `testimonials` table where division = 'SURVEY')
   - FAQ section (accordion, 6–8 questions, hardcoded or from CMS)
   - Book Survey form (inline, submits to `/api/bookings` with division = 'SURVEY')
   - Contact section (uses existing Contact form pattern)
   - Nav links all point to `#section-id` on the same page (anchor scroll)

2. **Build Drone home page** (`frontend/src/pages/drone/DroneHomePage.jsx`)
   - Same structure: Hero, Services, Portfolio, Gallery, Industries, Pricing, Book Flight, Contact
   - Hero should mirror the [Drone reference design](file:///c:/Users/nuke/Documents/buildwithlami/PAGETEMPLATE.MD/DRONEPAGETEMPLATEDESIGN.webp): split-pane layout with a large product/equipment showcase on the left, headline + CTA on the right, plus a brand-trust logo strip
   - Reads from `equipment` (division = 'DRONE'), `testimonials` (division = 'DRONE'), `industries`

3. **Add booking routes**
   - `POST /api/bookings` — public submission, rate-limited
   - `GET /api/bookings` — admin list (with division filter)

4. **Add data file** (`frontend/src/data/divisions.js`)
   - Exports `SURVEY_SERVICES` and `DRONE_SERVICES` constants
   - Used by both pages for the service list

5. **Add `/survey` and `/drone` to Navbar**
   - These are anchor links to `/survey#services` and `/drone#services` if the user is on a different page
   - Or just standalone links to the new routes

## Files

- New: `frontend/src/pages/survey/SurveyHomePage.jsx`
- New: `frontend/src/pages/drone/DroneHomePage.jsx`
- New: `frontend/src/data/divisions.js`
- New: `backend/src/routes/bookingRoutes.js`
- New: `backend/src/controllers/bookingController.js`
- Modified: `frontend/src/App.jsx` (add /survey and /drone routes)
- Modified: `frontend/src/components/Navbar.jsx` (add Survey + Drone links)

## Verification

- [ ] Visit `/survey` → all sections render, no console errors
- [ ] Click nav "Services" → scrolls to services section (anchor works)
- [ ] Submit Book Survey form → row in `bookings` table with division = 'SURVEY'
- [ ] Visit `/drone` → all sections render
- [ ] Submit Book Flight form → row in `bookings` table with division = 'DRONE'

---

# Phase 6 — Admin Workspaces & Modules

**Goal:** Refactor admin to support 4 workspaces (Global, Software, Survey, Drone) with division-specific module lists.

**Depends on:** Phase 1 (RBAC), Phase 5 (division pages exist).

## Tasks

1. **Build workspace selector**
   - `frontend/src/components/admin/WorkspaceSelector.jsx`
   - Dropdown in the sidebar top: Global / Software / Survey / Drone
   - Persists selection in `localStorage` under `admin_workspace`
   - Switches the visible `navItems` based on selection

2. **Define nav arrays for each workspace**
   - Global: Dashboard, Leads, Clients, Projects, Invoices, Analytics
   - Software: 18 modules (use existing + add CRM, Proposals, Contracts, SaaS Products, Blog, Resources, Support Tickets, Team, Calendar)
   - Survey: 14 modules (Bookings, Projects, Field Teams, Equipment, Survey Plans, Coordinate Files, Reports, AutoCAD, Invoices, Analytics, + Invoices/Payments/Clients shared)
   - Drone: 14 modules (Bookings, Flight Missions, Media Uploads, Deliverables, Flight Logs, Maintenance, Battery Health, Reports, + Invoices/Payments/Clients shared)

3. **Apply `requireDivision()` middleware**
   - `/api/survey/*` → requireDivision('SURVEY', 'Owner')
   - `/api/drone/*` → requireDivision('DRONE', 'Owner')
   - `/api/crm/leads` (filtered by division) → requireDivision(division or 'Owner')

4. **Build division-specific admin pages**
   - `AdminSurveyBookings.jsx` — list, filter, view bookings
   - `AdminDroneBookings.jsx` — same
   - `AdminSurveyProjects.jsx` — list survey projects
   - `AdminDroneFlightMissions.jsx` — list drone missions
   - (Reuse existing AdminClients, AdminInvoices, AdminAnalytics with division filter)

## Files

- New: `frontend/src/components/admin/WorkspaceSelector.jsx`
- New: `frontend/src/data/adminNavItems.js` (4 nav arrays)
- New: `frontend/src/pages/admin/survey/*` (3–4 pages)
- New: `frontend/src/pages/admin/drone/*` (3–4 pages)
- Modified: `frontend/src/components/AdminLayout.jsx` (workspace selector + filtered nav)
- Modified: `backend/src/middleware/authMiddleware.js` (apply requireDivision to routes)

## Verification

- [ ] Switch to Survey workspace → see Survey nav items
- [ ] Switch to Drone workspace → see Drone nav items
- [ ] Refresh page → workspace selection persists
- [ ] Hit `/api/survey/bookings` as Owner → 200
- [ ] Hit `/api/survey/bookings` as hypothetical Surveyor → 200
- [ ] Hit `/api/survey/bookings` as hypothetical Developer (no division) → 403

---

# Phase 7 — Homepage Sections + Navbar

**Goal:** Add the optional homepage sections and update the navbar (Option A).

**Depends on:** Phase 4 (testimonials), Phase 5 (divisions exist).

## Tasks

1. **Build homepage section components**
   - `frontend/src/components/WhyChoose.jsx` — 4–6 cards explaining differentiation
   - `frontend/src/components/SaaSProducts.jsx` — grid of SaaS offerings (placeholder for now)
   - `frontend/src/components/Testimonials.jsx` — reads from `testimonials` table where is_featured = true
   - `frontend/src/components/FAQ.jsx` — accordion, 6–8 questions

2. **Insert into HomePage.jsx**
   - Current order: Hero → HowItWorks → About → Services → Pricing → Projects → Contact
   - Insert new sections between existing ones (do NOT remove anything):
     - After Services: **WhyChoose**
     - After Pricing: **SaaSProducts**
     - After Projects: **Testimonials**
     - After Testimonials: **FAQ**
   - Final order: Hero → HowItWorks → About → Services → WhyChoose → Pricing → SaaSProducts → Projects → Testimonials → FAQ → Contact

3. **Update Navbar.jsx** (Option A)
   - Current: `Home | Projects | About | Services | Pricing | Contact`
   - New: `Home | Projects | About | Services | Portfolio | SaaS Products | Pricing | Contact`
   - Add Portfolio between Services and SaaS Products
   - Add SaaS Products as anchor to `#saas` (the new section)
   - All existing links stay; do not remove anything

4. **Add Resources link to Footer** (not main nav)
   - `frontend/src/components/Footer.jsx`
   - Add `Resources` link in the second column (where /about, /contact, etc. live)

## Files

- New: `frontend/src/components/WhyChoose.jsx`
- New: `frontend/src/components/SaaSProducts.jsx`
- New: `frontend/src/components/Testimonials.jsx`
- New: `frontend/src/components/FAQ.jsx`
- Modified: `frontend/src/pages/HomePage.jsx` (insert new sections)
- Modified: `frontend/src/components/Navbar.jsx` (add Portfolio + SaaS Products)
- Modified: `frontend/src/components/Footer.jsx` (add Resources)

## Verification

- [ ] Visit `/` → see all 11 sections (7 original + 4 new)
- [ ] No original section is missing or reordered
- [ ] Navbar shows 8 items (Home, Projects, About, Services, Portfolio, SaaS Products, Pricing, Contact)
- [ ] Click "SaaS Products" → scrolls to SaaSProducts section
- [ ] Click "Portfolio" → navigates to `/portfolio` page (built in Phase 4)
- [ ] Footer has Resources link

---

# Phase 8 — Zoho Sign & Financial

**Goal:** Build the contracts flow and financial tools.

**Depends on:** Phase 0 (contracts table).

## Tasks

1. **Build Zoho Sign service** (`backend/src/services/zohoSignService.js`)
   - Functions: `createAgreement(templateId, signer)`, `getStatus(agreementId)`, `downloadPDF(agreementId)`
   - Use Zoho Sign API v1

2. **Build contracts routes**
   - `POST /api/contracts` — create agreement from template, send to client
   - `GET /api/contracts/:id` — get status
   - `GET /api/contracts/:id/pdf` — download signed PDF
   - Webhook: `/api/contracts/webhook` — Zoho Sign POSTs when status changes; auto-archive PDF to Supabase Storage

3. **Build contracts admin page**
   - `frontend/src/pages/admin/AdminContracts.jsx`
   - List contracts with status (Draft / Sent / Signed / Void)
   - Create new contract: pick template, fill placeholders, signatory email
   - Download signed PDF



5. **Multi-currency display**
   - Add `currency` column to `invoices` (default `NGN`)
   - Frontend: display amount in selected currency; convert using a static rate (or fetch from an API)
   - Skip live FX for now; use a settings table with manual rates

6. **Uptime monitoring**
   - Sign up for UptimeRobot (free tier)
   - Add monitor: ping `https://buildwithlami.vercel.app/api/health` every 5 min
   - Configure alert email: `EUGENEODIBENUAH@GMAIL.COM`
   - Document in `docs/UPTIME.md`

## Files

- New: `backend/src/services/zohoSignService.js`
- New: `backend/src/routes/contractRoutes.js`
- New: `backend/src/controllers/contractController.js`
- New: `frontend/src/pages/admin/AdminContracts.jsx`
- New: `docs/UPTIME.md`
- Modified: `backend/src/routes/invoiceRoutes.js` (refund)
- Modified: `backend/src/services/paystackService.js` (refund call)

## Verification

- [ ] Create a contract → client receives Zoho Sign email
- [ ] Client signs → PDF auto-archives to Supabase Storage
- [ ] Refund an invoice → status updates, audit log row created
- [ ] UptimeRobot monitor configured and pinging `/api/health`

---

# Phase 9 — Documentation & Backup

**Goal:** Make the system self-documenting so you remember how it works 6 months from now.

**Depends on:** None (can be done at any time).

## Tasks

1. **Create `docs/` folder structure**
   - `docs/README.md` — index of all docs
   - `docs/BACKUP.md` — manual Supabase export routine
   - `docs/DEPLOYMENT.md` — deploy steps for Vercel + Render
   - `docs/ENV_VARIABLES.md` — every env var explained
   - `docs/TROUBLESHOOTING.md` — common errors and fixes
   - `docs/CONTENT_OWNERSHIP.md` — who writes what content (you, future writers)

2. **Build `/admin/help` page**
   - `frontend/src/pages/admin/AdminHelp.jsx`
   - In-app reference: how to do common tasks
   - Topics: create invoice, send proposal, add user, change role, deploy

3. **Create CEO quick-reference card**
   - `docs/CEO_QUICK_REFERENCE.md`
   - One-page PDF (or Markdown) with:
     - Emergency contacts (Render support, Vercel support, Supabase support, Paystack support)
     - Env var locations (Vercel dashboard, Render dashboard)
     - Rollback steps (how to revert a bad deploy)
     - Backup schedule (export Supabase every Sunday)
     - 2FA recovery codes location

4. **Set up personal backup routine**
   - Decide: every Sunday, export Supabase data
   - Add a recurring calendar event
   - Document steps in `docs/BACKUP.md`

## Files

- New: `docs/README.md`
- New: `docs/BACKUP.md`
- New: `docs/DEPLOYMENT.md`
- New: `docs/ENV_VARIABLES.md`
- New: `docs/TROUBLESHOOTING.md`
- New: `docs/CONTENT_OWNERSHIP.md`
- New: `docs/CEO_QUICK_REFERENCE.md`
- New: `docs/UPTIME.md` (from Phase 8)
- New: `frontend/src/pages/admin/AdminHelp.jsx`
- Modified: `frontend/src/components/AdminLayout.jsx` (add Help link)

## Verification

- [ ] `docs/` folder has 6+ files
- [ ] `/admin/help` renders with all topics
- [ ] CEO quick-reference card is one page, easy to scan
- [ ] Backup routine is on your calendar

---

# Final Checklist (After All Phases)

- [ ] Every UPDATE.md `[KEEP]` item is built
- [ ] No KEEP item is left unbuilt
- [ ] All 12 new database tables exist and are populated
- [ ] `/admin` loads in <2 seconds
- [ ] Mobile `/admin/today` works on phone
- [ ] 2FA enabled on your account
- [ ] Audit logs being written
- [ ] Backup routine on calendar
- [ ] UptimeRobot configured
- [ ] All env vars documented in `docs/ENV_VARIABLES.md`
- [ ] CEO quick-reference card printed/stored safely
- [ ] `/admin/help` has answers to your 10 most common questions

---

# What Comes After (LATER Items)

These are NOT in this roadmap. They're parked in [UPDATE.md §16.7](file:///c:/Users/nuke/Documents/buildwithlami/UPDATE.md#16-team--delegation-priority-3--later) and §16.8. Build them when the company grows:

- Team invitation flow
- Per-division permissions UI
- Activity audit log page
- Decision log page
- Expense tracking
- Tax/VAT on invoices
- `/portal` logged-in client experience

When you're ready for these, copy them from UPDATE.md into a new phase at the end of this file.

---

# Companion Documents

- [UPDATE.md](file:///c:/Users/nuke/Documents/buildwithlami/UPDATE.md) — decisions and triage
- [ROADMAP.md](file:///c:/Users/nuke/Documents/buildwithlami/ROADMAP.md) — this file (phased build)
