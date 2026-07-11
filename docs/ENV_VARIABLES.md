# Environment Variables — BuildWithLami

> Every env var the backend and frontend read, what it does, and
> what to set it to. If you're adding a new integration, copy the
> pattern here.

## Where to set them

| Service | Where |
|---|---|
| **Vercel** (frontend) | Project → Settings → Environment Variables |
| **Render** (backend) | Service → Environment → Add Environment Variable |
| **Local dev** | `.env` files (gitignored). See `.env.example` if it exists. |

**Rule:** any var starting with `VITE_` is **build-time** baked
into the frontend bundle. Changing it requires a Vercel redeploy.
Everything else is read at request time, so a redeploy isn't
required.

## Backend (`backend/.env`)

### Required

| Var | Example | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host:6543/db?pgbouncer=true` | Postgres connection string. Use the **Transaction** (port 6543) URL if using Supabase with serverless, **Internal** URL if using Render Postgres. |
| `JWT_SECRET` | (64+ random chars) | Signs the auth tokens. **Rotate = all users logged out.** |
| `FRONTEND_URL` | `https://buildwithlami.vercel.app` | Used for CORS + Paystack callback URLs. |
| `PORT` | `4000` | What port the Express server listens on. Render sets this automatically. |

### Optional — Auth & Security

| Var | Default | Purpose |
|---|---|---|
| `JWT_EXPIRES_IN` | `30m` | Token lifetime. The session-timeout modal warns at 25 min. |
| `TOTP_ISSUER` | `BuildWithLami` | Issuer name shown in authenticator apps. |
| `ADMIN_WRITE_LIMIT` | `60` | Max admin writes per 15 min per user (uploads, bulk actions). |

### Optional — Email (Nodemailer)

| Var | Default | Purpose |
|---|---|---|
| `SMTP_HOST` | — | SMTP server. e.g. `smtp.gmail.com`, `smtp.mailgun.org`. |
| `SMTP_PORT` | `587` | SMTP port. |
| `SMTP_USER` | — | SMTP auth username. **If unset, emails are logged to stdout instead of sent.** |
| `SMTP_PASS` | — | SMTP auth password. |
| `SMTP_FROM` | `noreply@buildwithlami.com` | From address. |

### Optional — Paystack (NGN payments)

| Var | Default | Purpose |
|---|---|---|
| `PAYSTACK_SECRET_KEY` | — | Paystack secret key (`sk_test_...` or `sk_live_...`). **If unset, invoices are saved as PENDING without a payment link.** |
| `PAYSTACK_PUBLIC_KEY` | — | Paystack public key. Exposed to the frontend. |

### Optional — Stripe (USD/EUR/GBP, when wired)

| Var | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` / `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` / `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | For verifying webhook signatures. |

### Optional — Cloudinary (image upload)

| Var | Purpose |
|---|---|
| `CLOUDINARY_URL` | `cloudinary://api_key:api_secret@cloud_name`. **If unset, uploads return a `data:` URI fallback** so the CMS works locally. |
| `CLOUDINARY_FOLDER` | Defaults to `buildwithlami`. |

### Optional — Zoho Sign (e-signature, Phase 8)

| Var | Default | Purpose |
|---|---|---|
| `ZOHO_SIGN_TOKEN` | — | OAuth token for Zoho Sign API. **If unset, the service runs in stub mode** (returns dummy data, generates a placeholder PDF). |
| `ZOHO_SIGN_API_BASE` | `https://sign.zoho.com/api/v1` | API base URL. Override for EU/US data center. |
| `ZOHO_SIGN_WEBHOOK_SECRET` | — | For verifying Zoho Sign webhook signatures. |

### Optional — FX Rates (Phase 11 — Live)

| Var | Default | Purpose |
|---|---|---|
| `FX_API_URL` | `https://open.er-api.com/v6/latest/NGN` | Live FX rate API endpoint. Free, no key, daily updates. Set to empty string to disable. |

### Optional — Maintenance

| Var | Default | Purpose |
|---|---|---|
| `MAINTENANCE_MODE` | `false` | Set to `true` to return 503 for all API requests. |

## Frontend (`frontend/.env`)

The frontend uses Vite, so vars are **build-time**. Prefix with
`VITE_` to expose them to the bundle.

| Var | Example | Purpose |
|---|---|---|
| `VITE_API_URL` | `https://buildwithlami-api.onrender.com` | Base URL for all backend API calls. **If unset, defaults to `http://localhost:4000` in dev.** |
| `VITE_PAYSTACK_PUBLIC_KEY` | `pk_test_...` | Paystack public key for inline payments. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Stripe public key. |
| `VITE_GA_ID` | `G-XXXXXXX` | Google Analytics 4 ID. |

## How to rotate a secret

1. Generate a new value (e.g. new `JWT_SECRET` with
   `openssl rand -hex 32`).
2. Add the new value to the dashboard as `JWT_SECRET_NEW`.
3. Deploy a backend version that reads from `JWT_SECRET_NEW` while
   accepting both old + new tokens during the rotation window.
4. Once all old tokens have expired (30 min by default), remove
   the old value.

For env vars that don't drive token validation (SMTP, Paystack),
the rotation is simpler:

1. Update the value in the dashboard.
2. Hit **Manual Deploy** (or wait for next push).
3. The new value takes effect on the next request.

## What I should NOT put in `.env`

- **Database passwords** — yes these go in `DATABASE_URL`, but the
  file should be gitignored. Use a secret manager (Render's built-in
  env vars, or a paid secret manager like Doppler / Vault) for
  production.
- **Service account JSONs** — same deal, never in the repo.
- **Anything from the user** — never log a full env var to
  console / audit log. Log only the *name* of the var that's
  missing.

## Sanity-check command

From the backend directory, this confirms the server boots without
missing required vars (does NOT start a long-running server):

```bash
node -e "import('./src/index.js').then(() => { console.log('OK'); setTimeout(() => process.exit(0), 200); }).catch(err => { console.error('FAIL:', err.message); process.exit(1); })"
```

If you see `FAIL: … JWT_SECRET …` or similar, an env var is
missing from your local `.env` or the Render dashboard.
