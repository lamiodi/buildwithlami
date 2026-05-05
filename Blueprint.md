

The stack (React/Express/Postgres) remains, but the data models and logic now focus on **showcasing your work** and **managing contact inquiries**.

---

#buildwithlami.dev — Technical Blueprint v1.0

> **Last Updated:** October 2024
> **Status:** Backend Phase 1 Complete. **Phase 2 (Portfolio CMS) is active priority.**

---

## 1. Executive Summary

**Project Name:** buildwithlami.dev
**Type:** Personal Portfolio & Content Management System
**Stack:** React (Vite) + Express.js + PostgreSQL (Supabase)

### Core Mission
Showcase expertise and turn visitors into opportunities.

The system is built around a simple personal pipeline:

```
VISITOR → BROWSE PROJECTS → CONTACT FORM → INQUIRY → OPPORTUNITY
```

### Two Interfaces
1.  **Public Interface** — SEO-optimized portfolio (Hero, Projects, Experience, Contact).
2.  **Private Interface** — Personal Admin Dashboard (Manage Projects, View Messages, Update Profile).

---

## 2. System Architecture

### A. Tech Stack
*No changes required to the core stack.*

| Layer | Technology | Status |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite (SPA) | 🔲 Not started |
| **Styling** | TailwindCSS + Shadcn/UI | 🔲 Not started |
| **Backend** | Node.js + Express | ✅ Built |
| **Database** | Supabase (PostgreSQL) | ✅ Schema deployed (needs migration) |
| **Auth** | JWT (HttpOnly Cookie) | ✅ Built (Owner only) |

### B. The Visitor Flow

```
[1] Visitor lands on Homepage
        ↓
[2] GET /api/projects  →  Fetches featured works
        ↓
[3] Visitor views Project Details (Case Study)
        ↓
[4] Visitor fills "Contact Me" Form
        ↓
[5] POST /api/contact  →  Inserted into `messages` table
        ↓
[6] Email/WhatsApp alert sent to YOU (The Owner)
        ↓
[7] You view message in Admin Dashboard
```

---

## 3. Database Schema (Personal Portfolio Edition)

> **Migration Strategy:** We will create `migrations/v1_portfolio_schema.sql`. We are removing `clients`, `invoices`, and `leads` and adding `projects` and `messages`.

### A. `users` — Owner Profile
*Simplified: Only one user (You).*

```sql
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT UNIQUE NOT NULL,
  password     TEXT NOT NULL,        -- bcrypt hash
  role         TEXT NOT NULL DEFAULT 'OWNER',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### B. `profile` — Public Bio
*Stores your headline, about section, and social links.*

```sql
CREATE TABLE IF NOT EXISTS profile (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name    TEXT NOT NULL,
  headline     TEXT,                 -- e.g., "Full Stack Developer"
  bio          TEXT,                 -- Long form about me
  resume_url   TEXT,                 -- Link to downloadable PDF
  avatar_url   TEXT,
  social_links JSONB,                -- { "github": "...", "linkedin": "..." }
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### C. `projects` — Portfolio Pieces
*Replaces the agency "projects" table. This is the core content.*

```sql
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL, -- For URL routing
  summary     TEXT,                 -- Short card description
  content     TEXT,                 -- Full case study (Markdown or HTML)
  tech_stack  TEXT[],               -- Array of technologies ['React', 'Node']
  image_url   TEXT,                 -- Thumbnail
  live_url    TEXT,                 -- Live demo
  repo_url    TEXT,                 -- GitHub link
  featured    BOOLEAN NOT NULL DEFAULT false,
  status      TEXT NOT NULL DEFAULT 'PUBLISHED'
              CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### D. `messages` — Contact Inquiries
*Replaces the "leads" table. No complex conversion logic—just communication.*

```sql
CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  subject     TEXT,
  message     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(is_read);
```

---

## 4. Backend Architecture (Express API)

### A. API Routes Overview

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | | | |
| `/api/auth/login` | POST | Public | Owner login |
| `/api/auth/logout` | POST | Private | Owner logout |
| **Public** | | | |
| `/api/profile` | GET | Public | Get bio/socials |
| `/api/projects` | GET | Public | List published projects |
| `/api/projects/:slug` | GET | Public | Get single project details |
| `/api/contact` | POST | Public | Submit a message |
| **Admin** | | | |
| `/api/admin/projects` | POST | Private | Create new project |
| `/api/admin/projects/:id` | PUT | Private | Update project |
| `/api/admin/messages` | GET | Private | List all messages |
| `/api/admin/messages/:id` | DELETE | Private | Delete message |

### B. Logic Changes

**Removed:**
*   Lead Conversion Logic (`/api/leads/:id/convert`).
*   Client Portal Authentication (Magic Links).
*   Invoice/Payment processing.

**Added:**
*   **Contact Controller:** Handles form submissions. Sends you an email/notification.
*   **Project Controller:** CRUD operations for your portfolio items.

---

## 5. Security Protocol

| Concern | Strategy | Implementation Detail |
| :--- | :--- | :--- |
| **Admin Auth** | ✅ Simple & Strong | OnKy onJser (You). `bcrypt` hash password. |
| **Spam** | ✅ Rate Limiting | Strict rate limit on `/api/contact` (3 per 15 mins). |
| **CORS** | ✅ Whitelisted | Only allow your frontend domain. |
| **Input Validation** | ✅ Zod | Ensure contact forms aren't malicious. |

---

## 6. Prioritized Development Roadmap

### Phase 1.5 — Security Hardening (🚨 IMMEDIATE)
*Same as before, but simpler.*
- [ ] **Hash Passwords:** Ensure your owner password is bcrypt hashed.
- [ ] **Middleware:** Add `helmet()` and rate limiting (specifically for the contact form to prevent spam).

### Phase 2 — Portfolio Engine (NEW PRIORITY)
*Goal: Display your work.*
- [ ] **Database:** Run migration to create `projects` and `profile` tables.
- [ ] **Backend:** Build `projectController.js`.
  - `GET /api/projects` (Public, filter by `PUBLISHED`).
  - `POST /api/admin/projects` (Protected).
- [ ] **Uploads:** Decide how to handle images (Cloudinary or local storage folder).

### Phase 3 — Frontend MVP
- [ ] Initialize Vite/React/Tailwind.
- [ ] Build `<HomePage />` (Hero + Featured Projects Grid).
- [ ] Build `<ProjectPage />` (Dynamic routing with slugs).
- [ ] Build `<ContactForm />` connected to `POST /api/contact`.

### Phase 4 — Admin Dashboard
- [ ] Build simple Login page.
- [ ] Build `<ProjectManager />` (List/Edit/Delete projects).
- [ ] Build `<Inbox />` (View messages sent via contact form).

---

## 7. Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Auth
JWT_SECRET=your-very-long-secure-secret

# Security
FRONTEND_URL=https://your-portfolio.com

# Messaging (Optional: Email or WhatsApp for contact alerts)
EMAIL_SERVICE_API_KEY=... 
```