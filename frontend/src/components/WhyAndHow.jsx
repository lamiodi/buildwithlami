import { motion, useReducedMotion } from 'framer-motion';
import {
  ShieldCheck,
  Target,
  Zap,
  Sparkles,
  Search,
  PenTool,
  Code2,
  Rocket
} from 'lucide-react';
import {
  staggerContainer,
  fadeUpItem,
  sectionViewport,
  reducedMotionVariants
} from '../utils/motion';

const principles = [
  {
    title: 'Production-ready foundations',
    description: 'Secure data, maintainable architecture, and tested releases from day one.',
    icon: ShieldCheck
  },
  {
    title: 'Built around the business',
    description: 'Commercial goals and real workflows shape the scope—not a generic template.',
    icon: Target
  },
  {
    title: 'Progress you can see',
    description: 'Live staging and milestone tracking keep decisions, progress, and timing clear.',
    icon: Zap
  },
  {
    title: 'UX that earns trust',
    description: 'Responsive, conversion-focused experiences help people understand and act.',
    icon: Sparkles
  }
];

const steps = [
  {
    number: '01',
    title: 'Discover',
    description: 'Align goals, users, priorities, and technical scope before work begins.',
    icon: Search
  },
  {
    number: '02',
    title: 'Define',
    description: 'Approve the user flow, interface direction, and system blueprint.',
    icon: PenTool
  },
  {
    number: '03',
    title: 'Build',
    description: 'Review working software through live staging and milestone updates.',
    icon: Code2
  },
  {
    number: '04',
    title: 'Launch',
    description: 'Deploy, hand over the repository, and begin post-launch warranty support.',
    icon: Rocket
  }
];

const deliveryStandards = [
  ['Payments', '50% to begin, 50% on delivery'],
  ['Visibility', 'Live staging and project tracking'],
  ['Ownership', 'Repository and product handoff']
];

const WhyAndHow = () => {
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  return (
    <section
      id="why-choose"
      className="py-24 sm:py-28 px-6 md:px-12 bg-gray-50/60 dark:bg-[#0f0f0f] border-y border-gray-200 dark:border-white/5 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto">
        <motion.header
          className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-6 lg:gap-16 items-end"
          initial={shouldReduce ? {} : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={sectionViewport}
          transition={{ duration: shouldReduce ? 0 : 0.5, ease: 'easeOut' }}
        >
          <h2 className="max-w-2xl text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-[1.02] tracking-[-0.03em] text-black dark:text-white">
            Why Buildwith_lami works differently.
          </h2>
          <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            Systems thinking, disciplined engineering, and conversion-focused UX—delivered through a clear four-stage process.
          </p>
        </motion.header>

        <motion.div
          className="mt-14 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 dark:bg-white/10 border-y border-gray-200 dark:border-white/10"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          {principles.map((principle) => {
            const Icon = principle.icon;
            return (
              <motion.article
                key={principle.title}
                variants={item}
                className="bg-gray-50 dark:bg-[#0f0f0f] py-8 px-1 sm:px-7 lg:px-6"
              >
                <Icon className="w-5 h-5 text-accent mb-7" aria-hidden="true" />
                <h3 className="text-lg font-heading font-bold text-gray-950 dark:text-white">
                  {principle.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {principle.description}
                </p>
              </motion.article>
            );
          })}
        </motion.div>

        <div id="how-it-works" className="mt-24 sm:mt-32 scroll-mt-24">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] gap-5 lg:gap-16 items-end">
            <h2 className="max-w-3xl text-3xl sm:text-4xl lg:text-5xl font-heading font-bold leading-tight tracking-[-0.025em] text-black dark:text-white">
              From brief to launch, without guesswork.
            </h2>
            <p className="max-w-xl text-sm sm:text-base leading-relaxed text-gray-600 dark:text-gray-400">
              Each stage ends with a visible deliverable and a clear approval point.
            </p>
          </div>

          <motion.ol
            className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
          >
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <motion.li
                  key={step.number}
                  variants={item}
                  className="relative border-t-2 border-gray-300 dark:border-white/15 pt-6"
                >
                  <div className="flex items-center justify-between gap-4 mb-8">
                    <span className="font-mono text-xs font-bold tracking-[0.16em] text-accent">
                      {step.number}
                    </span>
                    <Icon className="w-5 h-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-black dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </motion.li>
              );
            })}
          </motion.ol>

          <div className="mt-14 grid sm:grid-cols-3 border-y border-gray-200 dark:border-white/10">
            {deliveryStandards.map(([label, value], index) => (
              <div
                key={label}
                className={`py-5 ${index > 0 ? 'sm:border-l sm:border-gray-200 sm:dark:border-white/10 sm:pl-7' : ''}`}
              >
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                  {label}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-gray-900 dark:text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyAndHow;
