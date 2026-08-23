import React, { useState, useId } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Check, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Server, 
  Cpu, 
  Layers, 
  Globe, 
  Zap, 
  CreditCard, 
  Truck, 
  BarChart3, 
  Sliders, 
  FileText,
  Calculator,
  ChevronRight,
  Info
} from 'lucide-react';
import CheckIcon from './CheckIcon';
import { staggerContainer, fadeUpItem, cardHover, buttonHover, buttonTap, sectionViewport, reducedMotionVariants } from '../utils/motion';
import { useAutomatedCurrency } from '../utils/currency';

const PRICING_DATA = {
  NGN: {
    symbol: "₦",
    categories: {
      websites: {
        title: "01 — Websites & Web Platforms",
        desc: "High-converting corporate sites, portfolios, and company web platforms built for instant credibility.",
        starting: "250,000",
        tiers: [
          {
            id: "starter",
            name: "Starter",
            badge: "Portfolio & Landing",
            price: "250,000",
            numPrice: 250000,
            bestFor: "Founders, consultants, creators & single-page waitlists",
            examples: "e.g. Personal Brand, Creator Showcase, Product Waitlist",
            timeline: "1–2 weeks",
            support: "1 month post-launch support included",
            desc: "A minimalist, fast digital presence built to capture leads, validate your offer, and establish instant authority.",
            features: [
              "Custom Minimalist Responsive Build",
              "Lead Capture & Contact Form Integration",
              "Direct WhatsApp 1-Click Inquiry Action",
              "Mobile-First Speed & Performance",
              "Basic SEO Setup & Social Sharing Meta",
              "1 month post-launch support included"
            ]
          },
          {
            id: "business",
            name: "Business",
            badge: "Corporate Website",
            price: "600,000",
            numPrice: 600000,
            popular: true,
            popularBadge: "⭐ Recommended",
            bestFor: "Corporate companies, service agencies & B2B brands",
            examples: "e.g. Law Firms, Logistics, Healthcare, Advisory, B2B",
            timeline: "2–4 weeks",
            support: "4 months post-launch support included",
            desc: "A complete corporate digital storefront engineered to build deep client trust, generate qualified leads, and rank on search.",
            features: [
              "Up to 10 Custom High-Conversion Pages",
              "CMS for Self-Managed Content & Updates",
              "Automated Lead Capture to CRM & Email",
              "Advanced On-Page SEO & Analytics Tracking",
              "Interactive WhatsApp & Live Booking Engine",
              "4 months post-launch support included"
            ]
          },
          {
            id: "business_plus",
            name: "Business Plus",
            badge: "Multi-Department & Portals",
            price: "850,000+",
            numPrice: 850000,
            bestFor: "Expanding companies needing structured portals & multi-region presence",
            examples: "e.g. Multi-Branch Firms, Educational Portals, Directories",
            timeline: "4–6 weeks",
            support: "6 months post-launch support included",
            desc: "An expansive corporate portal with specialized booking workflows, staff directories, and custom search collections.",
            features: [
              "Custom Multi-Page Portal & Staff Directory",
              "Advanced Interactive Scheduling & Invoicing",
              "Multi-Language or Multi-Region Structure",
              "Custom CMS Collections & Filtered Search",
              "Technical SEO Audit & Speed Optimization",
              "6 months post-launch support included"
            ]
          }
        ]
      },
      ecommerce: {
        title: "02 — E-Commerce Engines",
        desc: "Scalable online stores engineered to convert visitors, accept multi-channel payments, and streamline fulfillment.",
        starting: "650,000",
        tiers: [
          {
            id: "ecom_launch",
            name: "Launch",
            badge: "New & Boutique Stores",
            tierLabel: "E-Commerce Basic",
            price: "650,000",
            numPrice: 650000,
            bestFor: "New boutique brands launching online",
            examples: "e.g. Emerging Boutiques, Focused Single-Product Brands",
            timeline: "2–4 weeks",
            support: "1 month post-launch support included",
            desc: "A clean, friction-free shopping experience designed to showcase products and accept card payments from day one.",
            features: [
              "Up to 30 Products & Variant Setup",
              "1 Primary Payment Gateway (Paystack / Cards)",
              "Frictionless Cart & Secure Checkout",
              "Basic Local Delivery & Flat Shipping Rules",
              "Product & Order Management Dashboard",
              "1 month post-launch support included"
            ]
          },
          {
            id: "ecom_growth",
            name: "Growth",
            badge: "Serious Growing Brands",
            tierLabel: "E-Commerce Standard ⭐",
            price: "850,000",
            numPrice: 850000,
            popular: true,
            popularBadge: "⭐ Recommended for Growing Brands",
            bestFor: "Fashion, retail & expanding brands (e.g. Sassy Brand)",
            examples: "e.g. Fashion Brands, Multi-Product Stores, Beauty Lines",
            timeline: "4–6 weeks",
            support: "4 months post-launch support included",
            desc: "A full-featured commerce engine built to drive repeat purchases, recover lost sales, and handle cross-border shipping without rebuilding.",
            features: [
              "Up to 100 Products, Categories & Smart Filters",
              "Multiple Gateways (Paystack + Stripe / Grey / UAE)",
              "Multi-Zone Shipping (UAE/Nigeria/Regional/Intl)",
              "Customer Accounts & Order History Portal",
              "Automated Abandoned Cart Recovery & Triggers",
              "Discount Engine, Promo Codes & Gift Cards",
              "GA4, Meta Pixel & Conversion Funnel Tracking",
              "4 months post-launch support included"
            ]
          },
          {
            id: "ecom_pro",
            name: "Commerce Pro",
            badge: "Advanced Operations",
            tierLabel: "E-Commerce Pro",
            price: "1,200,000+",
            numPrice: 1200000,
            bestFor: "High-volume, multi-warehouse & international retailers",
            examples: "e.g. Global Retailers, Multi-Location Inventories",
            timeline: "6–8 weeks",
            support: "6 months post-launch support included",
            desc: "A high-performance commerce system engineered for multi-location logistics, complex product matrices, and ERP sync.",
            features: [
              "100+ Products with Complex Variant Matrices",
              "Advanced Global Checkout & Multi-Currency Engine",
              "Dynamic Shipping Rules, Courier API & Customs",
              "Advanced Operations, Warehouse & Inventory Ledger",
              "Custom Automation Webhooks & ERP / Accounting Sync",
              "Technical SEO, Profit Analytics & Custom Reports",
              "6 months post-launch support included"
            ]
          }
        ]
      },
      software: {
        title: "03 — Custom Software & SaaS",
        desc: "Bespoke web applications, SaaS prototypes, and internal systems built for operational scale.",
        starting: "1,200,000",
        tiers: [
          {
            id: "soft_mvp",
            name: "MVP Platform",
            badge: "Product Validation & Prototypes",
            price: "1,200,000",
            numPrice: 1200000,
            bestFor: "Startups, SaaS prototypes, custom booking engines",
            examples: "e.g. SaaS MVP, Client Data Portal, Booking Platform",
            timeline: "6–8 weeks",
            support: "4 months post-launch support included",
            desc: "Custom full-stack software built to test market demand, automate core business logic, and onboard early users.",
            features: [
              "Tailored Database Schema & Secure REST APIs",
              "Protected Auth & Role-Based Access Control (RBAC)",
              "Custom Interactive Dashboard & Analytics Views",
              "Payment Gateway & Webhook Trigger Pipelines",
              "Transactional Email & SMS Notification Workflows",
              "4 months post-launch support included"
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
            bestFor: "Scaling companies needing internal ERPs, fintech tools & custom portals",
            examples: "e.g. Custom ERP, Financial Ledger, Multi-Role Portal",
            timeline: "8–12 weeks",
            support: "6 months post-launch support included",
            desc: "Robust architecture with multi-role workflows, automated reporting ledgers, and secure integration pipelines.",
            features: [
              "Complex Multi-Role Business Logic & Data Vault",
              "Automated Financial Ledgers & Invoice Pipelines",
              "Custom CRM Pipelines & External Partner Integrations",
              "Real-Time WebSocket Updates & Activity Logs",
              "Staging Environments, Automated CI/CD & Tests",
              "6 months post-launch support included"
            ]
          },
          {
            id: "soft_enterprise",
            name: "Enterprise",
            badge: "Mission-Critical SaaS & ERP",
            price: "Custom Quote",
            numPrice: null,
            bestFor: "Multi-tenant SaaS platforms, enterprise ERPs & mission-critical systems",
            examples: "e.g. Multi-Tenant SaaS, High-Volume Data Systems",
            timeline: "Scoped during discovery",
            support: "Dedicated SLA & on-demand engineering",
            desc: "Dedicated cloud infrastructure, custom SLAs, compliance pipelines, and 100% intellectual property transfer.",
            features: [
              "Multi-Tenant Data Isolation & Compliance",
              "High-Availability Cloud Setup with 99.9% Uptime SLA",
              "Dedicated Data Pipelines & Large-Scale Processing",
              "Complete IP Transfer, GitHub Repo & Architecture Docs",
              "Dedicated Priority SLA & On-Demand Engineering"
            ]
          }
        ]
      }
    }
  },
  USD: {
    symbol: "$",
    categories: {
      websites: {
        title: "01 — Websites & Web Platforms",
        desc: "High-converting corporate sites, portfolios, and company web platforms built for instant credibility.",
        starting: "800",
        tiers: [
          {
            id: "starter",
            name: "Starter",
            badge: "Portfolio & Landing",
            price: "800",
            numPrice: 800,
            bestFor: "Founders, consultants, creators & single-page waitlists",
            examples: "e.g. Personal Brand, Creator Showcase, Product Waitlist",
            timeline: "1–2 weeks",
            support: "1 month post-launch support included",
            desc: "A minimalist, fast digital presence built to capture leads, validate your offer, and establish instant authority.",
            features: [
              "Custom Minimalist Responsive Build",
              "Lead Capture & Contact Form Integration",
              "Direct WhatsApp 1-Click Inquiry Action",
              "Mobile-First Speed & Performance",
              "Basic SEO Setup & Social Sharing Meta",
              "1 month post-launch support included"
            ]
          },
          {
            id: "business",
            name: "Business",
            badge: "Corporate Website",
            price: "1,600",
            numPrice: 1600,
            popular: true,
            popularBadge: "⭐ Recommended",
            bestFor: "Corporate companies, service agencies & B2B brands",
            examples: "e.g. Law Firms, Logistics, Healthcare, Advisory, B2B",
            timeline: "2–4 weeks",
            support: "4 months post-launch support included",
            desc: "A complete corporate digital storefront engineered to build deep client trust, generate qualified leads, and rank on search.",
            features: [
              "Up to 10 Custom High-Conversion Pages",
              "CMS for Self-Managed Content & Updates",
              "Automated Lead Capture to CRM & Email",
              "Advanced On-Page SEO & Analytics Tracking",
              "Interactive WhatsApp & Live Booking Engine",
              "4 months post-launch support included"
            ]
          },
          {
            id: "business_plus",
            name: "Business Plus",
            badge: "Multi-Department & Portals",
            price: "2,400+",
            numPrice: 2400,
            bestFor: "Expanding companies needing structured portals & multi-region presence",
            examples: "e.g. Multi-Branch Firms, Educational Portals, Directories",
            timeline: "4–6 weeks",
            support: "6 months post-launch support included",
            desc: "An expansive corporate portal with specialized booking workflows, staff directories, and custom search collections.",
            features: [
              "Custom Multi-Page Portal & Staff Directory",
              "Advanced Interactive Scheduling & Invoicing",
              "Multi-Language or Multi-Region Structure",
              "Custom CMS Collections & Filtered Search",
              "Technical SEO Audit & Speed Optimization",
              "6 months post-launch support included"
            ]
          }
        ]
      },
      ecommerce: {
        title: "02 — E-Commerce Engines",
        desc: "Scalable online stores engineered to convert visitors, accept multi-channel payments, and streamline fulfillment.",
        starting: "1,800",
        tiers: [
          {
            id: "ecom_launch",
            name: "Launch",
            badge: "New & Boutique Stores",
            tierLabel: "E-Commerce Basic",
            price: "1,800",
            numPrice: 1800,
            bestFor: "New boutique brands launching online",
            examples: "e.g. Emerging Boutiques, Focused Single-Product Brands",
            timeline: "2–4 weeks",
            support: "1 month post-launch support included",
            desc: "A clean, friction-free shopping experience designed to showcase products and accept card payments from day one.",
            features: [
              "Up to 30 Products & Variant Setup",
              "1 Primary Payment Gateway (Stripe / Cards)",
              "Frictionless Cart & Secure Checkout",
              "Basic Local Delivery & Flat Shipping Rules",
              "Product & Order Management Dashboard",
              "1 month post-launch support included"
            ]
          },
          {
            id: "ecom_growth",
            name: "Growth",
            badge: "Serious Growing Brands",
            tierLabel: "E-Commerce Standard ⭐",
            price: "2,400",
            numPrice: 2400,
            popular: true,
            popularBadge: "⭐ Recommended for Growing Brands",
            bestFor: "Fashion, retail & expanding brands (e.g. Sassy Brand)",
            examples: "e.g. Fashion Brands, Multi-Product Stores, Beauty Lines",
            timeline: "4–6 weeks",
            support: "4 months post-launch support included",
            desc: "A full-featured commerce engine built to drive repeat purchases, recover lost sales, and handle cross-border shipping without rebuilding.",
            features: [
              "Up to 100 Products, Categories & Smart Filters",
              "Multiple Gateways (Stripe + Regional/UAE / Paystack)",
              "Multi-Zone Shipping (UAE/Nigeria/Regional/Intl)",
              "Customer Accounts & Order History Portal",
              "Automated Abandoned Cart Recovery & Triggers",
              "Discount Engine, Promo Codes & Gift Cards",
              "GA4, Meta Pixel & Conversion Funnel Tracking",
              "4 months post-launch support included"
            ]
          },
          {
            id: "ecom_pro",
            name: "Commerce Pro",
            badge: "Advanced Operations",
            tierLabel: "E-Commerce Pro",
            price: "3,200+",
            numPrice: 3200,
            bestFor: "High-volume, multi-warehouse & international retailers",
            examples: "e.g. Global Retailers, Multi-Location Inventories",
            timeline: "6–8 weeks",
            support: "6 months post-launch support included",
            desc: "A high-performance commerce system engineered for multi-location logistics, complex product matrices, and ERP sync.",
            features: [
              "100+ Products with Complex Variant Matrices",
              "Advanced Global Checkout & Multi-Currency Engine",
              "Dynamic Shipping Rules, Courier API & Customs",
              "Advanced Operations, Warehouse & Inventory Ledger",
              "Custom Automation Webhooks & ERP / Accounting Sync",
              "Technical SEO, Profit Analytics & Custom Reports",
              "6 months post-launch support included"
            ]
          }
        ]
      },
      software: {
        title: "03 — Custom Software & SaaS",
        desc: "Bespoke web applications, SaaS prototypes, and internal systems built for operational scale.",
        starting: "3,200",
        tiers: [
          {
            id: "soft_mvp",
            name: "MVP Platform",
            badge: "Product Validation & Prototypes",
            price: "3,200",
            numPrice: 3200,
            bestFor: "Startups, SaaS prototypes, custom booking engines",
            examples: "e.g. SaaS MVP, Client Data Portal, Booking Platform",
            timeline: "6–8 weeks",
            support: "4 months post-launch support included",
            desc: "Custom full-stack software built to test market demand, automate core business logic, and onboard early users.",
            features: [
              "Tailored Database Schema & Secure REST APIs",
              "Protected Auth & Role-Based Access Control (RBAC)",
              "Custom Interactive Dashboard & Analytics Views",
              "Payment Gateway & Webhook Trigger Pipelines",
              "Transactional Email & SMS Notification Workflows",
              "4 months post-launch support included"
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
            bestFor: "Scaling companies needing internal ERPs, fintech tools & custom portals",
            examples: "e.g. Custom ERP, Financial Ledger, Multi-Role Portal",
            timeline: "8–12 weeks",
            support: "6 months post-launch support included",
            desc: "Robust architecture with multi-role workflows, automated reporting ledgers, and secure integration pipelines.",
            features: [
              "Complex Multi-Role Business Logic & Data Vault",
              "Automated Financial Ledgers & Invoice Pipelines",
              "Custom CRM Pipelines & External Partner Integrations",
              "Real-Time WebSocket Updates & Activity Logs",
              "Staging Environments, Automated CI/CD & Tests",
              "6 months post-launch support included"
            ]
          },
          {
            id: "soft_enterprise",
            name: "Enterprise",
            badge: "Mission-Critical SaaS & ERP",
            price: "Custom Quote",
            numPrice: null,
            bestFor: "Multi-tenant SaaS platforms, enterprise ERPs & mission-critical systems",
            examples: "e.g. Multi-Tenant SaaS, High-Volume Data Systems",
            timeline: "Scoped during discovery",
            support: "Dedicated SLA & on-demand engineering",
            desc: "Dedicated cloud infrastructure, custom SLAs, compliance pipelines, and 100% intellectual property transfer.",
            features: [
              "Multi-Tenant Data Isolation & Compliance",
              "High-Availability Cloud Setup with 99.9% Uptime SLA",
              "Dedicated Data Pipelines & Large-Scale Processing",
              "Complete IP Transfer, GitHub Repo & Architecture Docs",
              "Dedicated Priority SLA & On-Demand Engineering"
            ]
          }
        ]
      }
    }
  }
};

const INFRASTRUCTURE_TIERS = [
  {
    id: "standard",
    name: "Standard Cloud",
    badge: "Included Baseline",
    costNGN: 0,
    costUSD: 0,
    tag: "Normal Business Traffic",
    desc: "Suitable for standard corporate websites, portfolios, and focused stores with predictable daily traffic.",
    specs: ["Global Edge CDN", "Free SSL Certificate", "Automated Daily Backups", "99.5% Uptime Target", "Standard DB Connection Pooling"]
  },
  {
    id: "performance",
    name: "Performance Cloud",
    badge: "High Performance",
    costNGN: 150000,
    costUSD: 200,
    popular: true,
    tag: "Fast Scaling Retail & SaaS",
    desc: "Enhanced compute resources, Redis/edge caching, optimized database pooling, and Cloudinary media transformation.",
    specs: ["High-Concurrency Redis Caching", "Optimized DB Connection Pool", "Cloudinary Media Optimization", "99.9% Uptime SLA", "2x Higher Server Memory"]
  },
  {
    id: "scale",
    name: "Enterprise Scale",
    badge: "Maximum Throughput",
    costNGN: 350000,
    costUSD: 450,
    tag: "High-Volume & Flash Sales",
    desc: "Autoscaling cloud cluster, dedicated database instance, multi-region CDN, real-time error telemetry, and DDoS mitigation.",
    specs: ["Autoscaling Compute Cluster", "Dedicated DB Instance", "Multi-Region Cloud Failover", "Real-Time Sentry & Telemetry", "Priority SLA & Incident Response"]
  }
];

const OPTIONAL_ADDONS = [
  { id: "addon_gateway", name: "Additional Payment Gateway", desc: "Stripe, UAE / Middle East Gateway, PayPal, or Crypto", costNGN: 80000, costUSD: 200 },
  { id: "addon_shipping", name: "Advanced International Shipping", desc: "Multi-zone shipping rules, DHL / FedEx / Courier API sync", costNGN: 100000, costUSD: 250 },
  { id: "addon_seo", name: "Advanced SEO & CWV Optimization", desc: "100% Core Web Vitals audit, schema markup & ranking strategy", costNGN: 100000, costUSD: 250 },
  { id: "addon_pages", name: "Additional Custom Pages (Set of 3)", desc: "Tailored responsive pages designed with conversion copy", costNGN: 75000, costUSD: 180 },
  { id: "addon_automation", name: "Custom Workflow Automations", desc: "Webhook pipelines, CRM auto-sync, Zapier & custom triggers", costNGN: 100000, costUSD: 250 },
  { id: "addon_crm", name: "CRM & Leads Pipeline Integration", desc: "HubSpot, Notion, Airtable, or custom lead database pipeline", costNGN: 100000, costUSD: 250 },
  { id: "addon_analytics", name: "Advanced Conversion Analytics", desc: "GA4 e-commerce events, Meta Pixel CAPI, funnel drop-off audit", costNGN: 50000, costUSD: 120 },
  { id: "addon_multicurrency", name: "Multi-Currency / Multi-Language", desc: "Geo-targeted pricing display and regional localization", costNGN: 75000, costUSD: 180 },
  { id: "addon_maintenance", name: "Extended Support Retainer (Monthly)", desc: "Ongoing monthly security patches, bug fixes & feature tweaks", costNGN: 50000, costUSD: 120 }
];

const ECOM_COMPARISON_MATRIX = [
  { feature: "Starting Investment", launch: "₦650k / $1,800", growth: "₦850k / $2,400 ⭐", pro: "₦1.2M+ / $3,200+" },
  { feature: "Best For", launch: "New & boutique stores", growth: "Growing fashion & retail brands", pro: "High-volume / global operations" },
  { feature: "Product Capacity", launch: "Up to 30 products", growth: "Up to 100 products + filters", pro: "100+ products (complex variants)" },
  { feature: "Payment Gateways", launch: "1 Gateway (Paystack/Card)", growth: "Multiple (Local + Intl/UAE/Stripe)", pro: "Advanced global checkout & multi-currency" },
  { feature: "Delivery & Shipping", launch: "Basic flat-rate delivery", growth: "UAE/Nigeria/local + international", pro: "Dynamic shipping rules & courier API sync" },
  { feature: "Admin & Operations", launch: "Product & order dashboard", growth: "Full commerce dashboard + Accounts", pro: "Advanced operations & inventory ledger" },
  { feature: "SEO & Discovery", launch: "Basic on-page SEO", growth: "Advanced technical & schema SEO", pro: "Technical SEO + programmatic growth" },
  { feature: "Analytics & Tracking", launch: "Basic traffic metrics", growth: "GA4, Meta Pixel & funnel tracking", pro: "Advanced tracking, profit & cohort reporting" },
  { feature: "Sales Automations", launch: "Core order notifications", growth: "Abandoned cart & discount engine", pro: "Advanced custom pipelines & ERP sync" },
  { feature: "Support Included", launch: "1 month post-launch", growth: "4 months post-launch ⭐", pro: "6 months post-launch" }
];

const Pricing = ({ isHomepage = false }) => {
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  // Fully automated location-based currency detection
  const currency = useAutomatedCurrency();
  const activePricing = PRICING_DATA[currency] || PRICING_DATA.NGN;
  const symbol = activePricing.symbol;

  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'websites' | 'ecommerce' | 'software'
  const [showComparison, setShowComparison] = useState(false);

  // Interactive Quote Builder State
  const [quoteCategory, setQuoteCategory] = useState('ecommerce');
  const [quoteTierId, setQuoteTierId] = useState('ecom_growth');
  const [quoteInfraId, setQuoteInfraId] = useState('performance');
  const [selectedAddons, setSelectedAddons] = useState(['addon_shipping', 'addon_seo']);

  // Get current selected tier
  const currentCategoryTiers = activePricing.categories[quoteCategory]?.tiers || [];
  const selectedTier = currentCategoryTiers.find(t => t.id === quoteTierId) || currentCategoryTiers[0] || {};
  const selectedInfra = INFRASTRUCTURE_TIERS.find(i => i.id === quoteInfraId) || INFRASTRUCTURE_TIERS[0];

  // Calculate estimated investment
  const tierCost = selectedTier.numPrice || 0;
  const infraCost = currency === 'USD' ? selectedInfra.costUSD : selectedInfra.costNGN;
  const addonsCost = selectedAddons.reduce((sum, addonId) => {
    const addon = OPTIONAL_ADDONS.find(a => a.id === addonId);
    if (!addon) return sum;
    return sum + (currency === 'USD' ? addon.costUSD : addon.costNGN);
  }, 0);

  const totalEstimate = tierCost > 0 ? (tierCost + infraCost + addonsCost) : null;
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

  // Flattened tiers for "all" category
  const allTiers = [
    ...activePricing.categories.websites.tiers.map(t => ({ ...t, catKey: 'websites', catLabel: 'Websites & Portals' })),
    ...activePricing.categories.ecommerce.tiers.map(t => ({ ...t, catKey: 'ecommerce', catLabel: 'E-Commerce Engines' })),
    ...activePricing.categories.software.tiers.map(t => ({ ...t, catKey: 'software', catLabel: 'Custom Software & SaaS' }))
  ];

  const displayedTiers = activeCategory === 'all' 
    ? allTiers 
    : (activePricing.categories[activeCategory]?.tiers.map(t => ({ ...t, catKey: activeCategory, catLabel: activePricing.categories[activeCategory].title })) || []);

  return (
    <section id="pricing" className="py-24 px-6 md:px-12 bg-gray-50 dark:bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* ── HEADER ── */}
        <motion.div
          className="text-center mb-12"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          <motion.div variants={item} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Studio Pricing Architecture
            </span>
          </motion.div>

          <motion.h2 variants={item} className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-black dark:text-white tracking-tight mb-6">
            Clear Tiers. Predictable Investment. <br />
            <span className="italic font-normal text-accent">Zero Hidden Costs.</span>
          </motion.h2>

          <motion.p variants={item} className="text-gray-700 dark:text-gray-200 max-w-3xl mx-auto text-base sm:text-lg font-light leading-relaxed">
            Projects starting from <span className="font-semibold text-black dark:text-white">{symbol}{activePricing.categories.websites.starting}</span>. 
            Structured around <span className="font-semibold text-black dark:text-white">Project Scope → Infrastructure → Add-ons</span> to give you complete commercial flexibility.
          </motion.p>

          {/* 50/50 Milestone Split Callout */}
          <motion.div variants={item} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1c1c1c] px-5 py-2.5 shadow-sm rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                Milestone Invoicing: <span className="text-blue-600 dark:text-blue-400">50% upfront, 50% upon delivery</span>
              </p>
            </div>
            <div className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1c1c1c] px-4 py-2.5 shadow-sm rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300">
              ✦ 4 months post-launch support included
            </div>
          </motion.div>
        </motion.div>

        {/* ── HOMEPAGE SUMMARY PILLARS (Rendered when isHomepage is true) ── */}
        {isHomepage ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pillar 1: Websites */}
              <div className="p-8 rounded-3xl bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/10 shadow-lg flex flex-col justify-between hover:border-accent/40 transition-all duration-300">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent block mb-2">Category 01</span>
                  <h3 className="text-2xl font-bold font-heading text-black dark:text-white mb-2">Websites & Portals</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    Personal brands, high-converting portfolios, corporate sites, and structured agency platforms.
                  </p>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Starting from</span>
                    <span className="text-3xl font-heading font-extrabold text-black dark:text-white">{symbol}{activePricing.categories.websites.starting}</span>
                    <span className="text-xs text-gray-500 block mt-1">Starter (₦250k) · Business ⭐ (₦600k) · Business Plus (₦850k+)</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300 mb-6">
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-accent" /> High-conversion responsive layout</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-accent" /> CMS content manager & lead capture</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-accent" /> 4 months post-launch support included</li>
                  </ul>
                </div>
                <Link to="/pricing" className="w-full py-3 text-center text-xs font-extrabold uppercase tracking-wider rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  View Website Tiers <ArrowRight className="w-3.5 h-3.5" />
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
                    Engineered for fashion, retail, and lifestyle brands ready to scale online orders and cross-border sales.
                  </p>
                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 block mb-1">Starting from</span>
                    <span className="text-3xl font-heading font-extrabold text-black dark:text-white">{symbol}{activePricing.categories.ecommerce.starting}</span>
                    <span className="text-xs text-blue-700 dark:text-blue-300 block mt-1">Launch (₦650k) · Growth ⭐ (₦850k) · Commerce Pro (₦1.2M+)</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300 mb-6">
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-blue-500" /> Multi-gateway & multi-zone shipping</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-blue-500" /> Abandoned cart recovery & accounts</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-blue-500" /> 4 months post-launch support included</li>
                  </ul>
                </div>
                <Link to="/pricing" className="w-full py-3 text-center text-xs font-extrabold uppercase tracking-wider rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md">
                  Compare E-Commerce Tiers <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Pillar 3: Custom Software */}
              <div className="p-8 rounded-3xl bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/10 shadow-lg flex flex-col justify-between hover:border-accent/40 transition-all duration-300">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent block mb-2">Category 03</span>
                  <h3 className="text-2xl font-bold font-heading text-black dark:text-white mb-2">Custom Software & SaaS</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    Custom web platforms, SaaS prototypes, booking engines, and internal ERP software.
                  </p>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Starting from</span>
                    <span className="text-3xl font-heading font-extrabold text-black dark:text-white">{symbol}{activePricing.categories.software.starting}</span>
                    <span className="text-xs text-gray-500 block mt-1">MVP (₦1.2M) · Growth Platform ⭐ (₦2.0M+) · Enterprise</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300 mb-6">
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-accent" /> Custom DB, RBAC Auth & REST APIs</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-accent" /> 100% IP & Source Code Transfer</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-accent" /> 4 months post-launch support included</li>
                  </ul>
                </div>
                <Link to="/pricing" className="w-full py-3 text-center text-xs font-extrabold uppercase tracking-wider rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  View Software Scope <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Deep link CTA Banner on Homepage */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-gray-900 to-black text-white dark:from-neutral-900 dark:to-[#121212] border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent block mb-1">Full Studio Catalogue</span>
                <h4 className="text-xl font-bold font-heading">Need the complete 3-tier comparison & custom quotation builder?</h4>
                <p className="text-xs text-gray-400 mt-1">Explore all 9 project packages, side-by-side matrices, decoupled cloud infrastructure tiers, and modular add-ons.</p>
              </div>
              <Link 
                to="/pricing" 
                className="shrink-0 px-6 py-3.5 rounded-full bg-accent text-white font-extrabold text-xs uppercase tracking-wider hover:bg-accent/90 transition-all flex items-center gap-2 shadow-lg"
              >
                View Full Pricing Page <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* ── FULL PRICING PAGE EXPERIENCE ── */
          <div className="space-y-20">

            {/* ── 1. CATEGORY FILTER TABS & SIDE-BY-SIDE TOGGLE ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
                {[
                  { id: 'all', label: 'All Packages (9)' },
                  { id: 'websites', label: '01 — Websites' },
                  { id: 'ecommerce', label: '02 — E-Commerce ⭐' },
                  { id: 'software', label: '03 — Custom Software' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all ${
                      activeCategory === cat.id
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                        : 'bg-white dark:bg-[#1c1c1c] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:border-accent/40'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Toggle Comparison Table */}
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="px-4 py-2 rounded-full border border-blue-300 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-2 hover:bg-blue-100 transition-all"
              >
                <Sliders className="w-3.5 h-3.5" />
                {showComparison ? 'Hide E-Commerce Comparison Table' : 'View E-Commerce Comparison Table (3 Tiers)'}
              </button>
            </div>

            {/* ── 2. E-COMMERCE SIDE-BY-SIDE COMPARISON TABLE ── */}
            {showComparison && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#181818] border border-blue-200 dark:border-blue-900/50 shadow-xl overflow-hidden"
              >
                <div className="mb-6">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">Side-by-Side Matrix</span>
                  <h3 className="text-2xl font-bold font-heading text-black dark:text-white">E-Commerce Tier Comparison</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Directly compare deliverables for Launch (Basic), Growth (Standard ⭐), and Commerce Pro (Premium).</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-white/10">
                        <th className="py-3 px-4 font-bold text-gray-500 uppercase tracking-wider w-1/4">Deliverable / Scope</th>
                        <th className="py-3 px-4 font-bold text-gray-900 dark:text-white w-1/4">Launch (₦650k / $1.8k)</th>
                        <th className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 rounded-t-lg w-1/4">
                          Growth ⭐ (₦850k / $2.4k)
                        </th>
                        <th className="py-3 px-4 font-bold text-gray-900 dark:text-white w-1/4">Commerce Pro (₦1.2M+ / $3.2k+)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                      {ECOM_COMPARISON_MATRIX.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{row.feature}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{row.launch}</td>
                          <td className="py-3 px-4 font-bold text-blue-700 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-950/20">{row.growth}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{row.pro}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ── 3. PRICING CARDS GRID ── */}
            <div>
              <div className="md:hidden flex items-center justify-between gap-2 mb-4 px-2 text-gray-500 dark:text-gray-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Swipe horizontally to compare tiers
                </span>
                <span className="text-[10px] uppercase tracking-widest text-gray-600 dark:text-gray-300 font-bold bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded-xs">
                  {displayedTiers.length} Options
                </span>
              </div>

              <motion.div
                className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-8 pt-2 -mx-6 px-6 sm:-mx-12 sm:px-12 md:mx-0 md:px-0 no-scrollbar"
                variants={container}
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
              >
                <AnimatePresence mode="popLayout">
                  {displayedTiers.map((tier) => {
                    const isCustom = tier.price === "Custom Quote";

                    return (
                      <motion.div
                        key={tier.id}
                        id={`pricing-card-${tier.id}`}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        whileHover={shouldReduce ? {} : cardHover}
                        className={`relative p-6 sm:p-8 border ${
                          tier.popular
                            ? 'border-blue-500 dark:border-blue-500 shadow-xl ring-2 ring-blue-500/20'
                            : 'border-gray-200 dark:border-white/10'
                        } bg-white dark:bg-[#1c1c1c] rounded-3xl group hover:shadow-2xl transition-all duration-300 w-[85vw] max-w-[360px] sm:w-[380px] md:w-auto shrink-0 snap-center flex flex-col justify-between`}
                      >
                        <div>
                          {tier.popular && (
                            <span className="absolute -top-3.5 right-6 bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md">
                              {tier.popularBadge || "⭐ Recommended"}
                            </span>
                          )}

                          <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-bold block mb-1">
                            {tier.catLabel}
                          </span>

                          <div className="flex items-baseline justify-between gap-2 mb-1">
                            <h3 className="text-2xl font-heading font-bold text-black dark:text-white">
                              {tier.name}
                            </h3>
                            {tier.tierLabel && (
                              <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                                {tier.tierLabel}
                              </span>
                            )}
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
                                <span className="text-xs text-gray-500 font-semibold">from</span>
                                <span className="text-3xl sm:text-4xl font-heading font-extrabold text-black dark:text-white tracking-tight leading-none">
                                  {symbol}{tier.price}
                                </span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 font-medium mb-6">
                            <span className="flex items-center gap-1">⏱ {tier.timeline}</span>
                            <span>•</span>
                            <span className="text-accent font-semibold">{tier.support}</span>
                          </div>

                          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-6 font-light">
                            {tier.desc}
                          </p>

                          {/* Deliverables List */}
                          <div className="space-y-3 mb-8">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500 block">
                              Deliverables & Capabilities
                            </span>
                            <ul className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300">
                              {tier.features.map((feat, fIdx) => (
                                <li key={fIdx} className="flex items-start gap-2.5 leading-snug">
                                  <CheckIcon className={`w-4 h-4 shrink-0 mt-0.5 ${tier.popular ? 'text-blue-500' : 'text-accent'}`} />
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div>
                          <button
                            onClick={() => {
                              setQuoteCategory(tier.catKey);
                              setQuoteTierId(tier.id);
                              const el = document.getElementById('quote-builder');
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            className={`w-full py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                              tier.popular
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                                : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90'
                            }`}
                          >
                            Select for Quote Breakdown <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <p className="text-[10px] text-center text-gray-400 mt-2">
                            50% upfront, 50% upon delivery
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* ── 4. DECOUPLED INFRASTRUCTURE TIERS ── */}
            <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#161616] border border-gray-200 dark:border-white/10 shadow-lg">
              <div className="max-w-3xl mb-8">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent block mb-1">Modular Hosting & Scalability</span>
                <h3 className="text-3xl font-bold font-heading text-black dark:text-white mb-3">
                  Infrastructure is Decoupled from Website Pricing
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-light">
                  Infrastructure is selected based on your expected traffic, application complexity, and operational requirements. 
                  You don't need to purchase a higher project tier just to get enterprise cloud hosting. It can be upgraded anytime as your business grows.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {INFRASTRUCTURE_TIERS.map(infra => {
                  const cost = currency === 'USD' ? infra.costUSD : infra.costNGN;
                  const isSelected = quoteInfraId === infra.id;

                  return (
                    <div
                      key={infra.id}
                      onClick={() => setQuoteInfraId(infra.id)}
                      className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                          : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5 hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent">{infra.badge}</span>
                          {infra.popular && <span className="text-[9px] font-bold uppercase bg-blue-600 text-white px-2 py-0.5 rounded-full">Recommended</span>}
                        </div>
                        <h4 className="text-xl font-bold font-heading text-black dark:text-white mb-1">{infra.name}</h4>
                        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-3">{infra.tag}</span>
                        
                        <div className="text-2xl font-bold font-heading text-black dark:text-white mb-3">
                          {cost === 0 ? "Included" : `+${symbol}${formatNumber(cost)}`}
                          <span className="text-[10px] text-gray-500 font-normal block">one-time architecture setup</span>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 font-light leading-relaxed">{infra.desc}</p>
                      </div>

                      <div className="space-y-1.5 border-t border-gray-200 dark:border-white/10 pt-3">
                        {infra.specs.map((spec, sIdx) => (
                          <div key={sIdx} className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-gray-300">
                            <Check className="w-3 h-3 text-accent shrink-0" />
                            <span>{spec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── 5. MODULAR OPTIONAL ADD-ONS CATALOG ── */}
            <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#161616] border border-gray-200 dark:border-white/10 shadow-lg">
              <div className="max-w-3xl mb-8">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent block mb-1">Protecting Your Scope</span>
                <h3 className="text-3xl font-bold font-heading text-black dark:text-white mb-3">
                  Optional Add-ons & Integrations
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-light">
                  Rather than forcing unnecessary features into base packages, add exactly what your business requires. Protect margins while customizing your project scope.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {OPTIONAL_ADDONS.map(addon => {
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
                          <span className="text-xs font-mono font-bold text-accent whitespace-nowrap">from {symbol}{formatNumber(cost)}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{addon.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── 6. REAL-TIME INTERACTIVE QUOTATION BUILDER ── */}
            <div id="quote-builder" className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-gray-900 via-neutral-900 to-black text-white border border-gray-800 shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-8 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-2">
                    <Calculator className="w-3.5 h-3.5" /> Interactive Project Quotation Builder
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight">
                    Project Type → Package → Infrastructure → Add-ons
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
                    Configure your desired project combination below to see the instant milestone investment breakdown (50% Kickoff & 50% Delivery).
                  </p>
                </div>

                <div className="text-left lg:text-right shrink-0 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 block mb-1">Estimated Total Investment</span>
                  <div className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
                    {totalEstimate ? `${symbol}${formatNumber(totalEstimate)}` : "Custom Quote"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Configuration Controls (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Step 1: Category */}
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-gray-400 mb-3">
                      1. Select Project Category
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'websites', label: '01 — Websites' },
                        { id: 'ecommerce', label: '02 — E-Commerce ⭐' },
                        { id: 'software', label: '03 — Custom Software' }
                      ].map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setQuoteCategory(cat.id);
                            const firstTier = activePricing.categories[cat.id]?.tiers[1] || activePricing.categories[cat.id]?.tiers[0];
                            if (firstTier) setQuoteTierId(firstTier.id);
                          }}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
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

                  {/* Step 2: Tier */}
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-gray-400 mb-3">
                      2. Select Package Tier
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {currentCategoryTiers.map(t => (
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
                            {t.numPrice ? `${symbol}${formatNumber(t.numPrice)}` : "Custom"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Infrastructure */}
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-gray-400 mb-3">
                      3. Select Cloud Infrastructure Level
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {INFRASTRUCTURE_TIERS.map(i => {
                        const cost = currency === 'USD' ? i.costUSD : i.costNGN;
                        return (
                          <button
                            key={i.id}
                            type="button"
                            onClick={() => setQuoteInfraId(i.id)}
                            className={`p-3 rounded-xl text-left border transition-all ${
                              quoteInfraId === i.id
                                ? 'bg-blue-600/30 border-blue-400 text-white ring-2 ring-blue-500/30'
                                : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30'
                            }`}
                          >
                            <span className="text-xs font-bold block">{i.name}</span>
                            <span className="text-[10px] text-gray-400 block">{cost === 0 ? "Included" : `+${symbol}${formatNumber(cost)}`}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right: Milestone Breakdown Summary (4 cols) */}
                <div className="lg:col-span-4 bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent block mb-2">Scope Summary</span>
                    <h4 className="text-lg font-bold font-heading mb-4">{selectedTier.name} + {selectedInfra.name}</h4>

                    <div className="space-y-2 text-xs border-b border-white/10 pb-4 mb-4">
                      <div className="flex justify-between text-gray-300">
                        <span>Base Tier ({selectedTier.name})</span>
                        <span className="font-mono">{selectedTier.numPrice ? `${symbol}${formatNumber(selectedTier.numPrice)}` : "Custom"}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Infrastructure ({selectedInfra.name})</span>
                        <span className="font-mono">{infraCost === 0 ? "Included" : `+${symbol}${formatNumber(infraCost)}`}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Add-ons ({selectedAddons.length} selected)</span>
                        <span className="font-mono">{addonsCost === 0 ? "₦0" : `+${symbol}${formatNumber(addonsCost)}`}</span>
                      </div>
                    </div>

                    {/* 50/50 Milestone Breakdown Box */}
                    {totalEstimate && (
                      <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-2 mb-6">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Structured 50/50 Milestone Terms</span>
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
                      to={`/contact?package=${encodeURIComponent(selectedTier.name || '')}&category=${encodeURIComponent(quoteCategory)}&infra=${encodeURIComponent(selectedInfra.name)}&addons=${encodeURIComponent(selectedAddons.join(','))}`}
                      className="w-full py-3.5 text-center text-xs font-extrabold uppercase tracking-wider rounded-xl bg-accent text-white hover:bg-accent/90 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      Request Proposal with This Scope <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <p className="text-[10px] text-center text-gray-400 mt-2">
                      Includes 4 months post-launch support & 100% IP ownership
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};

export default Pricing;
