import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
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

/* ────────────────────────────────────────────────────────────────────────────
 * Static, content-only data. Defined outside the component so it is not
 * re-created on every render. This is a small but meaningful perf win for
 * the data structures that never change at runtime.
 * ──────────────────────────────────────────────────────────────────────────── */

// Achievement-oriented, founder-tone experience entries.
const experience = [
  {
    role: 'Founder & Full-Stack Developer',
    company: 'BuildWithLami',
    period: 'January 2023 – Present',
    location: 'Lekki, Lagos, Nigeria',
    description: [
      'Founded and operate a software studio delivering custom business websites, enterprise web applications, and SaaS platforms for clients across multiple industries.',
      'Designed and implemented secure authentication systems using JWT, encrypted password hashing, and role-based access control.',
      'Architected and shipped Express.js REST APIs backed by PostgreSQL, with a focus on data integrity, performance, and clear contract design.',
      'Integrated payment systems and third-party services (Paystack and others) to power real-world transactions and client workflows.',
      'Built responsive, accessible interfaces in React and Next.js with Tailwind CSS, prioritising clarity, performance, and long-term maintainability.',
      'Managed production deployments on Vercel and Render with scalable cloud hosting, environment management, and CI/CD workflows.',
      'Lead the full client lifecycle — from discovery and technical planning through delivery, handover, and long-term technical partnership.',
    ],
  },
  {
    role: 'Independent Full-Stack Developer',
    company: 'Freelance Engagements',
    period: '2021 – Present',
    location: 'Lagos, Nigeria (Remote)',
    description: [
      'Delivered e-commerce platforms for brands including TheTiaBrand, Prechi Clothing, and BubuLagos — covering storefronts, checkout, and order management.',
      'Designed and shipped SuperMarket Pro, an offline-first POS and inventory system built for reliability in low-connectivity environments.',
      'Developed the corporate website and digital presence for Sourceline Limited, a land surveying and geoinformatics company.',
      'Worked across the modern JavaScript stack — React, Node.js, Next.js, PostgreSQL, Prisma, and Supabase — with Paystack for payments.',
      'Handled end-to-end cloud delivery on Vercel, Render, and Cloudinary, including asset pipelines and environment configuration.',
    ],
  },
];

// Professional education copy focused on engineering fundamentals.
const education = [
  {
    period: '2018 – 2022',
    degree: 'B.Sc. Surveying & Geoinformatics',
    institution: 'Enugu State University of Science and Technology (ESUT)',
    details:
      'Developed a strong analytical and technical foundation in geospatial analysis, surveying principles, and structured problem-solving — skills that translate directly into systems thinking and software engineering.',
  },
  {
    period: '2023 – 2025',
    degree: 'Full-Stack Web Development',
    institution: 'Udemy — The Complete Full-Stack Web Development Bootcamp (Angela Yu)',
    details:
      'Deepened practical expertise across frontend architecture, backend development, databases, deployment, and modern product delivery through intensive, project-driven continuous learning.',
  },
];

// Meaningful quick facts. Intentionally free of marketing offers.
const quickFacts = [
  'Full-Stack Software Engineer',
  'Based in Lagos, Nigeria',
  'Available Worldwide (Remote)',
  'Custom Software Solutions',
  'React • Next.js • Node.js • PostgreSQL',
];

// Reusable inline star icon (decorative, aria-hidden).
const StarIcon = ({ className = 'w-8 h-8 text-gray-400 dark:text-white/50' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" />
  </svg>
);

// Reusable arrow icon used in CTA buttons.
const ArrowIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

// Reusable circular CTA arrow link — accessible, keyboard-friendly.
const ArrowLink = ({ to = '/contact', label = 'Open contact page' }) => (
  <motion.div whileHover={undefined} whileTap={undefined}>
    <Link
      to={to}
      aria-label={label}
      className="w-10 h-10 inline-flex items-center justify-center rounded-full border border-gray-200 dark:border-white/10 group-hover:bg-accent group-hover:border-accent group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#151515]"
    >
      <ArrowIcon />
    </Link>
  </motion.div>
);

const AboutPage = () => {
  const shouldReduce = useReducedMotion();

  // Memoize resolved motion variants so they don't re-evaluate on every render.
  const container = useMemo(() => (shouldReduce ? reducedMotionVariants : staggerContainer), [shouldReduce]);
  const item = useMemo(() => (shouldReduce ? reducedMotionVariants : fadeUpItem), [shouldReduce]);
  const hover = useMemo(() => (shouldReduce ? {} : cardHover), [shouldReduce]);

  // SEO + scroll-to-top. Sets a single, focused title and description.
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title =
      'About Eugene Odibenuah | BuildWithLami — Full-Stack Software Engineer';

    const setMeta = (selector, attr, value) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    setMeta(
      'meta[name="description"]',
      'content',
      'About BuildWithLami — founded by Eugene Odibenuah, a full-stack software engineer based in Lagos, Nigeria. We build custom business websites, SaaS platforms, enterprise web applications, and API integrations for clients worldwide.'
    );
    setMeta('meta[property="og:title"]', 'content', 'About Eugene Odibenuah | BuildWithLami');
    setMeta(
      'meta[property="og:description"]',
      'content',
      'Founder of BuildWithLami — full-stack software engineer building SaaS platforms, enterprise web apps, and custom business websites for clients in Nigeria and worldwide.'
    );
    setMeta('meta[property="og:type"]', 'content', 'profile');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background text-black dark:text-white pt-28 sm:pt-32 pb-20 sm:pb-24 px-4 sm:px-6 md:px-10 lg:px-12 font-body selection:bg-accent selection:text-white transition-colors duration-300 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        {/* ── Page Title ─────────────────────────────────────────────────── */}
        <motion.header
          initial={shouldReduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: shouldReduce ? 0 : 0.5 }}
          className="flex items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 text-black dark:text-white"
        >
          <StarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-white/50" />
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight uppercase text-center leading-tight">
            About Me
          </h1>
          <StarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-white/50" />
        </motion.header>

        {/* ── Bento Grid ─────────────────────────────────────────────────── */}
        <motion.section
          variants={container}
          initial="hidden"
          animate="visible"
          aria-label="About Eugene Odibenuah and BuildWithLami"
          className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6"
        >
          {/* Row 1 — Image card (headshot placeholder) */}
          <motion.article
            variants={item}
            whileHover={hover}
            transition={cardHoverTransition}
            className="md:col-span-4 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-5 sm:p-6 rounded-[1.75rem] sm:rounded-[2rem] border border-gray-200 dark:border-white/5 flex items-center justify-center shadow-xl"
          >
            <div className="relative w-full aspect-square overflow-hidden rounded-3xl bg-accent">
              {/*
                TODO: Replace this placeholder with your professional headshot.
                Recommended: square (1:1), high-resolution, well-lit portrait.
                Example: <img src="/images/eugene-headshot.jpg" alt="Eugene Odibenuah" ... />
              */}
              <img
                src="https://images.unsplash.com/photo-1547394765-185e1e68f34e?q=80&w=2070&auto=format&fit=crop"
                alt="Placeholder portrait — replace with professional headshot of Eugene Odibenuah"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover opacity-90 mix-blend-overlay"
              />
            </div>
          </motion.article>

          {/* Row 1 — Founder intro card */}
          <motion.article
            variants={item}
            whileHover={hover}
            transition={cardHoverTransition}
            className="md:col-span-8 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-6 sm:p-8 md:p-10 lg:p-12 rounded-[1.75rem] sm:rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl relative overflow-hidden group"
          >
            <StarIcon className="absolute top-6 left-6 sm:top-10 sm:left-10 w-7 h-7 sm:w-8 sm:h-8 text-gray-300 dark:text-white/20" />
            <div className="mt-10 sm:mt-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3 sm:mb-4 break-words">
                Eugene Odibenuah
              </h2>
              <p className="text-xs sm:text-sm uppercase tracking-widest text-accent font-bold mb-4 sm:mb-5">
                Founder, BuildWithLami · Full-Stack Software Engineer · Technology Consultant
              </p>
              <p className="text-gray-800 dark:text-gray-200 text-base sm:text-lg leading-[1.7] sm:leading-[1.8] max-w-2xl font-light opacity-95">
                I am the founder of BuildWithLami and a full-stack software engineer based in Lagos, Nigeria.
                I partner with founders, growing teams, and established businesses to design and build custom
                business websites, enterprise web applications, SaaS platforms, client portals, admin dashboards,
                e-commerce systems, and API integrations — engineered for performance, reliability, and
                long-term growth.
              </p>
            </div>
          </motion.article>

          {/* Row 2 — Experience card */}
          <motion.article
            variants={item}
            whileHover={hover}
            transition={cardHoverTransition}
            className="md:col-span-6 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-6 sm:p-8 md:p-10 lg:p-12 rounded-[1.75rem] sm:rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl"
            aria-labelledby="experience-heading"
          >
            <h3
              id="experience-heading"
              className="text-sm font-bold tracking-widest text-gray-700 dark:text-white/80 uppercase mb-6 sm:mb-8 font-heading"
            >
              Experience
            </h3>
            <div className="space-y-8 sm:space-y-10">
              {experience.map((exp, index) => (
                <div key={`${exp.company}-${index}`}>
                  <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-1 font-bold">
                    {exp.period}
                  </p>
                  <h4 className="text-lg sm:text-xl font-heading font-bold break-words">
                    {exp.role}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm mt-1 break-words">
                    {exp.company} • {exp.location}
                  </p>
                  <ul className="text-gray-800 dark:text-gray-200 text-sm mt-3 leading-relaxed opacity-95 space-y-2">
                    {exp.description.map((desc) => (
                      <li key={desc} className="flex items-start gap-2">
                        <span className="text-accent mt-1 shrink-0" aria-hidden="true">●</span>
                        <span className="break-words">{desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.article>

          {/* Row 2 — Education card */}
          <motion.article
            variants={item}
            whileHover={hover}
            transition={cardHoverTransition}
            className="md:col-span-6 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-6 sm:p-8 md:p-10 lg:p-12 rounded-[1.75rem] sm:rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl"
            aria-labelledby="education-heading"
          >
            <h3
              id="education-heading"
              className="text-sm font-bold tracking-widest text-gray-700 dark:text-white/80 uppercase mb-6 sm:mb-8 font-heading"
            >
              Education
            </h3>
            <div className="space-y-8 sm:space-y-10">
              {education.map((edu, index) => (
                <div key={`${edu.degree}-${index}`}>
                  <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-1 font-bold">
                    {edu.period}
                  </p>
                  <h4 className="text-lg sm:text-xl font-heading font-bold break-words">
                    {edu.degree}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm mt-1 break-words">
                    {edu.institution}
                  </p>
                  <p className="text-gray-800 dark:text-gray-200 text-sm mt-3 leading-relaxed opacity-95 break-words">
                    {edu.details}
                  </p>
                </div>
              ))}
            </div>
          </motion.article>

          {/* Row 3 — Connect / contact card */}
          <motion.article
            variants={item}
            whileHover={hover}
            transition={cardHoverTransition}
            className="md:col-span-3 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-6 sm:p-8 rounded-[1.75rem] sm:rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl flex flex-col justify-between group hover:border-accent dark:hover:border-white/20 transition-colors"
            aria-labelledby="connect-heading"
          >
            <div className="space-y-4 mb-6 sm:mb-8">
              <div className="bg-gray-50 dark:bg-[#151515] p-4 rounded-2xl border border-gray-200 dark:border-white/5">
                <p className="text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2 font-bold">
                  Email
                </p>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="text-sm text-black dark:text-white hover:text-accent transition-colors break-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                >
                  {CONTACT.email}
                </a>
              </div>
              <div className="bg-gray-50 dark:bg-[#151515] p-4 rounded-2xl border border-gray-200 dark:border-white/5">
                <p className="text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2 font-bold">
                  Phone
                </p>
                <a
                  href={`tel:${CONTACT.phoneDisplay}`}
                  className="text-sm text-black dark:text-white hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
                >
                  {CONTACT.phoneDisplay}
                </a>
              </div>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1 font-bold">
                  Let&apos;s connect
                </p>
                <h4 id="connect-heading" className="text-lg sm:text-xl font-heading font-bold">
                  Contact Info
                </h4>
              </div>
              <motion.div whileHover={shouldReduce ? {} : buttonHover} whileTap={shouldReduce ? {} : buttonTap}>
                <ArrowLink to="/contact" label="Go to contact page" />
              </motion.div>
            </div>
          </motion.article>

          {/* Row 3 — CTA card */}
          <motion.article
            variants={item}
            whileHover={hover}
            transition={cardHoverTransition}
            className="md:col-span-6 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-6 sm:p-8 rounded-[1.75rem] sm:rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl flex flex-col justify-between group cursor-pointer hover:border-accent dark:hover:border-white/20 transition-colors relative overflow-hidden"
            aria-labelledby="cta-heading"
          >
            <StarIcon className="absolute top-6 left-6 sm:top-8 sm:left-8 w-7 h-7 sm:w-8 sm:h-8 text-gray-300 dark:text-white/20" />
            <div className="mt-10 sm:mt-12 mb-4">
              <h2
                id="cta-heading"
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold leading-[1.1] break-words"
              >
                Let&apos;s <br className="hidden xs:inline" />
                work <span className="text-accent">together.</span>
              </h2>
              <p className="text-gray-800 dark:text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed font-light mt-5 max-w-md opacity-95 break-words">
                Whether you&apos;re launching a startup, modernising your business, or building a scalable
                SaaS platform, I help transform ideas into reliable, high-performance digital products
                designed for long-term growth.
              </p>
            </div>
            <motion.div
              whileHover={shouldReduce ? {} : buttonHover}
              whileTap={shouldReduce ? {} : buttonTap}
              className="self-end"
            >
              <Link
                to="/contact"
                aria-label="Start a project with BuildWithLami"
                className="w-10 h-10 inline-flex items-center justify-center rounded-full border border-gray-200 dark:border-white/10 group-hover:bg-accent group-hover:border-accent group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#151515]"
              >
                <ArrowIcon />
              </Link>
            </motion.div>
          </motion.article>

          {/* Row 3 — Quick Facts card */}
          <motion.article
            variants={item}
            whileHover={hover}
            transition={cardHoverTransition}
            className="md:col-span-3 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-6 sm:p-8 rounded-[1.75rem] sm:rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl flex flex-col justify-between group hover:border-accent dark:hover:border-white/20 transition-colors"
            aria-labelledby="quick-facts-heading"
          >
            <div className="mb-6 sm:mb-8 bg-gray-50 dark:bg-[#151515] w-full p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-white/5">
              <p
                id="quick-facts-heading"
                className="text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-4 font-bold"
              >
                Quick Facts
              </p>
              <ul className="space-y-3">
                {quickFacts.map((fact) => (
                  <li
                    key={fact}
                    className="flex items-start gap-2 text-sm text-black dark:text-white"
                  >
                    <span className="text-accent mt-1 shrink-0" aria-hidden="true">●</span>
                    <span className="break-words">{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-1 font-bold">
                  Working style
                </p>
                <h4 className="text-lg sm:text-xl font-heading font-bold">Availability</h4>
              </div>
              <motion.div whileHover={shouldReduce ? {} : buttonHover} whileTap={shouldReduce ? {} : buttonTap}>
                <ArrowLink to="/contact" label="Discuss availability" />
              </motion.div>
            </div>
          </motion.article>
        </motion.section>
      </div>
    </div>
  );
};

export default AboutPage;
