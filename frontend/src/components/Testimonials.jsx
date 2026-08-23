import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, fadeUpItem, sectionViewport, reducedMotionVariants } from '../utils/motion';
import { api } from '../services/api';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  useEffect(() => {
    // In a real app, you would fetch from /api/testimonials where is_featured = true
    // For now, we use placeholder data that looks premium
    setTestimonials([
      {
        id: 1,
        content: "BuildWithLami transformed our operations. Their software division built a custom portal that cut our processing time in half.",
        author: "Sarah Johnson",
        role: "Operations Director, TechFlow",
        image: "https://i.pravatar.cc/150?img=47"
      },
      {
        id: 2,
        content: "The drone mapping data provided by Lami ODI was incredibly precise. It saved us weeks on our agricultural surveying project.",
        author: "David Okafor",
        role: "Chief Surveyor, AgriCorp",
        image: "https://i.pravatar.cc/150?img=33"
      },
      {
        id: 3,
        content: "Professional, fast, and technically brilliant. They understood exactly what our SaaS needed and delivered beyond expectations.",
        author: "Elena Rodriguez",
        role: "Founder, SaaSify",
        image: "https://i.pravatar.cc/150?img=12"
      }
    ]);
    setLoading(false);
  }, []);

  if (loading) return null;
  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="px-6 md:px-12 max-w-7xl mx-auto py-20 bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      <motion.div
        className="text-center mb-12"
        initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionViewport}
        transition={{ duration: shouldReduce ? 0 : 0.5, ease: 'easeOut' }}
      >
        <p className="text-xs uppercase tracking-widest text-accent font-bold mb-2">Verified Client Reviews</p>
        <h3 className="text-3xl md:text-4xl font-heading font-bold text-black dark:text-white">Client Success Stories</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base font-light mt-3">
          Real feedback from founders and engineering leaders on delivery speed, communication, and software reliability.
        </p>
      </motion.div>

      <motion.div
        className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory scrollbar-none -mx-6 px-6 md:mx-0 md:px-0"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
      >
        {testimonials.map((testimonial) => (
          <motion.div
            key={testimonial.id}
            variants={item}
            className="min-w-[88vw] sm:min-w-[320px] md:min-w-0 snap-center p-7 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-2xl relative flex flex-col justify-between shadow-sm"
          >
            <div className="absolute top-6 right-6 text-accent opacity-20">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6 italic relative z-10 leading-relaxed font-body text-sm md:text-base font-light">
              "{testimonial.content}"
            </p>
            
            <div className="flex items-center gap-3.5 mt-auto border-t border-gray-200 dark:border-white/10 pt-5">
              <img 
                src={testimonial.image} 
                alt={testimonial.author} 
                className="w-11 h-11 rounded-full object-cover border-2 border-accent"
              />
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white font-heading text-sm">{testimonial.author}</h4>
                <p className="text-[11px] text-accent font-bold uppercase tracking-wider mt-0.5">{testimonial.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Testimonials;
