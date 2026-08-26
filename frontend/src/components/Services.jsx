import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, fadeUpItem, cardHover, cardHoverTransition, buttonHover, buttonTap, sectionViewport, reducedMotionVariants } from '../utils/motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { playPopSound } from '../utils/sound';

const Services = () => {
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  const [selectedService, setSelectedService] = useState(null);

  const services = [
    {
      id: "web-platforms",
      title: "Custom Web Platforms",
      badge: "Full-Stack Engineering",
      timeline: "3–8 Weeks",
      desc: "For businesses that need a complete website, web app, or internal platform built around real goals.",
      outcome: "You get a launch-ready product with the pages, flows, and functionality your business actually needs.",
      features: [
        "Business websites and custom platforms",
        "Dashboards, portals, and internal tools",
        "E-commerce and customer-facing experiences"
      ],
      detailedScope: "From database schema design to responsive frontend interfaces and automated background workflows, I build full-stack web platforms engineered for longevity, high concurrency, and real business operations.",
      deliverables: [
        "Full-stack web application (React/Next.js + Node/PostgreSQL)",
        "Role-based authentication & secure session management",
        "Admin control panel & operational metrics dashboard",
        "Payment processing (Paystack, Stripe, Flutterwave)",
        "Automated transactional emails & webhook pipelines",
        "Production deployment with SSL & domain configuration",
        "Included post-launch warranty support and bug fixes"
      ],
      idealFor: "Founders launching MVPs, companies automating manual spreadsheets, and businesses replacing outdated off-the-shelf software.",
      stack: ["React / Next.js", "Node.js / Express", "PostgreSQL", "Tailwind CSS", "REST / GraphQL APIs"]
    },
    {
      id: "interfaces",
      title: "High-Performance Interfaces",
      badge: "UI/UX & Speed Optimization",
      timeline: "1–3 Weeks",
      desc: "For brands that want a cleaner, faster, and more modern experience for customers and users.",
      outcome: "You get an interface that feels polished, works smoothly on every screen, and supports conversion.",
      features: [
        "Landing pages and marketing websites",
        "Responsive web app interfaces",
        "Mobile-first performance improvements"
      ],
      detailedScope: "First impressions dictate conversion rates. I design and build lightning-fast, high-converting digital storefronts and marketing pages with fluid animations, zero layout shifts, and flawless mobile responsiveness.",
      deliverables: [
        "Custom UI design with bespoke brand aesthetics & micro-animations",
        "Lighthouse-optimized builds targeting 90+ scores on delivered code",
        "Flawless mobile, tablet, and widescreen responsiveness",
        "Lead capture forms with real-time spam validation",
        "Interactive product showcases, calculators, and interactive widgets",
        "Complete Webflow / WordPress to modern React / Vite migration"
      ],
      idealFor: "B2B SaaS products, consulting firms, agencies, and high-ticket service providers needing immediate visual authority.",
      stack: ["React", "Framer Motion", "Tailwind CSS", "Radix UI", "Vite"]
    },
    {
      id: "backend-data",
      title: "Secure API & Data Systems",
      badge: "Backend & Cloud Architecture",
      timeline: "2–5 Weeks",
      desc: "For products that need a reliable backend, structured data, and secure user access.",
      outcome: "You get backend systems that are stable, scalable, and easier to maintain as the business grows.",
      features: [
        "Backend architecture and APIs",
        "Authentication and account security",
        "Database design and workflow logic"
      ],
      detailedScope: "The engine beneath your product. I engineer robust RESTful and asynchronous API services, normalized relational databases, safe data migrations, and hardened security protocols.",
      deliverables: [
        "Well-documented, type-safe RESTful API architecture",
        "Relational database modeling with indexing & query optimization",
        "JWT / HttpOnly cookie authentication, 2FA, & RBAC rules",
        "Third-party integrations (APIs, CRM, accounting, webhooks)",
        "Automated backup procedures & rate-limiting protection",
        "Complete API documentation and Postman collections"
      ],
      idealFor: "Applications requiring secure multi-tenant data isolation, fin-tech or healthcare compliance, and high throughput.",
      stack: ["Node.js", "Express", "PostgreSQL / Supabase", "Redis", "Docker", "AWS / Vercel"]
    },
    {
      id: "audits-strategy",
      title: "Technical Strategy & Audits",
      badge: "Engineering Advisory",
      timeline: "3–7 Business Days",
      desc: "For teams that need help defining scope, reviewing an existing product, or planning the right next step.",
      outcome: "You get clear technical direction, a realistic scope, and practical recommendations you can act on.",
      features: [
        "Website and platform audits",
        "Technical scope and launch planning",
        "Performance, security, and stack reviews"
      ],
      detailedScope: "Avoid costly engineering dead-ends. I conduct deep technical audits of your current codebase, architecture, and cloud infrastructure, delivering an actionable roadmap prioritized by business impact.",
      deliverables: [
        "Comprehensive Code Quality & Security Vulnerability Report",
        "Core Web Vitals & Frontend Performance Bottleneck Analysis",
        "Architecture teardown with scalability recommendations",
        "Realistic project roadmap, milestone breakdown, and cost estimation",
        "1-on-1 strategy video walkthrough session"
      ],
      idealFor: "Founders with legacy codebases, teams considering major rebuilds, or businesses evaluating agency estimates.",
      stack: ["Lighthouse", "Security Auditing", "Code Review", "Architecture RFCs"]
    },
    {
      id: "seo-growth",
      title: "SEO & Growth Strategy",
      badge: "Organic Search & Indexing",
      timeline: "2–4 Weeks + Roadmap",
      desc: "For businesses that want stronger visibility in search and a site structure that supports growth.",
      outcome: "You get a stronger foundation for ranking, discoverability, and long-term inbound traffic.",
      features: [
        "Technical SEO and site audits",
        "Core Web Vitals improvements",
        "Content and growth recommendations"
      ],
      detailedScope: "Organic search delivers the highest ROI over time. I overhaul your website's crawlability, structured data schemas, semantic hierarchy, and metadata to give you dominant visibility across search engines.",
      deliverables: [
        "Complete Technical SEO audit & indexing fix plan",
        "Schema.org JSON-LD structured data implementation (Articles, FAQs, Products)",
        "Automated dynamic sitemaps, robots.txt, and canonical URL handling",
        "OpenGraph & Twitter preview optimization for social sharing",
        "Performance tuning for Google's Core Web Vitals (LCP, INP, CLS)"
      ],
      idealFor: "E-commerce stores, content publishers, B2B SaaS, and local businesses wanting steady inbound leads without ad spend.",
      stack: ["Schema.org", "Next.js Metadata", "Google Search Console", "Semantic HTML5"]
    }
  ];

  const handleOpenModal = (service) => {
    playPopSound();
    setSelectedService(service);
  };

  const handleCloseModal = () => {
    setSelectedService(null);
  };

  const handleServiceSelect = (serviceTitle) => {
    handleCloseModal();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="px-6 md:px-12 max-w-7xl mx-auto py-24">
      {/* Section Header */}
      <motion.div
        className="max-w-3xl mb-12"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
      >
        <motion.div variants={item} className="bwl-eyebrow mb-3">
          <span className="w-2 h-2 bg-accent inline-block" />
          <span>01 · Capabilities & Systems</span>
        </motion.div>
        <motion.h3 variants={item} className="text-3xl md:text-5xl font-heading font-bold mb-4 text-black dark:text-white leading-tight">
          What I Can Build <span className="text-accent">For You</span>
        </motion.h3>
        <motion.p variants={item} className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-light">
          From custom software platforms and conversion-focused interfaces to robust APIs and search architecture, engineered for longevity, speed, and real business results.
        </motion.p>
      </motion.div>

      {/* Services Grid (Vertically Stacked on Mobile, 2-Col on Tablet, 3-Col on Desktop) */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
      >
        {services.map((service, index) => (
          <motion.div 
            key={`service-${index}`}
            variants={item}
            whileHover={shouldReduce ? {} : cardHover}
            transition={cardHoverTransition}
            onClick={() => handleOpenModal(service)}
            className="w-full bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 hover:border-accent dark:hover:border-accent transition-all p-6 sm:p-7 rounded-2xl relative overflow-hidden group cursor-pointer shadow-sm flex flex-col justify-between"
          >
            {/* Orange gradient accent on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 dark:from-accent/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-accent">
                  {service.badge}
                </span>
                <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                  {service.timeline}
                </span>
              </div>

              <h4 className="text-xl font-heading font-bold mb-2 text-black dark:text-white group-hover:text-accent transition-colors">
                {service.title}
              </h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4 font-light">{service.desc}</p>
              
              <div className="bg-gray-50 dark:bg-white/5 border-l-2 border-accent p-3 rounded-r-lg mb-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-accent mb-0.5 font-mono">Key Outcome</p>
                <p className="text-xs text-black dark:text-white font-medium">{service.outcome}</p>
              </div>

              <ul className="space-y-2 mb-6 text-xs text-gray-700 dark:text-gray-300">
                {service.features.map((feature, i) => (
                  <li key={`feature-${i}`} className="flex items-start">
                    <span className="text-accent mr-2 mt-0.5 font-bold text-xs">✦</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/10 mt-auto">
              <span className="text-[11px] font-heading font-bold uppercase tracking-[0.15em] text-accent flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Explore Scope
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(service);
                }}
                className="btn-dark !px-4 !py-2 !text-[10px]"
              >
                Scope & Specs
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Interactive Service Scope Modal ── */}
      <Dialog open={!!selectedService} onOpenChange={(open) => { if (!open) handleCloseModal(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#141414] border-gray-200 dark:border-white/10 text-black dark:text-white p-6 sm:p-8 rounded-2xl">
          {selectedService && (
            <div>
              <DialogHeader className="text-left space-y-3 pb-4 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-accent">
                    {selectedService.badge}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Typical Timeline: <strong className="text-black dark:text-white">{selectedService.timeline}</strong>
                  </span>
                </div>
                <DialogTitle className="text-2xl sm:text-3xl font-heading font-bold text-black dark:text-white">
                  {selectedService.title}
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed font-light">
                  {selectedService.detailedScope}
                </DialogDescription>
              </DialogHeader>

              {/* Key Outcome Highlight */}
              <div className="my-5 p-4 bg-accent/5 dark:bg-accent/10 border-l-4 border-accent">
                <p className="text-[11px] font-heading font-bold uppercase tracking-wider text-accent mb-1">Target Result</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {selectedService.outcome}
                </p>
              </div>

              {/* Key Deliverables */}
              <div className="space-y-3 mb-6">
                <h5 className="text-[11px] font-heading font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                  What's Included & Deliverables
                </h5>
                <ul className="grid grid-cols-1 gap-2.5">
                  {selectedService.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-accent font-bold mr-2.5 mt-0.5 text-xs">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ideal For & Tech Stack */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 mb-6 text-xs rounded-xl">
                <div>
                  <p className="font-heading font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-1">Ideal For</p>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-light">{selectedService.idealFor}</p>
                </div>
                <div>
                  <p className="font-heading font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-2">Technologies Used</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedService.stack.map((t, idx) => (
                      <span key={idx} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded text-[10px] font-mono font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <motion.button
                  type="button"
                  onClick={() => handleServiceSelect(selectedService.title)}
                  className="flex-1 bg-accent text-white font-heading font-bold uppercase text-[11px] px-8 py-4 tracking-[0.15em] hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all duration-300 shadow-lg hover:shadow-accent/30 text-center active:scale-[0.98] cursor-pointer"
                  whileHover={shouldReduce ? {} : buttonHover}
                  whileTap={shouldReduce ? {} : buttonTap}
                >
                  Start a Project with this Service →
                </motion.button>
                
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="border border-gray-300 dark:border-white/15 text-gray-900 dark:text-gray-100 font-heading font-bold text-[11px] uppercase tracking-[0.15em] hover:border-accent hover:text-accent transition-all duration-300 py-4 px-8 bg-transparent active:scale-[0.98] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Services;

