import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { api } from '../services/api';
import fallbackProjects from '../data/fallbackProjects';
import { CONTACT } from '../config/contact';
import { ProjectCardSkeleton, SkeletonTransition } from '../components/Skeleton';
import { staggerContainer, fadeUpItem, cardHover, cardHoverTransition, buttonHover, buttonTap, sectionViewport, reducedMotionVariants } from '../utils/motion';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Selected Works | Buildwith_lami — Software Portfolio";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Explore selected software engineering works by Eugene Odibenuah (Buildwith_lami) — from custom business ERPs and SaaS platforms to luxury e-commerce and regulatory web portals.");
    }
    const fetchProjects = async () => {
      const res = await api.get('/projects/division/SOFTWARE');
      const list = res.data?.data ?? [];
      if (res.ok && list.length > 0) {
        setProjects(list);
      } else {
        setProjects(fallbackProjects);
      }
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const filters = ['All', 'Web Platforms', 'E-Commerce', 'SaaS', 'Business Systems'];

  const matchFilter = (project, filter) => {
    if (filter === 'All') return true;
    const cat = (project.category || '').toLowerCase().trim();
    const target = filter.toLowerCase().trim();
    if (cat === target) return true;
    if (target === 'web platforms') {
      return cat.includes('web') && !cat.includes('saas') && !cat.includes('erp') && !cat.includes('commerce');
    }
    if (target === 'e-commerce') {
      return cat.includes('commerce') || cat.includes('store') || cat.includes('shop') || cat.includes('retail');
    }
    if (target === 'saas') {
      return cat.includes('saas') || cat.includes('cloud') || cat.includes('software-as-a-service');
    }
    if (target === 'business systems') {
      return cat.includes('business') || cat.includes('erp') || cat.includes('system') || cat.includes('academic') || cat.includes('portal') || cat.includes('ledger');
    }
    return (project.tech_stack?.join(' ') || '').toLowerCase().includes(target);
  };

  const getFilterCount = (filter) => {
    return projects.filter(p => matchFilter(p, filter)).length;
  };

  const filteredProjects = projects.filter(p => matchFilter(p, activeFilter));
  const featuredProject = filteredProjects.find(p => p.id === 1 || (p.title || '').includes('VonneX2X'));
  const remainingProjects = featuredProject 
    ? filteredProjects.filter(p => p.id !== featuredProject.id && !(p.title || '').includes('VonneX2X'))
    : filteredProjects;

  return (
    <div className="min-h-screen pt-28 pb-32 bg-gray-50 dark:bg-background text-black dark:text-white transition-colors duration-300 font-body selection:bg-accent selection:text-white">
      {/* Hero Header */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto mb-14">
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduce ? 0 : 0.6, ease: 'easeOut' }}
        >
          <Link to="/" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:text-accent transition-colors mb-8 group">
            <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Back to Home
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="uppercase tracking-widest text-xs text-accent font-bold mb-3">Portfolio</p>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-tight text-black dark:text-white leading-[0.9]">
                Selected<br />
                <span className="text-accent">Works</span>
              </h1>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg max-w-md font-light leading-relaxed md:text-right">
              A curated collection of software I've designed and developed for businesses, products, and real-world workflows.
            </p>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-200 dark:bg-white/10 mt-12" />
      </section>

      {/* Filter Tabs */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto mb-16">
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduce ? 0 : 0.4, delay: shouldReduce ? 0 : 0.2 }}
          className="flex flex-wrap gap-2.5"
        >
          {filters.map((filter) => {
            const count = getFilterCount(filter);
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 md:px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 border cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-accent text-white border-accent shadow-md'
                    : 'border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-accent hover:text-accent bg-white dark:bg-[#141414]'
                }`}
              >
                <span>{filter}</span>
                <span className={`text-[10px] px-1.5 py-0.5 font-mono font-bold transition-colors ${
                  activeFilter === filter
                    ? 'bg-white/25 text-white'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </motion.div>
      </section>

      {/* Main Content Area */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto space-y-16">
        <SkeletonTransition
          isLoading={loading}
          skeleton={
            <div className="space-y-12">
              <ProjectCardSkeleton />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ProjectCardSkeleton />
                <ProjectCardSkeleton />
              </div>
            </div>
          }
        >
          {filteredProjects.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-gray-300 dark:border-white/10 bg-white dark:bg-[#141414] p-8">
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4 font-medium">
                No projects found under the <span className="text-accent font-bold">{activeFilter}</span> category.
              </p>
              <button
                onClick={() => setActiveFilter('All')}
                className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-widest hover:bg-accent dark:hover:bg-accent dark:hover:text-white transition-colors"
              >
                View All Projects
              </button>
            </div>
          ) : (
            <div className="space-y-20">
              
              {/* FEATURED CASE STUDY (VonneX2X) */}
              {featuredProject && (
                <motion.div
                  initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={sectionViewport}
                  transition={{ duration: shouldReduce ? 0 : 0.6 }}
                  className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 overflow-hidden shadow-xl group hover:border-accent/40 transition-all duration-500"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                    
                    {/* Left: Large Visual Mockup (7 cols) */}
                    <div 
                      className="lg:col-span-7 relative h-72 sm:h-96 lg:h-[480px] bg-gray-900 overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/projects/${featuredProject.slug || featuredProject.id}`)}
                    >
                      <img
                        src={featuredProject.image_url || featuredProject.image}
                        alt={featuredProject.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                        loading="eager"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-6 md:p-8">
                        <div className="flex items-center gap-2">
                          <span className="bg-accent text-white text-[10px] font-mono font-bold uppercase tracking-[0.18em] px-3.5 py-1.5 shadow-md border border-accent">
                            ★ Featured Case Study
                          </span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-white/80 text-xs uppercase tracking-widest font-mono font-bold">
                            {featuredProject.year || '2024'} · {featuredProject.category || 'Business Systems'} · {featuredProject.project_status || 'Client Project'}
                          </p>
                          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-white leading-tight">
                            {featuredProject.title}
                          </h2>
                        </div>
                      </div>
                    </div>

                    {/* Right: Case Study Context & Outcomes (5 cols) */}
                    <div className="lg:col-span-5 p-8 md:p-10 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <span className="text-xs uppercase tracking-widest font-bold text-accent font-mono">
                          // Enterprise Operations Platform
                        </span>
                        <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base font-light leading-relaxed">
                          {featuredProject.summary || featuredProject.description}
                        </p>

                        {/* Key Pillars */}
                        <div className="pt-3 border-t border-gray-100 dark:border-white/5 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-800 dark:text-gray-200 font-medium">
                            <span className="text-accent">✦</span>
                            <span>Intelligent variable-duration scheduling engine</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-800 dark:text-gray-200 font-medium">
                            <span className="text-accent">✦</span>
                            <span>GPS-fenced workforce attendance & audit trail</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-800 dark:text-gray-200 font-medium">
                            <span className="text-accent">✦</span>
                            <span>Unified real-time retail & service POS ledger</span>
                          </div>
                        </div>

                        {/* Tech Pills */}
                        <div className="pt-3">
                          <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Core Tech Stack</p>
                          <div className="flex flex-wrap gap-2">
                            {(featuredProject.tech_stack || ["React", "Node.js", "PostgreSQL", "Supabase"]).slice(0, 4).map((tech, i) => (
                              <span key={i} className="text-xs font-mono font-medium bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200 px-3 py-1 border border-gray-200 dark:border-white/10">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Direct Action */}
                      <div className="pt-4 border-t border-gray-200 dark:border-white/10 flex flex-wrap items-center gap-3 relative z-10">
                        <Link
                          to={`/projects/${featuredProject.slug || featuredProject.id}`}
                          className="btn-dark flex-1"
                          style={{ touchAction: 'manipulation' }}
                        >
                          View Case Study →
                        </Link>
                        {featuredProject.live_url && featuredProject.live_url !== '#' && (
                          <a
                            href={featuredProject.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary !px-5 !py-3.5"
                            style={{ touchAction: 'manipulation' }}
                          >
                            Live Demo ↗
                          </a>
                        )}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* REMAINING PROJECTS GRID */}
              {remainingProjects.length > 0 && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg md:text-xl font-heading font-bold text-black dark:text-white">
                        Production Deployments
                      </h3>
                      <span className="text-xs font-mono font-bold text-accent bg-accent/10 px-2 py-0.5 border border-accent/20">
                        {activeFilter}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                      {remainingProjects.length} {remainingProjects.length === 1 ? 'project' : 'projects'}
                    </span>
                  </div>

                  <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="visible"
                    viewport={sectionViewport}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10"
                  >
                    {remainingProjects.map((project) => {
                      const projKey = project.slug || project.id;
                      const hasLiveDemo = project.live_url && project.live_url !== '#' && project.live_url !== '';
                      const techList = Array.isArray(project.tech_stack) ? project.tech_stack : [];

                      return (
                        <motion.div
                          key={project.id}
                          variants={item}
                          whileHover={shouldReduce ? {} : cardHover}
                          transition={cardHoverTransition}
                          className="bwl-card overflow-hidden shadow-sm hover:shadow-xl hover:border-accent/40 group flex flex-col justify-between"
                        >
                          {/* Image Header */}
                          <div 
                            className="relative h-60 sm:h-72 bg-gray-100 dark:bg-gray-900 overflow-hidden cursor-pointer"
                            onClick={() => navigate(`/projects/${projKey}`)}
                          >
                            <img
                              src={project.image_url || project.image}
                              alt={project.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                              loading="lazy"
                            />
                            {/* Badges Overlay */}
                            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                              <span className="bg-white/90 dark:bg-black/80 backdrop-blur-sm text-black dark:text-white text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 border border-gray-200 dark:border-white/10 shadow-sm">
                                {project.category || 'Web Platforms'}
                              </span>
                              <span className="bg-white/90 dark:bg-black/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 border border-gray-200 dark:border-white/10 shadow-sm">
                                {project.year || '2024'} · {project.project_status || 'Client Project'}
                              </span>
                            </div>
                          </div>

                          {/* Content Body */}
                          <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
                            <div className="space-y-3">
                              <h4 
                                onClick={() => navigate(`/projects/${projKey}`)}
                                className="text-xl md:text-2xl font-heading font-bold text-black dark:text-white group-hover:text-accent transition-colors cursor-pointer"
                              >
                                {project.title}
                              </h4>
                              <p className="text-gray-600 dark:text-gray-300 text-sm font-light leading-relaxed">
                                {project.summary || project.description}
                              </p>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                              {/* 3-4 Key Technologies */}
                              <div className="flex flex-wrap gap-2">
                                {techList.slice(0, 4).map((tech, i) => (
                                  <span key={i} className="text-[11px] font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-2.5 py-1 border border-gray-200 dark:border-white/10">
                                    {tech}
                                  </span>
                                ))}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-3 pt-2 relative z-10">
                                <Link
                                  to={`/projects/${projKey}`}
                                  className="btn-dark flex-1 !py-3"
                                  style={{ touchAction: 'manipulation' }}
                                >
                                  View Case Study →
                                </Link>
                                {hasLiveDemo && (
                                  <a
                                    href={project.live_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary !px-4 !py-3"
                                    style={{ touchAction: 'manipulation' }}
                                  >
                                    Live Demo ↗
                                  </a>
                                )}
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              )}

            </div>
          )}
        </SkeletonTransition>
      </section>

      {/* CTA Section */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto mt-32">
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={sectionViewport}
          transition={{ duration: shouldReduce ? 0 : 0.6 }}
          className="bwl-feature-card text-center relative overflow-hidden shadow-xl"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
          <div className="bwl-eyebrow mb-4">
            <span className="w-2 h-2 bg-accent inline-block" />
            <span>Initiate Project Scope</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-heading font-bold text-black dark:text-white mb-6">
            Let's work <span className="text-accent">together</span>
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Tell me what you're building, what you're trying to achieve, and where you're stuck. I'll help you determine the right technical approach.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link
              to="/contact"
              className="btn-primary w-full sm:w-auto"
              style={{ touchAction: 'manipulation' }}
            >
              Start a Project →
            </Link>
            <a
              href={`https://wa.me/${CONTACT.phoneE164}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full sm:w-auto"
              style={{ touchAction: 'manipulation' }}
            >
              WhatsApp Me ↗
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default ProjectsPage;
