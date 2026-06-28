import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, fadeUpItem, cardHover, cardHoverTransition, buttonHover, buttonTap, reducedMotionVariants } from '../utils/motion';

const NotFoundPage = () => {
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  useEffect(() => {
    document.title = "404 — Page Not Found | BuildWithLami";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background text-black dark:text-white pt-32 pb-24 px-6 md:px-12 font-body selection:bg-accent selection:text-white transition-colors duration-300">
      <div className="max-w-6xl mx-auto">

        {/* Title — matches AboutPage header style */}
        <motion.div 
          initial={shouldReduce ? {} : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: shouldReduce ? 0 : 0.5 }}
          className="flex items-center justify-center gap-4 mb-16 text-black dark:text-white"
        >
          <svg className="w-8 h-8 text-gray-400 dark:text-white/50" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/></svg>
          <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight uppercase">
            PAGE NOT FOUND
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
          {/* Left: Big 404 */}
          <motion.div 
            variants={item} 
            whileHover={shouldReduce ? {} : cardHover}
            transition={cardHoverTransition}
            className="md:col-span-5 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-6 rounded-[2rem] border border-gray-200 dark:border-white/5 flex items-center justify-center shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-6 left-6">
              <svg className="w-6 h-6 text-gray-300 dark:text-white/20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/></svg>
            </div>
            <div className="absolute bottom-6 right-6">
              <svg className="w-6 h-6 text-gray-300 dark:text-white/20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/></svg>
            </div>
            <span className="text-[10rem] md:text-[14rem] font-heading font-bold leading-none tracking-tighter text-accent select-none group-hover:scale-105 transition-transform duration-500">
              404
            </span>
          </motion.div>

          {/* Right: Message + Actions */}
          <motion.div 
            variants={item} 
            whileHover={shouldReduce ? {} : cardHover}
            transition={cardHoverTransition}
            className="md:col-span-7 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-10 md:p-12 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl relative overflow-hidden group flex flex-col justify-between"
          >
            <svg className="absolute top-10 left-10 w-8 h-8 text-gray-300 dark:text-white/20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/></svg>
            <div className="mt-12">
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                Lost in the <span className="text-accent">void.</span>
              </h2>
              <p className="text-gray-800 dark:text-gray-200 text-lg leading-[1.8] max-w-xl font-light opacity-95">
                The page you're looking for doesn't exist, has been moved, or may have been removed. 
                Let me help you find your way back.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-10">
              <motion.div
                whileHover={shouldReduce ? {} : buttonHover}
                whileTap={shouldReduce ? {} : buttonTap}
              >
                <Link
                  to="/"
                  className="inline-flex items-center justify-center bg-black text-white dark:bg-white dark:text-black font-bold px-7 py-3.5 text-xs uppercase tracking-widest hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white transition-colors rounded-sm"
                >
                  Back to Home
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </Link>
              </motion.div>
              <motion.div
                whileHover={shouldReduce ? {} : buttonHover}
                whileTap={shouldReduce ? {} : buttonTap}
              >
                <Link
                  to="/projects"
                  className="inline-flex items-center justify-center border border-gray-300 dark:border-white/10 bg-white dark:bg-transparent text-black dark:text-white font-bold px-7 py-3.5 text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-colors rounded-sm"
                >
                  View Projects
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Bottom Row: Quick Links */}
          <motion.div 
            variants={item} 
            whileHover={shouldReduce ? {} : cardHover}
            transition={cardHoverTransition}
            className="md:col-span-4 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-8 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl flex flex-col justify-between group hover:border-accent dark:hover:border-white/20 transition-colors"
          >
            <div className="bg-gray-50 dark:bg-[#151515] w-full p-6 rounded-2xl border border-gray-200 dark:border-white/5 mb-6">
              <p className="text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-4 font-bold">Quick Links</p>
              <ul className="space-y-3">
                {[
                  { label: "Home", to: "/" },
                  { label: "Projects", to: "/projects" },
                  { label: "Services", to: "/services" },
                  { label: "Contact", to: "/contact" }
                ].map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="flex items-center gap-2 text-sm text-black dark:text-white hover:text-accent transition-colors font-medium">
                      <span className="text-accent">●</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1 font-bold">Navigate</p>
                <h4 className="text-xl font-heading font-bold">Site Map</h4>
              </div>
              <motion.div
                whileHover={shouldReduce ? {} : buttonHover}
                whileTap={shouldReduce ? {} : buttonTap}
              >
                <Link to="/" className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Bottom Row: CTA */}
          <motion.div 
            variants={item} 
            whileHover={shouldReduce ? {} : cardHover}
            transition={cardHoverTransition}
            className="md:col-span-8 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-8 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl flex flex-col justify-between group cursor-pointer hover:border-accent dark:hover:border-white/20 transition-colors relative overflow-hidden"
          >
            <svg className="absolute top-8 left-8 w-8 h-8 text-gray-300 dark:text-white/20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/></svg>
            <div className="mt-12 mb-4">
              <h2 className="text-4xl md:text-5xl font-heading font-bold">
                Need <br/>something <span className="text-accent">built?</span>
              </h2>
              <p className="text-gray-800 dark:text-gray-200 text-base md:text-lg leading-relaxed font-light mt-5 max-w-md opacity-95">
                If you were looking for a specific project or wanted to discuss a new one, 
                reach out and let's make it happen.
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

        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
