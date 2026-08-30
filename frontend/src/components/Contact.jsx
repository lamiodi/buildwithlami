import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { api } from '../services/api';
import { staggerContainer, fadeUpItem, sectionViewport, reducedMotionVariants } from '../utils/motion';
import { CONTACT } from '../config/contact';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Mail, Send, CheckCircle2, Sparkles, ShieldCheck, Code } from 'lucide-react';

const projectTypes = [
  'Business Website',
  'E-Commerce Store',
  'Custom Software',
  'Business Portal / ERP',
  'UI/UX Design',
  'Branding',
  'SEO & Growth',
  'Marketing',
  'AI & Automations',
  'Maintenance',
  'Other',
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
    project_type: '', timeline: ''
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
      timeline: formData.timeline || null,
      service: null,
      tier: null,
      currency: null,
    });

    if (res.ok) {
      setStatus('success');
      setFormData({ name: '', email: '', message: '', project_type: '', timeline: '' });
      setTimeout(() => setStatus('idle'), 4000);
    } else {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-20 md:py-24 w-full">
      <div className="bg-gradient-to-br from-[#161616] via-[#141414] to-black border-y border-white/10 sm:border sm:border-white/10 sm:rounded-3xl p-6 sm:p-10 md:p-12 lg:p-16 shadow-2xl relative overflow-hidden">
        {/* Top Accent Glow Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-accent to-transparent" />

        <motion.div
          className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-16 relative z-10"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          {/* Left Column: Value Prop & Direct Communication */}
          <div className="w-full lg:w-5/12 flex flex-col justify-between space-y-8">
            <motion.div variants={item} className="space-y-4">
              <div className="bwl-eyebrow">
                <span className="w-2 h-2 bg-accent inline-block" />
                <span>Project Inquiries · 24hr Turnaround</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight">
                Have a business problem to <span className="text-accent">solve?</span>
              </h2>
              <p className="text-gray-300 text-base md:text-lg font-light leading-relaxed">
                Tell me what you're trying to achieve. I'll help you determine what should be built, what can wait, and the fastest path to production.
              </p>
            </motion.div>

            {/* Reassurance Metrics */}
            <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-heading font-bold text-white uppercase tracking-wider block">50/50 Billing</span>
                  <span className="text-[11px] text-gray-400">Milestone protected</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                <Code className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-heading font-bold text-white uppercase tracking-wider block">100% IP Transfer</span>
                  <span className="text-[11px] text-gray-400">Full repository handover</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={item} className="space-y-3 pt-4 border-t border-white/10">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-300 block">
                Prefer Direct Email?
              </span>
              <a
                href={`mailto:${CONTACT.email}`}
                className="w-full py-4 px-6 border border-white/20 hover:border-accent text-white hover:text-accent font-heading font-bold text-[11px] uppercase tracking-[0.15em] transition-all duration-300 inline-flex items-center justify-center text-center bg-white/5 hover:bg-white/10 active:scale-[0.98] cursor-pointer"
              >
                <Mail className="w-4 h-4 mr-2 text-accent" />
                {CONTACT.email}
              </a>
            </motion.div>
          </div>

          {/* Right Column: Interactive Intake Form
              NOTE: no motion wrapper here — iOS Safari has a known bug where
              backdrop-filter inside an opacity-transitioning element swallows
              the first tap on form controls. Keeping this plain keeps the
              form fully interactive from the first frame on mobile. */}
          <div className="w-full lg:w-7/12">
            <form onSubmit={handleSubmit} className="space-y-5 bg-white/[0.04] border border-white/10 p-6 sm:p-8 rounded-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Morgan"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bwl-input text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="alex@company.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="bwl-input text-white"
                  />
                </div>
              </div>

              {/* Pre-qualification Selects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Project Type
                  </label>
                  <Select
                    value={formData.project_type}
                    onValueChange={(val) => setFormData({...formData, project_type: val})}
                  >
                    <SelectTrigger className="w-full bg-white/5 hover:bg-white/10 border-white/15 text-white rounded-xl h-11 text-xs focus:outline-none focus:border-accent dark:focus:border-accent focus:ring-0 transition-colors">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700 text-white shadow-2xl">
                      <SelectGroup>
                        {projectTypes.map(pt => (
                          <SelectItem key={pt} value={pt} className="focus:bg-accent focus:text-white cursor-pointer text-xs">
                            {pt}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Target Timeline
                  </label>
                  <Select
                    value={formData.timeline}
                    onValueChange={(val) => setFormData({...formData, timeline: val})}
                  >
                    <SelectTrigger className="w-full bg-white/5 hover:bg-white/10 border-white/15 text-white rounded-xl h-11 text-xs focus:outline-none focus:border-accent dark:focus:border-accent focus:ring-0 transition-colors">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700 text-white shadow-2xl">
                      <SelectGroup>
                        {timelines.map(t => (
                          <SelectItem key={t} value={t} className="focus:bg-accent focus:text-white cursor-pointer text-xs">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Project Details / Problem to Solve *
                </label>
                <textarea 
                  placeholder="Tell me about what you're building, key features needed, or current bottlenecks..."
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="bwl-input text-white min-h-[100px] resize-y"
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={status === 'submitting' || status === 'success'}
                className="btn-primary w-full"
              >
                {status === 'success' ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    Message Sent Successfully
                  </span>
                ) : status === 'submitting' ? (
                  'Transmitting Brief...'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="w-3.5 h-3.5" />
                    Send Project Brief →
                  </span>
                )}
              </button>
              
              {status === 'error' && (
                <p className="text-red-400 text-xs text-center font-mono">
                  There was an error sending your message. Please reach out directly to {CONTACT.email}.
                </p>
              )}

              <p className="text-[11px] text-gray-400 text-center font-body pt-1">
                * Direct founder-to-engineer review. Typical response within 24 hours.
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
