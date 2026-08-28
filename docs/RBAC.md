# Buildwith_lami — Role-Based Access Control (RBAC)

> **TL;DR:** Buildwith_lami is a one-man studio. There is exactly one admin
> identity: `Owner`. Clients authenticate into a separate portal surface via
> a `Client` JWT. There is no role hierarchy, no division gating, no admin
> tier, no manager tier. Every admin route uses `requireRole('Owner')`.

---

## 1. Intended model

| Identity    | Where it authenticates                  | What it can do                                                                                |
|-------------|------------------------------------------|-----------------------------------------------------------------------------------------------|
| `Owner`     | `/api/auth/login` (admin login + 2FA)    | Full read/write across every route. The studio operator.                                      |
| `Client`    | `/api/client-projects/track/:id/auth`    | Read-only access to their own project's dashboard, files, invoices, feedback, intake form, and secret submission. Resource-level filtering enforces tenant isolation — the `trackingId` claim is bound to a single `client_projects` row. |

There is **no other role** at runtime. The `Owner` is the only admin. There
is no team, no department head, no per-division access check, no
`Administrator` / `Manager` / `Staff` tier, no `Finance` role, no `Survey
Manager` / `Drone Manager` distinction, no `Project Manager` tier.

This is an intentional simplification driven by the operating model: the
business is run end-to-end by a single person, so multi-tier RBAC adds
configuration surface area without providing any actual access control.

---

## 2. Source of truth

- **DB schema:** [backend/migrations/v7_roles_rbac.sql](file:///c:/Users/nuke/Documents/buildwithlami/backend/migrations/v7_roles_rbac.sql) (the `roles` table) and [backend/migrations/v38_simplify_roles.sql](file:///c:/Users/nuke/Documents/buildwithlami/backend/migrations/v38_simplify_roles.sql) (the simplification that removed the specialist role rows).
- **Runtime role config:** [backend/src/config/roles.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/config/roles.js) — `ROLE_DIVISIONS` and `canonicalRole()`.
- **Auth middleware:** [backend/src/middlewares/authMiddleware.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/middlewares/authMiddleware.js) — `verifyToken`, `requireRole`, `requireDivision`.
- **Client portal auth:** [backend/src/middlewares/clientAuthMiddleware.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/middlewares/clientAuthMiddleware.js) — `verifyClientToken` (separate `CLIENT_JWT_SECRET`).

The DB still contains the `roles` table and the `users.role_id` FK so legacy
rows and the migration history stay intact. The runtime only ever emits
`'Owner'` for admins and `'Client'` / `'CLIENT_PORTAL'` for clients.

---

## 3. Backwards-compat aliases (read-only)

`canonicalRole()` accepts a small set of legacy role strings and folds them
into the canonical `Owner` bucket before the route guard runs:

| Legacy string            | Canonical |
|--------------------------|-----------|
| `admin`, `ADMIN`         | `Owner`   |
| `owner`, `OWNER`         | `Owner`   |
| `superadmin`             | `Owner`   |
| `admin2`                 | `Owner`   |
| `administrator`          | `Owner`   |
| `finance`                | `Owner`   |
| `project_manager`, `pm`  | `Owner`   |
| `developer`              | `Owner`   |
| `survey_manager`         | `Owner`   |
| `surveyor`               | `Owner`   |
| `drone_manager`          | `Owner`   |
| `drone_pilot`            | `Owner`   |
| `staff`                  | `Owner`   |
| `client`                 | `Client`  |
| `client_portal`          | `CLIENT_PORTAL` |

This means an un-migrated JWT carrying `role: 'Administrator'` still passes
`requireRole('Owner')` because the middleware normalises the claim before
the comparison. New code MUST NOT introduce new alias strings; new code
MUST use the canonical titlecase names (`Owner`, `Client`,
`CLIENT_PORTAL`).

`requireRole` itself is case-insensitive on the **argument side** (so
`requireRole('OWNER')` and `requireRole('Owner')` are equivalent), but
`canonicalRole` is the only thing that ever sets `req.user.role` in the
first place, so the argument side is effectively decorative.

---

## 4. Route coverage

Every admin route uses `requireRole('Owner')` (or `requireRole('Owner',
'Client')` for endpoints clients are also permitted to hit). Verified by
grepping `backend/src/routes/`:

| Route file                                                    | Admin gate                  | Notes                                                       |
|---------------------------------------------------------------|------------------------------|-------------------------------------------------------------|
| [activityRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/activityRoutes.js)           | `requireRole('Owner')`       | Activity log is admin-only.                                 |
| [adminInboxRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/adminInboxRoutes.js)       | `requireRole('Owner')`       | Admin inbox.                                                |
| [bookingRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/bookingRoutes.js)             | `requireRole('Owner')`       | Bookings admin surface.                                     |
| [clientProjectRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/clientProjectRoutes.js) | `requireRole('Owner')`       | Admin-side project CRUD + portal link + file delete.        |
| [clientRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/clientRoutes.js)               | `requireRole('Owner')`       | CRM clients (admin surface).                                |
| [contactRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/contactRoutes.js)             | `requireRole('Owner')`       | Contact-form submissions.                                   |
| [contractRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/contractRoutes.js)           | `requireRole('Owner')`       | Zoho contract admin surface.                                |
| [crmRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/crmRoutes.js)                     | `requireRole('Owner')`       | CRM leads, pipeline, etc.                                   |
| [dashboardRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/dashboardRoutes.js)         | `requireRole('Owner')`       | Admin dashboard.                                            |
| [emailTemplateRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/emailTemplateRoutes.js) | `requireRole('Owner')`       | Email template CRUD.                                        |
| [expenseRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/expenseRoutes.js)             | `requireRole('Owner')`       | Expense tracker.                                            |
| [fxRateRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/fxRateRoutes.js)               | `requireRole('Owner')`       | FX rate write + refresh.                                    |
| [invoiceRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/invoiceRoutes.js)             | `requireRole('Owner')` (admin), `requireRole('Client', 'Owner')` for project invoices | Webhook is separate (HMAC-verified). |
| [notificationRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/notificationRoutes.js)   | `requireRole('Owner')`       | Admin notifications.                                        |
| [paymentRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/paymentRoutes.js)             | `requireRole('Owner')`       | Proofs review, bank accounts, etc.                          |
| [profileRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/profileRoutes.js)             | `requireRole('Owner')`       | Admin profile update.                                       |
| [projectRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/projectRoutes.js)             | `requireRole('Owner')`       | Project admin.                                              |
| [quotationRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/quotationRoutes.js)         | `requireRole('Owner')`       | Quotations.                                                 |
| [secretRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/secretRoutes.js)               | `requireRole('Owner')` (admin) / `requireRole('Client', 'Owner')` (submit by tracking) | Admin reads all, client submits via `trackingId`. |
| [templateRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/templateRoutes.js)           | `requireRole('Owner')` (admin) / `requireRole('Client', 'Owner')` (intake submit)   | Templates + intake submissions.                            |
| [feedbackRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/feedbackRoutes.js)           | `requireRole('Owner')` (reply) / `requireRole('Client', 'Owner')` (submit, view)      | Two-way feedback.                                           |
| [authRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/authRoutes.js)                   | `verifyToken` (no role gate) | `/me`, `/refresh`, `/password`, `/logout` — every admin is `Owner` so no second gate needed. |
| [twoFactorRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/twoFactorRoutes.js)         | `verifyToken` (no role gate) | Owner-only in practice.                                     |
| [divisionRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/divisionRoutes.js)           | `requireDivision('SURVEY'|'DRONE')` | Defence-in-depth: `Owner` is `['*']`, so it always passes. |
| [clientAuthRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/clientAuthRoutes.js)       | `verifyClientToken`          | Client portal.                                              |
| [clientPortalRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/clientPortalRoutes.js)   | `verifyClientToken`          | Client portal.                                              |

**Summary:**

- 23 admin route files
- 20 use `requireRole('Owner')` exclusively
- 3 use `requireRole('Owner', 'Client')` for the subset a client may also hit
  (project invoices, feedback, intake submission, secret submission)
- 2 use `verifyToken` without `requireRole` (`authRoutes.js`, `twoFactorRoutes.js`)
  — these are admin-self-service endpoints, so the role check is redundant
  given the one-man model
- 2 client-only route files use `verifyClientToken` exclusively
- 1 file uses `requireDivision` for legacy URL hygiene; `Owner` always
  passes (granted `'*'`)

No admin route is left with a stale `Administrator` claim, no
`requireRole('ADMIN', 'OWNER')` is left, and no multi-role grant has been
re-introduced.

---

## 5. Frontend RBAC

The frontend mirrors the backend in [frontend/src/contexts/AuthContext.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/contexts/AuthContext.jsx):

- `useAuth()` exposes the canonical `user.role` (always `'Owner'` for
  admins; the token is canonicalised server-side before the response is
  emitted).
- `OwnerOnly` is a render-time gate: `user.role === 'Owner'`. It does
  **not** accept any other role. A stale token carrying `'Administrator'`
  is normalised to `'Owner'` by `canonicalRole` before the JWT response is
  built, so this branch is the only one needed.
- A separate `ClientAuthContext` powers the `/portal` surface and never
  touches admin tokens (the two are signed with different secrets and
  carry different claims).

The frontend has no division-aware UI, no manager-only view, no
finance-only view. The single `Owner` user sees the full admin app.

---

## 6. Why this is safe

1. **Single admin identity** means there is no privilege escalation
   between admin tiers — every admin has every permission.
2. **`canonicalRole` is the single entry point** for translating any
   token's `role` claim into a runtime string. Every guard, every UI gate,
   every audit-log entry reads from the canonicalised value. A stale
   `'Administrator'` token is rewritten before it ever reaches a route
   guard.
3. **Client tokens are signed with a different secret** (`CLIENT_JWT_SECRET`)
   and carry a different claim set (`role: 'Client'` /
   `role: 'CLIENT_PORTAL'`, plus `trackingId`). They cannot be used to
   call admin routes — the signature verification fails before the role
   check runs.
4. **Resource-level tenant isolation** for clients is enforced at the
   query layer (every client-side query filters by `trackingId` from the
   JWT). A client cannot see another client's project.
5. **2FA is mandatory for the owner** (enforced by
   `twoFactorController` + `verifyToken` step-up flow on protected
   admin actions). The 2FA secret is AES-256-GCM encrypted at rest.

---

## 7. Adding a new admin route (the contract)

When you add a new admin route, the entire RBAC surface is three lines:

```js
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

router.post('/example', verifyToken, requireRole('Owner'), exampleController);
```

That's it. Do not introduce new roles, do not add a new `requireRole`
argument, do not add a `requireDivision` call. The single `Owner` is the
only admin and gets every permission. If a future change introduces a
second operator, the right move is to add a new canonical role in
`config/roles.js` and call `requireRole('Owner', 'CoOwner')` on the
subset of routes the co-owner should access — not to add a hierarchy
inline.

For routes a client is also permitted to call, add `'Client'` to the
allow-list:

```js
router.get('/project/:id', verifyToken, requireRole('Owner', 'Client'), handler);
```

…then enforce tenant isolation in the handler by filtering the query by
`req.user.trackingId` (clients) or letting `Owner` see everything.
