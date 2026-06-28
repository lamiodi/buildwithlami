import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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
        <motion.p variants={item} className="uppercase tracking-widest text-sm text-gray-500 dark:text-gray-400 mb-2 font-bold">About Me</motion.p>
        <motion.h2 variants={item} className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-12 tracking-tight text-black dark:text-white">
          ODIBENUAH EUGE<span className="text-accent">NE</span>
        </motion.h2>

        {/* Main Image */}
        <motion.div variants={item} className="w-full h-64 md:h-[500px] bg-gray-200 dark:bg-gray-800 mb-16 relative overflow-hidden shadow-2xl rounded-sm">
          <img 
            src="https://images.unsplash.com/photo-1547394765-185e1e68f34e?q=80&w=2070&auto=format&fit=crop" 
            alt="My Desk Setup" 
            className="w-full h-full object-cover opacity-90 dark:opacity-80"
          />
          <div className="absolute bottom-6 right-6 bg-white/90 dark:bg-[#1a1a1a]/80 backdrop-blur-md border border-gray-200 dark:border-white/10 text-black dark:text-white font-bold px-6 py-3 rounded-full text-sm tracking-widest uppercase flex items-center shadow-lg">
            <span className="text-accent mr-2 text-lg">📍</span> LAGOS, NIGERIA
          </div>
          <div className="absolute top-6 left-6 font-handwritten text-4xl text-white transform -rotate-3 opacity-90 drop-shadow-md">
            My Setup
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row text-left max-w-4xl mx-auto space-y-6 md:space-y-0 md:space-x-12">
          <motion.div
            className="md:w-1/3"
            variants={item}
            initial="hidden"
            whileInView="visible"
            viewport={sectionViewport}
          >
            <p className="text-lg md:text-xl leading-relaxed text-black dark:text-white font-medium">
              Hi, I'm Eugene, a Nigerian<br />full-stack web developer
            </p>
          </motion.div>
          <div className="md:w-2/3 ml-auto text-right flex justify-end">
            <motion.p 
              initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: shouldReduce ? 0 : 0.8, delay: shouldReduce ? 0 : 0.2 }}
              className="text-gray-700 dark:text-gray-200 leading-relaxed text-lg md:text-xl font-light max-w-lg opacity-90"
            >
              I specialize in building modern, scalable web applications that are fast, reliable, and easy to use. From idea to deployment, I focus on creating systems that not only work but grow with your business.
            </motion.p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default About;
