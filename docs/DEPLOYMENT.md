# Deployment — BuildWithLami

> How a code change on your laptop becomes a live site for the
> world. Two services, two dashboards, ~10 minutes from push to
> production.

## TL;DR

| Service | What lives there | Dashboard |
|---|---|---|
| **Vercel** | The React frontend | [vercel.com/dashboard](https://vercel.com/dashboard) |
| **Render** | The Express backend API | [dashboard.render.com](https://dashboard.render.com) |
| **Supabase / Render Postgres** | The PostgreSQL database | Depends on the setup (see §3) |
| **GitHub** | The source of truth | [github.com](https://github.com) |

A `git push` to `main` triggers **both** Vercel (auto-detected as
Vite project) and Render (auto-detected as Node web service). You
don't need to "deploy" manually — pushing is deploying.

## 1. First-time setup (one-off)

### Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import the GitHub repo.
3. **Project name:** `buildwithlami` (or your preferred subdomain).
4. **Root directory:** `frontend` (CRITICAL — don't let it auto-detect the repo root).
5. **Build command:** `npm run build` (Vercel auto-fills this).
6. **Output directory:** `dist` (Vercel auto-fills this).
7. Click **Deploy** — first build takes ~3 minutes.
8. Once live, go to **Settings → Domains** and add
   `buildwithlami.vercel.app` (or your custom domain).

### Render

1. Go to [dashboard.render.com](https://dashboard.render.com) →
   **New** → **Web Service**.
2. Connect the GitHub repo.
3. **Name:** `buildwithlami-api`.
4. **Root directory:** `backend`.
5. **Build command:** `npm install`.
6. **Start command:** `npm start`.
7. **Instance type:** Starter ($7/mo) for production. Free tier
   spins down after 15 min of inactivity (don't use for production).
8. Click **Create Web Service**.

### Database

You have two options. **Pick one — don't mix.**

#### Option A: Render Postgres (recommended — simpler)
1. Render dashboard → **New** → **PostgreSQL**.
2. Name: `buildwithlami-db`, plan: Starter ($7/mo).
3. Copy the **Internal Database URL** to the backend service as
   `DATABASE_URL` (use the **Internal** URL — same datacenter,
   faster + free of bandwidth charges).
4. The DB is created empty. Run the migrations (see §3).

#### Option B: Supabase (if you want a web UI to poke at the DB)
1. Create a Supabase project.
2. Settings → Database → **Connection string** → **Transaction**
   mode (port 6543) — better for serverless than Session mode.
3. Use that as `DATABASE_URL` in Render.
4. Migrations: run the SQL files in `backend/migrations/` in order,
   in the Supabase SQL editor.

## 2. Environment variables

All env vars are documented in [ENV_VARIABLES.md](./ENV_VARIABLES.md).
Set them in:
- **Vercel:** Project → Settings → Environment Variables.
- **Render:** Service → Environment → Add Environment Variable.

**Critical rule:** the Vercel project needs `VITE_API_URL` set to
the Render backend URL (e.g. `https://buildwithlami-api.onrender.com`).
The frontend's `services/api.js` reads it to build all `fetch()`
calls. Without it, every API call goes to `localhost:3000`.

## 3. Running migrations

The migrations in `backend/migrations/` are SQL files numbered
`v1` through `v17`. Run them in order against the production
database.

From your laptop (you need `psql` and the production `DATABASE_URL`):

```bash
# Set the URL once
export DATABASE_URL='postgresql://user:pass@host:6543/dbname?pgbouncer=true'

# Run a single migration
psql "$DATABASE_URL" < backend/migrations/v16_invoice_fx_rates.sql

# Or run all of them in one shot
for f in backend/migrations/v*.sql; do
  echo "Applying $f"
  psql "$DATABASE_URL" < "$f"
done
```

All migrations are written with `IF NOT EXISTS` clauses so they're
**idempotent** — safe to run twice.

After applying new migrations, **redeploy the backend** (Render
auto-redeploys on push; if you only changed SQL, hit **Manual
Deploy** → **Deploy latest commit**).

## 4. Cutting a release

The repo doesn't use Git tags or formal versions. To "cut a
release":

1. Make your changes on a feature branch.
2. Test locally: `cd frontend && npm run build` and `cd backend && npm run dev` + manual smoke tests.
3. `git checkout main && git merge <branch>`.
4. `git push origin main`.
5. Watch both deploys in their dashboards (~5 min each).
6. Smoke-test the live site: log in, create an invoice, hit `/api/ping`.

## 5. Rollback (when you shipped a bad release)

**Frontend rollback (Vercel):**
1. Vercel dashboard → Deployments tab.
2. Find the last good deployment (usually the one above your bad push).
3. Click the ⋮ menu → **Promote to Production**.
4. Takes ~30 seconds. No data change.

**Backend rollback (Render):**
1. Render dashboard → Service → Events.
2. Find the last successful deploy.
3. Click **Rollback to this deploy**.
4. Takes ~2 minutes (re-installs deps + restarts).
5. **If the rollback is for a DB-migration-related bug**, you also
   need to manually revert the SQL change in the database. The
   migrations are forward-only — there's no auto-rollback script.

**Database rollback:**
- This is the dangerous one. See [BACKUP.md](./BACKUP.md) §3 for
  the full procedure. TL;DR: stop the backend, restore from the
  most recent `pg_dump`, re-run migrations added since.

## 6. Zero-downtime deploys

Both Vercel and Render do rolling deploys by default:
- Vercel serves the new bundle atomically.
- Render spins up the new instance, then swaps traffic.

If you need to be 100% sure no request hits a half-deployed state,
put the backend in **maintenance mode** by setting
`MAINTENANCE_MODE=true` in Render env vars before pushing. The
backend will return a `503` for all requests (frontend will show a
"down for maintenance" page once we add one — tracked separately).

## 7. What the dashboards tell you

**Vercel:** Build log (compile errors), runtime errors, analytics
(visits, top pages), function logs.

**Render:** Service log (stdout/stderr from the Express app),
metrics (CPU, memory, requests/sec), deploy history, env vars.

**Supabase (if used):** DB browser, query performance, auth users
(if you switch to it later), storage usage.

## 8. Common gotchas

- **Forgot `cd frontend` in Vercel settings?** Vercel will try to
  build the repo root and fail with "no package.json found".
- **`CORS` blocking the frontend?** Backend `index.js` already
  allows `https://buildwithlami.vercel.app` and `http://localhost:3000`
  in `allowedOrigins`. Add your custom domain there if you have one.
- **Database migrations not running?** They don't auto-run on
  deploy. You (or a cron job) must apply them manually.
