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
import { useAutomatedCurrency } from '../../utils/currency';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const PROJECT_TYPES = [
  { id: 'business', name: 'Business Corporate Platform', baseCostNGN: 600000, baseCostUSD: 1600, baseWeeks: 3, icon: Layers, desc: 'Bespoke corporate website with CMS, lead capture automation, and SEO.' },
  { id: 'ecommerce', name: 'E-Commerce Growth Engine', baseCostNGN: 850000, baseCostUSD: 2400, baseWeeks: 4, icon: Zap, desc: 'Scalable commerce system with accounts, cart recovery, discount engine & payments.' },
  { id: 'mvp', name: 'MVP / Startup Prototype', baseCostNGN: 1200000, baseCostUSD: 3200, baseWeeks: 6, icon: Database, desc: 'Custom full-stack software built to test product-market fit and onboard early users.' },
  { id: 'growth_platform', name: 'Growth Platform & Custom ERP', baseCostNGN: 2000000, baseCostUSD: 5000, baseWeeks: 8, icon: Server, desc: 'Scaling business software with multi-role workflows, automated ledgers & portals.' },
  { id: 'saas_enterprise', name: 'Enterprise Multi-Tenant SaaS', baseCostNGN: 3500000, baseCostUSD: 9000, baseWeeks: 12, icon: Cpu, desc: 'Mission-critical distributed architecture, subscription billing, and dedicated cloud SLAs.' },
];

const ADDON_OPTIONS = [
  { id: 'auth_2fa', name: 'Advanced Auth & 2FA Security', costNGN: 85000, costUSD: 220, weeks: 0.5 },
  { id: 'payment_gateway', name: 'Paystack / Stripe / Grey Gateway', costNGN: 120000, costUSD: 300, weeks: 0.5 },
  { id: 'crm_leads', name: 'Custom CRM Pipeline & Leads Automation', costNGN: 150000, costUSD: 400, weeks: 1 },
  { id: 'seo_cwv', name: '100% Core Web Vitals & Technical SEO', costNGN: 95000, costUSD: 250, weeks: 0.5 },
  { id: 'portal_vault', name: 'Client Portal & Protected Data Vault', costNGN: 180000, costUSD: 500, weeks: 1 },
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
    a: 'Software projects are structured with a transparent 50/50 milestone payment model: 50% upfront to reserve your schedule and begin architecture & development, and the remaining 50% upon final delivery, testing, and production deployment. I accept NGN via Paystack and USD/GBP/EUR via international bank transfer.'
  },
  {
    q: 'What post-launch support and warranty is included?',
    a: 'Every custom software build includes 4 months of complimentary bug fixes, performance monitoring, and security patching to guarantee smooth production operation.'
  },
  {
    q: 'Can you work with existing codebases and legacy systems?',
    a: 'Yes. I frequently conduct code audits, refactoring, performance optimizations, and feature expansions for existing React, Node, Python, and PostgreSQL systems.'
  }
];

const SoftwareHomePage = () => {
  const shouldReduce = useReducedMotion();

  // Fully automated location-based currency detection (NGN in Nigeria/Africa, USD International)
  const currency = useAutomatedCurrency();
  
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
    const isUSD = currency === 'USD';
    let base = isUSD ? selectedType.baseCostUSD : selectedType.baseCostNGN;
    let weeks = selectedType.baseWeeks;

    selectedAddons.forEach(addonId => {
      const addon = ADDON_OPTIONS.find(a => a.id === addonId);
      if (addon) {
        base += isUSD ? addon.costUSD : addon.costNGN;
        weeks += addon.weeks;
      }
    });

    const upfrontAmount = Math.round(base * 0.5);
    const deliveryAmount = base - upfrontAmount;

    const formattedCost = isUSD 
      ? `$${base.toLocaleString()}`
      : `₦${base.toLocaleString()}`;

    const formattedUpfront = isUSD
      ? `$${upfrontAmount.toLocaleString()}`
      : `₦${upfrontAmount.toLocaleString()}`;

    const formattedDelivery = isUSD
      ? `$${deliveryAmount.toLocaleString()}`
      : `₦${deliveryAmount.toLocaleString()}`;

    return {
      total: base,
      cost: formattedCost,
      upfront: formattedUpfront,
      delivery: formattedDelivery,
      weeks: Math.ceil(weeks),
      symbol: isUSD ? '$' : '₦'
    };
  }, [selectedType, selectedAddons, currency]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.honeypot) return; // Drop spam
    if (!form.full_name || !form.email || !form.message) {
      notify.error('Please fill in your name, email, and project overview.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/contact', {
        full_name: form.full_name,
        email: form.email,
        message: form.message,
        project_type: form.project_type || selectedType.name,
        budget: form.budget || calculatedEstimate.cost,
        timeline: form.timeline || `${calculatedEstimate.weeks} weeks`
      });

      if (res.ok) {
        setFormSuccess(true);
        notify.success('Technical brief received! Eugene will review and reply within 24 hours.');
        setForm({ full_name: '', email: '', phone: '', project_type: selectedType.name, budget: '', timeline: '', message: '', honeypot: '' });
      } else {
        notify.error(res.error || 'Failed to submit brief.');
      }
    } catch {
      notify.error('Network error. Please try again or message directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background text-gray-900 dark:text-white font-body selection:bg-accent selection:text-white transition-colors duration-300">
      
      {/* ── TOP DIVISION BADGE ── */}
      <div className="bg-accent/10 border-b border-accent/20 py-2.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2 text-accent">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="font-heading">Division: Software & SaaS Engineering</span>
          </div>
          <div className="hidden sm:block text-[11px] text-gray-500 dark:text-gray-400 font-mono font-medium">
            Bespoke Web Platforms · SaaS Architecture · APIs
          </div>
        </div>
      </div>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-20 pb-24 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        
        <motion.div 
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="bwl-badge mb-6 inline-flex">
            <Sparkles className="w-3.5 h-3.5" /> High-Performance Web & SaaS Engineering
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-heading tracking-tight leading-[1.05] text-gray-900 dark:text-white mb-6">
            Engineering <span className="italic font-normal text-accent">Software</span> Built for Real Business Scale.
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            From zero-to-one startup MVPs to robust multi-tenant SaaS platforms. I engineer secure, fast, and maintainable software systems designed to handle real business volume.
          </p>

          {/* Quick Realistic Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 p-4 rounded-2xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 shadow-sm max-w-3xl mx-auto mb-10">
            <div className="p-3 text-center border-r border-b md:border-b-0 border-gray-100 dark:border-white/5">
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-accent">4+</div>
              <div className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-0.5">Software Projects</div>
            </div>
            <div className="p-3 text-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/5">
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-gray-900 dark:text-white">4 Months</div>
              <div className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-0.5">Included Support</div>
            </div>
            <div className="p-3 text-center border-r border-gray-100 dark:border-white/5">
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-accent">100%</div>
              <div className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-0.5">Code Ownership</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-gray-900 dark:text-white">&lt; 24hr</div>
              <div className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-0.5">Typical Response</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a 
              href="#estimator" 
              className="btn-primary"
            >
              <Calculator className="w-4 h-4 mr-2" /> Model Scope & Milestones
            </a>
            <a 
              href="#contact-action" 
              className="btn-secondary"
            >
              Submit Technical Brief
            </a>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Structured 50% Upfront · 50% On Delivery Milestone Billing</span>
          </div>
        </motion.div>
      </section>

      {/* ── INTERACTIVE ARCHITECTURE & SCOPING ESTIMATOR ── */}
      <section id="estimator" className="py-20 px-6 md:px-12 max-w-7xl mx-auto border-t border-gray-200 dark:border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="bwl-badge mb-3 inline-flex">
            <Calculator className="w-3.5 h-3.5" /> Technical Scoping & Architecture Planner
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-gray-900 dark:text-white tracking-tight">
            Model Your Build, Timeline & Milestones
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-3 text-base leading-relaxed">
            Configure core system requirements, infrastructure, and custom features. Receive an immediate, transparent estimate with structured 50/50 milestone invoicing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Architecture Type & Modular Add-ons (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-xs font-mono font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  01 — Core System Architecture
                </label>
                <span className="text-[11px] text-accent font-semibold">Select base platform</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PROJECT_TYPES.map(type => {
                  const IconCmp = type.icon;
                  const isSelected = selectedType.id === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type)}
                      className={`text-left p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                        isSelected 
                          ? 'bg-accent/5 dark:bg-accent/10 border-accent ring-1 ring-accent/30 shadow-md' 
                          : 'bg-white dark:bg-[#141414] border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300'}`}>
                            <IconCmp className="w-5 h-5" />
                          </div>
                          {isSelected && <CheckCircle className="w-5 h-5 text-accent" />}
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base font-heading">{type.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">{type.desc}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-accent">
                          {currency === 'USD' ? `$${type.baseCostUSD.toLocaleString()}` : `₦${type.baseCostNGN.toLocaleString()}`}
                        </span>
                        <span className="text-gray-400 font-medium">~{type.baseWeeks} wks</span>
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
                <span className="text-[11px] text-gray-400 font-medium">Optional capabilities</span>
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
                        +{currency === 'USD' ? `$${addon.costUSD}` : `₦${addon.costNGN.toLocaleString()}`}
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
                  <span>Post-Launch SLA:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">4 Months Included</span>
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

              <p className="text-[10px] text-gray-400 text-center leading-normal">
                Technical roadmap and fixed quote verified upon initial brief review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODERN ENGINEERING STACK ── */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto border-t border-gray-200 dark:border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="bwl-badge mb-3 inline-flex">
            <Code className="w-3.5 h-3.5" /> Modern Engineering Stack
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-gray-900 dark:text-white tracking-tight">
            Core Technologies & Architecture
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-3 text-base leading-relaxed">
            I use modern, well-supported technologies selected for performance, maintainability, security, and long-term scalability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TECH_CATEGORIES.map((cat, idx) => {
            const IconComponent = cat.icon;
            return (
              <div 
                key={idx}
                className="p-8 rounded-2xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 shadow-sm hover:border-accent/40 transition-all space-y-5"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 text-accent rounded-xl">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-heading text-gray-900 dark:text-white">{cat.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{cat.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {cat.items.map((tech, tIdx) => (
                    <span 
                      key={tIdx}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-xs font-bold font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/10"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Additional technologies and architectures available when specific project requirements call for them.
          </p>
        </div>
      </section>

      {/* ── SELECTED SOFTWARE CASE STUDIES ── */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto border-t border-gray-200 dark:border-white/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="bwl-badge mb-3 inline-flex">
              <FolderGit2 className="w-3.5 h-3.5" /> Technical Case Studies
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-gray-900 dark:text-white tracking-tight">
              Selected Software Case Studies
            </h2>
          </div>
          <Link 
            to="/projects" 
            className="btn-ghost"
          >
            View Complete Portfolio ({projects.length}+ projects) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((p, idx) => (
            <div 
              key={p.id || idx}
              className="group rounded-2xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-xl hover:border-accent/40 transition-all flex flex-col"
            >
              {(p.image_url || p.image) && (
                <div className="h-56 overflow-hidden relative">
                  <img 
                    src={p.image_url || p.image} 
                    alt={p.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                      {p.category || 'Full-Stack'}
                    </span>
                  </div>
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold font-heading text-gray-900 dark:text-white group-hover:text-accent transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed font-light">
                    {p.summary || p.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {(p.tech_stack || []).slice(0, 3).map((t, tid) => (
                      <span key={tid} className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">
                        {t}
                      </span>
                    ))}
                  </div>
                  <Link 
                    to={`/projects/${p.slug || p.id}`}
                    className="text-xs font-bold text-accent inline-flex items-center gap-1 hover:translate-x-1 transition-transform font-heading uppercase tracking-wider"
                  >
                    Deep Dive →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TECHNICAL FAQS SECTION ── */}
      <section className="py-20 px-6 md:px-12 max-w-4xl mx-auto border-t border-gray-200 dark:border-white/10">
        <div className="text-center mb-12">
          <div className="bwl-badge mb-3 inline-flex">Clear Answers</div>
          <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-gray-900 dark:text-white">
            Frequently Asked Technical Questions
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx}
                className="border border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#141414] overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-6 text-left font-bold text-gray-900 dark:text-white flex items-center justify-between text-base font-heading cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-accent' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-white/5 pt-4 leading-relaxed font-light whitespace-pre-line">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── ENGINEERING BRIEF & DIRECT INTAKE ACTION BANNER ── */}
      <section id="contact-action" className="py-20 px-6 md:px-12 max-w-5xl mx-auto border-t border-gray-200 dark:border-white/10">
        <div className="bg-gradient-to-br from-[#161616] via-[#141414] to-black border border-white/10 rounded-3xl p-8 sm:p-12 md:p-16 shadow-2xl text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-accent to-transparent" />
          
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bwl-badge inline-flex">
              <Terminal className="w-3.5 h-3.5" /> Direct Engineering Intake
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-white tracking-tight leading-tight">
              Ready to Scope Your <span className="text-accent">System Architecture?</span>
            </h2>
            <p className="text-gray-300 text-sm sm:text-base font-light leading-relaxed">
              Direct founder-to-engineer collaboration. Share your workflow specifications, technical requirements, or launch target. I will personally review your brief and return a concrete architectural roadmap within 24 hours.
            </p>
          </div>

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
              <span className="text-xs text-white font-bold">4 Months Included</span>
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
