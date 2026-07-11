# Troubleshooting — BuildWithLami

> Common errors, what they mean, and how to fix them. Sorted by
> how often you actually hit them.

## 🚨 "Something is broken in production"

Before diving into specific errors:

1. **Render service status:** [status.render.com](https://status.render.com) — is Render itself down?
2. **Vercel status:** [vercel-status.com](https://vercel-status.com) — is Vercel itself down?
3. **Database health:** hit `https://<your-api>/api/ping` — should return `{"status":"ok","db_time":"..."}`. If it returns 5xx, the database is the problem.
4. **Recent deploys:** Render dashboard → Service → Events. Did a deploy just fail?

If all three are green, your bug is in the code or the data. Read on.

## "JWT malformed" / "Invalid token" on login

- **Cause:** The `JWT_SECRET` was rotated, or the token expired (default 30 min).
- **Fix:** Log out, log back in. If the issue persists across multiple users, check that `JWT_SECRET` hasn't been blanked in Render env vars.

## "CORS policy: No 'Access-Control-Allow-Origin' header"

- **Cause:** Frontend domain isn't in the backend's `allowedOrigins` list in [backend/src/index.js:72-77](../backend/src/index.js#L72-L77).
- **Fix:** Add your custom domain to that array and redeploy the backend. (Vercel preview URLs are NOT in the allow-list — only the production domain is.)

## Paystack invoice link doesn't generate

- **Cause:** `PAYSTACK_SECRET_KEY` is unset, or invalid.
- **Fix:** The invoice is still saved as `PENDING` (intentional, so you don't lose data). Add the key to Render env vars, then click "Resend" or recreate the invoice.
- **Debug:** `curl -H "Authorization: Bearer $PAYSTACK_SECRET_KEY" https://api.paystack.co/transaction` — if it returns 401, the key is wrong.

## "Database connection terminated" / "Connection refused"

- **Cause:** Postgres instance is down, or `DATABASE_URL` is wrong.
- **Fix:**
  1. Check the database dashboard (Render or Supabase) — is the instance running?
  2. `psql "$DATABASE_URL" -c "SELECT 1"` from your laptop. If this fails, the URL is wrong.
  3. If using Supabase Transaction mode, ensure the URL has `?pgbouncer=true` — without it, the connection pooler rejects prepared statements.

## Uploads return a `data:` URI instead of a Cloudinary URL

- **Cause:** `CLOUDINARY_URL` is not set.
- **Fix:** This is **expected behavior** in local dev. Set the env var to use real Cloudinary. The data: URI is a placeholder so the CMS works end-to-end without a Cloudinary account.

## Email isn't being sent

- **Cause:** SMTP env vars are missing.
- **Fix:** Nodemailer falls back to logging the email to stdout when `SMTP_USER` is unset. This is intentional (so you can develop without an SMTP server). Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` in Render env vars to send real email.

## Frontend build fails with "Cannot find module"

- **Cause:** You imported a package that isn't in `frontend/package.json`.
- **Fix:** `cd frontend && npm install <package>` then commit `package.json` and `package-lock.json`.

## 2FA "Invalid code" even though the code is right

- **Cause:** Server clock and phone clock are more than 30 seconds out of sync.
- **Fix:** Enable "set time automatically" on the phone. TOTP is time-based; a 60-second drift makes codes invalid.

## 2FA recovery codes not working

- **Cause:** Each recovery code is single-use. If you've used all 10, you're locked out.
- **Fix:** Contact the CEO (or whoever holds the Owner account) to reset your 2FA via the database. The `users.two_factor_enabled` flag can be flipped to `false` with a SQL `UPDATE`. This is a last-resort admin action.

## "Audit log write failed" appearing in logs

- **Cause:** The `audit_logs` table is full or has a constraint violation.
- **Fix:** Check the table: `SELECT COUNT(*) FROM audit_logs;`. The `writeAuditLog` helper is designed to **never throw** — a failure here is logged but doesn't break the request. If the table is genuinely corrupt, see [BACKUP.md](./BACKUP.md) for recovery.

## Contracts flow: "Cannot find package 'axios'"

- **Cause:** The Zoho Sign service is in **live mode** (`ZOHO_SIGN_TOKEN` is set) but axios isn't installed.
- **Fix:** `cd backend && npm install axios` and commit `package.json` + `package-lock.json`. Until you register Zoho Sign, leave `ZOHO_SIGN_TOKEN` unset and the service stays in stub mode (no axios needed).

## "User has no division access"

- **Cause:** The logged-in user has `divisions: []` (or a division not matching the requested workspace).
- **Fix:** Owner / Administrator role can edit user divisions in the database: `UPDATE users SET divisions = ARRAY['SOFTWARE','SURVEY','DRONE'] WHERE email = '...';`

## "Build OK locally but deploy fails"

- **Cause:** Vercel / Render runs `npm install` with `NODE_ENV=production`, which skips `devDependencies`. If you accidentally `import` a dev-only tool, it works locally but blows up in production.
- **Fix:** Move the import to a runtime dependency, or use a dynamic `import()` so it's only loaded when actually needed.

## Frontend chunk > 500 KB warning

- **Cause:** The bundle is large. Acceptable for now.
- **Fix (later):** Code-split with `React.lazy()` and `Suspense`. Tracked separately; not urgent for an internal admin.

## How to read the Render logs

1. Render dashboard → Service → Logs.
2. Filter by severity (error, warn).
3. Common patterns:
   - `EADDRINUSE` — port already in use. Restart the service.
   - `JWT malformed` — see above.
   - `relation "..." does not exist` — migration not run. See [DEPLOYMENT.md §3](./DEPLOYMENT.md#3-running-migrations).
   - `permission denied for table` — Postgres user doesn't have write access on the table. Check the role.

## How to read Vercel logs

1. Vercel dashboard → Project → Logs.
2. Filter by status code (4xx = client bug, 5xx = server bug).
3. Common patterns:
   - `404` on an API call — the `VITE_API_URL` is wrong or the backend route is missing.
   - `CORS` — see above.
   - `Failed to fetch` — backend is down. Check Render status.
