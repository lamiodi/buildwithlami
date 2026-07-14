import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import SecurityPopup from '../components/SecurityPopup';
import { api } from '../services/api';
import fallbackProjects from '../data/fallbackProjects';
import { Skeleton, SkeletonTransition } from '../components/Skeleton';
import { staggerContainer as centralStaggerContainer, fadeUpItem, cardHover, cardHoverTransition, buttonHover, buttonTap, sectionViewport, reducedMotionVariants } from '../utils/motion';

// Helper to map technology names to high-quality SVG icons
const getTechIcon = (tech) => {
  const t = tech.toLowerCase();
  if (t.includes('react')) return 'https://cdn.simpleicons.org/react/61DAFB';
  if (t.includes('node')) return 'https://cdn.simpleicons.org/nodedotjs/339933';
  if (t.includes('postgres')) return 'https://cdn.simpleicons.org/postgresql/4169E1';
  if (t.includes('supabase')) return 'https://cdn.simpleicons.org/supabase/3ECF8E';
  if (t.includes('socket')) return 'https://cdn.simpleicons.org/socketdotio/ffffff';
  if (t.includes('vite')) return 'https://cdn.simpleicons.org/vite/646CFF';
  if (t.includes('tailwind')) return 'https://cdn.simpleicons.org/tailwindcss/06B6D4';
  if (t.includes('paystack')) return 'https://cdn.simpleicons.org/paystack/09A5DB';
  if (t.includes('pwa')) return 'https://cdn.simpleicons.org/pwa/5A0FC8';
  if (t.includes('indexeddb')) return 'https://cdn.simpleicons.org/databricks/ffffff';
  if (t.includes('rxdb')) return 'https://cdn.simpleicons.org/rxdb/8D1F89';
  if (t.includes('termii')) return 'https://cdn.simpleicons.org/twilio/ffffff'; // Placeholder for SMS API
  
  // Default fallback icon for unknown tech
  return 'https://cdn.simpleicons.org/codeigniter/ffffff'; 
};

// Beautiful high-fidelity details skeleton matching the exact layout
const ProjectDetailSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      {/* Title Area Skeleton */}
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-6">
        <Skeleton variant="text" width="120px" height="20px" className="mx-auto" />
        <Skeleton variant="text" width="60%" height="60px" className="mx-auto" />
        <Skeleton variant="text" width="40%" height="40px" className="mx-auto" />
      </div>

      {/* Hero Showcase Image Skeleton */}
      <div className="my-12">
        <Skeleton variant="rectangular" width="100%" height="0" className="aspect-video md:aspect-[21/9]" />
      </div>

      {/* Details Grid Skeleton */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 py-12">
        <div className="md:col-span-4 space-y-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="space-y-2">
              <Skeleton variant="text" width="80px" height="15px" />
              <Skeleton variant="text" width="150px" height="24px" />
            </div>
          ))}
        </div>
        <div className="md:col-span-8 space-y-6">
          <Skeleton variant="text" width="200px" height="32px" />
          <Skeleton variant="text" width="100%" height="24px" />
          <Skeleton variant="text" width="100%" height="24px" />
          <Skeleton variant="text" width="80%" height="24px" />
        </div>
      </div>
    </div>
  );
};

const ProjectDetailPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSecurityPopup, setShowSecurityPopup] = useState(false);
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : centralStaggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (project) {
      document.title = `${project.title} | Projects - Eugene Odibenuah`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", project.summary || project.description || `Case study of ${project.title} - a premium web development project by Eugene Odibenuah.`);
      }
    }
  }, [id, project]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProject = async () => {
      const res = await api.get(`/projects/${id}`);
      if (res.ok && res.data) {
        setProject(res.data);
        setLoading(false);
        return;
      }
      // Fallback
      const found = fallbackProjects.find(p => p.id.toString() === id);
      setProject(found || fallbackProjects[0]);
      setLoading(false);
    };
    fetchProject();
  }, [id]);

  const imageHover = {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const imageUrl = project?.image_url || project?.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop';
  
  // Create a gallery array falling back to some placeholders if the project doesn't have a specific gallery
  const galleryImages = project?.gallery && project.gallery.length > 0 
    ? project.gallery 
    : [
        imageUrl,
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1661956602116-aa6865609028?q=80&w=1964&auto=format&fit=crop'
      ];

  const words = project?.title ? project.title.split(' ') : [];
  const firstHalf = words.slice(0, Math.ceil(words.length / 2)).join(' ');
  const secondHalf = words.slice(Math.ceil(words.length / 2)).join(' ');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background text-black dark:text-white font-body overflow-hidden pt-24 pb-12 transition-colors duration-300">
      {/* Top Nav/Back */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-8">
        <Link to="/projects" className="inline-flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-accent transition-colors group uppercase tracking-widest font-bold">
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Portfolio
        </Link>
      </div>

      <SkeletonTransition isLoading={loading} skeleton={<ProjectDetailSkeleton />}>
        {project && (
          <>
            {/* Hero Section */}
            <motion.section 
              className="relative max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-24 flex flex-col items-center justify-center min-h-[50vh] md:min-h-[60vh]"
              variants={container}
              initial="hidden"
              animate="visible"
            >
              <div className="relative w-full max-w-5xl text-center">
                {/* Floating Images */}
                <motion.div 
                  className="absolute top-0 left-0 md:-left-12 lg:-left-24 w-32 md:w-48 hidden md:block rounded-xl overflow-hidden shadow-2xl opacity-80"
                  variants={item}
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                >
                  <motion.img 
                    variants={imageHover}
                    src={imageUrl} 
                    alt={project.title} 
                    className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </motion.div>

                <motion.div 
                  className="absolute top-8 right-0 md:-right-12 lg:-right-24 w-32 md:w-56 hidden md:block rounded-xl overflow-hidden shadow-2xl z-10 opacity-90"
                  variants={item}
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                >
                  <motion.img 
                    variants={imageHover}
                    src={imageUrl} 
                    alt={project.title} 
                    className="w-full h-32 object-cover object-bottom"
                  />
                </motion.div>

                <motion.div 
                  className="absolute bottom-[-20%] right-[10%] md:right-[20%] w-40 md:w-64 hidden md:block rounded-full overflow-hidden shadow-[0_0_50px_rgba(244,74,34,0.15)] z-20 border border-gray-200 dark:border-gray-800"
                  variants={item}
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                >
                  <motion.img 
                    variants={imageHover}
                    src={imageUrl} 
                    alt={project.title} 
                    className="w-full h-40 object-cover scale-150 origin-center"
                  />
                </motion.div>

                {/* Main Title */}
                <motion.p 
                  variants={item}
                  className="text-accent text-sm md:text-base font-bold uppercase tracking-[0.3em] mb-6"
                >
                  {project.category || 'Featured Project'} {project.year ? `• ${project.year}` : ''}
                </motion.p>
                <motion.h1 
                  variants={item}
                  className="text-5xl md:text-7xl lg:text-[8rem] font-heading font-bold uppercase tracking-tight leading-[0.9] text-black dark:text-white z-10 relative drop-shadow-2xl"
                >
                  {firstHalf}<br />
                  <span className="text-gray-700 dark:text-gray-300">{secondHalf}</span>
                </motion.h1>
              </div>
            </motion.section>

            {/* Primary Image Showcase */}
            <motion.section 
              className="max-w-7xl mx-auto px-6 md:px-12 py-12"
              initial={shouldReduce ? {} : "hidden"}
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={item}
            >
              <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl group">
                <img 
                  src={imageUrl} 
                  alt={`${project.title} Interface`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  width="1200"
                  height="500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-background via-transparent to-transparent opacity-80"></div>
              </div>
            </motion.section>

            {/* Detailed Overview Section */}
            <motion.section 
              className="max-w-5xl mx-auto px-6 md:px-12 py-20"
              initial="hidden"
              whileInView="visible"
              viewport={sectionViewport}
              variants={container}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                {/* Left Metadata Column */}
                <motion.div variants={item} className="md:col-span-4 space-y-8 border-l border-accent/30 pl-6">
                  <div>
                    <h3 className="text-gray-700 dark:text-gray-300 uppercase tracking-widest text-xs font-bold mb-2">Role</h3>
                    <p className="text-black dark:text-white font-bold text-lg">Lead Engineer / Architect</p>
                  </div>
                  <div>
                    <h3 className="text-gray-700 dark:text-gray-300 uppercase tracking-widest text-xs font-bold mb-2">Industry</h3>
                    <p className="text-black dark:text-white font-bold text-lg">{project.category || 'Technology'}</p>
                  </div>
                  {project.live_url && (
                    <div className="pt-4">
                      <motion.a 
                        href={project.live_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center text-accent hover:text-black dark:hover:text-white font-bold text-sm uppercase tracking-widest transition-colors group"
                        whileHover={shouldReduce ? {} : buttonHover}
                        whileTap={shouldReduce ? {} : buttonTap}
                      >
                        Live Deployment
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </motion.a>
                    </div>
                  )}
                  {project.github_url && (
                    <div className="pt-2">
                      <motion.button 
                        onClick={() => setShowSecurityPopup(true)}
                        className="inline-flex items-center text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white font-bold text-sm uppercase tracking-widest transition-colors group cursor-pointer"
                        whileHover={shouldReduce ? {} : buttonHover}
                        whileTap={shouldReduce ? {} : buttonTap}
                      >
                        Source Code
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                      </motion.button>
                    </div>
                  )}
                </motion.div>

                {/* Right Content Column */}
                <motion.div variants={item} className="md:col-span-8">
                  <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6 text-black dark:text-white">The Challenge & Solution</h2>
                  <p className="text-xl md:text-2xl font-light text-gray-700 dark:text-gray-300 leading-relaxed mb-8 opacity-95">
                    {project.summary || 'A state-of-the-art solution built for performance and scale.'}
                  </p>
                  <div className="prose prose-lg max-w-none text-gray-800 dark:text-gray-200">
                    <p className="opacity-95 leading-relaxed">
                      {project.description || "This project involved full lifecycle development, focusing on delivering an exceptional user experience while maintaining robust backend performance. Complex requirements were distilled into an intuitive, scalable architecture designed to handle high concurrency."}
                    </p>
                  </div>

                  {/* Feature Highlights Grid */}
                  {project.features && (
                    <div className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-800">
                      <h3 className="text-2xl font-heading font-bold mb-8 text-black dark:text-white">Key Capabilities</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {project.features.map((feature, i) => (
                          <motion.div 
                            key={i} 
                            whileHover={shouldReduce ? {} : cardHover}
                            transition={cardHoverTransition}
                            className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-accent/50 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                              <span className="w-3 h-3 bg-accent rounded-full shadow-[0_0_10px_rgba(244,74,34,0.5)]"></span>
                            </div>
                            <h4 className="text-black dark:text-white font-bold text-lg">{feature}</h4>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.section>

            {/* Project Gallery Section */}
            <motion.section 
              className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-gray-200 dark:border-gray-800"
              initial="hidden"
              whileInView="visible"
              viewport={sectionViewport}
              variants={container}
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-black dark:text-white">Project Gallery</h2>
                <p className="text-gray-700 dark:text-gray-300 text-lg max-w-2xl mx-auto font-medium">
                  A closer look at the interfaces, layouts, and features that power the platform.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {galleryImages.map((img, i) => (
                  <motion.div 
                    key={i} 
                    variants={item} 
                    whileHover={shouldReduce ? {} : cardHover}
                    transition={cardHoverTransition}
                    className={`relative rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 group ${i === 0 || i === 3 ? 'md:col-span-2 aspect-video' : 'aspect-[4/3]'}`}
                  >
                    <img 
                      src={img} 
                      alt={`${project.title} screenshot ${i + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      loading="lazy"
                      width="800"
                      height="500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Technologies / Built With Section */}
            <motion.section 
              className="max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-gray-200 dark:border-gray-800"
              initial="hidden"
              whileInView="visible"
              viewport={sectionViewport}
              variants={container}
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-black dark:text-white">Engineered With</h2>
                <p className="text-gray-700 dark:text-gray-300 text-lg max-w-2xl mx-auto font-medium">
                  Leveraging modern, high-performance frameworks and robust infrastructure to deliver a seamless, scalable experience.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {(Array.isArray(project.tech_stack) ? project.tech_stack : []).map((tech, i) => (
                  <motion.div 
                    key={i}
                    variants={item}
                    whileHover={shouldReduce ? {} : cardHover}
                    transition={cardHoverTransition}
                    className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-accent/80 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 group shadow-lg"
                  >
                    <div className="h-16 w-16 mb-6 relative flex items-center justify-center">
                      <img 
                        src={getTechIcon(tech)} 
                        alt={`${tech} icon`} 
                        className="max-w-full max-h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-300 group-hover:drop-shadow-[0_0_20px_rgba(244,74,34,0.4)]"
                        width="64"
                        height="64"
                      />
                    </div>
                    <span className="text-black dark:text-white font-bold text-sm tracking-widest uppercase text-center group-hover:text-accent transition-colors">
                      {tech}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Full Width Gradient Showcase */}
            <motion.section 
              className="relative w-full h-[50vh] md:h-[70vh] bg-gradient-to-br from-accent/90 via-[#F44A22] to-accent/80 flex items-center justify-center overflow-hidden mt-12"
              initial="hidden"
              whileInView="visible"
              viewport={sectionViewport}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 1 } }
              }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/20 blur-[100px] rounded-full"></div>
              
              <motion.div 
                className="relative w-[90%] md:w-[70%] max-w-5xl rounded-xl overflow-hidden shadow-2xl border border-white/10"
                variants={{
                  hidden: { scale: 0.9, opacity: 0, y: 50 },
                  visible: { scale: 1, opacity: 1, y: 0, transition: { duration: 1, delay: 0.3, ease: "easeOut" } }
                }}
              >
                <img 
                  src={imageUrl} 
                  alt={`${project.title} Full View`} 
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-1000"
                  width="1200"
                  height="600"
                />
                <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors duration-500"></div>
              </motion.div>
            </motion.section>
          </>
        )}
      </SkeletonTransition>

      {/* Next Project CTA */}
      <section className="py-24 md:py-32 text-center bg-gray-50 dark:bg-background border-t border-gray-200 dark:border-gray-900 mt-20">
        <p className="text-accent uppercase tracking-widest text-sm font-bold mb-4">View More Work</p>
        <motion.div
          whileHover={shouldReduce ? {} : buttonHover}
          whileTap={shouldReduce ? {} : buttonTap}
          className="inline-block"
        >
          <Link to="/projects" className="text-5xl md:text-7xl font-heading font-bold text-black dark:text-white hover:text-accent transition-colors cursor-pointer inline-block group">
            All Projects
            <span className="block h-1 w-0 group-hover:w-full bg-accent transition-all duration-500 mt-2"></span>
          </Link>
        </motion.div>
      </section>

      {/* Security Popup Modal */}
      <SecurityPopup 
        isOpen={showSecurityPopup} 
        onClose={() => setShowSecurityPopup(false)} 
      />
    </div>
  );
};

export default ProjectDetailPage;
