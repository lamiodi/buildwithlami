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
    <section id="testimonials" className="px-6 md:px-12 max-w-7xl mx-auto py-24 bg-white dark:bg-[#0a0a0a]">
      <motion.div
        className="text-center mb-16"
        initial={shouldReduce ? {} : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionViewport}
        transition={{ duration: shouldReduce ? 0 : 0.5, ease: 'easeOut' }}
      >
        <h3 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-black dark:text-white">Client Success Stories</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
          Don't just take our word for it. Here's what our clients have to say about working with BuildWithLami.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
      >
        {testimonials.map((testimonial) => (
          <motion.div
            key={testimonial.id}
            variants={item}
            className="p-8 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-sm relative"
          >
            <div className="absolute top-6 right-6 text-accent opacity-20">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6 italic relative z-10 leading-relaxed font-body text-sm md:text-base">
              "{testimonial.content}"
            </p>
            
            <div className="flex items-center gap-4 mt-auto border-t border-gray-200 dark:border-gray-800 pt-6">
              <img 
                src={testimonial.image} 
                alt={testimonial.author} 
                className="w-12 h-12 rounded-full object-cover border-2 border-accent"
              />
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white font-heading text-sm">{testimonial.author}</h4>
                <p className="text-xs text-accent font-bold mt-0.5">{testimonial.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Testimonials;
