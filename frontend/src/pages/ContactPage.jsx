import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import SecurityPopup from '../components/SecurityPopup';
import { api } from '../services/api';
import { buttonHover, buttonTap, cardHover, cardHoverTransition, reducedMotionVariants, fadeUpItem, staggerContainer } from '../utils/motion';
import { CONTACT } from '../config/contact';

const PROJECT_TYPES = [
  'Business Website',
  'E-commerce',
  'Web Application',
  'SaaS Platform',
  'Backend / API',
  'Redesign / Rebuild',
  'Technical Audit',
  'Not sure yet',
];

const BUDGET_RANGES = [
  'Under ₦250k',
  '₦250k – ₦600k',
  '₦600k – ₦1.5M',
  '₦1.5M+',
  'Not sure yet',
];

const TIMELINE_OPTIONS = [
  'ASAP',
  '2–4 weeks',
  '1–2 months',
  'Flexible',
];

const SOCIAL_LINKS = [
  {
    name: 'GitHub',
    desc: 'View my code & production repos',
    action: 'github',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    desc: 'Connect professionally',
    url: 'https://linkedin.com/in/eugene-odibenuah',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    desc: 'Behind the scenes & updates',
    url: 'https://instagram.com/buildwithlami',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    desc: 'Development & tech content',
    url: 'https://tiktok.com/@buildwithlami',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.77 1.81-.03 3.32-1.5 3.37-3.31.04-3.89.02-7.78.02-11.68V.02z" />
      </svg>
    ),
  },
];

const ContactPage = () => {
  const shouldReduce = useReducedMotion();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    project_type: '',
    budget: '',
    timeline: '',
    message: '',
  });
  const [status, setStatus] = useState('idle');
  const [emailError, setEmailError] = useState(false);
  const [isEmailDirty, setIsEmailDirty] = useState(false);
  const [showSecurityPopup, setShowSecurityPopup] = useState(false);

  const container = useMemo(() => (shouldReduce ? reducedMotionVariants : staggerContainer), [shouldReduce]);
  const item = useMemo(() => (shouldReduce ? reducedMotionVariants : fadeUpItem), [shouldReduce]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, email: value }));
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
    document.title = "Contact | BuildWithLami — Let's Build Something That Matters";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        "Start a project inquiry with BuildWithLami (Eugene Odibenuah). Custom software engineering, enterprise web applications, and technical consulting."
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !validateEmail(formData.email) || !formData.message.trim()) {
      setIsEmailDirty(true);
      setEmailError(!validateEmail(formData.email));
      return;
    }

    setStatus('submitting');

    const res = await api.post('/contact', {
      full_name: formData.name.trim(),
      email: formData.email.trim(),
      project_type: formData.project_type || null,
      budget: formData.budget || null,
      timeline: formData.timeline || null,
      message: formData.message.trim(),
    });

    if (res.ok) {
      setStatus('success');
      setFormData({
        name: '',
        email: '',
        project_type: '',
        budget: '',
        timeline: '',
        message: '',
      });
      setIsEmailDirty(false);
      setTimeout(() => setStatus('idle'), 4000);
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background text-black dark:text-white pt-28 sm:pt-36 pb-20 px-4 sm:px-6 md:px-12 font-body selection:bg-accent selection:text-white transition-colors duration-300 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-16 sm:space-y-24">
        
        {/* ═══════════════════════════════════════════════════════════════════
            1. HERO
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.header
          initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduce ? 0 : 0.5 }}
          className="text-left max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Project Discovery & Consultation
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight text-black dark:text-white leading-[1.08]">
            Let&apos;s Build Something That <span className="text-accent">Matters.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 font-light leading-relaxed">
            Tell me what you&apos;re building, what you&apos;re trying to improve, or where you&apos;re stuck. I&apos;ll review the details and get back to you with the right next step.
          </p>
        </motion.header>

        {/* ═══════════════════════════════════════════════════════════════════
            2. MAIN CONSULTATION GRID: Intake Form + Direct Reach Panels
            ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column (8 cols on lg): Intake Form */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8"
          >
            <div>
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-accent">Intake Questionnaire</span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-black dark:text-white mt-1">
                Start a Conversation
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Name <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-accent dark:focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Email <span className="text-accent">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    className={`w-full bg-gray-50 dark:bg-white/5 border rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder-gray-400 focus:outline-none transition-colors ${
                      emailError
                        ? 'border-red-500 focus:border-red-500'
                        : isEmailDirty && formData.email && !emailError
                        ? 'border-green-500 focus:border-green-500'
                        : 'border-gray-200 dark:border-white/10 focus:border-accent dark:focus:border-accent'
                    }`}
                  />
                  {emailError && (
                    <p className="text-red-500 text-xs mt-1">Please enter a valid email address.</p>
                  )}
                </div>
              </div>

              {/* What are you looking to build? */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-300 mb-2">
                  What are you looking to build?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PROJECT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, project_type: formData.project_type === type ? '' : type })}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        formData.project_type === type
                          ? 'bg-accent text-white border-accent shadow-sm'
                          : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-accent/50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimated Budget */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Estimated Budget
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BUDGET_RANGES.map((budget) => (
                    <button
                      key={budget}
                      type="button"
                      onClick={() => setFormData({ ...formData, budget: formData.budget === budget ? '' : budget })}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        formData.budget === budget
                          ? 'bg-accent text-white border-accent shadow-sm'
                          : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-accent/50'
                      }`}
                    >
                      {budget}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Timeline */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Preferred Timeline
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TIMELINE_OPTIONS.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setFormData({ ...formData, timeline: formData.timeline === time ? '' : time })}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        formData.timeline === time
                          ? 'bg-accent text-white border-accent shadow-sm'
                          : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-accent/50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Tell me about the project <span className="text-accent">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows="4"
                  placeholder="What are you trying to build or improve? Goals, current challenges, or required features."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm text-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-accent dark:focus:border-accent transition-colors resize-y min-h-[110px]"
                ></textarea>
              </div>

              {/* Submit Button & Status Alerts */}
              <div>
                <motion.button
                  type="submit"
                  disabled={status === 'submitting' || status === 'success'}
                  whileHover={shouldReduce || status === 'submitting' ? {} : buttonHover}
                  whileTap={shouldReduce || status === 'submitting' ? {} : buttonTap}
                  className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center shadow-lg ${
                    status === 'success'
                      ? 'bg-green-600 text-white'
                      : status === 'submitting'
                      ? 'bg-gray-400 text-white cursor-wait'
                      : 'bg-accent text-white hover:bg-black dark:hover:bg-white dark:hover:text-black'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {status === 'idle' || status === 'error' ? (
                      <span key="idle">Send Project Inquiry →</span>
                    ) : status === 'submitting' ? (
                      <span key="submitting" className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Reviewing Details...
                      </span>
                    ) : (
                      <span key="success" className="flex items-center gap-2">
                        ✓ Inquiry Received! I'll Be in Touch Shortly
                      </span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {status === 'error' && (
                  <p className="text-red-500 text-xs mt-3 text-center">
                    There was an issue sending your inquiry. Please try again or reach me via WhatsApp below.
                  </p>
                )}
              </div>
            </form>
          </motion.div>

          {/* Right Column (5 cols on lg): Direct Reach & Booking Panels */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Panel 1: Prefer to reach me directly? */}
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] font-bold text-accent">Direct Reach</span>
                <h3 className="text-xl font-heading font-bold text-black dark:text-white mt-1">
                  Prefer to reach me directly?
                </h3>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <span className="block text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-0.5">Email</span>
                  <a href={`mailto:${CONTACT.email}`} className="text-black dark:text-white font-medium hover:text-accent transition-colors">
                    {CONTACT.email}
                  </a>
                </div>
                <div>
                  <span className="block text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-0.5">WhatsApp</span>
                  <a
                    href={`https://wa.me/${CONTACT.phoneE164 || '2348085186714'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black dark:text-white font-medium hover:text-accent transition-colors"
                  >
                    {CONTACT.phoneDisplay || '+234 906 418 5442'}
                  </a>
                </div>
                <div>
                  <span className="block text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-0.5">Based in</span>
                  <p className="text-black dark:text-white font-medium">
                    Lagos, Nigeria · Available worldwide remotely
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-white/10 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span>Usually responds within a few hours.</span>
              </div>
            </div>

            {/* Panel 2: Prefer a direct conversation? */}
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-accent">Immediate Discovery</span>
              <h3 className="text-xl font-heading font-bold text-black dark:text-white">
                Prefer a direct conversation?
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-light leading-relaxed">
                If you already have clear requirements and want to discuss timelines, architecture, and technical feasibility directly, let&apos;s talk.
              </p>
              <a
                href={`https://wa.me/${CONTACT.phoneE164 || '2348085186714'}?text=${encodeURIComponent("Hi Lami, I would like to schedule a discovery call for my software project.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-accent hover:text-white hover:border-accent text-black dark:text-white text-xs font-bold uppercase tracking-[0.2em] py-3.5 rounded-xl transition-all shadow-sm"
              >
                Book a Discovery Call →
              </a>
            </div>

            {/* Panel 3: Social Profiles */}
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-accent">Social & Code</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SOCIAL_LINKS.map((soc) => {
                  if (soc.action === 'github') {
                    return (
                      <button
                        key={soc.name}
                        type="button"
                        onClick={() => setShowSecurityPopup(true)}
                        className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-accent/40 text-left transition-colors group"
                      >
                        <span className="text-gray-700 dark:text-gray-300 group-hover:text-accent transition-colors mt-0.5">
                          {soc.icon}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-black dark:text-white group-hover:text-accent transition-colors">
                            {soc.name}
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 font-light line-clamp-1">
                            {soc.desc}
                          </div>
                        </div>
                      </button>
                    );
                  }
                  return (
                    <a
                      key={soc.name}
                      href={soc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-accent/40 text-left transition-colors group"
                    >
                      <span className="text-gray-700 dark:text-gray-300 group-hover:text-accent transition-colors mt-0.5">
                        {soc.icon}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-black dark:text-white group-hover:text-accent transition-colors">
                          {soc.name}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-light line-clamp-1">
                          {soc.desc}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            3. WHAT HAPPENS NEXT? — Expectation Setting
            ═══════════════════════════════════════════════════════════════════ */}
        <section className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-3xl p-8 sm:p-12 shadow-xl space-y-8">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-accent">Process Clarity</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-black dark:text-white mt-1">
              What happens next?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 space-y-3">
              <span className="font-mono text-2xl font-bold text-accent">01</span>
              <h3 className="text-base font-heading font-bold text-black dark:text-white">
                Inquiry Review
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-light leading-relaxed">
                I&apos;ll review your requirements, technical goals, budget range, and preferred timeline within a few hours.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 space-y-3">
              <span className="font-mono text-2xl font-bold text-accent">02</span>
              <h3 className="text-base font-heading font-bold text-black dark:text-white">
                Scope & Discovery
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-light leading-relaxed">
                If the project is a good fit, we&apos;ll discuss requirements, technical tradeoffs, and architectural direction.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 space-y-3">
              <span className="font-mono text-2xl font-bold text-accent">03</span>
              <h3 className="text-base font-heading font-bold text-black dark:text-white">
                Proposal & Next Step
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-light leading-relaxed">
                Depending on project scope, you&apos;ll receive a detailed roadmap, transparent estimate, and contract ready for execution.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            4. CURRENT AVAILABILITY & AUTHENTIC SIGNATURE
            ═══════════════════════════════════════════════════════════════════ */}
        <section className="pt-8 border-t border-gray-200 dark:border-gray-800 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-bold text-black dark:text-white uppercase tracking-wider">Currently accepting projects</span>
            </div>
            <div>
              Project Types: Websites · E-commerce · Web Apps · SaaS · APIs · Business Systems
            </div>
          </div>

          {/* Stylized Handwritten Signature */}
          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-handwritten text-4xl sm:text-6xl text-accent dark:text-accent font-normal italic tracking-wide select-none">
                Eugene Odibenuah
              </div>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400 font-bold mt-1 font-heading">
                Founder & Lead Engineer · BuildWithLami
              </p>
            </div>
            <div className="text-xs font-mono text-gray-400">
              Lagos, Nigeria · Available Globally
            </div>
          </div>
        </section>

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
