import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, fadeUpItem, cardHover, cardHoverTransition, buttonHover, buttonTap, sectionViewport, reducedMotionVariants } from '../utils/motion';

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
