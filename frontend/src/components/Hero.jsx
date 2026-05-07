import React from 'react';

const Hero = () => {
  return (
    <section id="home" className="px-6 md:px-12 max-w-7xl mx-auto pt-12 pb-24 flex flex-col md:flex-row items-center justify-between relative">
      <div className="w-full md:w-2/3 z-10">
        <h1 className="text-5xl md:text-7xl lg:text-[100px] font-heading font-bold leading-none tracking-tight mb-4 uppercase text-black dark:text-white">
          Full-Stack Web <br className="hidden md:block" /> Developer
        </h1>
        <div className="flex flex-col md:flex-row md:items-center mt-10 gap-6">
          <a href="#projects" className="bg-black text-white dark:bg-white dark:text-black font-bold uppercase text-[11px] px-8 py-4 tracking-[0.2em] hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white transition-all duration-300 inline-block text-center shadow-lg">
            Explore Portfolio
          </a>
          <p className="text-gray-800 dark:text-gray-200 text-sm md:text-base tracking-widest uppercase font-bold opacity-80">
            Crafting Digital Excellence // Nigeria
          </p>
        </div>
      </div>
      
      {/* Image */}
      <div className="w-full md:w-1/3 mt-12 md:mt-0 flex justify-end relative">
        <div className="w-64 h-80 md:w-80 md:h-96 bg-gray-800 relative overflow-visible shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop" 
            alt="Eugene Odibenuah" 
            className="w-full h-full object-cover"
          />
          <div className="absolute -bottom-6 -right-6 bg-white text-black text-xl font-bold px-4 py-2 font-handwritten transform -rotate-6 shadow-lg z-20">
            Meet The Founder
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
