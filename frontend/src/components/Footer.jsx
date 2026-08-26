import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';

const TechStack = lazy(() => import('./TechStack'));

const Footer = () => {
  const displayYear = 2026;
  const [shouldLoadTechStack, setShouldLoadTechStack] = useState(false);
  const techStackContainerRef = useRef(null);

  useEffect(() => {
    if (shouldLoadTechStack) return;
    const el = techStackContainerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadTechStack(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldLoadTechStack]);

  return (
    <footer className="bg-black text-white pt-12 sm:pt-16 pb-10 sm:pb-12 px-4 sm:px-6 md:px-12 font-mono selection:bg-white selection:text-black border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">

        {/* Top: QR, Studio Branding & Interactive TechStack Physics Section */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8 sm:mb-12">
          {/* Studio Brand & QR Identity Card */}
          <div className="w-full lg:w-[280px] bg-[#111] border border-white/10 p-5 sm:p-6 rounded-2xl flex flex-col justify-between group shrink-0">
            <div>
              {/* Non-overlay Scan Me indicator */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-accent uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  SCAN ME
                </span>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Connect</span>
              </div>

              {/* QR Code Container (100% unobstructed) */}
              <div className="w-40 h-40 sm:w-48 sm:h-48 lg:w-full lg:aspect-square mx-auto lg:mx-0 bg-white flex items-center justify-center p-3.5 rounded-xl overflow-hidden mb-5 sm:mb-6 shadow-inner">
                <img
                  src="/qr-code.svg"
                  alt="Scan QR Code to connect with BuildWithLami"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            <div className="space-y-1 text-center lg:text-left">
              <span className="text-xs font-bold text-accent uppercase tracking-widest block">Software Studio</span>
              <h3 className="text-xl font-heading font-bold text-white tracking-tight">BuildWithLami</h3>
              <p className="text-xs text-gray-400 font-mono">Founded by Eugene Odibenuah</p>
            </div>
          </div>

          {/* Interactive Physics Canvas */}
          <div 
            ref={techStackContainerRef}
            className="flex-1 min-h-[300px] sm:min-h-[380px] rounded-2xl relative overflow-hidden border border-white/10"
          >
            {shouldLoadTechStack ? (
              <Suspense fallback={
                <div className="w-full h-full min-h-[300px] sm:min-h-[380px] bg-[#111] flex items-center justify-center text-xs font-mono text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span>Loading interactive stack...</span>
                  </div>
                </div>
              }>
                <TechStack />
              </Suspense>
            ) : (
              <div className="w-full h-full min-h-[300px] sm:min-h-[380px] bg-[#111]" />
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 sm:gap-x-8 gap-y-3 sm:gap-y-4 mb-8 sm:mb-12 text-[11px] md:text-[12px] tracking-[0.2em] font-heading font-bold uppercase border-b border-white/10 pb-8 sm:pb-10">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <Link to="/projects" className="hover:text-accent transition-colors">Work</Link>
          <Link to="/services" className="hover:text-accent transition-colors">Services</Link>
          <Link to="/pricing" className="hover:text-accent transition-colors">Pricing</Link>
          <Link to="/about" className="hover:text-accent transition-colors">About</Link>
          <Link to="/contact" className="hover:text-accent transition-colors">Contact</Link>
        </nav>

        {/* Massive Branding Headline */}
        <div className="mb-10 sm:mb-16 select-none pointer-events-none w-full text-center overflow-hidden">
          <h2
            className="font-black leading-[0.85] uppercase text-white whitespace-nowrap"
            style={{ fontSize: 'clamp(25px, 9.72vw, 146px)', letterSpacing: '-0.04em' }}
          >
            &lt;BUILDWITH_LAMI /&gt;
          </h2>
        </div>

        {/* Bottom Information Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4 pt-8 border-t border-white/10 text-[10px] md:text-[11px] tracking-[0.2em] font-bold uppercase text-white/90">
          {/* Quick links */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 sm:gap-x-8 gap-y-2">
            <Link to="/contact" className="hover:text-accent transition-colors">
              Inquiries
            </Link>
          </div>

          {/* Copyright */}
          <div className="opacity-90 font-mono font-medium lowercase tracking-[0.15em] text-center sm:text-right">
            copyright {displayYear} // BuildWithLami · founded by Eugene Odibenuah
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

