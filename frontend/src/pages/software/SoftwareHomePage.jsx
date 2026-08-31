import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Cpu,
  ArrowRight,
  ChevronDown,
  Monitor,
  Workflow,
  Server
} from 'lucide-react';
import { api } from '../../services/api';
import fallbackProjects from '../../data/fallbackProjects';

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
  const [activeFaq, setActiveFaq] = useState(null);
  const navigate = useNavigate();

  // Live projects from API
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Software Engineering & Architecture | Buildwith_lami";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Buildwith_lami Software Division: Custom web platforms, high-performance applications, secure APIs, and tailored SaaS systems built by Eugene Odibenuah.");
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
            <Link
              to="/pricing"
              className="btn-primary w-full sm:w-auto"
              onTouchEnd={(e) => { e.preventDefault(); navigate('/pricing'); }}
              style={{ touchAction: 'manipulation' }}
            >
              View Transparent Pricing <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              to="/contact"
              className="btn-secondary w-full sm:w-auto"
              onTouchEnd={(e) => { e.preventDefault(); navigate('/contact'); }}
              style={{ touchAction: 'manipulation' }}
            >
              Book Architecture Consultation →
            </Link>
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
              to="/contact?service=software"
              className="btn-primary w-full sm:w-auto"
              onTouchEnd={(e) => { e.preventDefault(); navigate('/contact?service=software'); }}
              style={{ touchAction: 'manipulation' }}
            >
              Submit Project Brief →
            </Link>
            <Link
              to="/pricing"
              className="btn-secondary w-full sm:w-auto"
              onTouchEnd={(e) => { e.preventDefault(); navigate('/pricing'); }}
              style={{ touchAction: 'manipulation' }}
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
