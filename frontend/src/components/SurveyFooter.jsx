import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowUpRight, ShieldCheck, MapPin, Layers, Mail, Phone, FileText } from 'lucide-react';
import { CONTACT } from '../config/contact';

const SurveyFooter = () => {
  const displayYear = 2026;

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#111111] text-white pt-16 pb-12 px-6 md:px-12 font-mono selection:bg-white selection:text-black border-t border-white/15">
      <div className="max-w-[1400px] mx-auto space-y-12">

        {/* Top: Division Identity & Geomatics Credentials */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-white/10">
          
          {/* Division Identity Card (5 cols) */}
          <div className="lg:col-span-5 bg-[#181818] border border-white/15 p-8 rounded-none flex flex-col justify-between group relative">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-bold">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 block">
                    Geomatics &amp; Cadastral Division
                  </span>
                  <h3 className="text-xl font-bold tracking-tight text-white uppercase font-sans">
                    GeoSurvey
                  </h3>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed mb-6 font-sans">
                SURCON-compliant boundary demarcation, precision topographic baselines, engineering setting out, and estate subdivision layouts across Nigeria.
              </p>

              <div className="space-y-2.5 mb-6 text-xs text-gray-300">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-white shrink-0" />
                  <span className="text-white font-bold">Supervision:</span>
                  <span className="text-gray-400">SURCON Registered Supervision</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-white shrink-0" />
                  <span className="text-white font-bold">Primary Datums:</span>
                  <span className="text-gray-400">Minna Datum Clarke 1880 &amp; UTM Zone 31N/32N</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-white shrink-0" />
                  <span className="text-white font-bold">Field Coverage:</span>
                  <span className="text-gray-400">Lagos, Ogun, Oyo &amp; Nationwide</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <a
                href="#contact"
                onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
              >
                Request Survey Consultation <ArrowUpRight className="w-4 h-4" />
              </a>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                Lodgement Standard Plans
              </span>
            </div>
          </div>

          {/* Technical Columns (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 text-xs">
            
            {/* Disciplines */}
            <div className="space-y-4">
              <span className="text-[11px] font-bold text-white uppercase tracking-[0.2em] block pb-2 border-b border-white/15">
                Core Disciplines
              </span>
              <ul className="space-y-2.5 text-gray-400 font-sans">
                <li>
                  <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }} className="hover:text-white hover:underline transition-colors block">
                    Boundary Demarcation
                  </a>
                </li>
                <li>
                  <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }} className="hover:text-white hover:underline transition-colors block">
                    Topographic Baseline
                  </a>
                </li>
                <li>
                  <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }} className="hover:text-white hover:underline transition-colors block">
                    Engineering Setting Out
                  </a>
                </li>
                <li>
                  <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }} className="hover:text-white hover:underline transition-colors block">
                    Estate Land Subdivision
                  </a>
                </li>
                <li>
                  <a href="#equipment" onClick={(e) => { e.preventDefault(); scrollToSection('equipment'); }} className="hover:text-white hover:underline transition-colors block">
                    Precision Field Instruments
                  </a>
                </li>
              </ul>
            </div>

            {/* Field Instruments & Standards */}
            <div className="space-y-4">
              <span className="text-[11px] font-bold text-white uppercase tracking-[0.2em] block pb-2 border-b border-white/15">
                Instrument &amp; Formats
              </span>
              <ul className="space-y-2.5 text-gray-400 font-sans">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white" />
                  <span>GNSS RTK / Static (Sub-cm)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white" />
                  <span>Total Station (2" Angular)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white" />
                  <span>AutoCAD (.DWG / .DXF)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white" />
                  <span>SURCON Lodgement Hardcopies</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white" />
                  <span>GeoTIFF / DEM / DTM Rasters</span>
                </li>
              </ul>
            </div>

            {/* Cross-Studio Navigation */}
            <div className="space-y-4">
              <span className="text-[11px] font-bold text-white uppercase tracking-[0.2em] block pb-2 border-b border-white/15">
                Explore Studio
              </span>
              <ul className="space-y-2.5 text-gray-400 font-sans">
                <li>
                  <Link to="/" className="hover:text-white transition-colors flex items-center justify-between">
                    <span>Main Studio Hub</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                  </Link>
                </li>
                <li>
                  <Link to="/software" className="hover:text-white transition-colors flex items-center justify-between">
                    <span>Software Division</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                  </Link>
                </li>
                <li>
                  <Link to="/drone" className="hover:text-white transition-colors flex items-center justify-between">
                    <span>Lami Aerial</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                  </Link>
                </li>
                <li>
                  <a href={`mailto:${CONTACT.email}`} className="hover:text-white transition-colors flex items-center gap-2 pt-2">
                    <Mail className="w-3.5 h-3.5 text-white" />
                    <span className="truncate">{CONTACT.email}</span>
                  </a>
                </li>
                <li>
                  <a href={`tel:${CONTACT.phoneE164 || '2349064185442'}`} className="hover:text-white transition-colors flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-white" />
                    <span>{CONTACT.phoneDisplay || '+234 906 418 5442'}</span>
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Division Navigation Links */}
        <nav className="flex flex-wrap gap-x-8 gap-y-4 text-[11px] md:text-[12px] tracking-[0.4em] font-bold uppercase border-b border-white/10 pb-8 text-white/80">
          <Link to="/survey" className="text-white hover:text-gray-300 transition-colors">Survey Home</Link>
          <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }} className="hover:text-white transition-colors">Disciplines</a>
          <a href="#equipment" onClick={(e) => { e.preventDefault(); scrollToSection('equipment'); }} className="hover:text-white transition-colors">Instruments</a>
          <a href="#workflow" onClick={(e) => { e.preventDefault(); scrollToSection('workflow'); }} className="hover:text-white transition-colors">Methodology</a>
          <a href="#portfolio" onClick={(e) => { e.preventDefault(); scrollToSection('portfolio'); }} className="hover:text-white transition-colors">Survey Archive</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} className="hover:text-white transition-colors">Request Survey</a>
        </nav>

        {/* Massive Survey Division Headline */}
        <div className="py-6 select-none pointer-events-none w-full text-center">
          <h2
            className="font-black leading-[0.85] uppercase text-white/90 whitespace-nowrap tracking-tight font-sans"
            style={{ fontSize: 'clamp(22px, 8.5vw, 130px)', letterSpacing: '-0.03em' }}
          >
            GEOSURVEY
          </h2>
        </div>

        {/* Bottom Information Row */}
        <div className="flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:justify-between sm:items-center pt-8 border-t border-white/10 text-[10px] md:text-[11px] tracking-[0.2em] font-bold uppercase text-white/70">
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <a
              href="https://www.instagram.com/odibenuah_eugene?igsh=MXMwbzh6emk1eDhucA=="
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={`mailto:${CONTACT.email}`}
              className="hover:text-white transition-colors"
            >
              Cadastral Inquiries
            </a>
          </div>

          <div className="font-normal lowercase tracking-[0.1em] text-gray-400">
            © {displayYear} // GeoSurvey Division · Supervised by SURCON Registered Surveyors · All Rights Reserved
          </div>
        </div>

      </div>
    </footer>
  );
};

export default SurveyFooter;
