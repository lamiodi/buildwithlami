import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useInView, animate } from 'framer-motion';
import { 
  ShieldCheck, 
  Target, 
  Zap, 
  Sparkles, 
  Search, 
  PenTool, 
  Code2, 
  Rocket,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { 
  staggerContainer, 
  fadeUpItem, 
  cardHover, 
  cardHoverTransition, 
  sectionViewport, 
  reducedMotionVariants 
} from '../utils/motion';

const reasons = [
  {
    title: 'Production-Ready Engineering',
    description: 'Clean architecture, secure data handling, responsive interfaces, and maintainable systems built for real-world business workflows.',
    icon: ShieldCheck
  },
  {
    title: 'Business-Focused Solutions',
    description: 'Every project starts with your commercial goals, not a generic template. I scope, design, and engineer software that solves the actual problem.',
    icon: Target
  },
  {
    title: 'Fast, Transparent Delivery',
    description: "A clear milestone process with real-time sprint tracking. You always know what is being built, where things stand, and when it ships.",
    icon: Zap
  },
  {
    title: 'Premium User Experience',
    description: 'High-polish, user-centric interfaces engineered to feel fluid on every screen, build immediate trust, and maximize conversion rates.',
    icon: Sparkles
  }
];

const steps = [
  {
    number: '01',
    title: 'Discovery & Scope',
    description: 'We align on your goals, map user journeys, and define technical scope so there are zero surprises or ambiguous requirements.',
    icon: Search
  },
  {
    number: '02',
    title: 'Architecture & UI',
    description: 'I design high-fidelity interactive mockups and schema architecture for your approval before writing production code.',
    icon: PenTool
  },
  {
    number: '03',
    title: 'Milestone Build',
    description: 'You get a live staging link and dedicated tracking dashboard so you can follow sprint progress with zero chasing for updates.',
    icon: Code2
  },
  {
    number: '04',
    title: 'Launch & Handoff',
    description: 'Production deployment, DNS/SSL setup, 100% repository transfer, staff walkthroughs, and included 90-day warranty support.',
    icon: Rocket
  }
];

const stats = [
  { value: '2-4 wk', label: 'Avg. Project Sprint', isText: true },
  { value: 90, label: 'Days Included Warranty', suffix: ' Days' },
  { value: 24, label: 'Max Response Window', suffix: 'hr' },
];

const AnimatedStat = ({ stat }) => {
  const shouldReduce = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [displayValue, setDisplayValue] = useState(stat.isText ? stat.value : '0');

  useEffect(() => {
    if (!isInView || stat.isText) return;

    if (shouldReduce) {
      setDisplayValue(`${stat.value}`);
      return;
    }

    const controls = animate(0, stat.value, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest).toString());
      },
    });

    return () => controls.stop();
  }, [isInView, stat.value, stat.isText, shouldReduce]);

  return (
    <div ref={ref} className="text-center sm:text-left">
      <div className="text-3xl md:text-4xl font-heading font-bold text-black dark:text-white mb-1">
        {stat.isText ? stat.value : `${displayValue}${stat.suffix || ''}`}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold font-mono">
        {stat.label}
      </div>
    </div>
  );
};

const WhyAndHow = () => {
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  return (
    <section id="why-choose" className="py-24 px-6 md:px-12 bg-gray-50/60 dark:bg-[#0f0f0f] border-t border-b border-gray-200 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* PART 1: WHY BUILDWITHLAMI */}
        <div>
          <motion.div
            className="text-center max-w-3xl mx-auto mb-14"
            initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={sectionViewport}
            transition={{ duration: shouldReduce ? 0 : 0.5, ease: 'easeOut' }}
          >
            <div className="bwl-eyebrow mb-3 justify-center">
              <span className="w-2 h-2 bg-accent inline-block" />
              <span>03 · Principles & Execution Standards</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-black dark:text-white tracking-tight">
              Why Buildwith_lami <span className="text-accent">&</span> How It Works
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-light mt-4 leading-relaxed">
              I combine systems architecture, clean software engineering, and conversion-focused UX with a predictable, transparent four-step delivery process.
            </p>
          </motion.div>

          {/* 4 Reasons Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
          >
            {reasons.map((reason, idx) => {
              const IconComponent = reason.icon;
              return (
                <motion.div
                  key={`reason-${idx}`}
                  variants={item}
                  whileHover={shouldReduce ? {} : cardHover}
                  transition={cardHoverTransition}
                  className="p-6 sm:p-7 bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/90 dark:border-white/10 shadow-sm hover:border-accent/50 transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/15 transition-all pointer-events-none" />
                  <div>
                    <div className="w-12 h-12 bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-5 group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-heading font-bold mb-2.5 text-black dark:text-white group-hover:text-accent transition-colors">
                      {reason.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* CONNECTING DIVIDER */}
        <div id="how-it-works" className="relative flex items-center justify-center py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
          </div>
          <div className="relative px-6 bg-gray-50/60 dark:bg-[#0f0f0f] text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-accent inline-block" />
            <span>The 4-Step Delivery Process</span>
          </div>
        </div>

        {/* PART 2: THE 4-STEP DELIVERY PROCESS */}
        <div>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
          >
            {steps.map((step) => {
              const StepIcon = step.icon;
              return (
                <motion.div 
                  key={step.number}
                  variants={item}
                  whileHover={shouldReduce ? {} : cardHover}
                  transition={cardHoverTransition}
                  className="relative group p-6 sm:p-7 bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/90 dark:border-white/10 shadow-sm hover:border-accent/40 flex flex-col justify-between transition-all"
                >
                  <span className="absolute top-4 right-4 text-[10px] font-mono font-bold tracking-widest text-accent bg-accent/10 dark:bg-accent/15 px-2.5 py-1 border border-accent/30">
                    Step {step.number}
                  </span>
                  
                  <div>
                    <div className="w-12 h-12 bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-5 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                      <StepIcon className="w-6 h-6" />
                    </div>
                    
                    <h3 className="text-xl font-heading font-bold text-black dark:text-white mb-2 group-hover:text-accent transition-colors">
                      {step.title}
                    </h3>
                    
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed mb-4">
                      {step.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex items-center text-[11px] font-mono text-gray-400 dark:text-gray-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent mr-1.5 shrink-0" />
                    <span>Clear milestone sign-off</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            className="p-8 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-around gap-6 sm:gap-4"
            initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={sectionViewport}
            transition={{ duration: shouldReduce ? 0 : 0.6, delay: shouldReduce ? 0 : 0.2 }}
          >
            {stats.map((stat, i) => (
              <React.Fragment key={stat.label}>
                <AnimatedStat stat={stat} />
                {i < stats.length - 1 && (
                  <div className="hidden sm:block w-px h-10 bg-gray-200 dark:bg-white/10" />
                )}
              </React.Fragment>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default WhyAndHow;
