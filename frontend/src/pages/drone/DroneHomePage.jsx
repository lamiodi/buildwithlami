import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { api } from '../../services/api';
import { CONTACT } from '../../config/contact';
import {
  DRONE_SERVICES, DRONE_PROJECTS, DRONE_EQUIPMENT,
  DRONE_FAQ, DRONE_TESTIMONIALS, DRONE_INDUSTRIES,
} from '../../data/divisions';
import {
  staggerContainer, fadeUpItem, buttonHover, buttonTap,
  sectionViewport, reducedMotionVariants,
} from '../../utils/motion';

const SectionTag = ({ children }) => (
  <p className="text-accent uppercase tracking-[0.3em] text-[11px] font-bold mb-4">{children}</p>
);
const SectionTitle = ({ children, className = '' }) => (
  <h2 className={`text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-[1.05] tracking-tight mb-6 ${className}`}>{children}</h2>
);

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left group">
        <span className="text-lg font-semibold text-white group-hover:text-accent transition-colors pr-4">{q}</span>
        <span className="text-2xl text-accent shrink-0 transition-transform duration-300" style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 pb-5' : 'max-h-0'}`}>
        <p className="text-gray-400 leading-relaxed">{a}</p>
      </div>
    </div>
  );
};

const DroneHomePage = () => {
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  const [form, setForm] = useState({ full_name: '', email: '', phone: '', service: '', location: '', preferred_date: '', notes: '' });
  const [formStatus, setFormStatus] = useState('idle');

  const handleBooking = async (e) => {
    e.preventDefault();
    setFormStatus('submitting');
    const res = await api.post('/bookings', { ...form, division: 'DRONE' });
    if (res.ok) {
      setFormStatus('success');
      setForm({ full_name: '', email: '', phone: '', service: '', location: '', preferred_date: '', notes: '' });
      setTimeout(() => setFormStatus('idle'), 4000);
    } else {
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 4000);
    }
  };

  const sections = [
    { id: 'services', label: 'Services' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'industries', label: 'Industries' },
    { id: 'equipment', label: 'Equipment' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'faq', label: 'FAQ' },
    { id: 'book-flight', label: 'Book Flight' },
  ];
  const scrollTo = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); };

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen">

      {/* ═══════════ HERO — dark, technical, product-launch feel ═══════════ */}
      <section id="drone-hero" className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a]" />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full flex flex-col lg:flex-row items-center gap-12 py-16">
          {/* Left — hero image with annotation callouts */}
          <motion.div
            className="w-full lg:w-3/5 relative"
            initial={shouldReduce ? {} : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=2070&auto=format&fit=crop"
                alt="Professional drone in flight"
                className="w-full h-[400px] md:h-[500px] object-cover"
              />
              {/* Annotation callouts */}
              {[
                { label: 'RTK Positioning', top: '15%', left: '10%' },
                { label: '4K Camera System', top: '25%', right: '15%' },
                { label: '45 Min Flight Time', bottom: '30%', left: '5%' },
                { label: 'Autonomous Navigation', bottom: '15%', right: '10%' },
              ].map((ann, i) => (
                <motion.div
                  key={i}
                  className="absolute hidden md:flex items-center gap-2"
                  style={{ top: ann.top, left: ann.left, right: ann.right, bottom: ann.bottom }}
                  initial={shouldReduce ? {} : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 + i * 0.2, duration: 0.5 }}
                >
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 bg-black/60 backdrop-blur-sm px-2 py-1">{ann.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — headline + CTA */}
          <motion.div className="w-full lg:w-2/5" variants={container} initial="hidden" animate="visible">
            <motion.div variants={item}><SectionTag>Lami Drone Division</SectionTag></motion.div>
            <motion.h1 variants={item} className="text-5xl md:text-6xl lg:text-7xl font-heading font-black leading-[0.92] tracking-tight mb-6">
              Aerial <br/><span className="text-accent">Intelligence</span><br/>Solutions
            </motion.h1>
            <motion.p variants={item} className="text-gray-400 text-lg max-w-md leading-relaxed mb-8">
              Professional drone services for surveying, inspection, and monitoring. NCAA-licensed operations with centimetre-level accuracy.
            </motion.p>
            <motion.div variants={item} className="flex flex-wrap gap-4">
              <motion.button onClick={() => scrollTo('book-flight')}
                className="bg-accent text-white font-bold uppercase text-[11px] px-10 py-4 tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-lg shadow-accent/20"
                whileHover={shouldReduce ? {} : buttonHover} whileTap={shouldReduce ? {} : buttonTap}>
                Book a Flight
              </motion.button>
              <motion.button onClick={() => scrollTo('portfolio')}
                className="text-gray-400 text-[11px] uppercase tracking-[0.2em] font-bold hover:text-accent transition-all py-4 px-4"
                whileHover={shouldReduce ? {} : buttonHover} whileTap={shouldReduce ? {} : buttonTap}>
                View Portfolio →
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Trusted-by logo strip */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/5 bg-[#0a0a0a]/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center gap-8 overflow-x-auto">
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold whitespace-nowrap">Trusted By:</span>
            {['Julius Berger', 'NNPC', 'Dangote Group', 'Lagos State', 'NESREA', 'Shell'].map(name => (
              <span key={name} className="text-[11px] uppercase tracking-[0.15em] font-bold text-gray-500 whitespace-nowrap">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Sub-nav */}
      <div className="border-b border-white/5 bg-[#0d0d0d] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex gap-6 overflow-x-auto py-3 scrollbar-hide">
          {sections.map(s => (
            <button key={s.id} onClick={() => scrollTo(s.id)}
              className="text-[10px] uppercase tracking-[0.25em] font-bold text-gray-500 hover:text-accent transition-colors whitespace-nowrap">{s.label}</button>
          ))}
        </div>
      </div>

      {/* ═══════════ SERVICES ═══════════ */}
      <section id="services" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div variants={container} initial="hidden" whileInView="visible" viewport={sectionViewport}>
          <motion.div variants={item}><SectionTag>Capabilities</SectionTag></motion.div>
          <motion.div variants={item}><SectionTitle>Drone Services</SectionTitle></motion.div>
          <motion.p variants={item} className="text-gray-400 text-lg max-w-2xl mb-16">
            Nine specialised drone service lines — from photogrammetry mapping to thermal inspection — all delivered by NCAA-licensed pilots.
          </motion.p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DRONE_SERVICES.map((svc, i) => (
            <motion.div key={svc.id}
              className="group border border-white/5 bg-[#111] p-6 hover:border-accent/30 transition-all duration-300 relative overflow-hidden"
              initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={shouldReduce ? {} : { y: -4 }}>
              <div className="absolute top-0 left-0 w-full h-[2px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <span className="text-3xl mb-4 block">{svc.icon}</span>
              <h3 className="text-lg font-heading font-bold mb-2">{svc.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{svc.description}</p>
              <span className="absolute bottom-4 right-4 text-[10px] font-mono text-white/5">0{i + 1}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════ PORTFOLIO ═══════════ */}
      <section id="portfolio" className="py-24 bg-[#111]">
        <div className="px-6 md:px-12 max-w-7xl mx-auto">
          <motion.div variants={container} initial="hidden" whileInView="visible" viewport={sectionViewport}>
            <motion.div variants={item}><SectionTag>Our Work</SectionTag></motion.div>
            <motion.div variants={item}><SectionTitle>Flight Portfolio</SectionTitle></motion.div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {DRONE_PROJECTS.map((proj, i) => (
              <motion.div key={proj.id}
                className="group relative overflow-hidden bg-[#1a1a1a] border border-white/5 hover:border-accent/20 transition-all duration-500"
                initial={shouldReduce ? {} : { opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}>
                <div className="relative h-64 overflow-hidden">
                  <img src={proj.image} alt={proj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute bottom-3 left-4 bg-accent text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1">{proj.type}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-heading font-bold mb-2">{proj.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">{proj.description}</p>
                  <div className="flex gap-6 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-600">
                    <span>📍 {proj.location}</span>
                    <span>📐 {proj.area}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ INDUSTRIES ═══════════ */}
      <section id="industries" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div variants={container} initial="hidden" whileInView="visible" viewport={sectionViewport}>
          <motion.div variants={item}><SectionTag>Sectors</SectionTag></motion.div>
          <motion.div variants={item}><SectionTitle>Industries We Serve</SectionTitle></motion.div>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {DRONE_INDUSTRIES.map((ind, i) => (
            <motion.div key={ind.name}
              className="border border-white/5 bg-[#111] p-6 text-center hover:border-accent/30 transition-all group"
              initial={shouldReduce ? {} : { opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={shouldReduce ? {} : { y: -4 }}>
              <span className="text-4xl block mb-3">{ind.icon}</span>
              <p className="text-sm font-bold uppercase tracking-wider">{ind.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════ EQUIPMENT ═══════════ */}
      <section id="equipment" className="py-24 bg-[#111]">
        <div className="px-6 md:px-12 max-w-7xl mx-auto">
          <motion.div variants={container} initial="hidden" whileInView="visible" viewport={sectionViewport}>
            <motion.div variants={item}><SectionTag>Fleet</SectionTag></motion.div>
            <motion.div variants={item}><SectionTitle>Our Drones</SectionTitle></motion.div>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {DRONE_EQUIPMENT.map((eq, i) => (
              <motion.div key={eq.name} className="group text-center"
                initial={shouldReduce ? {} : { opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}>
                <div className="aspect-square bg-[#1a1a1a] overflow-hidden mb-4 border border-white/5 group-hover:border-accent/20 transition-colors">
                  <img src={eq.image} alt={eq.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider">{eq.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ GALLERY ═══════════ */}
      <section id="gallery" className="py-24">
        <div className="px-6 md:px-12 max-w-7xl mx-auto">
          <motion.div variants={container} initial="hidden" whileInView="visible" viewport={sectionViewport}>
            <motion.div variants={item}><SectionTag>Aerial Views</SectionTag></motion.div>
            <motion.div variants={item}><SectionTitle>Gallery</SectionTitle></motion.div>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-12">
            {[
              'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?q=80&w=600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1527576539890-dfa815648363?q=80&w=600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1506947411487-a56738c182cc?q=80&w=600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1579829366248-204fe8413f31?q=80&w=600&auto=format&fit=crop',
            ].map((src, i) => (
              <motion.div key={i} className="overflow-hidden aspect-square"
                initial={shouldReduce ? {} : { opacity: 0 }}
                whileInView={{ opacity: 1 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}>
                <img src={src} alt={`Drone gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section id="testimonials" className="py-24 bg-[#111]">
        <div className="px-6 md:px-12 max-w-7xl mx-auto">
          <motion.div variants={container} initial="hidden" whileInView="visible" viewport={sectionViewport}>
            <motion.div variants={item}><SectionTag>Client Stories</SectionTag></motion.div>
            <motion.div variants={item}><SectionTitle>What They Say</SectionTitle></motion.div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {DRONE_TESTIMONIALS.map((t, i) => (
              <motion.div key={i} className="border border-white/5 bg-[#1a1a1a] p-8 relative"
                initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}>
                <span className="text-5xl text-accent/20 font-serif absolute top-4 left-6">"</span>
                <p className="text-gray-400 leading-relaxed mb-6 mt-8 italic">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-[11px] text-gray-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section id="faq" className="py-24">
        <div className="px-6 md:px-12 max-w-7xl mx-auto">
          <motion.div variants={container} initial="hidden" whileInView="visible" viewport={sectionViewport}>
            <motion.div variants={item}><SectionTag>Questions</SectionTag></motion.div>
            <motion.div variants={item}><SectionTitle>FAQ</SectionTitle></motion.div>
          </motion.div>
          <div className="max-w-3xl mt-12">
            {DRONE_FAQ.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ═══════════ BOOKING FORM ═══════════ */}
      <section id="book-flight" className="py-24 bg-accent">
        <div className="px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row gap-16">
          <motion.div className="w-full md:w-1/2" variants={container} initial="hidden" whileInView="visible" viewport={sectionViewport}>
            <motion.div variants={item}>
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">Book a Flight</h2>
              <p className="text-white/90 text-lg leading-relaxed mb-8">
                Tell us about your aerial project and we'll provide a detailed flight plan and quote within 24 hours.
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
                {DRONE_SERVICES.map(s => <option key={s.id} value={s.title} className="text-gray-900">{s.title}</option>)}
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
        <SectionTitle className="mx-auto">Ready for Takeoff?</SectionTitle>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
          Have questions or need a custom flight plan? Reach out and our team will respond within hours.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a href={`mailto:${CONTACT.email}`}
            className="bg-accent text-white font-bold uppercase text-[11px] px-10 py-4 tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-lg">
            Email Us
          </a>
          <a href={`https://wa.me/${CONTACT.phoneE164}`} target="_blank" rel="noopener noreferrer"
            className="border-2 border-white text-white font-bold uppercase text-[11px] px-10 py-4 tracking-[0.2em] hover:bg-accent hover:border-accent transition-all">
            WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
};

export default DroneHomePage;
