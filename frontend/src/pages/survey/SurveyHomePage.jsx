import React from 'react';
import { Menu } from 'lucide-react';

const SurveyHomePage = () => {
  return (
    <div className="bg-[#f2f2f2] min-h-screen text-black font-sans selection:bg-black selection:text-white flex justify-center p-4 md:p-8">
      
      {/* Main Container - matching the template's card-like appearance */}
      <div className="bg-[#f2f2f2] w-full max-w-[1400px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-gray-200">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="w-full md:w-[35%] flex flex-col justify-between p-8 md:p-12 relative border-b md:border-b-0 md:border-r border-gray-300">
          
          {/* Header Area */}
          <div className="flex items-center gap-6 mb-16">
            <div className="border-2 border-black w-12 h-12 flex items-center justify-center font-bold text-xl">
              L.
            </div>
            <nav className="hidden xl:flex gap-6 text-[10px] uppercase font-bold tracking-widest border-b border-black pb-2">
              <a href="#services" className="hover:text-gray-500 transition-colors">Services</a>
              <a href="#projects" className="hover:text-gray-500 transition-colors">Projects</a>
              <a href="#equipment" className="hover:text-gray-500 transition-colors">Equipment</a>
              <a href="#contact" className="hover:text-gray-500 transition-colors">Contact</a>
            </nav>
          </div>

          {/* Huge Typography Area */}
          <div className="relative mb-16 flex-1 flex flex-col justify-center">
            {/* Rotated vertical text */}
            <div className="absolute left-[-2rem] top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[10px] font-bold tracking-[0.4em] uppercase text-black">
              SURVEY
            </div>
            
            <h1 className="text-[5rem] md:text-[6rem] lg:text-[8rem] font-black leading-[0.85] tracking-tighter uppercase">
              PRE<br />
              CI<br />
              SION
            </h1>
          </div>

          {/* Bottom Text Area */}
          <div className="mt-auto">
            <p className="text-xs font-semibold leading-loose text-gray-800 max-w-[280px] uppercase tracking-wider mb-12">
              Professional land surveying services across Nigeria. From boundary demarcation to large-scale GIS mapping — we deliver accuracy you can build on.
            </p>
            
            <div className="flex gap-4 text-[10px] font-bold tracking-widest uppercase">
              <a href="#" className="hover:text-gray-500 transition-colors">Instagram</a>
              <span>/</span>
              <a href="#" className="hover:text-gray-500 transition-colors">Facebook</a>
              <span>/</span>
              <a href="#" className="hover:text-gray-500 transition-colors">Telegram</a>
            </div>
          </div>
        </div>

        {/* ================= CENTER COLUMN ================= */}
        <div className="w-full md:w-[35%] bg-[#e6e6e6] flex flex-col border-b md:border-b-0 md:border-r border-gray-300">
          
          {/* Image Area - Bleeds to top */}
          <div className="w-full h-[50vh] md:h-[70%] bg-gray-200 overflow-hidden">
            <img 
              src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Minimalist%20high%20contrast%203d%20render%20of%20a%20modern%20geometric%20building%20with%20a%20red%20door%20and%20a%20single%20red%20tree,%20clean%20white%20background,%20architectural%20visualization&image_size=portrait_4_3" 
              alt="Architectural Survey" 
              className="w-full h-full object-cover grayscale-[20%] contrast-125"
            />
          </div>

          {/* Bottom Area */}
          <div className="p-8 md:p-12 flex flex-col justify-between flex-1">
            <div className="flex justify-end border-b border-black pb-4 mb-6">
              <a href="#projects" className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:text-gray-600 transition-colors">
                View Portfolio <span>→</span>
              </a>
            </div>
            
            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-gray-800 max-w-[250px]">
              Nine specialised surveying disciplines delivered with modern equipment and SURCON-certified professionals.
            </p>
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="w-full md:w-[30%] bg-[#f2f2f2] p-8 md:p-12 flex flex-col relative">
          
          {/* Top Menu Icon */}
          <div className="flex justify-end mb-16">
            <button className="hover:opacity-60 transition-opacity">
              <Menu className="w-8 h-8" strokeWidth={1.5} />
            </button>
          </div>

          {/* Pagination dots */}
          <div className="flex gap-2 mb-12">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-black flex items-center justify-center">
              <div className="w-1 h-1 bg-black rounded-full"></div>
            </div>
            <div className="w-2 h-2 rounded-full bg-gray-300 mt-[2px]"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300 mt-[2px]"></div>
          </div>

          {/* Project Details */}
          <div className="flex-1">
            <h2 className="text-xl font-bold uppercase tracking-wider mb-6">Featured Project</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-gray-600 mb-12 max-w-[250px]">
              High-resolution orthomosaic maps and DEMs from drone-captured imagery for precise terrain analysis.
            </p>

            {/* Data Table */}
            <div className="space-y-4 mb-16 w-full max-w-[300px]">
              <div className="flex justify-between border-b border-gray-300 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest">Style</span>
                <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="text-xs">⚙</span> Topographic
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-300 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest">Type</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Engineering.</span>
              </div>
              <div className="flex justify-between border-b border-gray-300 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest">Area</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">1,200 HA</span>
              </div>
              <div className="flex justify-between border-b border-gray-300 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest">Accuracy</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">±10mm</span>
              </div>
              <div className="flex justify-between border-b border-gray-300 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest">Location</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Lagos</span>
              </div>
            </div>

            <a href="#projects" className="text-[11px] font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 transition-colors">
              Read More
            </a>
          </div>

          {/* Circular Text Badge */}
          <div className="absolute bottom-8 right-8 w-32 h-32 hidden lg:flex items-center justify-center">
            <svg className="w-full h-full animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100">
              <path id="circlePath" fill="none" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
              <text className="text-[8.5px] font-bold tracking-[0.2em] uppercase">
                <textPath href="#circlePath" startOffset="0%">
                  • LAMI SURVEY DIVISION • PRECISION AND ACCURACY
                </textPath>
              </text>
            </svg>
            <div className="absolute font-black text-sm uppercase text-center leading-none">
              LAMI<br />SURV
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SurveyHomePage;
