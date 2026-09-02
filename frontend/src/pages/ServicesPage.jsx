import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, fadeUpItem, cardHover, cardHoverTransition, buttonHover, buttonTap, sectionViewport, reducedMotionVariants } from '../utils/motion';
import { BUILD_PRICING, COMMERCIAL_TERMS } from '../config/pricing';

const ServicesPage = () => {
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Services | Buildwith_lami — Web Platforms & Technical Strategy";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Bespoke web platforms, high-performance interfaces, secure data backends, technical audits, and organic SEO growth strategies engineered by Eugene Odibenuah.");
    }
  }, []);

  const audienceTypes = [
    "Founders launching MVPs",
    "Schools & Training Academies",
    "Estates & Facility Operations",
    "Warehouses & Supermarkets"
  ];

  const workflowSteps = [
    {
      num: "01",
      title: "Discovery & Requirements",
      desc: "Deep-dive scoping call to map business goals, user journeys, data models, and edge cases."
    },
    {
      num: "02",
      title: "Architecture & Sprints",
      desc: "Transparent roadmap with 50/50 milestone agreements and high-fidelity UX reviews."
    },
    {
      num: "03",
      title: "Full-Stack Development",
      desc: "Production-ready engineering in React, Node, and PostgreSQL with continuous staging previews."
    },
    {
      num: "04",
      title: "Production Launch & Included Warranty",
      desc: "SSL security hardening, domain cutover, full GitHub code transfer, and included post-launch warranty support."
    }
  ];

  const trustItems = [
    "50/50 Milestone Terms",
    "Included Warranty Support",
    "100% Code & IP Ownership",
    "Production Performance Tuning"
  ];

  const services = [
    {
      id: "business-portals",
      title: "Business Portals, School Systems & Operational ERPs",
      bestFor: "Schools, residential estates, wholesale warehouses, and supermarket retail chains",
      desc: "Turnkey operational systems: student result & tuition portals, QR gate-pass visitor apps, multi-branch warehouse inventory ledgers, and fast cashier POS stations.",
      outcome: "An automated operations engine that removes manual paperwork, prevents stock shrinkage, and speeds up daily administrative workflows.",
      deliverables: [
        "School Admission, Automated CA Grading & PDF Report Cards",
        "Digital Estate Gate Pass with QR Guard Scanner PWA & SMS Alerts",
        "Warehouse Batch/Expiry Inventory Hub & Inter-Branch Transfers",
        "Supermarket POS Cashier Station with Barcode & Thermal Print Support",
        "100% Code Transfer, GitHub Repository Handover & Staff Training"
      ],
      icon: (
        <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
      )
    },
    {
      id: "web-platforms",
      title: "Custom Web Platforms & Portals",
      bestFor: "Complex business systems, internal operations & client dashboards",
      desc: "Engineered web applications built with scalable backend architectures, structured relational databases, role-based authentication, and modern user interfaces.",
      outcome: "A secure, launch-ready platform engineered for high reliability, fast query times, and long-term business scalability.",
      deliverables: [
        "React / Next.js + Node.js / PostgreSQL Architecture",
        "Role-Based Access Control (RBAC) & Secure Sessions",
        "Automated Payment & Transactional Messaging Pipelines",
        "Admin Operational Dashboards & Analytics",
        "100% Code & IP Ownership Transfer + Included Warranty"
      ],
      icon: (
        <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
      )
    },
    {
      id: "interfaces",
      title: "High-Performance Digital Storefronts & UIs",
      bestFor: "Brands needing high-ticket conversion, rapid speed & polished aesthetics",
      desc: "Modern digital interfaces engineered with fast page loads, micro-animations, accessible design systems, and seamless responsive layouts.",
      outcome: "A high-converting digital storefront that builds immediate authority and delivers seamless browsing across mobile and desktop.",
      deliverables: [
        "Bespoke Visual Identity & Micro-Interactions",
        "Lighthouse-Optimized Builds — targeting 90+ scores on delivered code",
        "Flawless Mobile-First Layout & Touch Experience",
        "Interactive Quotation Tools & Scoping Calculators",
        "Frictionless Lead Capture & Spam Protection"
      ],
      icon: (
        <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      )
    },
    {
      id: "backend-data",
      title: "Robust Backend, APIs & Database Systems",
      bestFor: "Mission-critical data structures, microservices & 3rd-party integrations",
      desc: "Scalable server architectures, type-safe REST APIs, relational database design, asynchronous queues, and hardened authentication systems.",
      outcome: "A resilient backend infrastructure capable of handling high concurrency without downtime or data corruption.",
      deliverables: [
        "Documented, Type-Safe REST API Endpoints",
        "Normalized PostgreSQL / Supabase Schema Architecture",
        "Encrypted authentication (HTTPS/SSL) & hardened dependency management",
        "Database integrity constraints & automated backups",
        "Optimized & indexed database queries"
      ],
      icon: (
        <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
      )
    },
    {
      id: "audits-strategy",
      title: "Technical Architecture & Code Audits",
      bestFor: "Legacy codebases, pre-funding due diligence & system migrations",
      desc: "Deep-dive inspections of existing codebases, performance bottlenecks, security vulnerabilities, and architecture roadmaps.",
      outcome: "A prioritized, business-aligned roadmap detailing exactly what to refactor, upgrade, or rebuild for maximum ROI.",
      deliverables: [
        "Comprehensive Code Quality & Vulnerability Report",
        "Core Web Vitals & Frontend Performance Teardown",
        "Database Indexing & Query Optimization Roadmap",
        "Concrete Milestone Roadmap & Budget Estimates",
        "1-on-1 Strategy Walkthrough Video Session"
      ],
      icon: (
        <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
      )
    },
    {
      id: "seo-growth",
      title: "Technical SEO & Structured Growth Engine",
      bestFor: "Businesses seeking compounding inbound organic search traffic",
      desc: "Full-stack technical search optimization ensuring clean crawlability, JSON-LD structured data, rich social cards, and speed scores.",
      outcome: "A technical SEO foundation that enables search engines to index your pages properly and rank key revenue keywords.",
      deliverables: [
        "Technical SEO & Crawlability Audits",
        "Structured Schema Markup (JSON-LD) Implementation",
        "Core Web Vitals Speed Tuning (LCP, INP, CLS)",
        "Dynamic XML Sitemaps, Robots.txt & OpenGraph Cards",
        "Search Console & Google Analytics 4 Telemetry"
      ],
      icon: (
        <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background text-black dark:text-white pt-32 pb-24 px-4 sm:px-6 md:px-12 font-body selection:bg-accent selection:text-white transition-colors duration-300 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Header */}
        <motion.div 
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduce ? 0 : 0.5 }}
          className="text-left max-w-3xl"
        >
          <div className="bwl-eyebrow mb-4">
            <span className="w-2 h-2 bg-accent inline-block" />
            <span>Architectural Service Matrix</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight text-black dark:text-white leading-[1.08]">
            Built for Scale, Speed & <span className="text-accent">Revenue.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 font-light leading-relaxed">
            I engineer full-stack web platforms, high-performance interfaces, and secure API architectures. Direct founder-to-engineer collaboration with predictable 50/50 milestone delivery.
          </p>
        </motion.div>

        {/* Who I Help (Audience Pills) */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {audienceTypes.map((audience) => (
            <motion.div
              key={audience}
              variants={item}
              className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 px-4 py-3.5 text-xs font-mono font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 shadow-xs text-center flex items-center justify-center"
            >
              {audience}
            </motion.div>
          ))}
        </motion.div>

        {/* Streamlined Services List */}
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          className="space-y-8"
        >
          {services.map((service) => (
            <motion.div 
              key={service.id}
              variants={item}
              whileHover={shouldReduce ? {} : cardHover}
              transition={cardHoverTransition}
              className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-sm hover:shadow-xl hover:border-accent/40 transition-all group"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Header & Core Description (7 Cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:scale-105 transition-transform text-accent">
                      {service.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-widest">{service.id}</span>
                      <h2 className="text-2xl sm:text-3xl font-heading font-bold text-black dark:text-white group-hover:text-accent transition-colors">
                        {service.title}
                      </h2>
                    </div>
                  </div>

                  <div className="inline-block bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-gray-700 dark:text-gray-300 font-bold">
                    Best for: {service.bestFor}
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base font-light leading-relaxed">
                    {service.desc}
                  </p>

                  <div className="p-4 bg-accent/5 dark:bg-accent/10 border-l-3 border-accent rounded-r-xl">
                    <p className="text-[11px] uppercase tracking-widest font-bold text-accent mb-0.5">Expected Outcome</p>
                    <p className="text-xs sm:text-sm font-medium text-black dark:text-white leading-relaxed">
                      {service.outcome}
                    </p>
                  </div>
                </div>

                {/* Deliverables & Direct CTA (5 Cols) */}
                <div className="lg:col-span-5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between h-full space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
                      Key Deliverables & Included Scope
                    </h3>
                    <ul className="space-y-2">
                      {service.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start text-xs sm:text-sm text-gray-800 dark:text-gray-200 font-medium">
                          <span className="text-accent mr-2 mt-0.5 font-bold">✦</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-white/10 relative z-10">
                    <Link
                      to={`/contact?service=${encodeURIComponent(service.title)}`}
                      className="btn-primary w-full"
                      style={{ touchAction: 'manipulation' }}
                    >
                      Start a Project with this Service →
                    </Link>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Process: 4-Step Structured Workflow */}
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="bwl-eyebrow mb-2">
              <span className="w-2 h-2 bg-accent inline-block" />
              <span>04 · Process Framework</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-black dark:text-white">
              How a project <span className="text-accent">moves forward</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-light leading-relaxed">
              A predictable 4-step engineering cadence so you always know what is being built, when it ships, and how we support it.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step) => (
              <div
                key={step.num}
                className="bwl-card p-6 sm:p-7 shadow-xs hover:border-accent/40 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 bg-accent/10 border border-accent/20 text-accent font-mono font-bold text-sm flex items-center justify-center rounded-xl mb-4">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-heading font-bold text-black dark:text-white mb-2">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed font-light">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {trustItems.map((trustItem) => (
              <div
                key={trustItem}
                className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#141414] px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 rounded-xl shadow-xs"
              >
                ✓ {trustItem}
              </div>
            ))}
          </div>
        </div>

        {/* ── High-Converting Pricing & Estimator Anchor Card ── */}
        <div className="bwl-feature-card bg-gradient-to-br from-[#161616] via-[#141414] to-black text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-accent via-amber-400 to-accent" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="bwl-eyebrow mb-2">
                <span className="w-2 h-2 bg-accent inline-block" />
                <span>Transparent Studio Rates</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold tracking-tight text-white leading-tight">
                Predictable Scope & <span className="text-accent">Milestone Invoicing</span>
              </h2>
              <p className="text-gray-300 text-sm sm:text-base font-light leading-relaxed">
                All projects are billed on standard 50/50 milestone terms with post-launch warranty support and 100% intellectual property transfer. Review our transparent fixed tiers or contact us directly for custom architecture.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block">Websites & Portals</span>
                  <span className="text-sm font-bold text-white mt-1 block">
                    From ₦{BUILD_PRICING.websites.startingPriceFormatted}
                  </span>
                </div>
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block">E-Commerce Engines</span>
                  <span className="text-sm font-bold text-white mt-1 block">
                    From ₦{BUILD_PRICING.ecommerce.startingPriceFormatted}
                  </span>
                </div>
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block">Custom Software</span>
                  <span className="text-sm font-bold text-white mt-1 block">
                    From ₦{BUILD_PRICING.software.startingPriceFormatted}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center space-y-4 relative z-10">
              <Link
                to="/pricing"
                className="btn-primary w-full sm:w-auto"
                style={{ touchAction: 'manipulation' }}
              >
                View Transparent Pricing →
              </Link>
              <span className="text-xs text-gray-400 font-mono">
                Clear Fixed Tiers · 50/50 Milestones · Zero Hidden Fees
              </span>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="bwl-feature-card text-center shadow-xl space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-black dark:text-white">
            Have a project in mind?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Tell me what you're building, key constraints, and your target timeline. I'll personally review your brief and return a concrete next step within 24 hours.
          </p>
          <div className="pt-2 relative z-10">
            <Link 
              to="/contact" 
              className="btn-primary"
              style={{ touchAction: 'manipulation' }}
            >
              Start a Project →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ServicesPage;
