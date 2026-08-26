import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  Code, 
  Layers, 
  Cpu, 
  Zap, 
  Database, 
  Server, 
  CheckCircle, 
  ArrowRight, 
  Calculator, 
  Terminal, 
  Sparkles, 
  Clock, 
  Check, 
  FolderGit2,
  ChevronDown,
  Monitor,
  Workflow
} from 'lucide-react';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import fallbackProjects from '../../data/fallbackProjects';
import { BUILD_PRICING, COMMERCIAL_TERMS } from '../../config/pricing';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const PROJECT_TYPES = [
  { id: 'business', name: 'Business Corporate Platform', baseCostNGN: BUILD_PRICING.websites.tiers[1].priceNGN, baseWeeks: 3, icon: Layers, desc: 'Bespoke corporate website with CMS, lead capture automation, and SEO.' },
  { id: 'ecommerce', name: 'E-Commerce Growth Engine', baseCostNGN: BUILD_PRICING.ecommerce.tiers[1].priceNGN, baseWeeks: 4, icon: Zap, desc: 'Scalable commerce system with accounts, cart recovery, discount engine & payments.' },
  { id: 'mvp', name: 'MVP / Startup Prototype', baseCostNGN: BUILD_PRICING.software.tiers[0].priceNGN, baseWeeks: 6, icon: Database, desc: 'Custom full-stack software built to test product-market fit and onboard early users.' },
  { id: 'growth_platform', name: 'Growth Platform & Custom ERP', baseCostNGN: BUILD_PRICING.software.tiers[1].priceNGN, baseWeeks: 8, icon: Server, desc: 'Scaling business software with multi-role workflows, automated ledgers & portals.' },
  { id: 'saas_enterprise', name: 'Enterprise Multi-Tenant SaaS', baseCostNGN: BUILD_PRICING.software.tiers[2].priceNGN, baseWeeks: 12, icon: Cpu, desc: 'Mission-critical distributed architecture, subscription billing, and production-grade cloud architecture.' },
];

const ADDON_OPTIONS = [
  { id: 'auth_2fa', name: 'Advanced Auth & 2FA Security', costNGN: 85000, weeks: 0.5 },
  { id: 'payment_gateway', name: 'Paystack / Stripe / Grey Gateway', costNGN: 120000, weeks: 0.5 },
  { id: 'crm_leads', name: 'Custom CRM Pipeline & Leads Automation', costNGN: 150000, weeks: 1 },
  { id: 'seo_cwv', name: 'Core Web Vitals & Technical SEO Compliance', costNGN: 95000, weeks: 0.5 },
  { id: 'portal_vault', name: 'Client Portal & Protected Data Vault', costNGN: 180000, weeks: 1 },
];

const TECH_CATEGORIES = [
  {
    name: 'Frontend',
    icon: Monitor,
    description: 'Modern, responsive, and accessible interfaces built for speed.',
    items: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion']
  },
  {
    name: 'Backend & APIs',
    icon: Server,
    description: 'Structured, reliable server architectures with safe data modeling.',
    items: ['Node.js', 'Express', 'PostgreSQL', 'Prisma', 'REST APIs']
  },
  {
    name: 'Infrastructure & Cloud',
    icon: Cpu,
    description: 'Automated deployment workflows, secure hosting, and edge performance.',
    items: ['Vercel', 'Render', 'Supabase', 'Docker', 'GitHub Actions']
  },
  {
    name: 'Integrations & Payments',
    icon: Workflow,
    description: 'Seamless payment gateways, media delivery, and communications.',
    items: ['Paystack', 'Stripe', 'Cloudinary', 'Resend', 'WhatsApp API']
  }
];

const FAQS = [
  {
    q: 'Do I own 100% of the code and intellectual property?',
    a: 'Yes, unconditionally. Upon final milestone payment, full copyright and repository ownership (GitHub transfer) is assigned to you with comprehensive documentation.'
  },
  {
    q: 'How are payments structured for software projects?',
    a: 'Software projects are structured with a transparent 50/50 milestone payment model: 50% upfront to reserve your schedule and begin architecture & development, and the remaining 50% upon final delivery, testing, and production deployment. I accept NGN via Paystack and international bank transfer.'
  },
  {
    q: 'What post-launch support and warranty is included?',
    a: 'Every custom software build includes 90 days of complimentary bug fixes, performance monitoring, and security patching after launch.'
  },
  {
    q: 'Can you work with existing codebases and legacy systems?',
    a: 'Yes. I frequently conduct code audits, refactoring, performance optimizations, and feature expansions for existing React, Node, Python, and PostgreSQL systems.'
  }
];

const SoftwareHomePage = () => {
  const shouldReduce = useReducedMotion();
  
  // Interactive Estimator State
  const [selectedType, setSelectedType] = useState(PROJECT_TYPES[1]);
  const [selectedAddons, setSelectedAddons] = useState(['auth_2fa', 'payment_gateway']);
  const [activeFaq, setActiveFaq] = useState(null);

  // Live projects from API
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Software Engineering & Architecture | BuildWithLami";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "BuildWithLami Software Division: Custom web platforms, high-performance applications, secure APIs, and tailored SaaS systems built by Eugene Odibenuah.");
    }

    const fetchSoftwareProjects = async () => {
      try {
        const res = await api.get('/projects/division/SOFTWARE');
        const list = res.data?.data ?? [];
        if (res.ok && list.length > 0) {
          setProjects(list.slice(0, 4));
        } else {
          setProjects(fallbackProjects.slice(0, 4));
        }
      } catch {
        setProjects(fallbackProjects.slice(0, 4));
      }
    };
    fetchSoftwareProjects();
  }, []);

  const toggleAddon = (id) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Compute estimate
  const calculatedEstimate = useMemo(() => {
    let base = selectedType.baseCostNGN;
    let weeks = selectedType.baseWeeks;

    selectedAddons.forEach(addonId => {
      const addon = ADDON_OPTIONS.find(a => a.id === addonId);
      if (addon) {
        base += addon.costNGN;
        weeks += addon.weeks;
      }
    });

    const upfrontAmount = Math.round(base * 0.5);
    const deliveryAmount = base - upfrontAmount;

    return {
      total: base,
      cost: `₦${base.toLocaleString()}`,
      upfront: `₦${upfrontAmount.toLocaleString()}`,
      delivery: `₦${deliveryAmount.toLocaleString()}`,
      weeks: Math.ceil(weeks),
      symbol: '₦'
    };
  }, [selectedType, selectedAddons]);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    message: '',
    honeypot: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.honeypot) return; // Drop spam
    if (!form.full_name || !form.email || !form.message) {
      notify.error('Please fill in your name, email, and project overview.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.full_name,
        email: form.email,
        phone: form.phone,
        service: `Software: ${selectedType.name}`,
        budget: calculatedEstimate.cost,
        timeline: `~${calculatedEstimate.weeks} Weeks`,
        message: `${form.message}\n\n[Automated Scope Summary]:\nArchitecture: ${selectedType.name}\nModules: ${selectedAddons.join(', ')}\nEstimate: ${calculatedEstimate.cost} (50% Upfront: ${calculatedEstimate.upfront} / 50% Delivery: ${calculatedEstimate.delivery})`
      };

      const res = await api.post('/contact', payload);
      if (res.ok) {
        setSubmitted(true);
        notify.success('Technical brief received! I will review your requirements and respond within 24 hours.');
        setForm({ full_name: '', email: '', phone: '', message: '', honeypot: '' });
      } else {
        notify.error(res.data?.error || 'Failed to submit brief. Please try again.');
      }
    } catch {
      notify.error('Network error. Please try again or reach out directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background text-gray-900 dark:text-white pt-24 font-body transition-colors duration-300">
      
      {/* ── HERO SECTION ── */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="bwl-eyebrow justify-center">
            <span className="w-2 h-2 bg-accent inline-block" />
            <span>Software Engineering & Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-heading tracking-tight text-gray-900 dark:text-white leading-[1.1]">
            Custom Web Platforms, <br className="hidden sm:inline" />
            <span className="text-accent">Built for Scale & Revenue.</span>
          </h1>

          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-3xl mx-auto">
            I engineer bespoke web applications, SaaS prototypes, custom ERP systems, and high-concurrency APIs. Every project includes full intellectual property transfer, transparent 50/50 milestone invoicing, and clean documentation.
          </p>

          {/* Key Value Metric Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-4 text-left">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 shadow-xs">
              <span className="text-base sm:text-lg font-bold font-heading text-accent block">50 / 50</span>
              <div className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-0.5">Milestone Terms</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 shadow-xs">
              <span className="text-base sm:text-lg font-bold font-heading text-accent block">100% IP</span>
              <div className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-0.5">Code Ownership</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 shadow-xs">
              <span className="text-base sm:text-lg font-bold font-heading text-accent block">90 Days</span>
              <div className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-0.5">Warranty Included</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 shadow-xs">
              <span className="text-base sm:text-lg font-bold font-heading text-accent block">&lt; 24 Hrs</span>
              <div className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-0.5">Typical Response</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a href="#estimator" className="btn-primary w-full sm:w-auto">
              Configure Project Scope & Calculator <Calculator className="w-4 h-4 ml-2" />
            </a>
            <Link to="/contact" className="btn-secondary w-full sm:w-auto">
              Book Architecture Consultation →
            </Link>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE SOFTWARE SCOPE & QUOTATION ESTIMATOR ── */}
      <section id="estimator" className="py-20 px-6 md:px-12 max-w-7xl mx-auto border-t border-gray-200 dark:border-white/10">
        <div className="mb-12">
          <div className="bwl-eyebrow mb-2">
            <span className="w-2 h-2 bg-accent inline-block" />
            <span>Interactive Project Estimator</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-gray-900 dark:text-white tracking-tight">
            Configure Your Software Architecture
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base max-w-2xl font-light">
            Select your baseline software archetype and modular capabilities to get an immediate cost and timeline breakdown with transparent 50/50 milestone terms.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Configuration Selectors (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
                01 — Select Baseline Platform Archetype
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {PROJECT_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType.id === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type)}
                      className={`p-5 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                        isSelected 
                          ? 'bg-accent/5 dark:bg-accent/10 border-accent ring-2 ring-accent/30 shadow-md scale-[1.01]' 
                          : 'bg-white dark:bg-[#141414] border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          {isSelected && <span className="text-[10px] font-mono font-bold uppercase text-accent bg-accent/10 px-2.5 py-0.5 rounded-full">Selected</span>}
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base font-heading">{type.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">{type.desc}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-accent">
                          ₦{type.baseCostNGN.toLocaleString()}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">~{type.baseWeeks} wks</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-xs font-mono font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  02 — Modular Infrastructure & Custom Modules
                </label>
                <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Optional capabilities</span>
              </div>
              <div className="space-y-3">
                {ADDON_OPTIONS.map(addon => {
                  const isChecked = selectedAddons.includes(addon.id);
                  return (
                    <div 
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                        isChecked 
                          ? 'bg-accent/5 dark:bg-accent/10 border-accent ring-1 ring-accent/20' 
                          : 'bg-white dark:bg-[#141414] border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isChecked ? 'bg-accent border-accent text-white' : 'border-gray-300 dark:border-white/20 bg-white dark:bg-black'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900 dark:text-white font-heading">{addon.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">+{addon.weeks} week sprint addition</p>
                        </div>
                      </div>
                      <div className="font-mono text-sm font-bold text-accent">
                        +₦{addon.costNGN.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Architectural Scope Summary (4 cols) */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 shadow-xl space-y-6">
              <div className="border-b border-gray-100 dark:border-white/5 pb-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-accent block mb-1">
                  Architectural Scope Summary
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-heading text-gray-900 dark:text-white mt-1 tracking-tight">
                  {calculatedEstimate.cost}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <Clock className="w-4 h-4 text-accent shrink-0" />
                  <span>Target Delivery: <strong className="text-gray-900 dark:text-white font-semibold">~{calculatedEstimate.weeks} Weeks Sprint</strong></span>
                </div>
              </div>

              {/* 50/50 Milestone Payment Structure Box */}
              <div className="p-4 rounded-2xl bg-accent/5 dark:bg-accent/10 border border-accent/20 space-y-2.5">
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-accent">
                  <span>Milestone Terms</span>
                  <span className="bg-accent text-white text-[9px] px-2 py-0.5 rounded-full font-mono font-bold">50 / 50</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-accent/20">
                  <div>
                    <span className="text-[10px] text-gray-600 dark:text-gray-400 block font-medium">1. 50% Kickoff Deposit</span>
                    <span className="text-xs font-bold font-mono text-gray-900 dark:text-white">{calculatedEstimate.upfront}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-600 dark:text-gray-400 block font-medium">2. 50% Final Delivery</span>
                    <span className="text-xs font-bold font-mono text-gray-900 dark:text-white">{calculatedEstimate.delivery}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Architecture:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedType.name}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Custom Modules:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedAddons.length} features selected</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Milestone Terms:</span>
                  <span className="font-bold text-accent">50% Kickoff / 50% Delivery</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Post-Launch Warranty:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">90 Days Support Included</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>IP Ownership:</span>
                  <span className="font-bold text-gray-900 dark:text-white">100% Code & GitHub Transfer</span>
                </div>
              </div>

              <Link 
                to={`/contact?service=${encodeURIComponent(selectedType.name)}&budget=${encodeURIComponent(calculatedEstimate.cost)}`}
                className="btn-primary w-full"
              >
                Lock Scope & Submit Technical Brief →
              </Link>

              <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center leading-normal">
                Technical roadmap and fixed quote verified upon initial brief review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODERN ENGINEERING STACK ── */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto border-t border-gray-200 dark:border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="bwl-eyebrow mb-3">
            <span className="w-2 h-2 bg-accent inline-block" />
            <span>Modern Engineering Stack</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-gray-900 dark:text-white tracking-tight">
            Core Technologies & Architecture
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-3 text-base leading-relaxed">
            I use modern, well-supported technologies selected for performance, maintainability, security, and long-term scalability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TECH_CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div key={i} className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 shadow-sm flex flex-col justify-between hover:border-accent/40 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-2">{cat.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6 font-light">{cat.description}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-gray-100 dark:border-white/5">
                  {cat.items.map((tech, tIdx) => (
                    <span key={tIdx} className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FREQUENTLY ASKED QUESTIONS ── */}
      <section className="py-20 px-6 md:px-12 max-w-4xl mx-auto border-t border-gray-200 dark:border-white/10">
        <div className="text-center mb-12">
          <div className="bwl-eyebrow mb-2 justify-center">
            <span className="w-2 h-2 bg-accent inline-block" />
            <span>Commercial Transparency</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-gray-900 dark:text-white tracking-tight">
            Software Commercial & Delivery FAQs
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div 
              key={idx} 
              className="border border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#141414] overflow-hidden transition-colors"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-heading font-bold text-gray-900 dark:text-white hover:text-accent dark:hover:text-accent transition-colors"
              >
                <span className="text-base sm:text-lg">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-200 text-gray-400 ${activeFaq === idx ? 'rotate-180 text-accent' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-6 sm:px-6 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-white/5 pt-4 font-light">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-black text-white border border-white/10 text-center space-y-6 shadow-2xl">
          <div className="bwl-eyebrow justify-center">
            <span className="w-2 h-2 bg-accent inline-block" />
            <span>Engineering Consultation</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight text-white max-w-2xl mx-auto">
            Ready to build a resilient, scalable digital asset?
          </h2>

          <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
            Tell me about your product requirements, target deadlines, and user workflows. I'll personally review your architecture and return a concrete plan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to={`/contact?service=${encodeURIComponent(selectedType.name)}&budget=${encodeURIComponent(calculatedEstimate.cost)}`}
              className="btn-primary w-full sm:w-auto"
            >
              Submit Project Brief with Selected Scope ({calculatedEstimate.cost}) →
            </Link>
            <Link
              to="/pricing"
              className="btn-secondary w-full sm:w-auto"
            >
              Open Full Pricing Matrix ↗
            </Link>
          </div>

          <div className="pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left max-w-3xl mx-auto">
            <div>
              <span className="text-[10px] uppercase font-mono text-accent font-bold block">Invoicing</span>
              <span className="text-xs text-white font-bold">50/50 Milestones</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-accent font-bold block">Code Transfer</span>
              <span className="text-xs text-white font-bold">100% IP Ownership</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-accent font-bold block">Warranty</span>
              <span className="text-xs text-white font-bold">90 Days Included</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-accent font-bold block">Response Time</span>
              <span className="text-xs text-white font-bold">&lt; 24 Hours</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default SoftwareHomePage;
