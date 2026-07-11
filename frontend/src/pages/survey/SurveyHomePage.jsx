import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { api } from '../../services/api';
import { CONTACT } from '../../config/contact';
import {
  SURVEY_SERVICES, SURVEY_PROJECTS, SURVEY_EQUIPMENT,
  SURVEY_FAQ, SURVEY_TESTIMONIALS,
} from '../../data/divisions';
import {
  staggerContainer, fadeUpItem, buttonHover, buttonTap,
  sectionViewport, reducedMotionVariants,
} from '../../utils/motion';

/* ── tiny reusable sub-components ─────────────────────── */
const SectionTag = ({ children }) => (
  <p className="text-accent uppercase tracking-[0.3em] text-[11px] font-bold mb-4">{children}</p>
);
const SectionTitle = ({ children, className = '' }) => (
  <h2 className={`text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-[1.05] tracking-tight mb-6 ${className}`}>
    {children}
  </h2>
);

/* ── FAQ Accordion Item ───────────────────────────────── */
const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 dark:border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-accent transition-colors pr-4">{q}</span>
        <span className="text-2xl text-accent shrink-0 transition-transform duration-300" style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 pb-5' : 'max-h-0'}`}>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{a}</p>
      </div>
    </div>
  );
};

/* ================================================================
   SURVEY HOME PAGE
   ================================================================ */
const SurveyHomePage = () => {
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  // Booking form state
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', service: '', location: '', preferred_date: '', notes: '',
  });
  const [formStatus, setFormStatus] = useState('idle');

  const handleBooking = async (e) => {
    e.preventDefault();
    setFormStatus('submitting');
    const res = await api.post('/bookings', { ...form, division: 'SURVEY' });
    if (res.ok) {
      setFormStatus('success');
      setForm({ full_name: '', email: '', phone: '', service: '', location: '', preferred_date: '', notes: '' });
      setTimeout(() => setFormStatus('idle'), 4000);
    } else {
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 4000);
    }
  };

  const inputCls = "w-full bg-transparent border-b-2 border-gray-300 dark:border-white/20 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-accent transition-colors text-base";

  /* ── Sub-nav for anchor scrolling ──────────────────── */
  const sections = [
    { id: 'services', label: 'Services' },
    { id: 'projects', label: 'Projects' },
    { id: 'equipment', label: 'Equipment' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'faq', label: 'FAQ' },
    { id: 'book-survey', label: 'Book Survey' },
    { id: 'contact', label: 'Contact' },
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-white dark:bg-background text-gray-900 dark:text-white min-h-screen">

      {/* ═══════════ HERO ═══════════ */}
      <section id="survey-hero" className="relative overflow-hidden">
        {/* Minimalist editorial hero inspired by the survey reference design */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-24 md:pt-24 md:pb-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-0">

          {/* Left — oversized typography */}
          <motion.div
            className="w-full lg:w-1/2 z-10"
            variants={container} initial="hidden" animate="visible"
          >
            <motion.div variants={item}>
              <SectionTag>Lami Survey Division</SectionTag>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-6xl md:text-8xl lg:text-[110px] font-heading font-black leading-[0.88] tracking-tight mb-8"
            >
              <span className="block">PRE</span>
              <span className="block">CI</span>
              <span className="block text-accent">SION</span>
            </motion.h1>

            <motion.p variants={item} className="text-gray-600 dark:text-gray-300 text-lg md:text-xl max-w-md leading-relaxed mb-8">
              Professional land surveying services across Nigeria. From boundary demarcation to large-scale GIS mapping — we deliver accuracy you can build on.
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap gap-4">
              <motion.button
                onClick={() => scrollTo('book-survey')}
                className="bg-accent text-white font-bold uppercase text-[11px] px-10 py-4 tracking-[0.2em] hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all shadow-lg hover:shadow-accent/30"
                whileHover={shouldReduce ? {} : buttonHover}
                whileTap={shouldReduce ? {} : buttonTap}
              >
                Book a Survey
              </motion.button>
              <motion.button
                onClick={() => scrollTo('services')}
                className="text-gray-800 dark:text-gray-200 text-[11px] uppercase tracking-[0.2em] font-bold hover:text-accent transition-all py-4 px-4"
                whileHover={shouldReduce ? {} : buttonHover}
                whileTap={shouldReduce ? {} : buttonTap}
              >
                Explore Services →
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right — featured project image with metadata card */}
          <motion.div
            className="w-full lg:w-1/2 relative"
            initial={shouldReduce ? {} : { opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop"
                alt="Survey field work"
                className="w-full h-[400px] md:h-[500px] object-cover shadow-2xl"
              />
              {/* Metadata card overlay — inspired by survey reference */}
              <div className="absolute top-4 right-4 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md p-5 shadow-xl w-56">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent mb-3">Featured Project</p>
                <div className="space-y-2 text-xs">
                  {[
                    ['Style', 'Topographic'],
                    ['Type', 'Engineering'],
                    ['Area', '1,200 Ha'],
                    ['Accuracy', '±10mm'],
                    ['Location', 'Lagos'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-gray-100 dark:border-white/10 pb-1">
                      <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wider">{k}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sub-navigation strip */}
        <div className="border-t border-b border-gray-200 dark:border-white/10 bg-gray-50/80 dark:bg-[#111]/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex gap-6 overflow-x-auto py-3 scrollbar-hide">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="text-[10px] uppercase tracking-[0.25em] font-bold text-gray-500 dark:text-gray-400 hover:text-accent transition-colors whitespace-nowrap"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SERVICES ═══════════ */}
      <section id="services" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div variants={container} initial="hidden" whileInView="visible" viewport={sectionViewport}>
          <motion.div variants={item}><SectionTag>What We Do</SectionTag></motion.div>
          <motion.div variants={item}><SectionTitle>Survey Services</SectionTitle></motion.div>
          <motion.p variants={item} className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mb-16">
            Nine specialised surveying disciplines — each delivered with modern equipment, SURCON-certified professionals, and digital deliverables.
          </motion.p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SURVEY_SERVICES.map((svc, i) => (
            <motion.div
              key={svc.id}
              className="group border border-gray-200 dark:border-white/10 p-6 hover:border-accent/50 transition-all duration-300 relative overflow-hidden"
              initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={shouldReduce ? {} : { y: -4 }}
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <span className="text-3xl mb-4 block">{svc.icon}</span>
              <h3 className="text-lg font-heading font-bold mb-2">{svc.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{svc.description}</p>
              <span className="absolute bottom-4 right-4 text-[10px] font-mono text-gray-300 dark:text-white/10">0{i + 1}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════ PROJECTS ═══════════ */}
      <section id="projects" className="py-24 bg-gray-50 dark:bg-[#111]">
        <div className="px-6 md:px-12 max-w-7xl mx-auto">
          <motion.div variants={container} initial="hidden" whileInView="visible" viewport={sectionViewport}>
            <motion.div variants={item}><SectionTag>Our Work</SectionTag></motion.div>
            <motion.div variants={item}><SectionTitle>Featured Projects</SectionTitle></motion.div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {SURVEY_PROJECTS.map((proj, i) => (
              <motion.div
                key={proj.id}
                className="group relative overflow-hidden bg-white dark:bg-[#1a1a1a] shadow-sm hover:shadow-xl transition-shadow duration-500"
                initial={shouldReduce ? {} : { opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="relative h-64 overflow-hidden">
                  <img src={proj.image} alt={proj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-3 left-4 bg-accent text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1">{proj.type}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-heading font-bold mb-2">{proj.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{proj.description}</p>
                  <div className="flex gap-6 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">
                    <span>📍 {proj.location}</span>
                    <span>📐 {proj.area}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ EQUIPMENT ═══════════ */}
      <section id="equipment" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div variants={container} initial="hidden" whileInView="visible" viewport={sectionViewport}>
          <motion.div variants={item}><SectionTag>Our Arsenal</SectionTag></motion.div>
          <motion.div variants={item}><SectionTitle>Survey Equipment</SectionTitle></motion.div>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          {SURVEY_EQUIPMENT.map((eq, i) => (
            <motion.div
              key={eq.name}
              className="group text-center"
              initial={shouldReduce ? {} : { opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="aspect-square bg-gray-100 dark:bg-[#1a1a1a] overflow-hidden mb-4 border border-gray-200 dark:border-white/10">
                <img src={eq.image} alt={eq.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider">{eq.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════ GALLERY ═══════════ */}
      <section id="gallery" className="py-24 bg-gray-50 dark:bg-[#111]">
        <div className="px-6 md:px-12 max-w-7xl mx-auto">
          <motion.div variants={container} initial="hidden" whileInView="visible" viewport={sectionViewport}>
            <motion.div variants={item}><SectionTag>In The Field</SectionTag></motion.div>
            <motion.div variants={item}><SectionTitle>Gallery</SectionTitle></motion.div>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-12">
            {[
              'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop',
            ].map((src, i) => (
              <motion.div
                key={i}
                className="overflow-hidden aspect-square"
                initial={shouldReduce ? {} : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <img src={src} alt={`Survey gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section id="testimonials" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div variants={container} initial="hidden" whileInView="visible" viewport={sectionViewport}>
          <motion.div variants={item}><SectionTag>Client Stories</SectionTag></motion.div>
          <motion.div variants={item}><SectionTitle>What They Say</SectionTitle></motion.div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {SURVEY_TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              className="border border-gray-200 dark:border-white/10 p-8 relative"
              initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <span className="text-5xl text-accent/20 font-serif absolute top-4 left-6">"</span>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 mt-8 italic">{t.quote}</p>
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section id="faq" className="py-24 bg-gray-50 dark:bg-[#111]">
        <div className="px-6 md:px-12 max-w-7xl mx-auto">
          <motion.div variants={container} initial="hidden" whileInView="visible" viewport={sectionViewport}>
            <motion.div variants={item}><SectionTag>Common Questions</SectionTag></motion.div>
            <motion.div variants={item}><SectionTitle>FAQ</SectionTitle></motion.div>
          </motion.div>
          <div className="max-w-3xl mt-12">
            {SURVEY_FAQ.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ═══════════ BOOKING FORM ═══════════ */}
      <section id="book-survey" className="py-24 bg-accent">
        <div className="px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row gap-16">
          <motion.div className="w-full md:w-1/2" variants={container} initial="hidden" whileInView="visible" viewport={sectionViewport}>
            <motion.div variants={item}>
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">Book a Survey</h2>
              <p className="text-white/90 text-lg leading-relaxed mb-8">
                Tell us about your project and we'll get back to you within 24 hours with a detailed scope and quote.
              </p>
            </motion.div>
            <motion.div variants={item} className="space-y-3">
              <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm">
                <span>✉️</span> {CONTACT.email}
              </a>
              <a href={`tel:${CONTACT.phoneE164}`} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm">
                <span>📞</span> {CONTACT.phoneDisplay}
              </a>
            </motion.div>
          </motion.div>

          <div className="w-full md:w-1/2">
            <form onSubmit={handleBooking} className="space-y-5">
              <input type="text" placeholder="Full name *" required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                className="w-full bg-transparent border-b-2 border-white/40 py-3 text-white placeholder-white/60 focus:outline-none focus:border-white transition-colors" />
              <input type="email" placeholder="Email address *" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-transparent border-b-2 border-white/40 py-3 text-white placeholder-white/60 focus:outline-none focus:border-white transition-colors" />
              <input type="tel" placeholder="Phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-transparent border-b-2 border-white/40 py-3 text-white placeholder-white/60 focus:outline-none focus:border-white transition-colors" />
              <select value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} required
                className={`w-full bg-transparent border-b-2 border-white/40 py-3 text-white focus:outline-none focus:border-white transition-colors appearance-none ${!form.service ? 'text-white/60' : ''}`}>
                <option value="" className="text-gray-900">Select service *</option>
                {SURVEY_SERVICES.map(s => <option key={s.id} value={s.title} className="text-gray-900">{s.title}</option>)}
              </select>
              <input type="text" placeholder="Project location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full bg-transparent border-b-2 border-white/40 py-3 text-white placeholder-white/60 focus:outline-none focus:border-white transition-colors" />
              <input type="date" value={form.preferred_date} onChange={e => setForm({ ...form, preferred_date: e.target.value })}
                className="w-full bg-transparent border-b-2 border-white/40 py-3 text-white placeholder-white/60 focus:outline-none focus:border-white transition-colors" />
              <textarea placeholder="Additional notes..." rows="3" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-transparent border-b-2 border-white/40 py-3 text-white placeholder-white/60 focus:outline-none focus:border-white transition-colors resize-y min-h-[60px]" />
              <button type="submit" disabled={formStatus === 'submitting' || formStatus === 'success'}
                className={`w-full py-4 text-center text-lg font-bold uppercase transition-colors ${formStatus === 'success' ? 'bg-green-600 text-white' : formStatus === 'submitting' ? 'bg-white/20 text-white/50 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-100'}`}>
                {formStatus === 'success' ? '✓ Request Sent!' : formStatus === 'submitting' ? 'Sending...' : 'Submit Request'}
              </button>
              {formStatus === 'error' && <p className="text-red-200 text-sm text-center">Something went wrong. Please try again.</p>}
            </form>
          </div>
        </div>
      </section>

      {/* ═══════════ CONTACT ═══════════ */}
      <section id="contact" className="py-24 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <SectionTag>Get in Touch</SectionTag>
        <SectionTitle className="mx-auto">Ready to Start?</SectionTitle>
        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-xl mx-auto mb-10">
          Have questions or need a custom quote? Reach out and our team will respond within hours.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a href={`mailto:${CONTACT.email}`}
            className="bg-accent text-white font-bold uppercase text-[11px] px-10 py-4 tracking-[0.2em] hover:bg-black transition-all shadow-lg">
            Email Us
          </a>
          <a href={`https://wa.me/${CONTACT.phoneE164}`} target="_blank" rel="noopener noreferrer"
            className="border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-bold uppercase text-[11px] px-10 py-4 tracking-[0.2em] hover:bg-accent hover:border-accent hover:text-white transition-all">
            WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
};

export default SurveyHomePage;
