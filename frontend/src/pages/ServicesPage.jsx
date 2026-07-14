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
    // SEO Best Practices
    document.title = "Services | BuildWithLami - Premium Web Development & SEO Strategy";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Explore our enterprise-grade services including custom web platforms, high-performance interfaces, secure API systems, technical audits, and data-driven SEO growth strategies.");
    }
  }, []);

  const audienceTypes = [
    "Founders launching MVPs",
    "Businesses upgrading websites",
    "Teams needing internal tools",
    "Brands focused on SEO growth"
  ];

  const workflowSteps = [
    {
      title: "Discovery",
      desc: "We clarify goals, scope, priorities, and the right technical direction."
    },
    {
      title: "Build",
      desc: "I design, develop, and refine the product with performance and clarity in mind."
    },
    {
      title: "Launch",
      desc: "Everything is tested, deployed, and prepared for a smooth public release."
    },
    {
      title: "Support",
      desc: "You get handoff guidance plus post-launch maintenance and improvement support."
    }
  ];

  const trustItems = [
    "Fast delivery with clear milestones",
    "Security-first engineering approach",
    "SEO-ready and mobile-first builds",
    "4 months free maintenance after launch"
  ];

  const services = [
    {
      id: "01",
      title: "Custom Web Platforms",
      desc: "Need a complete solution from scratch? I build entire web-based products from the ground up—handling everything from strategy and design to final deployment and scaling. I turn complex ideas into functional, reliable software.",
      bestFor: "Best for startups, business owners, and teams building a product from the ground up.",
      outcome: "You get a launch-ready platform built around your actual workflows, users, and growth goals.",
      cta: "Build My Platform",
      features: [
        "SaaS & Dashboard Products",
        "E-commerce & Marketplaces",
        "Internal Business Tools",
        "MVP Development (Startups)",
        "Third-Party API Integrations"
      ],
      icon: (
        <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
      )
    },
    {
      id: "02",
      title: "High-Performance Interfaces",
      desc: "I create the fast, beautiful, and interactive layer your users touch. I focus on pixel-perfect designs that convert visitors into customers through extreme speed, mobile responsiveness, and engaging animations.",
      bestFor: "Best for brands that need stronger first impressions, clearer UX, and better conversion.",
      outcome: "You get a faster, more polished interface that feels premium and keeps users engaged.",
      cta: "Design My Frontend",
      features: [
        "Animated Marketing Sites",
        "Interactive Web Apps",
        "Mobile-First Design",
        "Performance & SEO Optimization",
        "Modern JS Frameworks (React/Vue)"
      ],
      icon: (
        <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
      )
    },
    {
      id: "03",
      title: "Secure API & Data Systems",
      desc: "I build the secure 'brain' behind your application. My focus is on robust data management, high-speed server logic, and protecting your users' information with modern security protocols and cloud infrastructure.",
      bestFor: "Best for apps that need stable backend logic, secure data handling, and automation.",
      outcome: "You get backend systems that are scalable, structured, and built for reliability.",
      cta: "Build My Backend",
      features: [
        "Scalable Server Architecture",
        "Database Design & Migration",
        "Secure Auth (JWT, OAuth)",
        "Cloud Infrastructure (AWS/Vercel)",
        "Workflow & Task Automation"
      ],
      icon: (
        <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
      )
    },
    {
      id: "04",
      title: "Technical Strategy & Audits",
      desc: "I help you plan for the future. Whether it's auditing an existing codebase for security flaws or selecting the right tech stack for a new venture, I provide the roadmap to ensure your project is stable and scalable.",
      bestFor: "Best for teams making technical decisions, fixing bottlenecks, or planning a rebuild.",
      outcome: "You get clear recommendations, risk visibility, and a roadmap you can actually execute.",
      cta: "Audit My System",
      features: [
        "Performance & Security Audits",
        "Code Modernization",
        "Tech Stack Selection",
        "Scalability Roadmaps",
        "System Architecture Design"
      ],
      icon: (
        <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
      )
    },
    {
      id: "05",
      title: "SEO & Growth Strategy",
      desc: "I help your business get found by the right audience. My approach to SEO isn't just about keywords; it's about technical performance, content structure, and user intent. I optimize every layer of your site to ensure it ranks high and converts.",
      bestFor: "Best for businesses that want better search visibility, stronger content structure, and measurable traffic growth.",
      outcome: "You get a stronger foundation for ranking, reach, and long-term inbound growth.",
      cta: "Improve My SEO",
      features: [
        "Technical SEO Audits",
        "Search Engine Visibility",
        "Core Web Vitals Optimization",
        "Content & Growth Strategy",
        "Analytics & Performance Tracking"
      ],
      icon: (
        <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
      )
    },
    {
      id: "06",
      title: "Social Media Management",
      desc: "I will help build your brand's voice and engage your audience where they are. From content curation to strategic community management and analytics, I'll ensure your social presence drives real business growth.",
      bestFor: "Best for brands that want stronger content consistency and audience engagement.",
      outcome: "You get a more structured social presence designed to support awareness and growth.",
      cta: "Join Waitlist",
      features: [
        "Content Strategy & Creation",
        "Community Management",
        "Analytics & Campaign Tracking",
        "Brand Voice Development",
        "Audience Growth Tactics"
      ],
      isComingSoon: true,
      icon: (
        <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background text-black dark:text-white pt-32 pb-24 px-6 md:px-12 font-body selection:bg-accent selection:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduce ? 0 : 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <p className="uppercase tracking-widest text-sm text-gray-700 dark:text-gray-300 mb-4 font-bold">What I Do</p>
          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-8 tracking-tight text-black dark:text-white">
            My <span className="text-accent">Services</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200 font-light leading-relaxed opacity-95">
            I offer comprehensive technical solutions tailored to your business needs. 
            From interactive user interfaces to complex backend architectures, I build software that performs.
          </p>
        </motion.div>

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
              className="bg-white dark:bg-[#151515] border border-gray-200 dark:border-white/5 px-5 py-4 text-sm font-medium text-gray-800 dark:text-gray-200 shadow-sm"
            >
              {audience}
            </motion.div>
          ))}
        </motion.div>

        {/* Services List */}
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          className="space-y-16 md:space-y-24"
        >
          {services.map((service, index) => (
            <motion.div 
              key={service.id}
              variants={item}
              className={`flex flex-col ${index % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-16 items-center`}
            >
              {/* Left/Right Text Content */}
              <div className="w-full md:w-1/2 space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-5xl font-heading font-bold text-gray-200 dark:text-white/10">{service.id}</span>
                  {service.icon}
                </div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-black dark:text-white flex items-center flex-wrap gap-4">
                  {service.title}
                  {service.isComingSoon && (
                    <span className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-[10px] md:text-xs font-bold px-3 py-1 uppercase rounded-full tracking-wider mt-1 md:mt-0">
                      Launching Soon
                    </span>
                  )}
                </h2>
                <p className="inline-flex items-center bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-2 text-xs uppercase tracking-widest text-gray-700 dark:text-gray-300 font-bold">
                  {service.bestFor}
                </p>
                <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed font-light opacity-95">
                  {service.desc}
                </p>
                <p className="text-base text-black dark:text-white font-medium leading-relaxed">
                  {service.outcome}
                </p>
                
                <div className="pt-6 border-t border-gray-200 dark:border-white/10">
                  <h4 className="text-sm font-bold uppercase tracking-widest mb-4 text-black dark:text-white">Key Features:</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start text-gray-800 dark:text-gray-200 text-sm">
                        <span className="text-accent mr-2 mt-1">●</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {service.isComingSoon ? (
                  <motion.div
                    whileHover={shouldReduce ? {} : buttonHover}
                    whileTap={shouldReduce ? {} : buttonTap}
                  >
                    <Link
                      to="/contact"
                      className="inline-flex items-center justify-center border border-gray-300 dark:border-white/10 bg-white dark:bg-transparent text-black dark:text-white font-bold px-6 py-3 text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-colors"
                    >
                      {service.cta}
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={shouldReduce ? {} : buttonHover}
                    whileTap={shouldReduce ? {} : buttonTap}
                  >
                    <Link
                      to="/contact"
                      className="inline-flex items-center justify-center bg-black text-white dark:bg-white dark:text-black font-bold px-6 py-3 text-xs uppercase tracking-widest hover:bg-accent hover:text-white transition-colors"
                    >
                      {service.cta}
                    </Link>
                  </motion.div>
                )}
              </div>

              {/* Service Summary Panel */}
              <motion.div 
                whileHover={shouldReduce ? {} : cardHover}
                transition={cardHoverTransition}
                className="w-full md:w-1/2 h-auto bg-white dark:bg-[#151515] border border-gray-200 dark:border-white/5 rounded-2xl p-8 relative overflow-hidden group shadow-lg flex items-center justify-center"
              >
                 <div className="absolute inset-0 opacity-10 dark:opacity-20 flex items-center justify-center pointer-events-none">
                   <div className="w-64 h-64 border-4 border-accent rounded-full absolute -top-10 -right-10 group-hover:scale-110 transition-transform duration-700"></div>
                   <div className="w-48 h-48 border border-black dark:border-white rounded-full absolute bottom-10 left-10 group-hover:-translate-x-4 transition-transform duration-700"></div>
                 </div>
                 
                 <div className="relative z-10 w-full max-w-md">
                    <div className="w-20 h-20 bg-accent rounded-full mb-6 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                      <span className="text-white font-heading font-bold text-2xl">{service.id}</span>
                    </div>
                    <h3 className="text-2xl font-heading font-bold text-black dark:text-white group-hover:text-accent transition-colors mb-5">
                      {service.title}
                    </h3>
                    <div className="space-y-4">
                      <div className="border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 p-4">
                        <p className="text-xs uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2 font-bold">Best For</p>
                        <p className="text-sm text-gray-800 dark:text-gray-200">{service.bestFor}</p>
                      </div>
                      <div className="border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 p-4">
                        <p className="text-xs uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-2 font-bold">Expected Outcome</p>
                        <p className="text-sm text-gray-800 dark:text-gray-200">{service.outcome}</p>
                      </div>
                      <div className="border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 p-4">
                        <p className="text-xs uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-3 font-bold">Common Deliverables</p>
                        <ul className="space-y-2">
                          {service.features.slice(0, 3).map((feature) => (
                            <li key={feature} className="flex items-start gap-2 text-sm text-gray-800 dark:text-gray-200">
                              <span className="text-accent mt-1">●</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                 </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-28">
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={sectionViewport}
          transition={{ duration: shouldReduce ? 0 : 0.6 }}
          className="mb-20"
        >
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="uppercase tracking-widest text-sm text-gray-700 dark:text-gray-300 mb-4 font-bold">Process</p>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-black dark:text-white mb-6">
              How I <span className="text-accent">Work</span>
            </h2>
            <p className="text-lg text-gray-800 dark:text-gray-200 font-light leading-relaxed opacity-95">
              Every project follows a clear structure so you always know what happens next, what is being built, and how we move from idea to launch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, index) => (
              <div
                key={step.title}
                className="bg-white dark:bg-[#151515] border border-gray-200 dark:border-white/5 rounded-2xl p-8 shadow-sm"
              >
                <div className="w-12 h-12 bg-accent text-white font-heading font-bold text-lg flex items-center justify-center rounded-full mb-5">
                  0{index + 1}
                </div>
                <h3 className="text-2xl font-heading font-bold text-black dark:text-white mb-3">{step.title}</h3>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed opacity-95">{step.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={sectionViewport}
          transition={{ duration: shouldReduce ? 0 : 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20"
        >
          {trustItems.map((trustItem) => (
            <div
              key={trustItem}
              className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-5 py-4 text-center text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300"
            >
              {trustItem}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Pricing Section - Full Width */}
      <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent" /></div>}>
        <Pricing />
      </Suspense>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* CTA Section */}
        <motion.div 
          initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={sectionViewport}
          transition={{ duration: shouldReduce ? 0 : 0.6 }}
          className="mt-32 text-center bg-white dark:bg-[#151515] border border-gray-200 dark:border-white/5 rounded-[2rem] p-12 md:p-20 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-black dark:text-white mb-6">
            Ready to start your project?
          </h2>
          <p className="text-gray-800 dark:text-gray-200 text-lg max-w-2xl mx-auto mb-10 font-light opacity-95">
            Whether you need a full-stack application built from the ground up or just a specialized backend API, I'm here to help turn your ideas into reality.
          </p>
          <motion.div
            whileHover={shouldReduce ? {} : buttonHover}
            whileTap={shouldReduce ? {} : buttonTap}
            className="inline-block"
          >
            <Link to="/contact" className="inline-flex items-center justify-center bg-accent text-white font-bold px-10 py-4 text-sm uppercase tracking-widest hover:bg-[#d43d1a] transition-colors rounded-sm">
              Get in touch
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ServicesPage;
