import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Pricing from '../components/Pricing';

const ServicesPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    // SEO Best Practices
    document.title = "Services | BuildWithLami - Premium Web Development & SEO Strategy";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Explore our enterprise-grade services including custom web platforms, high-performance interfaces, secure API systems, technical audits, and data-driven SEO growth strategies.");
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const services = [
    {
      id: "01",
      title: "Custom Web Platforms",
      desc: "Need a complete solution from scratch? I build entire web-based products from the ground up—handling everything from strategy and design to final deployment and scaling. I turn complex ideas into functional, reliable software.",
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
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background text-black dark:text-white pt-32 pb-24 px-6 md:px-12 font-body selection:bg-accent selection:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <p className="uppercase tracking-widest text-sm text-gray-500 dark:text-gray-400 mb-4 font-bold">What I Do</p>
          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-8 tracking-tight text-black dark:text-white">
            My <span className="text-accent">Services</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-light leading-relaxed">
            I offer comprehensive technical solutions tailored to your business needs. 
            From interactive user interfaces to complex backend architectures, I build software that performs.
          </p>
        </motion.div>

        {/* Services List */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-16 md:space-y-24"
        >
          {services.map((service, index) => (
            <motion.div 
              key={service.id}
              variants={itemVariants}
              className={`flex flex-col ${index % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-16 items-center`}
            >
              {/* Left/Right Text Content */}
              <div className="w-full md:w-1/2 space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-5xl font-heading font-bold text-gray-200 dark:text-white/10">{service.id}</span>
                  {service.icon}
                </div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-black dark:text-white">
                  {service.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed font-light">
                  {service.desc}
                </p>
                
                <div className="pt-6 border-t border-gray-200 dark:border-white/10">
                  <h4 className="text-sm font-bold uppercase tracking-widest mb-4 text-black dark:text-white">Key Features:</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start text-gray-600 dark:text-gray-400 text-sm">
                        <span className="text-accent mr-2 mt-1">●</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Decorative Image/Box area */}
              <div className="w-full md:w-1/2 h-80 md:h-[450px] bg-white dark:bg-[#151515] border border-gray-200 dark:border-white/5 rounded-2xl p-8 relative overflow-hidden group shadow-lg flex items-center justify-center">
                 {/* Abstract geometric background to replace an image */}
                 <div className="absolute inset-0 opacity-10 dark:opacity-20 flex items-center justify-center">
                   <div className="w-64 h-64 border-4 border-accent rounded-full absolute -top-10 -right-10 group-hover:scale-110 transition-transform duration-700"></div>
                   <div className="w-48 h-48 border border-black dark:border-white rounded-full absolute bottom-10 left-10 group-hover:-translate-x-4 transition-transform duration-700"></div>
                 </div>
                 
                 <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-accent rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                      <span className="text-white font-heading font-bold text-2xl">{service.id}</span>
                    </div>
                    <h3 className="text-2xl font-heading font-bold text-black dark:text-white group-hover:text-accent transition-colors">{service.title}</h3>
                 </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Pricing Section - Full Width */}
      <Pricing />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-32 text-center bg-white dark:bg-[#151515] border border-gray-200 dark:border-white/5 rounded-[2rem] p-12 md:p-20 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-black dark:text-white mb-6">
            Ready to start your project?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto mb-10 font-light">
            Whether you need a full-stack application built from the ground up or just a specialized backend API, I'm here to help turn your ideas into reality.
          </p>
          <Link to="/contact" className="inline-flex items-center justify-center bg-accent text-white font-bold px-10 py-4 text-sm uppercase tracking-widest hover:bg-[#d43d1a] transition-colors rounded-sm">
            Get in touch
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default ServicesPage;
