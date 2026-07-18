import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import CheckIcon from './CheckIcon';
import { api } from '../services/api';
import fallbackProjects from '../data/fallbackProjects';
import { ProjectCardSkeleton, SkeletonTransition } from './Skeleton';
import { staggerContainer, fadeUpItem, cardHover, cardHoverTransition, buttonHover, buttonTap, sectionViewport, reducedMotionVariants } from '../utils/motion';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  useEffect(() => {
    let cancelled = false;
    const fetchProjects = async () => {
      try {
        // Software-division scoped feed — keeps the homepage
        // showcase isolated from the Survey and Drone divisions.
        const res = await api.get('/projects/division/SOFTWARE');

        if (cancelled) return;

        // /api/projects/division/:division returns
        // { data: rows, pagination: {…} } — unwrap before storing so
        // map() / image_url lookups below resolve correctly.
        // Fall back to the seed list when the array is actually
        // empty so the strip never goes blank.
        const list = res.data?.data ?? [];
        if (res.ok && Array.isArray(list) && list.length > 0) {
          setProjects(list);
        } else if (!res.ok) {
          setProjects(fallbackProjects);
        } else {
          // API ok but empty array — show fallback so the section is
          // never presented as empty while admin data isn't shipped.
          setProjects(fallbackProjects);
        }

        if (!cancelled) setLoading(false);
      } catch (error) {
        if (!cancelled) {
          // CRITICAL: Show fallback data on any network error
          console.error('Projects API error, using fallback:', error);
          setProjects(fallbackProjects);
          setLoading(false);
        }
      }
    };

    fetchProjects();
    return () => { cancelled = true; }; // Cleanup to prevent state updates on unmount
  }, []);

  const featuredProject = projects.length > 0 ? projects[0] : fallbackProjects[0];

  const moreProjects = projects.length > 1 ? projects.slice(1, 4) : fallbackProjects.slice(1, 4);

  return (
    <section id="projects" className="px-6 md:px-12 max-w-7xl mx-auto py-24">
      <motion.h3
        className="text-2xl font-heading font-bold mb-8 text-black dark:text-white"
        initial={shouldReduce ? {} : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionViewport}
        transition={{ duration: shouldReduce ? 0 : 0.5, ease: 'easeOut' }}
      >
        Projects
      </motion.h3>

      <SkeletonTransition
        isLoading={loading}
        skeleton={
          <div className="space-y-16">
            <ProjectCardSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </div>
          </div>
        }
      >
        <motion.div
          className="mb-24"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          <motion.div
            variants={item}
            whileHover={shouldReduce ? {} : cardHover}
            transition={cardHoverTransition}
            className="group cursor-pointer"
            onClick={() => navigate(`/projects/${featuredProject.slug || featuredProject.id}`)}
          >
            <motion.h4 variants={item} className="text-3xl md:text-4xl font-heading font-bold mb-2 text-black dark:text-white group-hover:text-accent transition-colors">
              {featuredProject.title}
            </motion.h4>
            <motion.p variants={item} className="text-gray-700 dark:text-gray-200 text-lg md:text-xl max-w-3xl mb-12 font-light leading-relaxed opacity-90">
              {featuredProject.summary}
            </motion.p>

            {/* Project Image */}
            <motion.div variants={item} className="w-full h-64 md:h-[500px] bg-gray-200 dark:bg-gray-800 mb-8 overflow-hidden rounded-sm border border-gray-200 dark:border-none shadow-md">
               <img
                  src={featuredProject.image_url || featuredProject.image}
                  alt={featuredProject.title}
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                  width="800"
                  height="500"
                  loading="lazy"
                  decoding="async"
                />
            </motion.div>

            <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-end">
              <ul className="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-200 mb-8 md:mb-0">
                {featuredProject.features ? featuredProject.features.map((feature, idx) => (
                  <li key={`feat-${idx}`} className="flex items-center">
                    <CheckIcon className="mr-3 text-accent" />
                    {feature}
                  </li>
                )) : (
                  <li className="flex items-center">
                     <CheckIcon className="mr-3 text-accent" />
                     Built with modern web technologies
                  </li>
                )}
              </ul>

              <motion.a
                href={featuredProject.live_url || featuredProject.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent text-white font-bold px-6 py-2 flex items-center hover:bg-[#d43d1a] transition-colors"
                whileHover={shouldReduce ? {} : buttonHover}
                whileTap={shouldReduce ? {} : buttonTap}
                onClick={(e) => e.stopPropagation()} // Prevent navigation when clicking live demo
              >
                Live Demo
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </motion.a>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="text-center mb-12"
          initial={shouldReduce ? {} : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={sectionViewport}
          transition={{ duration: shouldReduce ? 0 : 0.5 }}
        >
          <Link to="/projects" className="block group">
            <h4 className="text-sm font-bold uppercase tracking-widest mb-2 text-black dark:text-white group-hover:text-accent transition-colors">View More Projects</h4>
            <p className="text-xs text-gray-700 dark:text-gray-300 uppercase tracking-[0.2em] font-bold group-hover:text-accent transition-colors">Designed in Figma. Built with PERN Stack.</p>
          </Link>
        </motion.div>

        <motion.div
          className="space-y-16"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          {moreProjects.map((p, idx) => (
            <motion.div
              key={`more-${idx}`}
              variants={item}
              whileHover={shouldReduce ? {} : cardHover}
              transition={cardHoverTransition}
              className="group cursor-pointer"
              onClick={() => navigate(`/projects/${p.slug || p.id}`)}
            >
              <div className="w-full h-64 md:h-[400px] bg-gray-200 dark:bg-gray-800 mb-4 overflow-hidden rounded-sm">
                 <img 
                   src={p.image_url || p.image} 
                   alt={p.title} 
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 dark:opacity-80 group-hover:opacity-100"
                   width="800"
                   height="400"
                   loading="lazy"
                 />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">
                <span className="text-gray-800 dark:text-gray-300 group-hover:text-accent dark:group-hover:text-white transition-colors">{p.title}</span>
                <span className="text-accent">{p.year || (p.created_at ? new Date(p.created_at).getFullYear() : '')}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </SkeletonTransition>
    </section>
  );
};

export default Projects;