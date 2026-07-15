import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, fadeUpItem, cardHover, cardHoverTransition, buttonHover, buttonTap, sectionViewport, reducedMotionVariants } from '../utils/motion';

// ── High-Definition Icon Definitions ─────────────────────────────────
const Icon = {
    // Web & Platform Icons
    Website: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="2" y1="9" x2="22" y2="9"/>
            <line x1="2" y1="15" x2="22" y2="15"/>
        </svg>
    ),
    App: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2"/>
            <circle cx="9" cy="9" r="1.5"/>
            <circle cx="15" cy="9" r="1.5"/>
            <path d="M7 14s1.5 1 4 1 4-1 4-1"/>
        </svg>
    ),
    Dashboard: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="9" y1="21" x2="9" y2="9"/>
            <line x1="16" y1="21" x2="16" y2="15"/>
        </svg>
    ),
    Store: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3h18v18H3z"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="9" y1="21" x2="9" y2="9"/>
            <line x1="16" y1="21" x2="16" y2="13"/>
        </svg>
    ),
    
    // Interface & Design Icons
    Interface: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="2"/>
            <line x1="2" y1="6" x2="22" y2="6"/>
            <line x1="2" y1="14" x2="22" y2="14"/>
            <line x1="4" y1="10" x2="4" y2="10"/>
            <line x1="8" y1="10" x2="8" y2="10"/>
            <line x1="12" y1="10" x2="12" y2="10"/>
            <line x1="16" y1="10" x2="16" y2="10"/>
        </svg>
    ),
    Mobile: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="2" width="12" height="20" rx="1"/>
            <line x1="10" y1="2" x2="14" y2="2"/>
            <line x1="12" y1="18" x2="12" y2="20"/>
        </svg>
    ),
    Speed: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,2 12,8 12,14"/>
            <line x1="2" y1="12" x2="6" y2="12"/>
            <line x1="8" y1="12" x2="14" y2="18"/>
        </svg>
    ),
    
    // Security & Data Icons
    Security: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2"/>
            <circle cx="12" cy="16" r="1"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
            <path d="M9 13v3"/>
            <path d="M15 13v3"/>
        </svg>
    ),
    Database: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2.9 0-3 0z"/>
            <path d="M3 12h18"/>
            <path d="M3 17h18"/>
            <path d="M12 5v14"/>
            <path d="M12 12l-3 3 3 3"/>
        </svg>
    ),
    Api: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 6.5v10.5l8-4.5z"/>
            <path d="M4 6.5v10.5l8-4.5z"/>
        </svg>
    ),
    
    // Strategy & Analysis Icons
    Analytics: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <line x1="2" y1="20" x2="22" y2="20"/>
            <line x1="2" y1="10" x2="8" y2="10"/>
            <line x1="10" y1="8" x2="14" y2="8"/>
            <line x1="2" y1="14" x2="8" y2="14"/>
            <line x1="14" y1="8" x2="20" y2="8"/>
            <line x1="14" y1="14" x2="20" y2="14"/>
        </svg>
    ),
    Audit: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
            <line x1="15" y1="3" x2="15" y2="21"/>
        </svg>
    ),
    Planning: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
            <line x1="8" y1="14" x2="8" y2="18"/>
            <line x1="12" y1="14" x2="12" y2="18"/>
            <line x1="16" y1="14" x2="16" y2="18"/>
        </svg>
    ),
    Shield: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <circle cx="12" cy="12" r="2"/>
        </svg>
    ),
    
    // SEO & Digital Marketing Icons
    Seo: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="2" x2="12" y2="4"/>
            <line x1="12" y1="20" x2="12" y2="22"/>
            <line x1="2" y1="12" x2="4" y2="12"/>
            <line x1="20" y1="12" x2="22" y2="12"/>
            <line x1="5.6" y1="5.6" x2="7.8" y2="7.8"/>
            <line x1="16.2" y1="16.2" x2="18.4" y2="18.4"/>
            <line x1="5.6" y1="18.4" x2="7.8" y2="16.2"/>
            <line x1="16.2" y1="7.8" x2="18.4" y2="5.6"/>
        </svg>
    ),
    Growth: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
        </svg>
    ),
    Speedometer: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="12" x2="8" y2="8"/>
            <line x1="12" y1="12" x2="16" y2="16"/>
            <line x1="8" y1="12" x2="8" y2="8"/>
            <line x1="16" y1="12" x2="16" y2="16"/>
        </svg>
    ),
    
    // Social Media Icons
    MessageSquare: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 01-7.5 7.5 8.38 8.38 0 01-7.5-7.5 8.38 8.38 0 017.5-7.5A8.38 8.38 0 0121 11.5z"/>
            <path d="M12 9v6m0 0l3-3m-3 3l-3-3"/>
        </svg>
    ),
    Users: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="m22 21-3-3 3-3"/>
            <path d="M16 16l4 4"/>
        </svg>
    ),
    BarChart: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="20" x2="12" y2="10"/>
            <line x1="18" y1="20" x2="18" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="16"/>
        </svg>
    ),
};

const Services = () => {
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  const services = [
    {
      title: "Custom Web Platforms",
      desc: "For businesses that need a complete website, web app, or internal platform built around real goals.",
      outcome: "You get a launch-ready product with the pages, flows, and functionality your business actually needs.",
      features: [
        "Business websites and custom platforms",
        "Dashboards, portals, and internal tools",
        "E-commerce and customer-facing experiences"
      ]
    },
    {
      title: "High-Performance Interfaces",
      desc: "For brands that want a cleaner, faster, and more modern experience for customers and users.",
      outcome: "You get an interface that feels polished, works smoothly on every screen, and supports conversion.",
      features: [
        "Landing pages and marketing websites",
        "Responsive web app interfaces",
        "Mobile-first performance improvements"
      ]
    },
    {
      title: "Secure API & Data Systems",
      desc: "For products that need a reliable backend, structured data, and secure user access.",
      outcome: "You get backend systems that are stable, scalable, and easier to maintain as the business grows.",
      features: [
        "Backend architecture and APIs",
        "Authentication and account security",
        "Database design and workflow logic"
      ]
    },
    {
      title: "Technical Strategy & Audits",
      desc: "For teams that need help defining scope, reviewing an existing product, or planning the right next step.",
      outcome: "You get clear technical direction, a realistic scope, and practical recommendations you can act on.",
      features: [
        "Website and platform audits",
        "Technical scope and launch planning",
        "Performance, security, and stack reviews"
      ]
    },
    {
      title: "SEO & Growth Strategy",
      desc: "For businesses that want stronger visibility in search and a site structure that supports growth.",
      outcome: "You get a stronger foundation for ranking, discoverability, and long-term inbound traffic.",
      features: [
        "Technical SEO and site audits",
        "Core Web Vitals improvements",
        "Content and growth recommendations"
      ]
    },
    {
      title: "Social Media Management",
      desc: "For brands that want help building consistency, engagement, and stronger communication online.",
      outcome: "You get a more structured social presence designed to support awareness and trust.",
      features: [
        "Content planning and direction",
        "Community engagement support",
        "Reporting and campaign tracking"
      ],
      isComingSoon: true
    }
  ];

  return (
    <section id="services" className="px-6 md:px-12 max-w-7xl mx-auto py-24">
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start mb-16"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
      >
        <motion.div variants={item}>
          <p className="text-gray-800 dark:text-gray-200 tracking-widest uppercase text-sm mb-4 font-semibold flex items-center gap-2">
            <span className="text-accent">✦</span>
            What I Can Build For You
            <span className="text-accent">✦</span>
          </p>
          <h3 className="text-3xl md:text-5xl font-heading font-bold mb-6 text-black dark:text-white leading-tight">
            Need A Website, Platform, Or Audit?
          </h3>
          <p className="text-base md:text-lg text-gray-800 dark:text-gray-200 leading-relaxed max-w-3xl opacity-90">
            Get a build strategy that fits your business, not just your idea. If you already know what you need or you want help defining scope, I can help you move from concept to a clear launch plan.
          </p>
        </motion.div>

        <motion.div variants={item} className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-accent mb-3 flex items-center gap-2">
            <span className="text-accent">❖</span>
            How I Help
            <span className="text-accent">❖</span>
          </p>
          <ul className="space-y-4 text-sm md:text-base text-gray-800 dark:text-gray-200">
            <li className="flex items-start">
              <span className="text-accent mr-3 mt-1 text-[10px]">✓</span>
              Clarify what to build first and what can wait.
            </li>
            <li className="flex items-start">
              <span className="text-accent mr-3 mt-1 text-[10px]">▸</span>
              Turn rough ideas into a defined scope and launch plan.
            </li>
            <li className="flex items-start">
              <span className="text-accent mr-3 mt-1 text-[10px]">⦿</span>
              Improve existing websites, platforms, and technical foundations.
            </li>
          </ul>
        </motion.div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
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
            className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 hover:border-accent dark:hover:border-accent transition-colors p-8 relative overflow-hidden group cursor-pointer shadow-sm"
          >
            {/* Orange gradient accent on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 dark:from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10">
              <h4 className="text-xl font-heading font-bold mb-1 text-black dark:text-white">{service.title}</h4>
              <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed mb-4 opacity-90">{service.desc}</p>
              <p className="text-black dark:text-white text-sm font-medium leading-relaxed mb-6">{service.outcome}</p>
              
              <ul className="space-y-3 mb-8 text-sm text-gray-700 dark:text-gray-200">
                {service.features.map((feature, i) => (
                  <li key={`feature-${i}`} className="flex items-start">
                    <span className="text-accent mr-2 mt-1 text-[10px]">■</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {service.isComingSoon ? (
                <span className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 text-xs font-bold px-4 py-2 uppercase select-none">
                  Launching Soon
                </span>
              ) : (
                <motion.a
                  href="#contact"
                  className="inline-block bg-black text-white dark:bg-white dark:text-black text-xs font-bold px-4 py-2 uppercase hover:bg-accent dark:hover:bg-gray-200 transition-colors"
                  whileHover={shouldReduce ? {} : buttonHover}
                  whileTap={shouldReduce ? {} : buttonTap}
                >
                  Start A Project
                </motion.a>
              )}
            </div>
            
            {/* Gray block decoration */}
            <div className="absolute top-4 right-4 w-12 h-12 bg-gray-100 dark:bg-gray-800 group-hover:bg-accent transition-colors"></div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Services;
