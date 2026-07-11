import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, fadeUpItem, sectionViewport, reducedMotionVariants } from '../utils/motion';

const reasons = [
  {
    title: 'Enterprise-Grade Quality',
    description: 'We build scalable, robust systems designed to handle high traffic and complex business logic.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
    )
  },
  {
    title: 'Data-Driven SEO',
    description: 'Every project is optimized for maximum organic reach and conversion rates right from the start.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
    )
  },
  {
    title: 'Rapid Delivery',
    description: 'Agile methodologies and modern stacks allow us to ship features quickly without sacrificing quality.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
    )
  },
  {
    title: 'Premium Design',
    description: 'Beautiful, user-centric interfaces that provide exceptional user experiences and build brand trust.',
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
    <section id="why-choose" className="px-6 md:px-12 max-w-7xl mx-auto py-24 bg-gray-50 dark:bg-gray-900 border-t border-b border-gray-200 dark:border-gray-800">
      <motion.div
        className="text-center mb-16"
        initial={shouldReduce ? {} : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionViewport}
        transition={{ duration: shouldReduce ? 0 : 0.5, ease: 'easeOut' }}
      >
        <h3 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-black dark:text-white">Why Choose Us</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
          We bring technical excellence, strategic thinking, and creative vision to every project.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
      >
        {reasons.map((reason, idx) => (
          <motion.div
            key={idx}
            variants={item}
            className="p-6 bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="text-accent mb-4">
              {reason.icon}
            </div>
            <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{reason.title}</h4>
            <p className="text-gray-600 dark:text-gray-400">
              {reason.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default WhyChoose;
