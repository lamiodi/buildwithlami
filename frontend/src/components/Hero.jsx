import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, fadeUpItem, buttonHover, buttonTap, sectionViewport, reducedMotionVariants } from '../utils/motion';

const Hero = () => {
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  return (
    <section id="home" className="px-6 md:px-12 max-w-7xl mx-auto pt-12 pb-24 flex flex-col md:flex-row items-center justify-between relative">
      <motion.div
        className="w-full md:w-2/3 z-10"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.p variants={item} className="text-accent uppercase tracking-[0.3em] text-[11px] font-bold mb-6">
          Web Apps That Drive Results
        </motion.p>
        <motion.h1 variants={item} className="text-5xl md:text-7xl lg:text-[90px] font-heading font-bold leading-[0.95] tracking-tight mb-6 text-black dark:text-white">
          I Build Web Apps <br className="hidden md:block" />
          That <span className="italic text-accent">Grow</span> Your <br className="hidden md:block" />
          Revenue
        </motion.h1>
        <motion.p variants={item} className="text-gray-600 dark:text-gray-200 text-lg md:text-xl max-w-xl leading-relaxed mb-10 font-light opacity-90">
          From idea to launch in weeks, not months. I design, build, and ship high-performance web applications for founders and growing businesses.
        </motion.p>
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center gap-4">
          <motion.a
            href="#contact"
            className="bg-accent text-white font-bold uppercase text-[11px] px-10 py-4 tracking-[0.2em] hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all duration-300 inline-block text-center shadow-lg hover:shadow-accent/30"
            whileHover={shouldReduce ? {} : buttonHover}
            whileTap={shouldReduce ? {} : buttonTap}
          >
            Start Your Project
          </motion.a>
          <motion.a
            href="#projects"
            className="text-gray-800 dark:text-gray-200 text-[11px] uppercase tracking-[0.2em] font-bold hover:text-accent transition-all inline-block text-center py-4 px-4"
            whileHover={shouldReduce ? {} : buttonHover}
            whileTap={shouldReduce ? {} : buttonTap}
          >
            See My Work →
          </motion.a>
        </motion.div>
      </motion.div>
      
      {/* Image */}
      <motion.div
        className="w-full md:w-1/3 mt-12 md:mt-0 flex justify-end relative"
        initial={shouldReduce ? {} : { opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: shouldReduce ? 0 : 0.7, delay: shouldReduce ? 0 : 0.4, ease: 'easeOut' }}
      >
        <div className="w-64 h-80 md:w-80 md:h-96 bg-gray-800 relative overflow-visible shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop" 
            alt="Eugene Odibenuah" 
            className="w-full h-full object-cover"
          />
          <div className="absolute -bottom-6 -right-6 bg-white text-black text-xl font-bold px-4 py-2 font-handwritten transform -rotate-6 shadow-lg z-20">
            Meet The Founder
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
