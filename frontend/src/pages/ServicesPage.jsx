import React, { useEffect, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, fadeUpItem, cardHover, cardHoverTransition, buttonHover, buttonTap, sectionViewport, reducedMotionVariants } from '../utils/motion';

const Pricing = lazy(() => import('../components/Pricing'));

const ServicesPage = () => {
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Services | BuildWithLami — Web Platforms & Technical Strategy";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Bespoke web platforms, high-performance interfaces, secure data backends, technical audits, and organic SEO growth strategies engineered by Eugene Odibenuah.");
    }
  }, []);

  const audienceTypes = [
    "Founders launching MVPs",
    "Businesses upgrading websites",
    "Teams needing internal tools",
    "Businesses focused on organic growth"
  ];

  const workflowSteps = [
    {
      num: "01",
      title: "Discovery & Blueprint",
      desc: "Goals, user personas, operational scope, and technical requirement specifications."
    },
    {
      num: "02",
      title: "Architecture & Proposal",
      desc: "System architecture, tech stack selection, milestone roadmap, and transparent investment terms."
    },
    {
      num: "03",
      title: "UX & System Design",
      desc: "Interactive UI workflows, relational database schema, API contracts, and security architecture."
    },
    {
      num: "04",
      title: "Milestone Engineering",
      desc: "Test-driven implementation with weekly staged preview deployments and reviews."
    },
    {
      num: "05",
      title: "Production Deployment",
      desc: "End-to-end load testing, security auditing, DNS cutover, and deployment to cloud edge."
    },
    {
      num: "06",
      title: "Warranty & Support",
      desc: "4 months of included maintenance, performance monitoring, telemetry, and patches."
    }
  ];

  const trustItems = [
    "Direct Developer Communication",
    "50/50 Milestone Invoicing (50% Upfront, 50% on Delivery)",
    "100% Source Code & IP Transfer",
    "4 Months Free Maintenance Post-Launch"
  ];

  const services = [
    {
      id: "01",
      title: "Custom Web Platforms",
      bestFor: "Startups · Businesses · Product Teams",
      desc: "I design and engineer complete web platforms—from strategy and architecture through development and cloud deployment. I turn complex business workflows into functional, high-reliability software.",
      outcome: "A launch-ready platform engineered around your workflows, users, and high-uptime growth goals.",
      cta: "Build My Platform →",
      deliverables: [
        "SaaS & Operational Dashboard Products",
        "E-commerce & Custom Marketplaces",
        "Internal Business Tools & Custom ERPs",
        "Startup MVP Architecture & Delivery",
        "Third-Party API & Webhook Integrations"
      ],
      icon: (
        <svg className="w-8 h-8 text-[#0079FF] dark:text-[#389BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
      )
    },
    {
      id: "02",
      title: "High-Performance Interfaces",
      bestFor: "Brands · Modern Web Apps · Scaling Products",
      desc: "I build fast, polished interfaces that make your product intuitive to navigate, instant to interact with, and highly effective at converting visitors into engaged customers.",
      outcome: "A faster, more polished interface that feels premium, loads instantly, and keeps users engaged.",
      cta: "Design My Frontend →",
      deliverables: [
        "Responsive React / Next.js Frontends",
        "Fluid Interaction Design & Micro-Animations",
        "Mobile-First Touch & Screen Optimization",
        "Design System & Component Architecture",
        "Sub-second Core Web Vitals & LCP Tuning"
      ],
      icon: (
        <svg className="w-8 h-8 text-[#0079FF] dark:text-[#389BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
      )
    },
    {
      id: "03",
      title: "Secure API & Data Systems",
      bestFor: "Complex Data · Automation · Multi-Tenant Apps",
      desc: "I build the secure backbone behind your application: relational database schemas, high-speed API endpoints, real-time WebSockets, and protected authentication protocols built for reliability.",
      outcome: "Backend systems that are structured, secure, and ready to handle high transactional volume.",
      cta: "Build My Backend →",
      deliverables: [
        "Scalable Node.js / Express / REST APIs",
        "PostgreSQL / Supabase Schema & Index Tuning",
        "Role-Based Access Control & Secure Auth",
        "Serverless Cloud & CI/CD Delivery",
        "Payment & Webhook Automations (Paystack/Stripe)"
      ],
      icon: (
        <svg className="w-8 h-8 text-[#0079FF] dark:text-[#389BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
      )
    },
    {
      id: "04",
      title: "Technical Strategy & Audits",
      bestFor: "Decision Makers · Codebase Modernization · Rebuilds",
      desc: "I help you evaluate technical architecture, audit existing codebases for bottlenecks and security risks, and chart clear engineering roadmaps before you invest in development.",
      outcome: "Clear recommendations, risk visibility, and an actionable roadmap you can execute with confidence.",
      cta: "Audit My System →",
      deliverables: [
        "Code Quality & Security Vulnerability Audits",
        "Performance & Latency Bottleneck Analysis",
        "Tech Stack Selection & Architecture Blueprint",
        "Refactoring & Modernization Roadmap",
        "Scalability & Cloud Cost Optimization"
      ],
      icon: (
        <svg className="w-8 h-8 text-[#0079FF] dark:text-[#389BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
      )
    },
    {
      id: "05",
      title: "SEO & Organic Growth",
      bestFor: "Organic Search · Inbound Lead Gen · Sustainable Reach",
      desc: "I optimize your site's technical foundation, semantic structure, performance, and metadata architecture to improve search visibility and create a stronger foundation for organic growth.",
      outcome: "A solid technical search foundation, fast indexing, and sustainable organic reach.",
      cta: "Improve My SEO →",
      deliverables: [
        "Technical SEO & Crawlability Audits",
        "Structured Schema.org Markup & Rich Snippets",
        "Core Web Vitals & Speed Optimization",
        "Search-Aligned Architecture & Clean Routing",
        "Analytics, Event Tracking & Conversion Setup"
      ],
      icon: (
        <svg className="w-8 h-8 text-[#0079FF] dark:text-[#389BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#07090E] text-black dark:text-white pt-32 pb-24 px-6 md:px-12 font-body selection:bg-[#0079FF] selection:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduce ? 0 : 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <p className="uppercase tracking-widest text-xs text-[#0079FF] dark:text-[#389BFF] mb-3 font-bold">Engineering Capabilities</p>
          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 tracking-tight text-black dark:text-white">
            Software <span className="bg-gradient-to-r from-[#0079FF] via-blue-500 to-indigo-400 bg-clip-text text-transparent">Services</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-light leading-relaxed">
            I design and build full-stack web platforms, high-performance interfaces, secure data backends, and sustainable growth architectures tailored to real business workflows.
          </p>
        </motion.div>

        {/* Who I Help (Audience Pills) */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20"
        >
          {audienceTypes.map((audience) => (
            <motion.div
              key={audience}
              variants={item}
              className="bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-white/10 px-5 py-4 text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 shadow-sm text-center rounded-xl"
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
          className="space-y-8 md:space-y-10 mb-28"
        >
          {services.map((service) => (
            <motion.div 
              key={service.id}
              variants={item}
              whileHover={shouldReduce ? {} : cardHover}
              transition={cardHoverTransition}
              className="bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-sm hover:shadow-xl hover:border-[#0079FF]/50 transition-all group"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Header & Core Description (7 Cols) */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#0079FF]/10 text-[#0079FF] dark:text-[#389BFF] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#0079FF]/20">
                      {service.icon}
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-[#0079FF] dark:text-[#389BFF] uppercase tracking-widest">{service.id} — SERVICE</span>
                      <h2 className="text-2xl md:text-3xl font-heading font-bold text-black dark:text-white group-hover:text-[#0079FF] dark:group-hover:text-[#389BFF] transition-colors">
                        {service.title}
                      </h2>
                    </div>
                  </div>

                  <div className="inline-block bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3.5 py-1 text-[11px] uppercase tracking-wider text-gray-700 dark:text-gray-300 font-bold rounded-lg">
                    Best for: {service.bestFor}
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg font-light leading-relaxed">
                    {service.desc}
                  </p>

                  <div className="pt-2 border-l-2 border-[#0079FF] pl-4">
                    <p className="text-xs uppercase tracking-widest font-bold text-[#0079FF] dark:text-[#389BFF] mb-1">Expected Outcome</p>
                    <p className="text-sm font-medium text-black dark:text-white leading-relaxed">
                      {service.outcome}
                    </p>
                  </div>
                </div>

                {/* Deliverables & Direct CTA (5 Cols) */}
                <div className="lg:col-span-5 bg-gray-50 dark:bg-[#111728] border border-gray-200 dark:border-white/10 rounded-2xl p-6 md:p-8 flex flex-col justify-between h-full space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
                      What You Get / Key Deliverables
                    </h3>
                    <ul className="space-y-2.5">
                      {service.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start text-xs md:text-sm text-gray-800 dark:text-gray-200 font-medium">
                          <span className="text-[#0079FF] dark:text-[#389BFF] mr-2 mt-0.5 font-bold">✦</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                    <motion.div
                      whileHover={shouldReduce ? {} : buttonHover}
                      whileTap={shouldReduce ? {} : buttonTap}
                    >
                      <Link
                        to="/contact"
                        className="w-full inline-flex items-center justify-center bg-[#0079FF] text-white hover:bg-[#0066D6] font-bold px-6 py-3.5 text-xs uppercase tracking-widest transition-colors rounded-xl shadow-lg shadow-[#0079FF]/20"
                      >
                        {service.cta}
                      </Link>
                    </motion.div>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* How I Work: 6-Step Workflow */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-16 mb-28">
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={sectionViewport}
          transition={{ duration: shouldReduce ? 0 : 0.6 }}
        >
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="uppercase tracking-widest text-xs text-[#0079FF] dark:text-[#389BFF] mb-3 font-bold">Process</p>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-black dark:text-white mb-4">
              How a project <span className="bg-gradient-to-r from-[#0079FF] via-blue-500 to-indigo-400 bg-clip-text text-transparent">moves forward</span>
            </h2>
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 font-light leading-relaxed">
              A structured, transparent engineering process so you always know what happens next, what is being built, and how we launch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {workflowSteps.map((step) => (
              <div
                key={step.num}
                className="bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-white/10 rounded-2xl p-7 shadow-sm hover:border-[#0079FF]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 bg-[#0079FF]/10 border border-[#0079FF]/20 text-[#0079FF] dark:text-[#389BFF] font-mono font-bold text-sm flex items-center justify-center rounded-xl mb-4">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-heading font-bold text-black dark:text-white mb-2">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-light">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trustItems.map((trustItem) => (
              <div
                key={trustItem}
                className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0E131F] px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 rounded-xl shadow-sm"
              >
                {trustItem}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Pricing Section */}
      <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0079FF] border-t-transparent" /></div>}>
        <Pricing />
      </Suspense>

      {/* Final CTA Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-28">
        <motion.div 
          initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={sectionViewport}
          transition={{ duration: shouldReduce ? 0 : 0.6 }}
          className="text-center bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-white/10 rounded-3xl p-12 md:p-20 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#0079FF] to-transparent"></div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-black dark:text-white mb-6">
            Have a project in mind?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-lg max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Tell me what you're building, what you're trying to achieve, and where you're stuck. I'll help you determine the right technical approach.
          </p>
          <motion.div
            whileHover={shouldReduce ? {} : buttonHover}
            whileTap={shouldReduce ? {} : buttonTap}
            className="inline-block"
          >
            <Link 
              to="/contact" 
              className="inline-flex items-center justify-center bg-[#0079FF] hover:bg-[#0066D6] text-white font-bold px-10 py-4 text-xs uppercase tracking-widest transition-colors rounded-xl shadow-lg shadow-[#0079FF]/20"
            >
              Start a Project →
            </Link>
          </motion.div>
        </motion.div>
      </div>

    </div>
  );
};

export default ServicesPage;
