import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, fadeUpItem, sectionViewport, reducedMotionVariants } from '../utils/motion';
import { api } from '../services/api';

const fallbackTestimonials = [
  {
    id: 1,
    client_name: 'Sarah Jenkins',
    company: 'TechCorp Solutions',
    quote: "Eugene and his team completely transformed our web presence. The new platform is not only beautiful but incredibly fast.",
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    division: 'SOFTWARE'
  },
  {
    id: 2,
    client_name: 'Marcus Chen',
    company: 'Elevate Marketing',
    quote: "The attention to detail and SEO expertise drove a 40% increase in our organic traffic within the first three months.",
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    division: 'SOFTWARE'
  },
  {
    id: 3,
    client_name: 'Amanda Rossi',
    company: 'Global Retail Inc.',
    quote: "Professional, responsive, and technically brilliant. They delivered our complex e-commerce solution ahead of schedule.",
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
    division: 'SOFTWARE'
  }
];

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await api.get('/testimonials?featured=true');
        if (res.ok && res.data && res.data.length > 0) {
          setTestimonials(res.data);
        } else {
          setTestimonials(fallbackTestimonials);
        }
      } catch (err) {
        setTestimonials(fallbackTestimonials);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <section id="testimonials" className="px-6 md:px-12 max-w-7xl mx-auto py-24 bg-gray-50 dark:bg-gray-900 border-t border-b border-gray-200 dark:border-gray-800">
      <motion.div
        className="text-center mb-16"
        initial={shouldReduce ? {} : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionViewport}
        transition={{ duration: shouldReduce ? 0 : 0.5, ease: 'easeOut' }}
      >
        <h3 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-black dark:text-white">Client Testimonials</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
          Don't just take our word for it. Here's what our clients have to say about working with us.
        </p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center"><div className="animate-pulse h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-sm max-w-4xl mx-auto"></div></div>
      ) : (
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
              className="bg-white dark:bg-gray-800 p-8 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 relative"
            >
              <div className="text-accent mb-6 opacity-20 absolute top-4 right-4">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
              </div>
              <p className="text-gray-700 dark:text-gray-300 italic mb-6 relative z-10">"{testimonial.quote}"</p>
              <div className="flex items-center">
                {testimonial.avatar && (
                  <img src={testimonial.avatar} alt={testimonial.client_name} className="w-12 h-12 rounded-full mr-4 object-cover" />
                )}
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.client_name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
};

export default Testimonials;
