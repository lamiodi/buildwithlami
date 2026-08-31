import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { staggerContainer, fadeUpItem, buttonHover, buttonTap, reducedMotionVariants } from '../utils/motion';

const Hero = () => {
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;
  const navigate = useNavigate();

  return (
    <section id="home" className="px-6 md:px-12 max-w-7xl mx-auto pt-10 pb-20 md:pt-16 md:pb-28 flex flex-col md:flex-row items-center justify-between relative">
      <motion.div
      className="w-full md:w-2/3 z-10"
      variants={container}
      initial="hidden"
      animate="visible"
    >
        <motion.div variants={item} className="bwl-eyebrow mb-6">
          <span className="w-2 h-2 bg-accent inline-block" />
          <span>Software Studio · Web, Commerce & Custom Platforms</span>
        </motion.div>

        <motion.h1
          variants={{
            hidden: { opacity: 1, y: 0 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.0001 } },
          }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-[80px] font-heading font-extrabold leading-[1.05] tracking-tight mb-6 text-black dark:text-white"
        >
          I design, build, <br className="hidden sm:block" />
          and ship products <br className="hidden sm:block" />
          that <span className="italic font-normal text-accent">grow</span> revenue.
        </motion.h1>

        <motion.p variants={item} className="text-gray-700 dark:text-gray-300 text-base sm:text-lg md:text-xl max-w-xl leading-relaxed mb-8 font-light">
          From idea to production launch, I design, build, and deploy websites, e-commerce stores, business portals, and custom software for founders, operators, and growing teams.
        </motion.p>

        {/* Reassurance Chips */}
        <motion.div
          variants={{
            hidden: { opacity: 1, y: 0 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.0001 } },
          }}
          className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-10 text-xs text-gray-600 dark:text-gray-400 font-medium"
        >
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

        {/* Button Pair - Exact Architectural Standard */}
        <motion.div
          variants={{
            hidden: { opacity: 1, y: 0 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.0001 } },
          }}
          className="flex flex-col sm:flex-row sm:items-center gap-4 relative z-10"
        >
          <Link
            to="/contact"
            className="btn-primary w-full sm:w-auto"
            style={{ touchAction: 'manipulation' }}
          >
            Start a Project
          </Link>
          <Link
            to="/projects"
            className="btn-secondary w-full sm:w-auto"
            style={{ touchAction: 'manipulation' }}
          >
            See My Work
          </Link>
        </motion.div>
      </motion.div>
      
      {/* Founder Image Card */}
      <motion.div
        className="w-full md:w-1/3 mt-12 md:mt-0 flex justify-center md:justify-end relative"
        initial={shouldReduce ? {} : { opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: shouldReduce ? 0 : 0.6, delay: shouldReduce ? 0 : 0.2, ease: 'easeOut' }}
      >
        <div className="w-64 h-80 sm:w-72 sm:h-96 bg-gray-900 rounded-2xl relative overflow-visible shadow-2xl border border-gray-200 dark:border-white/10 p-2 shrink-0">
          <picture>
            <source
              type="image/webp"
              srcSet="/eugene-hero-400.webp 400w, /eugene-hero.webp 800w"
              sizes="(max-width: 640px) 256px, 288px"
            />
            <img
              src="/eugene-hero.webp"
              alt="Eugene Odibenuah - Founder & Lead Engineer"
              className="w-full h-full object-cover rounded-xl"
              width="800"
              height="1200"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
          <div className="absolute -bottom-3.5 sm:-bottom-4 -right-2 sm:-right-4 bg-white dark:bg-[#141414] text-black dark:text-white text-[11px] sm:text-xs font-mono font-bold px-3 sm:px-4 py-1.5 sm:py-2 shadow-2xl border border-gray-200 dark:border-white/10 flex items-center gap-2 whitespace-nowrap select-none z-10 rounded-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Eugene Odibenuah · Lead Engineer</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
