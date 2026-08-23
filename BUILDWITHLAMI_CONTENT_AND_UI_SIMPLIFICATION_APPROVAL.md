# BuildWithLami
## Content & UI Simplification Audit & Multi-Division Approval Document

> **Status:** PENDING CLIENT APPROVAL  
> **Prepared by:** Senior CRO Strategist, Information Architect & Premium Agency Consultant  
> **Target Divisions:** Software Engineering, Survey Division & Drone Division  
> **Rule Enforcement:** Zero website modifications will occur until items in Section 12 are explicitly reviewed and approved.

---

### Objective

To transform BuildWithLami into a high-converting, state-of-the-art multi-disciplinary studio website across **Software Engineering**, **Land Surveying**, and **Drone Operations**. The goal is to eliminate cognitive overload, repetitive content, and vertical scroll fatigue—while elevating high-value technical proof, client qualification signals, transparent 50/50 milestone pricing, authentic equipment capabilities, and frictionless conversion pathways.

```
LESS CLUTTER  ·  LESS SCROLLING  ·  CLEARER VALUE PROPOSITION  ·  FASTER UNDERSTANDING
STRONGER CTA VISIBILITY  ·  PREMIUM STUDIO FEEL  ·  FLAWLESS MOBILE UX
WITHOUT REMOVING INFORMATION THAT SERIOUS CLIENTS ACTUALLY NEED.
```

---

# Executive Summary

### 1. What is currently causing clutter?
* **Multi-Page Content Duplication:** Core messages—technology stacks, development workflows, 50/50 milestone billing terms, 4-month post-launch maintenance guarantees, and full contact forms—are repeated 3 to 5 times across Home, Software, Services, About, Projects, Survey, Drone, and Contact pages.
* **Page Identity Diffusion & Scroll Fatigue:** 
  * The **Software Homepage** attempts to host full project grids, full services, 4-step process, testimonials, 3-pillar pricing, founder bio, 3 SaaS concepts, 6 FAQs, and an inline contact form.
  * The **Services Page** embeds the entire 74KB interactive `Pricing.jsx` component and a duplicate 6-step workflow, causing excessive vertical scroll (>12,000px).
  * The **Drone Homepage** displays **12 separate vertical service cards**, **8 industry boxes**, **8 "Why Choose Me" cards**, and **5 process steps**, creating over 14,000px of vertical scrolling on mobile devices.
  * The **Survey Homepage** displays **8 service blocks**, **6 equipment boxes with generic placeholder icons**, and **6 FAQ accordions**, with heavy repetition between Cadastral, Layout, and Documentation services.
* **Internal SaaS & Conceptual Distraction:** Inactive SaaS product showcases (*NaijaPay Compliance Pro*, *School ERP*, *Hospital ERP*) with dead `#` links dilute the core agency positioning and confuse clients seeking bespoke engineering.
* **Equipment & Technical Over-Detailing:** Raw bulleted lists of hardware specifications on main landing screens push client action buttons below the fold.

### 2. The Biggest Sources of Unnecessary Content
1. **Redundant Process Steppers:** 4 different workflows across the site (4-step on Home, 6-step on Services, 5-step on Drone, 5-step on About, 3-step on Contact).
2. **Duplicate Scoping Calculators & Forms:** Software page, Pricing page, Survey page, and Drone page all run independent booking/scoping engines without unified funnel routing.
3. **Over-Detailed Visible Deliverables:** Services and project portfolio cards display exhaustive bullet points that belong in focused modals or dedicated case study pages.
4. **Drone Service Fragmentation:** 12 individual service cards for DJI Mini-series drones that can be grouped into 4 distinct commercial categories.
5. **Repeated Tech & Hardware Stacks:** Hardware and tool lists appear in the Navbar (Resume), Hero, Homepage Services modal, Software page, About page (25+ cards), Project Detail pages, and the Footer physics simulation.

### 3. The Biggest Opportunities
* **Establish Canonical Page Hierarchy:** Let each page excel at its single conversion purpose:
  * **Home (Software):** Positioning, high-impact proof, core services, and clear booking action.
  * **Survey Home:** Land boundary accuracy, SURCON compliance, equipment authenticity, and fast site quote intake.
  * **Drone Home:** Visual cinematic proof, aerial mapping accuracy, DJI Mini 4 Pro capabilities, and flight booking.
  * **Services:** Solutions, timelines, and clear deliverables with progressive disclosure.
  * **Projects / Portfolio:** High-impact visual cards driving clicks into in-depth case studies.
  * **Case Studies:** Structured narrative (*Problem → Constraints → Solution → Results → Technical Architecture*).
  * **Pricing:** Transparent scope selector & interactive quote builder.
  * **About:** Founder story, credentials, verified skills, and working principles.
  * **Contact:** Frictionless, unified intake engine with automatic division scoping.
* **Progressive Disclosure:** Move granular technical specifications, drone payload parameters, survey coordinate frameworks, and architecture blueprints into sleek modal drawers and accordions.
* **Mobile Snap Carousels:** Transform tall vertical stacks (Drone services, Survey equipment, Pricing cards, Testimonials, Process steps, Related projects) into touch-friendly horizontal card carousels (~85% viewport width), slashing mobile page length by 60–75%.
* **Focused Division Cross-Selling:** Compact, high-contrast sister-division cards connecting Software, Survey, and Drone without distracting from the host page's primary CTA.

### 4. What Must Remain Untouched (Conversion Anchors)
* **50/50 Milestone Invoicing Terms (50% Upfront, 50% on Delivery):** Proven trust builder that lowers client risk across all software and survey projects.
* **4 Months Included Post-Launch Support & Warranty:** Distinctive value proposition and differentiator for software.
* **100% IP & Source Code Ownership Transfer:** Essential assurance for serious founders and enterprise clients.
* **SURCON Compliance & Registered Supervision:** Non-negotiable trust factor for Nigerian cadastral and land surveying.
* **Authentic Owned Drone Fleet (DJI Mini 4 Pro & Mini 4K):** Honest, verified hardware capabilities with no inflated claims (no fake enterprise LiDAR/thermal claims).
* **High-Value Case Study Narrative Structure:** *Problem → Approach → Solution → Results → Technical Proof*.
* **Location-Aware Currency Switching (NGN / USD):** Seamless cross-border quoting.
* **Founder Identity & Direct Communication (Eugene Odibenuah):** Eliminates agency bloat; clients know exactly who is executing their project.

---

# 1. REMOVE

| Priority | Page / Division | Section / Element | Recommendation | Reason | Conversion Impact |
|---|---|---|---|---|---|
| **P1** | **Software (Home)** | SaaS Products & Ventures (`SaaSProducts.jsx`) | **REMOVE** section from homepage | 3 internal SaaS concepts with dead `#` links confuse prospective clients who want custom client engineering. Leaks focus from agency conversion. | **HIGH (Positive):** Eliminates confusion between agency services vs SaaS. |
| **P1** | **Software (Services)** | Embedded `<Pricing />` Component | **REMOVE** embedded full pricing module from `/services` | Embedding the complete 74KB pricing calculator creates extreme page bloat (>12,000px height). Users should be routed to the dedicated `/pricing` page. | **HIGH (Positive):** Cuts Services page scroll depth by 50% and focuses intent. |
| **P1** | **Software (Software Home)** | Duplicate Contact Form (`#contact-form`) | **REMOVE** full inline form from `/software` | Having full forms on Home, Software, and Contact causes maintenance drift. Replace with a high-impact CTA banner linking to `/contact?division=software`. | **MEDIUM (Positive):** Funnels all leads into the optimized Contact intake engine. |
| **P1** | **Software (Software Home)** | Duplicate SaaS Section (`SAAS_PRODUCTS`) | **REMOVE** SaaS cards from software page | Inactive placeholder SaaS products dilute serious engineering positioning. | **MEDIUM (Positive):** Keeps focus on custom client systems. |
| **P1** | **Drone (Home)** | 8 "Why Clients Hire Me" Cards (`whyChoose`) | **REMOVE** 4 redundant cards (`Licensed Where Required`, `Attention to Detail`, `Safe Operations`, `Reliable Communication`); merge remaining 4 into a single 4-column trust strip | 8 separate cards create massive vertical bloat and repeat standard professional expectations. | **HIGH (Positive):** Reduces scroll depth by ~1,200px while sharpening the value proposition. |
| **P2** | **Survey (Home)** | Generic Gear Icon Placeholders (`⚙`) on Equipment Cards | **REMOVE** generic SVG icon boxes from equipment cards; replace with clean minimal technical spec badges | Large placeholder icon boxes waste visual space and look unpolished without real photography. | **MEDIUM (Positive):** Creates a sleek, blueprint-style Leica/Trimble aesthetic. |
| **P2** | **About** | 5-Step "How I Build" Section | **REMOVE** from `/about` | Redundant with the 4-step Process on Homepage and 6-step on Services. The About page should focus on founder story, experience, education, and working principles. | **MEDIUM (Positive):** Reduces About page fatigue by 25%. |
| **P2** | **Software (Home)** | Duplicate "How I Help" bullet box in Services header | **REMOVE** right-hand bullet box in `Services.jsx` header | Repeats points already made in the Hero and WhyChoose sections. | **LOW:** Cleans up section header to let service cards take focus. |
| **P3** | **Drone (Home)** | Decorative Rotating Badge SVG in Footer/Hero | **REMOVE** repetitive spinning SVG badges | Distracts eye tracking from the primary "Book a Flight" conversion button. | **LOW:** Cleaner visual hierarchy. |

---

# 2. CONDENSE

| Page / Division | Current Content | Proposed Version | Space Saved | Reason |
|---|---|---|---|---|
| **Software (Home)** | **Services Grid (5 tall cards with full copy & button)** | **5 Compact Service Cards** (Icon, Title, 1-sentence value hook, Timeline, and "Explore Scope →" link opening scope modal). | **~55% vertical height** | Homepage visitors need a quick scan of capabilities, not an encyclopedia of deliverables. |
| **Drone (Home)** | **12 Individual Service Cards** (Aerial Photography, 4K Video, Real Estate, Construction, Hotel, Mapping, Estate Mapping, Roof Inspection, Events, Tourism, Social Media, Property Videos) | **4 Unified Category Pillars** with toggle pills or horizontal snap carousel: 1. Real Estate & Architecture, 2. Construction & Inspection, 3. Commercial & Events, 4. Mapping & Photogrammetry. | **~65% vertical height** | 12 separate tall vertical cards overwhelm the user; 4 clear pillars allow instant selection of relevant service lines. |
| **Drone (Home)** | **8 Industry Boxes (Who I Work With)** | **Compact 1-line Horizontal Icon Chip Bar** with icons for Real Estate, Construction, Architecture, Survey, Hospitality, Events, Tourism, Government. | **~70% vertical height** | Converting 8 large cards into a compact badge strip preserves industry qualification without dominating the page. |
| **Survey (Home)** | **8 Service Blocks (Cadastral, Topographic, Setting Out, Subdivision, Drone, GIS, GPS, Documentation)** | **4 Core Survey Categories** (1. Boundary & Cadastral, 2. Topographic & Contours, 3. Construction Setting Out, 4. Subdivision & Layout) with detailed deliverables in expandable scope drawer. | **~50% vertical height** | Eliminates semantic overlap between cadastral, subdivision, and documentation. |
| **Survey (Home)** | **6 Equipment Cards** | **Compact 3-Column Technical Gear Roster** with instrument name, accuracy grade, and primary use-case. | **~45% vertical height** | High-level clients need to verify professional tooling (GNSS, Total Station, Drone) without scrolling through oversized empty boxes. |
| **Projects (All)** | **Projects Grid Card Body (Long descriptions + 4 pillars + tech pills)** | **Clean Portfolio Card:** Thumbnail, Division Badge, Project Title, 1-line business impact outcome, 3 key tech/equipment tags, single "View Case Study →" link. | **~45% vertical height** | The portfolio page exists to drive clicks into case studies, not to replace the case study. |
| **About** | **Tools & Technologies (25+ verbose cards with individual sub-paragraphs)** | **Categorized Interactive Tech Grid** with clean SVG icons, tool names, and category filter chips without paragraph descriptions for each tool. | **~50% vertical height** | Tech-savvy clients only need to recognize the logos/stack; paragraphs explaining "React is a UI component library" create clutter. |
| **Contact** | **Right-Hand Side Panels (3 separate bulky cards)** | Consolidate "Direct Reach", "WhatsApp Chat", and "Social Profiles" into 1 sleek, cohesive "Direct Connect & Verification" panel. | **~40% panel height** | Eliminates visual fragmentation beside the primary intake form. |

---

# 3. MOVE TO MODAL / DRAWER

| Page / Division | Section | Trigger | Modal / Drawer Content | Reason |
|---|---|---|---|---|
| **Software & Services** | **Service Scope & Complete Deliverables** | `"Explore Full Scope & Deliverables →"` on any Service Card | **Interactive Service Scope Modal:** Detailed scope narrative, full 7-point deliverables checklist, Ideal For profile, Tech Stack badges, and "Start a Project with this Service" button. | Keeps main page clean and scannable while giving serious prospects instant access to granular deliverables without navigating away. |
| **Drone (Home)** | **Drone Hardware Specifications** | `"View Full Flight & Camera Specs ↗"` on Drone Cards | **Detailed Hardware Spec Sheet:** Sensor size, bitrate, D-Log M color profile, flight time, wind resistance, transmission range, and payload safety certifications. | Professional creative directors and inspectors can verify sensor/video specs without cluttering the landing screen for general clients. |
| **Survey (Home)** | **Survey Deliverable & Compliance Standards** | `"View Deliverable Formats & SURCON Standards ↗"` | **Technical Deliverable Sheet Drawer:** AutoCAD (.DWG/.DXF), GeoTIFF Orthomosaic, Digital Terrain Models (DTM), Coordinate Reference System (Minna Datum / UTM Zone 31N / 32N), and stamped physical plan specs. | Gives civil engineers, lawyers, and architects precise file format verification on demand. |
| **Pricing** | **Optional Add-ons Catalog (9 modular items)** | `"View All Add-ons (9) ↗"` button | **Add-ons Drawer / Modal:** Full catalog of all 9 optional capabilities with itemized pricing, descriptions, and 1-click inclusion into the Quote Builder. | Prevents 9 large add-on cards from cluttering the core 3-tier package comparison. |
| **Pricing** | **Decoupled Infrastructure Specifications** | `"View Infrastructure Specs ↗"` link on tier cards | **Infrastructure Spec Sheet Modal:** CPU, RAM, autoscaling rules, failover architecture, CDN edge nodes, and database backup protocols. | Business clients focus on uptime and reliability; engineering leads can open technical spec modal for deep architecture validation. |
| **Case Study (All)** | **Full System / Mission Architecture Blueprint** | `"View Full Architectural / Survey Blueprint ↗"` | **Architecture Topology Drawer:** Layered breakdowns of Client Layer, API Gateway, Background Workers, PostgreSQL Relational Schemas, or Survey Ground Control Networks. | Preserves the clean editorial case study narrative while offering 100% technical transparency for lead reviewers. |

---

# 4. ACCORDIONS

| Page / Division | Section | Why Hide It | Trigger Label |
|---|---|---|---|
| **Software (Home & Pricing)** | **Frequently Asked Questions (6 items)** | Keeping answers open permanently consumes >1,500px of vertical space. Accordions allow users to scan only relevant queries. | Item Title (e.g. `How does the 50/50 milestone invoicing work?`, `Who owns the source code?`) |
| **Survey (Home)** | **Survey & Land FAQs (6 items)** | Answers regarding SURCON licensing, boundary dispute procedures, and mobilization rates are valuable but shouldn't push the contact form down. | Item Title (e.g. `Are you licensed by SURCON?`, `What deliverables will I receive?`) |
| **Drone (Home)** | **Aviation & Weather FAQs (6 items)** | Questions regarding airspace authorization, weather reschedule policies, and RAW footage delivery belong in interactive accordions. | Item Title (e.g. `Do you provide RAW footage?`, `How do weather conditions affect flights?`) |
| **Case Studies (Survey & Drone)** | **Methodology & Instrument Configuration** | Secondary technical data (e.g., GNSS base/rover baseline setup, drone overlap % and shutter speeds) is valuable for peer verification but clutters the client narrative. | `View Technical Field Methodology [+]` |

---

# 5. MOBILE HORIZONTAL SCROLL

| Page / Division | Section | Current Mobile Problem | Proposed UI | Mobile Behavior |
|---|---|---|---|---|
| **Software (Home)** | **Services Grid** | 5 tall vertical cards create 3,500px of single-column scrolling. | **Horizontal Snap Carousel** | Card width ~85% viewport; 1 full card + partial peek of next card; swipe with subtle dot indicator. |
| **Software (Home)** | **Process Stepper (4 steps)** | 4 tall cards stacked vertically. | **Horizontal Step Track** | Card width ~80% viewport; linear progress bar connecting step 01 to 04 on touch swipe. |
| **Software (Pricing)** | **3 Package Tiers (Starter, Business, Business Plus)** | 3 heavy pricing cards stacked vertically cause comparison friction. | **Horizontal Snap Carousel** | Card width ~88% viewport; centered active card with instant side-by-side swipe comparison. |
| **Survey (Home)** | **Services Grid (8 services)** | 8 single-column cards create intense thumb fatigue. | **Horizontal Snap Carousel** | Card width ~82% viewport; 1 card + peek of next with smooth snap physics. |
| **Survey (Home)** | **Equipment Roster (6 cards)** | 6 stacked cards with placeholder icons. | **Horizontal 2-Row or 1-Row Snap Strip** | Compact cards (~75% viewport width) displaying instrument name and specs. |
| **Drone (Home)** | **12 Service Cards** | 12 single-column cards take >5,000px of mobile scroll depth. | **Horizontal Snap Carousel by Category** | 4 Category Slides (~85% viewport width) or swipeable service pills. |
| **Drone (Home)** | **5-Step Workflow** | 5 vertical boxes stack endlessly before portfolio. | **Horizontal Step Track** | Card width ~78% viewport; smooth horizontal swipe from Step 01 to Step 05. |
| **Projects / Case Studies** | **Related Projects / Gallery** | 4-6 stacked case study cards at the bottom of the page. | **Horizontal Snap Carousel** | Card width ~82% viewport; allows swift discovery of adjacent projects. |

---

# 6. COMBINE SECTIONS

| Existing Sections | Proposed Combined Section | Reason |
|---|---|---|
| **Drone (Home):** `Industries (8 boxes)` + `Why Choose Us (8 cards)` | **Unified "Industry Expertise & Standards" Section** | Eliminates 16 separate small boxes; combines industry target icons with the 4 core service guarantees (Planning, 4K/RAW Quality, Fast Turnaround, Safety). |
| **Survey (Home):** `Cadastral Surveys` + `Subdivision Layout` + `Land Documentation` | **Consolidated "Boundary, Cadastral & Land Titling" Pillar** | These three services share the same field instruments, legal purpose, and CAD deliverable outputs. Consolidating clarifies client selection. |
| **Software (Home):** `Hero Badge` + `Stats Counter` + `Tech Pills` | **Integrated Hero Trust Bar** | Combines founder verification badge, core capability counters, and key technologies into a sleek 1-line sub-hero anchor bar. |
| **Contact (All Divisions):** Separate Division Form Handlers | **Unified Smart Intake Engine with Division Selector** | Allows prospects to switch between `Software`, `Survey`, and `Drone` within 1 streamlined form that dynamically adapts relevant dropdowns (e.g. Land Area for Survey, Shot Type for Drone, App Architecture for Software). |

---

# 7. MOVE TO OTHER PAGES

| Current Page | Content | Destination | Reason |
|---|---|---|---|
| **Services (Software)** | Full Interactive Pricing Calculator | `/pricing` (Dedicated Pricing Page) | Services page should explain capabilities and outcomes; pricing should be explored on the dedicated quote builder. |
| **Software (Software Home)** | Detailed Milestone Payment Terms Breakdown | `/pricing#milestones` | Keeps the Software technical landing page focused on architecture, performance, and engineering case studies. |
| **About Page** | 25+ Verbose Technology Descriptions | Modal or `/software#stack` | The About page exists to build human trust, personal background, and verified experience. |
| **Survey & Drone Detail Pages** | Full Global Software Navigation Header | Division-Aware Sub-Nav with Global Switcher | Prevents confusing clients who entered through a survey/drone link with irrelevant software development links. |

---

# 8. VISUAL CLUTTER

| Page / Division | Element | Recommendation | Reason |
|---|---|---|---|
| **Footer (Global)** | Matter.js Physics Tech Stack Canvas | **PAUSE / SLEEP on Scroll** *(Implemented)* or replace with clean static tech strip | Prevents background CPU/GPU overhead when offscreen; maintains battery life and page responsiveness. |
| **Survey (Home)** | Large Generic Tool Icon Boxes (`⚙`) | **REDUCE / STREAMLINE** to minimalist hairline spec tags | Eliminates unpolished placeholder look; gives a crisp engineering blueprint feel. |
| **Drone (Home)** | Multiple Overlapping Drone Annotations in Hero | **REDUCE** to 3 key callouts (`48MP RAW Stills`, `4K/60fps Video`, `Omnidirectional Avoidance`) | Avoids visual noise on smaller tablet/laptop screens. |
| **All Pages** | Excessive Em Dashes (`—`) in Body Copy | **REMOVE / REPLACE** with commas, periods, or natural phrasing *(Implemented)* | Improves scannability and prevents abrupt typography breaks. |
| **Projects (All)** | Multiple Duplicate Badges (Category + Year + Tech + Status) | **REDUCE** to 2 essential badges: `Category` and `Primary Outcome/Metric` | Keeps card thumbnails uncluttered and visual-first. |

---

# 9. KEEP EXACTLY AS-IS (Conversion Anchors)

The following elements are vital for **trust, conversion, legal positioning, and technical qualification** and will NOT be removed:

1. **50/50 Milestone Invoicing Terms:** (50% upfront deposit to commence architecture/fieldwork, 50% upon final delivery, testing, and signoff).
2. **4 Months Included Post-Launch Warranty & Maintenance:** (Software engineering differentiator).
3. **100% Intellectual Property & Source Code Transfer:** (Complete repository transfer and copyright handover).
4. **SURCON Registered Supervision & Compliance:** (Guarantees land survey legitimacy for Nigerian land transactions).
5. **Real Hardware Fleet Transparency:** (DJI Mini 4 Pro and DJI Mini 4K verified specs; no fake LiDAR/enterprise claims).
6. **Location-Aware Currency Switching (NGN / USD):** (Allows instant quotes for local Nigerian and international diaspora/overseas clients).
7. **Direct Founder Contact & Engineering Ownership:** (Eugene Odibenuah as the direct engineer and surveyor, eliminating agency middleman markup).
8. **Live Case Study Metric Proof:** (Verified load times, transaction volumes, survey hectare accuracy, and 4K footage deliverables).

---

# 10. PRIORITY IMPLEMENTATION PLAN

## Phase 1 — High Impact (Immediate Conversion & Scroll Depth Reduction)
* [ ] **Software:** Remove inactive SaaS product sections from Homepage and Software page.
* [ ] **Software:** Ensure Services page routes to `/pricing` instead of embedding the 74KB pricing calculator.
* [ ] **Drone:** Consolidate 12 individual service cards into 4 distinct commercial pillars with mobile horizontal snap carousels.
* [ ] **Drone:** Condense 8 "Why Hire Me" cards down to 4 focused differentiators.
* [ ] **Survey:** Consolidate 8 survey services into 4 primary disciplines and convert 6 equipment cards into a sleek 3-column technical roster.
* [ ] **Survey:** Streamline equipment cards into a crisp 3-column technical roster.

## Phase 2 — Medium Impact (Progressive Disclosure & Modals)
* [ ] **Pricing:** Move 9 optional add-on feature cards and deep infrastructure specifications into interactive modal drawers.
* [ ] **Software:** Implement "Explore Full Scope" modal drawers on all Service cards.
* [ ] **Drone & Survey:** Add "View Full Specs" modal drawers for drone hardware and survey coordinate standards.
* [ ] **About:** Convert 25+ tool descriptions into a compact, categorized icon grid with filter chips.
* [ ] **Contact:** Unify the contact/intake sidebar into 1 cohesive "Direct Reach & Verification" panel.

## Phase 3 — Polish (Mobile Touch Ergonomics & Visual Refinements)
* [ ] **Mobile:** Enable smooth horizontal snap physics (`snap-x snap-mandatory`) across all testimonial, process step, and project cards on mobile screens.
* [ ] **Navigation:** Ensure seamless division-aware switching between Software, Survey, and Drone portfolios.
* [ ] **Visual:** Polish hairline borders and typography hierarchy across light (Survey) and dark (Drone/Software) theme surfaces.

---

# 11. BEFORE / AFTER PAGE STRUCTURE

```
================================================================================
HOME (SOFTWARE DIVISION)
================================================================================
CURRENT STRUCTURE:                       PROPOSED STRUCTURE:
• Hero with Founder Badge & Subtext      • Hero with Integrated Trust Bar
• Capability Stats Counter               • Featured Case Studies (Visual Proof)
• Services (5 tall cards)                • Core Services (5 Compact Cards + Scope Modal)
• Why Choose BuildWithLami (4 cards)     • Why BuildWithLami (4-Col Trust Strip)
• How It Works (4-Step Stepper)          • How It Works (Horizontal Snap on Mobile)
• Internal SaaS Ventures (3 cards)       • Client Testimonials (Compact Snap)
• Featured Projects Grid                 • Transparent 50/50 Pricing Overview
• Testimonials Carousel                  • FAQ Accordion (6 items)
• FAQ Accordion                          • Direct Action CTA Banner -> /contact
• Full Inline Contact Form               • Footer with Optimized Tech Roster
• Matter.js Footer Physics Canvas

================================================================================
DRONE DIVISION (DRONE HOME)
================================================================================
CURRENT STRUCTURE:                       PROPOSED STRUCTURE:
• Sticky Drone Navbar                    • Sticky Drone Navbar
• Split Hero + Drone Annotation Visual   • Split Hero with 3 Focused Annotations
• 4-Metric Capabilities Banner           • 4-Metric Capabilities Banner (Black Bar)
• 12 Individual Vertical Service Cards   • 4 Core Commercial Service Pillars (Snap Carousel)
• 5-Step Process Workflow Cards          • 5-Step Workflow (Horizontal Mobile Track)
• 8 Industry Target Cards                • 1-Line Industry Icon Chip Bar
• 6 Portfolio Case Study Cards           • Selected Flight Missions (Grid / Snap)
• 2 Equipment Cards (8 specs each)       • Hardware Fleet Roster + Spec Modal Drawer
• 8 "Why Clients Hire Me" Cards          • 4 Core Differentiators (Planning, Quality, Speed, Safety)
• Survey Sister Division Cross-Link      • Compact Survey Cross-Sell Banner
• 6 FAQ Accordions                       • 6 FAQ Accordions
• Full Inline Flight Booking Form        • Streamlined Flight Booking Engine
• Footer                                 • Footer

================================================================================
SURVEY DIVISION (SURVEY HOME)
================================================================================
CURRENT STRUCTURE:                       PROPOSED STRUCTURE:
• 3-Column Editorial Hero & CV Download  • 3-Column Editorial Hero with Stamped Badge
• 8 Vertical Survey Service Blocks       • 4 Unified Survey Categories (Snap Carousel)
• Selected Works Portfolio Cards         • Field Portfolio (Interactive Case Studies)
• 6 Equipment Cards with Gear Icons (⚙)  • 3-Column Precision Tool Roster (Clean Specs)
• Drone Sister Division Cross-Link       • Compact Drone Aerial Cross-Sell Banner
• 6 FAQ Accordions                       • 6 FAQ Accordions
• Full Inline Land Survey Booking Form   • Fast Site Survey Intake Form (Area, Location, Type)
• Footer                                 • Footer

================================================================================
SERVICES PAGE
================================================================================
CURRENT STRUCTURE:                       PROPOSED STRUCTURE:
• Hero Header                            • Hero Header
• 5 Detailed Service Blocks              • 5 Compact Service Cards with Outcome Highlights
• 6-Step Methodology Stepper             • Progressive Scope Modal ("What's Included")
• Full Embedded 74KB Pricing Component   • Milestone Invoicing Guarantee Summary Card
• Full Inline Contact Form               • Direct CTA -> /contact?service=selected

================================================================================
PRICING PAGE
================================================================================
CURRENT STRUCTURE:                       PROPOSED STRUCTURE:
• Currency Switcher (NGN / USD)          • Currency Switcher (NGN / USD)
• 3 Package Tiers with Long Feature Lists • 3 Side-by-Side Clean Comparison Cards
• 9 Large Add-on Cards                   • Interactive Quote Builder (4 Steps)
• Decoupled Infrastructure Cards         • Optional Add-ons Drawer ("View All 9 Add-ons ↗")
• Milestone Billing Explanations         • Infrastructure Spec Modal
• FAQ Accordion                          • Milestone Terms Guarantee Card + FAQ Accordion
• Inline Contact Form                    • Pre-filled Quote CTA -> /contact?quote=...
```

---

# 12. FINAL APPROVAL CHECKLIST

Please review and select the recommendations to implement:

- [ ] **1. APPROVE SOFTWARE REMOVALS:** Remove internal SaaS ventures, remove embedded pricing from `/services`, and replace duplicate subpage forms with focused routing banners.
- [ ] **2. APPROVE DRONE CONSOLIDATION:** Consolidate 12 drone service cards into 4 commercial pillars (Real Estate, Construction/Inspection, Commercial/Events, Photogrammetry) with mobile snap carousel.
- [ ] **3. APPROVE DRONE "WHY HIRE ME" CONDENSATION:** Reduce 8 drone cards to 4 core pillars (Planning, 4K/RAW Quality, Fast Turnaround, Safe Flights).
- [ ] **4. APPROVE SURVEY RESTRUCTURING:** Consolidate 8 survey services into 4 primary disciplines and convert 6 equipment cards into a sleek 3-column technical roster.
- [ ] **5. APPROVE MODAL & DRAWER PROGRESSIVE DISCLOSURE:** Move granular checklists, drone flight specs, survey coordinate frameworks, and pricing add-ons into modal drawers.
- [ ] **6. APPROVE MOBILE HORIZONTAL CAROUSELS:** Implement touch-friendly horizontal snap scrolling (`~85%` card width) for all tall vertical card stacks on mobile devices.
- [ ] **7. APPROVE ACCORDION CONVERSIONS:** Keep all FAQ sections and deep methodology notes cleanly tucked in interactive accordions.
- [ ] **8. APPROVE PRESERVATION OF CONVERSION ANCHORS:** Maintain 50/50 milestone invoicing, 4-month support, 100% IP transfer, SURCON compliance, and authentic hardware fleet specifications.

---

> **Awaiting your review and explicit approval on the items above before modifying any codebase files.**
