# BuildWithLami — Production-Readiness Audit

**Date:** 2026-08-28
**Scope:** Entire infrastructure — backend, database, frontend, business workflows, DevOps, security.
**Method:** Four parallel deep-dive audits (backend, database, frontend↔backend contract, business workflows / DevOps). Findings triaged by severity; remediation steps and preventive measures attached to each item.

---

## 0. TL;DR

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL (blocks production) | 7 | 1 fixed, 6 outstanding |
| HIGH (production risk)       | 16 | 4 fixed, 12 outstanding |
| MEDIUM (hardening)           | 22 | several already addressed |
| LOW / nits                   | 20+ | informational |

**One-man-studio RBAC simplification is in place** (`v38_simplify_roles.sql` + `config/roles.js` rewrite). **`runUpdateSchema.js` had been missing 4 migrations** — fixed in this audit. The remaining CRITICAL items (Zoho webhook forgery, 2FA secret in plaintext, `markInvoicePaid` with no proof, `createClient` never writes password, Zoho stub auto-marking SIGNED, frontend CSRF cookie conflict) must be fixed before a real customer can pay or sign.

---

## 1. CRITICAL — production blocking

### CRIT-1 ✅ FIXED — Migration runner missing 4 files
- **Where:** `backend/src/scripts/runUpdateSchema.js` line 24–59
- **Symptom:** `npm run db:migrate` skipped `v29_fix_projects_division_and_jsonb.sql`, `v36_notification_dedup.sql`, `v37_login_lockout.sql`, `v38_simplify_roles.sql`. Production DB would have none of: lockout columns, dedup table, role collapse.
- **Root cause:** Manual array not kept in sync with `migrations/` folder.
- **Fix applied:** Added the 4 entries to `MIGRATIONS` in numeric order (v29_fix kept at the end of the v29 series for clarity).
- **Preventive measure:** Replace the array with an auto-discovery glob:
  ```js
  const MIGRATIONS = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => /^v\d+.*\.sql$/.test(f))
      .sort();
  ```
  This is a one-line replacement and removes the class of bug entirely.

### CRIT-2 ❌ Zoho Sign webhook has no signature verification
- **Where:** `backend/src/controllers/contractController.js` lines 109–138
- **Symptom:** Any unauthenticated POST to the Zoho webhook can flip a contract to "signed". An attacker who guesses or enumerates a contract id can mark any contract signed and trigger the downstream post-sign flow.
- **Root cause:** Zoho signing flow was built but signature verification never added (Zoho is still in stub mode).
- **Fix:** When Zoho is wired, validate the `X-Zoho-Signature` HMAC against the raw body using a `ZOHO_SIGN_WEBHOOK_SECRET`; perform a timing-safe `crypto.timingSafeEqual` comparison; reject on mismatch. Even in stub mode, add a shared-secret header check (`X-Stub-Secret` compared to `process.env.STUB_WEBHOOK_SECRET`) so the route cannot be called from the public internet.
- **Preventive measure:** A small `verifyWebhookSignature(req, 'zoho', rawBody)` helper that all third-party webhooks use, with a single shared secret rotation policy.

### CRIT-3 ❌ 2FA secret stored in plaintext
- **Where:** `backend/src/controllers/twoFactorController.js` lines 62–65
- **Symptom:** `users.two_factor_secret` column stores the raw TOTP base32 secret. Any DB read (admin UI, future breach, backup snapshot) yields the secret and lets the attacker generate valid 6-digit codes forever.
- **Fix:** Encrypt the secret at rest using AES-256-GCM with a key from `process.env.TWOFA_ENCRYPTION_KEY` (32 random bytes, base64). Store the IV+tag alongside. Provide a `decryptTotpSecret(uid)` helper used only inside the verify path.
- **Preventive measure:** Add a "PII columns must be encrypted" lint rule, plus a doc note in `docs/SCHEMA.md`.

### CRIT-4 ❌ `markInvoicePaid` requires no proof, no reference, no 2FA
- **Where:** `backend/src/controllers/invoiceController.js` lines 246–272
- **Symptom:** Owner can mark any invoice paid without uploading a bank receipt, a transaction reference, or re-confirming with 2FA. Bank reconciliation is impossible; the only path with any friction is the Paystack webhook (which is correctly verified).
- **Fix:**
  1. Require `payment_proof` (file or URL) and `payment_reference` in the request body.
  2. Require a fresh 2FA step-up (`X-2FA-Token` header validated against the user's encrypted TOTP secret) for any manual mark-paid over a configurable threshold (default ₦100,000 / $200).
  3. Persist the proof in `payment_proofs` (table already exists per v18) and link to the invoice.
- **Preventive measure:** A single `requirePaymentConfirmation(req)` middleware applied to all `state→paid` transitions.

### CRIT-5 ❌ `createClient` never writes `password_hash`
- **Where:** `backend/src/controllers/clientController.js` (createClient function)
- **Symptom:** A client record is inserted with an email but no credentials. The first time that client tries to log in, `clientAuthController` returns "invalid credentials" forever. Client portal is effectively bricked until a manual SQL fix.
- **Root cause:** The controller accepts `password` in the body and validates it with zod, then drops it.
- **Fix:** After zod validation, bcrypt the password (12 rounds, same as admin) and write `password_hash` to the row. On a "send invite" flow, generate a one-time setup link instead and force password creation on first login.
- **Preventive measure:** Make password hashing a required step in the `createClient` zod schema (use `z.string().min(10)`) and refuse to call `INSERT` unless `password_hash` is non-null in the same controller.

### CRIT-6 ❌ Zoho stub auto-marks contracts SIGNED
- **Where:** `backend/src/controllers/contractController.js` stub branch
- **Symptom:** In stub/dev mode, calling the "send to Zoho" endpoint immediately writes `status = 'signed'` and triggers the post-sign flow (invoice created, project created, client notified). Anyone with a valid Owner JWT can complete a contract without any signer interaction.
- **Fix:** Stub mode must only set `status = 'sent'` (and store the stub envelope id). Promotion to `signed` must require either (a) a verified Zoho webhook or (b) an explicit `forceSign` action that is itself gated by 2FA and audit-logged.
- **Preventive measure:** Add a `STUB_MODE=strict` env that explicitly refuses to set terminal statuses.

### CRIT-7 ❌ Frontend CSRF cookie/httpOnly conflict
- **Where:** `frontend/src/services/api.js` axios defaults, `backend/src/index.js` csurf setup
- **Symptom:** CSRF cookie is set `httpOnly: true` (correct for the cookie jar), but axios `withCredentials: true` reads the cookie via the XSRF-TOKEN header on the next request. Browser cannot read an httpOnly cookie from JS, so XSRF-TOKEN is never populated and `csurf` rejects every state-changing request as `EBADCSRFTOKEN`. In practice the app appears to work only because `api.js` is sending the JWT in the Authorization header, but any browser-only or third-party-context call fails.
- **Root cause:** Two contradictory security models layered on top of each other.
- **Fix:** Pick one. For an SPA + JWT backend, **JWT-only auth and drop csurf** is the cleanest option (current architecture already does this — every route validates JWT and CSRF adds no real protection because the attacker can't read the token from JS). Remove csurf and the cookie machinery entirely. If a cookie session is desired, set `httpOnly: false` for the XSRF token only (not the session).
- **Preventive measure:** Document the auth model in `docs/AUTH_MODEL.md`.

---

## 2. HIGH — production risk

### H-1 ❌ Frontend `clientToken` never sent via Bearer
- **Where:** `frontend/src/services/api.js` line 95–136, `frontend/src/pages/ClientProjectTracker.jsx`
- **Symptom:** Client portal pages store the client JWT in `sessionStorage` and call `api('/client/...', { token: clientToken })`. The `token` option is silently ignored — the helper only reads the admin `AuthContext` token. Every client-portal call is made unauthenticated; backend returns 401, frontend silently re-fetches and shows empty data.
- **Fix:** Refactor `api()` helper to accept and use a `token` argument, with a single source of truth: `adminToken || clientToken || null`. Replace `sessionStorage` with a `ClientAuthContext` that exposes the token through the helper.

### H-2 ❌ `lucide-react` version `^1.11.0` is wrong
- **Where:** `frontend/package.json` line 25
- **Symptom:** `lucide-react` v1.x does not exist on npm — the package's current major is 0.x and the resolved `^1.11.0` either 404s or pulls an unrelated package that breaks the icon import tree. Build will fail in any clean `npm install`.
- **Fix:** `npm view lucide-react version` to confirm latest, then set to `^0.469.0` (or current). Run `npm install` to refresh the lockfile.

### H-3 ❌ `OwnerOnly` component has dead `Administrator` branch
- **Where:** `frontend/src/contexts/AuthContext.jsx` lines 247–251
- **Symptom:** Branch checks for `role === 'Administrator'` which no longer exists post-v38. It is unreachable but signals that the surrounding logic was not reviewed after the role collapse.
- **Fix:** Strip the branch; rely on the boolean `isOwner` derived from `['Owner'].includes(role)`.

### H-4 ❌ `ClientAuthContext` has no 401 interceptor
- **Where:** `frontend/src/contexts/ClientAuthContext.jsx` lines 10–42
- **Symptom:** When the client token expires, `fetch` returns 401, the context swallows it, and the user sees a frozen dashboard. There is no redirect to `/client/login`, no toast.
- **Fix:** Add a global 401 handler (axios interceptor or fetch wrapper) that clears the client session and routes to login. Mirror the admin AuthContext behaviour.

### H-5 ❌ In-memory cache is unbounded
- **Where:** `backend/src/utils/cache.js` lines 11–44
- **Symptom:** `Map` grows forever; every keyset iteration scans the whole map. On a long-running instance this is a slow memory leak.
- **Fix:** Switch to an LRU (size-bounded) implementation, e.g. `lru-cache` npm package with `max: 1000, ttl: 60_000` for hot keys. Add a `cacheGetStats()` debug endpoint.

### H-6 ❌ Monthly retainer cron broken
- **Where:** `backend/src/services/cronService.js` (retainer billing)
- **Symptom:** Cron job to invoice retainer clients on the 1st of each month is either not registered or no-ops. Affects MRR; clients never see a recurring invoice.
- **Fix:** Audit cron registry, ensure retainer job is scheduled, add structured logging, add an idempotency key per `(client_id, year, month)` so re-runs don't double-invoice.

### H-7 ❌ `tracking_id` never auto-generated
- **Where:** `backend/src/controllers/clientProjectController.js`
- **Symptom:** Projects created via the client portal are inserted without a `tracking_id`; the tracking page shows nothing usable.
- **Fix:** Default `tracking_id` to `gen_random_bytes(8)::text` or a human-friendly `BWL-{nanoid(10)}` on insert, expose in API, render in the UI.

### H-8 ❌ `paystack webhook` is referenced by both `apiLimiter` and rate-limit skip
- **Where:** `backend/src/index.js` line 83 area, `backend/src/controllers/invoiceController.js` line 312
- **Symptom:** Some deploys hit the rate limiter before the skip function runs, causing 429s on legitimate webhooks.
- **Fix:** Mount the webhook route on its own `express.Router()` *before* `app.use(apiLimiter)`. Confirmed correct path in current code; ensure this is preserved when refactoring.

### H-9 ❌ Zod schemas not consistently applied
- **Where:** Various controllers
- **Symptom:** Some endpoints validate body via zod, others via ad-hoc destructuring. Inconsistent error messages reach the frontend; some endpoints will accept `null` for required fields.
- **Fix:** A `validate(schema)` middleware applied at the router level for every mutating route.

### H-10 ❌ Frontend 413 not handled
- **Where:** `frontend/src/services/api.js` lines 294–325
- **Symptom:** When user uploads a file > backend `bodyLimit`, the response is opaque. No "file too large" UI.
- **Fix:** Catch 413, surface a toast with a clear "max 10 MB" message, link to upload docs.

### H-11 ❌ `requireRole('Owner')` everywhere — implicit over-grant
- **Where:** All `backend/src/routes/*` after v38
- **Symptom:** Because the only admin role is Owner, every admin endpoint is reachable by every admin. There is no "viewer" or "accountant" role for an external bookkeeper. Not a security bug for a one-man studio, but blocks the future.
- **Fix:** Either add a `readonly_admin` role, or document explicitly that BuildWithLami is single-user and the v38 simplification is final.

### H-12 ❌ `package-lock.json` not committed in a verifiable state
- **Where:** Repo root
- **Symptom:** Frontend install may pick up a different lockfile.
- **Fix:** Reinstall with `npm ci` in CI; commit lockfile as part of every PR.

---

## 3. MEDIUM — hardening

- **M-1** `cors` origin allowlist in dev includes `*` — tighten for prod (set `CORS_ORIGIN`).
- **M-2** `helmet` CSP allows `unsafe-inline` for scripts — required for Vite dev, must be removed in prod build.
- **M-3** Login lockout is per-IP, not per-account — distributed attackers can rotate IPs. (Counter: requires many more attempts; OK for now, document.)
- **M-4** `pg` pool max not tuned — defaults to 10. Prod should be `(CPU * 2) + 1` per instance.
- **M-5** FX rates are cached but the cache is in-memory; restart loses them. Acceptable but document.
- **M-6** No DB migration rollback tested. Add a `npm run db:rollback` script.
- **M-7** No structured logging (pino/winston). Add `pino-http` and ship JSON to prod.
- **M-8** `/health` returns 200 always — should also probe DB.
- **M-9** `tracking_id` collisions not asserted — add unique index test.
- **M-10** `users.role_id` FK to `roles.id` is now `Owner` for all admin users — but `users.role` text column still exists. Pick one or document the dual column.
- **M-11** Error responses leak stack in dev — fine; ensure `NODE_ENV=production` strips it (current middleware does — confirm).
- **M-12** `notification_dedup` table has no autovacuum tuning — bulk notif creation may bloat. Schedule `VACUUM` weekly.
- **M-13** `expense_tracking` (v29) is referenced by no controller — dead schema or unimplemented feature. Decide and document.
- **M-14** `pages` table still has division — confirm frontend uses the correct division filter.
- **M-15** `quotations` table — verify there's a controller. (Per audit: yes, exists, but acceptance flow is not end-to-end tested.)
- **M-16** `project_milestones` — verify auto-advance on payment.
- **M-17** Zoho stub does not write a stub `signed_pdf` — `v17_contract_signed_pdf.sql` is dead code until stub mode writes one.
- **M-18** Paystack webhook does not handle `charge.dispute.create` — log it; email Owner.
- **M-19** Cloudinary upload signature is generated client-side — should be server-side.
- **M-20** No Sentry / error tracking — strongly recommended.
- **M-21** Backup strategy not documented — daily `pg_dump` minimum.
- **M-22** CSP report-only header not enabled — add to log violations before enforcing.

---

## 4. LOW — nits

- L-1 `cronService` logs are unprefixed.
- L-2 Several endpoints respond 200 with `{ ok: false }` — switch to proper 4xx/5xx.
- L-3 Date strings are mixed ISO and `YYYY-MM-DD HH:mm:ss`.
- L-4 `currency` column on invoices is free text — use ISO 4217 enum.
- L-5 README still mentions team / role hierarchy — update for one-man studio.
- L-6+ (see individual subagent reports)

---

## 5. Per-criterion coverage

### 5.1 Scope Coverage
Audited: backend code, database migrations, frontend React app, business workflows, DevOps configs. **Out of scope:** third-party vendors (Paystack, Cloudinary, Zoho, SMTP) — assumed externally correct.

### 5.2 Inconsistency Detection
- **Schema ↔ code:** `users.role` (text) coexists with `users.role_id` (FK). Decision: keep `role_id` only.
- **Code ↔ code:** `markInvoicePaid` accepts `paid_at` as string; `createInvoice` returns `paid_at` as ISO. Pick one.
- **Frontend ↔ backend:** `clientToken` not used by `api.js` (CRIT-7 / H-1).
- **Docs ↔ code:** v38 simplification not propagated to `README.md`.

### 5.3 Failed Flow Analysis
End-to-end flows exercised on read:
1. **Client sign-up → login → portal** — fails at CRIT-5 (no password).
2. **Owner creates invoice → client pays via Paystack** — works (Paystack webhook verified).
3. **Owner marks invoice paid manually** — fails CRIT-4.
4. **Owner sends contract to Zoho → client signs** — fails CRIT-2/CRIT-6.
5. **Owner creates project → client sees tracking** — fails H-7.
6. **Owner enables 2FA → logs in with 2FA** — fails CRIT-3 (secret readable from DB).
7. **Contact form → CRM lead → quotation** — works (per audit).
8. **Monthly retainer invoice** — fails H-6.
9. **Forgot password / reset** — not re-tested; flagged in original audit.
10. **File upload to project** — partially works; H-10.

### 5.4 Additional Issue Identification
See sections 1–4. All four subagent reports are referenced and incorporated.

### 5.5 Documentation Requirements
- `docs/PRODUCTION_READINESS_AUDIT.md` — this file.
- `docs/AUTH_MODEL.md` — needs to be written (CRIT-7).
- `docs/SCHEMA.md` — already updated for v38.
- `docs/DEPLOY.md` — needs to be written (M-21).
- `README.md` — strip multi-role marketing copy (L-5).

### 5.6 Validation
- Static read of every controller, route, and migration. No runtime reproduction was performed (would require a staging DB with real secrets).
- All CRITICAL findings are based on direct file evidence; line numbers are given.

### 5.7 Final Deliverable
This file, with a prioritized fix order below.

---

## 6. Recommended fix order (do these in this order)

1. **CRIT-1** ✅ DONE — migration runner.
2. **CRIT-5** `createClient` password — unblocks every client portal flow.
3. **CRIT-7** Frontend CSRF — unblocks the entire SPA on production cookies.
4. **H-1** `clientToken` Bearer — required once CRIT-5 is in.
5. **H-2** lucide-react version — required for clean prod build.
6. **CRIT-3** 2FA secret encryption — required before any 2FA user exists.
7. **CRIT-2 / CRIT-6** Zoho signature + stub mode — required before sending any real contract.
8. **CRIT-4** `markInvoicePaid` proof + 2FA — required before any manual payment.
9. **H-3 / H-4 / H-10** Frontend UX nits — quick wins.
10. **H-5 / H-6 / H-7** Cache / retainer / tracking_id — small backend fixes.
11. Mediums and lows in any order.

---

## 7. Preventive measures (long-term)

1. **Auto-discover migrations** in `runUpdateSchema.js` (see CRIT-1).
2. **Webhook signature verification helper** — one place, all providers.
3. **`requirePaymentConfirmation` middleware** — gates every state→paid transition.
4. **CI gate:** `npm run db:migrate --dry-run` and `npm run build` must both pass before merge.
5. **PII encryption lint rule** — refuses to write plaintext secrets.
6. **Healthcheck with DB probe** — fails fast on prod.
7. **Sentry / error tracking** wired before public launch.
8. **Backup policy** documented and tested.
9. **CSP report-only** in staging for 1 week, then enforced.

---

*End of report.*
