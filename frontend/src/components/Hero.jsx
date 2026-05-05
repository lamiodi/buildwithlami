import React from 'react';

const Hero = () => {
  return (
    <section id="home" className="px-6 md:px-12 max-w-7xl mx-auto pt-12 pb-24 flex flex-col md:flex-row items-center justify-between relative">
      <div className="w-full md:w-2/3 z-10">
        <h1 className="text-5xl md:text-7xl lg:text-[100px] font-heading font-bold leading-none tracking-tight mb-4 uppercase">
          Full-Stack Web <br className="hidden md:block" /> Developer
        </h1>
        <div className="flex items-center mt-8 space-x-6">
          <a href="#projects" className="bg-white text-black font-bold uppercase text-xs px-6 py-3 tracking-wider hover:bg-gray-200 transition-colors inline-block">
            View Projects
          </a>
          <p className="text-gray-400 text-sm md:text-base tracking-wide">
            Building Fast, Scalable Web Apps
          </p>
        </div>
      </div>
      
      {/* Image Placeholder */}
      <div className="w-full md:w-1/3 mt-12 md:mt-0 flex justify-end relative">
        <div className="w-64 h-80 md:w-80 md:h-96 bg-gray-800 relative overflow-hidden">
          {/* Replace with actual image */}
          <div className="absolute inset-0 bg-gray-700 flex items-center justify-center text-gray-500">
            [Hero Image]
          </div>
          <div className="absolute bottom-4 right-4 bg-white text-black text-xs font-bold px-3 py-1 italic transform rotate-[-5deg]">
            Meet The Founder
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
