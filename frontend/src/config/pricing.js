/**
 * Buildwith_lami — Centralized Pricing & Commercial Configuration
 * Public starting budgets, optional care fees, and commercial terms.
 * Internal package benchmarks are kept in backend/src/config/proposalBenchmarks.js.
 *
 * Infrastructure is included at no additional charge for the first 12 months
 * of eligible build packages. The included level scales with the build:
 * Foundation → Growth → Scale → Enterprise.
 *
 * Infrastructure covers the live operating layer. Build warranty covers
 * implementation defects. Optional care plans cover the manual work listed, within their time allowance.
 */

// Approximate USD conversion rate. The Pricing page uses
// `useAutomatedCurrency` to detect the visitor's region in real time
// and switch the display between NGN and USD. The live rate is fetched
// from the backend FX service when available; this constant is a
// safety net for offline / cold-start scenarios.
export const FALLBACK_USD_RATE = 0.00065; // 1 NGN ≈ 0.00065 USD (≈ ₦1,540/$)

/**
 * Convert a NGN amount to USD using the provided rate.
 * Default fallback is used when live FX data is unavailable.
 */
export const ngnToUsd = (amountNgn, rate = FALLBACK_USD_RATE) => {
  const num = Number(amountNgn) || 0;
  return num * rate;
};

/**
 * Build a dual-currency formatted string for display.
 *   formatDualCurrency(270000, rate) -> { ngn: '270,000', usd: '$176', symbol: '₦' }
 */
export const formatDualCurrency = (amountNgn, rate = FALLBACK_USD_RATE, currency = 'NGN') => {
  const ngnFormatted = Number(amountNgn || 0).toLocaleString('en-NG');
  const usdRaw = ngnToUsd(amountNgn, rate);
  const usdFormatted = usdRaw >= 1
    ? `$${Math.round(usdRaw).toLocaleString('en-US')}`
    : `$${usdRaw.toFixed(2)}`;
  if (currency === 'USD') {
    return { primary: usdFormatted, secondary: `₦${ngnFormatted}`, symbol: '$' };
  }
  return { primary: `₦${ngnFormatted}`, secondary: usdFormatted, symbol: '₦' };
};

/** Public fixed regional care fees; these are not currency conversions. */
export const USD_CARE_PRICING = Object.freeze({
  "maint_essential": {
    "priceUSD": 2400,
    "annualPriceUSD": 2400,
    "monthlyPriceUSD": null
  },
  "maint_standard": {
    "priceUSD": 750,
    "annualPriceUSD": 7500,
    "monthlyPriceUSD": 750
  },
  "maint_growth": {
    "priceUSD": 1500,
    "annualPriceUSD": 15000,
    "monthlyPriceUSD": 1500
  },
  "maint_pro": {
    "priceUSD": 3600,
    "annualPriceUSD": 36000,
    "monthlyPriceUSD": 3600
  }
});

export const INFRASTRUCTURE_LEVELS = {
  foundation: {
    id: 'foundation',
    name: 'Foundation Infrastructure',
    shortName: 'Foundation',
    summary: 'Managed production essentials for focused launches.',
    included: [
      '1 client-owned domain with managed DNS',
      'Eligible static-site deployment, SSL and CDN configuration',
      'Automated uptime checks and outage alerts',
      'Quarterly dependency and security review',
      'Source-controlled deployment and rollback readiness'
    ]
  },
  growth: {
    id: 'growth',
    name: 'Growth Infrastructure',
    shortName: 'Growth',
    summary: 'More capacity, safer releases and priority alert review.',
    included: [
      'Everything in Foundation Infrastructure',
      'Separate staging environment',
      'Right-sized compute and database profile',
      'Up to 10,000 transactional emails per month',
      'Error and performance monitoring with backup-restore verification',
      'Priority business-hours alert review'
    ]
  },
  scale: {
    id: 'scale',
    name: 'Scale Infrastructure',
    shortName: 'Scale',
    summary: 'Stronger recovery, observability and capacity oversight.',
    included: [
      'Everything in Growth Infrastructure',
      'Isolated production and staging configuration',
      'Up to 25,000 transactional emails per month',
      'Enhanced application logs and alerting',
      'More frequent database recovery points where supported',
      'Quarterly capacity and security review'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Infrastructure',
    shortName: 'Enterprise',
    summary: 'Architecture-specific operations for critical systems.',
    included: [
      'Architecture-specific production environments',
      'Capacity and email allowances defined in the proposal',
      'Documented observability and recovery objectives',
      'Availability objectives and human response terms',
      'Quarterly architecture, capacity and security review'
    ]
  }
};

export const COMMERCIAL_TERMS = {
  currency: 'NGN',
  currencySymbol: '₦',
  vatRate: 0.075,
  vatLabel: '7.5% VAT where applicable',
  milestones: {
    kickoffPercent: 50,
    deliveryPercent: 50,
    label: '50% Kickoff Milestone / 50% Final Delivery'
  },
  infrastructure: {
    includedMonths: 12,
    description:
      'Eligible build packages include the infrastructure level named on the plan for the first 12 months at no additional charge.',
    renewal:
      'Before the included infrastructure period ends, choose a technical-care quote, an optional monthly retainer, or handover to your own team. Provider renewals are itemized separately; a development retainer is not required to keep the site online.',
    supportBoundary:
      'Automated monitoring runs continuously. Human response follows the business-hours window stated in the proposal or Care plan.',
    levels: INFRASTRUCTURE_LEVELS
  },
  disclaimer:
    'Website performance depends on application architecture, hosting infrastructure, traffic volume, third-party services, media assets, and network conditions. Buildwith_lami optimizes the application for production performance, while specific uptime or performance guarantees require an appropriate infrastructure tier.',
  footerNotice:
    'Regional starting budgets apply; USD prices are fixed regional rates, not currency conversions. Final scope, applicable taxes and running costs are confirmed in your proposal. Care fees cover labour; provider bills are separate except for any infrastructure allowance expressly included with your build.'
};

export const CARE_PLANS = [
  {
    "id": "maint_essential",
    "name": "Essential Care",
    "badge": "For Simple Static Websites",
    "billingCadence": "ANNUAL",
    "priceNGN": 130000,
    "priceFormatted": "130,000 / yr",
    "annualPriceNGN": 130000,
    "monthlyPriceNGN": null,
    "popular": false,
    "bestFor": "Simple static business websites, portfolios and landing pages without a CMS, database or checkout.",
    "timeline": "Billed annually; optional ongoing care",
    "revisions": "2 content updates/year, up to 30 minutes each",
    "support": "Acknowledgement within 2 business days",
    "desc": "Monitoring and scheduled technical care for a qualifying static website. Hosting and other provider bills are separate.",
    "features": [
      "Automated uptime monitoring with alerts reviewed during business hours",
      "Quarterly dependency, security and deployment review",
      "2 minor text or image updates per year, up to 30 minutes each",
      "Source-controlled deployment and rollback readiness"
    ],
    "notIncluded": [
      "CMS, databases, e-commerce or application maintenance",
      "Hosting, domains, email, paid tools and other provider bills",
      "Major repairs, new features and after-hours support; quoted separately"
    ]
  },
  {
    "id": "maint_standard",
    "name": "Standard Care",
    "badge": "Routine CMS Care & Small Updates",
    "billingCadence": "MONTHLY_OR_ANNUAL",
    "priceNGN": 40000,
    "priceFormatted": "40,000 / mo",
    "annualPriceNGN": 420000,
    "monthlyPriceNGN": 40000,
    "monthlyHours": 2,
    "popular": false,
    "bestFor": "Small CMS websites needing routine maintenance and occasional content updates.",
    "timeline": "Optional monthly or annual retainer",
    "revisions": "2 total hours/month; unused hours expire monthly",
    "support": "Acknowledgement within 1 business day",
    "desc": "Reserved time for agreed care and updates, with all manual work counted within the 2-hour monthly allowance. Provider bills are separate.",
    "features": [
      "Up to 2 total hours/month, including checks, troubleshooting, updates, testing and deployment",
      "Automated uptime monitoring with alerts reviewed during business hours",
      "CMS updates and backup or export checks within the monthly allowance",
      "Short monthly work summary within the same time allowance"
    ],
    "notIncluded": [
      "Hosting, domains, databases, email, licences and other provider bills",
      "Redesigns, major features or work beyond the allowance; quoted and approved separately",
      "24/7 monitoring by staff, after-hours response or guaranteed resolution times"
    ]
  },
  {
    "id": "maint_growth",
    "name": "Growth Care",
    "badge": "Care for Active Websites & Stores",
    "billingCadence": "MONTHLY_OR_ANNUAL",
    "priceNGN": 85000,
    "priceFormatted": "85,000 / mo",
    "annualPriceNGN": 900000,
    "monthlyPriceNGN": 85000,
    "monthlyHours": 4,
    "popular": true,
    "popularBadge": "For Active Websites",
    "bestFor": "Active websites and stores needing regular maintenance and small improvements.",
    "timeline": "Optional monthly or annual retainer",
    "revisions": "4 total hours/month; unused hours expire monthly",
    "support": "Acknowledgement within 8 business hours",
    "desc": "Reserved time for agreed care and updates, with all manual work counted within the 4-hour monthly allowance. Provider bills are separate.",
    "features": [
      "Up to 4 total hours/month, including checks, troubleshooting, updates, testing and deployment",
      "Automated uptime monitoring with alerts reviewed during business hours",
      "Checkout, form and performance checks, plus agreed small improvements within the allowance",
      "Short monthly work summary within the same time allowance"
    ],
    "notIncluded": [
      "Hosting, domains, databases, email, licences and other provider bills",
      "Redesigns, major features or work beyond the allowance; quoted and approved separately",
      "24/7 monitoring by staff, after-hours response or guaranteed resolution times"
    ]
  },
  {
    "id": "maint_pro",
    "name": "Pro Care",
    "badge": "Reserved Engineering & Maintenance",
    "billingCadence": "MONTHLY_OR_ANNUAL",
    "priceNGN": 225000,
    "priceFormatted": "225,000 / mo",
    "annualPriceNGN": 2400000,
    "monthlyPriceNGN": 225000,
    "monthlyHours": 10,
    "popular": false,
    "bestFor": "Established websites and applications with a defined ongoing engineering scope. Complex or critical systems require a separate assessment.",
    "timeline": "Optional monthly or annual retainer",
    "revisions": "10 total hours/month; unused hours expire monthly",
    "support": "Acknowledgement within 4 business hours",
    "desc": "Reserved time for agreed care and updates, with all manual work counted within the 10-hour monthly allowance. Provider bills are separate.",
    "features": [
      "Up to 10 total hours/month, including checks, troubleshooting, updates, testing and deployment",
      "Automated uptime monitoring with alerts reviewed during business hours",
      "Agreed feature, workflow and technical review work within the monthly allowance",
      "Short monthly work summary within the same time allowance"
    ],
    "notIncluded": [
      "Hosting, domains, databases, email, licences and other provider bills",
      "Redesigns, major features or work beyond the allowance; quoted and approved separately",
      "24/7 monitoring by staff, after-hours response or guaranteed resolution times"
    ]
  }
];

export const CARE_TERMS = [
  {
    "title": "Optional ongoing care",
    "description": "Choose technical care quoted for your site, a monthly retainer, or handover to your own team. CMS and application care need their own assessment; Essential is for simple static sites only."
  },
  {
    "title": "Provider bills",
    "description": "Hosting, domains, databases, storage, email and paid tools are itemized separately and normally paid directly to providers. Any infrastructure allowance expressly included in your build is honoured for its agreed period."
  },
  {
    "title": "Monthly work allowance",
    "description": "All manual work counts: routine checks, troubleshooting, requested changes, testing, deployment, client communication and reporting. Annual billing still provides the stated monthly allowance; unused monthly hours do not roll over."
  },
  {
    "title": "Business hours",
    "description": "Monday–Friday, 9:00am–5:00pm WAT, excluding Nigerian public holidays. Automated monitoring runs continuously; staff review alerts during business hours."
  },
  {
    "title": "Response and extra work",
    "description": "Response means acknowledgement and initial assessment, not a resolution guarantee. After-hours cover is not included. Work above the allowance is estimated and approved in writing before it begins."
  },
  {
    "title": "Warranty and handover",
    "description": "Your build includes only the bug-fix warranty period stated in its scope. It does not include a year of ongoing care. If you choose handover, your team takes responsibility for provider billing and ongoing maintenance."
  }
];

export const BUILD_PRICING = {
  websites: {
    id: 'websites',
    label: '🌐 Web Development',
    title: '01. Web Development',
    desc: 'One-time website builds with a defined starting scope. Eligible builds include the specified infrastructure allowance for 12 months; ongoing care is optional.',
    startingPriceNGN: 270000,
    startingPriceUSD: 6000,
    startingPriceFormatted: '270,000',
    baseInfraIncluded: true,
    whatAffectsPricing: [
      'Number of unique page templates and content types',
      'Custom CMS, API, or third-party integrations',
      'Performance, accessibility, and SEO requirements',
      'Content migration from an existing website',
      'Browser / device support and launch QA scope'
    ],
    pricingNotes:
      'Your proposal confirms the final build price, scope, bug-fix warranty and specified infrastructure allowance for 12 months. Before that allowance ends, choose a technical-care quote, optional monthly retainer, or handover. Domains, premium licences and provider overages are separate.',
    tiers: [
      {
        id: 'web_starter',
        name: 'Starter',
        badge: 'Focused 1–5 Page Website',
        priceNGN: 270000,
        priceUSD: 6000,
        priceFormatted: '270,000',
        popular: false,
        bestFor: 'Individuals, startups, and small businesses launching their first site.',
        examples: 'e.g. Creator Showcase, Brand Presence, Product Waitlist',
        timeline: '1–2 weeks',
        revisions: '1 round of revisions on the agreed design',
        support: '14 days of bug-fix support after launch',
        infrastructureLevel: 'foundation',
        desc: 'A focused, responsive one-to-five page website with a clear content structure and mobile-first layout.',
        features: [
          'Technical planning and site architecture',
          'Up to 5 responsive page templates',
          'Core content components',
          'Accessibility fundamentals and launch QA',
          'Contact form integration'
        ],
        notIncluded: [
          'CMS / editable content backend',
          'Copywriting',
          'Photography & stock assets',
          'Domain registration and paid provider usage',
          'Third-party API integrations'
        ]
      },
      {
        id: 'web_growth',
        name: 'Growth',
        badge: 'Complete Custom Website + CMS',
        priceFormatted: 'Custom Quote',
        popular: true,
        popularBadge: '⭐ Best Value',
        bestFor: 'Growing businesses needing a scalable website with easy content updates.',
        examples: 'e.g. Corporate Sites, Service Firms, Marketing Portals',
        timeline: '2–4 weeks',
        revisions: '2 structured rounds of revisions',
        support: '30 days of priority support after launch',
        infrastructureLevel: 'growth',
        desc: 'A complete custom website built on modern components, with a CMS and integrated lead-capture pipelines.',
        features: [
          'Everything in Starter',
          'Up to 10 custom page templates',
          'CMS setup & content modeling',
          'Lead-capture forms & email notifications',
          'Core Web Vitals & Technical SEO Compliance',
          'Analytics integration'
        ],
        notIncluded: [
          'Copywriting from scratch',
          'Custom web application features',
          'Custom native mobile apps'
        ]
      },
      {
        id: 'web_pro',
        name: 'Pro Platform',
        badge: 'Advanced Portals & Scaled Web',
        priceFormatted: 'Custom Quote',
        popular: false,
        bestFor: 'Established companies needing custom integrations, gated areas, or bespoke modules.',
        examples: 'e.g. High-Traffic Platforms, Custom Portals, Directory Hubs',
        timeline: '4–8 weeks',
        revisions: 'Iterative milestone reviews across each development phase',
        support: '60 days of priority engineering support',
        infrastructureLevel: 'scale',
        desc: 'A high-performance digital platform with custom dynamic workflows, gated areas, and multi-API integrations.',
        features: [
          'Everything in Growth',
          '15+ custom pages & complex layouts',
          'Protected client areas & user authentication',
          'Custom API integrations & database queries',
          'Dedicated staging preview environment'
        ],
        notIncluded: [
          'Ongoing care and changes outside the stated bug-fix warranty',
          'Third-party SaaS API monthly subscriptions'
        ]
      }
    ]
  },
  ecommerce: {
    id: 'ecommerce',
    label: '🛒 E-Commerce',
    title: '02. E-Commerce Engines',
    desc: 'Modern online storefronts engineered for smooth checkout, inventory sync, and real revenue.',
    startingPriceNGN: 650000,
    startingPriceUSD: 12000,
    startingPriceFormatted: '650,000',
    baseInfraIncluded: true,
    whatAffectsPricing: [
      'Total SKU count and variant complexity',
      'Payment gateway and multi-currency configurations',
      'Inventory sync and logistics courier API automation',
      'Customer accounts and order tracking requirements',
      'Marketing integrations and abandoned cart recovery'
    ],
    pricingNotes:
      'Starter includes Foundation Infrastructure, Growth includes Growth Infrastructure, and Pro Headless includes Scale Infrastructure for the first 12 months. Usage above the stated level and payment gateway transaction fees are scoped separately with no hidden markup.',
    tiers: [
      {
        id: 'ecom_starter',
        name: 'Starter',
        badge: 'Focused Boutique Storefront',
        priceNGN: 650000,
        priceUSD: 12000,
        priceFormatted: '650,000',
        popular: false,
        bestFor: 'New sellers launching a focused product line or boutique.',
        examples: 'e.g. Emerging Boutiques, Single-Product Brands',
        timeline: '2–3 weeks',
        revisions: '1 round of revisions on the agreed design',
        support: '14 days of launch bug-fix support',
        infrastructureLevel: 'foundation',
        desc: 'A focused storefront for a small catalogue with a straightforward buying path.',
        features: [
          'Store strategy and catalogue architecture',
          'Custom responsive storefront design',
          'Checkout & primary payment gateway (Paystack / Cards)',
          'Up to 25 products & variants configured',
          'Flat-rate shipping rules & local delivery setup',
          'Order management & stock dashboard'
        ],
        notIncluded: [
          'Product photography & studio editing',
          'Copywriting & product descriptions',
          'Automated multi-courier API integrations',
          'Paid ad management'
        ]
      },
      {
        id: 'ecom_growth',
        name: 'Growth',
        badge: 'Serious Growing Brands',
        priceFormatted: 'Custom Quote',
        popular: true,
        popularBadge: '⭐ Best Value',
        bestFor: 'Growing stores that want better conversion and easier management.',
        examples: 'e.g. Fashion Brands, Multi-Product Stores, Beauty Lines',
        timeline: '4–6 weeks',
        revisions: '2 rounds of revisions on the agreed design',
        support: '30 days of priority bug-fix support after launch',
        infrastructureLevel: 'growth',
        desc: 'A conversion-focused store with shipping, tax, analytics, and launch support.',
        features: [
          'Everything in Starter',
          'Up to 100 products with multi-variant matrices & filters',
          'Multi-zone shipping rules (Lagos, Interstate & International)',
          'Automated abandoned-cart recovery & email capture',
          'Customer accounts & past order lookup portal',
          'Discounts, promo codes & gift cards engine',
          'Google Analytics 4 E-Commerce telemetry & Meta Pixel'
        ],
        notIncluded: [
          'Direct courier API shipping account fees',
          'Payment gateway transaction charges',
          'Product photography production'
        ]
      },
      {
        id: 'ecom_pro',
        name: 'Pro Headless',
        badge: 'High-Volume Commerce',
        priceFormatted: 'Custom Quote',
        popular: false,
        bestFor: 'High-volume merchants needing faster storefronts, custom checkouts, and ERP sync.',
        examples: 'e.g. High-Volume Retailers, Multi-Warehouse Stores',
        timeline: '6–10 weeks',
        revisions: 'Phased sprint milestones with continuous review',
        support: '60 days of priority support with direct engineering access',
        infrastructureLevel: 'scale',
        desc: 'Custom headless storefront architecture with high-performance browsing and custom backends.',
        features: [
          'Everything in Growth',
          'Large product catalogues with advanced category hierarchies and agreed performance limits',
          'Custom React / Next.js headless commerce frontend',
          'Multi-warehouse inventory allocation & automated sync',
          'Multi-currency auto-conversion (NGN, USD, GBP, EUR)',
          'Automated courier webhook integration (DHL, FedEx, GIG)'
        ],
        notIncluded: [
          'Infrastructure usage above the included Scale limits',
          'Custom native mobile apps'
        ]
      }
    ]
  },
  software: {
    id: 'software',
    label: '⚙️ Custom Software',
    title: '03. Custom Software & SaaS',
    desc: 'Bespoke web applications, internal operational tools, and SaaS prototypes built for scale.',
    startingPriceNGN: 1200000,
    startingPriceUSD: 30000,
    startingPriceFormatted: '1,200,000',
    baseInfraIncluded: true,
    whatAffectsPricing: [
      'Database complexity and role-based access logic',
      'Connections to payments, messaging, and external business tools',
      'Live updates, notifications, and real-time collaboration requirements',
      'Security compliance and multi-tenant isolation',
      'Automated testing, release workflow, and staging requirements'
    ],
    pricingNotes:
      'Custom software includes 100% source code ownership and full GitHub repository handover. MVP includes Foundation Infrastructure, Growth Platform includes Growth Infrastructure, and Enterprise includes an architecture-specific Enterprise level for the first 12 months.',
    tiers: [
      {
        id: 'soft_mvp',
        name: 'MVP Platform',
        badge: 'Product Validation & Prototypes',
        priceFormatted: 'Custom Quote',
        popular: false,
        bestFor: 'Founders, startups, and teams validating a new software product.',
        examples: 'e.g. SaaS MVP, Client Data Portal, Booking Engine',
        timeline: '4–6 weeks',
        revisions: '1 iteration round on validated prototype',
        support: '90 days of post-launch engineering support',
        infrastructureLevel: 'foundation',
        desc: 'Custom full-stack software built to test market demand, automate core business logic, and onboard early users.',
        features: [
          'Tailored data structure and secure application connections',
          'Protected sign-in with permissions for each user role',
          'Custom interactive client / admin dashboard',
          'Payment gateway and automated workflow connections',
          'Transactional email & SMS notification workflows',
          '100% intellectual property & source code transfer'
        ],
        notIncluded: [
          'Multi-tenant enterprise partitioning',
          'Custom native mobile apps (iOS / Android)',
          'Infrastructure usage above the included Foundation limits'
        ]
      },
      {
        id: 'soft_growth',
        name: 'Growth Platform',
        badge: 'Full-Scale Business Systems',
        priceFormatted: 'Custom Quote',
        popular: true,
        popularBadge: '⭐ High-Scale Architecture',
        bestFor: 'Scaling companies needing internal ERPs, fintech tools & custom portals.',
        examples: 'e.g. Custom ERP, Financial Ledger, Multi-Role Portal',
        timeline: '6–10 weeks',
        revisions: '2 review cycles during phased delivery',
        support: '90 days of priority post-launch engineering support',
        infrastructureLevel: 'growth',
        desc: 'Robust architecture with multi-role workflows, automated reporting ledgers, and secure integration pipelines.',
        features: [
          'Everything in MVP Platform',
          'Complex multi-role business logic & encrypted data vault',
          'Automated financial ledgers & invoice generation pipelines',
          'Custom CRM pipelines & external partner integrations',
          'Live updates and searchable activity logs',
          'Staging environment with automated release testing'
        ],
        notIncluded: [
          'Third-party SMS / WhatsApp gateway credit costs',
          'Uncapped on-call engineering beyond agreed sprint scope',
          'On-premise bare-metal server cabling'
        ]
      },
      {
        id: 'soft_enterprise',
        name: 'Enterprise',
        badge: 'Mission-Critical SaaS & ERP',
        priceFormatted: 'Custom Quote',
        popular: false,
        bestFor: 'Multi-tenant SaaS platforms, enterprise ERPs & mission-critical systems.',
        examples: 'e.g. Multi-Tenant SaaS, High-Volume Data Systems',
        timeline: 'Scoped during discovery',
        revisions: 'Defined in statement of work',
        support: '90 days of priority engineering support & dedicated on-call window',
        infrastructureLevel: 'enterprise',
        desc: 'Dedicated cloud infrastructure planning, compliance pipelines, and 100% intellectual property transfer.',
        features: [
          'Multi-tenant data isolation & compliance protocols',
          'Production-grade cloud architecture with automated uptime monitoring',
          'Dedicated data pipelines & large-scale asynchronous processing',
          'Complete IP transfer, GitHub repo & architecture docs',
          'Dedicated priority support window & on-demand engineering'
        ],
        notIncluded: [
          'Infrastructure usage above the Enterprise profile agreed in the proposal',
          'Third-party software license subscriptions'
        ]
      }
    ]
  },
  portals: {
    id: 'portals',
    label: '🏢 Business Management Systems & ERP',
    title: '04. Business Management Systems & ERP',
    desc: 'Turnkey operational web applications engineered for schools, residential estates, wholesale warehouses, and supermarket retail chains.',
    startingPriceNGN: 850000,
    startingPriceUSD: 24000,
    startingPriceFormatted: '850,000',
    baseInfraIncluded: true,
    offerStructureLabel: 'Separate solution starting points — not upgrade tiers',
    whatAffectsPricing: [
      'Number of distinct operational roles (Admins, Staff, Students / Residents / Cashiers)',
      'Hardware integration requirements (QR scanners, barcode readers, thermal printers)',
      'Payment collection, billing reconciliation, and automated receipts',
      'Batch, expiry, and multi-location inventory synchronization',
      'SMS and WhatsApp operational notification volume'
    ],
    pricingNotes:
      'These are separate solution starting points, not versions of the same product. Every system includes source code ownership, database deployment, and staff onboarding. Infrastructure is matched to the operating demands of each solution.',
    tiers: [
      {
        id: 'portal_gatepass',
        name: 'Access & Operations Hub',
        badge: 'Estate Gate Pass & Visitor System',
        priceFormatted: 'Custom Quote',
        popular: false,
        bestFor: 'Residential estates, gated communities, corporate offices, and private facilities.',
        examples: 'e.g. Estate Gate Pass, Visitor QR Verification, Resident Management Hub',
        timeline: '2–3 weeks',
        revisions: '1 revision round on resident interface & QR pass layout',
        support: '30 days of operational support & staff onboarding',
        infrastructureLevel: 'foundation',
        desc: 'A streamlined web portal allowing residents to generate timed digital visitor passes, with a guard tablet scanner for rapid entry validation.',
        features: [
          'Resident self-service portal (generate timed visitor access codes & QR passes)',
          'Security guard PWA / tablet scanner interface for rapid check-in / out',
          'Automated SMS / WhatsApp arrival notification to host resident',
          'Vehicle license plate logging, entry / exit timestamp audit trail',
          'Estate manager admin dashboard with resident directory & blacklist alerts',
          '100% source code handover & database setup'
        ],
        notIncluded: [
          'Hardware tablets / scanners (we provide hardware recommendations)',
          'Third-party SMS / WhatsApp gateway credit costs'
        ]
      },
      {
        id: 'portal_school',
        name: 'School & Academic Portal',
        badge: 'School Management & Student Portal',
        priceFormatted: 'Custom Quote',
        popular: true,
        popularBadge: '⭐ Complete Academic Solution',
        bestFor: 'Primary & secondary schools, training academies, and tertiary institutions.',
        examples: 'e.g. School Management ERP, Student Report Card Portal, Tuition Billing',
        timeline: '4–6 weeks',
        revisions: '2 revision cycles across grading and student records',
        support: '60 days of academic priority support & teacher training',
        infrastructureLevel: 'growth',
        desc: 'A comprehensive academic management system managing student admissions, continuous assessment grading, automated PDF report cards, and online fee collection.',
        features: [
          'Multi-role access: Super Admin, Principal, Teachers, Students & Parents',
          'Student admissions, bio-data records & classroom assignment',
          'Subject score entry with automated CA grading, positions & remarks calculation',
          'One-click downloadable & printable PDF termly report cards',
          'Online school fees payment integration (Paystack / Cards) with auto-receipts',
          'Daily student attendance tracking and disciplinary record log',
          'SMS / Email announcements broadcast engine for parents'
        ],
        notIncluded: [
          'Third-party SMS broadcast credits (billed directly by provider)',
          'Bulk student historical data entry (template provided for self-upload)'
        ]
      },
      {
        id: 'portal_retail',
        name: 'Logistics & Retail ERP',
        badge: 'Warehouse & Supermarket Hub',
        priceFormatted: 'Custom Quote',
        popular: false,
        bestFor: 'Wholesale distributors, multi-warehouse operators, supermarkets, and multi-branch retail stores.',
        examples: 'e.g. Supermarket POS, Warehouse Inventory Hub, Wholesale Distribution ERP',
        timeline: '6–8 weeks',
        revisions: 'Iterative milestone reviews per branch deployment',
        support: '90 days of enterprise priority warranty & staff training',
        infrastructureLevel: 'scale',
        desc: 'An enterprise inventory and Point-of-Sale operating system with real-time stock deductions, multi-location transfers, barcode scanning, and daily cash reconciliation.',
        features: [
          'High-speed POS Cashier checkout screen with barcode scanner & receipt printer support',
          'Real-time multi-branch and warehouse inventory tracking with low-stock alerts',
          'Batch tracking, serial numbers, and product expiration date monitoring',
          'Inter-warehouse stock transfer requests, dispatch approvals & transit logs',
          'Supplier purchase order management & goods received note (GRN) reconciliation',
          'Daily cash drawer reconciliation, cashier shift audits & gross profit analytics',
          'Role-based permissions (Cashier, Storekeeper, Warehouse Manager, Auditor)'
        ],
        notIncluded: [
          'POS hardware peripherals (thermal printers, barcode scanners, cash drawers)',
          'Infrastructure usage above the included Scale limits'
        ]
      }
    ]
  },
  uiux: {
    id: 'uiux',
    label: '🎨 UI/UX Design',
    title: '05. UI/UX & Product Design',
    desc: 'User-centered interfaces and clickable prototypes designed for engagement and clear visual hierarchy.',
    startingPriceNGN: 280000,
    startingPriceUSD: 6000,
    startingPriceFormatted: '280,000',
    baseInfraIncluded: false,
    baseInfraNote:
      'UI/UX deliverables are design files (Figma), so no hosting or domain is required. The matching Infrastructure level is included only when design is paired with an eligible development build.',
    whatAffectsPricing: [
      'Total number of unique user screens and modal flows',
      'Depth of user research, persona creation, and journey mapping',
      'Figma interactive prototype fidelity and micro-interactions',
      'Design system governance and reusable component architecture',
      'Developer handoff pairing and CSS variable tokens export'
    ],
    pricingNotes:
      'All UI/UX engagements deliver 100% Figma source files with complete autolayout, component variables, and developer-ready CSS design tokens. No hosting / domain infrastructure is included — that layer is bundled only when paired with a development build.',
    tiers: [
      {
        id: 'uiux_starter',
        name: 'Starter',
        badge: 'Focused UI Wireframes & Layout',
        priceNGN: 280000,
        priceUSD: 6000,
        priceFormatted: '280,000',
        popular: false,
        bestFor: 'New projects, landing pages, and straightforward multi-page flows.',
        examples: 'e.g. Landing Page UI, 5-Screen MVP Flow',
        timeline: '1–2 weeks',
        revisions: '1 revision round on final UI wireframes',
        support: '7 days of asset handoff support',
        desc: 'Core user interface design covering key user journeys and clean typography.',
        features: [
          'User journey mapping & information hierarchy',
          'Up to 6 high-fidelity desktop & mobile Figma screens',
          'Design tokens export (colors, typography, spacing)'
        ],
        notIncluded: ['Full interactive prototyping', 'Complex multi-state components']
      },
      {
        id: 'uiux_growth',
        name: 'Growth',
        badge: 'Complete Product Design System',
        priceFormatted: 'Custom Quote',
        popular: true,
        popularBadge: '⭐ Best Value',
        bestFor: 'Digital products, SaaS apps, and scalable customer platforms.',
        examples: 'e.g. Complete Web App UI, E-Commerce Experience',
        timeline: '2–3 weeks',
        revisions: '2 structured rounds of revisions',
        support: '14 days of developer handoff pairing',
        desc: 'Full UI/UX product design with interactive prototypes and component library.',
        features: [
          'Everything in Starter',
          'Up to 18 high-fidelity responsive screens',
          'Clickable Figma prototype with micro-interactions',
          'Component library with autolayout & variants',
          'Edge states (empty, loading, error, success)'
        ],
        notIncluded: ['Frontend code implementation (available under Web Dev)']
      },
      {
        id: 'uiux_pro',
        name: 'Pro Platform',
        badge: 'Enterprise Design Architecture',
        priceFormatted: 'Custom Quote',
        popular: false,
        bestFor: 'Large-scale platforms, multi-role portals, and enterprise software.',
        examples: 'e.g. Multi-Tenant SaaS UI, Complex ERP Systems',
        timeline: '4–6 weeks',
        revisions: 'Iterative component reviews across design phases',
        support: '30 days of design system governance support',
        desc: 'Comprehensive enterprise design systems with governed tokens and documentation.',
        features: [
          'Everything in Growth',
          '30+ screens covering all user roles & exceptions',
          'Full Design System documentation in Figma',
          'Design token sync (JSON / CSS variables)',
          'Interactive user testing feedback synthesis'
        ],
        notIncluded: ['Frontend code engineering']
      }
    ]
  },
  branding: {
    id: 'branding',
    label: '✨ Branding & Identity',
    title: '06. Branding & Visual Identity',
    desc: 'Distinctive brand identities, logo systems, and visual guidelines that build trust and market recognition.',
    startingPriceNGN: 250000,
    startingPriceUSD: 6000,
    startingPriceFormatted: '250,000',
    baseInfraIncluded: false,
    baseInfraNote:
      'Branding deliverables are static assets (logos, decks, stationery) — no hosting required. Domain registration is included only when paired with a development build.',
    whatAffectsPricing: [
      'Number of distinct logo concept directions explored',
      'Depth of brand guidelines deck and usage rules',
      'Collateral deliverables (stationery, pitch decks, social kits)',
      'Vector icon sets and custom brand illustration styling',
      'Physical packaging, merchandise, or signage direction'
    ],
    pricingNotes:
      'All branding deliverables include master vector formats (AI, EPS, SVG, PDF) and export assets for digital and print reproduction.',
    tiers: [
      {
        id: 'brand_starter',
        name: 'Starter',
        badge: 'Core Identity Kit',
        priceNGN: 250000,
        priceUSD: 6000,
        priceFormatted: '250,000',
        popular: false,
        bestFor: 'New ventures, personal brands, and early-stage startups.',
        examples: 'e.g. Startup Logo, Creator Identity Kit',
        timeline: '1–2 weeks',
        revisions: '1 round of refinement on selected concept',
        support: '7 days of asset delivery support',
        desc: 'Essential visual identity with logo marks, color palette, and typography.',
        features: [
          '2 distinct logo concept directions',
          'Primary logo, secondary mark & favicon',
          'Curated color palette & typography pairing',
          'Master vector files (SVG, PDF, PNG)'
        ],
        notIncluded: ['Full brand guideline book', 'Social media templates']
      },
      {
        id: 'brand_growth',
        name: 'Growth',
        badge: 'Complete Brand System',
        priceFormatted: 'Custom Quote',
        popular: true,
        popularBadge: '⭐ Best Value',
        bestFor: 'Growing companies establishing a consistent, authoritative presence.',
        examples: 'e.g. Corporate Brand Refresh, Product Launch Identity',
        timeline: '2–3 weeks',
        revisions: '2 revision rounds on chosen concept',
        support: '14 days of brand application guidance',
        desc: 'Complete brand guidelines, marketing assets, and stationery templates.',
        features: [
          'Everything in Starter',
          '3 creative logo concept directions',
          'Comprehensive Brand Guidelines deck (25+ pages)',
          'Social media profile & cover asset suite',
          'Business card, letterhead & invoice styling',
          'Custom brand pattern & icon styling'
        ],
        notIncluded: ['Physical print production management']
      },
      {
        id: 'brand_pro',
        name: 'Pro Programme',
        badge: 'Enterprise Brand Governance',
        priceFormatted: 'Custom Quote',
        popular: false,
        bestFor: 'Multi-division companies, rebrands, and premium market leaders.',
        examples: 'e.g. Corporate Conglomerate, Premium Retail Brand',
        timeline: '4–6 weeks',
        revisions: 'Iterative revisions across brand architecture milestones',
        support: '30 days of brand launch guidance',
        desc: 'Enterprise brand architecture, sub-brand systems, and complete identity governance.',
        features: [
          'Everything in Growth',
          'Sub-brand / product architecture mapping',
          'Pitch deck master presentation template',
          'Marketing campaign creative direction guide',
          'Packaging & physical merchandise direction'
        ],
        notIncluded: ['Third-party font licensing costs']
      }
    ]
  },
  seo: {
    id: 'seo',
    label: '📈 Search Engine SEO',
    title: '07. Search Engine Optimization (SEO)',
    desc: 'Technical search optimization, schema architecture, and content structure for sustainable inbound growth.',
    startingPriceNGN: 220000,
    startingPriceUSD: 6000,
    startingPriceFormatted: '220,000',
    baseInfraIncluded: false,
    offerStructureLabel: 'Choose your stage: Audit → Implementation → Ongoing Growth',
    baseInfraNote:
      'SEO engagements are advisory + code-implementation services. No hosting or domain is included — these are owned by the client.',
    whatAffectsPricing: [
      'Website size, domain authority, and indexation history',
      'Technical debt, crawl errors, and legacy redirect chains',
      'Competitor search intensity in your target industry',
      'Schema markup depth (LocalBusiness, Product, FAQ, Article)',
      'Ongoing content strategy and backlink profile health'
    ],
    pricingNotes:
      'Start with an Audit when the problems are unclear, choose Implementation when the fixes are already understood, and add Ongoing Growth after the technical foundation is healthy. A new retainer may require a separate onboarding audit.',
    tiers: [
      {
        id: 'seo_starter',
        name: 'Starter Audit',
        badge: 'Technical Health & Roadmap',
        priceNGN: 220000,
        priceUSD: 6000,
        priceFormatted: '220,000',
        popular: false,
        bestFor: 'Websites with poor search visibility or unindexed content.',
        examples: 'e.g. Site Launch Audit, Crawl Error Diagnosis',
        timeline: '1–2 weeks',
        revisions: '1 review session on audit findings',
        support: '14 days of developer question support',
        desc: 'Deep technical crawl audit, error identification, and prioritized fix list.',
        features: [
          'Full-site crawlability & indexation diagnostic',
          'Heading hierarchy, title & meta tag audit',
          'Speed & Core Web Vitals diagnostic report',
          'Google Search Console setup & sitemap verification',
          'Prioritized developer action plan'
        ],
        notIncluded: ['Direct codebase implementation (report only)']
      },
      {
        id: 'seo_growth',
        name: 'Growth Implementation',
        badge: 'Technical Fixes & Schema',
        priceFormatted: 'Custom Quote',
        popular: true,
        popularBadge: '⭐ Best Value',
        bestFor: 'Businesses wanting technical SEO implemented directly in code.',
        examples: 'e.g. E-Commerce SEO Overhaul, Corporate SEO Setup',
        timeline: '2–4 weeks',
        revisions: '1 post-implementation verification review',
        support: '30 days of rank tracking & verification',
        desc: 'Complete on-page code fixes, structured schema, and speed optimization.',
        features: [
          'Everything in Starter Audit',
          'Direct codebase on-page SEO implementation',
          'Structured search markup for organizations, products, and FAQs',
          'Core Web Vitals speed tuning in source code',
          'Keyword mapping & content structure guidelines',
          'Automated XML sitemap & robots.txt rules'
        ],
        notIncluded: ['Monthly link building retainers']
      },
      {
        id: 'seo_pro',
        name: 'Ongoing Growth',
        badge: 'Ongoing Organic Growth',
        priceFormatted: 'Custom Quote',
        popular: false,
        bestFor: 'Companies competing for high-intent, revenue-generating keywords.',
        examples: 'e.g. National Service Brands, Competitive E-Commerce',
        timeline: 'Ongoing monthly cadence',
        revisions: 'Continuous monthly strategy adjustments',
        support: 'Priority strategy support & bi-weekly check-ins',
        desc: 'Monthly technical monitoring, competitor rank tracking, and content optimization.',
        features: [
          'Technical monitoring for the approved website scope',
          'Continuous monthly technical health monitoring',
          'Competitor keyword movement & gap analysis',
          'Monthly conversion & search performance reports',
          'Quarterly content refresh strategy'
        ],
        notIncluded: ['Initial implementation when technical fixes are still outstanding', 'Third-party paid link placements']
      }
    ]
  },
  marketing: {
    id: 'marketing',
    label: '📣 Digital Marketing',
    title: '08. Digital Marketing & Campaigns',
    desc: 'Targeted ad campaigns, conversion funnels, and data attribution designed to generate qualified leads.',
    startingPriceNGN: 250000,
    startingPriceUSD: 6000,
    startingPriceFormatted: '250,000',
    baseInfraIncluded: false,
    offerStructureLabel: 'Choose your stage: Strategy → Campaign Launch → Monthly Management',
    baseInfraNote:
      'Marketing engagements produce strategy + creative assets. Hosting for landing pages is provided only when built alongside a development engagement.',
    whatAffectsPricing: [
      'Number of advertising channels (Meta, Google, LinkedIn)',
      'Creative asset volume (static graphics, motion, copy variants)',
      'Landing page design and split-testing requirements',
      'Conversion tracking and analytics requirements',
      'Monthly advertising budget under management'
    ],
    pricingNotes:
      'Strategy and Campaign Launch are one-time engagements. Monthly Management begins after launch; if campaign foundations do not exist, onboarding is scoped first. Advertising spend is always paid directly to the platforms.',
    tiers: [
      {
        id: 'mktg_starter',
        name: 'Strategy Blueprint',
        badge: 'Go-To-Market Roadmap',
        priceNGN: 250000,
        priceUSD: 6000,
        priceFormatted: '250,000',
        popular: false,
        bestFor: 'Businesses needing a clear campaign direction before spending ad money.',
        examples: 'e.g. Product Launch Strategy, Service Firm Lead Gen Plan',
        timeline: '1–2 weeks',
        revisions: '1 round of adjustments on strategy deck',
        support: '7 days of briefing support',
        desc: 'Targeting strategy, messaging angles, and channel budget allocation.',
        features: [
          'Target audience persona & competitor ad analysis',
          'Messaging angles & high-converting offer framing',
          'Channel recommendation & budget split model',
          'Creative brief templates & copy swipe file'
        ],
        notIncluded: ['Ad creative production', 'Active campaign management']
      },
      {
        id: 'mktg_growth',
        name: 'Campaign Launch',
        badge: 'Full Creative & Pixel Setup',
        priceFormatted: 'Custom Quote',
        popular: true,
        popularBadge: '⭐ Best Value',
        bestFor: 'Brands ready to launch high-converting paid acquisition campaigns.',
        examples: 'e.g. E-Commerce Sales Push, B2B Lead Gen Funnel',
        timeline: '2–4 weeks',
        revisions: '1 creative revision round before ad spend launch',
        support: '30-day post-launch campaign review',
        desc: 'Complete campaign build with landing page, ad creatives, and tracking.',
        features: [
          'Everything in Strategy Blueprint',
          'Custom high-converting campaign landing page',
          '5 tailored ad creative sets (copy + visual assets)',
          'Meta Pixel and reliable server-side conversion tracking',
          'Google Analytics 4 conversion event tracking'
        ],
        notIncluded: ['Direct platform ad spend (paid by client)']
      },
      {
        id: 'mktg_pro',
        name: 'Monthly Management',
        badge: 'Ongoing Growth Management',
        priceFormatted: 'Custom Quote',
        popular: false,
        bestFor: 'Active businesses scaling monthly ad spend and lead flow.',
        examples: 'e.g. Scaling E-Commerce, High-Ticket Lead Gen',
        timeline: 'Ongoing monthly cadence',
        revisions: 'Continuous creative & campaign optimization',
        support: 'Priority strategic support & weekly performance reports',
        desc: 'Continuous campaign management, A/B creative testing, and funnel optimization.',
        features: [
          'Management of approved campaign accounts and tracking',
          'Active campaign optimization across channels',
          'Weekly creative refreshes (copy & graphics)',
          'Landing page conversion rate optimization (CRO)',
          'Weekly ROI reporting & lead pipeline auditing'
        ],
        notIncluded: ['Initial strategy, creative production, or tracking setup when not already completed', 'Ad spend budget (billed directly by ad networks)']
      }
    ]
  },
  ai: {
    id: 'ai',
    label: '⚡ AI & Automations',
    title: '09. AI Solutions & Workflow Automations',
    desc: 'Connected AI workflows that reduce repetitive work and move information between your business tools.',
    startingPriceNGN: 450000,
    startingPriceUSD: 7200,
    startingPriceFormatted: '450,000',
    baseInfraIncluded: true,
    whatAffectsPricing: [
      'Number of software tools and data sources being connected',
      'LLM integration depth, prompt logic, and retrieval accuracy',
      'Webhook complexity, failover rules, and edge conditions',
      'Data security, privacy constraints, and compliance review',
      'Staff onboarding, documentation, and video runbooks'
    ],
    pricingNotes:
      'Automation setups include architecture mapping, sandbox testing, failover handling, and staff walkthroughs. Starter includes Foundation Infrastructure, Growth includes Growth Infrastructure, and Enterprise AI includes an architecture-specific Enterprise level for the first 12 months.',
    tiers: [
      {
        id: 'ai_starter',
        name: 'Starter Automation',
        badge: 'Core Workflow Pipeline',
        priceFormatted: 'Custom Quote',
        popular: false,
        bestFor: 'Teams spending hours on manual data entry and lead routing.',
        examples: 'e.g. Lead-to-CRM Sync, WhatsApp Order Notifications',
        timeline: '1–2 weeks',
        revisions: '1 round of tuning on prompt logic & triggers',
        support: '14 days of automation monitoring support',
        infrastructureLevel: 'foundation',
        desc: 'Streamlined automation connecting 2–3 core business tools.',
        features: [
          'Workflow discovery & architecture mapping',
          'Integration connecting up to 3 business tools',
          'Automated lead capture & notification pipeline',
          'Failure alerts delivered by email or WhatsApp',
          'Loom video walkthrough for team training'
        ],
        notIncluded: ['Custom LLM fine-tuning', 'Complex multi-step database branching']
      },
      {
        id: 'ai_growth',
        name: 'Growth Pipeline',
        badge: 'Multi-Step AI Automation',
        priceFormatted: 'Custom Quote',
        popular: true,
        popularBadge: '⭐ Best Value',
        bestFor: 'Companies wanting AI-assisted operations, document processing & CRM sync.',
        examples: 'e.g. AI Customer Service Triage, Automated Invoice Processing',
        timeline: '3–5 weeks',
        revisions: '2 testing rounds on automated logic & failovers',
        support: '30 days of priority integration support',
        infrastructureLevel: 'growth',
        desc: 'Advanced automated workflows with AI text extraction, CRM sync, and databases.',
        features: [
          'Everything in Starter Automation',
          'Integration connecting up to 6 business tools or data services',
          'AI-powered data classification & extraction',
          'Automated customer onboarding & email sequences',
          'Custom connections for systems that need to exchange data',
          'Automated data backup & retry queue system'
        ],
        notIncluded: ['Third-party AI API token fees (OpenAI, Anthropic)']
      },
      {
        id: 'ai_pro',
        name: 'Enterprise AI Suite',
        badge: 'Custom Agent Architecture',
        priceFormatted: 'Custom Quote',
        popular: false,
        bestFor: 'Enterprises deploying proprietary AI chatbots, custom models, and internal tools.',
        examples: 'e.g. Internal Knowledge Assistant, Secure Company Search',
        timeline: '6–10 weeks',
        revisions: 'Iterative sprint reviews across data ingestion & outputs',
        support: '60 days of priority engineering support',
        infrastructureLevel: 'enterprise',
        desc: 'Secure company knowledge assistants and multi-step AI workflows tailored to internal data.',
        features: [
          'Everything in Growth Pipeline',
          'Custom AI chatbot trained on internal company data',
          'Searchable knowledge index for approved company information',
          'Role-based staff access & sensitive data filtering',
          'High-availability workflow architecture with a 99.9% uptime target',
          'Complete IP handover & technical runbook'
        ],
        notIncluded: ['Third-party GPU server compute billing']
      }
    ]
  },
  maintenance: {
    id: 'maintenance',
    label: '🛡️ Website Maintenance',
    title: '10. Website Care & Managed Operations',
    desc: 'Optional care for your website: choose a technical-care quote, reserved monthly work, or handover to your own team.',
    startingPriceNGN: 130000,
    startingPriceFormatted: '130,000 / yr',
    baseInfraIncluded: false,
    offerStructureLabel: 'Care is optional. Provider bills are separate from these labour fees.',
    baseInfraNote:
      'Essential Care is ₦130,000/year for qualifying simple static websites. CMS websites and applications need a tailored baseline care quote; monthly development retainers are optional.',
    pricingNotes:
      'Care prices cover the stated labour and monitoring work, not provider bills. All manual work counts within monthly allowances, including routine checks, troubleshooting and reporting. Additional work is estimated and approved before it begins. Existing signed proposals retain their agreed terms.',
    tiers: CARE_PLANS
  }
};

export const BUDGET_RANGES = [
  'Under ₦270k',
  '₦270k – ₦850k',
  '₦850k – ₦2M',
  '₦2M+',
  'Not sure yet'
];
