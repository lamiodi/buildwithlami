import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import CheckIcon from './CheckIcon';
import { api } from '../services/api';
import fallbackProjects from '../data/fallbackProjects';
import { fadeUpItem, reducedMotionVariants } from '../utils/motion';

const Projects = () => {
  const [projects, setProjects] = useState(fallbackProjects);
  const shouldReduce = useReducedMotion();
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  useEffect(() => {
    let cancelled = false;
    const fetchProjects = async () => {
      try {
        // Software-division scoped feed with short 3s timeout
        const res = await api.get('/projects/division/SOFTWARE', { timeout: 3000 });

        if (cancelled) return;

        const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        if (res.ok && Array.isArray(list) && list.length > 0) {
          setProjects(list);
        }
      } catch {
        // Silently retain fallback projects
      }
    };

    fetchProjects();
    return () => { cancelled = true; };
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

  const getFallbackImage = (proj) => {
    if (!proj) return fallbackProjects[0].image;
    const match = fallbackProjects.find(fp => 
      (fp.slug && proj.slug && fp.slug === proj.slug) || 
      fp.id === proj.id || 
      (fp.title && proj.title && fp.title.toLowerCase() === proj.title.toLowerCase())
    );
    return match?.image || fallbackProjects[0].image;
  };

  return (
    <section id="projects" className="px-6 md:px-12 max-w-7xl mx-auto py-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <motion.div variants={item} className="bwl-eyebrow mb-3">
            <span className="w-2 h-2 bg-accent inline-block" />
            <span>Selected Work</span>
          </motion.div>
          <motion.h2
            variants={item}
            className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-black dark:text-white"
          >
            Built for <span className="text-accent">real-world businesses.</span>
          </motion.h2>
        </div>
        <motion.p
          variants={item}
          className="text-gray-600 dark:text-gray-300 text-base max-w-md font-light leading-relaxed opacity-90"
        >
          See the products, the problems they solve, and the thinking behind each build.
        </motion.p>
      </div>

      <div>
        {/* Main Featured Project Card */}
        <motion.div
          className="mb-16 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl"
          initial={false}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
            {/* Image Preview */}
            <Link
              to={`/projects/${featuredProject.slug || featuredProject.id}`}
              className="lg:col-span-7 bg-gray-900 relative overflow-hidden group cursor-pointer aspect-[8/5] lg:aspect-auto lg:min-h-[440px] flex items-center p-3 sm:p-5"
            >
              <img
                src={featuredProject.image_url || featuredProject.image}
                alt={featuredProject.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getFallbackImage(featuredProject);
                }}
                className="w-full h-full object-contain object-center motion-safe:group-hover:scale-[1.02] transition-transform duration-700"
                width="800"
                height="500"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute top-4 left-4 bg-black/85 text-white text-[10px] font-mono uppercase tracking-[0.18em] font-bold px-3 py-1.5 border border-white/10 pointer-events-none">
                Featured Case Study · {featuredProject.year || '2024'}
              </div>
            </Link>

            {/* Content Details */}
            <div className="lg:col-span-5 p-8 md:p-10 flex flex-col justify-between">
              <div>


                <Link
                  to={`/projects/${featuredProject.slug || featuredProject.id}`}
                  className="text-2xl md:text-3xl font-heading font-bold text-black dark:text-white hover:text-accent transition-colors cursor-pointer mb-3 block"
                >
                  {featuredProject.title}
                </Link>

                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed mb-6 font-light">
                  {featuredProject.tagline || featuredProject.summary}
                </p>

                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">What it delivers</p>
                {/* Existing project capabilities, without unsupported performance claims. */}
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
                <div className="flex flex-wrap items-center gap-2 mt-6">
                  {(featuredProject.tech_stack || ['React', 'Node.js', 'PostgreSQL']).slice(0, 4).map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono uppercase font-bold tracking-wider px-2.5 py-1 bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-white/5"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-100 dark:border-white/10 relative z-10">
                <Link
                  to={`/projects/${featuredProject.slug || featuredProject.id}`}
                  className="btn-primary !px-8 !py-3.5 relative z-10"
                  style={{ touchAction: 'manipulation' }}
                >
                  View Case Study →
                </Link>
                {featuredProject.live_url && featuredProject.live_url !== '#' && (
                  <a
                    href={featuredProject.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary !px-6 !py-3.5 relative z-10"
                    style={{ touchAction: 'manipulation' }}
                  >
                    Live Demo ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Supporting Projects 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {moreProjects.map((p, idx) => (
            <Link
              key={idx}
              to={`/projects/${p.slug || p.id}`}
              className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-accent/40 transition-all group no-underline"
            >
              <div>
                <div className="w-full aspect-[8/5] bg-gray-900 overflow-hidden relative p-2">
                  <img
                    src={p.image_url || p.image}
                    alt={p.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getFallbackImage(p);
                    }}
                    className="w-full h-full object-contain motion-safe:group-hover:scale-[1.02] transition-transform duration-700"
                    width="600"
                    height="350"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 bg-black/85 text-white text-[9px] font-mono uppercase tracking-widest font-bold px-2.5 py-1 border border-white/10 pointer-events-none">
                    {p.year || '2024'}
                  </div>
                </div>

                <div className="p-6">

                  <h4 className="text-xl font-heading font-bold text-black dark:text-white group-hover:text-accent transition-colors mb-2">
                    {p.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 font-light leading-relaxed">
                    {p.tagline || p.summary}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-4">
                    {(p.tech_stack || ['React', 'Node.js', 'PostgreSQL']).slice(0, 3).map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[9px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 bg-gray-100 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-gray-700 dark:text-gray-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-gray-100 dark:border-white/5 text-[11px] font-heading font-bold text-accent uppercase tracking-[0.15em]">
                <span>View Case Study</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Projects Footer CTA */}
        <div className="text-center pt-6">
          <Link
            to="/projects"
            className="border border-gray-300 dark:border-white/15 text-gray-900 dark:text-gray-100 font-heading font-bold text-[11px] uppercase tracking-[0.15em] hover:border-accent hover:text-accent transition-all duration-300 inline-flex items-center justify-center text-center py-4 px-10 active:scale-[0.98] bg-transparent relative z-10"
          >
            Explore All Case Studies & Projects →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Projects;