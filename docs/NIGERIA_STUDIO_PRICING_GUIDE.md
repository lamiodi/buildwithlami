# BuildWithLami Pricing and Care Guide

Reviewed 31 October 2026. Applies to new proposals; existing signed agreements retain their terms.

## Public budgets and tailored proposals

Public message: **Clear starting budgets. Tailored project proposals.** Website builds start from ₦270,000. The final price depends on pages, features and integrations; agree scope and price before work begins. CTA: **Get my project quote**.

Publish a minimum budget per service and describe package capabilities. Higher packages use tailored quotes; Software, ERP/portals and AI packages are individually quoted with a public category minimum. Website and e-commerce minimums remain ₦270,000 and ₦650,000; other category minimums also remain unchanged.

`frontend/src/config/pricing.js` contains public budgets and care fees. Internal package benchmarks, infrastructure reference values and add-on estimates are preserved in `backend/src/config/proposalBenchmarks.js`. Never import that module into the frontend or return its contents from a public API. These are estimating references, not binding quotes or records of actual provider costs.

USD amounts remain separate regional prices, not NGN conversions. Confirm market, currency and scope in each proposal.

## Build, infrastructure and care

- Build: scoped design and implementation; 50% kickoff and 50% delivery unless the signed proposal differs.
- Infrastructure: eligible builds include the specified allowance for 12 months after launch. Disclose provider, limits, exclusions and renewal costs in the proposal; honour existing allowances.
- Warranty: implementation defects within the agreed scope and stated warranty period. Infrastructure inclusion does not imply 12 months of ongoing maintenance.
- Care: optional labour and monitoring, billed at the chosen cadence. Hosting, domains, database, email, storage and licence bills are separate, normally paid directly to providers, except for an expressly included build allowance.

Before an infrastructure allowance ends, offer a tailored baseline technical-care quote, an optional monthly retainer, or handover to the client's team. A development retainer is not required simply to keep a website online. Handover must document responsibility for renewals, monitoring, access and maintenance.

## Nigerian care fees

| Plan | Monthly | Annual | Scope |
|---|---:|---:|---|
| Essential | — | ₦130,000 | Simple static sites only; monitoring, quarterly technical review, two minor text/image updates annually, up to 30 minutes each. |
| Standard | ₦40,000 | ₦420,000 | Up to 2 total hours/month for small CMS website care and updates. |
| Growth | ₦85,000 | ₦900,000 | Up to 4 total hours/month for active websites/stores, checks and small improvements. |
| Pro | ₦225,000 | ₦2,400,000 | Up to 10 total hours/month for agreed engineering and care. Assess complex or critical systems separately. |

CMS websites and applications need their own baseline care estimate. Essential is not a universal application maintenance plan. No plan includes uncapped provider bills or unlimited incident repair.

## Operating terms

- Business hours: Monday–Friday, 9:00am–5:00pm WAT, excluding Nigerian public holidays.
- Automated monitoring is continuous; staff review alerts during business hours. After-hours response and 24/7 staff coverage are excluded.
- Response windows: Essential within two business days; Standard within one business day; Growth within eight business hours; Pro within four business hours. Response means acknowledgement and initial assessment, not guaranteed resolution.
- All manual work counts within monthly hours: checks, troubleshooting, changes, testing, deployment, communication and reporting. Routine care is not additional uncounted labour.
- Annual billing still provides 2, 4 or 10 hours/month. Unused monthly hours expire without rollover.
- Redesigns, major features and work beyond the allowance require an estimate and written approval before starting. No unapproved billable work or invented overage rate.
- Essential's two capped content updates are separate from its quarterly technical reviews. Major repairs need a separate estimate.
- No uptime, security, restoration or immediate-resolution guarantee without a separately scoped and staffed agreement.

Track actual time and costs for three months before reassessing profitability or discounts. Use `PRICING_MARGIN_AND_CARE_POLICY_WORKSHEET.md`; keeping the current prices is not proof of a profitable margin.
