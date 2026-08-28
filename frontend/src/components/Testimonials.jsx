import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { sectionViewport } from '../utils/motion';
import { TestimonialsSplit, DEFAULT_TESTIMONIALS } from './ui/split-testimonial';

const Testimonials = () => {
  const shouldReduce = useReducedMotion();

  // Don't render the section at all until real, consented testimonials exist.
  if (!DEFAULT_TESTIMONIALS || DEFAULT_TESTIMONIALS.length === 0) return null;

  return (
    <section id="testimonials" className="px-6 md:px-12 max-w-7xl mx-auto py-24 bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      <motion.div
        className="text-center mb-16"
        initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionViewport}
        transition={{ duration: shouldReduce ? 0 : 0.5, ease: 'easeOut' }}
      >
        <div className="bwl-eyebrow mb-3 justify-center">
          <span className="w-2 h-2 bg-accent inline-block" />
          <span>Verified Client Reviews</span>
        </div>
        <h3 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 dark:text-white tracking-tight">
          Client Success Stories
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base font-light mt-3 leading-relaxed">
          Real feedback from founders and engineering leaders on delivery speed, communication, and software reliability.
        </p>
      </motion.div>

      <TestimonialsSplit />
    </section>
  );
};

export default Testimonials;
