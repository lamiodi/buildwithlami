⚠️ DEGRADED: single-context (sub-agent spawn failed: usage limit reached for both independent assessment agents)

# Pricing and Conversion Audit — Approval Draft

Date: 8 September 2026  
Scope: Public-facing routes and shared marketing components in `frontend/src`  
Primary goal: Make the offer easier to understand, protect delivery margin, and increase qualified project inquiries.

## Executive verdict

The site has a credible premium foundation, but the pricing page currently behaves like a catalogue rather than a guided buying decision. The core Website and E-commerce ladders scale reasonably. Custom Software, Business Systems/ERP, AI, SEO, Marketing, and Care mix different buying models, contain overlapping promises, or do not make the increasing service level clear enough from tier to tier.

Do not solve this by adding more copy. Reduce the number of decisions, make each tier's upgrade logic explicit, separate build fees from recurring operations, and put verified proof beside the moment where a buyer is asked to inquire.

Recommended release status: **revise the pricing architecture before promoting the page heavily**. No finding prevents a visitor from submitting an inquiry, but several can reduce trust, attract poorly qualified leads, or erode margin.

## Design health score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 2/4 | Currency is automated, but the displayed region label is hard-coded and deep-linked categories are not activated. |
| 2 | Match with the real world | 2/4 | Buyer-facing cards use RBAC, RAG, CAPI, CI/CD, WebSockets, and other implementation language. |
| 3 | User control and freedom | 2/4 | Visitors cannot manually correct the detected currency; the custom category picker has limited keyboard behavior. |
| 4 | Consistency and standards | 1/4 | Services, pricing, payment cadence, tier names, and first-person/plural voice do not form one system. |
| 5 | Error prevention | 2/4 | Annual numeric values conflict with formatted discounts; plan IDs leak into the inquiry copy. |
| 6 | Recognition rather than recall | 2/4 | Ten hidden disciplines and overlapping Website/Software/ERP offers make buyers diagnose their own technical solution. |
| 7 | Flexibility and efficiency | n/a | Not a meaningful scoring dimension for a persuasive marketing surface. |
| 8 | Aesthetic and minimalist design | 2/4 | Strong hierarchy is weakened by long cards, repeated commercial explanations, and dense exclusions. |
| 9 | Error recognition and recovery | 3/4 | The contact form gives clear submission/error feedback and a WhatsApp fallback. |
| 10 | Help and documentation | 3/4 | FAQs and scope notes help, but pricing-specific questions, billing transitions, and ownership boundaries remain unresolved. |
| **Total** |  | **19/36** | **Acceptable foundation; material conversion work remains.** |

## Design-specificity verdict

The Survey and Drone divisions feel authored for their services: their vocabulary, imagery, process, and calls to action are specific. The Software Studio is visually coherent but commercially category-interchangeable. Phrases such as “built for scale,” “high-converting,” “premium user experience,” and “real revenue” recur without enough nearby evidence.

The deterministic detector returned 36 findings across `frontend/src`; 10 touch public marketing surfaces. Relevant findings are two side-tab treatments in `components/Services.jsx`, one in `pages/ServicesPage.jsx`, global use of Space Grotesk, two TechStack style warnings, and four Montserrat/font-loading warnings in Drone pages. These are advisory craft signals, not the cause of the pricing conversion problem. The detector found no structural warning in `Pricing.jsx`; the major pricing failures are semantic and commercial, which static style detection does not measure.

## Cognitive-load assessment

Failed checks: single focus, chunking, one thing at a time, minimal choices, and progressive disclosure. The page asks a visitor to choose among 10 disciplines before they can compare three dense packages, then repeats Build/Run/Maintain and responsibility boundaries below the cards. This is high cognitive load.

The best correction is a guided first decision with four or five buyer-recognizable options, followed by three comparable choices. Technical detail and exclusions should remain available in a secondary disclosure or comparison table.

## Pricing architecture audit

### A. Structural rule to adopt

For fixed-scope services, use one nested ladder throughout:

| Dimension | Launch | Growth — recommended | Scale |
|---|---|---|---|
| Buyer | Needs one focused outcome | Needs a complete revenue/operations system | Needs advanced workflows, integrations, or governance |
| Scope | Clearly capped | Roughly 2–3× useful scope, not merely more bullets | Bespoke scope with explicit discovery |
| Reviews | 1 structured round | 2 structured rounds | Milestone reviews under the SOW |
| Warranty | 14–30 days | 30–60 days | 60–90 days |
| Support | Standard response | Priority business-hours response | Named priority window; response is not resolution |
| Pricing relationship | 1.0× | Usually 1.8–2.2× | Usually 3–4× or custom |
| CTA | Request Launch scope | Request recommended scope | Book a scoping call |

The middle plan should be the offer you most want to deliver. A three-tier structure works when the plans are genuinely nested and aimed at different willingness to pay; see the [Harvard Business Review overview of good-better-best pricing](https://hbr.org/2018/09/the-good-better-best-approach-to-pricing).

### B. Current plan balance

| Service | Current prices | Balance verdict | Recommendation |
|---|---|---|---|
| Websites | ₦270k / ₦520k / ₦950k+ | **Mostly sound.** Ratios are 1.0× / 1.93× / 3.52×. Pro overlaps Custom Software through authentication and database work. | Keep the first two floors. Move Pro toward ₦1.2m+ if custom integrations remain, or remove application features and position it as a scaled marketing/CMS platform. |
| E-commerce | ₦650k / ₦1.25m / ₦2.2m+ | **Sound ladder, slightly compressed at the top.** | Keep Starter and Growth. Test ₦2.5m+ for Headless/Multi-Warehouse after costing the included Scale Infrastructure profile. |
| Custom Software | ₦1.2m / ₦2m+ / ₦4m+ | **Under-scoped and underpriced for the promises.** The entry tier includes full stack, auth, payments, SMS/email, IP transfer, infrastructure, and 90 days of support. | Validate public floors around ₦1.8m–₦2.5m / ₦3m–₦5m / ₦6m+ after an internal hours-and-margin model. Reduce MVP scope if keeping ₦1.2m. |
| Business Systems & ERP | ₦850k / ₦1.6m / ₦2.4m+ | **Not a tier ladder.** Gate pass, school portal, and retail ERP are different products. | Present as three “solution starting points,” not Starter/Growth/Pro. State whether these are customized product foundations; otherwise their prices conflict with bespoke Software pricing. |
| UI/UX | ₦280k / ₦750k / ₦1.6m+ | **Well differentiated.** 6 / 18 / 30+ screens and rising governance support justify the jumps. | Keep. Rename “screens” as unique responsive views and define whether mobile variants count separately. |
| Branding | ₦250k / ₦600k / ₦1.4m+ | **Logical and nested.** | Keep, but only lead with this offer if you have relevant portfolio proof. |
| SEO | ₦220k / ₦550k / ₦350k monthly | **Lifecycle, not comparable tiers.** | Display as Audit → Implementation → Ongoing Growth. Explain whether the retainer requires the implementation first and set a minimum term or onboarding fee. |
| Marketing | ₦250k / ₦700k / ₦850k monthly | **Lifecycle, not comparable tiers.** “Everything in Campaign Launch” is ambiguous on a recurring plan. | Display Strategy → Launch → Monthly Management. State what happens in month one, ongoing monthly outputs, minimum term, and that ad spend is separate. |
| AI & Automation | ₦450k / ₦1.4m / ₦3m+ | **Entry-to-Growth jump is steep and entry scope is generous.** | Either narrow Starter to one workflow/two tools or test a ₦600k+ floor. Keep Growth near ₦1.4m–₦1.6m and test Enterprise from ₦3.5m if high availability and sensitive-data controls remain. |
| Care | ₦130k yearly / ₦60k monthly / ₦150k monthly / ₦350k monthly | **Hard to compare because cadence changes.** Benefits scale, but billing and included hours are not normalized. | Add a Monthly/Annual control or show both prices and effective monthly cost. Rename “Bi-Monthly” to “Monthly.” Define business hours, rollover, overage rate, and response-vs-resolution. |

Market sanity signal: a current Nigerian agency guide places professional 5-page sites around ₦150k–₦300k, custom corporate sites around ₦300k–₦1m, e-commerce around ₦400k–₦1.5m+, and custom platforms from roughly ₦2.5m. This is directional, not a substitute for your own cost data. Your Website floors look credible; the Software scope is the clearest underpricing risk. See [DPX’s 2026 Nigeria guide](https://dpx.com.ng/how-much-does-a-web-designer-charge-in-nigeria/).

### C. First-year infrastructure and commercial boundaries

The first-year infrastructure promise should remain: every Website, E-commerce, ERP, and Custom Software build receives managed production infrastructure for its first 12 months at no additional charge. The issue is not the inclusion; it is presenting the same ₦130k bundle on materially different workloads. Scale the management level with the build tier.

| Infrastructure level | Suggested published value | Included service level | Best fit |
|---|---:|---|---|
| **Foundation** | **₦130k/year** | One client-owned domain, production deployment, SSL, up to 5,000 transactional emails/month, daily backups with 90-day retention, automated uptime checks, and essential security patches. | Launch/Starter builds |
| **Growth** | **₦240k/year** | Everything in Foundation, plus a separate staging environment, right-sized compute/database profile, up to 10,000 transactional emails/month, error/performance monitoring, backup-restore verification, and priority business-hours alert review. | Growth builds |
| **Scale** | **₦420k/year** | Everything in Growth, plus isolated production/staging configuration, up to 25,000 transactional emails/month, enhanced logs and alerting, more frequent database recovery points where supported, and quarterly capacity/security review. | Pro/Scale builds |
| **Enterprise** | **Custom from ₦750k/year** | Architecture-specific capacity, environments, backup/recovery targets, observability, availability objectives, and response terms documented in the proposal. | Enterprise or high-risk systems |

These are recommended retail values, not yet validated costs. Before publishing Growth, Scale, or Enterprise values, price the actual provider profile and management hours. Do not promise unlimited compute, storage, traffic, email, or staffed 24/7 support.

Recommended mapping:

- Website, E-commerce, Custom Software, and AI Automation: Launch/Starter → Foundation; Growth → Growth; Pro/Scale → Scale; Enterprise → Enterprise.
- ERP solution starting points: Gate Pass → Foundation; School Portal → Growth; Retail ERP → Scale. Override this mapping when transaction volume, integrations, or availability requirements demand it.
- Care renewal: Essential → Foundation; Standard → Growth; Growth Care → Scale; Pro Care → Enterprise while the retainer remains active.
- “Tailored to the project” should mean the provider profile is right-sized inside the named service level—not that every tier silently receives unlimited infrastructure.

Keep three promises distinct in every proposal and on the pricing page:

1. **First-year Infrastructure — included:** the named Foundation, Growth, Scale, or Enterprise service level and its stated capacity limits.
2. **Build warranty — included:** correction of implementation defects for the stated period; no feature changes or reserved development hours.
3. **Care plan — optional or explicitly included:** human developer time, content changes, improvements, reporting, and agreed response windows.

If a higher build card currently says “Standard Care included” or “Growth Care included,” replace that phrase with its infrastructure level unless the entire paid Care retainer—including its developer hours—is genuinely included. Automated 24/7 monitoring means systems check continuously; it must not imply that an engineer is staffed around the clock.

Additional corrections:

1. **Fix annual numeric data.** `maint_growth.annualPriceNGN` is ₦1.8m while the formatted annual offer is ₦1.62m. `maint_pro.annualPriceNGN` is ₦4.2m while the formatted offer is ₦3.85m. If the numeric fields later power checkout, the customer can be charged the wrong amount.
2. **Use tier-appropriate milestone terms.** Keep 50/50 for small fixed packages. For larger work, test 40/30/30 or discovery deposit + build milestones. Asking for 50% of a multi-million-naira enterprise project before phased evidence can suppress conversion and concentrates delivery risk.
3. **Create an internal price floor.** Before changing public numbers, calculate: estimated delivery hours × internal target rate + subcontractors + risk reserve + included infrastructure cost + included support cost. Public “from” prices must never fall below that floor.

## Priority issues

### [P1] Ten disciplines create an agency-menu problem

Why it matters: buyers must identify whether they need a Website, UI/UX, Custom Software, ERP, AI, SEO, Marketing, or combinations of them. This makes the studio look broad but makes the decision harder and dilutes the strong software/ERP proof.

Fix: make four primary choices visible—Websites, E-commerce, Business Software, and Care. Place UI/UX, Branding, SEO, Marketing, and AI under “Specialist services and add-ons.” Keep Survey and Drone in their separate division experiences.

Suggested command: `$impeccable distill`.

### [P1] The included infrastructure does not visibly scale with the build tier

Evidence: `config/pricing.js:5-16`, `config/pricing.js:61-78`, and `components/Pricing.jsx:591-700` repeat one ₦130k Base Infrastructure Layer while higher build tiers also mention named Care plans with large standalone prices.

Why it matters: a ₦270k Website Starter and a multi-million-naira software platform do not create the same infrastructure load. Repeating the same bundle makes premium tiers look less valuable and leaves capacity, human support, and renewal expectations unclear.

Fix: retain first-year inclusion but map each build to Foundation, Growth, Scale, or Enterprise Infrastructure. Show its capacity and service boundary once, then keep warranty and optional Care as separate promises.

Suggested command: `$impeccable clarify`.

### [P1] Pricing interactions and data undermine trust

Evidence:

- Homepage links such as `/pricing#ecommerce` do not update `activeCategory`, which always starts as `websites` (`components/Pricing.jsx:90-92`, `227-289`).
- “Active Region: Nigeria & African Region (NGN)” is hard-coded even for USD visitors (`components/Pricing.jsx:321-323`).
- All African visitors are assigned NGN and visitors cannot override it (`utils/currency.js:7-63`).
- Pricing CTAs pass IDs such as `web_growth`; Contact inserts that ID into the visitor’s message (`components/Pricing.jsx:545-550`, `pages/ContactPage.jsx:128-132`).
- Discount display fields and annual numeric fields disagree (`config/pricing.js:149-150`, `182-183`).

Fix: read the category from the URL, add a currency switch, pass a human plan name, and make one numeric price source generate every display string.

Suggested command: `$impeccable harden`.

### [P1] The conversion claim is stronger than the visible proof

Evidence: the homepage promises products that “grow revenue” (`components/Hero.jsx:33-39`), while the testimonials section intentionally renders nothing (`components/Testimonials.jsx:9-10`). Case-study data contains impressive metrics, but some records mix “Concept Prototype,” “Live,” pilot outcomes, and client-project language.

Why it matters: high-ticket buyers need proof at the same moment they assess price. Unverified or internally inconsistent metrics can reduce trust more than having no metric.

Fix: add a compact verified proof strip above pricing. Label every project as Client Work, Internal Product, or Concept. Show only metrics you can substantiate and explain the baseline/timeframe.

Suggested command: `$impeccable clarify`.

### [P2] Copy is technical, repetitive, and action labels drift

Evidence: buyer copy includes RBAC, RAG, CAPI, WebSockets, vector databases, and CI/CD. Calls to action alternate among Start a Project, Submit Project Brief, Book Architecture Consultation, Book a Discovery Review, and Start with [Tier]. Voice alternates between “I” and “we.”

Why it matters: technical terms force non-technical buyers to translate features into business value; CTA drift creates uncertainty about what happens next.

Fix: lead with outcomes and put implementation detail in an expandable “Technical scope.” Use one voice and one primary CTA: “Request a scoped proposal.” Use “Ask a pricing question” as the secondary CTA.

Suggested command: `$impeccable clarify`.

## Recommended pricing-page structure

1. **Hero:** outcome, transparent starting prices, and one risk-reversal sentence.
2. **Choose what you need:** four primary cards; no ten-item dropdown as the first decision.
3. **Three comparable packages:** Launch / Growth / Scale for the selected fixed-scope service.
4. **Recommended-plan explanation:** why Growth is recommended, not merely a “Best Value” badge.
5. **Verified relevant case study:** one proof item matched to the selected service.
6. **First-year Infrastructure / Warranty / Care:** one concise commercial boundary block, including the selected infrastructure level and renewal rule.
7. **Care plans:** separate billing model with Monthly/Annual comparison.
8. **Pricing FAQs:** scope changes, content, third-party fees, taxes, ownership, warranty, cancellation, and retainers.
9. **Final CTA:** “Request a scoped proposal” with response-time expectation.

## Suggested high-conversion copy

### Pricing hero

**Headline:** Clear scope. Honest starting prices. No surprise invoices.

**Body:** Choose the closest project type to see realistic starting prices, deliverables, timelines, and support. After a short discovery review, you receive a fixed scope and milestone proposal before any work begins.

**Trust line:** You own the approved design, source code, and project files. Third-party provider fees are listed separately and paid without hidden markup.

### Tier CTAs

- Launch: **Request a Launch scope**
- Growth: **Get a Growth proposal**
- Scale: **Book a Scale scoping call**
- Secondary: **Ask a pricing question**

Replace “Start with Growth” because the visitor is not purchasing yet; they are requesting fit confirmation and scope.

### Commercial boundary

**Your project price covers:** strategy, design, engineering, agreed deliverables, the stated warranty, and the named Infrastructure level for the first 12 months.

**Paid separately:** usage above the stated infrastructure limits, premium licences, payment/SMS transaction fees, advertising spend, taxes where applicable, and work outside the approved scope.

**After month 12:** renew the matching BuildWithLami Infrastructure level, move provider billing to your own accounts, or agree a revised profile based on actual usage. Provider renewals are passed through at 0% markup where applicable.

**Optional Care:** add a Care plan when you need reserved developer time, content or feature changes, reporting, and agreed human response windows. Automated infrastructure monitoring and the build warranty remain separate.

### Infrastructure copy for each pricing card

- Launch/Starter: **Foundation Infrastructure included for 12 months — ₦130k value**
- Growth: **Growth Infrastructure included for 12 months — ₦240k value**
- Pro/Scale: **Scale Infrastructure included for 12 months — ₦420k value**
- Enterprise: **Enterprise Infrastructure included for 12 months — scope and value confirmed in your proposal**

Recommended disclosure below the cards: “Infrastructure is included at no additional charge for the first 12 months. Each level has stated fair-use limits. From month 13, renew with BuildWithLami or take over provider billing directly with full account ownership and no hidden markup.”

### Contact page

**Headline:** Tell me what you need. I’ll confirm fit, scope, and the next step within one business day.

**Body:** Share your goal, preferred timeline, and the package you are considering. You will receive a short fit review first; a fixed proposal follows after the requirements are clear.

**CTA:** Request my scoped proposal

This is more credible than promising a complete proposal and roadmap within 24 hours for every project.

## Page-by-page conversion review

| Route | What works | Conversion issue | Approval recommendation |
|---|---|---|---|
| `/` | Clear founder presence, ownership, milestone terms, strong case-study entry. | Offer is very broad; no testimonial proof renders; “grow revenue” is unsupported at the hero. | Narrow the lead proposition and move one verified result above the first CTA. |
| `/software` | Strong ownership, warranty, and commercial transparency. | Fetches software projects but never renders them; technology receives more space than client outcomes. | Replace part of the stack section with 2–3 relevant proof stories and a starting-price bridge. |
| `/services` | Outcomes and deliverables are clearer than generic service cards. | Six service categories do not match the ten pricing disciplines; several services overlap. | Make the service taxonomy identical to the simplified pricing taxonomy. |
| `/pricing` | Useful inclusions, exclusions, timelines, support, and price floors. | Highest cognitive load; commercial contradictions; broken deep-link selection; weak proof near price. | Rebuild information architecture before polishing visuals. |
| `/projects` and details | Rich case-study structure and technical depth. | Status and metric credibility require verification; detail pages may be too long for scanning. | Add a proof standard and a short executive outcome summary to every case study. |
| `/about` | Founder credibility and qualifications reduce perceived delivery risk. | Long credentials/technology content delays the commercial reason to trust. | Lead with a concise credibility summary, selected proof, and working model. |
| `/contact` | Clear form feedback, 24-hour expectation, and WhatsApp fallback. | Eleven project-type choices, raw plan IDs, no visible budget qualifier, and a stronger promise than the process can always meet. | Prefill human-readable selection, reduce choices, add optional investment range, and clarify the response promise. |
| `/survey` | Specific vocabulary, supervision disclosure, process, and professional deliverables. | No early cost anchor; some buyers will self-disqualify or send low-context requests. | Add 2–3 example-project starting ranges or a minimum engagement, subject to site/location variables. |
| `/drone` | Distinct positioning, quote factors, delivery expectations, and strong visual language. | “Book a Flight” can imply immediate booking before airspace/site review; no starting anchor. | Use “Request a Mission Quote” consistently and add example mission ranges if operationally defensible. |
| Utility/auth/client routes | Functional route separation and recovery patterns exist. | Outside the main acquisition audit. | Audit separately before portal launch or payment-flow changes. |

## Persona red flags

**Jordan — first-time buyer:** cannot confidently choose among Website, UI/UX, Software, ERP, AI, SEO, and Marketing. Encounters technical acronyms before understanding the business outcome. Needs one plain-language explanation that first-year infrastructure is included, capped by level, and renewable from month 13.

**Riley — deliberate evaluator:** notices mismatched annual values, project-status inconsistencies, hard-coded region text, and ambiguous third-party-fee language. These contradictions invite due-diligence questions at the exact moment trust is needed.

**Casey — distracted mobile visitor:** must open a dropdown of ten disciplines, scan long cards, remember distinctions, and then use a contact form with many visible project-type options. The core inquiry is possible, but the path is longer than necessary.

## What is already working

1. Inclusion, exclusion, timeline, revision, and support fields are much more useful than vague “Basic/Pro” feature lists.
2. Website and E-commerce prices have sensible multipliers and a clearly favored middle tier.
3. The founder-led model, source-code ownership, fixed scope, and post-launch warranty are strong risk reducers when stated consistently.

## Minor observations

- “Bi-Monthly” is ambiguous; use “Monthly Updates & Monitoring.”
- “Support response” must say business hours and must not be interpreted as resolution time.
- “Unlimited products” should include reasonable import/performance constraints.
- Replace “absolute speed,” “flawless,” and “zero surprise” language unless the claim is contractually defensible.
- Add a pricing-page meta description; `PricingPage.jsx` currently changes only the title.
- Use “from ₦X” or “typical range ₦X–₦Y,” not an exact-looking number followed later by a broad scoping disclaimer.
- Maintain a single first-person or company voice. A founder-led studio can use “I lead every engagement; trusted specialists join where scope requires.”

## Approval matrix

Mark each item **Approve**, **Defer**, or **Reject** before implementation.

| ID | Proposed change | Priority | Decision |
|---|---|---|---|
| A1 | Reduce ten primary pricing disciplines to four primary offers plus specialist/add-on services. | P1 | **Partially applied — grouped into core and specialist options** |
| A2 | Replace the repeated Base Infrastructure bundle with Foundation / Growth / Scale / Enterprise first-year levels. | P1 | **Applied** |
| A3 | Map every eligible build and Care package to an infrastructure level and publish its limits, renewal rule, and automated-vs-human support boundary. | P1 | **Applied** |
| A4 | Fix annual Care numeric values and generate display amounts from one source. | P1 | **Applied** |
| A5 | Add manual NGN/USD selection and make the region label accurate. | P1 | **Applied** |
| A6 | Make pricing deep links open the selected category and pass human-readable plan names to Contact. | P1 | **Applied** |
| A7 | Reframe ERP packages as separate solution starting points, not a linear tier ladder. | P1 | **Applied** |
| A8 | Split SEO and Marketing into lifecycle steps: Strategy/Audit → Launch/Implementation → Retainer. | P1 | **Applied** |
| A9 | Recalculate Software and AI public floors using estimated hours, risk, and support cost. | P1 | Pending |
| A10 | Add one verified, service-relevant proof item beside pricing; standardize project status labels. | P1 | Pending |
| A11 | Standardize voice and primary CTA to “Request a scoped proposal.” | P2 | **Applied across Software Studio routes** |
| A12 | Replace technical acronyms in cards with business outcomes; move technical scope into disclosure. | P2 | **Partially applied — highest-friction acronyms removed** |
| A13 | Add a Monthly/Annual Care comparison with business hours, rollover, overage, and minimum-term rules. | P2 | **Partially applied — price comparison added; policy terms need confirmation** |
| A14 | Add optional investment-range qualification on the contact form. | P2 | **Applied** |
| A15 | Add defensible price anchors or example scenarios to Survey and Drone. | P2 | Pending |

## Implementation log — 9 September 2026

- Pricing URLs such as `/pricing#ecommerce` now activate the correct category, and changing the category updates the shareable URL.
- The custom ten-item listbox was replaced with a native, keyboard-accessible selector grouped into core and specialist services.
- Visitors can choose Auto, NGN, or USD; their preference persists locally and the displayed currency label is accurate.
- Pricing inquiries now carry the human package name and selected currency instead of exposing internal IDs such as `web_growth`.
- The Contact form now uses one grouped service selector, includes an optional investment range, preserves submitted details after network failure, and uses a one-business-day fit-review promise.
- The primary Software Studio CTA is now consistently “Request a Scoped Proposal.” Survey and Drone retain their division-specific language.
- The pricing route now sets a service-specific meta description.
- Care cards now calculate annual prices and savings from numeric data instead of duplicate formatted strings.
- ERP is labelled as separate solution starting points; SEO and Marketing are presented as lifecycle choices rather than false upgrade tiers.
- High-friction buyer-facing acronyms such as RBAC, RAG, CAPI, CI/CD, and WebSockets were replaced with plain business outcomes in the pricing flow.

## Questions to decide before implementation

1. Are ERP packages bespoke source-code-transfer builds, or repeatable foundations customized for each client? The right public price and wording differ materially.
2. Growth and Scale values are now displayed publicly. Validate provider costs and management hours before the pricing page is promoted heavily.
3. Which business should the Software Studio be famous for first: revenue websites/e-commerce, custom operations software, or a balanced studio offering?
4. Which case-study metrics can be supported by analytics, client confirmation, or project records?
