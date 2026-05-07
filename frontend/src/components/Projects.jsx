import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CheckIcon from './CheckIcon';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // For frontend MVP, we'll use static data until backend is fully connected,
  // but we set up the fetch logic so it's ready.
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/projects');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
             setProjects(data);
          }
        }
      } catch (error) {
        console.error("Could not fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  const featuredProject = projects.length > 0 ? projects[0] : {
    title: "VonneX2 Enterprise ERP",
    summary: "A bespoke business operations ecosystem featuring intelligent scheduling, GPS-fenced workforce management, and real-time retail/service POS integration.",
    features: [
      "Bespoke Enterprise Scheduling",
      "GPS-Verified Staff Attendance",
      "Unified Retail & Service POS",
      "Real-time Inventory Synchronization",
      "Advanced Business Analytics Suite"
    ],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    link: "#"
  };

  const moreProjects = projects.length > 1 ? projects.slice(1) : [
    {
      title: "The TiaBrand E-commerce Ecosystem",
      year: "2024",
      image: "https://images.unsplash.com/photo-1661956602116-aa6865609028?q=80&w=1964&auto=format&fit=crop"
    },
    {
      title: "Wodibenuah Fair Luxury Marketplace",
      year: "2024",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop"
    },
    {
      title: "Sourceline Limited Portal",
      year: "2025",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  return (
    <section id="projects" className="px-6 md:px-12 max-w-7xl mx-auto py-24">
      <h3 className="text-2xl font-heading font-bold mb-8 text-black dark:text-white">Projects</h3>

      <div className="mb-24">
        <h4 className="text-3xl md:text-4xl font-heading font-bold mb-2 text-black dark:text-white">{featuredProject.title}</h4>
        <p className="text-gray-800 dark:text-gray-200 text-lg md:text-xl max-w-3xl mb-12 font-light leading-relaxed">
          {featuredProject.summary}
        </p>

        {/* Project Image */}
        <div className="w-full h-64 md:h-[500px] bg-gray-200 dark:bg-gray-800 mb-8 overflow-hidden rounded-sm border border-gray-200 dark:border-none shadow-md">
           <img 
              src={featuredProject.image_url || featuredProject.image} 
              alt={featuredProject.title} 
              className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
            />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
          <ul className="space-y-3 text-sm md:text-base text-gray-700 dark:text-gray-300 mb-8 md:mb-0">
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

          <a href={featuredProject.live_url || featuredProject.link} target="_blank" rel="noopener noreferrer" className="bg-accent text-white font-bold px-6 py-2 flex items-center hover:bg-[#d43d1a] transition-colors">
            Live Demo
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
          </a>
        </div>
      </div>

      <div className="text-center mb-12">
        <h4 className="text-sm font-bold uppercase tracking-widest mb-2 text-black dark:text-white">View More Projects</h4>
        <p className="text-xs text-gray-700 dark:text-gray-300 uppercase tracking-[0.2em] font-bold">Designed in Figma. Built with PERN Stack.</p>
      </div>

      <div className="space-y-16">
        {moreProjects.map((p, idx) => (
          <div key={`more-${idx}`} className="group cursor-pointer">
            <div className="w-full h-64 md:h-[400px] bg-gray-200 dark:bg-gray-800 mb-4 overflow-hidden rounded-sm">
               <img 
                 src={p.image_url || p.image} 
                 alt={p.title} 
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 dark:opacity-80 group-hover:opacity-100"
               />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">
              <span className="text-gray-800 dark:text-gray-400 group-hover:text-accent dark:group-hover:text-white transition-colors">{p.title}</span>
              <span className="text-accent">{p.year || new Date(p.created_at || Date.now()).getFullYear()}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects;
