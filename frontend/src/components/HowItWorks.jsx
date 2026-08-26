import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { staggerContainer, fadeUpItem, cardHover, cardHoverTransition, buttonHover, buttonTap, sectionViewport, reducedMotionVariants } from '../utils/motion';

const steps = [
  {
    number: '01',
    title: 'Discovery',
    description: 'I hop on a call, map out your goals, and define the scope so there are zero surprises.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    )
  },
  {
    number: '02',
    title: 'Design',
    description: 'I create high-fidelity mockups for your review. You approve before a single line of code is written.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    )
  },
  {
    number: '03',
    title: 'Build',
    description: 'You get a real-time project tracker so you always know exactly where things stand with zero chasing for updates.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    )
  },
  {
    number: '04',
    title: 'Launch',
    description: 'I deploy, hand off assets and training, and stick around with 4 months of free maintenance.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L15 22l-4-9-9-4z"/>
      </svg>
    )
  }
];

const stats = [
  { value: '2-4 wk', label: 'Avg. Delivery', isText: true },
  { value: 4, label: 'Months Free Maintenance', suffix: '' },
  { value: 24, label: 'Response Time', suffix: 'hr' },
];

// Animated counter that counts up when in view
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
    <div ref={ref} className="text-center md:text-left">
      <div className="text-3xl md:text-4xl font-heading font-bold text-white mb-1">
        {stat.isText ? stat.value : `${displayValue}${stat.suffix || ''}`}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-gray-300 font-bold">{stat.label}</div>
    </div>
  );
};

const HowItWorks = () => {
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  return (
    <section id="how-it-works" className="py-24 px-6 md:px-12 bg-white dark:bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          <div className="bwl-badge mb-4 inline-flex">
            <span>// 04. EXECUTION FRAMEWORK</span>
          </div>
          <motion.h2 variants={item} className="text-4xl md:text-5xl font-heading font-bold text-black dark:text-white mb-4">
            How It <span className="italic font-normal text-accent">Works</span>
          </motion.h2>
          <motion.p variants={item} className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto font-light leading-relaxed opacity-90">
            A transparent, four-step process from first call to live site. No guesswork, no scope creep.
          </motion.p>
        </motion.div>

        {/* Steps Grid (Horizontal Snap on Mobile, 2-Col on Tablet, 4-Col on Desktop) */}
        <motion.div
          className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory scrollbar-none -mx-6 px-6 md:mx-0 md:px-0"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          {steps.map((step, i) => (
            <motion.div 
              key={step.number}
              variants={item}
              whileHover={shouldReduce ? {} : cardHover}
              transition={cardHoverTransition}
              className="shrink-0 md:shrink w-[80vw] max-w-[320px] sm:w-[300px] md:w-auto min-w-0 snap-center relative group p-6 sm:p-7 bwl-card hover:border-accent/40 flex flex-col justify-between"
            >
              {/* Step Number */}
              <span className="absolute top-4 right-4 text-[10px] font-mono font-bold tracking-widest text-accent bg-accent/10 dark:bg-accent/15 px-2.5 py-1 border border-accent/30">
                Step {step.number}
              </span>
              
              <div>
                {/* Icon */}
                <div className="w-12 h-12 bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-5 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                  {step.icon}
                </div>
                
                <h3 className="text-xl font-heading font-bold text-black dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-light">
                  {step.description}
                </p>
              </div>

              {/* Connector arrow (hidden on last + mobile) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 text-gray-300 dark:text-gray-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Stats Banner */}
        <motion.div
          className="bwl-feature-card shadow-xl"
          initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={sectionViewport}
          transition={{ duration: shouldReduce ? 0 : 0.5, ease: 'easeOut' }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-wrap justify-center md:justify-start gap-12">
              {stats.map(stat => (
                <AnimatedStat key={stat.label} stat={stat} />
              ))}
            </div>
            <a 
              href="#contact"
              className="btn-primary shrink-0"
            >
              Start a Project
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default HowItWorks;
