import React from 'react';

const Projects = () => {
  return (
    <section id="projects" className="px-6 md:px-12 max-w-7xl mx-auto py-24">
      <h3 className="text-2xl font-heading font-bold mb-8">Projects</h3>

      <div className="mb-24">
        <h4 className="text-3xl md:text-4xl font-heading font-bold mb-2">Tiobrand E-commerce website</h4>
        <p className="text-gray-400 mb-8 max-w-2xl">
          A full-stack e-commerce platform with dynamic product and bundle system, built for scalability and real world usage.
        </p>

        {/* Project Image */}
        <div className="w-full h-64 md:h-[500px] bg-gray-300 mb-8"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
          <ul className="space-y-3 text-sm md:text-base text-gray-300 mb-8 md:mb-0">
            <li className="flex items-center">
              <svg className="w-5 h-5 text-accent mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Dynamic product & bundle system
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-accent mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Cart & order management
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-accent mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Multiple payment integration
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-accent mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Clean, responsive UI/UX
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-accent mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              PostgreSQL database design
            </li>
          </ul>

          <button className="bg-accent text-white font-bold px-6 py-2 flex items-center hover:bg-[#d43d1a] transition-colors">
            Live Demo
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
          </button>
        </div>
      </div>

      <div className="text-center mb-12">
        <h4 className="text-sm font-bold uppercase tracking-widest mb-2">View More Projects</h4>
        <p className="text-xs text-gray-500 uppercase tracking-widest">Designed by Figma, Built with MERN Stack</p>
      </div>

      <div className="space-y-8">
        <div>
          <div className="w-full h-64 md:h-[400px] bg-gray-300 mb-2"></div>
          <div className="flex justify-between text-xs text-gray-400 uppercase tracking-wider">
            <span>inventory pos & inventory software</span>
            <span>2024</span>
          </div>
        </div>
        <div>
          <div className="w-full h-64 md:h-[400px] bg-gray-300 mb-2"></div>
          <div className="flex justify-between text-xs text-gray-400 uppercase tracking-wider">
            <span>inventory pos & inventory software</span>
            <span>2024</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
