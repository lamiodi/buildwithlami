# BuildWithLami — Documentation Index

> Phase 9 deliverable. This folder is the **operating manual** for
> the project. When something is wrong at 11pm and you can't
> remember how a piece works, start here.

## What's in this folder

| File | What it's for | When to read it |
|---|---|---|
| [BACKUP.md](./BACKUP.md) | Database backup + restore procedure | Sundays (backup), emergencies (restore) |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | How to ship a new build to Vercel + Render | When you cut a release |
| [ENV_VARIABLES.md](./ENV_VARIABLES.md) | Every environment variable explained | When you add a new integration |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common errors and their fixes | When something breaks |
| [UPTIME.md](./UPTIME.md) | External uptime monitoring setup | Once, then leave it alone |
| [CONTENT_OWNERSHIP.md](./CONTENT_OWNERSHIP.md) | Who writes what content on the site | When onboarding a writer |
| [CEO_QUICK_REFERENCE.md](./CEO_QUICK_REFERENCE.md) | One-page emergency card (print me) | Print, laminate, pin to wall |

## The 60-second mental model

```
Browser → Vercel (frontend) → Render (backend API) → Postgres DB
                                  ↓
                            Supabase (auth, storage — when wired)
                                  ↓
                            Paystack (NGN payments)
                            Stripe (USD/EUR/GBP — when wired)
                            Zoho Sign (e-signatures — stub mode for now)
```

- **Frontend** is React 19 + Vite, deployed to Vercel.
- **Backend** is Express on Node, deployed to Render.
- **Database** is PostgreSQL (the `pg` client talks to it directly).
- **Auth** is JWT + 2FA TOTP (no third-party identity service).
- **Email** is Nodemailer; if `SMTP_USER` is unset, emails are logged
  to stdout instead of being sent.
- **File uploads** prefer Cloudinary; falls back to a `data:` URI
  when no `CLOUDINARY_URL` is set so the CMS works locally.

## Where to look for what

- **"How do I…?"** → [/admin/help](../frontend/src/pages/admin/AdminHelp.jsx) inside the app, or the in-app Help page at `https://buildwithlami.vercel.app/admin/help` once deployed.
- **"What's the schema?"** → [`backend/migrations/`](../backend/migrations/) — one `.sql` file per versioned change.
- **"What's the roadmap?"** → [ROADMAP.md](../ROADMAP.md) at the repo root.
- **"Why was this decision made?"** → [UPDATE.md](../UPDATE.md) at the repo root.
- **"What was done in this session?"** → `project_memory.md` (Trae memory) — project-scoped history.

## Conventions used across all docs

- ✅ / ❌ for "this works" / "this is broken or not done"
- ⚠️ for "works but with a caveat"
- 🆕 for "new since last review"
- 🚨 for "if you see this, act now"
- Code blocks are copy-pasteable unless they start with `# ...`
