import React, { useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeUpItem, sectionViewport, reducedMotionVariants } from '../utils/motion';

const faqs = [
  {
    question: "What is your typical project timeline?",
    answer: "Most web applications take between 6 to 12 weeks from kickoff to launch. Simple corporate websites might take 3-4 weeks, while complex enterprise platforms could require 4-6 months. We provide a detailed timeline during the proposal phase."
  },
  {
    question: "Do you offer post-launch support and maintenance?",
    answer: "Yes, we offer ongoing maintenance and support packages to ensure your application remains secure, up-to-date, and performs optimally as your user base grows."
  },
  {
    question: "How do you handle SEO?",
    answer: "SEO is built into our process from day one. We ensure proper semantic HTML, optimized performance (Core Web Vitals), metadata management, and accessible architecture so search engines can easily crawl and index your content."
  },
  {
    question: "What technologies do you use?",
    answer: "We specialize in the modern web stack: React/Next.js for the frontend, Node.js/Express for the backend, and PostgreSQL for the database. We also utilize Tailwind CSS, Framer Motion, and various cloud services like Supabase and AWS."
  },
  {
    question: "Can you help redesign an existing website?",
    answer: "Absolutely. We often help clients modernize their legacy applications or websites, migrating them to newer, faster, and more secure technology stacks while improving the overall UX/UI."
  },
  {
    question: "What are your payment terms?",
    answer: "Typically, we structure payments: 60% upfront to secure a spot in our schedule and begin work, and 40% prior to final launch and handover."
  }
];

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
        <h3 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-black dark:text-white">Frequently Asked Questions</h3>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Everything you need to know about our services, process, and billing.
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
            className="border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden"
          >
            <button
              onClick={() => toggleOpen(idx)}
              className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="font-bold text-gray-900 dark:text-white">{faq.question}</span>
              <svg
                className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`}
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
                  className="bg-white dark:bg-gray-800"
                >
                  <div className="px-6 pb-4 pt-0 text-gray-600 dark:text-gray-400">
                    {faq.answer}
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
