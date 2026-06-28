import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SecurityPopup = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 p-8 md:p-10 rounded-2xl max-w-md w-full shadow-2xl z-10"
          >
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-6 text-red-500 border border-red-200 dark:border-red-800/50 shadow-inner">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-2xl font-heading font-bold text-black dark:text-white mb-4">Security Notice</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8 text-sm md:text-base">
              I don't publicly disclose my GitHub repository. Most of my live code and enterprise projects are kept private for strict security and confidentiality reasons.
            </p>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-sm hover:bg-accent dark:hover:bg-accent hover:text-white transition-colors rounded-sm"
            >
              I Understand
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SecurityPopup;
