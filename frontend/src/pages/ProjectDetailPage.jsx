import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProject = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/projects/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Could not fetch project:", error);
      }
      // Fallback
      const found = fallbackProjects.find(p => p.id.toString() === id);
      setProject(found || fallbackProjects[0]);
      setLoading(false);
    };
    fetchProject();
  }, [id]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const imageHover = {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.5, ease: "easeOut" } }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white">
        <h2 className="text-4xl font-heading mb-4">Project Not Found</h2>
        <Link to="/projects" className="text-accent underline">Back to Portfolio</Link>
      </div>
    );
  }

  const imageUrl = project.image_url || project.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop';
  const words = project.title.split(' ');
  const firstHalf = words.slice(0, Math.ceil(words.length / 2)).join(' ');
  const secondHalf = words.slice(Math.ceil(words.length / 2)).join(' ');

  return (
    <div className="min-h-screen bg-background text-white font-body overflow-hidden pt-24">
      {/* Top Nav/Back */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-8">
        <Link to="/projects" className="inline-flex items-center text-sm text-gray-400 hover:text-accent transition-colors group uppercase tracking-widest font-bold">
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Portfolio
        </Link>
      </div>

      {/* Hero Section */}
      <motion.section 
        className="relative max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-24 flex flex-col items-center justify-center min-h-[60vh]"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="relative w-full max-w-5xl text-center">
          {/* Floating Images (using the project image with different stylings) */}
          <motion.div 
            className="absolute top-0 left-0 md:-left-12 lg:-left-24 w-32 md:w-48 hidden md:block rounded-xl overflow-hidden shadow-2xl opacity-80"
            variants={fadeInUp}
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
            variants={fadeInUp}
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
            className="absolute bottom-[-20%] right-[10%] md:right-[20%] w-40 md:w-64 hidden md:block rounded-full overflow-hidden shadow-[0_0_50px_rgba(244,74,34,0.15)] z-20 border border-gray-800"
            variants={fadeInUp}
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
            variants={fadeInUp}
            className="text-accent text-sm md:text-base font-bold uppercase tracking-[0.3em] mb-6"
          >
            {project.category || 'Featured Project'}
          </motion.p>
          <motion.h1 
            variants={fadeInUp}
            className="text-5xl md:text-7xl lg:text-[8rem] font-heading font-bold uppercase tracking-tight leading-[0.9] text-white z-10 relative drop-shadow-2xl"
          >
            {firstHalf}<br />
            <span className="text-gray-300">{secondHalf}</span>
          </motion.h1>
        </div>
      </motion.section>

      {/* Feature Split Section */}
      <motion.section 
        className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-40 grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        {/* Left: Project Image */}
        <motion.div 
          className="relative rounded-2xl overflow-hidden aspect-square md:aspect-[4/5] bg-gray-900 border border-gray-800 shadow-2xl"
          variants={fadeInUp}
        >
          <img 
            src={imageUrl} 
            alt={project.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 w-full p-8">
             <div className="flex flex-wrap gap-2 mb-4">
                {(Array.isArray(project.tech_stack) ? project.tech_stack : []).map((tech, i) => (
                  <span key={i} className="text-xs font-bold uppercase tracking-widest text-white/90 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    {tech}
                  </span>
                ))}
              </div>
          </div>
        </motion.div>

        {/* Right: Text description */}
        <motion.div variants={fadeInUp} className="max-w-xl">
          <p className="text-2xl md:text-4xl font-light text-gray-300 leading-snug">
            <span className="font-bold text-white uppercase">{project.title}</span> — {project.summary || 'A state-of-the-art solution built for performance and scale.'}
          </p>
          
          <div className="mt-10 space-y-6 text-gray-400 text-lg leading-relaxed">
            <p>
              {project.description || project.summary || "This project involved full lifecycle development, focusing on delivering an exceptional user experience while maintaining robust backend performance."}
            </p>
            
            {/* Features List */}
            {project.features && (
              <div className="pt-6">
                <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-4">Key Features</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* CTA Buttons - High Conversion Adjustment */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-800 mt-8">
              {project.live_url && (
                <a 
                  href={project.live_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-accent text-white font-bold px-8 py-4 text-sm uppercase tracking-widest hover:bg-[#d43d1a] transition-all flex items-center justify-center hover:-translate-y-1 shadow-[0_10px_20px_rgba(244,74,34,0.2)]"
                >
                  Visit Live Site
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
              {project.github_url && (
                <a 
                  href={project.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-white/5 border border-gray-700 text-white font-bold px-8 py-4 text-sm uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center hover:-translate-y-1"
                >
                  View Source
                  <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Full Width Gradient Section */}
      <motion.section 
        className="relative w-full h-[50vh] md:h-[70vh] bg-gradient-to-br from-accent/90 via-[#F44A22] to-accent/80 flex items-center justify-center overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 1 } }
        }}
      >
        {/* Glowing effect behind image */}
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
          />
          <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors duration-500"></div>
        </motion.div>
      </motion.section>

      {/* Next Project CTA */}
      <section className="py-24 md:py-32 text-center bg-background border-t border-gray-900">
        <p className="text-accent uppercase tracking-widest text-sm font-bold mb-4">View More Work</p>
        <Link to="/projects" className="text-5xl md:text-7xl font-heading font-bold text-white hover:text-accent transition-colors cursor-pointer inline-block group">
          All Projects
          <span className="block h-1 w-0 group-hover:w-full bg-accent transition-all duration-500 mt-2"></span>
        </Link>
      </section>
    </div>
  );
};

// Fallback project data
const fallbackProjects = [
  {
    id: 1,
    title: "VonneX2 Enterprise ERP",
    summary: "Bespoke Enterprise Resource Planning (ERP) & POS Solution.",
    description: "Vonne X2x is a production-ready management platform built to solve the operational chaos of businesses that combine retail and services. I engineered a custom scheduling algorithm that handles variable service durations, implemented a GPS-fenced attendance system for staff accountability, and built a unified POS that syncs inventory in real-time. The result is an 85% reduction in manual booking errors and a centralized hub for all business data.",
    features: ["Intelligent Scheduling Engine", "GPS-Verified Attendance", "Unified Retail & Service POS", "Data-Driven Analytics Suite"],
    category: "Full-Stack",
    tech_stack: ["React", "Node.js", "PostgreSQL", "Supabase", "Socket.io"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    live_url: "#",
    year: "2024"
  },
  {
    id: 2,
    title: "The TiaBrand E-commerce Ecosystem",
    summary: "Scalable Retail Engine with Intelligent Multi-Currency Support.",
    description: "Developed 'The TiaBrand', a production-ready full-stack e-commerce platform. Built with React and Node.js, the system features a location-aware multi-currency engine, complex inventory management for product bundles, and secure Paystack payment integration. The project demonstrates a commitment to high-performance UI/UX and robust backend reliability, handling everything from asset optimization via Cloudinary to automated stock recovery systems.",
    features: ["Location-Aware Currency", "Bundle Creator Logic", "Persistent State Management", "Automated Inventory Recovery"],
    category: "Full-Stack",
    tech_stack: ["React", "Vite", "Node.js", "PostgreSQL", "Paystack"],
    image: "https://images.unsplash.com/photo-1661956602116-aa6865609028?q=80&w=1964&auto=format&fit=crop",
    live_url: "#",
    year: "2024"
  },
  {
    id: 3,
    title: "Wodibenuah Fair Marketplace",
    summary: "Luxury Event Infrastructure & Vendor Management Portal.",
    description: "I developed a full-stack luxury event platform for Wodibenuah Fair, integrating a high-end React frontend with a secure Node.js/Supabase backend. The system automates vendor registration and ticket sales through Paystack, while providing event organizers with a powerful administrative dashboard to manage high-volume logistics and lifestyle content. This project demonstrates my ability to deliver enterprise-grade functionality without compromising on elite-level visual design.",
    features: ["Luxury Frontend Experience", "Automated Vendor Onboarding", "Secure Payment Infrastructure", "Admin Command Center"],
    category: "Full-Stack",
    tech_stack: ["React", "Supabase", "Node.js", "Paystack Webhooks"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
    live_url: "#",
    year: "2024"
  },
  {
    id: 4,
    title: "Sourceline Limited Portal",
    summary: "Trust-Focused Professional Service & Verification Hub.",
    description: "I engineered the official digital platform for Sourceline Limited, a premier land surveying firm. To solve the industry's trust deficit, I implemented a 'Trust-First' architecture featuring a dedicated verification portal and regulatory-compliant content structures. Built with React 19 and Node.js, the system includes a custom Admin Dashboard for real-time resource management and a specialized lead-capture engine. The result is a secure, authoritative hub that successfully bridges the gap between technical surveying precision and modern user experience.",
    features: ["Anti-Scam Architecture", "SURCON Compliance", "Dynamic Resource Management", "Vite Performance Optimization"],
    category: "Full-Stack",
    tech_stack: ["React 19", "Vite", "Supabase", "Tailwind CSS"],
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
    live_url: "#",
    year: "2025"
  },
  {
    id: 5,
    title: "EduFlow Academic ERP",
    summary: "Culturally-Adapted Academic & Financial Management System.",
    description: "I developed EduFlow, a comprehensive ERP tailored for the Nigerian educational sector. I engineered a complex financial ledger system that manages installmental fee payments and an academic engine that automates WAEC-standard grading and position-based broad sheet generation. The platform streamlines school operations for over 500+ students, reducing manual administrative tasks by 70% and providing real-time financial oversight for proprietors.",
    features: ["Partial Payment Logic", "WAEC Grading Engine", "Termii SMS Alerts", "Print-Ready PDF Hub"],
    category: "Full-Stack",
    tech_stack: ["React", "Node.js", "PostgreSQL", "Termii API"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    year: "2024"
  },
  {
    id: 6,
    title: "MediOS Hospital OS",
    summary: "Local-First EMR & Healthcare Claims Automation.",
    description: "I engineered MediOS, an offline-first Hospital Management System built to function in low-connectivity environments. Using a PWA architecture with IndexedDB, I ensured zero-downtime for clinical operations during network outages. I also developed a specialized HMO Claims Engine that automates insurance tariff validation, reducing claim rejection rates by 40%. This project demonstrates my ability to build mission-critical systems that prioritize reliability and data integrity.",
    features: ["Offline-First PWA", "HMO Claims Scrubber", "ICD-10 Validation", "Sync-Enabled Architecture"],
    category: "Healthcare",
    tech_stack: ["React", "PWA", "IndexedDB", "RxDB"],
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
    year: "2024"
  }
];

export default ProjectDetailPage;
