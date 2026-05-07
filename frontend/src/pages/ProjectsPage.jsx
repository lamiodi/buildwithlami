import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    window.scrollTo(0, 0);
    // SEO Best Practices
    document.title = "Selected Works | Eugene Odibenuah - Portfolio";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Explore a curated collection of selected works by Eugene Odibenuah, ranging from full-stack ERP systems to premium e-commerce ecosystems and professional portals.");
    }
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/projects');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setProjects(data);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error("Could not fetch projects:", error);
      }
      // Fallback static data
      setProjects(fallbackProjects);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const filters = ['All', 'Full-Stack', 'Frontend', 'Backend', 'E-Commerce'];

  const filteredProjects = activeFilter === 'All'
    ? projects
    : projects.filter(p => (p.category || p.tech_stack?.join(' ') || '').toLowerCase().includes(activeFilter.toLowerCase()));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-32">
      {/* Hero Header */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Link to="/" className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-accent transition-colors mb-8 group">
            <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Back to Home
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="uppercase tracking-widest text-sm text-accent font-bold mb-3">Portfolio</p>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-tight text-black dark:text-white leading-[0.9]">
                Selected<br />
                <span className="text-accent">Works</span>
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-md font-light leading-relaxed md:text-right">
              A curated collection of projects I've designed & developed — from MVPs to production apps.
            </p>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-200 dark:bg-gray-800 mt-12" />
      </section>

      {/* Filter Tabs */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-wrap gap-3"
        >
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 text-xs font-bold uppercase tracking-widest border rounded-full transition-all duration-300 ${
                activeFilter === filter
                  ? 'bg-accent text-white border-accent'
                  : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-accent hover:text-accent'
              }`}
            >
              {filter}
            </button>
          ))}
        </motion.div>
      </section>

      {/* Projects Grid */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10"
          >
            {filteredProjects.map((project, idx) => (
              <motion.div
                key={project.id || idx}
                variants={itemVariants}
                className={`group cursor-pointer ${idx === 0 ? 'md:col-span-2' : ''}`}
                onClick={() => navigate(`/projects/${project.id || idx}`)}
              >
                {/* Image Container */}
                <div className={`relative overflow-hidden rounded-sm bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 ${idx === 0 ? 'h-72 md:h-[560px]' : 'h-64 md:h-[400px]'}`}>
                  <img
                    src={project.image_url || project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      {project.tech_stack && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(Array.isArray(project.tech_stack) ? project.tech_stack : []).slice(0, 4).map((tech, i) => (
                            <span key={i} className="text-[10px] font-bold uppercase tracking-widest text-white/80 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-white/80 text-sm leading-relaxed max-w-lg">
                        {project.summary || project.description || 'Built with modern web technologies'}
                      </p>

                    </div>
                  </div>

                  {/* Year Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/70 backdrop-blur-sm text-black dark:text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-gray-200 dark:border-white/10">
                    {project.year || new Date(project.created_at || Date.now()).getFullYear()}
                  </div>
                </div>

                {/* Info Below Image */}
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-heading font-bold text-black dark:text-white group-hover:text-accent transition-colors duration-300 truncate">
                      {project.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-widest mt-1 font-bold truncate">
                      {project.category || (project.tech_stack ? project.tech_stack.slice(0, 3).join(' · ') : 'Web Development')}
                    </p>
                  </div>
                  {project.live_url && project.live_url !== '#' ? (
                    <a 
                      href={project.live_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      onClick={(e) => e.stopPropagation()} 
                      className="bg-accent text-white px-4 md:px-5 py-2 md:py-2.5 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex-shrink-0"
                    >
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest mr-1 md:mr-2 whitespace-nowrap">Live Demo</span>
                      <svg className="w-3 h-3 md:w-4 md:h-4 text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 -rotate-45 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </a>
                  ) : (
                    <div className="bg-accent text-white px-4 md:px-5 py-2 md:py-2.5 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm group-hover:shadow-md flex-shrink-0">
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest mr-1 md:mr-2 whitespace-nowrap">Live Demo</span>
                      <svg className="w-3 h-3 md:w-4 md:h-4 text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 -rotate-45 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto mt-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="w-full h-px bg-gray-200 dark:bg-gray-800 mb-16" />
          <p className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold mb-4">Have a project in mind?</p>
          <h2 className="text-4xl md:text-6xl font-heading font-bold text-black dark:text-white mb-8">
            Let's work <span className="text-accent">together</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/#contact" className="bg-accent text-white font-bold px-8 py-4 text-sm uppercase tracking-widest hover:bg-[#d43d1a] transition-colors">
              Start a Project
            </Link>
            <a href="https://wa.me/2349064185442" target="_blank" rel="noopener noreferrer" className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold px-8 py-4 text-sm uppercase tracking-widest hover:border-accent hover:text-accent transition-colors">
              WhatsApp Me
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

// Fallback project data when backend is not available
const fallbackProjects = [
  {
    id: 1,
    title: "VonneX2 Enterprise ERP",
    summary: "A bespoke business operations ecosystem featuring intelligent scheduling, GPS-fenced workforce management, and real-time retail/service POS integration.",
    category: "Full-Stack",
    tech_stack: ["React", "Node.js", "PostgreSQL", "Supabase", "Socket.io"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    live_url: "#",
    year: "2024"
  },
  {
    id: 2,
    title: "The TiaBrand E-commerce Ecosystem",
    summary: "A premium digital commerce engine with location-aware multi-currency support, complex bundle inventory logic, and secure Paystack integrations.",
    category: "Full-Stack",
    tech_stack: ["React", "Vite", "Node.js", "PostgreSQL", "Paystack"],
    image: "https://images.unsplash.com/photo-1661956602116-aa6865609028?q=80&w=1964&auto=format&fit=crop",
    live_url: "#",
    year: "2024"
  },
  {
    id: 3,
    title: "Wodibenuah Fair Marketplace",
    summary: "A luxury vendor management and event platform featuring automated registration, secure ticket sales, and a high-fidelity lifestyle admin center.",
    category: "Full-Stack",
    tech_stack: ["React", "Supabase", "Node.js", "Paystack Webhooks"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
    live_url: "#",
    year: "2024"
  },
  {
    id: 4,
    title: "Sourceline Limited Portal",
    summary: "A 'Trust-First' geoinformatics platform featuring a dedicated SURCON/CAC license verification suite and specialized land surveying lead capture.",
    category: "Full-Stack",
    tech_stack: ["React 19", "Vite", "Supabase", "Tailwind CSS"],
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
    live_url: "#",
    year: "2025"
  },
  {
    id: 5,
    title: "EduFlow Academic ERP",
    summary: "A culturally-adapted school management system with automated WAEC grading, installmental fee tracking, and Termii SMS parent alerts.",
    category: "Full-Stack",
    tech_stack: ["React", "Node.js", "PostgreSQL", "Termii API"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    year: "2024"
  },
  {
    id: 6,
    title: "MediOS Hospital OS",
    summary: "An offline-first hospital management system featuring an automated HMO claims engine and real-time inventory scrubbing for clinics.",
    category: "Healthcare",
    tech_stack: ["React", "PWA", "IndexedDB", "RxDB"],
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
    year: "2024"
  }
];

export default ProjectsPage;
