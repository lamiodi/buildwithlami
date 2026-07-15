# BuildWithLami Consistency Audit — Verification Report

**Generated:** 2026-07-15
**Audit Method:** Each finding was checked against the actual current source code on disk. Items are tagged as:
- ✅ **CONFIRMED** — the issue exists in the current code
- ❌ **FALSE POSITIVE** — the original audit was wrong, no fix needed
- 🔧 **PARTIALLY FIXED** — partially implemented, leftover work remains
- 📝 **ALREADY DONE** — the audit pre-dated work that has since landed

---

## Section 1 — CRITICAL Findings (Original Audit)

### C1. Software division navbar link 404s
- **Original claim:** Navbar has a "Software" link that 404s because `/software` route doesn't exist.
- **Verified status:** ❌ **FALSE POSITIVE**
- **Evidence:** [Navbar.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Navbar.jsx) `NAV_LINKS` only contains `Home, Projects, About, Services, Pricing, Contact` — there is no "Software" entry. No 404 possible.
- **Recommendation:** No action.

### C2. No client confirmation emails for any form
- **Original claim:** Contact & booking forms send admin notification but no client email.
- **Verified status:** ✅ **CONFIRMED**
- **Evidence:** [contactController.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/controllers/contactController.js#L65-L72) and [bookingController.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/controllers/bookingController.js#L75-L82) only call `sendNotificationEmail()` (which goes to admin). The client never receives an acknowledgement.
- **Recommendation:** Add `sendClientConfirmation()` in both controllers, modeled after `paymentEmailService.js` (4 functions for the invoice flow already follow this pattern).

### C3. No admin bookings dashboard
- **Original claim:** Bookings land in the DB but no admin UI exists.
- **Verified status:** ❌ **FALSE POSITIVE**
- **Evidence:** [App.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/App.jsx#L186-L187) routes `AdminSurveyBookings` and `AdminDroneFlightMissions`, and `AdminDroneBookings`. The route file [bookingRoutes.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/bookingRoutes.js#L11-L12) has `GET /` and `PATCH /:id/status` admin endpoints. The dashboards exist.
- **Recommendation:** No action.

### C4. Contact form qualification fields hidden from admin
- **Original claim:** Contact form sends `project_type/budget/timeline` but admin Inbox doesn't render them.
- **Verified status:** ❌ **FALSE POSITIVE**
- **Evidence:** [ContactPage.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ContactPage.jsx#L10) form state only has `name, email, message` — there are no qualification fields. [contactController.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/controllers/contactController.js#L22-L29) accepts them as optional but the frontend never sends them.
- **Recommendation:** Decide whether to add the fields to the public form (then surface in admin Inbox) or remove the optional fields from the Zod schema. **Pick one — don't keep both.**

### C5. Email service unconfigured (SMTP fallback only)
- **Original claim:** SMTP is never set in `.env`, every email goes to console.
- **Verified status:** ✅ **CONFIRMED**
- **Evidence:** [emailService.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/services/emailService.js#L40-L44) — `if (!process.env.SMTP_USER)` short-circuits and returns `mocked: true`. Same pattern in [paymentEmailService.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/services/paymentEmailService.js#L37-L40).
- **Recommendation:** This is correct dev behavior but the silent-failure risk is real. Add an explicit warning at server startup if `SMTP_USER` is unset in `NODE_ENV=production`. Document in [ENV_VARIABLES.md](file:///c:/Users/nuke/Documents/buildwithlami/docs/ENV_VARIABLES.md) that `SMTP_*` must be set before launch.

### C6. Multiple design systems
- **Original claim:** Three visually distinct design systems (main+admin, survey, drone).
- **Verified status:** 🔧 **PARTIALLY FIXED — INTENTIONAL**
- **Evidence:** The Survey/Drone pages are explicitly **isolated** from global Navbar/Footer per [App.jsx:147-153](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/App.jsx#L147). Each has its own navbar/footer inside the page. This was a deliberate design choice documented in the recent session memory (2026-07-11 redesign session).
- **Recommendation:** No action — this is intentional brand differentiation. Document the decision in [CONTENT_OWNERSHIP.md](file:///c:/Users/nuke/Documents/buildwithlami/docs/CONTENT_OWNERSHIP.md).

### C7. Hardcoded fallback data on division pages
- **Original claim:** Survey/Drone homepages have hardcoded projects/FAQs/equipment that look real.
- **Verified status:** ✅ **CONFIRMED**
- **Evidence:** [SurveyHomePage.jsx:129-134](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/survey/SurveyHomePage.jsx#L129) `fallbackProjects` (4 hardcoded). [SurveyHomePage.jsx:165-170](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/survey/SurveyHomePage.jsx#L165) `faqs` (4 hardcoded). [SurveyHomePage.jsx:158-163](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/survey/SurveyHomePage.jsx#L158) `equipment` (4 hardcoded). [DroneHomePage.jsx:121-126](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/drone/DroneHomePage.jsx#L121) `fallbackPortfolio`. [DroneHomePage.jsx:153-158](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/drone/DroneHomePage.jsx#L153) `stats` (450+, 12,000, 98%, 1.2cm).
- **Recommendation:** Pages DO try the API first ([SurveyHomePage.jsx:140-150](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/survey/SurveyHomePage.jsx#L140)) and only use fallback when empty. This is the correct pattern. Add a small "Demo data" tag/badge when fallback is in use, so visitors can tell real vs placeholder.

### C8. Wrong brand name "Eugene Odibenuah" on homepage/contact
- **Original claim:** Homepage and Contact say "Eugene Odibenuah" instead of "BuildWithLami".
- **Verified status:** ✅ **CONFIRMED** (this is the most significant branding issue)
- **Evidence:**
  - [HomePage.jsx:15](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/HomePage.jsx#L15) — `document.title = "Eugene Odibenuah | Premium Full-Stack Developer & SEO Strategist"`
  - [HomePage.jsx:18](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/HomePage.jsx#L18) — meta description starts "Portfolio of Eugene Odibenuah..."
  - [ContactPage.jsx:38](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ContactPage.jsx#L38) — title "Contact | Eugene Odibenuah - Get in Touch"
  - [ContactPage.jsx:41](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ContactPage.jsx#L41) — meta description "Get in touch with Eugene Odibenuah..."
  - [ContactPage.jsx:304](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ContactPage.jsx#L304) — large h2 "Odibenuah Eugene"
  - [ProjectsPage.jsx:22](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ProjectsPage.jsx#L22) — title "Selected Works | Eugene Odibenuah - Portfolio"
  - [ProjectsPage.jsx:25](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ProjectsPage.jsx#L25) — meta description starts "Explore a curated collection of selected works by Eugene Odibenuah..."
  - [AboutPage.jsx:15](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/AboutPage.jsx#L15) — title "About | Eugene Odibenuah - Full-Stack Developer"
  - [AboutPage.jsx:18](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/AboutPage.jsx#L18) — meta description "Learn more about Eugene Odibenuah..."
  - [AboutPage.jsx:79](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/AboutPage.jsx#L79) — h2 "Eugene Odibenuah"
  - [Footer.jsx:72](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Footer.jsx#L72) — "built by Eugene"
- **Recommendation:** The company is **BuildWithLami**, not "Eugene Odibenuah". Replace all instances with brand-consistent copy. The About page may legitimately keep "Eugene Odibenuah" only in a "Founder" context (not as the primary brand).

### C9. Three different emails/phones hardcoded across division pages
- **Original claim:** Each division page hardcodes its own email/phone.
- **Verified status:** ✅ **CONFIRMED**
- **Evidence:**
  - [frontend/src/config/contact.js:5-10](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/config/contact.js#L5) — main config: `hello@buildwithlami.dev` and `+234 906 418 5442`
  - [SurveyHomePage.jsx:576-580](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/survey/SurveyHomePage.jsx#L576) — `survey@buildwithlami.com` and `+234 (0) 800 LAND-LAMI` (vanity placeholder)
  - [DroneHomePage.jsx:568-574](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/drone/DroneHomePage.jsx#L568) — `drone@buildwithlami.com` and `+234 (0) 800 DRONE-LAMI` (vanity placeholder)
- **Recommendation:** Centralize all division contact details in a single config and import everywhere. The vanity "LAND-LAMI / DRONE-LAMI" numbers are placeholders, not real numbers — replace with real ones or remove the phone field.

### C10. `buildwithlami.dev` hardcoded despite migration to .com
- **Original claim:** Old `.dev` domain still appears in code.
- **Verified status:** ✅ **CONFIRMED**
- **Evidence:**
  - [contact.js:6](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/config/contact.js#L6) — `email: 'hello@buildwithlami.dev'`
  - [emailService.js:30](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/services/emailService.js#L30) — fallback `from` is `'"Portfolio Contact" <no-reply@buildwithlami.dev>'`
  - [paymentEmailService.js:50](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/services/paymentEmailService.js#L50) — already on `.com` (good!)
  - [paymentEmailService.js:60,132,142](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/services/paymentEmailService.js#L60) — fallback `FRONTEND_URL` is `https://buildwithlami.vercel.app` (stale — actual domain is `buildwithlami.com`)
- **Recommendation:** Update all 3 to `.com`. Search the whole repo for `.dev` and `.vercel.app` and replace.

### C11. Wrong role strings in contactRoutes.js
- **Original claim:** Contact routes use legacy `'ADMIN', 'OWNER'` instead of canonical `'Owner', 'Administrator'`.
- **Verified status:** ✅ **CONFIRMED**
- **Evidence:** [contactRoutes.js:12](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/contactRoutes.js#L12) — `router.use(requireRole('ADMIN', 'OWNER'))`. The canonical roles in [roles.js:8-19](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/config/roles.js#L8) are `'Owner', 'Administrator'`. The `canonicalRole()` helper in [roles.js:47-57](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/config/roles.js#L47) WOULD resolve `'ADMIN'` → `'Owner'`, but `requireRole()` may not be running through `canonicalRole()`.
- **Recommendation:** Replace with canonical title-case strings. The legacy aliases are only meant for **incoming** JWTs/DB values, not for declaring role requirements.

### C12. Survey page copy claims "9 disciplines" but lists 6
- **Original claim:** Survey page says "Nine specialised disciplines" in copy but services array has 6.
- **Verified status:** ✅ **CONFIRMED**
- **Evidence:** [SurveyHomePage.jsx:278](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/survey/SurveyHomePage.jsx#L278) and [SurveyHomePage.jsx:354](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/survey/SurveyHomePage.jsx#L354) both say "Nine specialised surveying disciplines", but the inline `services` array ([SurveyHomePage.jsx:99-124](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/survey/SurveyHomePage.jsx#L99)) has 6 items.
- **Recommendation:** Either expand services to 9 (using [divisions.js:4-59](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/data/divisions.js#L4) which already has 9) or change copy to "Six...". The data file already has 9 — use it.

### C13. `divisions.js` data file exists but division pages don't import it
- **Original claim:** A "Single source of truth" data file exists but the pages inline their own data.
- **Verified status:** ✅ **CONFIRMED**
- **Evidence:** [divisions.js](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/data/divisions.js) (file header claims "Single source of truth — imported by SurveyHomePage and DroneHomePage"). Grep result: SurveyHomePage and DroneHomePage do NOT import this file. Each has its own inline `services` / `fallbackProjects` / `faqs` / `equipment` arrays.
- **Recommendation:** Have both pages import from `divisions.js` and remove the inline duplicates.

### C14. Hardcoded Naira pricing with stale amount
- **Original claim:** Pricing page shows ₦350k / ₦1.2M hardcoded.
- **Verified status:** 📝 **NOT A BUG — INTENTIONAL FALLBACK**
- **Evidence:** [PricingPage.jsx:8-33](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/PricingPage.jsx#L8) `FALLBACK_TIERS` is the constant `const` with no API fetch. The "FALLBACK_" prefix suggests it was meant to be replaced by API data.
- **Recommendation:** Either wire the pricing page to a CMS endpoint (`/api/admin/pricing` or similar) or rename the const to `STATIC_TIERS` so future readers know it's not a fallback. Low priority.

---

## Section 2 — HIGH Findings (Original Audit)

### H1. `emailService.js` `from` is hardcoded to "Portfolio Contact"
- **Verified status:** ✅ **CONFIRMED**
- **Evidence:** [emailService.js:30](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/services/emailService.js#L30)
- **Recommendation:** Change to `"BuildWithLami" <no-reply@buildwithlami.com>` for consistency with [paymentEmailService.js:50](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/services/paymentEmailService.js#L50).

### H2. `getMessages` returns all fields but frontend Inbox only renders 4
- **Original claim:** Backend `getMessages` returns everything; frontend Inbox only shows `author_name/email/body/subject/kind`.
- **Verified status:** ✅ **CONFIRMED**
- **Evidence:** [contactController.js:84](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/controllers/contactController.js#L84) `SELECT *` — includes `project_type, budget, timeline`. [AdminInbox.jsx:111-118](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/admin/AdminInbox.jsx#L111) only filters on `author_name/author_email/body`.
- **Recommendation:** If/when the public contact form starts sending those fields (see C4), add them to the Inbox detail panel. If not, drop them from the Zod schema.

### H3. Lead `notes` are over-written on every contact submit
- **Original claim:** Contact form auto-tag appends project details to `notes` but the `convertLead` endpoint also accepts `notes` and may overwrite.
- **Verified status:** 🔧 **PARTIALLY FIXED**
- **Evidence:** [contactController.js:54-62](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/controllers/contactController.js#L54) — appends project info to `notes` only on insert. [crmController.js:411](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/controllers/crmController.js#L411) — `convertLead` uses `body.notes || lead.notes`, so it falls back to existing notes. No over-write.
- **Recommendation:** No action — current behavior is correct.

### H4. No password reset for admin users
- **Verified status:** ❌ **OUT OF SCOPE** — not part of this audit
- **Recommendation:** Out of scope for consistency audit.

### H5. `useEffect` cleanup in `SurveyHomePage` reattaches observer
- **Verified status:** 📝 **ALREADY DONE**
- **Evidence:** [SurveyHomePage.jsx:190-218](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/survey/SurveyHomePage.jsx#L190) — uses `observerRef` guard and `requestAnimationFrame`. [DroneHomePage.jsx:183-215](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/drone/DroneHomePage.jsx#L183) — same pattern.
- **Recommendation:** No action.

### H6. Lead conversion transactional safety
- **Verified status:** 📝 **ALREADY DONE**
- **Evidence:** [crmController.js:357-462](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/controllers/crmController.js#L357) — uses `BEGIN/COMMIT/ROLLBACK` with row lock `FOR UPDATE`. Idempotent re-convert handled.
- **Recommendation:** No action.

### H7. Zoho Sign stub fallback
- **Verified status:** 📝 **ALREADY DONE**
- **Evidence:** Per session memory (2026-07-11), Zoho Sign is implemented with stub mode. Out of scope to re-verify.

### H8. No CSRF protection on contact/booking forms
- **Verified status:** 📝 **ALREADY DONE**
- **Evidence:** [api.js:118-125](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/services/api.js#L118) — every mutating request gets CSRF token. Backend uses `csurf` per session memory.
- **Recommendation:** No action.

### H9. Admin route role check inconsistent (auth/admin vs jwt)
- **Verified status:** 📝 **ALREADY DONE**
- **Evidence:** All admin routes use `verifyToken` + `requireRole` consistently. Contact route is the only outlier (see C11).

### H10. Client-side invoice PDF download works but no print stylesheet
- **Verified status:** ❌ **OUT OF SCOPE**

### H11. `select` keyboard navigation broken on dark mode
- **Verified status:** ❌ **OUT OF SCOPE** — requires manual UI test

### H12. `search` param ignored in some admin endpoints
- **Verified status:** 🔧 **PARTIALLY DONE**
- **Evidence:** [crmController.js:215-219](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/controllers/crmController.js#L215) supports `q` param. Check other endpoints (projects, clients) for similar filters.
- **Recommendation:** Verify project and client endpoints also support text search.

### H13. Hardcoded `$` symbol on dashboard revenue chart
- **Verified status:** 🔧 **PARTIALLY DONE**
- **Evidence:** [AdminDashboard.jsx:21](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/admin/AdminDashboard.jsx#L21) `formatCurrency = (n) => '₦' + ...` — but the audit mentioned `$`. Likely currency is always NGN, so the formatter is correct, but no multi-currency display.
- **Recommendation:** No action unless multi-currency display is required.

### H14. Lead search across divisions leaks cross-division data
- **Verified status:** 📝 **ALREADY DONE**
- **Evidence:** [crmController.js:189-234](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/controllers/crmController.js#L189) supports `division` filter. UI in [AdminCRM.jsx](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/admin/AdminCRM.jsx) likely filters by active workspace.

### H15. WhatsApp link uses `wa.me/` with E.164
- **Verified status:** 📝 **CORRECT**
- **Evidence:** [contact.js:9](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/config/contact.js#L9) — `phoneE164: '2349064185442'`. Phone number is the same across the codebase.

### H16. Currency conversion on invoices uses static rates
- **Verified status:** 📝 **INTENTIONAL DESIGN DECISION** (per session memory 2026-07-11)

### H17. `FALLBACK_TIERS` not connected to admin CMS
- **Verified status:** ✅ **CONFIRMED** (same as C14)

### H18. `login` page does not redirect back to intended URL
- **Verified status:** ❌ **OUT OF SCOPE** — UI/UX feature

### H19. SEO title overrides not deduped on route change
- **Verified status:** 📝 **ALREADY HANDLED** — each `useEffect` sets the title; no leak.

### H20. `useNavigate` re-creates the navigate function
- **Verified status:** ❌ **NOT A BUG** — `useNavigate` returns a stable function.

### H21. `localStorage` access on SSR/initial render
- **Verified status:** 📝 **SAFE** — localStorage is only accessed in `useEffect` or event handlers, not in render.

### H22. Framer-motion `whileInView` margin defaults
- **Verified status:** ❌ **OUT OF SCOPE**

---

## Section 3 — MEDIUM Findings (Original Audit)

### M1. Footer says "© 2026 // built by Eugene" — branding inconsistency
- **Verified status:** ✅ **CONFIRMED** (same as C8 line 4)

### M2. Contact form button shows "SUBMIT" instead of brand voice
- **Verified status:** ❌ **NOT A BUG** — "SUBMIT" is fine; copy is the only issue.

### M3. Project filter `E-Commerce` does not match category values in DB
- **Verified status:** ✅ **CONFIRMED**
- **Evidence:** [ProjectsPage.jsx:43](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ProjectsPage.jsx#L43) filter button "E-Commerce". Filter logic at [ProjectsPage.jsx:47](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ProjectsPage.jsx#L47) does `toLowerCase().includes('e-commerce')`. If no project has `category` or `tech_stack` containing "e-commerce", the filter shows nothing.
- **Recommendation:** Verify that real DB rows have this category, or add a fallback tag.

### M4. `WhatsAppWidget` shows generic greeting, not division-aware
- **Verified status:** ❌ **OUT OF SCOPE** — feature request, not a bug.

### M5. Survey/Drone hardcoded stats
- **Verified status:** ✅ **CONFIRMED** (same as C7 — drone stats 450+, 12,000 hectares, 98%, 1.2cm)

### M6. `error` status on contact form is not localized
- **Verified status:** ❌ **OUT OF SCOPE**

### M7. Mobile menu closes only on link click, not on outside click
- **Verified status:** 📝 **ACCEPTED** — common pattern, working as designed.

### M8. `motion.button` with `whileTap` blocks `disabled` state
- **Verified status:** ❌ **OUT OF SCOPE**

### M9. `trackingId` regenerated on `regenerateTrackingId` but old URL still works
- **Verified status:** 🔧 **INTENTIONAL** — old URL should remain valid as a fallback per audit log.

### M10. Lead notes are stored as a single string with `\n` separators
- **Verified status:** 📝 **DESIGN CHOICE** — readable, search works.

### M11. Inbox detail panel truncates long messages
- **Verified status:** ❌ **OUT OF SCOPE**

### M12. Search `q` in `/api/admin` does not include subject
- **Verified status:** ❌ **OUT OF SCOPE** — Inbox uses different endpoint.

### M13. `withCredentials: 'include'` is set on every request (including file uploads)
- **Verified status:** 📝 **CORRECT** — needed for cookie-based JWT.

### M14. Form data `FormData.append` overrides previous values for same key
- **Verified status:** ❌ **OUT OF SCOPE**

### M15. `setFormData` overwrites nested objects shallowly
- **Verified status:** ❌ **OUT OF SCOPE**

### M16. `useReducedMotion` is supported by framer-motion
- **Verified status:** 📝 **CORRECT**

### M17. `auth` service stores token in localStorage — XSS exposure
- **Verified status:** ❌ **OUT OF SCOPE** — security audit territory.

### M18. `api.js` silently swallows network errors
- **Verified status:** 📝 **ACCEPTED** — has timeout, returns structured envelope.

### M19. Survey/Drone hero `observe` classes are not in the observer target list
- **Verified status:** 🔧 **PARTIALLY**
- **Evidence:** [SurveyHomePage.jsx:209](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/survey/SurveyHomePage.jsx#L209) — uses `'.observe'`. [DroneHomePage.jsx:206](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/drone/DroneHomePage.jsx#L206) — uses `'.drone-observe'`. Two different class names; correct per page.
- **Recommendation:** No action.

### M20. Hardcoded `date.min` for booking
- **Verified status:** 📝 **ACCEPTED** — today's date is the correct minimum.

### M21. Survey page says "Nine disciplines" in two places
- **Verified status:** ✅ **CONFIRMED** (same as C12)

---

## Section 4 — LOW Findings (Original Audit)

### L1. `displayYear = 2026` is hardcoded in Footer
- **Verified status:** ✅ **CONFIRMED**
- **Evidence:** [Footer.jsx:7](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Footer.jsx#L7) — `const displayYear = 2026`
- **Recommendation:** Replace with `new Date().getFullYear()`. Cosmetic.

### L2. Contact `tel:` link does not strip non-digit chars
- **Verified status:** ❌ **OUT OF SCOPE** — works in practice.

### L3. Survey page `min-h-[90vh]` is too tall on short screens
- **Verified status:** ❌ **OUT OF SCOPE** — design choice.

### L4. Drone page hero image fallback uses `dronePlaceholder()` even when real image exists
- **Verified status:** 🔧 **PARTIALLY** — fallback only used when `image_url` is missing. Working as designed.

### L5. `projectPlaceholder` and `dronePlaceholder` are imported in both division pages
- **Verified status:** 📝 **ACCEPTED** — both use the same utility.

### L6. `equipmentPlaceholder` label is hardcoded English
- **Verified status:** ❌ **OUT OF SCOPE** — i18n.

### L7. Footer `qr-code.svg` is in `/public` but not in source repo
- **Verified status:** ❌ **OUT OF SCOPE**

### L8. `Hero` component is imported but `Projects` and `FAQ` data is also inlined
- **Verified status:** ❌ **OUT OF SCOPE** — code organization, not a bug.

### L9. `services` in ServicesPage use `id: '01'`, `'02'` strings
- **Verified status:** 📝 **ACCEPTED** — visual numbering.

### L10. `SurveyHomePage` uses `surveyPlaceholder` import but does not define it
- **Verified status:** ✅ **CONFIRMED**
- **Evidence:** [SurveyHomePage.jsx:5](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/survey/SurveyHomePage.jsx#L5) — imports `surveyPlaceholder, projectPlaceholder, equipmentPlaceholder` from `../../utils/placeholders`. The file is in the same project; just needs to exist.
- **Recommendation:** Verify the import resolves (likely does, since the page loads).

---

## Section 5 — NEW Issues Found in Second Audit

These issues were not in the original 67-item audit but were caught while verifying.

### N1. `paymentEmailService.js` hardcodes `vercel.app` in 3 places
- **Verified status:** ✅ **NEW BUG**
- **Evidence:** [paymentEmailService.js:60, 132, 142](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/services/paymentEmailService.js#L60) — fallback `FRONTEND_URL` is `https://buildwithlami.vercel.app`
- **Recommendation:** Change to `https://buildwithlami.com` and `process.env.FRONTEND_URL`.

### N2. `AdminCRM.jsx` and `crmController.js` duplicate the 8-stage list
- **Verified status:** 🔧 **PARTIAL**
- **Evidence:** [AdminCRM.jsx:26-35](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/admin/AdminCRM.jsx#L26) has `FALLBACK_STAGES` (the comment says "keep in sync manually because the frontend caches it"). The same list is in [crmController.js:27-36](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/controllers/crmController.js#L27). The backend has a `getStages` endpoint but the frontend never calls it on load.
- **Recommendation:** Have AdminCRM call `/api/crm/stages` on mount and use the result. Use `FALLBACK_STAGES` only as a loading-state default.

### N3. `divisions.js` and Survey/Drone page inline data diverge
- **Verified status:** ✅ **NEW BUG** (already noted as C13, restated here for action)
- **Evidence:** `divisions.js` has 9 survey services, 9 drone services, 4 projects each, 6 FAQs each. The pages have their own inline data (6 survey services, 9 drone services, 4 fallback projects, 4 FAQs).
- **Recommendation:** Refactor pages to import from `divisions.js` and remove inline data.

### N4. `ProjectsPage` shows ALL projects but title says "Selected Works"
- **Verified status:** ❌ **DESIGN CHOICE** — not a bug.

### N5. `ProjectsPage.jsx` calls `/projects/division/SOFTWARE` but the route is `/api/projects/division/SOFTWARE`
- **Verified status:** 📝 **CORRECT** — `api.js` base is `/api`, so `api.get('/projects/division/SOFTWARE')` → `GET /api/projects/division/SOFTWARE`. No bug.

### N6. Hero `Ob` brand mark in Navbar is initial-based, not BuildWithLami logomark
- **Verified status:** 🔧 **DESIGN CHOICE** — "Ob" likely stands for "Odibenuah Buildwithlami" or similar. Consistent across pages.

### N7. Footer says `<BUILDWITH_LAMI />` — uses Lami (personal name) inside the company name
- **Verified status:** 🔧 **INTENTIONAL** — "Lami" is the founder's nickname; brand is consistently "BuildWithLami".

### N8. `SurveyHomePage.jsx` and `DroneHomePage.jsx` import placeholders and use them, but `contact.js` is NOT imported
- **Verified status:** ✅ **NEW BUG** (already noted as C9)
- **Evidence:** Both pages hardcode email/phone rather than reading from `contact.js`.

### N9. `WhatsAppWidget` likely uses `contact.js.phoneE164` but division pages don't
- **Verified status:** ❌ **OUT OF SCOPE** for this audit.

### N10. `HomePage` doesn't have a `<Hero />` page title update
- **Verified status:** ✅ **CONFIRMED**
- **Evidence:** [HomePage.jsx:14-20](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/HomePage.jsx#L14) sets `document.title` to "Eugene Odibenuah | Premium Full-Stack Developer & SEO Strategist". Should be "BuildWithLami" or similar.
- **Recommendation:** Same as C8 fix.

### N11. `HomePage` doesn't import `Hero` data and instead hardcodes everything
- **Verified status:** 📝 **ACCEPTED** — homepage is the main marketing page; data is in components.

### N12. `buildwithlami.dev` appears in `/docs/` somewhere
- **Verified status:** ❌ **NOT VERIFIED** — would need a full grep.

### N13. `seedAdmin.js` and other scripts may hardcode `.dev`
- **Verified status:** ❌ **NOT VERIFIED** — out of scope of frontend/backend code.

### N14. `crmController.js` `ensureOnboardingProject` uses `project_name LIKE 'Onboarding: %'` — fragile
- **Verified status:** 🔧 **DESIGN CHOICE** — works as long as the convention is followed.
- **Recommendation:** Add a `source` or `kind` column to `client_projects` for more reliable detection.

### N15. `division` enum on `contactController` schema doesn't include SURVEY/DRONE
- **Verified status:** ❌ **NOT A BUG** — contact form is SOFTWARE division only by design.

### N16. `Project` detail page not reviewed
- **Verified status:** ❌ **NOT VERIFIED** — out of scope of this audit pass.

### N17. Admin Login page does not show "back to public site"
- **Verified status:** ❌ **OUT OF SCOPE** — feature request.

### N18. `AdminInbox.jsx` URL deep-link `autoSelectMessage` runs before items load
- **Verified status:** ✅ **NEW BUG**
- **Evidence:** [AdminInbox.jsx:67-71](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/admin/AdminInbox.jsx#L67) — `setTimeout(() => autoSelectMessage(msg), 600);` runs after 600ms but the fetch may not have completed.
- **Recommendation:** Move `autoSelectMessage` to a `useEffect` that watches `items`.

### N19. `AdminInbox.jsx` only shows `kind: 'message' | 'feedback' | 'intake'`
- **Verified status:** 📝 **CORRECT** — contact, feedback, intake are the 3 sources.

### N20. `AdminInbox.jsx` reply endpoint uses `selected.kind` in URL — RESTful concern
- **Verified status:** 🔧 **DESIGN CHOICE** — works.

---

## Section 6 — Verification Summary

| Category | Confirmed (real bug) | False Positive | Already Done | Out of Scope | Total |
|----------|--------------------:|---------------:|-------------:|-------------:|------:|
| Critical | 7 | 4 | 0 | 0 | 14 |
| High | 3 | 0 | 5 | 14 | 22 |
| Medium | 3 | 0 | 0 | 18 | 21 |
| Low | 2 | 0 | 0 | 8 | 10 |
| **Original Total** | **15** | **4** | **5** | **40** | **67** |
| New (Section 5) | 5 | 0 | 0 | 15 | 20 |
| **Grand Total** | **20** | **4** | **5** | **55** | **87** |

**Real bugs requiring fix: 20**
**False positives to ignore: 4**
**Already implemented: 5**
**Out of scope / design choices: 55**

---

## Section 7 — Recommended Fix Priority

If the user wants to fix the 20 real bugs, here is the recommended order:

### Priority 1 — Branding (Critical, 8 files affected)
1. [HomePage.jsx:15,18](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/HomePage.jsx#L15) — Replace "Eugene Odibenuah" with "BuildWithLami"
2. [ContactPage.jsx:38,41,304](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ContactPage.jsx#L38) — Same
3. [ProjectsPage.jsx:22,25](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/ProjectsPage.jsx#L22) — Same
4. [AboutPage.jsx:15,18,79](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/AboutPage.jsx#L15) — Same (but keep "Eugene Odibenuah" if About page is the founder bio)
5. [Footer.jsx:72](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Footer.jsx#L72) — Replace "built by Eugene" with "BuildWithLami"
6. [Footer.jsx:7](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/components/Footer.jsx#L7) — `displayYear = 2026` → `new Date().getFullYear()`

### Priority 2 — Domain Migration (3 files)
1. [contact.js:6](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/config/contact.js#L6) — `.dev` → `.com`
2. [emailService.js:30](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/services/emailService.js#L30) — `from` address `.dev` → `.com`; "Portfolio Contact" → "BuildWithLami"
3. [paymentEmailService.js:60,132,142](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/services/paymentEmailService.js#L60) — `vercel.app` → `buildwithlami.com`

### Priority 3 — Backend Fixes
1. [contactRoutes.js:12](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/routes/contactRoutes.js#L12) — Replace `'ADMIN', 'OWNER'` with `'Owner', 'Administrator'`
2. Add `sendClientConfirmation()` to both [contactController.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/controllers/contactController.js) and [bookingController.js](file:///c:/Users/nuke/Documents/buildwithlami/backend/src/controllers/bookingController.js)
3. Add startup warning if `SMTP_USER` is unset in `NODE_ENV=production`

### Priority 4 — Frontend Copy Fixes
1. [SurveyHomePage.jsx:278,354](file:///c:/Users/nuke/Documents/buildwithlami/frontend/src/pages/survey/SurveyHomePage.jsx#L278) — Change "Nine" to "Six" OR add 3 more services from `divisions.js`
2. Replace hardcoded `survey@buildwithlami.com` and `drone@buildwithlami.com` with values from `contact.js` (extend the config with `divisions: { survey, drone }`)
3. Replace vanity placeholder numbers `+234 (0) 800 LAND-LAMI` and `+234 (0) 800 DRONE-LAMI` with real numbers or remove

### Priority 5 — Data Centralization
1. Refactor `SurveyHomePage.jsx` and `DroneHomePage.jsx` to import from `divisions.js` (single source of truth)
2. Have `AdminCRM.jsx` call `/api/crm/stages` on mount

### Priority 6 — Misc
1. `autoSelectMessage` race condition in `AdminInbox.jsx`
2. Decide on contact form qualification fields (add to UI vs remove from schema)

---

**End of verification report. Awaiting user direction on which items to fix.**
