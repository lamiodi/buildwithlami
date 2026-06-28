import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import CheckIcon from './CheckIcon';
import { staggerContainer, fadeUpItem, cardHover, cardHoverTransition, buttonHover, buttonTap, sectionViewport, reducedMotionVariants } from '../utils/motion';

const Pricing = () => {
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  // Synchronous initial check to prevent flicker on first render
  const getInitialCurrency = () => {
    const saved = localStorage.getItem('preferred_currency');
    if (saved) return saved;
    
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return tz === 'Africa/Lagos' ? 'NGN' : 'USD';
    } catch (e) {
      return 'NGN';
    }
  };

  const [currency, setCurrency] = useState(getInitialCurrency());

  // Refine location detection and handle persistence
  React.useEffect(() => {
    localStorage.setItem('preferred_currency', currency);
    
    // Background IP verification (only run if no manual preference saved)
    if (!localStorage.getItem('currency_manually_set')) {
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          if (data.country_code) {
            const detected = data.country_code === 'NG' ? 'NGN' : 'USD';
            if (detected !== currency) {
              setCurrency(detected);
            }
          }
        })
        .catch(() => console.log("Geoloc refined fallback skipped."));
    }
  }, [currency]);

  const handleCurrencyToggle = () => {
    localStorage.setItem('currency_manually_set', 'true');
    setCurrency(prev => prev === 'NGN' ? 'USD' : 'NGN');
  };

  const pricingData = {
    NGN: {
      symbol: "₦",
      suffix: "starting at",
      maintenance: "99,000",
      tiers: [
        { price: "250,000" },
        { price: "600,000" },
        { price: "450,000 - 830,000", isRange: true },
        { price: "Custom Quote" }
      ]
    },
    USD: {
      symbol: "$",
      suffix: "starting at",
      maintenance: "390",
      tiers: [
        { price: "800" },
        { price: "1,500" },
        { price: "1,200 - 2,500", isRange: true },
        { price: "Custom Quote" }
      ]
    }
  };

  const tiers = [
    {
      name: "Portfolio / Landing",
      price: pricingData[currency].tiers[0].price,
      desc: "For personal brands, founders, and early-stage startups that need a refined online presence fast.",
      bestFor: "Best for: founders, consultants, creators",
      examples: "e.g., Personal Portfolios, Waitlists, Event Pages",
      timeline: "Timeline: 1-2 weeks",
      scope: "A high-converting landing page designed to capture leads, validate your idea, and establish immediate credibility.",
      cta: "Book Landing Page",
      features: [
        "Custom Minimalist Design",
        "Mobile-First Optimization",
        "Basic SEO Setup",
        "Contact Form Integration",
        "WhatsApp Chat Widget",
        "Social Proof & Testimonials Section"
      ]
    },
    {
      name: "Business Corporate",
      price: pricingData[currency].tiers[1].price,
      desc: "For established businesses ready to upgrade trust, clarity, and conversion across their digital presence.",
      bestFor: "Best for: service firms and growing brands",
      examples: "e.g., Law Firms, Agencies, Logistics Cos.",
      timeline: "Timeline: 2-4 weeks",
      scope: "A complete digital storefront designed to build instant trust, capture high-quality leads, and position you as the premium choice in your industry.",
      cta: "Request Business Quote",
      features: [
        "Up to 10 Custom Pages",
        "CMS for Content Management",
        "Advanced SEO & Analytics",
        "Priority Email Support",
        "Automated Lead Capture to Email/CRM",
        "Live WhatsApp/Messenger Integration"
      ],
      popular: true,
      popularReason: "Best fit for most established businesses"
    },
    {
      name: "E-commerce Elite",
      price: pricingData[currency].tiers[2].price,
      desc: "Scalable commerce systems built to convert traffic into sales while keeping operations manageable.",
      bestFor: "Best for: product-led brands and stores",
      examples: "e.g., Online Stores, Hotel Booking, Course Sales",
      timeline: "Timeline: 3-6 weeks",
      scope: "A fully optimized shopping experience designed to reduce cart abandonment, showcase products beautifully, and streamline your operations.",
      cta: "Plan Store Build",
      features: [
        "Full Product Management",
        "Payment Gateway Integration",
        "Order & User Management",
        "Inventory Notifications",
        "Abandoned Cart Recovery Setup",
        "Direct WhatsApp Sales Support Widget"
      ]
    },
    {
      name: "Custom Enterprise",
      price: pricingData[currency].tiers[3].price,
      desc: "Complex internal systems, ERP platforms, and workflow automation tailored to your exact business logic.",
      bestFor: "Best for: teams needing dashboards and automation",
      examples: "e.g., Real Estate Portals, POS Systems, ERPs",
      timeline: "Timeline: scoped after discovery",
      scope: "Bespoke software architecture designed to eliminate manual tasks, unify your data, and scale your operational capacity.",
      cta: "Discuss Enterprise Scope",
      features: [
        "Full ERP & Inventory Logic",
        "Role-Based Access Control",
        "Custom Business Reports",
        "System-Wide Automation",
        "Third-party API Integrations",
        "Dedicated Dedicated Account Manager"
      ]
    }
  ];

  return (
    <section id="pricing" className="py-24 px-6 md:px-12 bg-gray-50 dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          <motion.p variants={item} className="uppercase tracking-[0.3em] text-[10px] font-bold text-accent mb-4">Investment</motion.p>
          <motion.h2 variants={item} className="text-4xl md:text-5xl font-heading font-bold text-black dark:text-white mb-6">
            Transparent <span className="italic">Pricing</span>
          </motion.h2>
          
          {/* Currency Toggle */}
          <motion.div variants={item} className="flex items-center justify-center gap-4 mb-10">
            <span className={`text-xs font-bold uppercase tracking-widest ${currency === 'NGN' ? 'text-accent' : 'text-gray-500 dark:text-gray-300'}`}>NGN</span>
            <button 
              onClick={handleCurrencyToggle}
              aria-label="Toggle pricing currency"
              className="w-12 h-6 bg-gray-200 dark:bg-white/15 rounded-full relative p-1 transition-colors"
            >
              <div className={`w-4 h-4 bg-accent rounded-full transition-transform duration-300 ${currency === 'USD' ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
            <span className={`text-xs font-bold uppercase tracking-widest ${currency === 'USD' ? 'text-accent' : 'text-gray-500 dark:text-gray-300'}`}>USD</span>
          </motion.div>

          <motion.p variants={item} className="text-gray-700 dark:text-gray-200 max-w-2xl mx-auto font-light leading-relaxed opacity-95">
            Quality software is an investment. I offer competitive, value-based pricing for high-end custom development.
          </motion.p>
          <motion.p variants={item} className="mt-3 text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-300">
            Auto-detected currency. Switch anytime.
          </motion.p>

          {/* 50/50 Payment Split Badge (Brutalist Theme) */}
          <motion.div variants={item} className="mt-8 inline-block border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-6 py-3 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-800 dark:text-gray-200">
              <span className="text-accent mr-2">✦</span>
              Flexible Payments: <span className="font-medium text-gray-600 dark:text-gray-300">50% upfront, 50% upon launch</span>
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          {[
            "Strategy and planning included",
            "Mobile-first responsive build",
            "SEO-ready structure",
            "Launch support and handoff",
            "4 months free maintenance"
          ].map((featureItem) => (
            <div
              key={featureItem}
              className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-4 py-3 text-center text-[11px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-200 flex items-center justify-center"
            >
              {featureItem}
            </div>
          ))}
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          {tiers.map((tier, index) => (
            <motion.div 
              key={index}
              variants={item}
              whileHover={shouldReduce ? {} : cardHover}
              transition={cardHoverTransition}
              className={`relative p-8 border ${tier.popular ? 'border-accent shadow-[0_0_0_1px_rgba(244,74,34,0.15)]' : 'border-gray-200 dark:border-white/10'} bg-white dark:bg-[#0a0a0a] rounded-sm group hover:shadow-2xl transition-all duration-500`}
            >
              {tier.popular && (
                <span className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-heading font-bold uppercase tracking-wide text-black dark:text-white mb-3">
                {tier.name}
              </h3>
              <p className="inline-flex flex-col bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-2 mb-5 min-h-[56px] justify-center w-full">
                <span className="text-[11px] uppercase tracking-widest text-gray-800 dark:text-gray-200 font-bold mb-1">{tier.bestFor}</span>
                <span className="text-[10px] text-gray-600 dark:text-gray-300 italic">{tier.examples}</span>
              </p>
              <div className="flex flex-wrap items-baseline gap-1 mb-4">
                {tier.price === "Custom Quote" ? (
                  <span className="text-2xl xl:text-3xl font-heading font-bold text-black dark:text-white leading-none">{tier.price}</span>
                ) : pricingData[currency].tiers[index].isRange ? (
                  <>
                    <span className="text-xl font-bold text-accent leading-none">{pricingData[currency].symbol}</span>
                    <span className="text-3xl xl:text-4xl font-heading font-bold text-black dark:text-white leading-none">{tier.price}</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl font-bold text-accent leading-none">{pricingData[currency].symbol}</span>
                    <span className="text-3xl xl:text-4xl font-heading font-bold text-black dark:text-white leading-none">{tier.price}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-300 font-semibold mb-1">{pricingData[currency].suffix}</span>
                  </>
                )}
              </div>
              {tier.popularReason && (
                <p className="text-[11px] font-bold uppercase tracking-widest text-accent mb-4 bg-accent/10 px-3 py-2 border border-accent/20">
                  {tier.popularReason}
                </p>
              )}
              <p className="text-[15px] text-gray-800 dark:text-gray-200 leading-relaxed mb-5 min-h-[96px] font-medium whitespace-pre-line opacity-95">
                {tier.desc}
              </p>
              <div className="mb-6 space-y-3 border-y border-gray-200 dark:border-white/10 py-5">
                <p className="text-[11px] uppercase tracking-widest text-accent font-bold">{tier.timeline}</p>
                <p className="text-[13px] leading-relaxed text-gray-800 dark:text-gray-200">{tier.scope}</p>
              </div>
              <ul className="space-y-4 mb-10">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-[13px] text-gray-800 dark:text-gray-200 font-medium">
                    <CheckIcon className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <motion.a 
                href="#contact" 
                className={`block text-center py-4 text-xs font-bold uppercase tracking-widest transition-all ${
                  tier.popular 
                  ? 'bg-accent text-white hover:bg-white hover:text-accent border border-accent' 
                  : 'bg-black text-white dark:bg-white dark:text-black hover:bg-accent hover:text-white'
                }`}
                whileHover={shouldReduce ? {} : buttonHover}
                whileTap={shouldReduce ? {} : buttonTap}
              >
                {tier.cta}
              </motion.a>
            </motion.div>
          ))}
        </motion.div>

        {/* Pricing Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-[11px] text-gray-600 dark:text-gray-300 italic tracking-wider">
            Final quote depends on scope, integrations, dashboards, user roles, automation depth, and any custom workflows your project requires.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
