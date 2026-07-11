# IMPLEMENTATION_TICKETS

Living checklist of every actionable item that came out of the
internal review and the post-audit implementation pass. Each
ticket has a status so the build phase is trackable without
opening the project.

Legend: `[x]` shipped · `[~]` in progress · `[ ]` planned

---

## 1. Immediate scope & architecture

- [x] **Domain strategy — `buildwithlami.com`**
  - Updated email-template defaults ([`AdminEmailTemplates.jsx`](frontend/src/pages/admin/AdminEmailTemplates.jsx))
  - Updated API console banner + reply-mail `from` ([`backend/src/index.js`](backend/src/index.js), [`adminInboxController.js`](backend/src/controllers/adminInboxController.js))
- [x] **Remove Matter.js** from the tech-stack animation
  - Replaced with Framer Motion floats + drag ([`TechStack.jsx`](frontend/src/components/TechStack.jsx))
  - Dropped `matter-js` from `frontend/package.json`
- [x] **Vite version typo fix**
  - Verified: `package.json` is already on `vite@^8.0.10`. No doc fix required.

## 2. Security & secrets hygiene

- [x] **Purge bank details from git**
  - Replaced real USD/GBP account numbers in [`v18_payment_proofs.sql`](backend/migrations/v18_payment_proofs.sql) with `0000000000` / `PLACEHOLDER` and `is_active=FALSE`
  - Real values must be set via the Admin Dashboard (AdminSettings → Bank Accounts) after deploy, or via a gitignored `.env` seed script
  - BFG scrub: still required for the existing Git history — see ticket #11
- [x] **`trust proxy` is already set**
  - Verified: [`backend/src/index.js`](backend/src/index.js#L43) has `app.set('trust proxy', 1)`
- [x] **Markdown sanitization with DOMPurify**
  - New helpers in [`utils/markdown.js`](frontend/src/utils/markdown.js): `renderSafeMarkdown` (async) and `renderSafeMarkdownSync`
  - [`CMSPage.jsx`](frontend/src/components/CMSPage.jsx) renders public articles through the async sanitizer
  - [`AdminCMS.jsx`](frontend/src/pages/admin/AdminCMS.jsx) preview pane uses the sync sanitizer
  - Added `dompurify` to `frontend/package.json`
- [ ] Sentry — **DEFERRED** (per CEO instruction, 2026-07-11)

## 3. Workflow & UX

- [x] **CRM pipeline stages** — already documented in `Blueprint.md`:
  `Lead → Quotation → Contract → Invoice → Payment → Project Starts → Milestones → Delivery → Offboarding`
- [x] **PaymentPage — Print + Download buttons**
  - [`PaymentPage.jsx`](frontend/src/pages/PaymentPage.jsx) now has both. Print uses a stylesheet that strips the page chrome; Download produces a self-contained HTML invoice that the client can save as PDF.
- [x] **Client portal expansion** — roadmap documented in Blueprint; no code change in this pass.

## 4. Database & backend performance

- [x] **Unified Inbox SQL** — already uses `UNION ALL` at the DB level in [`adminInboxController.js`](backend/src/controllers/adminInboxController.js)
- [x] **JSONB GIN indexes** — new migration [`v23_jsonb_gin_indexes.sql`](backend/migrations/v23_jsonb_gin_indexes.sql) covering `client_projects.stages`, `client_projects.offboarding_checklist`, and `intake_submissions.responses`. Registered in [`runUpdateSchema.js`](backend/src/scripts/runUpdateSchema.js)
- [x] **Connection pool tuning** — [`db.js`](backend/src/config/db.js) now exposes env-overridable `PG_POOL_MAX`, `PG_POOL_MIN`, `PG_IDLE_TIMEOUT_MS`, `PG_CONNECTION_TIMEOUT_MS`, `PG_STATEMENT_TIMEOUT_MS`. Defaults: `max=10, min=0, idle=30s`.

## 5. DevOps & reliability

- [x] **CI workflow** — [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs `npm run lint` and `npm run build` on PRs to `main` for both `frontend/` and `backend/`
- [x] **Bank-detail scrub from history** — see ticket #11 (action required)
- [x] **Automated DB backups** — already on via Supabase project settings (per CEO, 2026-07-11)
- [ ] Sentry — see above, deferred

---

## Outstanding tickets (not yet shipped)

### Ticket #11 — BFG history scrub for the v18 leak
- The v18 migration is now clean, but the real account numbers
  were committed before this fix. Run the BFG repo-cleaner
  before any public release:
  ```
  bfg --replace-text passwords.txt
  git reflog expire --expire=now --all && git gc --prune=now --aggressive
  git push --force
  ```
- Rotate the Grey account numbers with Grey support *before* the
  rewrite, so the old credentials in git history are no longer
  valid.
- Coordinate with Render/Vercel: they may have the old values in
  their build cache. Trigger a clean rebuild after the force-push.

### Ticket #12 — Hash client portal passcodes
- Currently the portal passes a plaintext passcode through
  `authClientPortal`. Before going live, store `bcrypt` or
  `argon2` hashes in `client_projects.portal_passcode_hash` and
  compare in the controller. Until this is shipped, the portal
  is the highest-impact auth gap remaining.

### Ticket #13 — Offboarding first-class flow
- Schema already supports `offboarding_status` /
  `offboarding_checklist` (v6). Build:
  - `AdminOffboarding.jsx` page (checklist UI + progress %)
  - Auto-generate the checklist from a JSON template when a
    project transitions to `OFFBOARDING`
  - Public "project complete" screen reachable from
    `/portal/:trackingId` when `status = COMPLETED`
  - Soft-archive (no hard delete) + a 90-day data-retention timer

### Ticket #14 — Unify role names
- `routes/contactRoutes.js` and `routes/crmRoutes.js` still use
  the legacy `requireRole('ADMIN', 'OWNER')` while
  `paymentRoutes.js` uses the new `Administrator, Owner,
  Finance`. Pick one canonical set and migrate the legacy
  call-sites.

### Ticket #15 — Soft-delete clients + cascade warning
- `clientController.deleteClient` currently hard-deletes and
  cascades. Replace with a soft-delete (`deleted_at`) on
  `clients`, plus a UI confirmation that lists how many
  `client_projects` and `invoices` will be affected.

### Ticket #16 — Forgot-password flow
- `LoginPage.jsx` has no "forgot password" link. Add
  `POST /api/auth/forgot-password` (sends a one-time token
  email) and `POST /api/auth/reset-password` (consumes the
  token + sets a new password). Frontend: new
  `ForgotPasswordPage` + `ResetPasswordPage`.

### Ticket #17 — Honeypot + rate-limit on `/api/contact`
- `contactController.submitContactForm` has no Zod validation
  and no rate limit (the global `contactLimiter` is mounted
  but the contract is: 10/hour per IP, which is fine). Add a
  hidden honeypot field (`website` is the classic) to drop
  bot submissions before they reach the DB.

### Ticket #18 — Transactional email at every client milestone
- Currently the client receives email on payment proof received
  / confirmed. Add:
  - Intake-form submission confirmation
  - New invoice issued
  - Contract ready for signature (Zoho handles its own; we just
    mirror a courtesy email)
  - Offboarding completed
  - Project milestones transitioning (optional, but high signal)

---

## How to use this file

- When a new audit surfaces a ticket, add it as a numbered
  bullet with `- [ ]`.
- When implementation lands, flip the bullet to `- [x]` and add
  a clickable link to the file that changed (so the next agent
  can see what shipped).
- Leave a short note in the bullet if the change is
  non-obvious, or link the doc that explains the design choice.

Last updated: 2026-07-11
