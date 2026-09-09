/**
 * Buildwith_lami — Centralized Pricing & Commercial Configuration
 * Single source of truth for all public rates, care retainers, and commercial terms.
 *
 * Infrastructure is included at no additional charge for the first 12 months
 * of eligible build packages. The included level scales with the build:
 * Foundation → Growth → Scale → Enterprise.
 *
 * Infrastructure covers the live operating layer. Build warranty covers
 * implementation defects. Care plans cover ongoing human development work.
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

export const INFRASTRUCTURE_LEVELS = {
  foundation: {
    id: 'foundation',
    name: 'Foundation Infrastructure',
    shortName: 'Foundation',
    annualNGN: 130000,
    valuePrefix: '',
    summary: 'Managed production essentials for focused launches.',
    included: [
      '1 client-owned domain with managed DNS',
      'Production deployment, SSL and CDN configuration',
      'Up to 5,000 transactional emails per month',
      'Daily backups with 90-day retention',
      'Automated uptime checks and essential security patches'
    ]
  },
  growth: {
    id: 'growth',
    name: 'Growth Infrastructure',
    shortName: 'Growth',
    annualNGN: 240000,
    valuePrefix: '',
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
    annualNGN: 420000,
    valuePrefix: '',
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
    annualNGN: 750000,
    valuePrefix: 'from',
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
      'From month 13, continue through the matching Care plan, move provider billing to client-owned accounts, or agree a right-sized profile based on actual usage.',
    supportBoundary:
      'Automated monitoring runs continuously. Human response follows the business-hours window stated in the proposal or Care plan.',
    levels: INFRASTRUCTURE_LEVELS
  },
  disclaimer:
    'Website performance depends on application architecture, hosting infrastructure, traffic volume, third-party services, media assets, and network conditions. Buildwith_lami optimizes the application for production performance, while specific uptime or performance guarantees require an appropriate infrastructure tier.',
  footerNotice:
    'All prices in Nigerian Naira (₦). Prices exclude 7.5% VAT where applicable. Currency auto-detected from your region. International clients see USD equivalents; final invoicing remains in NGN.'
};

export const CARE_PLANS = [
  {
    id: 'maint_essential',
    name: 'Essential Care',
    badge: 'Annual Website Care & Health Retainer',
    billingCadence: 'ANNUAL',
    priceNGN: 130000,
    priceFormatted: '130,000 / yr',
    annualPriceNGN: 130000,
    monthlyPriceNGN: null,
    popular: false,
    bestFor: 'Small business websites, personal portfolios, and low-complexity e-commerce stores.',
    examples: 'e.g. Small Business Site, Creator Portfolio, Single-Product Store',
    timeline: 'Annual care plan',
    revisions: 'Minor bug fixes & small text tweaks included',
    support: 'Standard email & ticket support (24–48h response)',
    infrastructureLevel: 'foundation',
    desc: 'For businesses that want their website kept healthy without a monthly development retainer.',
    features: [
      'Managed production infrastructure configuration',
      'SSL certificate provisioning & renewal monitoring',
      'Automated uptime health checks with outage alerting',
      'Software, plugin & security dependency updates',
      'Basic automated backup configuration (90-day retention)',
      'Minor bug fixes & basic technical health checks'
    ],
    notIncluded: [
      'Monthly feature development (available in Standard / Growth Care)',
      'Usage above the included Foundation Infrastructure limits',
      'Premium third-party SaaS licences and transaction fees'
    ]
  },
  {
    id: 'maint_standard',
    name: 'Standard Care',
    badge: 'Monthly Updates & Monitoring',
    billingCadence: 'MONTHLY_OR_ANNUAL',
    priceNGN: 60000,
    priceFormatted: '60,000 / mo',
    annualPriceNGN: 600000,
    monthlyPriceNGN: 60000,
    popular: false,
    bestFor: 'Growing websites that need regular content publishing and scheduled health checks.',
    examples: 'e.g. Corporate Blogs, Professional Service Firms, Active Portfolios',
    timeline: 'Monthly or Annual retainer',
    revisions: 'Included within 2-hour monthly allowance',
    support: 'Standard email & WhatsApp support (24h response)',
    infrastructureLevel: 'growth',
    desc: 'Dependable routine care with up to 2 hours of monthly developer updates, speed checks, and monthly health reports.',
    features: [
      'Everything in Essential Care',
      'Up to 2 hours of dedicated developer updates & content publishing per month',
      'Monthly performance & security audit summary report',
      'Database snapshot verification & health telemetry check',
      'Standard email & WhatsApp response window'
    ],
    notIncluded: [
      'Major feature engineering (available in Growth / Pro Care)',
      'After-hours emergency calls',
      'Usage above the included Growth Infrastructure limits'
    ]
  },
  {
    id: 'maint_growth',
    name: 'Growth Care',
    badge: 'Active Improvement Retainer',
    billingCadence: 'MONTHLY',
    priceNGN: 150000,
    priceFormatted: '150,000 / mo',
    annualPriceNGN: 1620000,
    monthlyPriceNGN: 150000,
    popular: true,
    popularBadge: '⭐ Best Value',
    bestFor: 'Active websites and e-commerce stores that change, publish content, and improve regularly.',
    examples: 'e.g. E-Commerce Stores, Active Businesses, Lead Gen Portals',
    timeline: 'Monthly retainer',
    revisions: 'Included within 4-hour improvement allowance',
    support: 'Prioritized email & WhatsApp support (12h response)',
    infrastructureLevel: 'scale',
    desc: 'An active monthly improvement retainer with dedicated developer hours, conversion testing, and ongoing performance tuning.',
    features: [
      'Everything in Essential Care & Standard Care',
      'Up to 4 hours of dedicated developer improvement work per month',
      'Checkout, forms, and conversion flow testing where applicable',
      'Performance monitoring & Core Web Vitals optimization',
      'Small UX & conversion improvements',
      'Priority email & WhatsApp response window',
      'Monthly maintenance & performance reporting'
    ],
    notIncluded: [
      'Large-scale complete website redesigns',
      'After-hours emergency calls',
      'Infrastructure usage above the included Scale limits',
      'Third-party advertising and premium SaaS costs'
    ]
  },
  {
    id: 'maint_pro',
    name: 'Pro Care',
    badge: 'Ongoing Engineering Retainer',
    billingCadence: 'MONTHLY',
    priceNGN: 350000,
    priceFormatted: '350,000 / mo',
    annualPriceNGN: 3850000,
    monthlyPriceNGN: 350000,
    popular: false,
    bestFor: 'High-traffic stores, SaaS portals, and business-critical platforms where uptime matters.',
    examples: 'e.g. High-Volume E-Commerce, SaaS Platforms, Corporate Groups',
    timeline: 'Monthly retainer',
    revisions: 'Included within 10-hour allowance',
    support: 'Priority emergency support window (4h response, direct WhatsApp channel)',
    infrastructureLevel: 'enterprise',
    desc: 'A high-touch engineering retainer with 10 hours monthly development, priority emergency window, and proactive technical reviews.',
    features: [
      'Everything in Growth Care',
      'Up to 10 hours of active feature engineering & workflow development per month',
      'Priority emergency support window',
      'Proactive quarterly architectural & SEO health reviews',
      'Direct senior engineering WhatsApp / Call channel'
    ],
    notIncluded: [
      'Complete platform rewrites',
      'Third-party enterprise software licensing',
      'Infrastructure usage above the Enterprise profile agreed in the proposal',
      'Uncapped on-demand engineering beyond allocated retainer'
    ]
  }
];

export const OPTIONAL_ADDONS = [
  {
    id: 'addon_shipping',
    name: 'Multi-Zone Courier Shipping Rules',
    desc: 'Local delivery zones (Lagos / Interstate / Intl) + Automated courier API sync',
    costNGN: 100000,
    highlight: true
  },
  {
    id: 'addon_gateway',
    name: 'Cross-Border Payment Gateway',
    desc: 'Accept international debit / credit cards, Stripe, UAE payments, or PayPal',
    costNGN: 80000,
    highlight: true
  },
  {
    id: 'addon_seo',
    name: 'Advanced Local SEO & GBP Optimization',
    desc: 'Google Business Profile setup, local citation building, geo-targeted landing pages, and review-generation strategy — beyond the technical SEO bundled in Growth',
    costNGN: 100000,
    highlight: true
  },
  {
    id: 'addon_automation',
    name: 'Custom Workflow Automations',
    desc: 'Webhook pipelines, automated CRM sync & customer order triggers',
    costNGN: 100000
  },
  {
    id: 'addon_crm',
    name: 'CRM & Leads Pipeline Integration',
    desc: 'HubSpot, Notion, Airtable, or custom lead database capture',
    costNGN: 100000
  },
  {
    id: 'addon_analytics',
    name: 'Advanced Conversion Analytics',
    desc: 'GA4 e-commerce events, Meta Pixel CAPI, and funnel drop-off tracking',
    costNGN: 50000
  },
  {
    id: 'addon_multicurrency',
    name: 'Multi-Currency & Geolocation Pricing',
    desc: 'Automatic visitor location detection and regional currency conversion display',
    costNGN: 75000
  },
  {
    id: 'addon_pages',
    name: 'Additional Custom Pages (Set of 3)',
    desc: 'Tailored responsive landing or story pages designed with high-conversion layouts',
    costNGN: 75000
  },
  {
    id: 'addon_maintenance',
    name: 'Monthly Growth Care Retainer',
    desc: 'Up to 4 hours dedicated developer improvement work, performance tuning & priority support',
    costNGN: 150000
  }
];

export const BUILD_PRICING = {
  websites: {
    id: 'websites',
    label: '🌐 Web Development',
    title: '01. Web Development',
    desc: 'Custom, responsive, high-performance websites built for real business conversion.',
    startingPriceNGN: 270000,
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
      'Prices are starting points in NGN. The final figure is confirmed after the brief, content audit, and technical scope are understood. Starter includes Foundation Infrastructure, Growth includes Growth Infrastructure, and Pro includes Scale Infrastructure for the first 12 months.',
    tiers: [
      {
        id: 'web_starter',
        name: 'Starter',
        badge: 'Focused 1–5 Page Website',
        priceNGN: 270000,
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
          'Ongoing maintenance beyond first year',
          'Third-party API integrations'
        ]
      },
      {
        id: 'web_growth',
        name: 'Growth',
        badge: 'Complete Custom Website + CMS',
        priceNGN: 520000,
        priceFormatted: '520,000',
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
        priceNGN: 950000,
        priceFormatted: '950,000+',
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
          'Ongoing retainers beyond first year (available in Care Plans)',
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
        priceNGN: 1250000,
        priceFormatted: '1,250,000',
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
        priceNGN: 2200000,
        priceFormatted: '2,200,000+',
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
        priceNGN: 1200000,
        priceFormatted: '1,200,000',
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
        priceNGN: 2000000,
        priceFormatted: '2,000,000+',
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
        priceNGN: 4000000,
        priceFormatted: '4,000,000+ starting',
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
        priceNGN: 850000,
        priceFormatted: '850,000',
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
        priceNGN: 1600000,
        priceFormatted: '1,600,000',
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
        priceNGN: 2400000,
        priceFormatted: '2,400,000+',
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
        priceNGN: 750000,
        priceFormatted: '750,000',
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
        priceNGN: 1600000,
        priceFormatted: '1,600,000+ starting',
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
        priceNGN: 600000,
        priceFormatted: '600,000',
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
        priceNGN: 1400000,
        priceFormatted: '1,400,000+ starting',
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
        priceNGN: 550000,
        priceFormatted: '550,000',
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
        priceNGN: 350000,
        priceFormatted: '350,000 / mo',
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
        priceNGN: 700000,
        priceFormatted: '700,000',
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
        priceNGN: 850000,
        priceFormatted: '850,000 / mo',
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
        priceNGN: 450000,
        priceFormatted: '450,000',
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
        priceNGN: 1400000,
        priceFormatted: '1,400,000',
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
        priceNGN: 3000000,
        priceFormatted: '3,000,000+ starting',
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
    title: '10. Website Maintenance Retainers',
    desc: 'Keep your website secure, fast, and improving long after launch on a dependable rhythm.',
    startingPriceNGN: 130000,
    startingPriceFormatted: '130,000 / yr',
    baseInfraIncluded: true,
    offerStructureLabel: 'Choose ongoing coverage: Essential → Standard → Growth → Pro',
    baseInfraNote:
      'Every Care retainer includes its matching Infrastructure level while the plan remains active. Usage above that level and premium third-party services are scoped separately.',
    pricingNotes:
      'Care keeps the matching Infrastructure level active after launch and adds human support, planned updates, reporting, and reserved developer time. It remains separate from the build warranty, which covers implementation defects.',
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
