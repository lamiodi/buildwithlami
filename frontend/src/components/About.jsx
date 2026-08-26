import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import { staggerContainer, fadeUpItem, sectionViewport, reducedMotionVariants } from '../utils/motion';

const About = () => {
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  return (
    <section id="about" className="px-6 md:px-12 max-w-7xl mx-auto py-24 text-center">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
      >
        <motion.div variants={item} className="bwl-eyebrow mb-3">
          <span className="w-2 h-2 bg-accent inline-block" />
          <span>05 · Studio Leadership & Philosophy</span>
        </motion.div>
        <motion.h2 variants={item} className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-12 tracking-tight text-black dark:text-white">
          ODIBENUAH EUGE<span className="text-accent">NE</span>
        </motion.h2>

        {/* Main Image */}
        <motion.div variants={item} className="w-full max-w-5xl mx-auto bg-gray-950 dark:bg-[#0c0c0c] mb-16 relative overflow-hidden shadow-2xl rounded-2xl border border-gray-200 dark:border-white/10 flex items-center justify-center">
          <picture className="w-full h-full block">
            <source type="image/webp" srcSet="/about-founder.webp" />
            <img 
              src="/about-founder.webp" 
              alt="Eugene Odibenuah Desk Setup" 
              className="w-full h-auto max-h-[720px] object-contain object-center block mx-auto opacity-95 dark:opacity-90"
              loading="lazy"
              decoding="async"
              width="1440"
              height="845"
            />
          </picture>
          <div className="absolute bottom-6 right-6 bg-white/90 dark:bg-[#141414]/90 backdrop-blur-md border border-gray-200 dark:border-white/10 text-black dark:text-white font-mono font-bold px-4 py-2 text-[10px] tracking-[0.2em] uppercase flex items-center shadow-lg z-10">
            <MapPin className="w-3.5 h-3.5 text-accent mr-2" />
            <span>LAGOS, NIGERIA</span>
          </div>
          <div className="absolute top-6 left-6 px-3.5 py-1.5 bg-black/70 backdrop-blur-md border border-white/10 text-white/90 font-mono text-[10px] font-medium tracking-[0.2em] uppercase flex items-center gap-2 z-10">
            <span className="w-1.5 h-1.5 bg-accent inline-block" />
            <span>My Setup</span>
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row text-left max-w-4xl mx-auto space-y-6 md:space-y-0 md:space-x-12 items-center justify-between">
          <motion.div
            className="md:w-1/2"
            variants={item}
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
          >
            <p className="text-xl md:text-2xl leading-relaxed text-black dark:text-white font-heading font-bold">
              Hi, I'm Eugene, a full-stack engineer and digital product designer.
            </p>
          </motion.div>
          <div className="md:w-1/2 flex flex-col items-start md:items-end text-left md:text-right">
            <motion.p 
              initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: shouldReduce ? 0 : 0.8, delay: shouldReduce ? 0 : 0.2 }}
              className="text-gray-700 dark:text-gray-300 leading-relaxed text-base md:text-lg font-light mb-6 opacity-90"
            >
              I build modern web platforms, e-commerce engines, and high-performance software for businesses and founders worldwide. Fixed milestones, transparent communication, and 100% code ownership.
            </motion.p>
            <Link
              to="/about"
              className="inline-flex items-center text-[11px] font-heading font-bold uppercase tracking-[0.15em] text-accent hover:text-black dark:hover:text-white transition-colors gap-1.5"
            >
              <span>Learn More About My Story & Stack</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default About;
