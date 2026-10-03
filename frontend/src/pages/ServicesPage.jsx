import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  Check,
  Database,
  MonitorSmartphone,
  PanelsTopLeft,
  ScanSearch,
  SearchCheck,
} from 'lucide-react';
import {
  fadeUpItem,
  reducedMotionVariants,
  sectionViewport,
  staggerContainer,
} from '../utils/motion';

const audienceTypes = [
  'Founders launching products',
  'Service businesses',
  'Schools and estates',
  'Operations teams',
];

const services = [
  {
    id: 'business-portals',
    pricingCategory: 'portals',
    title: 'Business systems and ERP',
    bestFor: 'Schools, estates, warehouses, retailers, and teams replacing manual operations',
    description: 'Bring daily operations into one dependable system instead of spreading work across paper, chat threads, and disconnected spreadsheets.',
    outcome: 'A clearer operating workflow with structured records, role-based access, and less repetitive administration.',
    deliverables: [
      'School admissions, grading, fees, and report portals',
      'Estate visitor access and QR gate-pass workflows',
      'Warehouse inventory, batches, expiry, and transfers',
      'Retail POS, barcode, receipt, and stock operations',
      'Repository handoff, documentation, and staff training',
    ],
    icon: Building2,
  },
  {
    id: 'web-platforms',
    pricingCategory: 'software',
    title: 'Custom web platforms',
    bestFor: 'New digital products, client portals, internal tools, and multi-role applications',
    description: 'Plan and build the complete product layer: user journeys, interface, backend logic, database, permissions, and third-party services.',
    outcome: 'A launch-ready platform shaped around the business rather than forced into an off-the-shelf template.',
    deliverables: [
      'Responsive product interface and reusable design system',
      'Secure accounts, permissions, and administrative controls',
      'Payments, messaging, webhooks, and service integrations',
      'Structured PostgreSQL data and documented APIs',
      'Production deployment and post-launch warranty support',
    ],
    icon: PanelsTopLeft,
  },
  {
    id: 'interfaces',
    pricingCategory: 'websites',
    title: 'Websites and digital storefronts',
    bestFor: 'Brands that need a sharper offer, stronger trust, and a faster path to enquiry or purchase',
    description: 'Create a focused customer experience with clear messaging, purposeful motion, responsive layouts, and performance built into the implementation.',
    outcome: 'A credible, fast website that makes the offer easier to understand and the next action easier to take.',
    deliverables: [
      'Original visual direction aligned with your brand',
      'Responsive pages designed for mobile and desktop',
      'Accessible interactions and conversion-focused forms',
      'Technical SEO, metadata, and social sharing previews',
      'Performance testing and production deployment',
    ],
    icon: MonitorSmartphone,
  },
  {
    id: 'backend-data',
    pricingCategory: 'software',
    title: 'APIs and data systems',
    bestFor: 'Products that depend on reliable data, secure access, and connected business tools',
    description: 'Design the technical backbone behind the interface, including domain models, APIs, authentication, integrations, queues, and recovery paths.',
    outcome: 'A maintainable backend with clear data rules, safer access, and room to grow without avoidable rework.',
    deliverables: [
      'Documented API architecture and validation rules',
      'Relational data modelling, indexes, and migrations',
      'Authentication, permissions, rate limits, and audit trails',
      'Third-party API and webhook integrations',
      'Backup, monitoring, and operational runbooks',
    ],
    icon: Database,
  },
  {
    id: 'audits-strategy',
    pricingCategory: 'software',
    title: 'Technical strategy and audits',
    bestFor: 'Existing products, difficult rebuild decisions, performance issues, and unclear technical scope',
    description: 'Review the product, codebase, infrastructure, and delivery risks before more time or budget is committed.',
    outcome: 'A prioritized plan that separates urgent fixes from useful improvements and longer-term investments.',
    deliverables: [
      'Code quality, security, and dependency review',
      'Performance and Core Web Vitals analysis',
      'Architecture and database risk assessment',
      'Sequenced roadmap with scope and budget guidance',
      'Recorded walkthrough and decision session',
    ],
    icon: ScanSearch,
  },
  {
    id: 'seo-growth',
    pricingCategory: 'seo',
    title: 'Technical SEO and search foundations',
    bestFor: 'Businesses whose websites are difficult to discover, crawl, understand, or measure',
    description: 'Improve the technical signals that help search engines find, interpret, and reliably index the right pages.',
    outcome: 'A healthier search foundation with measurable fixes and a practical path for ongoing content growth.',
    deliverables: [
      'Crawlability, indexation, and metadata audit',
      'Structured data and semantic page architecture',
      'Core Web Vitals and frontend performance fixes',
      'Sitemaps, robots rules, canonicals, and redirects',
      'Search Console and analytics measurement setup',
    ],
    icon: SearchCheck,
  },
];

const workflowSteps = [
  {
    number: '01',
    title: 'Discover',
    description: 'Define the business goal, users, constraints, and the smallest useful version to build.',
  },
  {
    number: '02',
    title: 'Shape',
    description: 'Approve the product flow, interface direction, technical architecture, and delivery milestones.',
  },
  {
    number: '03',
    title: 'Build',
    description: 'Review working software through live staging, focused feedback, and visible milestone progress.',
  },
  {
    number: '04',
    title: 'Launch',
    description: 'Deploy, verify the production release, transfer the repository, and begin warranty support.',
  },
];

const deliveryStandards = [
  ['Commercial terms', '50% to begin, 50% on delivery'],
  ['Project visibility', 'Live staging and milestone updates'],
  ['Ownership', 'Repository and product handoff'],
  ['After launch', 'Defined warranty support'],
];

const ServicesPage = () => {
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-black transition-colors duration-300 dark:bg-background dark:text-white">
      <section className="px-6 pb-20 pt-32 sm:pb-24 sm:pt-40 md:px-12">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={shouldReduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduce ? 0 : 0.55, ease: 'easeOut' }}
            className="grid items-end gap-12 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)] lg:gap-20"
          >
            <div>
              <p className="mb-6 font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Buildwith_lami services
              </p>
              <h1 className="max-w-5xl text-5xl font-heading font-bold leading-[0.98] tracking-[-0.035em] text-black dark:text-white sm:text-6xl lg:text-[5.25rem]">
                Strategy, design, and engineering in one studio.
              </h1>
              <p className="mt-7 max-w-2xl text-base font-light leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg">
                I turn business requirements into clear, dependable digital products - from focused websites to operational software and the systems behind them.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/contact" className="btn-primary w-full sm:w-auto">
                  Discuss your project
                </Link>
                <Link to="/pricing" className="btn-secondary w-full sm:w-auto">
                  Review pricing
                </Link>
              </div>
            </div>

            <aside className="border-t border-gray-200 pt-6 dark:border-white/10 lg:border-l lg:border-t-0 lg:pb-1 lg:pl-8 lg:pt-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                One accountable partner
              </p>
              <p className="mt-4 text-xl font-heading font-bold leading-snug text-gray-950 dark:text-white">
                The person shaping the solution is also the person building it.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Fewer handoffs, faster decisions, and direct visibility from the first scope conversation through production launch.
              </p>
            </aside>
          </motion.div>

          <motion.ul
            variants={container}
            initial="hidden"
            animate="visible"
            className="mt-16 grid border-y border-gray-200 dark:border-white/10 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Clients served"
          >
            {audienceTypes.map((audience, index) => (
              <motion.li
                key={audience}
                variants={item}
                className={`py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 ${
                  index % 2 === 1 ? 'sm:border-l sm:border-gray-200 sm:pl-5 sm:dark:border-white/10' : ''
                } ${
                  index > 0 ? 'lg:border-l lg:border-gray-200 lg:pl-5 lg:dark:border-white/10' : ''
                } ${index > 1 ? 'border-t border-gray-200 dark:border-white/10 lg:border-t-0' : ''}`}
              >
                {audience}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      <section className="border-y border-gray-200 bg-gray-50/70 px-6 py-24 transition-colors dark:border-white/5 dark:bg-[#0f0f0f] sm:py-28 md:px-12">
        <div className="mx-auto max-w-7xl">
          <header className="grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] lg:gap-20">
            <div>
              <p className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Capabilities
              </p>
              <h2 className="max-w-3xl text-4xl font-heading font-bold leading-[1.02] tracking-[-0.03em] text-black dark:text-white sm:text-5xl lg:text-6xl">
                Choose the problem, not a pre-built package.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base">
              Every engagement starts with the outcome you need. The scope, technology, and delivery plan follow from that.
            </p>
          </header>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
            className="mt-16 border-t border-gray-300 dark:border-white/15"
            aria-label="Service catalogue"
          >
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.article
                  key={service.id}
                  id={service.id}
                  variants={item}
                  className="group grid gap-8 border-b border-gray-300 py-10 dark:border-white/15 md:grid-cols-12 md:gap-6 lg:py-14"
                >
                  <div className="flex items-start justify-between md:col-span-2 md:block">
                    <span className="font-mono text-xs font-bold tracking-[0.18em] text-accent">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <Icon className="h-6 w-6 text-gray-400 transition-colors duration-300 group-hover:text-accent md:mt-10" aria-hidden="true" />
                  </div>

                  <div className="min-w-0 md:col-span-5">
                    <h3 className="text-3xl font-heading font-bold leading-tight tracking-[-0.025em] text-black transition-colors duration-300 group-hover:text-accent dark:text-white sm:text-4xl">
                      {service.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-xs font-semibold leading-relaxed text-gray-500 dark:text-gray-400">
                      Best for: {service.bestFor}
                    </p>
                    <p className="mt-6 max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
                      {service.description}
                    </p>
                    <div className="mt-6 border-l border-accent pl-4">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                        Intended outcome
                      </p>
                      <p className="mt-1.5 max-w-xl text-sm font-medium leading-relaxed text-gray-900 dark:text-gray-100">
                        {service.outcome}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-0 md:col-span-5 lg:pl-8">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                      Typical scope
                    </p>
                    <ul className="mt-5 space-y-3">
                      {service.deliverables.map((deliverable) => (
                        <li key={deliverable} className="flex items-start gap-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                          <span>{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={`/contact?service=${encodeURIComponent(service.pricingCategory)}`}
                      className="mt-8 inline-flex min-h-11 items-center gap-2 font-heading text-xs font-bold uppercase tracking-[0.14em] text-black transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:text-white dark:hover:text-accent"
                    >
                      Request this scope
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-24 sm:py-32 md:px-12">
        <div className="mx-auto max-w-7xl">
          <header className="grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] lg:gap-20">
            <div>
              <p className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Delivery process
              </p>
              <h2 className="max-w-3xl text-4xl font-heading font-bold leading-[1.02] tracking-[-0.03em] text-black dark:text-white sm:text-5xl lg:text-6xl">
                From brief to launch, without guesswork.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base">
              Each stage ends with a visible deliverable and a clear approval point, so progress never disappears behind process.
            </p>
          </header>

          <motion.ol
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
            className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
          >
            {workflowSteps.map((step) => (
              <motion.li key={step.number} variants={item} className="border-t-2 border-gray-300 pt-6 dark:border-white/15">
                <span className="font-mono text-xs font-bold tracking-[0.16em] text-accent">{step.number}</span>
                <h3 className="mt-9 text-2xl font-heading font-bold text-black dark:text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{step.description}</p>
              </motion.li>
            ))}
          </motion.ol>

          <div className="mt-16 grid border-y border-gray-200 dark:border-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {deliveryStandards.map(([label, value], index) => (
              <div
                key={label}
                className={`py-5 ${
                  index % 2 === 1 ? 'sm:border-l sm:border-gray-200 sm:pl-6 sm:dark:border-white/10' : ''
                } ${
                  index > 0 ? 'lg:border-l lg:border-gray-200 lg:pl-6 lg:dark:border-white/10' : ''
                } ${index > 1 ? 'border-t border-gray-200 dark:border-white/10 lg:border-t-0' : ''}`}
              >
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">{label}</p>
                <p className="mt-1.5 text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 md:px-12 md:pb-32">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-3xl bg-[#111111] text-white lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
          <div className="p-8 sm:p-12 lg:p-16">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">Scope and pricing</p>
            <h2 className="mt-5 max-w-3xl text-4xl font-heading font-bold leading-[1.03] tracking-[-0.03em] sm:text-5xl">
              Start with a clear range. Refine it around the real work.
            </h2>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base">
              Review standard packages for a useful baseline. Your final proposal will define the exact scope, timeline, milestones, exclusions, and handoff before work begins.
            </p>
          </div>

          <div className="flex flex-col justify-between border-t border-white/10 bg-white/[0.04] p-8 sm:p-12 lg:border-l lg:border-t-0">
            <div className="space-y-5">
              <div className="flex items-start gap-3 text-sm text-gray-200">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span>Pricing is shown automatically for your region.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-200">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span>Custom systems are scoped around requirements and risk.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-200">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span>No build begins without written deliverables and milestones.</span>
              </div>
            </div>
            <div className="mt-10 flex flex-col gap-3">
              <Link to="/pricing" className="btn-primary w-full">
                View pricing
              </Link>
              <Link
                to="/contact"
                className="inline-flex min-h-12 w-full items-center justify-center border border-white/20 px-8 text-center font-heading text-[11px] font-bold uppercase tracking-[0.15em] text-white transition-colors hover:border-white hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-[0.98]"
              >
                Request a custom scope
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ServicesPage;
