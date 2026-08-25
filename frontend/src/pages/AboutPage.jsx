import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import {
  staggerContainer,
  fadeUpItem,
  cardHover,
  cardHoverTransition,
  buttonHover,
  buttonTap,
  reducedMotionVariants,
} from '../utils/motion';
import { CONTACT } from '../config/contact';
import TechIcon from '../components/TechIcon';

/* ────────────────────────────────────────────────────────────────────────────
 * Static Data Structures (Outside component to optimize re-renders)
 * ──────────────────────────────────────────────────────────────────────────── */

// Streamlined, personal-brand focused experience entries
const experience = [
  {
    role: 'Founder & Full-Stack Developer',
    company: 'BuildWithLami',
    period: '2023 — Present',
    location: 'Lagos, Nigeria (Worldwide Remote)',
    overview:
      'I run BuildWithLami, where I design and engineer custom digital products for businesses, founders, and growing teams.',
    selectedWork: [
      'Enterprise web applications & internal tools',
      'High-conversion e-commerce platforms',
      'SaaS products & multi-tenant architectures',
      'Business workflow automation systems',
      'Secure API & PostgreSQL database engineering',
      'Continuous cloud deployment & DevOps',
    ],
  },
  {
    role: 'Independent Full-Stack Developer',
    company: 'Freelance Engagements',
    period: '2021 — 2023',
    location: 'Lagos, Nigeria (Remote)',
    overview:
      'Built custom web applications, e-commerce storefronts, and internal tools for growing brands and businesses.',
    selectedWork: [
      'Custom e-commerce platforms (TheTiaBrand, Prechi Clothing)',
      'Offline-first inventory & POS system (SuperMarket Pro)',
      'Corporate web platforms & digital presence (Sourceline Limited)',
      'Third-party payment gateways & REST API integrations',
    ],
  },
];

// Professional education copy focused on engineering fundamentals
const education = [
  {
    period: '2018 – 2022',
    degree: 'B.Sc. Surveying & Geoinformatics',
    institution: 'Enugu State University of Science and Technology (ESUT)',
    details:
      'Developed a strong analytical, mathematical, and spatial modeling foundation — skills that translate directly into systems thinking, distributed architecture, and data integrity.',
  },
  {
    period: '2023 – Present',
    degree: 'Full-Stack Web Engineering & Systems Mastery',
    institution: 'Continuous Project-Driven Architecture',
    details:
      'Continuous rigorous mastery across modern React/Next.js frontend architecture, Node.js backend systems, relational database optimization, cloud infrastructure, and secure product delivery.',
  },
];

// Categorized Tools & Technologies with specific roles and native TechIcon components
const toolCategories = [
  {
    name: 'Frontend Engineering',
    categoryKey: 'frontend',
    description: 'Interface architecture, responsive layouts, and fluid micro-interactions.',
    tools: [
      { name: 'React', desc: 'UI component architecture & reactive state' },
      { name: 'Next.js', desc: 'Full-stack React, SSR & routing' },
      { name: 'TypeScript', desc: 'Type-safe enterprise application code' },
      { name: 'JavaScript', desc: 'Modern ES6+ asynchronous execution' },
      { name: 'Tailwind CSS', desc: 'Design token architecture & custom styling' },
      { name: 'Framer Motion', desc: 'Fluid spring physics & UI animations' },
    ],
  },
  {
    name: 'Backend & Database',
    categoryKey: 'backend',
    description: 'Resilient APIs, relational data models, caching, and authentication.',
    tools: [
      { name: 'Node.js', desc: 'Scalable asynchronous runtime' },
      { name: 'Express.js', desc: 'REST API endpoints & custom middleware' },
      { name: 'PostgreSQL', desc: 'Relational data architecture & ACID compliance' },
      { name: 'Prisma / Drizzle', desc: 'Type-safe ORM & database migrations' },
      { name: 'Supabase', desc: 'Cloud Postgres, auth & real-time sync' },
      { name: 'Redis', desc: 'High-speed in-memory caching & session store' },
    ],
  },
  {
    name: 'Cloud & Infrastructure',
    categoryKey: 'cloud',
    description: 'Continuous integration, cloud deployment, and edge media delivery.',
    tools: [
      { name: 'Vercel', desc: 'Edge hosting, instant rollbacks & CDN' },
      { name: 'Render', desc: 'Containerized web services & background workers' },
      { name: 'GitHub Actions', desc: 'Automated CI/CD pipelines & quality checks' },
      { name: 'Cloudinary', desc: 'Dynamic asset optimization & media CDN' },
    ],
  },
  {
    name: 'Payments & Integrations',
    categoryKey: 'payments',
    description: 'Transaction processing, webhook handling, and transactional communications.',
    tools: [
      { name: 'Paystack', desc: 'African payments, recurring billing & webhooks' },
      { name: 'Stripe', desc: 'Global card processing & subscription billing' },
      { name: 'Resend', desc: 'High-deliverability transactional email' },
      { name: 'REST & Webhooks', desc: 'Third-party API contracts & data pipelines' },
    ],
  },
  {
    name: 'Design & Engineering Workflow',
    categoryKey: 'design',
    description: 'Design prototyping, developer tooling, and API validation environments.',
    tools: [
      { name: 'Figma', desc: 'UI/UX prototyping, layout systems & specs' },
      { name: 'VS Code', desc: 'Primary development environment & tooling' },
      { name: 'Postman', desc: 'API testing, schema mocking & endpoint validation' },
    ],
  },
];

// Working Style Pillars
const workingStylePillars = [
  {
    title: 'Direct Communication',
    desc: 'You work directly with the engineer building your product — no account managers, no game of telephone.',
    icon: 'chat',
  },
  {
    title: 'Clear Milestones',
    desc: 'You always know what is being designed, built, tested, and delivered through transparent weekly updates.',
    icon: 'milestone',
  },
  {
    title: 'Remote & Worldwide',
    desc: 'Based in Lagos, working seamlessly with founders and businesses internationally across time zones.',
    icon: 'globe',
  },
  {
    title: 'Post-Launch Partnership',
    desc: 'Every qualifying project includes dedicated post-launch maintenance and support to ensure operational stability.',
    icon: 'shield',
  },
];

// Visual Quick Facts
const visualQuickFacts = [
  {
    id: '01',
    badge: 'Full-Stack Engineer',
    label: 'Architecture & Engineering',
    detail: 'Frontend → Backend → Database → Deployment',
  },
  {
    id: '02',
    badge: 'Lagos, Nigeria',
    label: 'Global Availability',
    detail: 'Partnering with clients worldwide across time zones',
  },
  {
    id: '03',
    badge: '2021+ Experience',
    label: 'Track Record',
    detail: 'Years of hands-on software development & product delivery',
  },
  {
    id: '04',
    badge: 'End-to-End Ownership',
    label: 'Delivery Model',
    detail: 'From initial concept and system design to production launch',
  },
];

/* ────────────────────────────────────────────────────────────────────────────
 * Reusable Decorative Icons & Elements
 * ──────────────────────────────────────────────────────────────────────────── */

const StarIcon = ({ className = 'w-8 h-8 text-gray-400 dark:text-white/50' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" />
  </svg>
);

const ArrowIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const PillIcon = ({ name, className = 'w-5 h-5 text-accent' }) => {
  switch (name) {
    case 'chat':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case 'milestone':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      );
    case 'globe':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      );
    case 'shield':
    default:
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
  }
};

/* ────────────────────────────────────────────────────────────────────────────
 * Main AboutPage Component
 * ──────────────────────────────────────────────────────────────────────────── */

const AboutPage = () => {
  const shouldReduce = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState('all');

  // Resolved motion variants
  const container = useMemo(() => (shouldReduce ? reducedMotionVariants : staggerContainer), [shouldReduce]);
  const item = useMemo(() => (shouldReduce ? reducedMotionVariants : fadeUpItem), [shouldReduce]);
  const hover = useMemo(() => (shouldReduce ? {} : cardHover), [shouldReduce]);

  // Filtered tools based on active tab
  const displayedCategories = useMemo(() => {
    if (activeCategory === 'all') return toolCategories;
    return toolCategories.filter((c) => c.categoryKey === activeCategory);
  }, [activeCategory]);

  // SEO + scroll-to-top
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'About Eugene Odibenuah | BuildWithLami — Full-Stack Software Engineer';

    const setMeta = (selector, attr, value) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    setMeta(
      'meta[name="description"]',
      'content',
      'About BuildWithLami — founded by Eugene Odibenuah, a full-stack software engineer based in Lagos, Nigeria. Custom web platforms, SaaS applications, and enterprise systems built for real-world reliability.'
    );
    setMeta('meta[property="og:title"]', 'content', 'About Eugene Odibenuah | BuildWithLami');
    setMeta(
      'meta[property="og:description"]',
      'content',
      'Full-stack software engineer & founder of BuildWithLami. Designing and engineering high-performance web platforms and scalable business systems.'
    );
    setMeta('meta[property="og:type"]', 'content', 'profile');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background text-black dark:text-white pt-28 sm:pt-32 pb-20 sm:pb-28 px-4 sm:px-6 md:px-10 lg:px-12 font-body selection:bg-accent selection:text-white transition-colors duration-300 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-16 sm:space-y-24">
        
        {/* ═══════════════════════════════════════════════════════════════════
            1. ABOUT HERO / HEADER
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.header
          initial={shouldReduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: shouldReduce ? 0 : 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 text-black dark:text-white">
            <StarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 dark:text-white/50" />
            <span className="text-xs sm:text-sm uppercase tracking-[0.3em] font-bold text-accent">
              About The Founder
            </span>
            <StarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 dark:text-white/50" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight uppercase leading-none">
            About Me
          </h1>
          <p className="mt-5 text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 font-light leading-relaxed">
            Full-stack software engineer & technology consultant. Designing and engineering software that transforms business operations.
          </p>
        </motion.header>

        {/* ═══════════════════════════════════════════════════════════════════
            2. WHO I AM — Headshot + Founder Narrative Bento
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.section
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          {/* Headshot Card */}
          <motion.article
            variants={item}
            whileHover={hover}
            transition={cardHoverTransition}
            className="md:col-span-4 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-5 sm:p-6 rounded-[2rem] border border-gray-200 dark:border-white/5 flex items-center justify-center shadow-xl overflow-hidden"
          >
            <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-gray-900 shadow-inner">
              <img
                src="/ChatGPT Image Aug 22, 2026, 06_24_14 PM.png"
                alt="Eugene Odibenuah — Founder of BuildWithLami"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase tracking-widest text-white font-bold border border-white/10">
                Founder · Lead Engineer
              </div>
            </div>
          </motion.article>

          {/* Founder Bio Card */}
          <motion.article
            variants={item}
            whileHover={hover}
            transition={cardHoverTransition}
            className="md:col-span-8 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-6 sm:p-8 md:p-10 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl relative overflow-hidden flex flex-col justify-between group"
          >
            <StarIcon className="absolute top-6 right-6 w-8 h-8 text-gray-200 dark:text-white/10" />
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Engineering & Product Leadership
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3">
                Eugene Odibenuah
              </h2>
              <p className="text-xs sm:text-sm uppercase tracking-widest text-accent font-bold mb-5">
                Founder, BuildWithLami · Full-Stack Software Engineer
              </p>
              <div className="text-gray-800 dark:text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed font-light space-y-4">
                <p>
                  I partner with founders, businesses, and growing teams to design and build custom web platforms,
                  SaaS products, e-commerce storefronts, and internal business systems.
                </p>
                <p>
                  My focus is on <strong>complete engineering ownership</strong>: from understanding the business problem and mapping the system architecture, to writing clean code, designing resilient databases, and deploying scalable production applications.
                </p>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-gray-200 dark:border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-gray-500 dark:text-gray-400">
              <span>Location: Lagos, Nigeria</span>
              <span>Available: Remote Worldwide</span>
            </div>
          </motion.article>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════════
            3. EXPERIENCE & EDUCATION
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.section
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          {/* Experience Card */}
          <motion.article
            variants={item}
            whileHover={hover}
            transition={cardHoverTransition}
            className="md:col-span-6 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-6 sm:p-8 md:p-10 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-white/5">
                <h3 className="text-xs uppercase tracking-[0.25em] font-bold text-accent">
                  Professional Experience
                </h3>
                <span className="text-xs font-mono text-gray-500">2021 — Present</span>
              </div>
              <div className="space-y-8">
                {experience.map((exp, index) => (
                  <div key={`${exp.company}-${index}`} className="space-y-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h4 className="text-lg sm:text-xl font-heading font-bold text-black dark:text-white">
                        {exp.role}
                      </h4>
                      <span className="text-xs font-bold text-accent bg-accent/10 px-2.5 py-0.5 rounded-full">
                        {exp.period}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {exp.company} · {exp.location}
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 font-light leading-relaxed">
                      {exp.overview}
                    </p>
                    <div className="pt-2">
                      <p className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold mb-2">
                        Selected Scope & Capabilities:
                      </p>
                      <ul className="grid grid-cols-1 gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                        {exp.selectedWork.map((item, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.article>

          {/* Education Card */}
          <motion.article
            variants={item}
            whileHover={hover}
            transition={cardHoverTransition}
            className="md:col-span-6 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-6 sm:p-8 md:p-10 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-white/5">
                <h3 className="text-xs uppercase tracking-[0.25em] font-bold text-accent">
                  Education & Foundations
                </h3>
                <span className="text-xs font-mono text-gray-500">Academic & Systems</span>
              </div>
              <div className="space-y-8">
                {education.map((edu, index) => (
                  <div key={`${edu.degree}-${index}`} className="space-y-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h4 className="text-lg sm:text-xl font-heading font-bold text-black dark:text-white">
                        {edu.degree}
                      </h4>
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-2.5 py-0.5 rounded-full">
                        {edu.period}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {edu.institution}
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 font-light leading-relaxed">
                      {edu.details}
                    </p>

                    {/* Handwritten Signature for Eugene Odibenuah */}
                    {index === education.length - 1 && (
                      <div className="pt-4 mt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 dark:text-gray-400 block font-semibold">
                            Principal Engineer & Architect
                          </span>
                          <span className="text-3xl sm:text-4xl font-signature text-accent dark:text-accent font-bold tracking-wider select-none block transform -rotate-2 mt-1">
                            Eugene Odibenuah
                          </span>
                        </div>
                        <div className="w-11 h-11 rounded-full border border-accent/30 bg-accent/10 flex items-center justify-center text-accent font-mono text-xs font-extrabold shadow-inner">
                          EO
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-6 mt-8 border-t border-gray-200 dark:border-white/5">
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                Engineering excellence grounded in rigorous analytical thinking, algorithmic precision, and continuous learning.
              </p>
            </div>
          </motion.article>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════════
            4. ⭐ TOOLS & TECHNOLOGIES — Visual Categorized Cards
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.section
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="bg-white dark:bg-[#141414] p-6 sm:p-10 md:p-12 rounded-[2rem] border border-gray-200 dark:border-white/10 shadow-2xl space-y-10"
        >
          {/* Section Header with Category Filter Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-[0.25em] mb-2">
                <StarIcon className="w-4 h-4" />
                <span>Production Stack</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-black dark:text-white">
                Tools & Technologies
              </h2>
              <p className="mt-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 font-light max-w-xl">
                The modern, battle-tested tools I use to design, engineer, deploy, and maintain production software.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Stack' },
                { key: 'frontend', label: 'Frontend' },
                { key: 'backend', label: 'Backend' },
                { key: 'cloud', label: 'Cloud' },
                { key: 'payments', label: 'Payments' },
                { key: 'design', label: 'Workflow' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveCategory(tab.key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    activeCategory === tab.key
                      ? 'bg-accent text-white shadow-md'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categorized Tool Cards */}
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {displayedCategories.map((category) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-heading font-bold text-black dark:text-white">
                      {category.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-light hidden sm:inline">
                      {category.description}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {category.tools.map((tool) => (
                      <motion.div
                        key={tool.name}
                        whileHover={shouldReduce ? {} : { y: -3 }}
                        transition={{ duration: 0.2 }}
                        className="group bg-gray-50 dark:bg-white/5 hover:bg-white dark:hover:bg-[#1a1a1a] p-3.5 rounded-xl border border-gray-200 dark:border-white/5 hover:border-accent dark:hover:border-accent/40 shadow-xs hover:shadow-md transition-all flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 p-1.5 border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0">
                          <TechIcon name={tool.name} className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-heading font-bold text-black dark:text-white group-hover:text-accent transition-colors truncate">
                          {tool.name}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════════
            6. HOW I WORK — Working Style & Principles
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.section
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-6 sm:p-10 md:p-12 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl space-y-8"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-gray-200 dark:border-white/5">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-accent">Working Style</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-black dark:text-white mt-1">
                How We Collaborate
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-light max-w-md">
              Built on transparency, clear expectations, and direct engineering accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workingStylePillars.map((pillar) => (
              <div key={pillar.title} className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <PillIcon name={pillar.icon} className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-base sm:text-lg font-heading font-bold text-black dark:text-white">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-light leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════════
            7. VISUAL QUICK FACTS
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.section
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {visualQuickFacts.map((fact) => (
            <motion.div
              key={fact.id}
              variants={item}
              whileHover={hover}
              transition={cardHoverTransition}
              className="bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-md flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-xs font-bold text-accent mb-3 block">
                  {fact.id}
                </span>
                <h3 className="text-base sm:text-lg font-heading font-bold text-black dark:text-white mb-1">
                  {fact.badge}
                </h3>
                <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-3">
                  {fact.label}
                </p>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 font-light border-t border-gray-100 dark:border-white/5 pt-3">
                {fact.detail}
              </p>
            </motion.div>
          ))}
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════════
            8. LET'S WORK TOGETHER / FINAL CTA
            ═══════════════════════════════════════════════════════════════════ */}
        <motion.section
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 sm:p-12 md:p-16 shadow-2xl relative overflow-hidden text-center space-y-8"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-accent to-transparent" />
          
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-accent">
              Start A Conversation
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-heading font-bold text-black dark:text-white leading-[1.05]">
              Let&apos;s build something <span className="text-accent">exceptional.</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 font-light leading-relaxed">
              Whether you&apos;re launching a startup, upgrading critical business systems, or automating manual workflows — I&apos;m ready to help you engineer a dependable digital product.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <motion.div whileHover={shouldReduce ? {} : buttonHover} whileTap={shouldReduce ? {} : buttonTap}>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center bg-accent text-white font-heading font-bold uppercase tracking-[0.15em] text-[11px] px-10 py-4 shadow-lg hover:shadow-accent/30 hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all duration-300 active:scale-[0.98]"
              >
                Start a Project
                <ArrowIcon className="w-4 h-4 ml-2" />
              </Link>
            </motion.div>
            <motion.div whileHover={shouldReduce ? {} : buttonHover} whileTap={shouldReduce ? {} : buttonTap}>
              <a
                href={`https://wa.me/${CONTACT.phoneE164 || '2348085186714'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border border-gray-300 dark:border-white/15 text-gray-900 dark:text-gray-100 font-heading font-bold uppercase tracking-[0.15em] text-[11px] px-10 py-4 hover:border-accent hover:text-accent transition-all duration-300 active:scale-[0.98] bg-transparent"
              >
                WhatsApp Direct ↗
              </a>
            </motion.div>
          </div>

          <div className="pt-8 border-t border-gray-100 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-xs text-gray-600 dark:text-gray-400">
            <div>
              <span className="block font-bold text-black dark:text-white mb-0.5">Email</span>
              <a href={`mailto:${CONTACT.email}`} className="hover:text-accent transition-colors">
                {CONTACT.email}
              </a>
            </div>
            <div>
              <span className="block font-bold text-black dark:text-white mb-0.5">Phone / WhatsApp</span>
              <a href={`tel:${CONTACT.phoneDisplay}`} className="hover:text-accent transition-colors">
                {CONTACT.phoneDisplay}
              </a>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
};

export default AboutPage;
