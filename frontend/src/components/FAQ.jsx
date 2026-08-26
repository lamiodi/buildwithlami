import React, { useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeUpItem, sectionViewport, reducedMotionVariants } from '../utils/motion';

const faqs = [
  {
    question: "What is your typical project timeline?",
    answer: "My delivery timeline depends on the project's size and complexity:\n\nLanding Pages: 1–2 weeks\nBusiness Websites: 2–6 weeks\nE-commerce Websites: 4–8 weeks\nCustom Web Applications: 6–12 weeks\nEnterprise Platforms & SaaS: 3–6 months\n\nAfter a discovery session, I'll provide a tailored project schedule with key milestones, review stages, and an estimated launch date."
  },
  {
    question: "Do you offer post-launch support and maintenance?",
    answer: "Yes, I offer ongoing maintenance and support packages to ensure your application remains secure, up-to-date, and performs optimally as your user base grows."
  },
  {
    question: "How do you handle SEO?",
    answer: "SEO is built into my process from day one. I ensure proper semantic HTML, optimized performance (Core Web Vitals), metadata management, and accessible architecture so search engines can easily crawl and index your content."
  },
  {
    question: "What technologies do you use?",
    answer: "I specialize in the modern web stack: React/Next.js for the frontend, Node.js/Express for the backend, and PostgreSQL for the database. I also utilize Tailwind CSS, Framer Motion, and various cloud services like Supabase and AWS."
  },
  {
    question: "Can you help redesign an existing website?",
    answer: "Absolutely. I often help clients modernize their legacy applications or websites, migrating them to newer, faster, and more secure technology stacks while improving the overall UX/UI."
  },
  {
    question: "What are your payment terms?",
    answer: "Typically, I structure payments: 50% upfront to secure a spot in the schedule and begin architecture & development, and the remaining 50% upon final delivery, testing, and project handover."
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
              <span className="font-heading font-bold text-gray-900 dark:text-white text-base md:text-lg">{faq.question}</span>
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
