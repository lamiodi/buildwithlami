const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../../docs/SCHEMA.md');
let content = fs.readFileSync(schemaPath, 'utf8');

// Update header
content = content.replace(
    /> \*\*Generated:\*\* 2026-07-11 \(Phase 12 — Schema audit & cleanup\)\n> \*\*Engine:\*\* PostgreSQL 14\+ \(Supabase \/ Vercel Postgres\)\n> \*\*Source of truth:\*\* `backend\/src\/sql\/` \+ `backend\/migrations\/v2_\*\.sql` … `v20_\*\.sql`/g,
    `> **Generated:** 2026-07-25 (Phase 12 — Portfolio Case Study)\n> **Engine:** PostgreSQL 14+ (Supabase / Vercel Postgres)\n> **Source of truth:** \`backend/src/sql/\` + \`backend/migrations/v2_*.sql\` … \`v28_*.sql\``
);

// Update TOC
content = content.replace(
    / {3}- \[pages\]\(#pages\)\n {3}- \[resources\]\(#resources\)\n {3}- \[testimonials\]\(#testimonials\)/g,
    '   - [resources](#resources)'
);
content = content.replace(
    /7\. \[Equipment & Industries\]\(#7-equipment--industries\)\n {3}- \[equipment\]\(#equipment\)\n {3}- \[industries\]\(#industries\)\n8\. \[Email Templates\]\(#8-email-templates\)/g,
    '7. [Email Templates](#8-email-templates)'
);

// Add dropped tables to Removed Tables section
content = content.replace(
    /\| `conversations` \| v12_cms \| v20_schema_cleanup \| The unified-inbox aggregates `messages`, `project_feedback`, and `intake_submissions` directly\. The table was never read or written\. \|/g,
    `| \`conversations\` | v12_cms | v20_schema_cleanup | The unified-inbox aggregates \`messages\`, \`project_feedback\`, and \`intake_submissions\` directly. The table was never read or written. |
| \`pages\` | v12_cms | v25_drop_cms | Replaced by hardcoded content in frontend/src/data/divisions.js |
| \`testimonials\` | v12_cms | v25_drop_cms | Replaced by hardcoded content in frontend/src/data/divisions.js |
| \`equipment\` | v12_cms | v25_drop_cms | Replaced by hardcoded content in frontend/src/data/divisions.js |
| \`industries\` | v12_cms | v25_drop_cms | Replaced by hardcoded content in frontend/src/data/divisions.js |`
);

// Remove pages, testimonials, equipment, industries definitions
content = content.replace(/### pages\n\nCMS-managed content for `\/resources`, `\/portfolio`, `\/pricing`, etc\.\n\n\| Column[\s\S]*?\*\*Indexes:\*\* `slug`, `status`\n\n/g, '');
content = content.replace(/### testimonials\n\nClient quotes shown on the home, `\/survey`, and `\/drone` pages\.\n\n\| Column[\s\S]*?\*\*Indexes:\*\* `division`, `is_featured`\n\n/g, '');
content = content.replace(/## 7\. Equipment & Industries\n\n### equipment\n\nGear shown on the `\/survey` and `\/drone` galleries\.\n\n\| Column[\s\S]*?### industries\n\nDrone verticals shown on the `\/drone` home\.\n\n\| Column[\s\S]*?\*\*Indexes:\*\* `display_order`\n\n---\n\n/g, '');

// Update client_projects (add v26 fields)
content = content.replace(
    /\| `division` \| TEXT NOT NULL DEFAULT `'SOFTWARE'` \| v5 \|\n\| `created_at` \| TIMESTAMPTZ \| \|\n\| `updated_at` \| TIMESTAMPTZ \| \|/g,
    `| \`division\` | TEXT NOT NULL DEFAULT \`'SOFTWARE'\` | v5 |
| \`cover_image\` | TEXT? | v26 |
| \`summary\` | TEXT? | v26 |
| \`location\` | TEXT? | v26 |
| \`client_name\` | TEXT? | v26 |
| \`is_portfolio\` | BOOLEAN NOT NULL DEFAULT false | v26 |
| \`display_order\` | INTEGER NOT NULL DEFAULT 0 | v26 |
| \`tags\` | TEXT[] | v26 |
| \`published_at\` | TIMESTAMPTZ? | v26 |
| \`created_at\` | TIMESTAMPTZ | |
| \`updated_at\` | TIMESTAMPTZ | |`
);

// Update projects (add v27 and v28 fields)
content = content.replace(
    /\| `division` \| TEXT NOT NULL DEFAULT `'SOFTWARE'` \| `SOFTWARE` \\\| `SURVEY` \\\| `DRONE` \(v5\) \|\n\| `created_at` \| TIMESTAMPTZ \| \|\n\| `updated_at` \| TIMESTAMPTZ \| \|\n\n\*\*Indexes:\*\* `slug`, `status`, `division`/g,
    `| \`division\` | TEXT NOT NULL DEFAULT \`'SOFTWARE'\` | \`SOFTWARE\` \\| \`SURVEY\` \\| \`DRONE\` (v5) |
| \`location\` | TEXT? | v27 |
| \`client_name\` | TEXT? | v27 |
| \`display_order\` | INTEGER NOT NULL DEFAULT 0 | v27 |
| \`tags\` | TEXT[] | v27 |
| \`published_at\` | TIMESTAMPTZ? | v27 |
| \`tagline\` | TEXT? | v28 |
| \`year\` | TEXT? | v28 |
| \`industry\` | TEXT? | v28 |
| \`status_label\` | TEXT? | v28 |
| \`duration\` | TEXT? | v28 |
| \`role\` | TEXT? | v28 |
| \`gallery\` | JSONB NOT NULL DEFAULT \`'[]'::jsonb\` | v28 |
| \`challenge\` | JSONB NOT NULL DEFAULT \`'{}'::jsonb\` | v28 |
| \`solution\` | JSONB NOT NULL DEFAULT \`'{}'::jsonb\` | v28 |
| \`results\` | JSONB NOT NULL DEFAULT \`'[]'::jsonb\` | v28 |
| \`feature_categories\` | JSONB NOT NULL DEFAULT \`'[]'::jsonb\` | v28 |
| \`flow\` | JSONB NOT NULL DEFAULT \`'[]'::jsonb\` | v28 |
| \`tech_categories\` | JSONB NOT NULL DEFAULT \`'[]'::jsonb\` | v28 |
| \`architecture\` | JSONB NOT NULL DEFAULT \`'[]'::jsonb\` | v28 |
| \`timeline\` | JSONB NOT NULL DEFAULT \`'[]'::jsonb\` | v28 |
| \`responsibilities\` | JSONB NOT NULL DEFAULT \`'[]'::jsonb\` | v28 |
| \`metrics\` | JSONB NOT NULL DEFAULT \`'{}'::jsonb\` | v28 |
| \`stats\` | JSONB NOT NULL DEFAULT \`'{}'::jsonb\` | v28 |
| \`related_slugs\` | JSONB NOT NULL DEFAULT \`'[]'::jsonb\` | v28 |
| \`meta\` | JSONB NOT NULL DEFAULT \`'{}'::jsonb\` | v28 |
| \`created_at\` | TIMESTAMPTZ | |
| \`updated_at\` | TIMESTAMPTZ | |

**Indexes:** \`slug\`, \`status\`, \`division\`, + GIN indexes for JSONB fields`
);

// Update Index Summary
content = content.replace(/\*\*Total indexes: 56\*\* \(across 22 tables, 2 partial indexes\)\./g, '**Total indexes: 68** (across 18 tables, 2 partial indexes).');
content = content.replace(/\| `pages` \| `slug`, `status` \| public CMS pages \|\n/g, '');
content = content.replace(/\| `testimonials` \| `division`, `is_featured` \| public testimonials \|\n/g, '');
content = content.replace(/\| `equipment` \| `division`, `display_order` \| public galleries \|\n/g, '');
content = content.replace(/\| `industries` \| `display_order` \| public drone home \|\n/g, '');

// Update Migration Timeline (append v21 to v28)
content = content.replace(
    /\| 19 \| `v20_schema_cleanup\.sql` \| Phase 12 \| \*\*Adds `invoices\.invoice_number` \+ `invoices\.paid_at`, creates `activity_logs` table, drops `conversations`, adds 16 performance indexes\*\*/g,
    `| 19 | \`v20_schema_cleanup.sql\` | Phase 12 | **Adds \`invoices.invoice_number\` + \`invoices.paid_at\`, creates \`activity_logs\` table, drops \`conversations\`, adds 16 performance indexes** |
| 20 | \`v21_pages_perf_index.sql\` | Phase 12 | Composite index \`(status, updated_at DESC)\` on \`pages\` |
| 21 | \`v22_normalize_admin_roles.sql\` | Phase 12 | Normalises legacy role casing |
| 22 | \`v23_jsonb_gin_indexes.sql\` | Phase 12 | GIN indexes on \`client_projects.stages\`, \`client_projects.offboarding_checklist\`, \`intake_submissions.responses\` |
| 23 | \`v24_pages_division.sql\` | Phase 12 | Adds \`division\` column to \`pages\` |
| 24 | \`v25_drop_cms.sql\` | Phase 12 | Drops \`pages\`, \`testimonials\`, \`equipment\`, \`industries\` |
| 25 | \`v26_portfolio_fields.sql\` | Phase 12 | Adds portfolio fields to \`client_projects\` |
| 26 | \`v27_portfolio_polish.sql\` | Phase 12 | Adds matching portfolio fields to \`projects\` |
| 27 | \`v28_portfolio_case_study.sql\`| Phase 12 | Adds JSONB fields for advanced case-study rendering to \`projects\` + GIN indexes`
);

// Update Verification SQL
content = content.replace(
    /SELECT \* FROM \(VALUES \('v2'\), \('v3'\), \('v4'\), \('v5'\), \('v6'\), \('v7'\),\n {21}\('v8'\), \('v9'\), \('v10'\), \('v11'\), \('v12'\), \('v13'\),\n {21}\('v14'\), \('v15'\), \('v16'\), \('v17'\), \('v18'\), \('v19'\),\n {21}\('v20'\)\) AS m\(version\)/g,
    `SELECT * FROM (VALUES ('v2'), ('v3'), ('v4'), ('v5'), ('v6'), ('v7'),
                     ('v8'), ('v9'), ('v10'), ('v11'), ('v12'), ('v13'),
                     ('v14'), ('v15'), ('v16'), ('v17'), ('v18'), ('v19'),
                     ('v20'), ('v21'), ('v22'), ('v23'), ('v24'), ('v25'),
                     ('v26'), ('v27'), ('v28')) AS m(version)`
);
content = content.replace(/-- The v20 migration should be the last applied\./g, '-- The v28 migration should be the last applied.');
content = content.replace(/-- Should return 22 tables \(no `conversations`\)\./g, '-- Should return 18 tables (no conversations, pages, testimonials, equipment, industries).');
content = content.replace(/-- Should return 56 indexes\./g, '-- Should return 68 indexes.');


fs.writeFileSync(schemaPath, content, 'utf8');
console.log('SCHEMA.md updated successfully.');
