# Pricing Margin and Care Policy Worksheet

Prepared: 9 September 2026  
Status: Internal decision document — proposed terms below are not yet published

## Executive recommendation

The public package ladder is now structurally sound: build price, scope, support period, and first-year infrastructure all rise with complexity. Do not lower the current build prices. Before increasing Software, AI, or Care prices, complete the cost-floor calculation below using real delivery hours and provider costs.

The most important item to review is Essential Care. Its public price of ₦130,000/year exactly matches the displayed Foundation Infrastructure value of ₦130,000/year, yet it also promises human maintenance and minor fixes. Unless the actual infrastructure cost is materially below that displayed value, the plan has little or no room for labour, overhead, or profit.

## 1. Sustainable price-floor formula

Calculate each plan before VAT:

```text
Loaded delivery cost
  = (estimated hours × real internal cost per hour)
  + contractor cost
  + project-only software and service costs
  + first-year infrastructure cost
  + warranty/support reserve
  + risk contingency
  + allocated sales and administration cost

Minimum price before VAT
  = loaded delivery cost ÷ (1 - target contribution margin)
```

Use real internal cost per hour, not the desired client billing rate. Add VAT after the sustainable price is established.

Suggested decision assumptions for review:

- Target contribution margin: 35% minimum for defined-scope builds; 40% for high-risk or unclear integrations.
- Risk contingency: 10–15% of delivery labour for ordinary builds; 20–30% for migrations, legacy systems, AI integrations, and uncertain third-party APIs.
- Warranty reserve: expected post-launch hours multiplied by internal cost per hour.
- Foreign-currency quotes: contract in NGN or add an approved exchange-rate buffer and quote-expiry date.

These percentages are planning defaults, not public promises.

## 2. Current build ladder review

| Offer | Entry | Middle | Upper | Assessment |
|---|---:|---:|---:|---|
| Websites | ₦270k | ₦520k | ₦950k+ | Healthy progression; approximately 1.9× then 1.8×. |
| E-commerce | ₦650k | ₦1.25m | ₦2.2m+ | Healthy progression; scope and operating risk rise clearly. |
| Custom Software | ₦1.2m | ₦2m+ | ₦4m+ | Logical ladder, but the MVP floor must be checked against real hours. |
| ERP / Business Systems | ₦850k | ₦1.6m | ₦2.4m+ | Correctly treated as separate solution starting points, not upgrades. |
| UI/UX | ₦280k | ₦750k | ₦1.6m+ | Strong differentiation if screen counts and research scope remain capped. |
| Branding | ₦250k | ₦600k | ₦1.4m+ | Strong progression; ensure production assets and strategy workshops are bounded. |
| AI Automation | ₦450k | ₦1.4m | ₦3m+ | Entry price is the main risk; custom integrations can consume the margin quickly. |

SEO and Marketing are lifecycle offers rather than tier ladders, so their prices should be tested independently.

### Software and AI floor check

At a proposed 35% contribution margin, all delivery costs combined must remain below 65% of the selling price:

| Plan | Public starting price | Maximum loaded cost at 35% margin |
|---|---:|---:|
| Software MVP | ₦1.2m | ₦780k |
| Software Growth | ₦2m | ₦1.3m |
| Software Enterprise | ₦4m | ₦2.6m |
| AI Starter | ₦450k | ₦292.5k |
| AI Growth | ₦1.4m | ₦910k |
| AI Enterprise | ₦3m | ₦1.95m |

Fill this in before changing public floors:

| Plan | Delivery hours | Internal cost/hour | Direct services | Infrastructure | Warranty reserve | Risk reserve | Calculated floor | Decision |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Software MVP |  |  |  |  |  |  |  | Keep / Raise |
| Software Growth |  |  |  |  |  |  |  | Keep / Raise |
| Software Enterprise |  |  |  |  |  |  |  | Keep / Raise |
| AI Starter |  |  |  |  |  |  |  | Keep / Raise |
| AI Growth |  |  |  |  |  |  |  | Keep / Raise |
| AI Enterprise |  |  |  |  |  |  |  | Keep / Raise |

## 3. Infrastructure ladder now in use

| Level | Displayed annual value | Main capacity difference | Used by |
|---|---:|---|---|
| Foundation | ₦130k | Production deployment, SSL/CDN, 5,000 emails/month, daily backups | Entry builds and Essential Care |
| Growth | ₦240k | Staging, right-sized compute/database, 10,000 emails/month, stronger monitoring | Middle builds and Standard Care |
| Scale | ₦420k | Isolated environments, 25,000 emails/month, stronger recovery and quarterly review | Upper builds and Growth Care |
| Enterprise | From ₦750k | Architecture-specific capacity, recovery and response objectives | Enterprise builds and Pro Care |

Keep the public wording “included at no additional charge for the first 12 months.” Avoid “free hosting,” because the infrastructure is part of the paid package and has defined limits.

## 4. Care pricing review

| Plan | Monthly | Annual | Included developer time | Infrastructure | Annual saving vs 12 months |
|---|---:|---:|---:|---|---:|
| Essential | — | ₦130k | Minor fixes and text changes are currently unbounded | Foundation | — |
| Standard | ₦60k | ₦600k | Up to 2 hours/month | Growth | ₦120k (16.7%) |
| Growth | ₦150k | ₦1.62m | Up to 4 hours/month | Scale | ₦180k (10%) |
| Pro | ₦350k | ₦3.85m | Up to 10 hours/month | Enterprise | ₦350k (8.3%) |

The decreasing annual discount can be commercially defensible because higher tiers reserve more specialist capacity. Keep it only if intentional; otherwise use one approved discount rule across all monthly plans.

Recommended pricing decisions:

1. Define an annual hour cap for Essential Care or raise its price after checking actual infrastructure and labour cost.
2. Keep Growth and Pro public prices until the loaded-cost worksheet proves they are below the target margin.
3. Decide whether Standard’s larger 16.7% annual discount is a deliberate acquisition incentive.
4. Never describe the response window as a resolution guarantee.

## 5. Proposed Care operating policy — approval required

These are recommended defaults. They should not be added to the website or contract until approved.

| Policy area | Proposed rule |
|---|---|
| Business hours | Monday–Friday, 9:00am–5:00pm WAT, excluding Nigerian public holidays. |
| Response meaning | Response means acknowledgement and initial triage, not final resolution. Resolution depends on severity, access, dependencies, and agreed scope. |
| Monthly hours | Reserved hours reset at the end of each billing month and do not roll over. |
| Work approval | Work outside the included allowance is estimated and approved in writing before it begins. |
| Overage rate | Insert approved rate: ₦________ per hour, or issue a separate fixed-scope quote. |
| Monthly minimum term | Proposed initial 3-month term, then rolling monthly. |
| Annual term | 12 months, billed in advance unless a proposal states otherwise. |
| Cancellation | Proposed 30 days’ written notice after the minimum term. |
| Emergency coverage | Business-hours incident triage only unless a separate after-hours on-call rider is purchased. |
| Third-party charges | Provider licences, transaction fees, messaging credits, and usage above the plan allowance are billed separately with prior notice. |
| Access dependency | Response and resolution clocks pause while required client or third-party access is unavailable. |

## 6. Approval checklist

- [ ] Enter the real internal hourly cost and typical hours for Software and AI.
- [ ] Confirm actual annual provider cost for each infrastructure level.
- [ ] Decide whether displayed infrastructure numbers are “replacement value” or the month-13 managed renewal price.
- [ ] Cap Essential Care labour or approve a higher annual price.
- [ ] Approve or revise the proposed Care operating policy.
- [ ] Confirm the Standard Care annual discount is intentional.
- [ ] Supply evidence for any numeric case-study result before it appears beside pricing.
- [ ] Supply real minimum or example job values before adding Survey or Drone price anchors.

## 7. Publication rule

Only publish terms that can be delivered consistently and supported contractually. Keep estimates, internal cost assumptions, and unverified project metrics out of buyer-facing pages.
