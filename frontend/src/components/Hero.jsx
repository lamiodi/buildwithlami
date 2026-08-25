import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { staggerContainer, fadeUpItem, buttonHover, buttonTap, reducedMotionVariants } from '../utils/motion';

const Hero = () => {
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  return (
    <section id="home" className="px-6 md:px-12 max-w-7xl mx-auto pt-10 pb-20 md:pt-16 md:pb-28 flex flex-col md:flex-row items-center justify-between relative">
      <motion.div
        className="w-full md:w-2/3 z-10"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={item} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-accent uppercase tracking-widest text-[11px] font-mono font-bold">
            Digital Product Studio · Design & Engineering
          </span>
        </motion.div>

        <motion.h1 variants={item} className="text-4xl sm:text-6xl md:text-7xl lg:text-[84px] font-heading font-extrabold leading-[1.02] tracking-tight mb-6 text-black dark:text-white">
          I build web apps <br className="hidden sm:block" />
          that <span className="italic font-normal text-accent">grow</span> your <br className="hidden sm:block" />
          revenue.
        </motion.h1>

        <motion.p variants={item} className="text-gray-700 dark:text-gray-300 text-base sm:text-lg md:text-xl max-w-xl leading-relaxed mb-8 font-light">
          From idea to production launch: I design, build, and deploy high-converting websites, e-commerce engines, and custom software for founders and growing businesses.
        </motion.p>

        {/* Reassurance Chips */}
        <motion.div variants={item} className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-10 text-xs text-gray-600 dark:text-gray-400 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>50/50 Milestone Invoicing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Post-Launch Warranty Support</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>100% IP & Code Ownership</span>
          </div>
        </motion.div>

        {/* Button Pair - Exact User-Approved Hero Standard */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center gap-4">
          <motion.div whileHover={shouldReduce ? {} : buttonHover} whileTap={shouldReduce ? {} : buttonTap}>
            <Link
              to="/contact"
              className="bg-accent text-white font-bold uppercase text-[11px] px-10 py-4 tracking-[0.15em] hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all duration-300 inline-block text-center shadow-lg hover:shadow-accent/30 w-full sm:w-auto"
            >
              Start a Project
            </Link>
          </motion.div>
          
          <motion.div whileHover={shouldReduce ? {} : buttonHover} whileTap={shouldReduce ? {} : buttonTap}>
            <Link
              to="/projects"
              className="border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 text-[11px] uppercase tracking-[0.15em] font-bold hover:border-accent hover:text-accent transition-all duration-300 inline-block text-center py-4 px-10 w-full sm:w-auto"
            >
              See My Work
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Founder Image Card */}
      <motion.div
        className="w-full md:w-1/3 mt-12 md:mt-0 flex justify-center md:justify-end relative"
        initial={shouldReduce ? {} : { opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: shouldReduce ? 0 : 0.6, delay: shouldReduce ? 0 : 0.2, ease: 'easeOut' }}
      >
        <div className="w-64 h-80 sm:w-72 sm:h-96 bg-gray-900 rounded-2xl relative overflow-visible shadow-2xl border border-gray-200 dark:border-white/10 p-2">
          <img
            src="/ChatGPT Image Aug 22, 2026, 06_24_14 PM.png"
            alt="Eugene Odibenuah - Founder & Lead Engineer"
            className="w-full h-full object-cover rounded-xl"
            width="1280"
            height="1920"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute -bottom-4 -right-4 bg-white dark:bg-[#141414] text-black dark:text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xl border border-gray-200 dark:border-white/10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Eugene Odibenuah · Lead Engineer</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
