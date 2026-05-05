import React from 'react';

const Services = () => {
  const services = [
    {
      title: "Full Production Development",
      desc: "From idea to fully working products",
      features: [
        "Build complete web apps",
        "Build complete design-scalable architecture apps",
        "Deploy production-ready systems"
      ]
    },
    {
      title: "Full Production Development",
      desc: "From idea to fully working products",
      features: [
        "Build complete web apps",
        "Build complete design-scalable architecture apps",
        "Deploy production-ready systems"
      ]
    },
    {
      title: "Full Production Development",
      desc: "From idea to fully working products",
      features: [
        "Build complete web apps",
        "Build complete design-scalable architecture apps",
        "Deploy production-ready systems"
      ]
    },
    {
      title: "Full Production Development",
      desc: "From idea to fully working products",
      features: [
        "Build complete web apps",
        "Build complete design-scalable architecture apps",
        "Deploy production-ready systems"
      ]
    }
  ];

  return (
    <section id="services" className="px-6 md:px-12 max-w-7xl mx-auto py-24">
      <div className="text-center mb-16">
        <h3 className="text-3xl md:text-4xl font-heading font-bold mb-2">Services</h3>
        <p className="text-gray-400 tracking-widest uppercase text-sm">What I Can Build For You</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service, index) => (
          <div 
            key={index} 
            className="bg-[#111] border border-gray-800 hover:border-accent transition-colors p-8 relative overflow-hidden group cursor-pointer"
          >
            {/* Orange gradient accent on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10">
              <h4 className="text-xl font-heading font-bold mb-1">{service.title}</h4>
              <p className="text-gray-400 text-sm italic mb-6">{service.desc}</p>
              
              <ul className="space-y-3 mb-8 text-sm text-gray-300">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-accent mr-2 mt-1 text-[10px]">■</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button className="bg-white text-black text-xs font-bold px-4 py-2 uppercase hover:bg-gray-200 transition-colors">
                Start A Project
              </button>
            </div>
            
            {/* Gray block decoration */}
            <div className="absolute top-4 right-4 w-12 h-12 bg-gray-800"></div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
