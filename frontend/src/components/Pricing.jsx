import React, { useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Check, 
  ArrowRight, 
  Sparkles, 
  Server, 
  Cpu, 
  Layers, 
  Globe, 
  Zap, 
  Sliders, 
  Calculator,
  ChevronRight,
  ShieldCheck,
  Package,
  Plus,
  X,
  HelpCircle,
  Lock,
  RefreshCw
} from 'lucide-react';
import CheckIcon from './CheckIcon';
import { staggerContainer, fadeUpItem, cardHover, sectionViewport, reducedMotionVariants } from '../utils/motion';
import { useAutomatedCurrency } from '../utils/currency';

export const PRICING_DATA = {
  NGN: {
    symbol: "₦",
    regionLabel: "Nigeria & African Region (NGN)",
    categories: {
      websites: {
        id: "websites",
        label: "🌐 Web Development",
        title: "01. Web Development",
        desc: "Custom, responsive, high-performance websites built for real business conversion.",
        starting: "350,000",
        whatAffectsPricing: [
          "Number of unique page templates and content types",
          "Custom CMS, API, or third-party integrations",
          "Performance, accessibility, and SEO requirements",
          "Content migration from an existing website",
          "Browser/device support and launch QA scope"
        ],
        pricingNotes: "Prices are starting points in NGN. The final figure is confirmed after the brief, content audit, and technical scope are understood. Hosting, domain, and ongoing maintenance are quoted separately from the initial build.",
        tiers: [
          {
            id: "web_starter",
            name: "Starter",
            badge: "Focused 1–5 Page Website",
            price: "350,000",
            numPrice: 350000,
            bestFor: "Individuals, startups, and small businesses launching their first site.",
            examples: "e.g. Creator Showcase, Brand Presence, Product Waitlist",
            timeline: "1–2 weeks",
            revisions: "1 round of revisions on the agreed design",
            support: "14 days of bug-fix support after launch",
            desc: "A focused, responsive one-to-five page website with a clear content structure.",
            features: [
              "Technical planning and site architecture",
              "Up to 5 responsive page templates",
              "Core content components & layouts",
              "Accessibility fundamentals and launch QA",
              "Contact form & direct WhatsApp action",
              "Mobile-first speed & performance optimization"
            ],
            notIncluded: [
              "CMS / self-editable content backend",
              "Copywriting & long-form content creation",
              "Photography & stock asset licenses",
              "Third-party custom API integrations",
              "Ongoing monthly maintenance"
            ]
          },
          {
            id: "web_growth",
            name: "Growth",
            badge: "Complete Custom Website + CMS",
            price: "850,000",
            numPrice: 850000,
            popular: true,
            popularBadge: "⭐ Best Value",
            bestFor: "Growing businesses that need to update content and rank online.",
            examples: "e.g. Corporate Firms, Service Agencies, B2B Businesses",
            timeline: "2–4 weeks",
            revisions: "2 rounds of revisions on the agreed design",
            support: "30 days of priority bug-fix support after launch",
            desc: "A complete custom website with an editable CMS, integrations, and performance work.",
            features: [
              "Everything in Starter",
              "CMS & content integration so you can edit content yourself",
              "Up to 10 page templates and core content types",
              "On-page SEO, schema markup & Core Web Vitals",
              "Cross-browser and multi-device QA testing",
              "Google Analytics 4 & Search Console setup"
            ],
            notIncluded: [
              "Custom web application architectures",
              "Full e-commerce checkout & order matrix",
              "Paid ad management & ongoing campaign spend",
              "Ongoing monthly content writing"
            ]
          },
          {
            id: "web_pro",
            name: "Pro",
            badge: "Large Scale & Multi-System",
            price: "Custom Quote",
            numPrice: 1800000,
            bestFor: "Businesses with complex requirements, multiple systems, or larger content structures.",
            examples: "e.g. Multi-Branch Portals, Enterprise Corporate, Directories",
            timeline: "4–8 weeks",
            revisions: "Defined in statement of work (SOW)",
            support: "Agreed post-launch support window (up to 4 months)",
            desc: "A larger custom build with complex content models, workflows, or integrations — scoped to your requirements.",
            features: [
              "Everything in Growth",
              "Advanced content modeling and editorial workflows",
              "Custom API, webhook, and third-party integrations",
              "Legacy data migration and 301 redirect strategy",
              "Detailed launch documentation, staging environments & handover",
              "Multi-region or localized structure"
            ],
            notIncluded: [
              "Hosting and domain registrar fees",
              "Third-party external SaaS subscription fees",
              "Unlimited changes outside the agreed statement of work"
            ]
          }
        ]
      },
      ecommerce: {
        id: "ecommerce",
        label: "🛒 E-Commerce ⭐",
        title: "02. E-Commerce Engines",
        desc: "Online stores designed for clearer paths to purchase, multi-gateway payments, and inventory sync.",
        starting: "650,000",
        whatAffectsPricing: [
          "Catalogue size and product-variant complexity",
          "Platform choice (Custom React/Node, Shopify, or WooCommerce)",
          "Payment, shipping, tax, and inventory integrations",
          "Migration of products, customers, and legacy orders",
          "Conversion testing and post-launch iteration"
        ],
        pricingNotes: "Payment gateway and carrier transaction fees are passed through separately. Stores with large catalog migrations are scoped after inventory audit.",
        tiers: [
          {
            id: "ecom_starter",
            name: "Starter",
            badge: "Focused Boutique Storefront",
            price: "650,000",
            numPrice: 650000,
            bestFor: "New sellers launching a focused product line or boutique.",
            examples: "e.g. Emerging Boutiques, Single-Product Brands",
            timeline: "2–3 weeks",
            revisions: "1 round of revisions on the agreed design",
            support: "14 days of launch bug-fix support",
            desc: "A focused storefront for a small catalogue with a straightforward buying path.",
            features: [
              "Store strategy and catalogue architecture",
              "Custom responsive storefront design",
              "Checkout & primary payment gateway (Paystack / Cards)",
              "Up to 25 products & variants configured",
              "Flat-rate shipping rules & local delivery setup",
              "Order management & stock dashboard"
            ],
            notIncluded: [
              "Product photography & studio editing",
              "Copywriting & product descriptions",
              "Automated multi-courier API integrations",
              "Paid ad management"
            ]
          },
          {
            id: "ecom_growth",
            name: "Growth",
            badge: "Serious Growing Brands",
            price: "1,200,000",
            numPrice: 1200000,
            popular: true,
            popularBadge: "⭐ Best Value",
            bestFor: "Growing stores that want better conversion and easier management.",
            examples: "e.g. Fashion Brands, Multi-Product Stores, Beauty Lines",
            timeline: "4–6 weeks",
            revisions: "2 rounds of revisions on the agreed design",
            support: "30 days of priority bug-fix support after launch",
            desc: "A conversion-focused store with shipping, tax, analytics, and launch support.",
            features: [
              "Everything in Starter",
              "Up to 100 products with multi-variant matrices & filters",
              "Multi-zone shipping rules (Lagos, Interstate & International)",
              "Automated abandoned-cart recovery & email capture",
              "Customer accounts & past order lookup portal",
              "Discounts, promo codes & gift cards engine",
              "GA4 e-commerce events & Meta Pixel conversion tracking"
            ],
            notIncluded: [
              "Manual product data entry beyond 100 products",
              "Direct paid advertising spend",
              "Custom warehouse & ERP logistics integrations"
            ]
          },
          {
            id: "ecom_pro",
            name: "Pro",
            badge: "Advanced Operations & Logistics",
            price: "Custom Quote",
            numPrice: 2500000,
            bestFor: "High-volume or multi-region stores with complex operations.",
            examples: "e.g. Global Retailers, Multi-Warehouse Inventories",
            timeline: "6–10 weeks",
            revisions: "Defined in statement of work (SOW)",
            support: "Agreed post-launch support window (up to 4 months)",
            desc: "A larger store with migration, complex catalogues, or multiple integrations.",
            features: [
              "Everything in Growth",
              "100+ products with complex inventory & warehouse ledgers",
              "Multi-currency & international payment handoff (USD / GBP / NGN)",
              "Dynamic shipping rules & courier API sync (GIG / DHL / Fez)",
              "Product, customer, and historical order migration",
              "Custom automation webhooks & ERP / accounting sync",
              "Post-launch conversion optimization plan"
            ],
            notIncluded: [
              "Platform subscriptions & credit card transaction fees",
              "Unlimited manual catalog entry",
              "Physical warehouse fulfillment management"
            ]
          }
        ]
      },
      software: {
        id: "software",
        label: "⚙️ Custom Software",
        title: "03. Custom Software & SaaS",
        desc: "Bespoke web applications, SaaS prototypes, and internal systems built for operational scale.",
        starting: "1,200,000",
        whatAffectsPricing: [
          "Database complexity and role-based access logic",
          "Third-party API integrations and webhook pipelines",
          "Real-time data streaming & WebSocket requirements",
          "Security compliance and multi-tenant isolation",
          "Automated CI/CD testing and deployment staging"
        ],
        pricingNotes: "Custom software is delivered with 100% source code ownership and full GitHub repository handover. Cloud hosting and API token costs are paid directly to providers.",
        tiers: [
          {
            id: "soft_mvp",
            name: "MVP Platform",
            badge: "Product Validation & Prototypes",
            price: "1,200,000",
            numPrice: 1200000,
            bestFor: "Founders, startups, and teams validating a new software product.",
            examples: "e.g. SaaS MVP, Client Data Portal, Booking Engine",
            timeline: "4–6 weeks",
            revisions: "1 iteration round on validated prototype",
            support: "30 days post-launch engineering support",
            desc: "Custom full-stack software built to test market demand, automate core business logic, and onboard early users.",
            features: [
              "Tailored database schema & secure REST APIs",
              "Protected authentication & Role-Based Access Control (RBAC)",
              "Custom interactive client/admin dashboard",
              "Payment gateway & webhook trigger pipelines",
              "Transactional email & SMS notification workflows",
              "100% intellectual property & source code transfer"
            ],
            notIncluded: [
              "Multi-tenant enterprise partitioning",
              "Custom native mobile apps (iOS/Android)",
              "Third-party cloud infrastructure subscription costs"
            ]
          },
          {
            id: "soft_growth",
            name: "Growth Platform",
            badge: "Full-Scale Business Systems",
            price: "2,000,000+",
            numPrice: 2000000,
            popular: true,
            popularBadge: "⭐ High-Scale Architecture",
            bestFor: "Scaling companies needing internal ERPs, fintech tools & custom portals.",
            examples: "e.g. Custom ERP, Financial Ledger, Multi-Role Portal",
            timeline: "6–10 weeks",
            revisions: "2 review cycles during phased delivery",
            support: "60 days priority engineering support",
            desc: "Robust architecture with multi-role workflows, automated reporting ledgers, and secure integration pipelines.",
            features: [
              "Everything in MVP Platform",
              "Complex multi-role business logic & encrypted data vault",
              "Automated financial ledgers & invoice generation pipelines",
              "Custom CRM pipelines & external partner integrations",
              "Real-time WebSocket updates & audit activity logs",
              "Staging environments, automated CI/CD & unit tests"
            ],
            notIncluded: [
              "Third-party SMS/WhatsApp gateway credit costs",
              "Uncapped 24/7 on-call engineering",
              "On-premise bare-metal server cabling"
            ]
          },
          {
            id: "soft_enterprise",
            name: "Enterprise",
            badge: "Mission-Critical SaaS & ERP",
            price: "Custom Quote",
            numPrice: 4000000,
            bestFor: "Multi-tenant SaaS platforms, enterprise ERPs & mission-critical systems.",
            examples: "e.g. Multi-Tenant SaaS, High-Volume Data Systems",
            timeline: "Scoped during discovery",
            revisions: "Defined in statement of work",
            support: "Dedicated SLA & on-demand engineering",
            desc: "Dedicated cloud infrastructure, custom SLAs, compliance pipelines, and 100% intellectual property transfer.",
            features: [
              "Multi-tenant data isolation & compliance protocols",
              "High-availability cloud setup with 99.9% uptime SLA target",
              "Dedicated data pipelines & large-scale asynchronous processing",
              "Complete IP transfer, GitHub repo & architecture docs",
              "Dedicated priority SLA & on-demand engineering"
            ],
            notIncluded: [
              "Hosting compute and server bandwidth fees",
              "Third-party external enterprise licensing",
              "Unlimited changes outside the agreed statement of work"
            ]
          }
        ]
      },
      ui_ux: {
        id: "ui_ux",
        label: "🎨 UI/UX Design",
        title: "04. UI/UX Design",
        desc: "Clear interfaces for complex ideas, shaped around real user flows and developer-ready systems.",
        starting: "280,000",
        whatAffectsPricing: [
          "Number of unique screens and user flows",
          "Research, prototyping, and usability-testing depth",
          "Design-system and component library requirements",
          "Responsive breakpoints and device coverage",
          "Developer-handoff and collaboration needs"
        ],
        pricingNotes: "UI/UX deliverables include editable Figma source files, tokens, and developer specifications. Frontend coding is quoted separately or under Web Development.",
        tiers: [
          {
            id: "ui_starter",
            name: "Starter",
            badge: "Focused Flow or Landing",
            price: "280,000",
            numPrice: 280000,
            bestFor: "Founders and teams validating one focused part of a product.",
            examples: "e.g. Single User Flow, SaaS Landing Page, App Onboarding",
            timeline: "1–2 weeks",
            revisions: "1 round of revisions",
            support: "One round of implementation clarification",
            desc: "A focused interface or flow with clear structure and considered visual design.",
            features: [
              "Product and user-flow mapping",
              "Information architecture & wireframes",
              "Responsive high-fidelity Figma design",
              "Up to 6 key screens",
              "Developer-ready specifications and assets"
            ],
            notIncluded: [
              "User research with recruited external participants",
              "Complex multi-state interactive prototyping",
              "Complete design system with token governance",
              "Frontend code implementation"
            ]
          },
          {
            id: "ui_growth",
            name: "Growth",
            badge: "Multi-Flow Product Design",
            price: "750,000",
            numPrice: 750000,
            popular: true,
            popularBadge: "⭐ Best Value",
            bestFor: "Teams building a real product that needs usable, tested flows.",
            examples: "e.g. Web App UI, SaaS Portal, Mobile-Responsive App",
            timeline: "3–4 weeks",
            revisions: "2 rounds of revisions",
            support: "Designer availability during build phase",
            desc: "A multi-flow product design engagement with wireframes and an interactive prototype.",
            features: [
              "Everything in Starter",
              "Interactive clickable Figma prototype",
              "Component and design-token guidance",
              "Up to 18 screens and core application states",
              "Responsive state and edge-case review",
              "Organized Figma library with auto-layout"
            ],
            notIncluded: [
              "Frontend software development",
              "Paid user testing recruitment fees",
              "Unlimited screen additions"
            ]
          },
          {
            id: "ui_pro",
            name: "Pro",
            badge: "Design System & Product Platform",
            price: "Custom Quote",
            numPrice: 1600000,
            bestFor: "Products that need a reusable, governed design system.",
            examples: "e.g. Multi-Role SaaS, Enterprise Portals, App Ecosystems",
            timeline: "4–8 weeks",
            revisions: "Defined in statement of work",
            support: "Ongoing collaboration arrangement available",
            desc: "A broader product design system with multiple flows and stakeholder collaboration.",
            features: [
              "Everything in Growth",
              "Expanded flow and interaction modeling",
              "Structured design-system documentation & tokens",
              "Direct collaboration during frontend implementation",
              "Iterative review cycles and usability audits"
            ],
            notIncluded: [
              "Software engineering & code development",
              "Unlimited out-of-scope screen expansion"
            ]
          }
        ]
      },
      branding: {
        id: "branding",
        label: "✨ Branding & Identity",
        title: "05. Branding & Graphic Design",
        desc: "A visual identity that is recognizable, consistent, and built for real digital and physical use.",
        starting: "250,000",
        whatAffectsPricing: [
          "Research, positioning, and naming work required",
          "Number of decision makers and review cycles",
          "Range of applications (digital, print, campaign, social)",
          "Asset delivery formats and guideline depth"
        ],
        pricingNotes: "Editable source files are organized for practical everyday use. Legal trademark and CAC registration fees are handled separately by legal partners.",
        tiers: [
          {
            id: "brand_starter",
            name: "Starter",
            badge: "Core Identity Foundation",
            price: "250,000",
            numPrice: 250000,
            bestFor: "New businesses, consultancies, and personal brands.",
            examples: "e.g. New Startup, Consultant Brand, Creator Identity",
            timeline: "1–2 weeks",
            revisions: "2 logo concepts, 1 round of revisions",
            support: "File handover and usage guidance",
            desc: "A focused identity foundation with the core mark, typography, and color system.",
            features: [
              "Brand direction and positioning brief",
              "Logo and identity design (Primary & Secondary)",
              "Typography pairing and color palette system",
              "Core digital applications (Social display, Favicon)",
              "Practical usage guidelines PDF"
            ],
            notIncluded: [
              "Full comprehensive brand strategy book",
              "Physical print production & manufacturing",
              "Naming and trademark legal filing",
              "Multi-channel advertising campaigns"
            ]
          },
          {
            id: "brand_growth",
            name: "Growth",
            badge: "Complete Identity System",
            price: "600,000",
            numPrice: 600000,
            popular: true,
            popularBadge: "⭐ Best Value",
            bestFor: "Growing brands that need consistency across all channels.",
            examples: "e.g. Retail Brands, Professional Practices, Fast-Growing Startups",
            timeline: "2–3 weeks",
            revisions: "3 concepts, 2 rounds of revisions",
            support: "30 days of asset support after handover",
            desc: "A complete identity system across priority digital and communication applications.",
            features: [
              "Everything in Starter",
              "3 distinct brand concepts",
              "Social media post, story & banner template system",
              "Business stationery (Cards, Letterhead, Invoice template)",
              "Priority digital templates (Figma & Canva formats)",
              "Organized vector asset delivery (SVG, PNG, PDF, AI)"
            ],
            notIncluded: [
              "Large-scale commercial print runs",
              "Video/motion advertising production",
              "Legal trademark registration"
            ]
          },
          {
            id: "brand_pro",
            name: "Pro",
            badge: "Brand Programme & Governance",
            price: "Custom Quote",
            numPrice: 1400000,
            bestFor: "Organisations with multiple teams and channels using the identity.",
            examples: "e.g. Multi-Brand Groups, Corporate Conglomerates, Product Suites",
            timeline: "4–6 weeks",
            revisions: "Defined in statement of work",
            support: "Agreed handover and support period",
            desc: "A broader identity programme with extended applications and campaign systems.",
            features: [
              "Everything in Growth",
              "Extended brand application range & packaging guidelines",
              "Campaign or launch design system",
              "Detailed comprehensive brand manual & voice guidelines",
              "Master pitch deck and marketing presentation templates"
            ],
            notIncluded: [
              "Ongoing design retainer after handover",
              "Third-party physical manufacturing and printing costs"
            ]
          }
        ]
      },
      seo: {
        id: "seo",
        label: "📈 Search Engine SEO",
        title: "06. Search Engine Optimization (SEO)",
        desc: "Search visibility built on a clean, technically sound website, structured schema, and clear search intent.",
        starting: "220,000",
        whatAffectsPricing: [
          "Current technical health and site size",
          "Competition and starting search position",
          "Content opportunity and production capacity",
          "Migration, redesign, or relaunch requirements",
          "Ongoing measurement and iteration cadence"
        ],
        pricingNotes: "No ranking position is artificially guaranteed; legitimate SEO focuses on technical excellence, content relevance, and indexability. Audits are one-time; ongoing management is billed monthly.",
        tiers: [
          {
            id: "seo_starter",
            name: "Starter",
            badge: "Technical & On-Page Audit",
            price: "220,000",
            numPrice: 220000,
            bestFor: "Any site that wants to understand its SEO baseline and discover errors.",
            examples: "e.g. Existing Website, New Product Relaunch",
            timeline: "1–2 weeks",
            revisions: "One read-through and Q&A review call",
            support: "Email clarification for 14 days",
            desc: "A focused technical and on-page audit with a prioritized implementation plan.",
            features: [
              "Technical SEO crawl & indexation review",
              "On-page structure, heading & metadata review",
              "Keyword & search-intent snapshot",
              "Prioritized fix and opportunity list",
              "Clear developer implementation action plan"
            ],
            notIncluded: [
              "Direct code implementation of changes",
              "Long-form content article writing",
              "Ongoing monthly link acquisition"
            ]
          },
          {
            id: "seo_growth",
            name: "Growth",
            badge: "Audit + Technical Implementation",
            price: "550,000",
            numPrice: 550000,
            popular: true,
            popularBadge: "⭐ Best Value",
            bestFor: "Sites ready to act on the audit and improve measurable visibility.",
            examples: "e.g. Lead Gen Sites, Service Agencies, Local Businesses",
            timeline: "3–4 weeks",
            revisions: "2 review rounds on delivered work",
            support: "30 days of monitoring and guidance",
            desc: "An audit plus focused implementation of the highest-value technical and content work.",
            features: [
              "Everything in Starter",
              "Direct on-page technical fixes & schema markup",
              "Core Web Vitals & mobile speed optimization",
              "Google Search Console & Google Business Profile optimization",
              "Content opportunity roadmap and keyword mapping",
              "Measurement & conversion tracking verification"
            ],
            notIncluded: [
              "Guaranteed #1 ranking claims",
              "Paid search ads management",
              "Long-form content production beyond agreed scope"
            ]
          },
          {
            id: "seo_pro",
            name: "Pro",
            badge: "Ongoing Monthly SEO Retainer",
            price: "350,000 / mo",
            numPrice: 350000,
            bestFor: "Sites that want continuous, sustained search improvement and organic leads.",
            examples: "e.g. Active Businesses, Competitive Industries",
            timeline: "Monthly retainer (Min 3 months)",
            revisions: "Included as part of monthly cycle",
            support: "Monthly review and async support",
            desc: "A recurring monthly rhythm of measurement, iteration, and content improvement.",
            features: [
              "Everything in Growth",
              "Monthly search performance review & reporting",
              "Ongoing content optimization and technical health checks",
              "Competitor search monitoring & ranking tracking",
              "Adjusted monthly SEO roadmap and content guidance"
            ],
            notIncluded: [
              "Guaranteed search engine rankings",
              "Paid advertising spend",
              "Unlimited content production"
            ]
          }
        ]
      },
      digital_marketing: {
        id: "digital_marketing",
        label: "📣 Digital Marketing",
        title: "07. Digital Marketing & Campaigns",
        desc: "Focused campaigns, high-converting landing pages, and tracking systems designed around measurable leads.",
        starting: "250,000",
        whatAffectsPricing: [
          "Audience, offer, and channel mix",
          "Campaign duration and creative volume",
          "Creative, landing-page, and tracking requirements",
          "Advertising budget (managed separately from studio fees)"
        ],
        pricingNotes: "Advertising spend is paid directly to Meta, Google, or LinkedIn platforms and is not included in studio fees. Commercial learning signals and conversion targets are agreed up front.",
        tiers: [
          {
            id: "mkt_starter",
            name: "Starter",
            badge: "Campaign Strategy & Plan",
            price: "250,000",
            numPrice: 250000,
            bestFor: "Teams that need a clear strategy before spending budget on campaigns.",
            examples: "e.g. Product Launch, Service Campaign, Seasonal Promo",
            timeline: "1–2 weeks",
            revisions: "1 revision round",
            support: "One strategy review call",
            desc: "A focused campaign plan with audience, channel, and messaging direction.",
            features: [
              "Channel and campaign strategy framework",
              "Target audience persona & offer positioning",
              "Content themes, hook angles & calendar planning",
              "Lead tracking & measurement framework",
              "First visual creative direction concepts"
            ],
            notIncluded: [
              "Direct paid advertising spend",
              "High-volume creative production",
              "Daily campaign management",
              "Custom landing page code build"
            ]
          },
          {
            id: "mkt_growth",
            name: "Growth",
            badge: "Campaign Creative + Landing Page",
            price: "700,000",
            numPrice: 700000,
            popular: true,
            popularBadge: "⭐ Best Value",
            bestFor: "Businesses ready to launch and measure an active campaign.",
            examples: "e.g. Lead Generation, Event Registration, E-Commerce Push",
            timeline: "2–3 weeks",
            revisions: "2 revision rounds",
            support: "30 days of campaign monitoring",
            desc: "A connected campaign with creative system, landing page, and tracking in place.",
            features: [
              "Everything in Starter",
              "High-converting custom landing page design & build",
              "Social media ad creative & copy set (5 variations)",
              "Meta Pixel, Google Tag & conversion API setup",
              "Lead capture integration (CRM / WhatsApp / Email)",
              "30-day performance review & optimization report"
            ],
            notIncluded: [
              "Direct platform ad spend",
              "Ongoing monthly management beyond 30 days",
              "High-budget video commercial production"
            ]
          },
          {
            id: "mkt_pro",
            name: "Pro",
            badge: "Ongoing Growth Retainer",
            price: "850,000 / mo",
            numPrice: 850000,
            bestFor: "Teams that want continuous marketing and creative iteration without hiring in-house.",
            examples: "e.g. Monthly Lead Gen, E-Commerce Growth, Brand Scale",
            timeline: "Monthly retainer",
            revisions: "Included within monthly cadence",
            support: "Weekly performance review & async channel",
            desc: "A recurring campaign or content system with production, review, and iteration.",
            features: [
              "Everything in Growth",
              "Agreed monthly content & ad creative cadence",
              "Ongoing creative testing (hooks, copy, visuals)",
              "Landing page A/B testing & conversion rate optimization",
              "Weekly performance reporting & next-cycle adjustments"
            ],
            notIncluded: [
              "Direct platform advertising spend",
              "Unlimited daily creative requests",
              "Artificial guaranteed sales projections"
            ]
          }
        ]
      },
      ai_automation: {
        id: "ai_automation",
        label: "⚡ AI & Automations",
        title: "08. AI Solutions & Automations",
        desc: "Practical AI workflows, automated lead routing, and custom CRM integrations where they genuinely help.",
        starting: "450,000",
        whatAffectsPricing: [
          "Clarity and repeatability of the workflow",
          "Data access, API quality, and provider constraints",
          "Number and complexity of third-party integrations",
          "Human review, fallback, and safety requirements"
        ],
        pricingNotes: "Every solution starts with the smallest useful prototype before scaling. Third-party AI provider token costs (OpenAI, Anthropic, Make) are billed directly.",
        tiers: [
          {
            id: "ai_starter",
            name: "Starter",
            badge: "Focused Workflow Prototype",
            price: "450,000",
            numPrice: 450000,
            bestFor: "Teams that want to validate an automation or AI idea before larger investment.",
            examples: "e.g. Automated Lead Qualification, WhatsApp Auto-Responder",
            timeline: "2–3 weeks",
            revisions: "1 iteration round on prototype",
            support: "14 days of handover support",
            desc: "A focused, testable workflow prototype that proves the automation is useful.",
            features: [
              "Workflow and operational opportunity mapping",
              "Smallest-useful-solution prototype build",
              "Automated lead intake to CRM / Email / WhatsApp",
              "Human review and fallback safeguards",
              "Testing documentation & setup guide"
            ],
            notIncluded: [
              "Enterprise cloud infrastructure hosting",
              "Complex multi-database synchronization",
              "Unlimited workflow additions",
              "Third-party AI provider API credit costs"
            ]
          },
          {
            id: "ai_growth",
            name: "Growth",
            badge: "Production-Ready Automation",
            price: "1,400,000",
            numPrice: 1400000,
            popular: true,
            popularBadge: "⭐ Best Value",
            bestFor: "Teams ready to put a reliable, multi-step automation into daily use.",
            examples: "e.g. CRM Sync, Automated Invoicing, Customer Routing",
            timeline: "3–5 weeks",
            revisions: "2 iteration rounds",
            support: "30 days of priority support after launch",
            desc: "A production-ready automation with integrations, oversight, and handover.",
            features: [
              "Everything in Starter",
              "Multi-step API and webhook automations (Make / Zapier / Python)",
              "Integration with existing CRM, database & email tools",
              "Reliability error-handling & automated alerts",
              "Staff video training & practical operational handover"
            ],
            notIncluded: [
              "AI provider API usage costs",
              "Custom web dashboards beyond agreed scope",
              "Ongoing model fine-tuning"
            ]
          },
          {
            id: "ai_pro",
            name: "Pro",
            badge: "AI Assistant & Knowledge Workflows",
            price: "Custom Quote",
            numPrice: 3000000,
            bestFor: "Organisations integrating AI across several departments and workflows.",
            examples: "e.g. Custom AI Chatbot on Company Data, Internal Knowledge Hub",
            timeline: "4–8 weeks",
            revisions: "Defined in statement of work",
            support: "Agreed SLA and support arrangement",
            desc: "A broader AI programme with multiple workflows, custom interfaces, and safeguards.",
            features: [
              "Everything in Growth",
              "Custom AI assistant or chatbot interface trained on business data",
              "Internal knowledge base & document search pipelines",
              "Multiple connected cross-department automations",
              "Evaluation, logging, and continuous accuracy monitoring"
            ],
            notIncluded: [
              "Third-party LLM API consumption costs",
              "Unlimited ad-hoc workflow development",
              "Artificial guarantees on 100% LLM precision"
            ]
          }
        ]
      },
      maintenance: {
        id: "maintenance",
        label: "🛡️ Website Maintenance",
        title: "09. Website Maintenance Retainers",
        desc: "Keep your website secure, fast, and improving long after launch on a dependable rhythm.",
        starting: "60,000 / mo",
        whatAffectsPricing: [
          "Stack complexity and dependency landscape",
          "Number of sites or environments supported",
          "Update, monitoring, and backup requirements",
          "Expected volume of content and improvement requests"
        ],
        pricingNotes: "Maintenance can cover websites built by BuildWithLami or external agencies after an initial system health assessment.",
        tiers: [
          {
            id: "maint_starter",
            name: "Starter",
            badge: "Essential Security & Updates",
            price: "60,000 / mo",
            numPrice: 60000,
            bestFor: "Small or stable sites that need to stay secure, fast, and operational.",
            examples: "e.g. Portfolio, Corporate Website, Landing Page",
            timeline: "Monthly retainer",
            revisions: "Up to 1 hour of small changes per month",
            support: "Email support, business-day response",
            desc: "A dependable baseline: updates, monitoring, and small fixes on a clear rhythm.",
            features: [
              "Software, plugin & security dependency updates",
              "Uptime and performance monitoring",
              "Scheduled automated cloud backups & recovery checks",
              "Bug fixes and technical support (up to 1 hour included)",
              "Monthly health summary report"
            ],
            notIncluded: [
              "New full-page or feature development",
              "24/7 on-call emergency response",
              "Hosting and domain registrar fees"
            ]
          },
          {
            id: "maint_growth",
            name: "Growth",
            badge: "Active Sites & Regular Improvements",
            price: "150,000 / mo",
            numPrice: 150000,
            popular: true,
            popularBadge: "⭐ Best Value",
            bestFor: "Active websites that change, publish content, and improve regularly.",
            examples: "e.g. E-Commerce Stores, Active Businesses, Lead Gen Portals",
            timeline: "Monthly retainer",
            revisions: "Included within 4-hour improvement allowance",
            support: "Prioritized email & WhatsApp support",
            desc: "A balanced support plan with content changes and considered improvements.",
            features: [
              "Everything in Starter",
              "Content, copy, and layout updates",
              "Up to 4 hours of dedicated developer improvement work per month",
              "Prioritized fixes and speed optimization",
              "Monthly maintenance & performance reporting"
            ],
            notIncluded: [
              "Large-scale complete website redesigns",
              "After-hours emergency calls",
              "Third-party hosting fees"
            ]
          },
          {
            id: "maint_pro",
            name: "Pro",
            badge: "High-Touch & Business Critical",
            price: "350,000 / mo",
            numPrice: 350000,
            bestFor: "High-traffic stores and business-critical portals where uptime matters.",
            examples: "e.g. High-Volume E-Commerce, SaaS Platforms, Corporate Groups",
            timeline: "Monthly retainer",
            revisions: "Included within 10-hour allowance",
            support: "Agreed priority emergency support window",
            desc: "A higher-touch plan with faster response and proactive improvement work.",
            features: [
              "Everything in Growth",
              "Faster agreed response times & emergency support",
              "Up to 10 hours of active improvement & feature work",
              "Proactive quarterly architecture and SEO reviews",
              "Direct emergency WhatsApp/Call channel"
            ],
            notIncluded: [
              "Complete platform rewrites",
              "Third-party enterprise software licensing",
              "Uncapped 24/7 engineering"
            ]
          }
        ]
      }
    }
  },
  USD: {
    symbol: "$",
    regionLabel: "International & Outside Africa (USD)",
    categories: {
      websites: {
        id: "websites",
        label: "🌐 Web Development",
        title: "01. Web Development",
        desc: "Custom websites built around real goals, content, and customers.",
        starting: "899",
        whatAffectsPricing: [
          "Number of unique page templates and content types",
          "Custom CMS, API, or third-party integrations",
          "Performance, accessibility, and SEO requirements",
          "Content migration from an existing website",
          "Browser/device support and launch QA scope"
        ],
        pricingNotes: "Prices are starting points in USD. The final figure is confirmed after the brief, content audit, and technical scope are understood. Hosting, domain, and ongoing maintenance are quoted separately from the initial build.",
        tiers: [
          {
            id: "web_starter",
            name: "Starter",
            badge: "Focused 1–5 Page Website",
            price: "899",
            numPrice: 899,
            bestFor: "Individuals, startups, and small businesses launching their first site.",
            examples: "e.g. Creator Showcase, Brand Presence, Product Waitlist",
            timeline: "1–2 weeks",
            revisions: "1 round of revisions on the agreed design",
            support: "14 days of bug-fix support after launch",
            desc: "A focused, responsive one-to-five page website with a clear content structure.",
            features: [
              "Technical planning and site architecture",
              "Up to 5 responsive page templates",
              "Core content components",
              "Accessibility fundamentals and launch QA",
              "Contact form integration"
            ],
            notIncluded: [
              "CMS/editable content backend",
              "Copywriting",
              "Photography & stock assets",
              "Ongoing maintenance",
              "Third-party API integrations"
            ]
          },
          {
            id: "web_growth",
            name: "Growth",
            badge: "Complete Custom Website + CMS",
            price: "2,499",
            numPrice: 2499,
            popular: true,
            popularBadge: "⭐ Best Value",
            bestFor: "Growing businesses that need to update content and be found online.",
            examples: "e.g. Law Firms, Logistics, Healthcare, Advisory, B2B",
            timeline: "2–4 weeks",
            revisions: "2 rounds of revisions on the agreed design",
            support: "30 days of priority bug-fix support after launch",
            desc: "A complete custom website with an editable CMS, integrations, and performance work.",
            features: [
              "Everything in Starter",
              "CMS and content integration so you can edit content yourself",
              "Up to 10 page templates and core content types",
              "On-page SEO and Core Web Vitals work",
              "Cross-browser and device QA",
              "Google Analytics / Search Console setup"
            ],
            notIncluded: [
              "Custom web applications",
              "E-commerce checkout",
              "Paid ad management",
              "Ongoing content creation"
            ]
          },
          {
            id: "web_pro",
            name: "Pro",
            badge: "Large Scale & Multi-System",
            price: "Custom Quote",
            numPrice: 4500,
            bestFor: "Businesses with complex requirements, multiple systems, or larger content structures.",
            examples: "e.g. Multi-Branch Portals, Enterprise Corporate, Directories",
            timeline: "4–8 weeks",
            revisions: "Defined in statement of work",
            support: "Agreed post-launch support window",
            desc: "A larger custom build with complex content models, workflows, or integrations — scoped to your requirements.",
            features: [
              "Everything in Growth",
              "Advanced content modeling and editorial workflows",
              "Custom API and third-party integrations",
              "Migration and redirect strategy",
              "Detailed launch documentation and handover",
              "Post-launch support window"
            ],
            notIncluded: [
              "Hosting and domain fees",
              "Third-party service subscriptions",
              "Unlimited changes outside the agreed scope"
            ]
          }
        ]
      },
      ecommerce: {
        id: "ecommerce",
        label: "🛒 E-Commerce ⭐",
        title: "02. E-Commerce Engines",
        desc: "Online stores designed for clearer paths to purchase.",
        starting: "1,799",
        whatAffectsPricing: [
          "Catalogue size and product-variant complexity",
          "Platform choice (Shopify, WooCommerce, or custom React stack)",
          "Payment, shipping, tax, and inventory integrations",
          "Migration of products, customers, and orders",
          "Conversion testing and post-launch iteration"
        ],
        pricingNotes: "Platform and payment-provider fees are passed through separately and are not included in project pricing. Stores with significant migration or integration needs are scoped after a catalogue review.",
        tiers: [
          {
            id: "ecom_starter",
            name: "Starter",
            badge: "Focused Boutique Storefront",
            price: "1,799",
            numPrice: 1799,
            bestFor: "New sellers launching a focused product line.",
            examples: "e.g. Emerging Boutiques, Focused Single-Product Brands",
            timeline: "2–4 weeks",
            revisions: "1 round of revisions on the agreed design",
            support: "14 days of launch bug-fix support",
            desc: "A focused storefront for a small catalogue with a straightforward buying path.",
            features: [
              "Store strategy and platform guidance",
              "Product and collection architecture",
              "Custom responsive storefront design",
              "Checkout and one payment provider (Stripe / Cards)",
              "Up to 25 products configured"
            ],
            notIncluded: [
              "Product photography",
              "Copywriting",
              "Shipping/tax automation beyond basic setup",
              "Ongoing marketing"
            ]
          },
          {
            id: "ecom_growth",
            name: "Growth",
            badge: "Serious Growing Brands",
            price: "4,499",
            numPrice: 4499,
            popular: true,
            popularBadge: "⭐ Best Value",
            bestFor: "Growing stores that want better conversion and easier management.",
            examples: "e.g. Fashion Brands, Multi-Product Stores, Beauty Lines",
            timeline: "4–6 weeks",
            revisions: "2 rounds of revisions on the agreed design",
            support: "30 days of priority bug-fix support after launch",
            desc: "A conversion-focused store with shipping, tax, analytics, and launch support.",
            features: [
              "Everything in Starter",
              "Up to 100 products with variants",
              "Shipping and tax setup guidance",
              "Analytics and conversion tracking",
              "Email capture and abandoned-cart basics",
              "Testing and launch support"
            ],
            notIncluded: [
              "Product data entry beyond the included count",
              "Paid ad spend",
              "Fulfilment/warehouse integrations"
            ]
          },
          {
            id: "ecom_pro",
            name: "Pro",
            badge: "Advanced Operations & Scale",
            price: "Custom Quote",
            numPrice: 7500,
            bestFor: "High-volume or multi-region stores with complex operations.",
            examples: "e.g. Global Retailers, Multi-Location Inventories",
            timeline: "6–10 weeks",
            revisions: "Defined in statement of work",
            support: "Agreed post-launch support window",
            desc: "A larger store with migration, complex catalogues, or multiple integrations.",
            features: [
              "Everything in Growth",
              "Product/customer/order migration",
              "Multiple payment and operational integrations",
              "Custom storefront workflows",
              "Post-launch optimisation plan"
            ],
            notIncluded: [
              "Platform subscription and transaction fees",
              "Unlimited product entry",
              "Inventory management beyond configured systems"
            ]
          }
        ]
      },
      software: {
        id: "software",
        label: "⚙️ Custom Software",
        title: "03. Custom Software & SaaS",
        desc: "Bespoke web applications, SaaS prototypes, and internal systems built for operational scale.",
        starting: "3,200",
        whatAffectsPricing: [
          "Clarity and complexity of the business logic",
          "Data access, quality, and provider constraints",
          "Number and complexity of integrations",
          "Security compliance and multi-tenant isolation"
        ],
        pricingNotes: "Every custom platform includes 100% intellectual property transfer and complete repository handover. Hosting compute and third-party APIs are billed directly.",
        tiers: [
          {
            id: "soft_mvp",
            name: "MVP Platform",
            badge: "Product Validation & Prototypes",
            price: "3,200",
            numPrice: 3200,
            bestFor: "Founders and startups validating a new software product.",
            examples: "e.g. SaaS MVP, Client Data Portal, Booking Engine",
            timeline: "4–6 weeks",
            revisions: "1 iteration round on validated prototype",
            support: "30 days post-launch support included",
            desc: "Custom full-stack software built to test market demand, automate core business logic, and onboard early users.",
            features: [
              "Tailored database schema & secure REST APIs",
              "Protected authentication & Role-Based Access Control (RBAC)",
              "Custom interactive client/admin dashboard",
              "Payment gateway & webhook trigger pipelines",
              "Transactional email & notification workflows",
              "100% IP & source code transfer"
            ],
            notIncluded: [
              "Multi-tenant enterprise partitioning",
              "Native mobile apps (iOS/Android)",
              "Third-party cloud infrastructure subscription costs"
            ]
          },
          {
            id: "soft_growth",
            name: "Growth Platform",
            badge: "Full-Scale Business Systems",
            price: "5,000+",
            numPrice: 5000,
            popular: true,
            popularBadge: "⭐ High-Scale Architecture",
            bestFor: "Scaling companies needing internal ERPs, fintech tools & custom portals.",
            examples: "e.g. Custom ERP, Financial Ledger, Multi-Role Portal",
            timeline: "6–10 weeks",
            revisions: "2 review cycles during phased delivery",
            support: "60 days priority engineering support",
            desc: "Robust architecture with multi-role workflows, automated reporting ledgers, and secure integration pipelines.",
            features: [
              "Everything in MVP Platform",
              "Complex multi-role business logic & encrypted data vault",
              "Automated financial ledgers & invoice pipelines",
              "Custom CRM pipelines & external partner integrations",
              "Real-time WebSocket updates & activity logs",
              "Staging environments, automated CI/CD & tests"
            ],
            notIncluded: [
              "Third-party API consumption costs",
              "Uncapped 24/7 on-call engineering",
              "Enterprise on-premise hardware cabling"
            ]
          },
          {
            id: "soft_enterprise",
            name: "Enterprise",
            badge: "Mission-Critical SaaS & ERP",
            price: "Custom Quote",
            numPrice: 9500,
            bestFor: "Multi-tenant SaaS platforms, enterprise ERPs & mission-critical systems.",
            examples: "e.g. Multi-Tenant SaaS, High-Volume Data Systems",
            timeline: "Scoped during discovery",
            revisions: "Defined in statement of work",
            support: "Dedicated SLA & on-demand engineering",
            desc: "Dedicated cloud infrastructure, custom SLAs, compliance pipelines, and 100% intellectual property transfer.",
            features: [
              "Multi-tenant data isolation & compliance",
              "High-availability cloud setup with 99.9% uptime SLA target",
              "Dedicated data pipelines & large-scale processing",
              "Complete IP transfer, GitHub repo & architecture docs",
              "Dedicated priority SLA & on-demand engineering"
            ],
            notIncluded: [
              "Hosting and domain fees",
              "Third-party service subscriptions",
              "Unlimited changes outside the agreed scope"
            ]
          }
        ]
      },
      ui_ux: {
        id: "ui_ux",
        label: "🎨 UI/UX Design",
        title: "04. UI/UX Design",
        desc: "Clear interfaces for complex ideas, shaped around real flows.",
        starting: "699",
        whatAffectsPricing: [
          "Number of unique screens and user flows",
          "Research, prototyping, and usability-testing depth",
          "Design-system and component requirements",
          "Responsive breakpoints and device coverage",
          "Developer-handoff and collaboration needs"
        ],
        pricingNotes: "User research can be scoped when access to real users exists; assumptions are not presented as evidence. A proportional component system is included only when the product needs it.",
        tiers: [
          {
            id: "ui_starter",
            name: "Starter",
            badge: "Focused Flow or Landing",
            price: "699",
            numPrice: 699,
            bestFor: "Founders and teams validating one focused part of a product.",
            examples: "e.g. Single Flow, Landing Experience, Mobile Screen Set",
            timeline: "1–2 weeks",
            revisions: "1 round of revisions",
            support: "One round of implementation clarification",
            desc: "A focused interface or flow with clear structure and considered visual design.",
            features: [
              "Product and user-flow mapping",
              "Information architecture",
              "Responsive high-fidelity design",
              "Up to 6 key screens",
              "Developer-ready specifications"
            ],
            notIncluded: [
              "User research with real participants",
              "Interactive prototyping",
              "Full design system",
              "Branding"
            ]
          },
          {
            id: "ui_growth",
            name: "Growth",
            badge: "Multi-Flow Product Design",
            price: "2,499",
            numPrice: 2499,
            popular: true,
            popularBadge: "⭐ Best Value",
            bestFor: "Teams building a real product that needs usable, tested flows.",
            examples: "e.g. SaaS Portal, Web Application, Mobile App UI",
            timeline: "3–4 weeks",
            revisions: "2 rounds of revisions",
            support: "Designer availability during the build phase",
            desc: "A multi-flow product design engagement with wireframes and an interactive prototype.",
            features: [
              "Everything in Starter",
              "Wireframes and interactive prototype",
              "Component and design-token guidance",
              "Up to 18 screens and core states",
              "Responsive state and edge-case review"
            ],
            notIncluded: [
              "Front-end implementation",
              "Usability testing recruitment",
              "Unlimited screen additions"
            ]
          },
          {
            id: "ui_pro",
            name: "Pro",
            badge: "Design System & Product Platform",
            price: "Custom Quote",
            numPrice: 4000,
            bestFor: "Products that need a reusable, governed design system.",
            examples: "e.g. Multi-Role SaaS, Enterprise Portals",
            timeline: "4–8 weeks",
            revisions: "Defined in statement of work",
            support: "Ongoing collaboration arrangement available",
            desc: "A broader product design system with multiple flows and stakeholder collaboration.",
            features: [
              "Everything in Growth",
              "Expanded flow and interaction modeling",
              "Structured design-system documentation",
              "Direct collaboration during implementation",
              "Iterative review cycles"
            ],
            notIncluded: [
              "Development work",
              "Unlimited scope expansion"
            ]
          }
        ]
      },
      branding: {
        id: "branding",
        label: "✨ Branding & Identity",
        title: "05. Branding & Graphic Design",
        desc: "A visual identity that is recognizable, consistent, and usable.",
        starting: "599",
        whatAffectsPricing: [
          "Research, positioning, and naming work required",
          "Number of decision makers and review cycles",
          "Range of applications (digital, print, campaign, social)",
          "Asset delivery formats and guideline depth",
          "Whether an existing identity is refreshed or rebuilt"
        ],
        pricingNotes: "Recognizable equity in an existing identity can be preserved rather than replaced when appropriate. Editable source files are organized for practical everyday use.",
        tiers: [
          {
            id: "brand_starter",
            name: "Starter",
            badge: "Core Identity Foundation",
            price: "599",
            numPrice: 599,
            bestFor: "New businesses and personal brands.",
            examples: "e.g. New Venture, Personal Brand, Single Product Identity",
            timeline: "1–2 weeks",
            revisions: "2 logo concepts, 1 round of revisions",
            support: "File handover and usage guidance",
            desc: "A focused identity foundation with the core mark, type, and color system.",
            features: [
              "Brand direction and positioning",
              "Logo and identity design",
              "Typography and color systems",
              "Core digital applications",
              "Practical usage guidelines"
            ],
            notIncluded: [
              "Full brand strategy documents",
              "Print production",
              "Naming and trademark work",
              "Campaign systems"
            ]
          },
          {
            id: "brand_growth",
            name: "Growth",
            badge: "Complete Identity System",
            price: "1,999",
            numPrice: 1999,
            popular: true,
            popularBadge: "⭐ Best Value",
            bestFor: "Growing brands that need consistency across channels.",
            examples: "e.g. Expanding Brands, Product Lines, Corporate Identity",
            timeline: "2–3 weeks",
            revisions: "3 concepts, 2 rounds of revisions",
            support: "30 days of asset support after handover",
            desc: "A complete identity system across priority digital and communication applications.",
            features: [
              "Everything in Starter",
              "Expanded logo concepts",
              "Core brand applications",
              "Social and campaign graphics",
              "Priority digital templates",
              "Organized asset delivery"
            ],
            notIncluded: [
              "Large-scale print runs",
              "Advertising creative production",
              "Trademark registration"
            ]
          },
          {
            id: "brand_pro",
            name: "Pro",
            badge: "Brand Programme & Governance",
            price: "Custom Quote",
            numPrice: 3500,
            bestFor: "Organisations with multiple teams using the identity.",
            examples: "e.g. Multi-Brand Conglomerates, Product Suites",
            timeline: "4–6 weeks",
            revisions: "Defined in statement of work",
            support: "Agreed handover and support period",
            desc: "A broader identity programme with extended applications and campaign systems.",
            features: [
              "Everything in Growth",
              "Extended application range",
              "Campaign or launch design system",
              "Detailed brand guidelines",
              "Handoff and governance guidance"
            ],
            notIncluded: [
              "Ongoing design retainer",
              "Third-party production costs"
            ]
          }
        ]
      },
      seo: {
        id: "seo",
        label: "📈 Search Engine SEO",
        title: "06. Search Engine Optimization (SEO)",
        desc: "Search visibility built on a useful, technically sound website.",
        starting: "599",
        whatAffectsPricing: [
          "Current technical health and site size",
          "Competition and starting search position",
          "Content opportunity and production capacity",
          "Migration, redesign, or relaunch requirements",
          "Ongoing measurement and iteration cadence"
        ],
        pricingNotes: "No ranking position is guaranteed; legitimate SEO cannot promise a result controlled by a search engine. The one-time audit is a fixed engagement; ongoing SEO is billed monthly.",
        tiers: [
          {
            id: "seo_starter",
            name: "Starter",
            badge: "Technical & On-Page Audit",
            price: "599",
            numPrice: 599,
            bestFor: "Any site that wants to understand its SEO baseline.",
            examples: "e.g. Existing Website Baseline, Audit",
            timeline: "1–2 weeks",
            revisions: "One read-through and Q&A round",
            support: "Email clarification for 14 days",
            desc: "A focused technical and on-page audit with a prioritized implementation plan.",
            features: [
              "Technical SEO review",
              "On-page structure and metadata review",
              "Keyword and search-intent snapshot",
              "Prioritized opportunity list",
              "Clear implementation plan"
            ],
            notIncluded: [
              "Implementation of changes",
              "Content writing",
              "Ongoing monthly work"
            ]
          },
          {
            id: "seo_growth",
            name: "Growth",
            badge: "Audit + Technical Implementation",
            price: "1,499",
            numPrice: 1499,
            popular: true,
            popularBadge: "⭐ Best Value",
            bestFor: "Sites ready to act on the audit and improve measurable visibility.",
            examples: "e.g. Commercial Sites, Service Businesses",
            timeline: "2–4 weeks",
            revisions: "2 review rounds on delivered work",
            support: "30 days of monitoring and guidance",
            desc: "An audit plus focused implementation of the highest-value technical and content work.",
            features: [
              "Everything in Starter",
              "Keyword and search-intent research",
              "Content opportunity planning",
              "Core Web Vitals improvements",
              "Measurement and reporting setup"
            ],
            notIncluded: [
              "Guaranteed rankings",
              "Paid search ads",
              "Long-form content production beyond the agreed scope"
            ]
          },
          {
            id: "seo_pro",
            name: "Pro",
            badge: "Continuous Monthly Retainer",
            price: "899 / mo",
            numPrice: 899,
            bestFor: "Sites that want continuous, sustained improvement.",
            examples: "e.g. Competitive Niches, Scaling Platforms",
            timeline: "Recurring monthly (Min 3 months)",
            revisions: "Included as part of the monthly cycle",
            support: "Monthly review and async support",
            desc: "A recurring monthly rhythm of measurement, iteration, and content improvement.",
            features: [
              "Everything in Growth",
              "Monthly measurement and review",
              "Ongoing content and technical work",
              "Competitor and search-change monitoring",
              "Adjusted roadmap each cycle"
            ],
            notIncluded: [
              "Guaranteed rankings",
              "Paid ad spend",
              "Unlimited content production"
            ]
          }
        ]
      },
      digital_marketing: {
        id: "digital_marketing",
        label: "📣 Digital Marketing",
        title: "07. Digital Marketing & Campaigns",
        desc: "Focused campaigns and content systems designed around measurable objectives.",
        starting: "699",
        whatAffectsPricing: [
          "Audience, offer, and channel mix",
          "Campaign duration and production volume",
          "Creative, landing-page, and tracking requirements",
          "Advertising spend (managed separately from project fees)",
          "Review cadence and iteration depth"
        ],
        pricingNotes: "Advertising spend is paid directly to the platform and is not included in project pricing. Specific commercial returns are not promised; objectives and learning signals are agreed up front.",
        tiers: [
          {
            id: "mkt_starter",
            name: "Starter",
            badge: "Campaign Strategy & Plan",
            price: "699",
            numPrice: 699,
            bestFor: "Teams that need a clear plan before spending on campaigns.",
            examples: "e.g. Product Launch, Offer Validation",
            timeline: "1–2 weeks",
            revisions: "1 revision round",
            support: "One strategy review call",
            desc: "A focused campaign plan with audience, channel, and messaging direction.",
            features: [
              "Channel and campaign strategy",
              "Audience and offer focus",
              "Content themes and planning",
              "Measurement framework",
              "First creative direction"
            ],
            notIncluded: [
              "Ad spend",
              "Creative production",
              "Campaign management",
              "Landing-page build"
            ]
          },
          {
            id: "mkt_growth",
            name: "Growth",
            badge: "Campaign Creative + Landing Page",
            price: "1,999",
            numPrice: 1999,
            popular: true,
            popularBadge: "⭐ Best Value",
            bestFor: "Businesses ready to launch and measure a real campaign.",
            examples: "e.g. Active Funnel, Lead Gen Campaign",
            timeline: "2–3 weeks",
            revisions: "2 revision rounds",
            support: "30 days of campaign monitoring",
            desc: "A connected campaign with creative system, landing page, and tracking in place.",
            features: [
              "Everything in Starter",
              "Campaign creative and a landing page",
              "Social media design system",
              "Analytics and conversion tracking",
              "Performance review"
            ],
            notIncluded: [
              "Ad spend",
              "Ongoing monthly management beyond 30 days",
              "Video production"
            ]
          },
          {
            id: "mkt_pro",
            name: "Pro",
            badge: "Ongoing Growth Retainer",
            price: "2,499 / mo",
            numPrice: 2499,
            bestFor: "Teams that want continuous marketing without hiring in-house.",
            examples: "e.g. Monthly Ad Production, Retainer",
            timeline: "Monthly retainer",
            revisions: "Included within the monthly cadence",
            support: "Monthly review and async communication",
            desc: "A recurring campaign or content system with production, review, and iteration.",
            features: [
              "Everything in Growth",
              "Agreed content/campaign cadence",
              "Ongoing creative production",
              "Performance review and iteration",
              "Next-cycle recommendations"
            ],
            notIncluded: [
              "Ad spend",
              "Unlimited creative requests",
              "Guaranteed sales results"
            ]
          }
        ]
      },
      ai_automation: {
        id: "ai_automation",
        label: "⚡ AI & Automations",
        title: "08. AI Solutions & Automations",
        desc: "Practical AI and automation applied where it genuinely helps.",
        starting: "1,199",
        whatAffectsPricing: [
          "Clarity and repeatability of the workflow",
          "Data access, quality, and provider constraints",
          "Number and complexity of integrations",
          "Human review, fallback, and safety requirements",
          "Testing, documentation, and handover needs"
        ],
        pricingNotes: "Every solution starts with the smallest useful prototype before larger commitments. Data handling and provider terms are treated as design constraints, not afterthoughts.",
        tiers: [
          {
            id: "ai_starter",
            name: "Starter",
            badge: "Focused Workflow Prototype",
            price: "1,199",
            numPrice: 1199,
            bestFor: "Teams that want to validate an AI or automation idea before investing more.",
            examples: "e.g. Lead Qualification, Auto-Routing, Webhook Pipeline",
            timeline: "2–3 weeks",
            revisions: "1 iteration round on the prototype",
            support: "14 days of handover support",
            desc: "A focused, testable workflow prototype that proves the automation is useful.",
            features: [
              "Workflow and opportunity mapping",
              "Smallest-useful-solution prototype",
              "Human review and fallback rules",
              "Testing and documentation"
            ],
            notIncluded: [
              "Production hosting",
              "Enterprise data integrations",
              "Unlimited workflow additions",
              "AI provider API costs"
            ]
          },
          {
            id: "ai_growth",
            name: "Growth",
            badge: "Production-Ready Automation",
            price: "3,999",
            numPrice: 3999,
            popular: true,
            popularBadge: "⭐ Best Value",
            bestFor: "Teams ready to put a reliable automation into real use.",
            examples: "e.g. CRM Sync, Data Extraction, Notification Engine",
            timeline: "3–5 weeks",
            revisions: "2 revision rounds",
            support: "30 days of priority support after launch",
            desc: "A production-ready automation with integrations, oversight, and handover.",
            features: [
              "Everything in Starter",
              "API and no-code automation",
              "Integration with existing systems",
              "Reliability and fallback controls",
              "Documentation and handover"
            ],
            notIncluded: [
              "AI provider/API usage costs",
              "Custom dashboards beyond agreed scope",
              "Ongoing model fine-tuning"
            ]
          },
          {
            id: "ai_pro",
            name: "Pro",
            badge: "AI Assistant & Knowledge Workflows",
            price: "Custom Quote",
            numPrice: 6500,
            bestFor: "Organisations integrating AI across several workflows.",
            examples: "e.g. Custom AI Assistant, Knowledge Base Search",
            timeline: "4–8 weeks",
            revisions: "Defined in the statement of work",
            support: "Agreed support and review arrangement",
            desc: "A broader AI programme with multiple workflows, interfaces, and safeguards.",
            features: [
              "Everything in Growth",
              "AI assistant or chatbot interface",
              "Internal knowledge workflows",
              "Multiple connected automations",
              "Evaluation and logging workflow",
              "Ongoing reliability improvement"
            ],
            notIncluded: [
              "Third-party AI provider costs",
              "Unlimited workflows",
              "Guaranteed model accuracy"
            ]
          }
        ]
      },
      maintenance: {
        id: "maintenance",
        label: "🛡️ Website Maintenance",
        title: "09. Website Maintenance Retainers",
        desc: "Keep your website useful, secure, and improving long after launch.",
        starting: "149 / mo",
        whatAffectsPricing: [
          "Stack complexity and dependency landscape",
          "Number of sites or environments supported",
          "Update, monitoring, and backup requirements",
          "Expected volume of content and improvement requests",
          "Response-time and emergency-support expectations"
        ],
        pricingNotes: "Maintenance can cover a site BuildWithLami did not build after an initial assessment. Emergency support is included only when explicitly agreed with defined response expectations.",
        tiers: [
          {
            id: "maint_starter",
            name: "Starter",
            badge: "Essential Security & Updates",
            price: "149 / mo",
            numPrice: 149,
            bestFor: "Small sites that need to stay secure and working.",
            examples: "e.g. Stable Single Site, Corporate Presence",
            timeline: "Monthly retainer",
            revisions: "Up to 1 hour of small changes per month",
            support: "Email support, best-effort response",
            desc: "A dependable baseline: updates, monitoring, and small fixes on a clear rhythm.",
            features: [
              "Software and dependency updates",
              "Performance monitoring",
              "Bug fixes and technical support",
              "Backup and recovery checks",
              "Monthly summary"
            ],
            notIncluded: [
              "New feature development",
              "Emergency response guarantee",
              "Hosting fees",
              "Content creation"
            ]
          },
          {
            id: "maint_growth",
            name: "Growth",
            badge: "Active Sites & Regular Improvements",
            price: "349 / mo",
            numPrice: 349,
            popular: true,
            popularBadge: "⭐ Best Value",
            bestFor: "Active sites that change and improve regularly.",
            examples: "e.g. Active E-Commerce, Lead Gen Websites",
            timeline: "Monthly retainer",
            revisions: "Included within the 4-hour improvement allowance",
            support: "Prioritized email support during business days",
            desc: "A balanced support plan with content changes and considered improvements.",
            features: [
              "Everything in Starter",
              "Content and design changes",
              "Prioritized fixes and improvements",
              "Up to 4 hours of improvement work",
              "Monthly maintenance reporting"
            ],
            notIncluded: [
              "Large feature builds",
              "After-hours emergency support",
              "Hosting and domain costs"
            ]
          },
          {
            id: "maint_pro",
            name: "Pro",
            badge: "High-Touch & Business Critical",
            price: "799 / mo",
            numPrice: 799,
            bestFor: "Businesses where site uptime and speed matter.",
            examples: "e.g. Business-Critical Portals, Scaling Platforms",
            timeline: "Monthly retainer",
            revisions: "Included within the 10-hour allowance",
            support: "Agreed emergency support window",
            desc: "A higher-touch plan with faster response and proactive improvement work.",
            features: [
              "Everything in Growth",
              "Faster agreed response times",
              "Up to 10 hours of improvement work",
              "Proactive improvement planning",
              "Quarterly roadmap and review"
            ],
            notIncluded: [
              "Major rebuilds",
              "Hosting and third-party fees",
              "Unlimited 24/7 on-call support"
            ]
          }
        ]
      }
    }
  }
};

const OPTIONAL_ADDONS = [
  { id: "addon_shipping", name: "Multi-Zone Courier Shipping Rules", desc: "Local delivery zones (Lagos/Interstate/Intl) + Automated courier API sync", costNGN: 100000, costUSD: 250, highlight: true },
  { id: "addon_gateway", name: "Cross-Border Payment Gateway", desc: "Accept international debit/credit cards, Stripe, UAE payments, or PayPal", costNGN: 80000, costUSD: 200, highlight: true },
  { id: "addon_seo", name: "100% Core Web Vitals & Technical SEO", desc: "Structured schema markup, Rich Snippets, sitemaps, and search optimization", costNGN: 100000, costUSD: 250, highlight: true },
  { id: "addon_automation", name: "Custom Workflow Automations", desc: "Webhook pipelines, automated CRM sync & customer order triggers", costNGN: 100000, costUSD: 250 },
  { id: "addon_crm", name: "CRM & Leads Pipeline Integration", desc: "HubSpot, Notion, Airtable, or custom lead database capture", costNGN: 100000, costUSD: 250 },
  { id: "addon_analytics", name: "Advanced Conversion Analytics", desc: "GA4 e-commerce events, Meta Pixel CAPI, and funnel drop-off tracking", costNGN: 50000, costUSD: 120 },
  { id: "addon_multicurrency", name: "Multi-Currency & Geolocation Pricing", desc: "Automatic visitor location detection and regional currency conversion display", costNGN: 75000, costUSD: 180 },
  { id: "addon_pages", name: "Additional Custom Pages (Set of 3)", desc: "Tailored responsive landing or story pages designed with high-conversion layouts", costNGN: 75000, costUSD: 180 },
  { id: "addon_maintenance", name: "Extended Support Retainer (Monthly)", desc: "Ongoing monthly security updates, performance monitoring, and bug fixes", costNGN: 60000, costUSD: 149 }
];

const Pricing = ({ isHomepage = false }) => {
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  // Fully automated location-based currency detection with manual user override
  const detectedCurrency = useAutomatedCurrency();
  const [manualCurrency, setManualCurrency] = useState(null);
  const currency = manualCurrency || detectedCurrency || 'NGN';

  const activePricing = PRICING_DATA[currency] || PRICING_DATA.NGN;
  const symbol = activePricing.symbol;

  // Category Selector as Primary Navigation (defaults to 'websites')
  const [activeCategory, setActiveCategory] = useState('websites');
  const [showAddonsModal, setShowAddonsModal] = useState(false);

  // Interactive Quote Builder State
  const [quoteCategory, setQuoteCategory] = useState('websites');
  const [quoteTierId, setQuoteTierId] = useState('web_growth');
  const [selectedAddons, setSelectedAddons] = useState(['addon_gateway']);

  // Get active category object and tiers
  const currentCategoryData = activePricing.categories[activeCategory] || activePricing.categories.websites;
  const currentTiers = currentCategoryData.tiers;

  // Builder Calculations
  const builderCategoryData = activePricing.categories[quoteCategory] || activePricing.categories.websites;
  const selectedTier = builderCategoryData.tiers.find(t => t.id === quoteTierId) || builderCategoryData.tiers[1] || builderCategoryData.tiers[0];

  const tierCost = selectedTier.numPrice || 0;
  const addonsCost = selectedAddons.reduce((sum, addonId) => {
    const addon = OPTIONAL_ADDONS.find(a => a.id === addonId);
    if (!addon) return sum;
    return sum + (currency === 'USD' ? addon.costUSD : addon.costNGN);
  }, 0);

  const totalEstimate = tierCost > 0 ? (tierCost + addonsCost) : null;
  const upfrontFifty = totalEstimate ? Math.round(totalEstimate * 0.5) : null;
  const deliveryFifty = totalEstimate ? (totalEstimate - upfrontFifty) : null;

  const formatNumber = (num) => {
    if (!num && num !== 0) return "Custom";
    return num.toLocaleString();
  };

  const toggleAddon = (id) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <section id="pricing" className="py-24 px-6 md:px-12 bg-gray-50 dark:bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* ── HEADER ── */}
        <motion.div
          className="text-center mb-14"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          <motion.div variants={item} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Studio Pricing · Scoped to the Work
            </span>
          </motion.div>

          <motion.h2 variants={item} className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-black dark:text-white tracking-tight mb-5">
            Transparent Pricing. <br />
            <span className="italic font-normal text-accent">No Surprise Invoices.</span>
          </motion.h2>

          <motion.p variants={item} className="text-gray-700 dark:text-gray-200 max-w-3xl mx-auto text-base sm:text-lg font-light leading-relaxed">
            Every deliverable and boundary is clearly priced before work begins. Fixed scopes, predictable timelines, and clear 50/50 milestone invoicing.
          </motion.p>

          {/* Region / Currency Switcher Toggle */}
          <motion.div variants={item} className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="p-1 rounded-full bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-white/10 inline-flex items-center gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => setManualCurrency('NGN')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currency === 'NGN'
                    ? 'bg-white dark:bg-[#1a1a1a] text-black dark:text-white shadow-sm ring-1 ring-black/5'
                    : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <span>🇳🇬</span>
                <span>Nigeria (₦ NGN)</span>
              </button>
              <button
                type="button"
                onClick={() => setManualCurrency('USD')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currency === 'USD'
                    ? 'bg-white dark:bg-[#1a1a1a] text-black dark:text-white shadow-sm ring-1 ring-black/5'
                    : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <span>🌍</span>
                <span>Outside Africa ($ USD)</span>
              </button>
            </div>
          </motion.div>

          {/* Milestone Invoicing Callouts */}
          <motion.div variants={item} className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <div className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1c1c1c] px-5 py-2 shadow-sm rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                Milestone Invoicing: <span className="text-blue-600 dark:text-blue-400">50% upfront, 50% upon delivery</span>
              </p>
            </div>
            <div className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1c1c1c] px-4 py-2 shadow-sm rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300">
              ✦ Post-launch warranty support included with every package
            </div>
          </motion.div>
        </motion.div>

        {/* ── HOMEPAGE SUMMARY PILLARS (Clean Overview for Homepage) ── */}
        {isHomepage ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pillar 1: Web Development */}
              <div className="p-8 rounded-3xl bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/10 shadow-lg flex flex-col justify-between hover:border-accent/40 transition-all duration-300">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent block mb-2">Category 01</span>
                  <h3 className="text-2xl font-bold font-heading text-black dark:text-white mb-2">Web Development</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    Custom websites built around real goals, content, and customers—not a generic theme.
                  </p>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Starting from</span>
                    <span className="text-3xl font-heading font-extrabold text-black dark:text-white">{symbol}{activePricing.categories.websites.starting}</span>
                    <span className="text-xs text-gray-500 block mt-1">Starter · Growth (Best Value) · Pro Custom</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300 mb-6">
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-accent" /> Responsive custom interface</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-accent" /> Editable CMS content integration</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-accent" /> Up to 30 days post-launch support</li>
                  </ul>
                </div>
                <Link to="/pricing#websites" className="w-full py-3 text-center text-xs font-extrabold uppercase tracking-wider rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  View Web Tiers <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Pillar 2: E-Commerce (Featured) */}
              <div className="p-8 rounded-3xl bg-white dark:bg-[#1c1c1c] border-2 border-blue-500 shadow-xl flex flex-col justify-between relative">
                <span className="absolute -top-3.5 right-6 bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md">
                  ⭐ Core Commerce Engine
                </span>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-2">Category 02</span>
                  <h3 className="text-2xl font-bold font-heading text-black dark:text-white mb-2">E-Commerce Engines</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    Online stores designed for clearer paths to purchase, multi-channel payments, and fulfillment.
                  </p>
                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 block mb-1">Starting from</span>
                    <span className="text-3xl font-heading font-extrabold text-black dark:text-white">{symbol}{activePricing.categories.ecommerce.starting}</span>
                    <span className="text-xs text-blue-700 dark:text-blue-300 block mt-1">Starter · Growth (Best Value) · Pro Custom</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300 mb-6">
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-blue-500" /> Multi-gateway checkout (Paystack/Stripe)</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-blue-500" /> Abandoned cart recovery & accounts</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-blue-500" /> 30 days priority bug-fix support</li>
                  </ul>
                </div>
                <Link to="/pricing#ecommerce" className="w-full py-3 text-center text-xs font-extrabold uppercase tracking-wider rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md">
                  Compare E-Commerce Tiers <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Pillar 3: Custom Software */}
              <div className="p-8 rounded-3xl bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/10 shadow-lg flex flex-col justify-between hover:border-accent/40 transition-all duration-300">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent block mb-2">Category 03</span>
                  <h3 className="text-2xl font-bold font-heading text-black dark:text-white mb-2">Custom Software & SaaS</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    Custom web applications, SaaS prototypes, booking systems, and internal operational portals.
                  </p>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Starting from</span>
                    <span className="text-3xl font-heading font-extrabold text-black dark:text-white">{symbol}{activePricing.categories.software.starting}</span>
                    <span className="text-xs text-gray-500 block mt-1">MVP · Growth Platform · Enterprise</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300 mb-6">
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-accent" /> Custom DB schema, RBAC Auth & APIs</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-accent" /> 100% IP & GitHub repository transfer</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-accent" /> Post-launch engineering support</li>
                  </ul>
                </div>
                <Link to="/pricing#software" className="w-full py-3 text-center text-xs font-extrabold uppercase tracking-wider rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  View Software Scope <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Deep link CTA Banner on Homepage */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-gray-900 to-black text-white dark:from-neutral-900 dark:to-[#121212] border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent block mb-1">Studio Pricing Matrix</span>
                <h4 className="text-xl font-bold font-heading">Explore all 9 service categories and custom quotation builder</h4>
                <p className="text-xs text-gray-400 mt-1">Includes Web Dev, E-Commerce, UI/UX, Branding, SEO, Digital Marketing, AI Automations, and Maintenance.</p>
              </div>
              <Link 
                to="/pricing" 
                className="shrink-0 px-6 py-3.5 rounded-full bg-accent text-white font-extrabold text-xs uppercase tracking-wider hover:bg-accent/90 transition-all flex items-center gap-2 shadow-lg"
              >
                Open Full Pricing Page <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* ── FULL STUDIO PRICING PAGE EXPERIENCE ── */
          <div className="space-y-16">

            {/* ── 1. PRIMARY CATEGORY NAVIGATION ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-2 sm:pb-0">
                {Object.values(activePricing.categories).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setQuoteCategory(cat.id);
                      const defaultTier = cat.tiers[1] || cat.tiers[0];
                      if (defaultTier) setQuoteTierId(defaultTier.id);
                    }}
                    className={`px-4 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
                      activeCategory === cat.id
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-md ring-2 ring-accent/30'
                        : 'bg-white dark:bg-[#141414] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:border-accent/40'
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              <div className="text-xs text-gray-500 font-mono font-medium shrink-0">
                Showing: <span className="font-bold text-black dark:text-white">{activePricing.regionLabel}</span>
              </div>
            </div>

            {/* ── 2. 3-TIER CARDS GRID (For Active Category) ── */}
            <div id={activeCategory}>
              <div className="mb-6">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent block mb-1">{currentCategoryData.title}</span>
                <h3 className="text-2xl font-bold font-heading text-black dark:text-white">{currentCategoryData.desc}</h3>
              </div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
                variants={container}
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
              >
                {currentTiers.map((tier) => {
                  const isCustom = tier.price === "Custom Quote";

                  return (
                    <motion.div
                      key={tier.id}
                      id={`pricing-card-${tier.id}`}
                      layout
                      whileHover={shouldReduce ? {} : cardHover}
                      className={`relative p-6 sm:p-8 border ${
                        tier.popular
                          ? 'border-accent dark:border-accent shadow-xl ring-2 ring-accent/20'
                          : 'border-gray-200 dark:border-white/10'
                      } bg-white dark:bg-[#141414] rounded-2xl group hover:shadow-2xl hover:border-accent/60 transition-all duration-300 flex flex-col justify-between`}
                    >
                      <div>
                        {tier.popular && (
                          <span className="absolute -top-3.5 right-6 bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md">
                            {tier.popularBadge || "⭐ Best Value"}
                          </span>
                        )}

                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <h3 className="text-2xl font-heading font-bold text-black dark:text-white">
                            {tier.name}
                          </h3>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-4">{tier.badge}</p>

                        <div className="p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl mb-5">
                          <span className="text-[11px] uppercase tracking-wider text-gray-800 dark:text-gray-200 font-bold block">{tier.bestFor}</span>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 italic block mt-0.5">{tier.examples}</span>
                        </div>

                        {/* Price Tag */}
                        <div className="flex flex-wrap items-baseline gap-1.5 mb-4 border-b border-gray-100 dark:border-white/5 pb-4">
                          {isCustom ? (
                            <span className="text-3xl font-heading font-bold text-black dark:text-white leading-none">{tier.price}</span>
                          ) : (
                            <>
                              <span className="text-xs text-gray-500 font-semibold">starting at</span>
                              <span className="text-3xl sm:text-4xl font-heading font-extrabold text-black dark:text-white tracking-tight leading-none">
                                {tier.price.includes('/ mo') ? `${symbol}${tier.price}` : `${symbol}${tier.price}`}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Timeline, Revisions, Support Guarantees */}
                        <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 font-medium mb-6 bg-gray-50/70 dark:bg-white/5 p-3 rounded-xl">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-gray-500">Timeline:</span>
                            <span>{tier.timeline}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-gray-500">Revisions:</span>
                            <span>{tier.revisions}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-accent">
                            <span className="font-semibold text-gray-500">Support:</span>
                            <span className="font-semibold">{tier.support}</span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-6 font-light">
                          {tier.desc}
                        </p>

                        {/* Deliverables List (Included) */}
                        <div className="space-y-3 mb-6">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500 block">
                            Included in this scope
                          </span>
                          <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                            {tier.features.map((feat, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-2.5 leading-snug">
                                <CheckIcon className={`w-4 h-4 shrink-0 mt-0.5 ${tier.popular ? 'text-blue-500' : 'text-accent'}`} />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Explicit NOT INCLUDED List (GoodFound Pattern) */}
                        {tier.notIncluded && tier.notIncluded.length > 0 && (
                          <div className="space-y-2 mb-8 pt-4 border-t border-gray-100 dark:border-white/5">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 dark:text-rose-400 block">
                              Not included
                            </span>
                            <ul className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 font-light">
                              {tier.notIncluded.map((notItem, nIdx) => (
                                <li key={nIdx} className="flex items-start gap-2 leading-snug">
                                  <span className="text-rose-500 font-bold shrink-0 text-[11px]">—</span>
                                  <span>{notItem}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div>
                        <Link
                          to={`/contact?service=${encodeURIComponent(activeCategory)}&tier=${encodeURIComponent(tier.id)}&currency=${encodeURIComponent(currency)}`}
                          className={`w-full py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                            tier.popular
                              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                              : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90'
                          }`}
                        >
                          Start with {tier.name} <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <p className="text-[10px] text-center text-gray-400 mt-2">
                          50% upfront, 50% upon delivery
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Category-Specific Pricing Explanations & Notes (GoodFound Pattern) */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8 rounded-3xl bg-gray-100/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-2 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-accent" /> What affects final pricing
                  </h4>
                  <ul className="space-y-1.5 text-gray-600 dark:text-gray-400">
                    {currentCategoryData.whatAffectsPricing?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-2 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-500" /> Pricing & Delivery Notes
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {currentCategoryData.pricingNotes}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    <span>Questions before sending a brief?</span>
                    <Link to="/contact" className="underline hover:opacity-80">Book a discovery review →</Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 3. ENTERPRISE CLOUD ARCHITECTURE INCLUDED (Replaced complex selector with studio guarantee) ── */}
            <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#161616] border border-gray-200 dark:border-white/10 shadow-lg">
              <div className="max-w-3xl mb-8">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent block mb-1">Architecture & Hosting Resilience</span>
                <h3 className="text-3xl font-bold font-heading text-black dark:text-white mb-3">
                  Enterprise-grade hosting standard included with every build.
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                  You don't need to worry about server configuration, caching setups, or database connection pooling. We engineer and deploy your application directly to your cloud provider with our production standard.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                    <Globe className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-black dark:text-white mb-1">Global Edge CDN</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sub-second global content delivery with automated Cloudflare SSL certificates.</p>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-black dark:text-white mb-1">Automated Daily Backups</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Continuous encrypted database snapshots and instant disaster recovery pipelines.</p>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-black dark:text-white mb-1">99.9% Uptime Target</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Optimized database pooling, image compression, and zero cold-start latency.</p>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-black dark:text-white mb-1">100% IP & Code Transfer</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Full repository handover, clear documentation, and zero vendor lock-in.</p>
                </div>
              </div>
            </div>

            {/* ── 4. OPTIONAL ADD-ONS (Clean preview + Modal option) ── */}
            <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#161616] border border-gray-200 dark:border-white/10 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent block mb-1">Tailored Scope</span>
                  <h3 className="text-3xl font-bold font-heading text-black dark:text-white mb-1">
                    Optional enhancements & integrations
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-light">
                    Add specific business capabilities to your package without bloating your base quote.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddonsModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2 shrink-0 self-start md:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" /> View All Add-ons ({OPTIONAL_ADDONS.length})
                </button>
              </div>

              {/* Highlights List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {OPTIONAL_ADDONS.slice(0, 6).map(addon => {
                  const cost = currency === 'USD' ? addon.costUSD : addon.costNGN;
                  const isChecked = selectedAddons.includes(addon.id);

                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isChecked
                          ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30'
                          : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 shrink-0 transition-all ${
                        isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-400 dark:border-gray-600 bg-white dark:bg-black'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{addon.name}</h4>
                          <span className="text-xs font-mono font-bold text-accent whitespace-nowrap">+{symbol}{formatNumber(cost)}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{addon.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── 5. INTERACTIVE PROJECT QUOTATION BUILDER ── */}
            <div id="quote-builder" className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-gray-900 via-neutral-900 to-black text-white border border-gray-800 shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-8 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-2">
                    <Calculator className="w-3.5 h-3.5" /> Interactive Project Quotation Builder
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight">
                    Select Scope → Customize → Instant Milestone Terms
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
                    Configure your project below to see the exact investment breakdown and milestone schedule (50% Kickoff & 50% Delivery).
                  </p>
                </div>

                <div className="text-left lg:text-right shrink-0 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 block mb-1">Estimated Investment</span>
                  <div className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
                    {totalEstimate ? `${symbol}${formatNumber(totalEstimate)}` : "Custom Quote"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Configuration Steps (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Step 1: Category */}
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-gray-400 mb-3">
                      01. What are you building?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.values(activePricing.categories).map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setQuoteCategory(cat.id);
                            const firstTier = cat.tiers[1] || cat.tiers[0];
                            if (firstTier) setQuoteTierId(firstTier.id);
                          }}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center truncate ${
                            quoteCategory === cat.id
                              ? 'bg-white text-black border-white shadow-md'
                              : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Package Tier */}
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-gray-400 mb-3">
                      02. Choose your package tier
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {builderCategoryData.tiers.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setQuoteTierId(t.id)}
                          className={`p-3.5 rounded-xl text-left border transition-all ${
                            quoteTierId === t.id
                              ? 'bg-blue-600/30 border-blue-400 text-white ring-2 ring-blue-500/30'
                              : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30'
                          }`}
                        >
                          <span className="text-[10px] text-accent font-bold block">{t.badge}</span>
                          <span className="text-sm font-bold block">{t.name}</span>
                          <span className="text-xs font-mono text-gray-400 block mt-1">
                            {t.price === "Custom Quote" ? "Custom" : `${symbol}${t.price}`}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Optional Features Pills */}
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-gray-400 mb-3">
                      03. Select optional enhancements
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {OPTIONAL_ADDONS.map(add => {
                        const cost = currency === 'USD' ? add.costUSD : add.costNGN;
                        const isChecked = selectedAddons.includes(add.id);
                        return (
                          <button
                            key={add.id}
                            type="button"
                            onClick={() => toggleAddon(add.id)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-heading font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                              isChecked
                                ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                                : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30'
                            }`}
                          >
                            <span>{isChecked ? '✓' : '+'}</span>
                            <span>{add.name}</span>
                            <span className="text-[10px] font-mono opacity-80">(+{symbol}{formatNumber(cost)})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right: Milestone Breakdown Summary (4 cols) */}
                <div className="lg:col-span-4 bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-heading font-bold uppercase tracking-[0.15em] text-accent block mb-2">Quotation Summary</span>
                    <h4 className="text-lg font-bold font-heading mb-4">{selectedTier.name} Package</h4>

                    <div className="space-y-2 text-xs border-b border-white/10 pb-4 mb-4">
                      <div className="flex justify-between text-gray-300">
                        <span>Core Deliverables</span>
                        <span className="font-mono">{selectedTier.price === "Custom Quote" ? "Custom" : `${symbol}${selectedTier.price}`}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Cloud Architecture & SSL</span>
                        <span className="font-mono text-emerald-400">Included</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Add-ons ({selectedAddons.length} selected)</span>
                        <span className="font-mono">{addonsCost === 0 ? `${symbol}0` : `+${symbol}${formatNumber(addonsCost)}`}</span>
                      </div>
                    </div>

                    {/* 50/50 Milestone Terms Breakdown Box */}
                    {totalEstimate && (
                      <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-2 mb-6">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">50/50 Milestone Terms</span>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-emerald-400 font-semibold">1. 50% Kickoff Milestone:</span>
                          <span className="font-mono font-bold">{symbol}{formatNumber(upfrontFifty)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-blue-400 font-semibold">2. 50% Final Delivery:</span>
                          <span className="font-mono font-bold">{symbol}{formatNumber(deliveryFifty)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Link
                      to={`/contact?service=${encodeURIComponent(quoteCategory)}&tier=${encodeURIComponent(selectedTier.name || '')}&addons=${encodeURIComponent(selectedAddons.join(','))}&currency=${encodeURIComponent(currency)}`}
                      className="w-full py-4 text-center text-[11px] font-heading font-bold uppercase tracking-[0.15em] rounded-xl bg-accent text-white hover:bg-accent/90 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      Request Proposal with This Scope <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <p className="text-[10px] text-center text-gray-400 mt-2 font-mono">
                      Includes warranty support & 100% source code ownership
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── OPTIONAL ADD-ONS MODAL ── */}
        <AnimatePresence>
          {showAddonsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8"
              >
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent block">Modular Customization</span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Optional Add-ons Catalog</h3>
                  </div>
                  <button onClick={() => setShowAddonsModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {OPTIONAL_ADDONS.map(addon => {
                    const cost = currency === 'USD' ? addon.costUSD : addon.costNGN;
                    const isChecked = selectedAddons.includes(addon.id);

                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                          isChecked
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40'
                            : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 shrink-0 transition-all ${
                          isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-400 dark:border-gray-600 bg-white dark:bg-black'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{addon.name}</h4>
                            <span className="text-xs font-mono font-bold text-accent">+{symbol}{formatNumber(cost)}</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{addon.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-semibold text-gray-500">
                    {selectedAddons.length} add-ons selected (+{symbol}{formatNumber(addonsCost)})
                  </span>
                  <button
                    onClick={() => {
                      setShowAddonsModal(false);
                      const el = document.getElementById('quote-builder');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-bold uppercase tracking-wider hover:bg-orange-600 transition-all"
                  >
                    Done / Update Quote
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};

export default Pricing;
