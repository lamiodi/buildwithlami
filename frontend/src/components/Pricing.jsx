import React, { useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import CheckIcon from './CheckIcon';
import { staggerContainer, fadeUpItem, cardHover, cardHoverTransition, buttonHover, buttonTap, sectionViewport, reducedMotionVariants } from '../utils/motion';

const Pricing = () => {
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  // Automatic location detection (USD for countries outside Africa, NGN for Africa/Nigeria)
  const getInitialCurrency = () => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        if (!tz.startsWith('Africa/')) {
          return 'USD';
        }
        return 'NGN';
      }
    } catch (e) {
      console.warn("Timezone detection fallback hit", e);
    }
    return 'USD'; // Default to USD for international users outside Africa
  };

  const [currency, setCurrency] = useState(getInitialCurrency());
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'websites' | 'ecommerce' | 'software'

  // Refine location detection via background IP verification
  React.useEffect(() => {
    let isMounted = true;

    const detectLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (!res.ok) throw new Error('ipapi failed');
        const data = await res.json();
        if (isMounted) {
          const isOutsideAfrica = data.continent_code ? data.continent_code !== 'AF' : data.country_code !== 'NG';
          const detected = isOutsideAfrica ? 'USD' : 'NGN';
          setCurrency(detected);
          return;
        }
      } catch {
        try {
          const res2 = await fetch('https://ipwho.is/');
          if (res2.ok) {
            const data2 = await res2.json();
            if (isMounted) {
              const isOutsideAfrica = data2.continent_code ? data2.continent_code !== 'AF' : data2.country_code !== 'NG';
              const detected = isOutsideAfrica ? 'USD' : 'NGN';
              setCurrency(detected);
              return;
            }
          }
        } catch {
          // Fallback retained
        }
      }
    };

    detectLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  const pricingData = {
    NGN: {
      symbol: "₦",
      suffix: "starting at",
      tiers: {
        starter: { price: "250,000" },
        business: { price: "600,000" },
        ecom_starter: { price: "650,000" },
        ecom_growth: { price: "850,000" },
        ecom_pro: { price: "1,200,000+" },
        custom_app: { price: "1,200,000" },
        enterprise: { price: "Custom Quote" }
      }
    },
    USD: {
      symbol: "$",
      suffix: "starting at",
      tiers: {
        starter: { price: "800" },
        business: { price: "1,600" },
        ecom_starter: { price: "1,800" },
        ecom_growth: { price: "2,400" },
        ecom_pro: { price: "3,200+" },
        custom_app: { price: "3,200" },
        enterprise: { price: "Custom Quote" }
      }
    }
  };

  const tiers = [
    {
      id: "starter",
      category: "websites",
      name: "Starter",
      badge: "Landing & Portfolio",
      priceKey: "starter",
      bestFor: "Best for: founders, consultants & creators",
      examples: "e.g., Personal Portfolios, Waitlists, Service Pages",
      timeline: "Timeline: 1–2 weeks",
      desc: "A high-converting, polished digital presence built to capture leads, validate your idea, and establish immediate credibility.",
      cta: "Start a Project",
      features: [
        "Custom Minimalist Responsive Build",
        "Lead Capture & Contact Form Integration",
        "Direct WhatsApp 1-Click Inquiry Button",
        "Mobile-First Speed & Performance",
        "Basic Technical SEO & Social Metadata",
        "4 months post-launch support included"
      ]
    },
    {
      id: "business",
      category: "websites",
      name: "Business Platform",
      badge: "Core Corporate Website",
      priceKey: "business",
      bestFor: "Best for: service firms & corporate brands",
      examples: "e.g., Law Firms, Logistics, Healthcare, B2B",
      timeline: "Timeline: 2–4 weeks",
      desc: "A complete digital storefront designed to build instant trust, capture high-quality leads, and position you as the premium choice in your industry.",
      cta: "Get a Project Quote",
      features: [
        "Up to 10 Custom High-Conversion Pages",
        "CMS for Self-Managed Content & Updates",
        "Automated Lead Capture to CRM & Email",
        "Advanced SEO & Analytics Instrumentation",
        "Interactive WhatsApp & Chat Integration",
        "4 months post-launch support included"
      ]
    },
    {
      id: "ecom_starter",
      category: "ecommerce",
      tierLabel: "E-Commerce Basic",
      name: "E-Commerce Starter",
      badge: "Small Product Catalog",
      priceKey: "ecom_starter",
      bestFor: "Best for: boutique brands launching online",
      examples: "e.g., New Boutiques, Single-Brand Product Lines",
      timeline: "Timeline: 2–4 weeks",
      desc: "A clean, friction-free shopping experience designed to showcase your products and accept online payments from day one.",
      cta: "Launch My Store",
      features: [
        "Up to 20 Products & Variant Setup",
        "Frictionless Cart & Secure Checkout",
        "Paystack & Debit Card Payment Gateway",
        "Order & Inventory Management Dashboard",
        "WhatsApp Direct Sales & Inquiry Widget",
        "4 months post-launch support included"
      ]
    },
    {
      id: "ecom_growth",
      category: "ecommerce",
      tierLabel: "E-Commerce Standard",
      name: "E-Commerce Growth",
      badge: "Serious Growing Brands",
      priceKey: "ecom_growth",
      bestFor: "Best for: fashion, retail & expanding brands",
      examples: "e.g., Fashion Brands, Multi-Product Stores, Beauty Lines",
      timeline: "Timeline: 4–6 weeks",
      popular: true,
      popularReason: "Recommended for serious brands ready to scale online sales",
      desc: "A full-featured commerce engine built to drive repeat purchases, recover lost sales, and streamline fulfillment without rebuilding.",
      cta: "Build Growth Store",
      features: [
        "Everything in Starter +",
        "Expanded Catalog & Advanced Product Filtering",
        "Customer Accounts & Order History Portal",
        "Discount & Promo Code Campaign Engine",
        "Automated Abandoned-Cart Recovery",
        "Automated Transactional Customer Emails",
        "Multi-Currency & International Gateway Setup",
        "4 months post-launch support included"
      ]
    },
    {
      id: "ecom_pro",
      category: "ecommerce",
      tierLabel: "E-Commerce Premium",
      name: "E-Commerce Pro",
      badge: "Advanced Commerce Operations",
      priceKey: "ecom_pro",
      bestFor: "Best for: high-volume & multi-region retailers",
      examples: "e.g., Global Boutiques, Multi-Location Inventories",
      timeline: "Timeline: 6–8 weeks",
      desc: "A sophisticated, high-performance commerce system built for multi-location logistics, complex product matrices, and custom workflows.",
      cta: "Scale with Pro",
      features: [
        "Everything in Growth +",
        "Multi-Location & International Shipping Logic",
        "Complex Variant Matrices & Custom Attributes",
        "Custom Sales Reports & Profit Analytics",
        "Third-Party Courier & Logistics Integrations",
        "Automated Invoicing & Accounting Sync",
        "4 months post-launch support included"
      ]
    },
    {
      id: "custom_app",
      category: "software",
      name: "Custom Web Applications",
      badge: "Portals, Dashboards & SaaS",
      priceKey: "custom_app",
      bestFor: "Best for: teams needing software & automation",
      examples: "e.g., Client Portals, SaaS MVPs, Booking Systems, POS",
      timeline: "Timeline: 6–10 weeks",
      desc: "Bespoke software architecture designed to eliminate manual business tasks, unify company data, and scale operational capacity.",
      cta: "Discuss Application Scope",
      features: [
        "Tailored Database Architecture & Secure REST APIs",
        "Role-Based Access Control (RBAC) & Protected Auth",
        "Custom Interactive Dashboards & Business Reports",
        "Third-Party API Integrations & Webhook Pipelines",
        "Automated System Email & SMS Trigger Workflows",
        "4 months post-launch support included"
      ]
    },
    {
      id: "enterprise",
      category: "software",
      name: "Enterprise Platforms",
      badge: "Mission-Critical Systems",
      priceKey: "enterprise",
      bestFor: "Best for: multi-tenant SaaS & large ERPs",
      examples: "e.g., Multi-Tenant SaaS, Enterprise ERPs, High-Volume",
      timeline: "Timeline: Scoped after technical discovery",
      desc: "Full-scale software architecture with dedicated cloud infrastructure, custom SLAs, and continuous phased delivery.",
      cta: "Schedule Architecture Discovery",
      features: [
        "High-Availability Cloud Architecture & Autoscaling",
        "Multi-Tenant Data Isolation & Compliance",
        "Custom Internal ERP & Financial Ledger Engines",
        "Dedicated Staging Environments & CI/CD Pipelines",
        "Comprehensive Documentation & 100% IP Transfer",
        "Dedicated Priority Engineering SLA & Support"
      ]
    }
  ];

  const categories = [
    { id: 'all', label: 'All Packages (7)' },
    { id: 'websites', label: 'Websites & Portals' },
    { id: 'ecommerce', label: 'E-Commerce Tiers (3)' },
    { id: 'software', label: 'Custom Software & SaaS' }
  ];

  const filteredTiers = activeCategory === 'all' 
    ? tiers 
    : tiers.filter(t => t.category === activeCategory);

  const decisionGuides = [
    {
      intent: "I have a small project, landing page, or personal portfolio",
      tier: "Starter",
      costNGN: "₦250k",
      costUSD: "$800",
      tierId: "starter",
      category: "websites"
    },
    {
      intent: "I need a professional corporate business website with CMS",
      tier: "Business Platform",
      costNGN: "₦600k",
      costUSD: "$1,600",
      tierId: "business",
      category: "websites"
    },
    {
      intent: "I am launching a new online boutique with a focused product catalog",
      tier: "E-Commerce Starter",
      costNGN: "₦650k",
      costUSD: "$1,800",
      tierId: "ecom_starter",
      category: "ecommerce"
    },
    {
      intent: "I need a serious growing fashion/retail store with accounts & abandoned cart",
      tier: "E-Commerce Growth ⭐",
      costNGN: "₦850k",
      costUSD: "$2,400",
      tierId: "ecom_growth",
      category: "ecommerce",
      highlight: true
    },
    {
      intent: "I need an advanced store with multi-location shipping & custom logistics",
      tier: "E-Commerce Pro",
      costNGN: "₦1.2M+",
      costUSD: "$3,200+",
      tierId: "ecom_pro",
      category: "ecommerce"
    },
    {
      intent: "I need custom software, a client portal, dashboard, or SaaS prototype",
      tier: "Custom Web Applications",
      costNGN: "₦1.2M+",
      costUSD: "$3,200+",
      tierId: "custom_app",
      category: "software"
    },
    {
      intent: "I need an enterprise multi-tenant SaaS or complete business ERP",
      tier: "Enterprise Platforms",
      costNGN: "Custom Quote",
      costUSD: "Custom Quote",
      tierId: "enterprise",
      category: "software"
    }
  ];

  return (
    <section id="pricing" className="py-24 px-6 md:px-12 bg-gray-50 dark:bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          <motion.p variants={item} className="uppercase tracking-[0.3em] text-[10px] font-bold text-accent mb-4">Investment & Packages</motion.p>
          <motion.h2 variants={item} className="text-4xl md:text-5xl font-heading font-bold text-black dark:text-white mb-6">
            Transparent, <span className="italic">Outcome-Driven</span> Pricing
          </motion.h2>

          <motion.p variants={item} className="text-gray-700 dark:text-gray-200 max-w-2xl mx-auto font-light leading-relaxed opacity-95">
            Every project is structured around clear business outcomes, timeline predictability, and commercial ROI. Compare options below to find the exact match for your goals.
          </motion.p>

          {/* Currency Toggle & 50/50 Split Controls */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <motion.div variants={item} className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1c1c1c] px-5 py-2.5 shadow-sm rounded-full">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-800 dark:text-gray-200">
                <span className="text-accent mr-2">✦</span>
                Flexible Payments: <span className="font-semibold text-blue-600 dark:text-blue-400">50% upfront, 50% upon delivery</span>
              </p>
            </motion.div>

            {/* Currency Selector */}
            <div className="inline-flex p-1 bg-gray-200 dark:bg-gray-800 rounded-full border border-gray-300 dark:border-gray-700">
              <button 
                type="button"
                onClick={() => setCurrency('NGN')}
                className={`px-4 py-1.5 text-xs font-extrabold rounded-full transition-all ${
                  currency === 'NGN' 
                    ? 'bg-white dark:bg-[#121212] text-black dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                ₦ NGN (Nigeria)
              </button>
              <button 
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-4 py-1.5 text-xs font-extrabold rounded-full transition-all ${
                  currency === 'USD' 
                    ? 'bg-white dark:bg-[#121212] text-black dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                $ USD (International)
              </button>
            </div>
          </div>
        </motion.div>

        {/* Guarantees Ribbon */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-12"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          {[
            "Strategy & planning included",
            "Mobile-first responsive build",
            "SEO-ready technical structure",
            "50% upfront / 50% delivery",
            "4 months post-launch support included",
            "100% source code & IP transfer"
          ].map((featureItem) => (
            <div
              key={featureItem}
              className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1c1c1c] px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 flex items-center justify-center rounded-lg"
            >
              {featureItem}
            </div>
          ))}
        </motion.div>

        {/* ── QUICK DECISION GUIDE MATRIX ── */}
        <div className="mb-14 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-white/10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 dark:border-white/5 pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent block mb-1">Quick Decision Guide</span>
              <h3 className="text-xl font-bold font-heading text-black dark:text-white">
                Which package is right for my project?
              </h3>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Click any package to filter and jump directly to its scope
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {decisionGuides.map((guide, gIdx) => (
              <div 
                key={gIdx}
                onClick={() => {
                  setActiveCategory(guide.category);
                  const el = document.getElementById(`pricing-card-${guide.tierId}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  guide.highlight 
                    ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800/80 hover:border-blue-500' 
                    : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/5 hover:border-accent/40'
                }`}
              >
                <div className="flex-1">
                  <p className="text-gray-800 dark:text-gray-200 font-medium leading-snug">{guide.intent}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-accent block">{guide.tier}</span>
                  <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400 font-semibold">
                    {currency === 'USD' ? guide.costUSD : guide.costNGN}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CATEGORY FILTER TABS ── */}
        <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
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

        {/* Mobile Swipe Hint */}
        <div className="md:hidden flex items-center justify-between gap-2 mb-4 px-2 text-gray-500 dark:text-gray-400">
          <span className="text-[11px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Swipe horizontally to compare packages
          </span>
          <span className="text-[10px] uppercase tracking-widest text-gray-600 dark:text-gray-300 font-bold bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded-xs">
            {filteredTiers.length} Options
          </span>
        </div>

        {/* ── PRICING CARDS GRID / SNAP ROW ── */}
        <motion.div
          className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-8 pt-2 -mx-6 px-6 sm:-mx-12 sm:px-12 md:mx-0 md:px-0 no-scrollbar"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          <AnimatePresence mode="popLayout">
            {filteredTiers.map((tier) => {
              const currentPrice = pricingData[currency].tiers[tier.priceKey]?.price || "Custom Quote";
              const isCustom = currentPrice === "Custom Quote";

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
                  } bg-white dark:bg-[#1c1c1c] rounded-2xl group hover:shadow-2xl transition-all duration-300 w-[84vw] max-w-[360px] sm:w-[380px] md:w-auto shrink-0 snap-center flex flex-col justify-between`}
                >
                  <div>
                    {tier.popular && (
                      <span className="absolute -top-3.5 right-6 bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md">
                        ⭐ Most Popular / Recommended
                      </span>
                    )}

                    {tier.tierLabel && (
                      <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded mb-2">
                        {tier.tierLabel}
                      </span>
                    )}

                    <h3 className="text-2xl font-heading font-bold text-black dark:text-white mb-1">
                      {tier.name}
                    </h3>
                    <p className="text-xs text-accent font-semibold mb-4">{tier.badge}</p>

                    <div className="inline-flex flex-col bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3.5 py-2.5 mb-5 rounded-xl justify-center w-full">
                      <span className="text-[11px] uppercase tracking-widest text-gray-800 dark:text-gray-200 font-bold mb-0.5">{tier.bestFor}</span>
                      <span className="text-[10px] text-gray-600 dark:text-gray-400 italic">{tier.examples}</span>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-1.5 mb-4 border-b border-gray-100 dark:border-white/5 pb-4">
                      {isCustom ? (
                        <span className="text-3xl font-heading font-bold text-black dark:text-white leading-none">{currentPrice}</span>
                      ) : (
                        <>
                          <span className="text-xl font-bold text-accent leading-none">{pricingData[currency].symbol}</span>
                          <span className="text-3xl sm:text-4xl font-heading font-bold text-black dark:text-white leading-none">{currentPrice}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">{pricingData[currency].suffix}</span>
                        </>
                      )}
                    </div>

                    {tier.popularReason && (
                      <p className="text-[11px] font-bold text-blue-800 dark:text-blue-300 mb-4 bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-lg border border-blue-200 dark:border-blue-800/60 leading-tight">
                        {tier.popularReason}
                      </p>
                    )}

                    <p className="text-[14px] text-gray-700 dark:text-gray-300 leading-relaxed mb-5 font-normal">
                      {tier.desc}
                    </p>

                    <div className="mb-6 space-y-1.5 border-y border-gray-100 dark:border-white/5 py-4">
                      <p className="text-[11px] uppercase tracking-widest text-accent font-bold">{tier.timeline}</p>
                    </div>

                    <ul className="space-y-3.5 mb-8">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[13px] text-gray-800 dark:text-gray-200 font-medium">
                          <CheckIcon className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <motion.a 
                    href="#contact" 
                    className={`block text-center py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all mt-auto shadow-sm ${
                      tier.popular 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-black text-white dark:bg-white dark:text-black hover:bg-accent hover:text-white'
                    }`}
                    whileHover={shouldReduce ? {} : buttonHover}
                    whileTap={shouldReduce ? {} : buttonTap}
                  >
                    {tier.cta} →
                  </motion.a>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Pricing Disclaimer & Discovery Note */}
        <div className="mt-8 text-center max-w-2xl mx-auto space-y-2">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            Payments are milestone-based: <strong>50% upfront to reserve schedule and commence development, 50% upon final delivery & handover</strong>.
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 italic">
            Exact quotation is confirmed after technical discovery to align with your exact catalogue size, third-party integrations, and operational workflows.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
