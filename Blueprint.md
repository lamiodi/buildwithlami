

# buildwithlami.dev — Technical Blueprint v2.0 (Agency Operating System)

> **Last Updated:** May 2025
> **Status:** Phase 3 Frontend/UX Complete. **Phase 4 (Backend Environment Config & Deployment) is active priority.**

---

## 1. Executive Summary

**Project Name:** buildwithlami.dev
**Type:** Personal Portfolio & High-Performance Agency Operating System
**Stack:** React 19 (Vite) + Express.js + PostgreSQL (Supabase) + Matter.js (Visual Showcase)

### Core Mission
Provide a top-tier visual experience for visitors while acting as a robust, secure operation center for freelance agency work—handling incoming leads, client projects, dynamic intake processes, secure credentials storage, and live progress tracking.

### Interactive User Flows
1. **Public Portfolio Pipeline**:
   ```
   VISITOR → INTERACT WITH MATTER.JS STACK → VIEW DETAILED CASE STUDY → FILL INQUIRY FORM → messages TABLE
   ```
2. **Client Portal & Onboarding Pipeline**:
   ```
   LEAD SIGNED → ADMIN GENERATES CLIENT PORTAL → CLIENT ACCESSES UNIQUE TRACKING ID → COMPLETES INTAKE TEMPLATE → UPLOADS SECURE CREDENTIALS (SECRET VAULT)
   ```

---

## 2. System Architecture

### A. Tech Stack

| Layer | Technology | Status |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite (SPA) | ✅ Built & Responsive |
| **Styling** | TailwindCSS + Framer Motion | ✅ Implemented |
| **Visual Elements** | Matter.js 2D Physics Engine | ✅ Live on Tech Stack view |
| **Backend** | Node.js + Express | ✅ Built & Rate-Limited |
| **Database** | PostgreSQL (Supabase) | ✅ Migrations v2 - v8 deployed |
| **Security** | JWT (HttpOnly Cookie) + AES-CBC Secrets Encryption | ✅ Implemented |

### B. Relational Architecture Flow

```
                     ┌──────────────────┐
                     │     Clients      │
                     └─────────┬────────┘
                               │ (1 to Many)
                               ▼
                     ┌──────────────────┐
                     │ Client Projects  │◄──────────────────┐
                     └────┬─────────┬───┘                   │
                          │         │                       │
              (1 to Many) │         │ (1 to Many)           │ (Many to 1)
                          ▼         ▼                       │
       ┌──────────────────┐ ┌──────────────────┐ ┌──────────┴─────────┐
       │ Project Secrets  │ │Intake Submissions│ │  Intake Templates  │
       │ (Encrypted Vault)│ └──────────────────┘ └────────────────────┘
       └──────────────────┘
```

---

## 3. Database Schema (Agency OS Edition)

### A. Core Portfolio & Messaging

#### `users` — Owner Admin Profile
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

#### `profile` — Public Bio & Socials
```sql
CREATE TABLE IF NOT EXISTS profile (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name    TEXT NOT NULL,
  headline     TEXT,
  bio          TEXT,
  resume_url   TEXT,
  avatar_url   TEXT,
  social_links JSONB,                -- { "github": "...", "linkedin": "..." }
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `projects` — Portfolio Pieces
```sql
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL, -- Card Routing
  summary     TEXT,
  content     TEXT,                 -- Case Study (Markdown)
  tech_stack  TEXT[],
  image_url   TEXT,
  live_url    TEXT,
  repo_url    TEXT,
  featured    BOOLEAN NOT NULL DEFAULT false,
  status      TEXT NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `messages` — Portfolio Inquiry Contact
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
```

### B. Client Portals & Project Tracking

#### `clients` — Client Accounts
```sql
CREATE TABLE IF NOT EXISTS clients (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  primary_contact_email TEXT NOT NULL,
  billing_email         TEXT,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `client_projects` — Client Operating Portals
```sql
CREATE TABLE IF NOT EXISTS client_projects (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id              UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_name           TEXT NOT NULL,
  tracking_id            TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  progress               INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status                 TEXT NOT NULL DEFAULT 'PLANNING' CHECK (status IN ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED')),
  domain_name            TEXT,
  domain_expiration      DATE,
  amount_due             NUMERIC(10, 2) DEFAULT 0.00,
  payment_type           TEXT DEFAULT 'ONE_TIME' CHECK (payment_type IN ('ONE_TIME', 'MONTHLY')),
  monthly_fee            NUMERIC(10, 2) DEFAULT 0.00,
  intake_form_id         UUID REFERENCES intake_templates(id) ON DELETE SET NULL,
  intake_completed       BOOLEAN NOT NULL DEFAULT false,
  assets_url             TEXT,
  training_video_url     TEXT,
  maintenance_plan_url   TEXT,
  notes                  TEXT,
  stages                 JSONB DEFAULT '[
      {"name": "Discovery & Planning", "status": "PENDING"},
      {"name": "Design & Mockups", "status": "PENDING"},
      {"name": "Development", "status": "PENDING"},
      {"name": "Testing & Revisions", "status": "PENDING"},
      {"name": "Launch", "status": "PENDING"}
  ]'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### C. Dynamic Intake & Credential Vault

#### `intake_templates` — Flexible Form Builder Blueprints
```sql
CREATE TABLE IF NOT EXISTS intake_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  schema      JSONB NOT NULL DEFAULT '[]'::jsonb, -- Fields array: {id, type, label, required, options}
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `intake_submissions` — Intake Form Client Responses
```sql
CREATE TABLE IF NOT EXISTS intake_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  responses    JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `project_secrets` — Encrypted Client Vault
```sql
CREATE TABLE IF NOT EXISTS project_secrets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  key_name        TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  iv              TEXT NOT NULL, -- AES Initialization Vector
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 4. Security & Cryptographic Protocols

| Feature | Protocol | Details |
| :--- | :--- | :--- |
| **Authentication** | JWT Validation | Stored via secure client cookies validating the `OWNER` role. |
| **Spam Hardening** | Express Rate Limiters | Submissions to `/api/contact` limited to 10/hour to prevent spamming. |
| **Credential Storage** | AES-256-CBC | Values inside `project_secrets` are dynamically encrypted/decrypted on transit with a 32-character `ENCRYPTION_KEY` and unique Initialization Vectors (IV). |
| **XSS Defense** | DOMPurify | Sanitizes input data in Markdown parser and intake submissions. |

---

## 5. Development Roadmap

### Phase 2.5 — Platform Configuration & Integration Verification (🚨 ACTIVE)
- [ ] **Database Connection**: Link the backend with live Supabase configurations.
- [ ] **Admin Seeding**: Seed initial admin credentials through `npm run db:seed`.
- [ ] **Notifications Integration**: Setup live alerts (via WhatsApp/Twilio or standard SMTP/Nodemailer).

### Phase 3 — Onboarding & Offboarding Features (✅ COMPLETE)
- [x] Connect client dashboard to display static training videos and maintenance assets.
- [x] Validate responsive layouts in `ClientIntakeForm.jsx` and client credentials vault forms.
- [x] Implement passwordless client portal access.
- [x] Merge credential vaults into one unified secure section.

---

## 6. Environment Configurations (`backend/.env`)

```env
# Database Credentials
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

# JWT Configurations
JWT_SECRET=your-very-long-secure-secret-key
JWT_EXPIRES_IN=7d

# Cryptographic Keys
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef

# WhatsApp Cloud API Integrations
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=000000000000000
WHATSAPP_ACCESS_TOKEN=EAAG...
ADMIN_WHATSAPP_PHONE=2348012345678

# Seed Credentials
ADMIN_EMAIL=admin@devagency.os
ADMIN_PASSWORD=ChangeMe123!

# Whitelists & CORS
FRONTEND_URL=http://localhost:3000
```
