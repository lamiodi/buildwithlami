import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import SecurityPopup from '../components/SecurityPopup';
import { api } from '../services/api';
import { buttonHover, buttonTap, cardHover, cardHoverTransition, reducedMotionVariants, fadeUpItem, staggerContainer } from '../utils/motion';
import { CONTACT } from '../config/contact';
import { Clock, PhoneCall, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

const PROJECT_TYPES = [
  'Business Website',
  'E-Commerce',
  'Business Operation System (e.g. shops or firms)',
  'Web Application & SaaS',
  'UI/UX Design',
  'SEO & Growth',
  'AI & Automations',
  'Not sure yet',
];

const TIMELINE_OPTIONS = [
  'ASAP (1–2 weeks)',
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
];

const ContactPage = () => {
  const shouldReduce = useReducedMotion();
  const location = useLocation();

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

  // Detect URL parameters from Pricing Page selection (e.g. ?service=ecommerce&tier=Growth)
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Start a Project | BuildWithLami — Direct Engineering Inquiry";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        "Start a project inquiry with BuildWithLami (Eugene Odibenuah). Custom software engineering, high-converting websites, e-commerce, and technical consulting."
      );
    }

    const params = new URLSearchParams(location.search);
    const serviceParam = params.get('service');
    const tierParam = params.get('tier');
    const currencyParam = params.get('currency');

    if (serviceParam || tierParam) {
      let matchedType = '';
      if (serviceParam === 'websites') matchedType = 'Business Website';
      else if (serviceParam === 'ecommerce') matchedType = 'E-Commerce';
      else if (serviceParam === 'software') matchedType = 'Custom Software';
      else if (serviceParam === 'ui_ux') matchedType = 'UI/UX Design';
      else if (serviceParam === 'seo') matchedType = 'SEO & Growth';
      else if (serviceParam === 'ai_automation') matchedType = 'AI & Automations';

      setFormData(prev => ({
        ...prev,
        project_type: matchedType || prev.project_type,
        message: prev.message || (tierParam ? `Hi Eugene, I'm interested in discussing the ${tierParam} package for ${matchedType || serviceParam} (${currencyParam || 'NGN'}).` : '')
      }));
    }
  }, [location.search]);

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
      setTimeout(() => setStatus('idle'), 5000);
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background text-black dark:text-white pt-24 sm:pt-32 pb-20 px-4 sm:px-6 md:px-12 font-body selection:bg-accent selection:text-white transition-colors duration-300 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
        
        {/* ═══════════════════════════════════════════════════════════════════
            1. HERO
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.header
          initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduce ? 0 : 0.5 }}
          className="text-left max-w-3xl"
        >
          <div className="bwl-eyebrow mb-4">
            <span className="w-2 h-2 bg-accent inline-block" />
            <span>Direct Project Discovery</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold tracking-tight text-black dark:text-white leading-[1.08]">
            Let&apos;s build something <br className="hidden sm:block" />
            that <span className="text-accent">moves your business.</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-700 dark:text-gray-300 font-light leading-relaxed">
            Direct founder-to-engineer communication. Share your goals, timeline, or required features. I personally review every inquiry and reply within 24 hours with a concrete proposal and roadmap.
          </p>
        </motion.header>

        {/* ═══════════════════════════════════════════════════════════════════
            2. PROJECT BRIEF INTAKE & DIRECT REACH
            ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Intake Form */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8"
          >
            <div>
              <div className="bwl-eyebrow mb-1">
                <span className="w-2 h-2 bg-accent inline-block" />
                <span>Project Scope Intake</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-black dark:text-white mt-1">
                Tell me about your project
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Your Name <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    placeholder="e.g. Alex Johnson"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bwl-input"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address <span className="text-accent">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    className={`bwl-input ${
                      emailError
                        ? '!border-red-500 focus:!border-red-500'
                        : isEmailDirty && formData.email && !emailError
                        ? '!border-green-500 focus:!border-green-500'
                        : ''
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
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center truncate ${
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



              {/* Preferred Timeline */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Target Timeline
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TIMELINE_OPTIONS.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setFormData({ ...formData, timeline: formData.timeline === time ? '' : time })}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center truncate ${
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
                  Project Details & Key Goals <span className="text-accent">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows="4"
                  placeholder="Describe what you want to achieve, key features, reference websites, or current business bottlenecks."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bwl-input resize-y min-h-[110px]"
                ></textarea>
              </div>

              {/* 3-Step What Happens Next Clarity Box */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-2.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent block">
                  ✦ What happens after you submit
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-gray-600 dark:text-gray-300">
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-accent">1.</span>
                    <span>Direct review of your brief within 24h</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-accent">2.</span>
                    <span>15-min discovery call or video scope</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-accent">3.</span>
                    <span>Fixed milestone proposal & SOW</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <motion.button
                  type="submit"
                  disabled={status === 'submitting' || status === 'success'}
                  whileHover={shouldReduce || status === 'submitting' ? {} : buttonHover}
                  whileTap={shouldReduce || status === 'submitting' ? {} : buttonTap}
                  className={`btn-primary w-full ${
                    status === 'success'
                      ? '!bg-emerald-600'
                      : status === 'submitting'
                      ? '!bg-gray-400 !cursor-wait'
                      : ''
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {status === 'idle' || status === 'error' ? (
                      <span key="idle" className="flex items-center gap-2">
                        <span>Send Project Inquiry</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    ) : status === 'submitting' ? (
                      <span key="submitting" className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Transmitting Brief...
                      </span>
                    ) : (
                      <span key="success" className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Inquiry Received! I Will Reply Within 24h
                      </span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {status === 'error' && (
                  <p className="text-red-500 text-xs mt-3 text-center">
                    There was an issue sending your inquiry. Please reach me directly via WhatsApp below.
                  </p>
                )}
              </div>
            </form>
          </motion.div>

          {/* Right Column: Direct Reach & Direct Channels */}
          <div className="lg:col-span-5 space-y-6">
            {/* WhatsApp Card */}
            <div className="bg-gradient-to-br from-emerald-950/40 via-emerald-900/20 to-black border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-emerald-400">Fast Response</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-white">
                Prefer direct chat?
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-light">
                For quick scope questions, budget checks, or rapid consultation, message me directly on WhatsApp.
              </p>
              <a
                href={`https://wa.me/${CONTACT.phoneE164 || '2348085186714'}?text=${encodeURIComponent("Hi Eugene, I'm reaching out from BuildWithLami to discuss a project.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-4 bg-emerald-600 text-white font-heading font-bold text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-lg active:scale-[0.98]"
              >
                <span>Chat on WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Direct Information Card */}
            <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] font-bold text-accent">Direct Contact</span>
                <h3 className="text-xl font-heading font-bold text-black dark:text-white mt-1">
                  Founder Reach
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-semibold text-gray-400 block mb-1">Direct Email</span>
                  <a href={`mailto:${CONTACT.email}`} className="font-mono text-sm font-bold text-black dark:text-white hover:text-accent transition-colors">
                    {CONTACT.email}
                  </a>
                </div>
                <div>
                  <span className="font-semibold text-gray-400 block mb-1">Location & Availability</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    Lagos, Nigeria · Available for clients locally & worldwide (Remote)
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-gray-400 block mb-1">Payment & Contracting</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    50/50 Milestone Invoicing via Paystack (NGN) or International Wire / Cards (USD / GBP).
                  </p>
                </div>
              </div>

              {/* Social Channels */}
              <div className="pt-4 border-t border-gray-100 dark:border-white/10">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 block mb-3">
                  Engineering Profiles
                </span>
                <div className="flex flex-wrap gap-2">
                  {SOCIAL_LINKS.map(s => (
                    <a
                      key={s.name}
                      href={s.url || 'https://github.com/lamiodi'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:border-accent text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 transition-all"
                    >
                      {s.icon}
                      <span>{s.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactPage;
