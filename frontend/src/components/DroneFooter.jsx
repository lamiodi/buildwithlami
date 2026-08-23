import React from 'react';
import { Link } from 'react-router-dom';
import { Crosshair, ArrowRight, ArrowUpRight, Camera, Video, ShieldCheck, Mail, Phone, MapPin, Layers, Radio } from 'lucide-react';
import { CONTACT } from '../config/contact';

const DroneFooter = () => {
  const displayYear = 2026;

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-[#0a0a0a] text-white pt-12 pb-8 px-4 md:px-8 border-t border-white/5 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Top Feature Card: Pilot Identity & Readiness */}
        <div className="bg-[#121212] border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
          {/* Subtle Orange Atmospheric Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F44A22]/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Left: Division Brand & Badge (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/90">
                <span className="w-2 h-2 rounded-full bg-[#F44A22] animate-pulse" />
                <span className="tracking-wide">Lami Aerial Cinematography</span>
              </div>

              <div>
                <h3 className="drone-heading text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.05]">
                  See Your Project<br />
                  <span className="text-[#F44A22]">From Above.</span>
                </h3>
                <p className="mt-4 text-sm text-gray-400 leading-relaxed max-w-lg font-normal">
                  Commercial drone photography, 4K 60fps HDR architectural videography, recurring construction milestone progress, and precision orthomosaics across Nigeria.
                </p>
              </div>

              {/* Pilot & Fleet Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="w-9 h-9 rounded-xl bg-[#F44A22]/15 border border-[#F44A22]/30 flex items-center justify-center text-[#F44A22] shrink-0">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Fleet Hardware</span>
                    <span className="text-xs font-bold text-white">DJI Mini 4 Pro &amp; 4K</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="w-9 h-9 rounded-xl bg-[#F44A22]/15 border border-[#F44A22]/30 flex items-center justify-center text-[#F44A22] shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Chief Pilot</span>
                    <span className="text-xs font-bold text-white">Eugene Odibenuah</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quick Action & Fast Dispatch (6 cols) */}
            <div className="lg:col-span-6 bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Direct Flight Dispatch</span>
                <span className="text-[11px] font-semibold text-[#F44A22] bg-[#F44A22]/10 px-3 py-1 rounded-full border border-[#F44A22]/20">
                  24h Response
                </span>
              </div>

              <div className="space-y-3.5 text-xs text-gray-300">
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-[#F44A22]/10 hover:border-[#F44A22]/40 border border-transparent transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#F44A22]" />
                    <span className="font-medium text-white">{CONTACT.email}</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                <a
                  href={`tel:${CONTACT.phoneE164 || '2349064185442'}`}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-[#F44A22]/10 hover:border-[#F44A22]/40 border border-transparent transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#F44A22]" />
                    <span className="font-medium text-white">{CONTACT.phoneDisplay || '+234 906 418 5442'}</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 text-gray-400">
                  <MapPin className="w-4 h-4 text-[#F44A22] shrink-0" />
                  <span className="font-medium">Lagos Base // Deployments Nationwide Across Nigeria</span>
                </div>
              </div>

              <a
                href="#contact"
                onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
                className="w-full py-4 rounded-full bg-white text-black hover:bg-[#F44A22] hover:text-white font-bold text-xs uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-3 shadow-lg"
              >
                <span>Book Flight Mission</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-b border-white/10 text-xs">
          
          {/* Col 1: Commercial Disciplines */}
          <div className="space-y-4">
            <span className="drone-heading text-xs font-bold text-white uppercase tracking-wider block">
              Disciplines
            </span>
            <ul className="space-y-2.5 text-gray-400">
              <li>
                <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }} className="hover:text-white transition-colors">
                  Real Estate &amp; Architecture
                </a>
              </li>
              <li>
                <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }} className="hover:text-white transition-colors">
                  Construction Monitoring
                </a>
              </li>
              <li>
                <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }} className="hover:text-white transition-colors">
                  Hospitality &amp; Events
                </a>
              </li>
              <li>
                <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }} className="hover:text-white transition-colors">
                  Photogrammetry &amp; 2D Maps
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: Aircraft Fleet */}
          <div className="space-y-4">
            <span className="drone-heading text-xs font-bold text-white uppercase tracking-wider block">
              Fleet &amp; Optics
            </span>
            <ul className="space-y-2.5 text-gray-400">
              <li>
                <a href="#fleet" onClick={(e) => { e.preventDefault(); scrollToSection('fleet'); }} className="hover:text-white transition-colors">
                  DJI Mini 4 Pro (4K/60fps)
                </a>
              </li>
              <li>
                <a href="#fleet" onClick={(e) => { e.preventDefault(); scrollToSection('fleet'); }} className="hover:text-white transition-colors">
                  DJI Mini 4K (Backup Unit)
                </a>
              </li>
              <li>
                <a href="#fleet" onClick={(e) => { e.preventDefault(); scrollToSection('fleet'); }} className="hover:text-white transition-colors">
                  10-bit D-Log M Color Grading
                </a>
              </li>
              <li>
                <a href="#fleet" onClick={(e) => { e.preventDefault(); scrollToSection('fleet'); }} className="hover:text-white transition-colors">
                  48MP RAW Stills (DNG)
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigation */}
          <div className="space-y-4">
            <span className="drone-heading text-xs font-bold text-white uppercase tracking-wider block">
              Navigation
            </span>
            <ul className="space-y-2.5 text-gray-400">
              <li>
                <Link to="/drone" className="hover:text-white transition-colors">Drone Overview</Link>
              </li>
              <li>
                <a href="#work" onClick={(e) => { e.preventDefault(); scrollToSection('work'); }} className="hover:text-white transition-colors">Mission Archive</a>
              </li>
              <li>
                <a href="#workflow" onClick={(e) => { e.preventDefault(); scrollToSection('workflow'); }} className="hover:text-white transition-colors">Safety &amp; Workflow</a>
              </li>
              <li>
                <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }} className="hover:text-white transition-colors">Flight FAQ</a>
              </li>
            </ul>
          </div>

          {/* Col 4: Studio Divisions */}
          <div className="space-y-4">
            <span className="drone-heading text-xs font-bold text-white uppercase tracking-wider block">
              Studio Network
            </span>
            <ul className="space-y-2.5 text-gray-400">
              <li>
                <Link to="/" className="hover:text-[#F44A22] transition-colors flex items-center justify-between">
                  <span>Main Studio Hub</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </li>
              <li>
                <Link to="/software" className="hover:text-[#F44A22] transition-colors flex items-center justify-between">
                  <span>Software Division</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </li>
              <li>
                <Link to="/survey" className="hover:text-[#F44A22] transition-colors flex items-center justify-between">
                  <span>GeoSurvey (Land Survey)</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Large Cinematic Brand Statement */}
        <div className="py-4 text-center select-none">
          <h2
            className="drone-heading font-black text-white/90 uppercase tracking-tighter leading-none"
            style={{ fontSize: 'clamp(26px, 7.5vw, 110px)' }}
          >
            LAMI AERIAL OPS
          </h2>
          <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-gray-500 font-bold mt-2">
            Aerial Cinematography · Construction Progress · Orthomosaic Mapping
          </p>
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-white/10 text-[11px] text-gray-500">
          <p className="font-medium text-center sm:text-left">
            © {displayYear} Lami Drone Operations. Piloted by Eugene Odibenuah. All rights reserved.
          </p>
          <div className="flex items-center gap-6 font-semibold uppercase tracking-widest text-[10px]">
            <a
              href="https://www.instagram.com/odibenuah_eugene?igsh=MXMwbzh6emk1eDhucA=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={`mailto:${CONTACT.email}`}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Email Pilot
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default DroneFooter;
