import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, fadeUpItem, sectionViewport, reducedMotionVariants } from '../utils/motion';

const reasons = [
  {
    title: 'Production-Ready Engineering',
    description: 'Clean architecture, secure data handling, responsive interfaces, and maintainable systems built for real-world business workflows.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
    )
  },
  {
    title: 'Business-Focused Solutions',
    description: 'Every project starts with your goals, not a template. I scope, design, and build software that solves the actual problem.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
    )
  },
  {
    title: 'Fast, Transparent Delivery',
    description: "A clear four-step process with real-time progress tracking. You always know what's happening and when it ships.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
    )
  },
  {
    title: 'Premium User Experience',
    description: 'Beautiful, user-centric interfaces that feel polished on every device, designed to build trust and drive conversions.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
    )
  }
];

const WhyChoose = () => {
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  return (
    <section id="why-choose" className="px-6 md:px-12 max-w-7xl mx-auto py-20 bg-gray-50 dark:bg-[#0f0f0f] border-t border-b border-gray-200 dark:border-white/5 transition-colors duration-300">
      <motion.div
        className="text-center mb-12"
        initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionViewport}
        transition={{ duration: shouldReduce ? 0 : 0.5, ease: 'easeOut' }}
      >
        <p className="text-xs uppercase tracking-widest text-accent font-bold mb-2">Core Engineering Principles</p>
        <h3 className="text-3xl md:text-4xl font-heading font-bold text-black dark:text-white">Why BuildWithLami</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base font-light mt-3">
          I combine clean engineering, systems architecture, and conversion-focused UX to build software that is practical, fast, and ready for production scale.
        </p>
      </motion.div>

      <motion.div
        className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory scrollbar-none -mx-6 px-6 md:mx-0 md:px-0"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
      >
        {reasons.map((reason, idx) => (
          <motion.div
            key={idx}
            variants={item}
            className="shrink-0 md:shrink w-[82vw] max-w-[320px] sm:w-[290px] md:w-auto min-w-0 snap-center p-6 bg-white dark:bg-[#141414] rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 hover:border-accent/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4">
                {reason.icon}
              </div>
              <h4 className="text-lg font-heading font-bold mb-2 text-gray-900 dark:text-white">{reason.title}</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                {reason.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default WhyChoose;
