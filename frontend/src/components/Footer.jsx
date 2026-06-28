import React from 'react';
import { Link } from 'react-router-dom';
import TechStack from './TechStack';
import { CONTACT } from '../config/contact';

const Footer = () => {
  // Enforcing the year 2026 from the template
  const displayYear = 2026;

  return (
    <footer className="bg-black text-white pt-20 pb-12 px-6 md:px-12 font-mono selection:bg-white selection:text-black">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Top: QR and Professional Status Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-20">
          <div className="w-full md:w-[240px] aspect-square bg-white flex items-center justify-center p-2 rounded-sm group overflow-hidden">
            <img 
              src="/qr-code.svg" 
              alt="QR Code" 
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="flex-1 min-h-[360px] rounded-sm relative overflow-hidden">
            <TechStack />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-wrap gap-x-12 gap-y-6 mb-12 text-[11px] md:text-[12px] tracking-[0.5em] font-black uppercase border-b border-white/10 pb-10">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <Link to="/about" className="hover:text-accent transition-colors">About</Link>
          <Link to="/services" className="hover:text-accent transition-colors">Services</Link>
          <Link to="/projects" className="hover:text-accent transition-colors">Projects</Link>
          <Link to="/services#pricing" className="hover:text-accent transition-colors">Pricing</Link>
        </nav>

        {/* Massive Branding Headline */}
        <div className="mb-16 select-none pointer-events-none overflow-hidden">
          <h2 className="text-[10vw] sm:text-[12.1vw] md:text-[9.7vw] font-black leading-[0.8] tracking-[-0.04em] md:tracking-[-0.06em] uppercase whitespace-nowrap -ml-[0.03em] md:-ml-[0.05em] text-white">
            &lt;BUILDWITH_LAMI /&gt;
          </h2>
        </div>

        {/* Bottom Information Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pt-10 border-t border-white/10 text-[10px] md:text-[11px] tracking-[0.3em] font-bold uppercase text-white/90">
          <div className="flex gap-10">
            <a href={`mailto:${CONTACT.email}`} className="hover:text-accent transition-colors">Email</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">LinkedIn</a>
            <Link to="/contact" className="hover:text-accent transition-colors">Faqs</Link>
          </div>
          <div className="opacity-90 font-medium lowercase">
            copyright {displayYear} // built with precision by lami
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
