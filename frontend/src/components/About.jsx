import React from 'react';

const About = () => {
  return (
    <section id="about" className="px-6 md:px-12 max-w-7xl mx-auto py-24 text-center">
      <p className="uppercase tracking-widest text-sm text-gray-400 mb-2">About Me</p>
      <h2 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-12 tracking-tight">
        ODIBENUAH EUGE<span className="text-accent">NE</span>
      </h2>

      {/* Main Image */}
      <div className="w-full h-64 md:h-[500px] bg-gray-800 mb-16 relative overflow-hidden">
        {/* Replace with actual image */}
        <div className="absolute inset-0 bg-gray-700 flex items-center justify-center text-gray-500">
          [Setup Image]
        </div>
      </div>

      <div className="flex flex-col md:flex-row text-left max-w-4xl mx-auto space-y-6 md:space-y-0 md:space-x-12">
        <div className="md:w-1/3">
          <p className="text-lg md:text-xl leading-relaxed">
            Hi, I'm Eugene, a Nigerian<br />full-stack developer
          </p>
        </div>
        <div className="md:w-2/3">
          <p className="text-gray-300 leading-relaxed text-lg md:text-xl font-light">
            I specialize in building modern, scalable web applications that are fast, reliable, and easy to use. From idea to deployment, I focus on creating systems that not only work but grow with your business.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
