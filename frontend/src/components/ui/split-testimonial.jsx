"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    quote: "BuildWithLami transformed our operations. Their software division engineered a custom portal that cut our processing time in half with flawless precision.",
    name: "Sarah Johnson",
    role: "Operations Director",
    company: "TechFlow Systems",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    quote: "The drone mapping data and architectural execution provided by Lami ODI was remarkably accurate. Saved our engineering team weeks on site validation.",
    name: "David Okafor",
    role: "Chief Surveyor",
    company: "AgriCorp Infrastructure",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    quote: "Professional, fast, and technically brilliant. They understood exactly what our SaaS architecture needed and delivered way beyond expectations.",
    name: "Elena Rodriguez",
    role: "Founder & CEO",
    company: "SaaSify Cloud",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=900&auto=format&fit=crop&q=80",
  },
];

export function TestimonialsSplit({ items = DEFAULT_TESTIMONIALS }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const shouldReduce = useReducedMotion();

  const activeTestimonials = items && items.length > 0 ? items : DEFAULT_TESTIMONIALS;
  const active = activeTestimonials[activeIndex] || activeTestimonials[0];

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % activeTestimonials.length);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      <div
        className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-center cursor-pointer group select-none"
        onClick={nextTestimonial}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Left: Quote Content */}
        <div className="space-y-6 sm:space-y-8">
          {/* Company Tag */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active.company || active.id}
              initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduce ? {} : { opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-[0.2em] uppercase text-accent"
            >
              <span className="w-8 h-px bg-accent/50" />
              {active.company}
            </motion.div>
          </AnimatePresence>

          {/* Quote */}
          <div className="relative overflow-hidden min-h-[140px] sm:min-h-[160px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={active.id}
                initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduce ? {} : { opacity: 0, y: -30 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="text-2xl sm:text-3xl md:text-4xl font-heading font-light leading-[1.3] tracking-tight text-gray-900 dark:text-white"
              >
                "{active.quote || active.content}"
              </motion.blockquote>
            </AnimatePresence>
          </div>

          {/* Author Info */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active.name || active.author}
              initial={shouldReduce ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduce ? {} : { opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="flex items-center gap-4"
            >
              <div className="w-10 h-px bg-gray-900/20 dark:bg-white/20" />
              <div>
                <p className="text-sm font-bold font-heading text-gray-900 dark:text-white">{active.name || active.author}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">{active.role}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Visual Element */}
        <div className="relative w-40 h-52 sm:w-48 sm:h-64 mx-auto md:mx-0 shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={shouldReduce ? {} : { opacity: 0, filter: "blur(12px)", scale: 1.05 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={shouldReduce ? {} : { opacity: 0, filter: "blur(12px)", scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-lg">
                <img
                  src={active.image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&auto=format&fit=crop&q=80"}
                  alt={active.name || active.author}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Click indicator */}
          <motion.div
            animate={{
              opacity: isHovering ? 1 : 0.7,
              scale: isHovering ? 1 : 0.9,
            }}
            transition={{ duration: 0.2 }}
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-mono text-gray-500 dark:text-gray-400 font-medium"
          >
            <span>Next Review</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-accent" />
          </motion.div>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center gap-3 pt-6 md:pt-0">
          {activeTestimonials.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(index);
              }}
              className="relative p-1 group/dot focus:outline-none"
              aria-label={`Go to testimonial ${index + 1}`}
            >
              <span
                className={`
                  block w-2.5 h-2.5 rounded-full transition-all duration-300
                  ${
                    index === activeIndex
                      ? "bg-accent scale-100"
                      : "bg-gray-300 dark:bg-white/20 scale-75 hover:bg-gray-400 dark:hover:bg-white/40 hover:scale-100"
                  }
                `}
              />
              {index === activeIndex && (
                <motion.span
                  layoutId="activeDot"
                  className="absolute inset-0 border border-accent/40 rounded-full"
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TestimonialsSplit;
