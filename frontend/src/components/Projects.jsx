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
  const navigate = useNavigate();
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

  // Ensure VonneX2X is always the featured project
  const vonnex2xIndex = projects.findIndex(p =>
    (p.slug && p.slug.toLowerCase().includes('vonnex2x')) ||
    (p.title && p.title.toLowerCase().includes('vonnex2x'))
  );
  const orderedProjects = vonnex2xIndex > 0
    ? [projects[vonnex2xIndex], ...projects.filter((_, i) => i !== vonnex2xIndex)]
    : projects.length > 0 ? projects : fallbackProjects;

  const featuredProject = orderedProjects[0] || fallbackProjects[0];

  const moreProjects = orderedProjects.length > 1 ? orderedProjects.slice(1, 4) : fallbackProjects.slice(1, 4);

  return (
    <section id="projects" className="px-6 md:px-12 max-w-7xl mx-auto py-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <motion.p
            variants={item}
            className="text-accent uppercase tracking-[0.3em] text-[11px] font-bold mb-3"
          >
            SELECTED WORK
          </motion.p>
          <motion.h2
            variants={item}
            className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-black dark:text-white"
          >
            Software built for <span className="text-accent">real-world businesses.</span>
          </motion.h2>
        </div>
        <motion.p
          variants={item}
          className="text-gray-600 dark:text-gray-300 text-base max-w-md font-light leading-relaxed opacity-90"
        >
          Explore high-performance web applications, enterprise platforms, and digital commerce systems engineered for real-world business impact.
        </motion.p>
      </div>

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
        {/* Main Featured Project Card */}
        <motion.div
          className="mb-16 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
            {/* Image Preview */}
            <div
              className="lg:col-span-7 bg-gray-900 relative overflow-hidden group cursor-pointer min-h-[320px] md:min-h-[440px]"
              onClick={() => navigate(`/projects/${featuredProject.slug || featuredProject.id}`)}
            >
              <img
                src={featuredProject.image_url || featuredProject.image}
                alt={featuredProject.title}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 opacity-95"
                width="800"
                height="500"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full border border-white/10">
                Featured Case Study · {featuredProject.year || '2024'}
              </div>
            </div>

            {/* Content Details */}
            <div className="lg:col-span-5 p-8 md:p-10 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {(featuredProject.tech_stack || ['React', 'Node.js', 'PostgreSQL']).slice(0, 4).map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-white/5"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <h3
                  onClick={() => navigate(`/projects/${featuredProject.slug || featuredProject.id}`)}
                  className="text-2xl md:text-3xl font-heading font-bold text-black dark:text-white hover:text-accent transition-colors cursor-pointer mb-3"
                >
                  {featuredProject.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed mb-6 font-light">
                  {featuredProject.summary}
                </p>

                {/* Features List */}
                <ul className="space-y-2.5 text-xs md:text-sm text-gray-700 dark:text-gray-300 mb-8">
                  {(featuredProject.features || [
                    'Bespoke software architecture',
                    'Production-ready data integrity',
                    'Optimized for mobile & desktop performance'
                  ]).slice(0, 3).map((feat, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckIcon className="mr-2.5 text-accent flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => navigate(`/projects/${featuredProject.slug || featuredProject.id}`)}
                  className="cursor-pointer bg-accent hover:bg-black dark:hover:bg-white dark:hover:text-black text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-lg transition-all shadow-md"
                >
                  View Case Study →
                </button>
                {featuredProject.live_url && featuredProject.live_url !== '#' && (
                  <a
                    href={featuredProject.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 hover:text-accent px-4 py-3 border border-gray-200 dark:border-white/10 rounded-lg transition-colors"
                  >
                    Live Demo ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Supporting Projects 3-Column Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          {moreProjects.map((p, idx) => (
            <motion.div
              key={idx}
              variants={item}
              whileHover={shouldReduce ? {} : cardHover}
              transition={cardHoverTransition}
              className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl transition-all group cursor-pointer"
              onClick={() => navigate(`/projects/${p.slug || p.id}`)}
            >
              <div>
                <div className="w-full h-48 sm:h-56 bg-gray-900 overflow-hidden relative">
                  <img
                    src={p.image_url || p.image}
                    alt={p.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    width="600"
                    height="350"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-white text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full">
                    {p.year || '2024'}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {(p.tech_stack || ['React', 'Node.js', 'PostgreSQL']).slice(0, 3).map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <h4 className="text-xl font-heading font-bold text-black dark:text-white group-hover:text-accent transition-colors mb-2">
                    {p.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm line-clamp-3 font-light leading-relaxed">
                    {p.summary}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-gray-100 dark:border-white/5 text-xs font-bold text-accent uppercase tracking-wider">
                <span>View Case Study</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Projects Footer CTA */}
        <motion.div
          className="text-center pt-6"
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={sectionViewport}
          transition={{ duration: shouldReduce ? 0 : 0.5 }}
        >
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-gray-800 dark:text-gray-200 hover:text-accent dark:hover:text-accent transition-colors py-3 px-8 border border-gray-300 dark:border-white/10 rounded-full hover:border-accent shadow-sm"
          >
            Explore All Case Studies & Projects →
          </Link>
        </motion.div>
      </SkeletonTransition>
    </section>
  );
};

export default Projects;