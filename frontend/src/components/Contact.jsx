import { useState, useRef, useEffect } from 'react';
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
import { Mail, Send, CheckCircle2, ShieldCheck, Code } from 'lucide-react';

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
    project_type: '', timeline: '',
    b_website: ''
  });
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);
  const feedbackRef = useRef(null);
  const submittingRef = useRef(false);
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  useEffect(() => {
    if (status === 'success' || status === 'error') feedbackRef.current?.focus();
  }, [status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current || status === 'success') return;
    const invalid = {};
    if (!formData.name.trim()) invalid.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) invalid.email = 'Please enter a valid email address.';
    if (!formData.message.trim()) invalid.message = 'Tell us a little about your project.';
    setErrors(invalid);
    if (Object.keys(invalid).length) {
      formRef.current?.querySelector('[name="' + Object.keys(invalid)[0] + '"]')?.focus();
      return;
    }
    submittingRef.current = true;
    setStatus('submitting');
    try {
      const res = await api.post('/contact', {
        full_name: formData.name.trim(), email: formData.email.trim(), message: formData.message.trim(),
        project_type: formData.project_type || null, timeline: formData.timeline || null,
        service: null, tier: null, currency: null, b_website: formData.b_website || null,
      });
      if (!res.ok) throw new Error('Submission failed');
      setStatus('success');
      setFormData({ name: '', email: '', message: '', project_type: '', timeline: '', b_website: '' });
    } catch {
      setStatus('error');
    } finally {
      submittingRef.current = false;
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
                <span>Let’s talk about your project</span>
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
              <h3 className="text-white font-semibold">What happens next?</h3>
              <p className="text-sm text-gray-300 leading-relaxed">I’ll review your brief, clarify the scope with you, and prepare a proposal. We agree the deliverables and price before work begins.</p>
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
            <form ref={formRef} onSubmit={handleSubmit} noValidate aria-label="Software project enquiry" className="space-y-5 bg-white/[0.04] border border-white/10 p-6 sm:p-8 rounded-2xl">
              <p className="text-sm leading-relaxed text-gray-300">A short outline is enough to start. Fields marked * are required.</p>
              <fieldset disabled={status === 'submitting' || status === 'success'} className="space-y-5 min-w-0 disabled:opacity-60">
              <legend className="sr-only">Your contact details and project</legend>
              {/* Spam Honeypot Field — Hidden from humans, traps automated spam bots */}
              <div className="absolute -left-[9999px] top-auto w-px h-px overflow-hidden opacity-0" aria-hidden="true">
                <label htmlFor="b_website">Leave this field blank</label>
                <input
                  type="text"
                  id="b_website"
                  name="b_website"
                  tabIndex="-1"
                  autoComplete="off"
                  value={formData.b_website}
                  onChange={(e) => setFormData({ ...formData, b_website: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="home-contact-name" className="block text-sm font-medium text-gray-200 mb-2">Your Name *</label>
                  <input
                    id="home-contact-name" name="name" maxLength={120} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'home-contact-name-error' : undefined}
                    type="text"
                    placeholder="e.g. Alex Morgan"
                    required
                    value={formData.name}
                    onChange={(e) => { setFormData({...formData, name: e.target.value}); setErrors(current => ({...current, name: ''})); }}
                    className="bwl-input text-white !text-base"
                  />
                  {errors.name && <p id="home-contact-name-error" role="alert" className="text-sm text-red-300 mt-2">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="home-contact-email" className="block text-sm font-medium text-gray-200 mb-2">Email Address *</label>
                  <input
                    id="home-contact-email" name="email" maxLength={254} autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'home-contact-email-error' : undefined}
                    type="email"
                    placeholder="alex@company.com"
                    required
                    value={formData.email}
                    onChange={(e) => { setFormData({...formData, email: e.target.value}); setErrors(current => ({...current, email: ''})); }}
                    className="bwl-input text-white !text-base"
                  />
                  {errors.email && <p id="home-contact-email-error" role="alert" className="text-sm text-red-300 mt-2">{errors.email}</p>}
                </div>
              </div>

              {/* Pre-qualification Selects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="home-contact-project_type" className="block text-sm font-medium text-gray-200 mb-2">
                    Project Type (optional)
                  </label>
                  <Select
                    value={formData.project_type}
                    onValueChange={(val) => setFormData({...formData, project_type: val})}
                  >
                    <SelectTrigger id="home-contact-project_type" className="w-full bg-white/5 hover:bg-white/10 border-white/15 text-white rounded-xl h-12 text-base focus:outline-none focus:border-accent dark:focus:border-accent focus:ring-0 transition-colors">
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
                  <label htmlFor="home-contact-timeline" className="block text-sm font-medium text-gray-200 mb-2">
                    Target Timeline (optional)
                  </label>
                  <Select
                    value={formData.timeline}
                    onValueChange={(val) => setFormData({...formData, timeline: val})}
                  >
                    <SelectTrigger id="home-contact-timeline" className="w-full bg-white/5 hover:bg-white/10 border-white/15 text-white rounded-xl h-12 text-base focus:outline-none focus:border-accent dark:focus:border-accent focus:ring-0 transition-colors">
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
                <label htmlFor="home-contact-message" className="block text-sm font-medium text-gray-200 mb-2">What would you like to build or improve? *</label>
                <textarea id="home-contact-message" name="message" maxLength={5000}  aria-invalid={!!errors.message} aria-describedby={errors.message ? 'home-contact-message-error' : undefined} 
                  placeholder="A few sentences about your idea, who it is for, or what is not working today…"
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => { setFormData({...formData, message: e.target.value}); setErrors(current => ({...current, message: ''})); }}
                  className="bwl-input text-white !text-base min-h-[100px] resize-y"
                ></textarea>
                  {errors.message && <p id="home-contact-message-error" role="alert" className="text-sm text-red-300 mt-2">{errors.message}</p>}
              </div>
              
              </fieldset>
              <button 
                type="submit"
                aria-busy={status === 'submitting'} 
                disabled={status === 'submitting' || status === 'success'}
                className="btn-primary w-full"
              >
                {status === 'success' ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    Message Sent Successfully
                  </span>
                ) : status === 'submitting' ? (
                  'Sending your enquiry…'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="w-3.5 h-3.5" />
                    Send your enquiry →
                  </span>
                )}
              </button>
              
              {status === 'success' && (
                <div ref={feedbackRef} tabIndex={-1} role="status" className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-4 text-sm text-white leading-relaxed">
                  <p className="font-semibold mb-1">Thank you — your enquiry is in.</p>
                  <p>I’ll review your brief and reply by email to discuss the next step.</p>
                  <button type="button" className="underline underline-offset-4 mt-3 min-h-11" onClick={() => { setStatus('idle'); requestAnimationFrame(() => formRef.current?.querySelector('[name="name"]')?.focus()); }}>Send another enquiry</button>
                </div>
              )}
              {status === 'error' && (
                <p ref={feedbackRef} tabIndex={-1} role="alert" className="text-red-300 text-sm leading-relaxed">
                  We couldn’t confirm delivery. Your details are still here — please try again, or <a className="underline" href={`mailto:${CONTACT.email}`}>email us directly</a>.
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
