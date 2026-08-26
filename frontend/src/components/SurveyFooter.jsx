import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Compass, ShieldCheck, Mail, Phone, MapPin, Download } from 'lucide-react';
import { CONTACT } from '../config/contact';

const SurveyFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white border-t border-gray-800 font-sans">
      {/* Upper Main Footer Grid */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand & Professional Supervision Statement (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="border border-white px-2.5 py-1 text-xs font-black tracking-wider uppercase bg-white text-black">
                GEOSURVEY
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                Land &amp; Engineering Division
              </span>
            </div>
            
            <p className="text-xs text-gray-400 leading-relaxed font-normal max-w-sm">
              Professional land and engineering surveying practice led by <span className="text-white font-semibold">Eugene Odibenuah</span>. All statutory cadastral plans, lodgement documentation, and title survey documentation are prepared under the direct supervision of SURCON-registered surveyors.
            </p>

            <div className="pt-2 flex items-center gap-2 text-[11px] font-semibold text-gray-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Supervised by SURCON-Registered Surveyors</span>
            </div>
          </div>

          {/* Quick Section Anchors */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">Navigation</h4>
            <ul className="space-y-2 text-xs font-semibold uppercase tracking-wider text-gray-300">
              <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
              <li><a href="#workflow" className="hover:text-white transition-colors">Methodology</a></li>
              <li><a href="#projects" className="hover:text-white transition-colors">Portfolio</a></li>
              <li><a href="#equipment" className="hover:text-white transition-colors">Equipment</a></li>
              <li><a href="#profile" className="hover:text-white transition-colors">Profile</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Request Survey</a></li>
            </ul>
          </div>

          {/* Core Disciplines */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">Disciplines</h4>
            <ul className="space-y-2 text-xs font-semibold text-gray-300">
              <li>Boundary &amp; Cadastral Demarcation</li>
              <li>Topographic Baseline Surveys</li>
              <li>Construction Setting Out</li>
              <li>Estate Layout &amp; Subdivision</li>
              <li>Digital Terrain Elevation Models</li>
            </ul>
          </div>

          {/* Studio & Sister Divisions */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">Practice Ecosystem</h4>
            <ul className="space-y-2 text-xs font-semibold text-gray-300">
              <li>
                <Link to="/drone" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  Lami Aerial (Drone Division) <ArrowUpRight className="w-3 h-3 text-gray-400" />
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  BuildWithLami (Parent Studio) <ArrowUpRight className="w-3 h-3 text-gray-400" />
                </Link>
              </li>
              <li className="pt-2">
                <a
                  href="/eugene-odibenuah-land-surveyor-cv.pdf"
                  download="Eugene-Odibenuah-Surveyor-CV.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Profile (CV)</span>
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Sub-footer */}
      <div className="border-t border-gray-900 bg-[#070707] py-6 px-6 md:px-12 text-[11px] text-gray-500">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-mono">
            &copy; {currentYear} GeoSurvey // BuildWithLami Surveying Division. All rights reserved.
          </p>
          <p className="font-mono text-[10px] text-gray-400">
            Lagos Base // Deployments Nationwide Across Nigeria
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SurveyFooter;
