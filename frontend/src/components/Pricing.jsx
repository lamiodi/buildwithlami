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
  X
} from 'lucide-react';
import CheckIcon from './CheckIcon';
import { staggerContainer, fadeUpItem, cardHover, sectionViewport, reducedMotionVariants } from '../utils/motion';
import { useAutomatedCurrency } from '../utils/currency';

const PRICING_DATA = {
  NGN: {
    symbol: "₦",
    categories: {
      websites: {
        id: "websites",
        label: "🌐 Websites",
        title: "01. Websites & Web Platforms",
        desc: "High-converting corporate websites, portfolios, and company web platforms built for authority and conversions.",
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
        id: "ecommerce",
        label: "🛒 E-Commerce ⭐",
        title: "02. E-Commerce Engines",
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
            timeline: "6–8+ weeks",
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
        id: "software",
        label: "⚙️ Custom Software",
        title: "03. Custom Software & SaaS",
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
        id: "websites",
        label: "🌐 Websites",
        title: "01. Websites & Web Platforms",
        desc: "High-converting corporate websites, portfolios, and company web platforms built for authority and conversions.",
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
        id: "ecommerce",
        label: "🛒 E-Commerce ⭐",
        title: "02. E-Commerce Engines",
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
            timeline: "6–8+ weeks",
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
        id: "software",
        label: "⚙️ Custom Software",
        title: "03. Custom Software & SaaS",
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
    name: "Standard",
    badge: "Included Baseline",
    costNGN: 0,
    costUSD: 0,
    tag: "For normal business traffic",
    desc: "Cloud deployment, SSL certificate, automated daily backups, global edge CDN, standard database.",
    specs: ["Global Edge CDN", "Free SSL Certificate", "Automated Daily Backups", "99.5% Uptime Target", "Standard DB Connection Pooling"]
  },
  {
    id: "performance",
    name: "Performance ⭐",
    badge: "Recommended Upgrade",
    costNGN: 150000,
    costUSD: 200,
    popular: true,
    tag: "For growing stores & applications",
    desc: "Higher server resources, Redis caching, optimized database pooling, Cloudinary image optimization, 99.9% uptime target.",
    specs: ["High-Concurrency Redis Caching", "Optimized DB Connection Pool", "Cloudinary Media Optimization", "99.9% Uptime Target", "2x Server Memory Allocation"]
  },
  {
    id: "scale",
    name: "Scale",
    badge: "High Throughput",
    costNGN: 350000,
    costUSD: 450,
    tag: "For high-volume operations & flash sales",
    desc: "Autoscaling cloud cluster, dedicated database instance, multi-region CDN, advanced telemetry, priority incident response.",
    specs: ["Autoscaling Compute Cluster", "Dedicated DB Instance", "Multi-Region Cloud Failover", "Real-Time Sentry Telemetry", "Priority Incident Response SLA"]
  }
];

const OPTIONAL_ADDONS = [
  { id: "addon_shipping", name: "International & Multi-Zone Shipping", desc: "Multi-zone shipping rules (UAE/Nigeria/Intl) + Courier API sync", costNGN: 100000, costUSD: 250, highlight: true },
  { id: "addon_gateway", name: "Additional Payment Gateway (Stripe / UAE)", desc: "Accept cross-border cards, UAE gateways, PayPal, or Crypto", costNGN: 80000, costUSD: 200, highlight: true },
  { id: "addon_seo", name: "Advanced SEO & Core Web Vitals", desc: "100% CWV audit, schema structured data & rank strategy", costNGN: 100000, costUSD: 250, highlight: true },
  { id: "addon_automation", name: "Custom Workflow Automations", desc: "Webhook pipelines, CRM auto-sync & automated customer triggers", costNGN: 100000, costUSD: 250 },
  { id: "addon_crm", name: "CRM & Leads Pipeline Integration", desc: "HubSpot, Notion, Airtable, or custom lead database pipeline", costNGN: 100000, costUSD: 250 },
  { id: "addon_analytics", name: "Advanced Conversion Analytics", desc: "GA4 e-commerce events, Meta Pixel CAPI, funnel drop-off audit", costNGN: 50000, costUSD: 120 },
  { id: "addon_multicurrency", name: "Multi-Currency & Language Localization", desc: "Geo-targeted pricing display and regional currency switcher", costNGN: 75000, costUSD: 180 },
  { id: "addon_pages", name: "Additional Custom Pages (Set of 3)", desc: "Tailored responsive pages designed with high-conversion copy", costNGN: 75000, costUSD: 180 },
  { id: "addon_maintenance", name: "Extended Support Retainer (Monthly)", desc: "Ongoing monthly security patches, bug fixes & feature enhancements", costNGN: 50000, costUSD: 120 }
];

const ECOM_COMPARISON_MATRIX = [
  { feature: "Starting Investment", launch: "₦650k / $1,800", growth: "₦850k / $2,400 ⭐", pro: "₦1.2M+ / $3,200+" },
  { feature: "Best For", launch: "New stores", growth: "Growing brands (e.g. Sassy Brand)", pro: "Advanced commerce" },
  { feature: "Products Capacity", launch: "Up to 30 products", growth: "Up to 100 products + filters", pro: "100+ products (complex variants)" },
  { feature: "Payments", launch: "1 Gateway (Paystack/Card)", growth: "Multiple (Local + Intl/UAE/Stripe)", pro: "Advanced global checkout & multi-currency" },
  { feature: "Shipping", launch: "Basic flat-rate delivery", growth: "UAE/Nigeria/local + international", pro: "Dynamic shipping rules & courier API sync" },
  { feature: "Operations", launch: "Product & order dashboard", growth: "Full commerce dashboard + Accounts", pro: "Advanced operations & inventory ledger" },
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

  // Category Selector as Primary Navigation (defaults to 'ecommerce')
  const [activeCategory, setActiveCategory] = useState('ecommerce');
  const [showAddonsModal, setShowAddonsModal] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Interactive Quote Builder State
  const [quoteCategory, setQuoteCategory] = useState('ecommerce');
  const [quoteTierId, setQuoteTierId] = useState('ecom_growth');
  const [quoteInfraId, setQuoteInfraId] = useState('performance');
  const [selectedAddons, setSelectedAddons] = useState(['addon_shipping', 'addon_gateway']);

  // Get active category object and tiers
  const currentCategoryData = activePricing.categories[activeCategory] || activePricing.categories.ecommerce;
  const currentTiers = currentCategoryData.tiers;

  // Builder Calculations
  const builderCategoryData = activePricing.categories[quoteCategory] || activePricing.categories.ecommerce;
  const selectedTier = builderCategoryData.tiers.find(t => t.id === quoteTierId) || builderCategoryData.tiers[1] || builderCategoryData.tiers[0];
  const selectedInfra = INFRASTRUCTURE_TIERS.find(i => i.id === quoteInfraId) || INFRASTRUCTURE_TIERS[0];

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
              Studio Pricing Architecture
            </span>
          </motion.div>

          <motion.h2 variants={item} className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-black dark:text-white tracking-tight mb-5">
            Clear Tiers. Predictable Investment. <br />
            <span className="italic font-normal text-accent">No Surprise Fees.</span>
          </motion.h2>

          <motion.p variants={item} className="text-gray-700 dark:text-gray-200 max-w-3xl mx-auto text-base sm:text-lg font-light leading-relaxed">
            Every feature, infrastructure upgrade, and optional service is clearly priced before development begins. 
            Structured around <span className="font-semibold text-black dark:text-white">Scope → Infrastructure → Optional Features</span>.
          </motion.p>

          {/* Milestone Invoicing & Support Promise Callouts */}
          <motion.div variants={item} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1c1c1c] px-5 py-2.5 shadow-sm rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                Milestone Invoicing: <span className="text-blue-600 dark:text-blue-400">50% upfront, 50% upon delivery</span>
              </p>
            </div>
            <div className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1c1c1c] px-4 py-2.5 shadow-sm rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300">
              ✦ Post-launch support included with every package
            </div>
          </motion.div>
        </motion.div>

        {/* ── HOMEPAGE SUMMARY PILLARS (Clean Overview for Homepage) ── */}
        {isHomepage ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pillar 1: Websites */}
              <div className="p-8 rounded-3xl bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/10 shadow-lg flex flex-col justify-between hover:border-accent/40 transition-all duration-300">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent block mb-2">Category 01</span>
                  <h3 className="text-2xl font-bold font-heading text-black dark:text-white mb-2">Websites & Portals</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    Personal brands, high-converting portfolios, corporate sites, and structured company platforms.
                  </p>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Starting from</span>
                    <span className="text-3xl font-heading font-extrabold text-black dark:text-white">{symbol}{activePricing.categories.websites.starting}</span>
                    <span className="text-xs text-gray-500 block mt-1">Starter (₦250k) · Business ⭐ (₦600k) · Business Plus (₦850k+)</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300 mb-6">
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-accent" /> High-conversion responsive layout</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-accent" /> CMS content manager & lead capture</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-accent" /> Post-launch support included</li>
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
                    <span className="text-xs text-blue-700 dark:text-blue-300 block mt-1">Launch (₦650k) · Growth ⭐ (₦850k) · Pro (₦1.2M+)</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300 mb-6">
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-blue-500" /> Multi-gateway & multi-zone shipping</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-blue-500" /> Abandoned cart recovery & accounts</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-blue-500" /> 4 months post-launch support on Growth</li>
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
                    Custom web applications, SaaS prototypes, booking systems, and internal ERP software.
                  </p>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Starting from</span>
                    <span className="text-3xl font-heading font-extrabold text-black dark:text-white">{symbol}{activePricing.categories.software.starting}</span>
                    <span className="text-xs text-gray-500 block mt-1">MVP (₦1.2M) · Growth Platform ⭐ (₦2.0M+) · Enterprise</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300 mb-6">
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-accent" /> Custom DB, RBAC Auth & REST APIs</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-accent" /> 100% IP & Source Code Transfer</li>
                    <li className="flex items-center gap-2"><CheckIcon className="w-4 h-4 shrink-0 text-accent" /> Post-launch support included</li>
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
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent block mb-1">Interactive Studio Matrix</span>
                <h4 className="text-xl font-bold font-heading">Need the full 3-tier comparison & custom quotation builder?</h4>
                <p className="text-xs text-gray-400 mt-1">Configure your project scope, choose decoupled infrastructure, and select optional add-ons on the full pricing page.</p>
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
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
                {Object.values(activePricing.categories).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setQuoteCategory(cat.id);
                      const defaultTier = cat.tiers[1] || cat.tiers[0];
                      if (defaultTier) setQuoteTierId(defaultTier.id);
                    }}
                    className={`px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
                      activeCategory === cat.id
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-md ring-2 ring-accent/30'
                        : 'bg-white dark:bg-[#1c1c1c] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:border-accent/40'
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Side-by-Side Comparison Toggle (E-Commerce) */}
              {activeCategory === 'ecommerce' && (
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="px-4 py-2 rounded-full border border-blue-300 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-2 hover:bg-blue-100 transition-all"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  {showComparison ? 'Hide Comparison Matrix' : 'View 3-Tier Comparison Matrix'}
                </button>
              )}
            </div>

            {/* ── 2. E-COMMERCE SIDE-BY-SIDE COMPARISON TABLE (If active) ── */}
            {activeCategory === 'ecommerce' && showComparison && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#181818] border border-blue-200 dark:border-blue-900/50 shadow-xl overflow-hidden"
              >
                <div className="mb-6">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">Side-by-Side Matrix</span>
                  <h3 className="text-2xl font-bold font-heading text-black dark:text-white">E-Commerce Tier Comparison</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Directly compare deliverables for Launch (Basic), Growth (Standard ⭐), and Commerce Pro (Advanced).</p>
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

            {/* ── 3. 3-TIER CARDS GRID (For Active Category) ── */}
            <div>
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
                          ? 'border-blue-500 dark:border-blue-500 shadow-xl ring-2 ring-blue-500/20'
                          : 'border-gray-200 dark:border-white/10'
                      } bg-white dark:bg-[#1c1c1c] rounded-3xl group hover:shadow-2xl transition-all duration-300 flex flex-col justify-between`}
                    >
                      <div>
                        {tier.popular && (
                          <span className="absolute -top-3.5 right-6 bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md">
                            {tier.popularBadge || "⭐ Recommended"}
                          </span>
                        )}

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
                            setQuoteCategory(activeCategory);
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
              </motion.div>
            </div>

            {/* ── 4. DECOUPLED INFRASTRUCTURE (Re-framed with Setup vs Cloud Operating Costs) ── */}
            <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#161616] border border-gray-200 dark:border-white/10 shadow-lg">
              <div className="max-w-3xl mb-8">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent block mb-1">Architecture & Hosting Resilience</span>
                <h3 className="text-3xl font-bold font-heading text-black dark:text-white mb-3">
                  Choose the infrastructure your business needs.
                </h3>
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 mb-4 text-xs sm:text-sm text-blue-900 dark:text-blue-200 font-medium">
                  💡 <span className="font-bold">Core Concept:</span> Your website package determines <span className="underline">what gets built</span>. Infrastructure determines <span className="underline">how much capacity and resilience it runs with</span>.
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-light leading-relaxed">
                  Infrastructure setup is a one-time engineering implementation fee. Cloud operating costs (hosting provider compute/bandwidth) are billed directly based on actual provider usage.
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

            {/* ── 5. OPTIONAL ADD-ONS (Clean preview + Modal option) ── */}
            <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#161616] border border-gray-200 dark:border-white/10 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent block mb-1">Tailored Scope</span>
                  <h3 className="text-3xl font-bold font-heading text-black dark:text-white mb-1">
                    Need something extra?
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-light">
                    Add functionality to your package as required without bloating your base tier.
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

            {/* ── 6. INTERACTIVE PROJECT QUOTATION BUILDER ── */}
            <div id="quote-builder" className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-gray-900 via-neutral-900 to-black text-white border border-gray-800 shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-8 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-2">
                    <Calculator className="w-3.5 h-3.5" /> Interactive Project Quotation Builder
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight">
                    Scope → Infrastructure → Optional Features
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
                    Configure your project scope below to see the instant milestone investment breakdown (50% Kickoff & 50% Delivery).
                  </p>
                </div>

                <div className="text-left lg:text-right shrink-0 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 block mb-1">Your Estimated Investment</span>
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {Object.values(activePricing.categories).map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setQuoteCategory(cat.id);
                            const firstTier = cat.tiers[1] || cat.tiers[0];
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
                            {t.numPrice ? `${symbol}${formatNumber(t.numPrice)}` : "Custom"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Infrastructure */}
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-gray-400 mb-3">
                      03. Choose infrastructure resilience
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

                  {/* Step 4: Optional Features Pills */}
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-gray-400 mb-3">
                      04. Select optional features
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
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
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
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent block mb-2">Quotation Summary</span>
                    <h4 className="text-lg font-bold font-heading mb-4">{selectedTier.name} + {selectedInfra.name}</h4>

                    <div className="space-y-2 text-xs border-b border-white/10 pb-4 mb-4">
                      <div className="flex justify-between text-gray-300">
                        <span>Core Package ({selectedTier.name})</span>
                        <span className="font-mono">{selectedTier.numPrice ? `${symbol}${formatNumber(selectedTier.numPrice)}` : "Custom"}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Infrastructure ({selectedInfra.name})</span>
                        <span className="font-mono">{infraCost === 0 ? "Included" : `+${symbol}${formatNumber(infraCost)}`}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Optional Add-ons ({selectedAddons.length} selected)</span>
                        <span className="font-mono">{addonsCost === 0 ? "₦0" : `+${symbol}${formatNumber(addonsCost)}`}</span>
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
                      to={`/contact?package=${encodeURIComponent(selectedTier.name || '')}&category=${encodeURIComponent(quoteCategory)}&infra=${encodeURIComponent(selectedInfra.name)}&addons=${encodeURIComponent(selectedAddons.join(','))}`}
                      className="w-full py-3.5 text-center text-xs font-extrabold uppercase tracking-wider rounded-xl bg-accent text-white hover:bg-accent/90 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      Request My Proposal <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <p className="text-[10px] text-center text-gray-400 mt-2">
                      Includes post-launch support & 100% source code ownership
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
