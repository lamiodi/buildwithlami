import React from 'react';
import { Link } from 'react-router-dom';
import TechStack from './TechStack';
import { CONTACT } from '../config/contact';

const Footer = () => {
  const displayYear = 2026;

  return (
    <footer className="bg-black text-white pt-16 pb-12 px-6 md:px-12 font-mono selection:bg-white selection:text-black border-t border-white/10">
      <div className="max-w-[1400px] mx-auto space-y-12">

        {/* Top: QR, Studio Branding & Interactive TechStack Physics Section */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12">
          {/* Studio Brand & QR Identity Card */}
          <div className="w-full lg:w-[280px] bg-[#111] border border-white/10 p-6 rounded-2xl flex flex-col justify-between group shrink-0">
            <div className="w-full aspect-square bg-white flex items-center justify-center p-3 rounded-xl overflow-hidden mb-6">
              <img
                src="/qr-code.svg"
                alt="QR Code"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-accent uppercase tracking-widest block">Software Studio</span>
              <h3 className="text-xl font-heading font-bold text-white tracking-tight">BuildWithLami</h3>
              <p className="text-xs text-gray-400 font-mono">Founded by Eugene Odibenuah</p>
            </div>
          </div>

          {/* Interactive Physics Canvas */}
          <div className="flex-1 min-h-[380px] rounded-2xl relative overflow-hidden border border-white/10">
            <TechStack />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-wrap gap-x-8 gap-y-4 mb-12 text-[11px] md:text-[12px] tracking-[0.5em] font-black uppercase border-b border-white/10 pb-10">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <Link to="/software" className="hover:text-accent transition-colors">Software</Link>
          <Link to="/services" className="hover:text-accent transition-colors">Services</Link>
          <Link to="/projects" className="hover:text-accent transition-colors">Projects</Link>
          <Link to="/pricing" className="hover:text-accent transition-colors">Pricing</Link>
          <Link to="/about" className="hover:text-accent transition-colors">About</Link>
          <Link to="/contact" className="hover:text-accent transition-colors">Contact</Link>
        </nav>

        {/* Massive Branding Headline — clamp(min, vw, max) + nowrap = one line always */}
        <div className="mb-16 select-none pointer-events-none w-full text-center">
          <h2
            className="font-black leading-[0.85] uppercase text-white whitespace-nowrap"
            style={{ fontSize: 'clamp(25px, 9.72vw, 146px)', letterSpacing: '-0.04em' }}
          >
            &lt;BUILDWITH_LAMI /&gt;
          </h2>
        </div>

        {/* Bottom Information Row */}
        <div className="flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:justify-between sm:items-center pt-10 border-t border-white/10 text-[10px] md:text-[11px] tracking-[0.3em] font-bold uppercase text-white/90">
          {/* Social / quick links */}
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <a
              href={`mailto:${CONTACT.email}`}
              className="hover:text-accent transition-colors"
            >
              Email
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              LinkedIn
            </a>
            <Link to="/#faq" className="hover:text-accent transition-colors">
              Faqs
            </Link>
          </div>

          {/* Copyright */}
          <div className="opacity-90 font-medium lowercase tracking-[0.15em]">
            copyright {displayYear} // BuildWithLami · founded by Eugene Odibenuah
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
