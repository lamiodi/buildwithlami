import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import SecurityPopup from '../components/SecurityPopup';
import { api } from '../services/api';
import { buttonHover, buttonTap, reducedMotionVariants } from '../utils/motion';
import { CONTACT } from '../config/contact';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [emailError, setEmailError] = useState(false);
  const [isEmailDirty, setIsEmailDirty] = useState(false);
  const [showSecurityPopup, setShowSecurityPopup] = useState(false);
  const shouldReduce = useReducedMotion();

  // Simple Regex for basic email validation
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });
    if (isEmailDirty) {
      setEmailError(!validateEmail(value));
    }
  };

  const handleEmailBlur = () => {
    setIsEmailDirty(true);
    setEmailError(!validateEmail(formData.email));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    // SEO Best Practices
    document.title = "Contact | Eugene Odibenuah - Get in Touch";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Get in touch with Eugene Odibenuah for select web development projects, technical audits, or business strategy consultations.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    const res = await api.post('/contact', {
      full_name: formData.name,
      email: formData.email,
      message: formData.message
    });

    if (res.ok) {
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background text-black dark:text-white pt-32 pb-20 px-6 md:px-12 font-body selection:bg-accent selection:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.h1 
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduce ? 0 : 0.6 }}
          className="text-6xl md:text-8xl lg:text-[10rem] font-heading font-bold tracking-tighter mb-20 md:mb-32"
        >
          Contact me
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-8 mb-32">
          {/* Left Column: Contact Info */}
          <motion.div 
            initial={shouldReduce ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: shouldReduce ? 0 : 0.6, delay: shouldReduce ? 0 : 0.2 }}
            className="space-y-12 text-sm md:text-base text-gray-800 dark:text-gray-200"
          >
            <div className="space-y-6">
              <div>
                <p className="text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest font-bold mb-2">Direct Contact</p>
                <a href={`mailto:${CONTACT.email}`} className="block hover:text-accent dark:hover:text-white transition-colors font-medium">
                  {CONTACT.email}
                </a>
                <a href={`tel:${CONTACT.phoneDisplay}`} className="block mt-2 hover:text-accent dark:hover:text-white transition-colors font-medium">
                  {CONTACT.phoneDisplay}
                </a>
              </div>

              <div>
                <p className="text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest font-bold mb-2">Location</p>
                <div className="leading-relaxed flex items-start">
                  <svg className="w-5 h-5 text-accent mr-2 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    Lagos, Nigeria<br />
                    (Available for Remote Work Globally)
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest font-bold mb-2">Socials</p>
                <div className="flex gap-4">
                  <button onClick={() => setShowSecurityPopup(true)} className="hover:text-accent transition-colors underline underline-offset-4 decoration-gray-300 dark:decoration-gray-700 uppercase tracking-widest text-xs font-bold">GitHub</button>
                  <a href="#" className="hover:text-accent transition-colors underline underline-offset-4 decoration-gray-300 dark:decoration-gray-700 uppercase tracking-widest text-xs font-bold">TikTok</a>
                  <a href="#" className="hover:text-accent transition-colors underline underline-offset-4 decoration-gray-300 dark:decoration-gray-700 uppercase tracking-widest text-xs font-bold">Instagram</a>
                </div>
              </div>
            </div>

            {/* Booking Link CTA */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest font-bold mb-4">Want to move faster?</p>
              <motion.a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-accent hover:text-black dark:hover:text-white transition-colors group"
                whileHover={shouldReduce ? {} : buttonHover}
                whileTap={shouldReduce ? {} : buttonTap}
              >
                Book a Discovery Call
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </motion.a>
            </div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div 
            initial={shouldReduce ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: shouldReduce ? 0 : 0.6, delay: shouldReduce ? 0 : 0.3 }}
          >
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Name Group */}
              <div>
                <label htmlFor="name" className="block text-sm mb-2 text-black dark:text-white font-bold uppercase tracking-widest cursor-pointer">Name (required)</label>
                <input 
                  type="text" 
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-2 text-black dark:text-white focus:outline-none focus:border-accent dark:focus:border-white transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm mb-2 text-black dark:text-white font-bold uppercase tracking-widest cursor-pointer">Email (required)</label>
                <input 
                  type="email" 
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  className={`w-full bg-transparent border-b py-2 text-black dark:text-white focus:outline-none transition-colors ${
                    emailError 
                      ? 'border-red-500 focus:border-red-500' 
                      : isEmailDirty && formData.email && !emailError
                        ? 'border-green-500 focus:border-green-500'
                        : 'border-gray-300 dark:border-gray-700 focus:border-accent dark:focus:border-white'
                  }`}
                />
                <AnimatePresence>
                  {emailError && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-500 text-xs mt-2"
                    >
                      Please enter a valid email address.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm mb-2 text-black dark:text-white font-bold uppercase tracking-widest cursor-pointer">Message (required)</label>
                <textarea 
                  id="message"
                  required
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-2 text-black dark:text-white focus:outline-none focus:border-accent dark:focus:border-white transition-colors resize-y min-h-[100px]"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div>
                <motion.button 
                  type="submit" 
                  disabled={status === 'submitting' || status === 'success' || emailError}
                  whileHover={shouldReduce || emailError || status === 'submitting' || status === 'success' ? {} : buttonHover}
                  whileTap={shouldReduce || emailError || status === 'submitting' || status === 'success' ? {} : buttonTap}
                  className={`relative px-8 py-3 text-sm font-bold tracking-widest transition-colors flex items-center justify-center overflow-hidden min-w-[160px] ${
                    status === 'success' ? 'bg-green-500 text-white' : 
                    status === 'submitting' ? 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-wait' : 
                    emailError ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed' :
                    'bg-black text-white hover:bg-accent dark:bg-white dark:text-black dark:hover:bg-gray-200'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {status === 'idle' || status === 'error' ? (
                      <motion.span 
                        key="idle"
                        initial={shouldReduce ? {} : { y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={shouldReduce ? {} : { y: -20, opacity: 0 }}
                      >
                        SUBMIT
                      </motion.span>
                    ) : status === 'submitting' ? (
                      <motion.span 
                        key="submitting"
                        initial={shouldReduce ? {} : { y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={shouldReduce ? {} : { y: -20, opacity: 0 }}
                        className="flex items-center"
                      >
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        SENDING
                      </motion.span>
                    ) : (
                      <motion.span 
                        key="success"
                        initial={shouldReduce ? {} : { scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={shouldReduce ? {} : { scale: 0, opacity: 0 }}
                        className="flex items-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        SENT!
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
                <AnimatePresence>
                  {status === 'error' && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-500 dark:text-red-400 text-sm mt-4"
                    >
                      There was an error sending your message. Please try again.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div 
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduce ? 0 : 0.6, delay: shouldReduce ? 0 : 0.4 }}
          className="pt-20 border-t border-gray-200 dark:border-gray-800"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-gray-700 dark:text-gray-300 mb-12 uppercase tracking-widest font-bold">
            <div className="leading-relaxed">
              Frontend Engineering<br/>
              Backend Development<br/>
              Full-Stack Applications
            </div>
            <div className="leading-relaxed">
              4 Years of experience<br/>
              <Link to="/projects" className="text-black dark:text-white hover:text-accent dark:hover:text-accent transition-colors font-bold mt-2 inline-block">View Work</Link>
            </div>
            <div className="md:text-right leading-relaxed">
              <span className="flex items-center md:justify-end">
                <svg className="w-4 h-4 text-accent mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Lagos, Nigeria
              </span>
              2026
            </div>
          </div>

          <h2 className="text-5xl md:text-8xl lg:text-[10rem] font-heading font-bold tracking-tighter text-black dark:text-white capitalize text-right">
            Odibenuah Eugene
          </h2>
        </motion.div>
      </div>

      {/* Security Popup Modal */}
      <SecurityPopup 
        isOpen={showSecurityPopup} 
        onClose={() => setShowSecurityPopup(false)} 
      />
    </div>
  );
};

export default ContactPage;
