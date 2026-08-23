import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, fadeUpItem, sectionViewport, reducedMotionVariants } from '../utils/motion';
import { Link } from 'react-router-dom';

const products = [
  {
    name: 'NaijaPay Compliance Pro',
    description: 'Automated Nigerian payroll and statutory compliance engine for SMEs. Handle PAYE, PenCom, and NHF seamlessly.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    ),
    status: 'In Development',
    link: '/software#estimator'
  },
  {
    name: 'School ERP v1.1',
    description: 'High-performance, frictionless school management system tailored for the Nigerian market with 1-click attendance.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg>
    ),
    status: 'Live',
    link: '/software#estimator'
  },
  {
    name: 'Clinical Health ERP',
    description: 'Fast, secure clinical management software for high-volume environments, ensuring rapid patient intake and records.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
    ),
    status: 'Beta',
    link: '/software#estimator'
  }
];

const SaaSProducts = () => {
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  return (
    <section id="saas" className="px-6 md:px-12 max-w-7xl mx-auto py-24 bg-gray-50 dark:bg-[#07090E] border-t border-gray-200 dark:border-white/10 transition-colors duration-300">
      <motion.div
        className="text-center mb-16"
        initial={shouldReduce ? {} : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionViewport}
        transition={{ duration: shouldReduce ? 0 : 0.5, ease: 'easeOut' }}
      >
        <span className="text-[#0079FF] dark:text-[#389BFF] font-bold tracking-widest uppercase text-xs mb-2 block">Proprietary Software Systems</span>
        <h3 className="text-3xl md:text-5xl font-heading font-extrabold mb-4 text-black dark:text-white tracking-tight">SaaS Products & Ventures</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-base leading-relaxed">
          Beyond bespoke client engineering, I build, operate, and maintain focused SaaS architectures solving high-impact operational problems.
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
            className="group p-8 bg-white dark:bg-[#0E131F] rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 hover:shadow-xl hover:border-[#0079FF]/50 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-[#0079FF]/10 text-[#0079FF] dark:text-[#389BFF] rounded-xl border border-[#0079FF]/20">
                  {product.icon}
                </div>
                <span className={`px-3 py-1 text-[10px] uppercase tracking-widest font-extrabold rounded-full border ${
                  product.status === 'Live' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-500/20' :
                  product.status === 'Beta' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-500/20' :
                  'bg-[#0079FF]/10 text-[#0079FF] dark:bg-[#0079FF]/20 dark:text-[#389BFF] border-[#0079FF]/30'
                }`}>
                  {product.status}
                </span>
              </div>
              
              <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white font-heading group-hover:text-[#0079FF] dark:group-hover:text-[#389BFF] transition-colors">{product.name}</h4>
              <p className="text-gray-600 dark:text-gray-400 font-body text-xs leading-relaxed mb-8">
                {product.description}
              </p>
            </div>
            
            <Link 
              to={product.link}
              className="mt-auto flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0079FF] dark:text-[#389BFF] hover:text-[#0066D6] dark:hover:text-blue-300 transition-colors"
            >
              Explore Architecture
              <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default SaaSProducts;
