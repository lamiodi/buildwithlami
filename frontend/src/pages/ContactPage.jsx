import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ContactPage = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

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
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          message: formData.message
        })
      });
      
      if (response.ok) {
        setStatus('success');
        setFormData({ firstName: '', lastName: '', email: '', message: '' });
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background text-black dark:text-white pt-32 pb-20 px-6 md:px-12 font-body selection:bg-accent selection:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-6xl md:text-8xl lg:text-[10rem] font-heading font-bold tracking-tighter mb-20 md:mb-32"
        >
          Contact me
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-8 mb-32">
          {/* Left Column: Contact Info */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8 text-sm md:text-base text-gray-600 dark:text-gray-400"
          >
            <div>
              <a href="mailto:hello@buildwithlami.dev" className="hover:text-accent dark:hover:text-white transition-colors">
                hello@buildwithlami.dev
              </a>
            </div>
            <div>
              <a href="tel:+2349064185442" className="hover:text-accent dark:hover:text-white transition-colors">
                +234 906 418 5442
              </a>
            </div>
            <div className="leading-relaxed">
              Lagos, Nigeria
            </div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Name Group */}
              <div>
                <label className="block text-sm mb-4 text-black dark:text-white font-bold uppercase tracking-widest">Name (required)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">First Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-2 text-black dark:text-white focus:outline-none focus:border-accent dark:focus:border-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Last Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-2 text-black dark:text-white focus:outline-none focus:border-accent dark:focus:border-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm mb-2 text-black dark:text-white font-bold uppercase tracking-widest">Email (required)</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-2 text-black dark:text-white focus:outline-none focus:border-accent dark:focus:border-white transition-colors"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm mb-2 text-black dark:text-white font-bold uppercase tracking-widest">Message (required)</label>
                <textarea 
                  required
                  rows="1"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-2 text-black dark:text-white focus:outline-none focus:border-accent dark:focus:border-white transition-colors resize-none overflow-hidden"
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                ></textarea>
              </div>

              {/* Submit Button */}
              <div>
                <button 
                  type="submit" 
                  disabled={status === 'submitting' || status === 'success'}
                  className={`px-8 py-3 text-sm font-bold tracking-widest transition-colors ${
                    status === 'success' ? 'bg-green-500 text-white' : 
                    status === 'submitting' ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed' : 
                    'bg-black text-white hover:bg-accent dark:bg-white dark:text-black dark:hover:bg-gray-200'
                  }`}
                >
                  {status === 'success' ? 'SENT!' : status === 'submitting' ? 'SUBMITTING...' : 'SUBMIT'}
                </button>
                {status === 'error' && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-4">There was an error sending your message. Please try again.</p>
                )}
              </div>
            </form>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-20 border-t border-gray-200 dark:border-gray-800"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-gray-500 mb-12 uppercase tracking-widest">
            <div className="leading-relaxed">
              Frontend Engineering<br/>
              Backend Development<br/>
              Full-Stack Applications
            </div>
            <div className="leading-relaxed">
              4 Years of experience<br/>
              <a href="/projects" className="text-black dark:text-white hover:text-accent dark:hover:text-accent transition-colors font-bold mt-2 inline-block">View Work</a>
            </div>
            <div className="md:text-right leading-relaxed">
              Lagos, Nigeria<br/>
              {new Date().getFullYear()}
            </div>
          </div>

          <h2 className="text-5xl md:text-8xl lg:text-[10rem] font-heading font-bold tracking-tighter text-black dark:text-white lowercase">
            odibenuah eugene
          </h2>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;
