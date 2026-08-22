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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const PROJECT_TYPES = [
  { id: 'mvp', name: 'MVP / Startup Prototype', baseCostNGN: 450000, baseCostUSD: 1200, baseWeeks: 3, icon: Zap, desc: 'Fast, functional prototype to validate product-market fit.' },
  { id: 'web_app', name: 'Full-Stack Web Platform', baseCostNGN: 850000, baseCostUSD: 2400, baseWeeks: 5, icon: Layers, desc: 'Scalable custom application with database, auth, and dashboards.' },
  { id: 'saas', name: 'Multi-Tenant SaaS System', baseCostNGN: 1600000, baseCostUSD: 4500, baseWeeks: 8, icon: Server, desc: 'Subscription billing, role-based access, and enterprise API layer.' },
  { id: 'api_integration', name: 'API & Backend Infrastructure', baseCostNGN: 550000, baseCostUSD: 1500, baseWeeks: 3, icon: Database, desc: 'Microservices, third-party payment/CRM integrations & secure DB.' },
  { id: 'landing', name: 'High-Converting Landing & SEO', baseCostNGN: 280000, baseCostUSD: 800, baseWeeks: 2, icon: Monitor, desc: 'Ultra-fast animated showcase built for maximum conversion.' },
];

const ADDON_OPTIONS = [
  { id: 'auth_2fa', name: 'Advanced Auth & 2FA Security', costNGN: 85000, costUSD: 220, weeks: 0.5 },
  { id: 'payment_gateway', name: 'Paystack / Stripe / Grey Gateway', costNGN: 120000, costUSD: 300, weeks: 0.5 },
  { id: 'crm_leads', name: 'Custom CRM Pipeline & Leads Automation', costNGN: 150000, costUSD: 400, weeks: 1 },
  { id: 'seo_cwv', name: '100% Core Web Vitals & Technical SEO', costNGN: 95000, costUSD: 250, weeks: 0.5 },
  { id: 'portal_vault', name: 'Client Portal & Encrypted Secrets Vault', costNGN: 180000, costUSD: 500, weeks: 1 },
];

const TECH_CATEGORIES = [
  {
    name: 'Frontend & UI Engineering',
    icon: Monitor,
    description: 'Ultra-fast, responsive, accessible interfaces designed with high visual fidelity.',
    items: ['React 19', 'Next.js', 'Vite', 'Tailwind CSS', 'Framer Motion', 'TypeScript', 'Redux / Zustand', 'Vue.js']
  },
  {
    name: 'Backend & Distributed Systems',
    icon: Server,
    description: 'High-throughput, rate-limited, and hardened server architectures.',
    items: ['Node.js', 'Express.js', 'PostgreSQL', 'Redis', 'Python / FastAPI', 'JWT + TOTP 2FA', 'REST & GraphQL', 'Zod Validation']
  },
  {
    name: 'Cloud Infrastructure & DevOps',
    icon: Cpu,
    description: 'Automated deployment pipelines, zero-downtime releases, and edge proxies.',
    items: ['Docker', 'Vercel / Render', 'AWS (S3, EC2)', 'GitHub Actions CI/CD', 'Cloudinary CDN', 'Helmet & CSRF Shield', 'Uptime Monitoring']
  },
  {
    name: 'Integrations & Ecosystems',
    icon: Workflow,
    description: 'Seamless third-party APIs, international payment gateways, and communications.',
    items: ['Paystack Payments', 'Grey FX Transfer', 'Zoho Sign e-Contracts', 'Nodemailer / SMTP', 'Twilio / WhatsApp API', 'OpenFX Exchange Rates']
  }
];

const SAAS_PRODUCTS = [
  {
    name: 'NaijaPay Compliance Pro',
    tagline: 'Automated Nigerian Payroll & Tax Engine',
    desc: 'High-precision payroll calculation engine handling PAYE, PenCom, NHF, and direct bank disbursement schedules for SMEs.',
    status: 'In Development',
    statusColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    tags: ['Payroll', 'Fintech', 'Tax Compliance']
  },
  {
    name: 'School ERP Core v1.1',
    tagline: 'Frictionless School Management System',
    desc: 'Enterprise academic portal with 1-click attendance, grading sheets, parent notifications, and online tuition invoicing.',
    status: 'Live Production',
    statusColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    tags: ['Education', 'Portals', 'Fee Invoicing']
  },
  {
    name: 'Clinical Health ERP',
    tagline: 'High-Volume Patient & Record Management',
    desc: 'Secure patient intake, encrypted medical history vault, doctor scheduling, and pharmacy inventory management.',
    status: 'Beta Release',
    statusColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    tags: ['Healthcare', 'HIPAA/GDPR', 'AES-256 Vault']
  }
];

const FAQS = [
  {
    q: 'Do I own 100% of the code and intellectual property?',
    a: 'Yes, unconditionally. Upon final milestone payment, full copyright and repository ownership (GitHub transfer) is assigned to you with comprehensive documentation.'
  },
  {
    q: 'How are payments structured for software projects?',
    a: 'We work on transparent milestone-based deliverables: typically 40% project kickoff, 30% alpha/staging demo, and 30% final deployment & handoff. We accept NGN via Paystack and USD/GBP/EUR via international bank transfer.'
  },
  {
    q: 'What post-launch support and warranty is included?',
    a: 'Every custom software build includes 4 months of complimentary bug fixes, performance monitoring, and security patching to guarantee smooth production operation.'
  },
  {
    q: 'Can you work with existing codebases and legacy systems?',
    a: 'Yes. We frequently conduct code audits, refactoring, performance optimizations, and feature expansions for existing React, Node, Python, and PostgreSQL systems.'
  }
];

const SoftwareHomePage = () => {
  const shouldReduce = useReducedMotion();

  // Currency selection
  const [currency, setCurrency] = useState('NGN');
  
  // Interactive Estimator State
  const [selectedType, setSelectedType] = useState(PROJECT_TYPES[1]);
  const [selectedAddons, setSelectedAddons] = useState(['auth_2fa', 'payment_gateway']);

  // Inquiry Form State
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    project_type: selectedType.name,
    budget: '',
    timeline: '',
    message: '',
    honeypot: '' // Anti-spam
  });
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  // Live projects from API
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Software Engineering & SaaS Architecture | BuildWithLami";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "BuildWithLami Software Division: Custom web platforms, high-performance applications, secure APIs, and enterprise SaaS systems built by Eugene Odibenuah.");
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

  // Update form when estimator changes
  useEffect(() => {
    setForm(prev => ({ ...prev, project_type: selectedType.name }));
  }, [selectedType]);

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

    const formattedCost = isUSD 
      ? `$${base.toLocaleString()}`
      : `₦${base.toLocaleString()}`;

    return {
      cost: formattedCost,
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
        notify.success('Consultation inquiry received! I will reply within 24 hours.');
        setForm({ full_name: '', email: '', phone: '', project_type: selectedType.name, budget: '', timeline: '', message: '', honeypot: '' });
      } else {
        notify.error(res.error || 'Failed to submit inquiry.');
      }
    } catch {
      notify.error('Network error. Please try again or message directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white font-body selection:bg-accent selection:text-white transition-colors duration-300">
      
      {/* ── TOP DIVISION NAVIGATION BADGE ── */}
      <div className="bg-blue-600/10 border-b border-blue-500/20 py-2.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Division: Software & SaaS Engineering</span>
          </div>
          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
            <span>Explore Other Divisions:</span>
            <Link to="/survey" className="hover:text-accent transition-colors font-extrabold text-amber-600 dark:text-amber-400">Land Surveying →</Link>
            <Link to="/drone" className="hover:text-accent transition-colors font-extrabold text-indigo-600 dark:text-indigo-400">Drone Services →</Link>
          </div>
        </div>
      </div>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-20 pb-24 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <motion.div 
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-extrabold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" /> High-Performance Web & SaaS Engineering
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-heading tracking-tight leading-[1.05] text-gray-900 dark:text-white mb-6">
            Architecting <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-accent bg-clip-text text-transparent">Enterprise Software</span> Built for Scale.
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            From zero-to-one startup MVPs to robust multi-tenant SaaS platforms. We engineer secure, fast, and maintainable software systems designed to handle real business volume.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm max-w-3xl mx-auto mb-10">
            <div className="p-3 text-center border-r border-gray-100 dark:border-gray-800 last:border-none">
              <div className="text-2xl font-extrabold font-mono text-accent">&lt; 50ms</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-0.5">API Latency</div>
            </div>
            <div className="p-3 text-center border-r border-gray-100 dark:border-gray-800 last:border-none">
              <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">99.9%</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-0.5">Uptime SLA</div>
            </div>
            <div className="p-3 text-center border-r border-gray-100 dark:border-gray-800 last:border-none">
              <div className="text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400">AES-256</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-0.5">Encrypted Vault</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-2xl font-extrabold font-mono text-purple-600 dark:text-purple-400">4 Mo.</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-0.5">Included Support</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a 
              href="#estimator" 
              className="bg-accent hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-accent/30 inline-flex items-center gap-2 text-sm uppercase tracking-wider"
            >
              <Calculator className="w-4 h-4" /> Estimate Project Cost
            </a>
            <a 
              href="#contact-form" 
              className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold px-8 py-4 rounded-xl border border-gray-200 dark:border-gray-700 transition-all inline-flex items-center gap-2 text-sm uppercase tracking-wider"
            >
              Book Discovery Call
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── INTERACTIVE PROJECT SCOPE & COST ESTIMATOR ── */}
      <section id="estimator" className="py-20 px-6 md:px-12 max-w-7xl mx-auto border-t border-gray-200 dark:border-gray-800">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-extrabold uppercase tracking-wider mb-3">
            <Calculator className="w-3.5 h-3.5" /> Interactive Pricing Estimator
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-gray-900 dark:text-white tracking-tight">
            Calculate Your Project Scope & Timeline
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-3 text-base">
            Select your software requirements to generate an instant transparent estimate before scheduling kickoff.
          </p>

          {/* Currency Toggle */}
          <div className="inline-flex p-1 bg-gray-200 dark:bg-gray-800 rounded-xl mt-6">
            <button 
              onClick={() => setCurrency('NGN')}
              className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all ${currency === 'NGN' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
            >
              ₦ NGN (Nigeria)
            </button>
            <button 
              onClick={() => setCurrency('USD')}
              className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all ${currency === 'USD' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
            >
              $ USD (International)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Project Type & Add-ons (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
                1. Select Architecture Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PROJECT_TYPES.map(type => {
                  const IconCmp = type.icon;
                  const isSelected = selectedType.id === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type)}
                      className={`text-left p-5 rounded-2xl border transition-all duration-200 ${
                        isSelected 
                          ? 'bg-blue-50/70 dark:bg-blue-900/20 border-blue-500 ring-2 ring-blue-500/20 shadow-md' 
                          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                          <IconCmp className="w-5 h-5" />
                        </div>
                        {isSelected && <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-base">{type.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{type.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
                2. Select Custom Features & Add-ons
              </label>
              <div className="space-y-3">
                {ADDON_OPTIONS.map(addon => {
                  const isChecked = selectedAddons.includes(addon.id);
                  return (
                    <div 
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                        isChecked 
                          ? 'bg-accent/5 dark:bg-accent/10 border-accent/40' 
                          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isChecked ? 'bg-accent border-accent text-white' : 'border-gray-300 dark:border-gray-700'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900 dark:text-white">{addon.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">+{addon.weeks} week timeline</p>
                        </div>
                      </div>
                      <div className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                        +{currency === 'USD' ? `$${addon.costUSD}` : `₦${addon.costNGN.toLocaleString()}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Summary Card (4 cols) */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl space-y-6">
              <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent">Summary Estimate</span>
                <div className="text-3xl font-extrabold font-mono text-gray-900 dark:text-white mt-1">
                  {calculatedEstimate.cost}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Estimated Delivery: <strong>~{calculatedEstimate.weeks} Weeks</strong></span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Architecture:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedType.name}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Selected Add-ons:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedAddons.length} features</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Warranty Included:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">4 Months SLA</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Source Code:</span>
                  <span className="font-bold text-gray-900 dark:text-white">100% IP Transfer</span>
                </div>
              </div>

              <a 
                href="#contact-form"
                onClick={() => {
                  setForm(prev => ({
                    ...prev,
                    project_type: selectedType.name,
                    budget: calculatedEstimate.cost,
                    timeline: `${calculatedEstimate.weeks} weeks`
                  }));
                }}
                className="w-full bg-accent hover:bg-orange-600 text-white font-bold py-3.5 px-4 rounded-xl text-center block transition-all shadow-md uppercase tracking-wider text-xs"
              >
                Apply Estimate to Inquiry →
              </a>

              <p className="text-[10px] text-gray-400 text-center leading-normal">
                Final quotation verified during initial technical discovery session.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ENGINEERING CAPABILITIES & TECH STACK ── */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto border-t border-gray-200 dark:border-gray-800">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider mb-3">
            <Code className="w-3.5 h-3.5" /> Modern Engineering Stack
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-gray-900 dark:text-white tracking-tight">
            Battle-Tested Technologies & Tooling
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-3 text-base">
            We build software using modern, production-hardened libraries and protocols designed for high concurrency and zero runtime regressions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TECH_CATEGORIES.map((cat, idx) => {
            const IconComponent = cat.icon;
            return (
              <div 
                key={idx}
                className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:border-accent/40 transition-all space-y-5"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
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
                      className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-bold font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── INTERNAL SAAS VENTURES SHOWCASE ── */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-extrabold uppercase tracking-wider mb-3">
            <Server className="w-3.5 h-3.5" /> Proprietary SaaS
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-gray-900 dark:text-white tracking-tight">
            Internal SaaS Products & Platforms
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-3 text-base">
            In addition to bespoke client engineering, we build and operate commercial SaaS platforms solving mission-critical business challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SAAS_PRODUCTS.map((prod, idx) => (
            <div 
              key={idx}
              className="p-7 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${prod.statusColor}`}>
                    {prod.status}
                  </span>
                </div>
                <h4 className="text-xl font-bold font-heading text-gray-900 dark:text-white">{prod.name}</h4>
                <p className="text-xs font-bold text-accent mt-1 mb-3">{prod.tagline}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  {prod.desc}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex flex-wrap gap-1.5">
                  {prod.tags.map((t, tid) => (
                    <span key={tid} className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {t}
                    </span>
                  ))}
                </div>
                <a 
                  href="#contact-form"
                  onClick={() => setForm(prev => ({ ...prev, project_type: `Inquiry: ${prod.name}`, message: `I am interested in licensing or building a system like ${prod.name}.` }))}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:text-accent transition-colors"
                >
                  Request Demo / Early Access <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SELECTED SOFTWARE CASE STUDIES ── */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-extrabold uppercase tracking-wider mb-3">
              <FolderGit2 className="w-3.5 h-3.5" /> Proven Track Record
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-gray-900 dark:text-white tracking-tight">
              Selected Software Case Studies
            </h2>
          </div>
          <Link 
            to="/projects" 
            className="inline-flex items-center gap-2 text-sm font-extrabold text-accent hover:underline uppercase tracking-wider"
          >
            View Complete Portfolio ({projects.length}+ projects) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((p, idx) => (
            <div 
              key={p.id || idx}
              className="group rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-accent/40 transition-all flex flex-col"
            >
              {p.image_url && (
                <div className="h-56 overflow-hidden relative">
                  <img 
                    src={p.image_url} 
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
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                    {p.summary || p.content}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {(p.tech_stack || []).slice(0, 3).map((t, tid) => (
                      <span key={tid} className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {t}
                      </span>
                    ))}
                  </div>
                  <Link 
                    to={`/projects/${p.id}`}
                    className="text-xs font-bold text-accent inline-flex items-center gap-1 hover:translate-x-1 transition-transform"
                  >
                    Deep Dive →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONSULTATION & DISCOVERY INTAKE FORM ── */}
      <section id="contact-form" className="py-20 px-6 md:px-12 max-w-4xl mx-auto border-t border-gray-200 dark:border-gray-800">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider mb-3">
              <Terminal className="w-3.5 h-3.5" /> Kickoff Consultation
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-gray-900 dark:text-white tracking-tight">
              Start Your Software Discovery Call
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
              Tell us about your project vision, timeline, and goals. We review all technical requirements and respond within 24 business hours.
            </p>
          </div>

          {formSuccess ? (
            <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-200">Technical Inquiry Received!</h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-400 max-w-md mx-auto">
                Thank you for reaching out. We will review your requirements and schedule an initial discovery session with you shortly.
              </p>
              <button 
                onClick={() => setFormSuccess(false)}
                className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 underline pt-2"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Honeypot anti-spam field */}
              <input 
                type="text" 
                name="website_url" 
                value={form.honeypot} 
                onChange={e => setForm({ ...form, honeypot: e.target.value })} 
                className="hidden" 
                tabIndex={-1} 
                autoComplete="off" 
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                    Full Name *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. David Adeleke"
                    value={form.full_name}
                    onChange={e => setForm({ ...form, full_name: e.target.value })}
                    className="w-full p-3.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                    Email Address *
                  </label>
                  <input 
                    type="email" 
                    required
                    placeholder="david@company.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full p-3.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                    Project Type
                  </label>
                  <Select
                    value={form.project_type}
                    onValueChange={val => setForm({ ...form, project_type: val })}
                  >
                    <SelectTrigger className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-accent">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#1f1f1f] border-gray-200 dark:border-gray-700 shadow-xl">
                      <SelectGroup>
                        {PROJECT_TYPES.map(t => (
                          <SelectItem key={t.id} value={t.name} className="cursor-pointer">
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                    Target Budget Range
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. ₦850,000 / $2,500"
                    value={form.budget}
                    onChange={e => setForm({ ...form, budget: e.target.value })}
                    className="w-full p-3.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                  Project Description & Requirements *
                </label>
                <textarea 
                  required
                  rows={5}
                  placeholder="Describe your product requirements, user workflows, integrations, or specific deadlines..."
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full p-3.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-accent hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-accent/30 text-sm uppercase tracking-widest disabled:opacity-50"
              >
                {submitting ? 'Transmitting Specifications...' : 'Send Software Project Inquiry →'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── FAQS SECTION ── */}
      <section className="py-20 px-6 md:px-12 max-w-4xl mx-auto border-t border-gray-200 dark:border-gray-800">
        <div className="text-center mb-12">
          <span className="text-accent font-bold tracking-widest uppercase text-xs mb-2 block">Clear Answers</span>
          <h2 className="text-3xl font-extrabold font-heading text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx}
                className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-6 text-left font-bold text-gray-900 dark:text-white flex items-center justify-between text-base"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-accent' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800/60 pt-4 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};

export default SoftwareHomePage;
