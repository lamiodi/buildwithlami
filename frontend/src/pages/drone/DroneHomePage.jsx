import React from 'react';
import { Search, User, ShoppingBag, Menu, Crosshair, Target, Camera, ArrowRight } from 'lucide-react';

const DroneHomePage = () => {
  const services = [
    { icon: '🛩️', number: '01', title: 'Aerial Surveying & Mapping', description: 'High-resolution orthomosaic maps and DEMs from drone-captured imagery using photogrammetry.' },
    { icon: '📸', number: '02', title: 'Aerial Photography & Video', description: 'Cinematic 4K aerial footage and high-resolution stills for real estate, events, and marketing.' },
    { icon: '🔍', number: '03', title: 'Infrastructure Inspection', description: 'Close-range visual and thermal inspection of buildings, towers, bridges, and pipelines.' },
    { icon: '📡', number: '04', title: 'LiDAR Scanning', description: 'Airborne LiDAR point cloud capture for vegetation analysis, terrain modelling, and corridor mapping.' },
    { icon: '🏢', number: '05', title: 'Construction Monitoring', description: 'Regular progress documentation, volumetric analysis, and site comparison over time.' },
    { icon: '🌾', number: '06', title: 'Precision Agriculture', description: 'NDVI crop health mapping, spray planning, and yield estimation using multispectral sensors.' },
    { icon: '🌿', number: '07', title: 'Environmental Monitoring', description: 'Erosion tracking, flood modelling, and environmental impact assessment from aerial data.' },
    { icon: '🛡️', number: '08', title: 'Security & Surveillance', description: 'Perimeter monitoring, crowd management, and real-time situational awareness for events and facilities.' },
    { icon: '🏛️', number: '09', title: '3D Modelling & Visualisation', description: 'Photorealistic 3D models of structures and terrain for planning, analysis, and virtual tours.' },
  ];

  return (
    <div className="bg-[#0a0a0a] min-h-screen p-4 md:p-6 flex flex-col font-sans">
      {/* Main Card */}
      <div className="flex-1 bg-[#f4f4f4] rounded-[2.5rem] overflow-y-auto overflow-x-hidden flex flex-col relative shadow-2xl scrollbar-hide">
        
        {/* Navbar inside the card */}
        <header className="flex justify-between items-center px-6 md:px-12 py-8 z-40 relative sticky top-0 bg-[#f4f4f4]/90 backdrop-blur-md">
          {/* Left side navbar */}
          <div className="flex items-center gap-12 w-full md:w-1/2">
            <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">
              <Crosshair className="w-6 h-6" /> Dronea<sup className="text-xs -ml-1">&reg;</sup>
            </div>
            <nav className="hidden lg:flex gap-8 text-sm text-gray-500 font-medium">
              <a href="#" className="hover:text-black transition-colors">Services</a>
              <a href="#" className="hover:text-black transition-colors">Portfolio</a>
              <a href="#" className="hover:text-black transition-colors">Equipment</a>
              <a href="#" className="hover:text-black transition-colors">Support</a>
            </nav>
          </div>

          {/* Right side navbar */}
          <div className="flex items-center gap-3 w-auto md:w-1/2 justify-end">
            <div className="relative hidden md:block mr-2">
              <input 
                type="text" 
                placeholder="Search" 
                className="bg-white rounded-full py-2.5 pl-5 pr-10 text-sm w-48 lg:w-64 focus:outline-none shadow-sm" 
              />
              <Search className="absolute right-4 top-2.5 w-4 h-4 text-gray-400" />
            </div>
            <button className="p-3 bg-white rounded-full hover:bg-gray-50 transition-colors shadow-sm"><User className="w-4 h-4" /></button>
            <button className="p-3 bg-white rounded-full hover:bg-gray-50 transition-colors shadow-sm"><ShoppingBag className="w-4 h-4" /></button>
            <button className="p-3 bg-white rounded-full hover:bg-gray-50 transition-colors shadow-sm"><Menu className="w-4 h-4" /></button>
          </div>
        </header>

        {/* Hero Section */}
        <div className="relative min-h-[600px] lg:min-h-[800px] flex flex-col shrink-0">
          {/* Split Content Area */}
          <div className="flex flex-1 relative z-10">
            {/* Center line separator */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-200 -translate-x-1/2 z-0 hidden md:block" />

            {/* Left Pane */}
            <div className="w-full md:w-1/2 flex flex-col justify-end px-6 md:px-16 pb-16 md:pb-32 z-10">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-4">NCAA-Licensed Operations</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] mb-10 max-w-md text-gray-900 tracking-tight">
                Professional drone services for surveying, inspection, and monitoring across multiple industries.
              </h2>
              <div className="flex flex-wrap items-center gap-6">
                <button className="bg-black text-white rounded-full py-3 px-6 md:py-4 md:px-8 flex items-center gap-4 hover:bg-gray-800 transition-colors group">
                  <span className="font-medium text-sm">Explore Services</span>
                  <span className="bg-white text-black rounded-full w-8 h-8 flex items-center justify-center group-hover:translate-x-1 transition-transform"><ArrowRight className="w-4 h-4" /></span>
                </button>
                <a href="#" className="font-semibold text-sm underline decoration-2 underline-offset-4 hover:text-gray-500 transition-colors">See Demo</a>
              </div>
            </div>

            {/* Right Pane */}
            <div className="w-full md:w-1/2 flex flex-col justify-end px-6 md:px-16 pb-16 md:pb-32 z-10 hidden md:flex">
              <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-6 text-gray-900">
                Professional<br />Aerial<br /><span className="text-gray-400">Intelligence</span>
              </h1>
              <p className="text-gray-500 leading-relaxed max-w-md text-sm font-medium">
                Delivering high-resolution mapping, cinematic footage, thermal inspections, and precision LiDAR scanning. Engineered for accuracy, endurance, and mission-ready performance.
              </p>
            </div>
          </div>

          {/* Center Drone Image Area - Positioned absolutely to overlap both columns */}
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[90%] md:w-[70%] max-w-5xl pointer-events-none">
            <div className="relative w-full pb-[60%]">
              <img 
                src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20sleek%20black%20stealth%20jet-powered%20military%20drone%20concept%20top-down%20view%20transparent%20background%20high%20detail&image_size=landscape_16_9" 
                alt="Jet-Powered ISR Drone Concept" 
                className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl scale-110" 
              />
              
              {/* Annotations */}
              {/* Top Left */}
              <div className="absolute top-[10%] left-[5%] flex items-center gap-2 hidden lg:flex">
                <span className="text-[10px] text-gray-500 font-medium w-24 text-right leading-tight">Photogrammetry<br/>Mapping</span>
                <div className="w-16 h-[1px] bg-gray-300"></div>
                <div className="w-2 h-2 rounded-full border-2 border-gray-400 bg-[#f4f4f4]"></div>
              </div>
              
              {/* Bottom Left */}
              <div className="absolute top-[60%] left-[-5%] flex items-center gap-2 hidden lg:flex">
                <span className="text-[10px] text-gray-500 font-medium">Thermal Inspection</span>
                <div className="w-24 h-[1px] bg-gray-300 transform -rotate-12 origin-left"></div>
                <div className="w-2 h-2 rounded-full border-2 border-gray-400 bg-[#f4f4f4] transform -translate-y-2"></div>
              </div>

              {/* Top Right */}
              <div className="absolute top-[20%] right-[0%] flex items-center gap-2 hidden lg:flex flex-row-reverse">
                <span className="text-[10px] text-gray-500 font-medium w-24 leading-tight">Multispectral<br/>Sensors</span>
                <div className="w-20 h-[1px] bg-gray-300"></div>
                <div className="w-2 h-2 rounded-full border-2 border-gray-400 bg-[#f4f4f4]"></div>
              </div>

              {/* Bottom Right */}
              <div className="absolute top-[50%] right-[-10%] flex items-center gap-2 hidden lg:flex flex-row-reverse">
                <span className="text-[10px] text-gray-500 font-medium">LiDAR Scanning</span>
                <div className="w-32 h-[1px] bg-gray-300 transform rotate-12 origin-right"></div>
                <div className="w-2 h-2 rounded-full border-2 border-gray-400 bg-[#f4f4f4] transform translate-y-3"></div>
              </div>
            </div>
          </div>

          {/* Right Floating Socials */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30 hidden md:flex pointer-events-auto">
            <button className="p-2.5 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors border border-gray-100"><Target className="w-4 h-4 text-gray-600" /></button>
            <button className="p-2.5 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors border border-gray-100"><Crosshair className="w-4 h-4 text-gray-600" /></button>
            <button className="p-2.5 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors border border-gray-100"><Camera className="w-4 h-4 text-gray-600" /></button>
          </div>

          {/* Thumbnails below the drone */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-30 hidden md:flex pointer-events-auto">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center p-3 cursor-pointer hover:shadow-md transition-shadow">
              <img src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=small%20black%20stealth%20drone%20top%20view%20transparent%20background&image_size=square" alt="Thumb 1" className="w-full h-full object-contain" />
            </div>
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center p-3 cursor-pointer hover:shadow-md transition-shadow">
              <img src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=small%20black%20stealth%20drone%20angled%20view%20transparent%20background&image_size=square" alt="Thumb 2" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="bg-white px-6 md:px-12 py-24 z-30 relative rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.03)] shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 mb-6">Drone Services</h2>
                <p className="text-gray-500 max-w-xl text-base leading-relaxed font-medium">
                  Nine specialised drone service lines — from photogrammetry mapping to thermal inspection — all delivered by NCAA-licensed pilots.
                </p>
              </div>
              <button className="bg-black text-white rounded-full py-4 px-8 text-sm font-bold tracking-wide hover:bg-gray-800 transition-colors shadow-lg shadow-black/20">
                Book a Flight
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <div key={index} className="bg-[#f4f4f4] rounded-[2rem] p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border border-transparent hover:border-gray-200">
                  <div className="flex justify-between items-start mb-12">
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-300 origin-bottom-left">{service.icon}</span>
                    <span className="text-gray-300 font-bold font-mono text-xl">{service.number}</span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-3 tracking-tight">{service.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed font-medium">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Footer outside the card */}
      <footer className="mt-6 flex flex-col lg:flex-row justify-between items-center text-gray-500 text-xs px-2 md:px-8 gap-6 pb-2 shrink-0">
        <div className="font-medium tracking-wide">
          Trusted By 100+ Companies:
        </div>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 items-center opacity-60 font-bold uppercase tracking-widest text-[10px]">
          <span className="flex items-center gap-1"><span className="text-lg">☁</span> GitHub</span>
          <span>Basecamp</span>
          <span>attentive</span>
          <span>gumroad</span>
          <span>classpass</span>
          <span>TESLA</span>
          <span>Medium</span>
          <span>SPACEX</span>
          <span>Uber</span>
          <span>descript</span>
        </div>
      </footer>

      {/* Hide scrollbar styles */}
      <style dangerouslySetInlineStyle={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default DroneHomePage;
