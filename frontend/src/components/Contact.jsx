import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { api } from '../services/api';
import { staggerContainer, fadeUpItem, buttonHover, buttonTap, sectionViewport, reducedMotionVariants } from '../utils/motion';
import { CONTACT } from '../config/contact';

const projectTypes = [
  'Landing Page / Portfolio',
  'Business / Corporate Website',
  'E-commerce Store',
  'Web Application / Dashboard',
  'Redesign / Rebuild',
  'Other'
];

const budgetRanges = [
  'Under ₦290k / $900',
  '₦290k – ₦600k / $900 – $1.5k',
  '₦600k – ₦1.5M / $1.5k – $4k',
  '₦1.5M+ / $4k+',
  'Not sure yet'
];

const timelines = [
  'ASAP (under 2 weeks)',
  '2 – 4 weeks',
  '1 – 2 months',
  'Flexible / No rush'
];

const Contact = () => {
  const [formData, setFormData] = useState({ 
    name: '', email: '', message: '',
    project_type: '', budget: '', timeline: ''
  });
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    const res = await api.post('/contact', {
      full_name: formData.name,
      email: formData.email,
      message: formData.message,
      project_type: formData.project_type || null,
      budget: formData.budget || null,
      timeline: formData.timeline || null
    });

    if (res.ok) {
      setStatus('success');
      setFormData({ name: '', email: '', message: '', project_type: '', budget: '', timeline: '' });
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
    }
  };

  const selectClass = "w-full bg-transparent border-b-2 border-white/60 py-3 text-white focus:outline-none focus:border-white transition-colors text-lg appearance-none cursor-pointer";
  const inputClass = "w-full bg-transparent border-b-2 border-white/60 py-3 text-white placeholder-white/80 focus:outline-none focus:border-white transition-colors text-lg";

  return (
    <section id="contact" className="bg-accent py-24">
      <motion.div
        className="px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-stretch gap-16"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
      >
        <div className="w-full md:w-1/2 flex flex-col justify-between">
          <motion.div variants={item}>
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-8 text-white">
              Let's Build Your Next Product
            </h2>
            <p className="text-xl md:text-2xl text-white font-light mb-12 opacity-95">
              Tell me what you're building — I'll help you design, develop, and launch it fast.
            </p>
          </motion.div>
          
          <motion.div variants={item} className="space-y-4">
            <motion.a
              href={`mailto:${CONTACT.email}`}
              className="flex items-center justify-center w-full bg-white dark:bg-white text-black text-lg font-bold uppercase px-8 py-4 hover:bg-gray-100 dark:hover:bg-gray-100 transition-colors rounded-sm shadow-md"
              whileHover={shouldReduce ? {} : buttonHover}
              whileTap={shouldReduce ? {} : buttonTap}
            >
              <svg className="w-5 h-5 mr-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              Send an Email
            </motion.a>
          </motion.div>
        </div>

        <motion.div className="w-full md:w-1/2 mt-12 md:mt-0" variants={item}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input 
                type="text" 
                placeholder="Your name" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={inputClass}
              />
            </div>
            <div>
              <input 
                type="email" 
                placeholder="Email address"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={inputClass}
              />
            </div>

            {/* Pre-qualification Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="relative">
                <select
                  value={formData.project_type}
                  onChange={(e) => setFormData({...formData, project_type: e.target.value})}
                  className={`${selectClass} ${!formData.project_type ? 'text-white/80' : 'text-white'}`}
                >
                  <option value="" className="text-gray-900">Project type</option>
                  {projectTypes.map(pt => (
                    <option key={pt} value={pt} className="text-gray-900">{pt}</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  className={`${selectClass} ${!formData.budget ? 'text-white/80' : 'text-white'}`}
                >
                  <option value="" className="text-gray-900">Budget range</option>
                  {budgetRanges.map(b => (
                    <option key={b} value={b} className="text-gray-900">{b}</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <select
                  value={formData.timeline}
                  onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                  className={`${selectClass} ${!formData.timeline ? 'text-white/80' : 'text-white'}`}
                >
                  <option value="" className="text-gray-900">Timeline</option>
                  {timelines.map(t => (
                    <option key={t} value={t} className="text-gray-900">{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <textarea 
                placeholder="Tell me about your project..."
                rows="3"
                required
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className={`${inputClass} resize-y min-h-[60px]`}
              ></textarea>
            </div>
            
            <motion.button 
              type="submit" 
              disabled={status === 'submitting' || status === 'success'}
              className={`w-full py-4 text-center text-lg font-bold uppercase transition-colors rounded-sm ${
                status === 'success' ? 'bg-green-600 text-white' : 
                status === 'submitting' ? 'bg-white/20 text-white/50 cursor-not-allowed' : 
                'bg-white text-black hover:bg-gray-100'
              }`}
              whileHover={status === 'idle' && !shouldReduce ? buttonHover : {}}
              whileTap={status === 'idle' && !shouldReduce ? buttonTap : {}}
            >
              {status === 'success' ? 'Message Sent!' : status === 'submitting' ? 'Sending...' : 'Start Your Project'}
            </motion.button>
            
            {status === 'error' && (
              <p className="text-red-200 text-sm text-center">There was an error sending your message. Please try again.</p>
            )}
          </form>
        </motion.div>
      </motion.div>

      <motion.div 
        className="mt-16 text-center w-full"
        initial={shouldReduce ? {} : { opacity: 0 }}
        whileInView={{ opacity: 0.95 }}
        viewport={sectionViewport}
      >
        <p className="text-white text-sm md:text-base italic font-body">
          * I usually respond within a few hours
        </p>
      </motion.div>
    </section>
  );
};

export default Contact;
