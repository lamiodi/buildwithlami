import React, { useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeUpItem, sectionViewport, reducedMotionVariants } from '../utils/motion';
import { homeFaqs } from '../data/faqs';

const faqs = homeFaqs;

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  const toggleOpen = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="px-6 md:px-12 max-w-4xl mx-auto py-24">
      <motion.div
        className="text-center mb-16"
        initial={shouldReduce ? {} : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionViewport}
        transition={{ duration: shouldReduce ? 0 : 0.5, ease: 'easeOut' }}
      >
        <div className="bwl-eyebrow mb-3">
          <span className="w-2 h-2 bg-accent inline-block" />
          <span>Frequently Asked Questions</span>
        </div>
        <h3 className="text-3xl md:text-5xl font-heading font-bold mb-4 text-black dark:text-white">Frequently Asked Questions</h3>
        <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg font-light leading-relaxed">
          Everything you need to know about my engineering services, process, and milestone billing.
        </p>
      </motion.div>

      <motion.div
        className="space-y-4"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
      >
        {faqs.map((faq, idx) => (
          <motion.div
            key={idx}
            variants={item}
            className="bwl-card overflow-hidden"
          >
            <button
              onClick={() => toggleOpen(idx)}
              className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none bg-white dark:bg-[#141414] hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <span className="font-heading font-bold text-gray-900 dark:text-white text-base md:text-lg">{faq.q}</span>
              <svg
                className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${openIndex === idx ? 'rotate-180 text-accent' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <AnimatePresence>
              {openIndex === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="bg-white dark:bg-[#141414]"
                >
                  <div className="px-6 pb-6 pt-2 text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed font-light whitespace-pre-line border-t border-gray-100 dark:border-white/5">
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default FAQ;
