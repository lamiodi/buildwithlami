import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, fadeUpItem, sectionViewport, reducedMotionVariants } from '../utils/motion';

const products = [
  {
    title: 'LamiFlow',
    description: 'Automate your business workflows and approvals with our intuitive drag-and-drop builder.',
    status: 'Beta'
  },
  {
    title: 'LamiMetrics',
    description: 'Real-time analytics and reporting dashboards for data-driven teams.',
    status: 'Coming Soon'
  },
  {
    title: 'LamiSync',
    description: 'Seamless API integration platform to connect all your enterprise tools.',
    status: 'Coming Soon'
  }
];

const SaaSProducts = () => {
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  return (
    <section id="saas" className="px-6 md:px-12 max-w-7xl mx-auto py-24">
      <motion.div
        className="mb-16"
        initial={shouldReduce ? {} : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionViewport}
        transition={{ duration: shouldReduce ? 0 : 0.5, ease: 'easeOut' }}
      >
        <h3 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-black dark:text-white">Our SaaS Products</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-lg">
          Discover our suite of proprietary tools designed to accelerate your business growth and operational efficiency.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
      >
        {products.map((product, idx) => (
          <motion.div
            key={idx}
            variants={item}
            className="group relative p-8 bg-gray-50 dark:bg-gray-800 rounded-sm overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              <span className={`text-xs font-bold px-2 py-1 uppercase tracking-wider ${
                product.status === 'Beta' ? 'bg-accent text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}>
                {product.status}
              </span>
            </div>
            <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white mt-4">{product.title}</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {product.description}
            </p>
            <div className="inline-flex items-center text-accent font-bold group-hover:underline cursor-pointer">
              Learn More
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default SaaSProducts;
