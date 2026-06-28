import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, fadeUpItem, cardHover, cardHoverTransition, buttonHover, buttonTap, sectionViewport, reducedMotionVariants } from '../utils/motion';
import { CONTACT } from '../config/contact';

const AboutPage = () => {
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  useEffect(() => {
    window.scrollTo(0, 0);
    // SEO Best Practices
    document.title = "About | Eugene Odibenuah - Full-Stack Developer";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Learn more about Eugene Odibenuah, a Nigerian-based full-stack developer with expertise in React, Node.js, and building scalable business solutions.");
    }
  }, []);

  const quickFacts = [
    "4 Years of experience",
    "Based in Lagos, Nigeria",
    "Available for remote work worldwide",
    "4 months free maintenance after launch"
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background text-black dark:text-white pt-32 pb-24 px-6 md:px-12 font-body selection:bg-accent selection:text-white transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Title */}
        <motion.div 
          initial={shouldReduce ? {} : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: shouldReduce ? 0 : 0.5 }}
          className="flex items-center justify-center gap-4 mb-16 text-black dark:text-white"
        >
          <svg className="w-8 h-8 text-gray-400 dark:text-white/50" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/></svg>
          <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight uppercase">
            ABOUT ME 
          </h1>
          <svg className="w-8 h-8 text-gray-400 dark:text-white/50" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/></svg>
        </motion.div>

        {/* Bento Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          {/* Row 1: Left Image Card */}
          <motion.div 
            variants={item} 
            whileHover={shouldReduce ? {} : cardHover}
            transition={cardHoverTransition}
            className="md:col-span-4 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-6 rounded-[2rem] border border-gray-200 dark:border-white/5 flex items-center justify-center shadow-xl"
          >
            <div className="relative w-full aspect-square overflow-hidden rounded-3xl bg-accent">
              <img 
                src="https://images.unsplash.com/photo-1547394765-185e1e68f34e?q=80&w=2070&auto=format&fit=crop" 
                alt="Eugene Setup" 
                className="w-full h-full object-cover opacity-90 mix-blend-overlay"
              />
            </div>
          </motion.div>

          {/* Row 1: Right Info Card */}
          <motion.div 
            variants={item} 
            whileHover={shouldReduce ? {} : cardHover}
            transition={cardHoverTransition}
            className="md:col-span-8 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-10 md:p-12 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl relative overflow-hidden group"
          >
            <svg className="absolute top-10 left-10 w-8 h-8 text-gray-300 dark:text-white/20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/></svg>
            <div className="mt-12">
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">Eugene Odibenuah</h2>
              <p className="text-gray-800 dark:text-gray-200 text-lg leading-[1.8] max-w-2xl font-light opacity-95">
                I am a Nigerian-based full-stack developer who helps founders, brands, and growing businesses turn ideas into fast, scalable digital products. I build websites, platforms, and backend systems that are not only visually strong, but also structured for performance, reliability, and long-term business growth.
              </p>
            </div>
          </motion.div>

          {/* Row 2: Experience Card */}
          <motion.div 
            variants={item} 
            whileHover={shouldReduce ? {} : cardHover}
            transition={cardHoverTransition}
            className="md:col-span-6 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-10 md:p-12 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl"
          >
            <h3 className="text-sm font-bold tracking-widest text-gray-700 dark:text-white/80 uppercase mb-8 font-heading">Experience</h3>
            <div className="space-y-8">
              <div>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-1 font-bold">2021 - Present</p>
                <h4 className="text-xl font-heading font-bold">Full-Stack Developer</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">Freelance / Independent</p>
                <p className="text-gray-800 dark:text-gray-200 text-sm mt-3 leading-relaxed opacity-95">
                  Building custom platforms, business websites, internal tools, and scalable web systems for modern brands and companies.
                </p>
              </div>
              <div>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-1 font-bold">2019 - 2021</p>
                <h4 className="text-xl font-heading font-bold">Frontend Engineer</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-1 font-bold">Tech Agency</p>
                <p className="text-gray-800 dark:text-gray-200 text-sm mt-3 leading-relaxed opacity-95">
                  Focused on responsive interfaces, polished user experience, and converting design ideas into production-ready frontend systems.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Row 2: Education Card */}
          <motion.div 
            variants={item} 
            whileHover={shouldReduce ? {} : cardHover}
            transition={cardHoverTransition}
            className="md:col-span-6 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-10 md:p-12 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl"
          >
            <h3 className="text-sm font-bold tracking-widest text-gray-700 dark:text-white/80 uppercase mb-8 font-heading">Education</h3>
            <div className="space-y-8">
              <div>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-1 font-bold">2017 - 2021</p>
                <h4 className="text-xl font-heading font-bold">Bachelor Degree in Computer Science</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">University of Lagos</p>
                <p className="text-gray-800 dark:text-gray-200 text-sm mt-3 leading-relaxed opacity-95">
                  Built a strong foundation in software engineering, systems thinking, problem solving, and core computing principles.
                </p>
              </div>
              <div>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-1 font-bold">2021 - 2022</p>
                <h4 className="text-xl font-heading font-bold">Advanced Web Development</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">Tech Institute</p>
                <p className="text-gray-800 dark:text-gray-200 text-sm mt-3 leading-relaxed opacity-95">
                  Deepened practical skills across frontend architecture, backend development, deployment, and modern product delivery.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Row 3: Connect Card */}
          <motion.div 
            variants={item} 
            whileHover={shouldReduce ? {} : cardHover}
            transition={cardHoverTransition}
            className="md:col-span-3 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-8 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl flex flex-col justify-between group hover:border-accent dark:hover:border-white/20 transition-colors"
          >
            <div className="space-y-4 mb-8">
              <div className="bg-gray-50 dark:bg-[#151515] p-4 rounded-2xl border border-gray-200 dark:border-white/5">
                <p className="text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2 font-bold">Email</p>
                <a href={`mailto:${CONTACT.email}`} className="text-sm text-black dark:text-white hover:text-accent transition-colors break-all">
                  {CONTACT.email}
                </a>
              </div>
              <div className="bg-gray-50 dark:bg-[#151515] p-4 rounded-2xl border border-gray-200 dark:border-white/5">
                <p className="text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2 font-bold">Phone</p>
                <a href={`tel:${CONTACT.phoneDisplay}`} className="text-sm text-black dark:text-white hover:text-accent transition-colors">
                  {CONTACT.phoneDisplay}
                </a>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1 font-bold">Let’s connect</p>
                <h4 className="text-xl font-heading font-bold">Contact Info</h4>
              </div>
              <motion.div
                whileHover={shouldReduce ? {} : buttonHover}
                whileTap={shouldReduce ? {} : buttonTap}
              >
                <Link to="/contact" className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Row 3: Work Together Card */}
          <motion.div 
            variants={item} 
            whileHover={shouldReduce ? {} : cardHover}
            transition={cardHoverTransition}
            className="md:col-span-6 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-8 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl flex flex-col justify-between group cursor-pointer hover:border-accent dark:hover:border-white/20 transition-colors relative overflow-hidden"
          >
            <svg className="absolute top-8 left-8 w-8 h-8 text-gray-300 dark:text-white/20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/></svg>
            <div className="mt-12 mb-4">
              <h2 className="text-4xl md:text-5xl font-heading font-bold">
                Let's <br/>work <span className="text-accent">together.</span>
              </h2>
              <p className="text-gray-800 dark:text-gray-200 text-base md:text-lg leading-relaxed font-light mt-5 max-w-md opacity-95">
                If you need a modern website, a scalable business platform, or a reliable technical partner for your next build, I can help you move from idea to launch with clarity.
              </p>
            </div>
            <motion.div
              whileHover={shouldReduce ? {} : buttonHover}
              whileTap={shouldReduce ? {} : buttonTap}
              className="absolute bottom-8 right-8"
            >
              <Link to="/contact" className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </Link>
            </motion.div>
          </motion.div>

          {/* Row 3: Quick Facts Card */}
          <motion.div 
            variants={item} 
            whileHover={shouldReduce ? {} : cardHover}
            transition={cardHoverTransition}
            className="md:col-span-3 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-8 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl flex flex-col justify-between group hover:border-accent dark:hover:border-white/20 transition-colors"
          >
            <div className="mb-8 bg-gray-50 dark:bg-[#151515] w-full p-6 rounded-2xl border border-gray-200 dark:border-white/5">
              <p className="text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-4 font-bold">Quick Facts</p>
              <ul className="space-y-3">
                {quickFacts.map((fact) => (
                  <li key={fact} className="flex items-start gap-2 text-sm text-black dark:text-white">
                    <span className="text-accent mt-1">●</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1 font-bold">Working style</p>
                <h4 className="text-xl font-heading font-bold">Availability</h4>
              </div>
              <motion.div
                whileHover={shouldReduce ? {} : buttonHover}
                whileTap={shouldReduce ? {} : buttonTap}
              >
                <Link to="/contact" className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </Link>
              </motion.div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
