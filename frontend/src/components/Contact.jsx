import React from 'react';

const Contact = () => {
  return (
    <section id="contact" className="bg-accent py-24">
      <div className="px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
        <div className="md:w-1/2">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-8 text-white">
            Let's Build Your Next Product
          </h2>
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-light">
            Tell me what you're building - I'll help you design, develop, and launch it fast.
          </p>
        </div>

        <div className="md:w-1/2 w-full">
          <form className="space-y-8">
            <div>
              <input 
                type="text" 
                placeholder="name" 
                className="w-full bg-transparent border-b-2 border-white/50 py-3 text-white placeholder-white/70 focus:outline-none focus:border-white transition-colors text-lg"
              />
            </div>
            <div>
              <input 
                type="email" 
                placeholder="email" 
                className="w-full bg-transparent border-b-2 border-white/50 py-3 text-white placeholder-white/70 focus:outline-none focus:border-white transition-colors text-lg"
              />
            </div>
            <div>
              <input 
                type="text" 
                placeholder="your message" 
                className="w-full bg-transparent border-b-2 border-white/50 py-3 text-white placeholder-white/70 focus:outline-none focus:border-white transition-colors text-lg"
              />
            </div>
            <p className="text-white/70 text-xs italic text-center pt-4">
              * I usually respond within a few hours
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
