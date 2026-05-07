import React from 'react';

const Services = () => {
  const services = [
    {
      title: "Custom Web Platforms",
      desc: "Complete end-to-end business solutions",
      features: [
        "SaaS & Dashboard Products",
        "E-commerce & Marketplaces",
        "Internal Business Tools"
      ]
    },
    {
      title: "High-Performance Interfaces",
      desc: "Fast, responsive, and engaging user experiences",
      features: [
        "Animated Marketing Sites",
        "Interactive Web Apps",
        "Mobile-First Optimization"
      ]
    },
    {
      title: "Secure API & Data Systems",
      desc: "Robust infrastructure and secure data management",
      features: [
        "Scalable Server Architecture",
        "User Auth & Security",
        "Database & Workflow Design"
      ]
    },
    {
      title: "Technical Strategy & Audits",
      desc: "Roadmapping and performance optimization",
      features: [
        "Performance & Security Audits",
        "Code Modernization",
        "Tech Stack Strategy"
      ]
    }
  ];

  return (
    <section id="services" className="px-6 md:px-12 max-w-7xl mx-auto py-24">
      <div className="text-center mb-16">
        <h3 className="text-3xl md:text-4xl font-heading font-bold mb-2 text-black dark:text-white">Services</h3>
        <p className="text-gray-600 dark:text-gray-300 tracking-widest uppercase text-sm">What I Can Build For You</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service, index) => (
          <div 
            key={`service-${index}`} 
            className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 hover:border-accent dark:hover:border-accent transition-colors p-8 relative overflow-hidden group cursor-pointer shadow-sm"
          >
            {/* Orange gradient accent on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 dark:from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10">
              <h4 className="text-xl font-heading font-bold mb-1 text-black dark:text-white">{service.title}</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm italic mb-6">{service.desc}</p>
              
              <ul className="space-y-3 mb-8 text-sm text-gray-800 dark:text-gray-200">
                {service.features.map((feature, i) => (
                  <li key={`feature-${i}`} className="flex items-start">
                    <span className="text-accent mr-2 mt-1 text-[10px]">■</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <a href="#contact" className="inline-block bg-black text-white dark:bg-white dark:text-black text-xs font-bold px-4 py-2 uppercase hover:bg-accent dark:hover:bg-gray-200 transition-colors">
                Start A Project
              </a>
            </div>
            
            {/* Gray block decoration */}
            <div className="absolute top-4 right-4 w-12 h-12 bg-gray-100 dark:bg-gray-800 group-hover:bg-accent transition-colors"></div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
