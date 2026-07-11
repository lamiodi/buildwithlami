# Content Ownership — BuildWithLami

> Who writes what, where it lives, and how to keep it consistent.
> Add your name when you start writing; remove it when you stop.

## Pages & sections (frontend)

| Section | Owner | File / Route | Update cadence |
|---|---|---|---|
| Hero (HomePage) | Eugene (CEO) | `frontend/src/components/Hero.jsx` | Quarterly |
| About | Eugene | `frontend/src/pages/AboutPage.jsx` | Yearly |
| Services | Eugene | `frontend/src/pages/ServicesPage.jsx` | When offerings change |
| Pricing | Eugene | `frontend/src/pages/PricingPage.jsx` | When pricing changes |
| Portfolio | Eugene | `frontend/src/pages/PortfolioPage.jsx` | When projects ship |
| SaaS Products | Eugene | `frontend/src/components/SaaSProducts.jsx` | When products launch |
| Why Choose | Eugene | `frontend/src/components/WhyChoose.jsx` | Yearly |
| Testimonials (public) | Eugene | `frontend/src/components/Testimonials.jsx` (reads from CMS) | When a client signs off on a quote |
| FAQ | Eugene | `frontend/src/components/FAQ.jsx` | When a question is asked 3+ times |
| Contact | Eugene | `frontend/src/pages/ContactPage.jsx` | Rarely |
| Resources (blog) | Eugene + future content writer | `frontend/src/pages/ResourcesPage.jsx` (reads from CMS) | Monthly |
| Survey home | Eugene | `frontend/src/pages/survey/SurveyHomePage.jsx` | Yearly |
| Drone home | Eugene | `frontend/src/pages/drone/DroneHomePage.jsx` | Yearly |

## Admin-managed content (CMS)

The CMS is in [AdminCMS](../frontend/src/pages/admin/AdminCMS.jsx) and friends. These can be edited without a code deploy:

| Section | Owner | Where to edit | Notes |
|---|---|---|---|
| Pages (`pages` table) | Eugene | Admin → CMS Pages | Slug-based URLs. Status `DRAFT` is invisible to the public. |
| Testimonials | Eugene | Admin → Testimonials | `featured=true` to surface on the homepage. |
| Equipment (survey gear) | Eugene | Admin → Equipment | Division-tagged (SURVEY / DRONE). |
| Industries | Eugene | Admin → Industries | Used by the Drone industry-filter. |
| Email templates | Eugene | Admin → Email Templates | `{{placeholder}}` syntax. Missing keys are left visible (intentional). |
| FX rates | Eugene | Admin → Settings → FX Rates | Update when NGN moves more than 5%. |

## Blog / case studies (Resources)

When you publish a new resource, it appears on `/resources`. The
**Resources** page is a CMS page (slug: `resources`) — to add a new
blog-style article, you'd need to add a `resources_articles` table
in a future migration. For now, Resources is a single CMS page with
hardcoded content.

## Tone of voice

- **Direct.** Short sentences. No marketing fluff.
- **Specific.** "$500 for a 5-page brochure site" beats
  "affordable pricing".
- **Honest.** Don't oversell. If something isn't built yet, say so.
- **First person.** "I build…" not "we build…" (you're a solo
  founder, lean into it).

## Brand assets

- **Accent color:** `#E94E1B` (orange-red). Defined as `accent` in Tailwind config.
- **Logo:** stored in `frontend/public/`. Don't regenerate unless you're rebranding.
- **Fonts:** `font-heading` (display) and `font-body` (body) — both Google Fonts. Don't swap without re-running the typography review.

## What NOT to do

- Don't add new sections to the homepage without updating [ROADMAP.md](../ROADMAP.md) and the Order in `HomePage.jsx`.
- Don't delete a CMS page that's referenced by an internal link — soft-archive it (`status='ARCHIVED'`) instead.
- Don't change the `currency` of an existing invoice. Cancel + recreate.
- Don't rotate `JWT_SECRET` during business hours — every user gets logged out.
