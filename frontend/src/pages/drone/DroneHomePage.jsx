import React, { useState, useEffect, useRef } from 'react';
import { Search, User, ShoppingBag, Menu, Crosshair, Target, Camera, ArrowRight, ArrowUpRight, Plus, Minus, Mail, Phone, MapPin } from 'lucide-react';
import { api } from '../../services/api';

// ── Drone-page fonts ─────────────────────────────────────
// "Michroma" for headings and "Geomini" for body text.
// Both are loaded page-scoped (not globally) so the rest of
// the app doesn't pay for the font weight downloads.
//
//   • useFontsEffect adds the Google Fonts <link> tags and
//     a tiny <style> block with the two CSS classes from
//     the design spec. It tracks every node it injected and
//     removes them on unmount so navigating away cleans up.
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Geomini:wght@200..800&family=Michroma&display=swap';

const useFontsEffect = () => {
    useEffect(() => {
        if (typeof document === 'undefined') return undefined;

        const created = [];
        const add = (node) => { document.head.appendChild(node); created.push(node); };

        // preconnect for the two origins Google Fonts uses
        const preconnect1 = document.createElement('link');
        preconnect1.rel = 'preconnect';
        preconnect1.href = 'https://fonts.googleapis.com';
        add(preconnect1);

        const preconnect2 = document.createElement('link');
        preconnect2.rel = 'preconnect';
        preconnect2.href = 'https://fonts.gstatic.com';
        preconnect2.crossOrigin = 'anonymous';
        add(preconnect2);

        // the actual stylesheet
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = FONT_HREF;
        add(link);

        // local CSS classes per the design spec
        const style = document.createElement('style');
        style.setAttribute('data-drone-fonts', '');
        style.textContent = `
            .drone-heading { font-family: "Michroma", sans-serif; font-weight: 400; font-style: normal; letter-spacing: 0.02em; }
            .drone-body    { font-family: "Geomini", sans-serif;  font-optical-sizing: auto; font-style: normal; }
        `;
        add(style);

        return () => {
            created.forEach((n) => n.parentNode && n.parentNode.removeChild(n));
        };
    }, []);
};

const DroneHomePage = () => {
    useFontsEffect();
  // -- Booking form state (fixes dead form) --
  const [booking, setBooking] = useState({
    full_name: '', email: '', phone: '', service: '', location: '', preferred_date: '', notes: '',
  });
  const [bookingStatus, setBookingStatus] = useState('idle'); // idle | submitting | success | error

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingStatus('submitting');
    const res = await api.post('/bookings', { ...booking, division: 'DRONE' });
    if (res.ok) {
      setBookingStatus('success');
      setBooking({ full_name: '', email: '', phone: '', service: '', location: '', preferred_date: '', notes: '' });
      setTimeout(() => setBookingStatus('idle'), 5000);
    } else {
      setBookingStatus('error');
      setTimeout(() => setBookingStatus('idle'), 5000);
    }
  };

  // -- Data for Lami Drone Division --
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

  const portfolio = [
    { title: "Lekki Coastal Mapping", category: "Surveying", location: "Lagos, Nigeria", year: "2025" },
    { title: "Dangote Refinery Inspection", category: "Inspection", location: "Lekki, Nigeria", year: "2025" },
    { title: "Lulu Island Event Coverage", category: "Photography", location: "Lagos, Nigeria", year: "2024" },
    { title: "Kogi Agricultural Survey", category: "Agriculture", location: "Kogi, Nigeria", year: "2024" },
  ];

  const fleet = [
    { name: "DJI Matrice 350", spec: "RTK / LiDAR" },
    { name: "Autel EVO Lite+", spec: "6K Cinematic" },
    { name: "Parrot Anafi USA", category: "Thermal Sensor" },
    { name: "WingtraOne Gen II", spec: "PPK Mapping" },
  ];

  const stats = [
    { value: "450+", label: "Flights Completed" },
    { value: "12,000", label: "Hectares Mapped" },
    { value: "98%", label: "Client Retention" },
    { value: "1.2cm", label: "RTK Accuracy" },
  ];

  const faqs = [
    { q: "Are your pilots fully licensed?", a: "Yes. Every operation is led by NCAA-certified drone pilots with valid pilot licenses and full operational permits." },
    { q: "What is your maximum flight endurance?", a: "Our fleet includes long-endurance platforms capable of up to 55 minutes per flight, with hot-swappable batteries for zero downtime." },
    { q: "How quickly can you deploy?", a: "We maintain rapid-deployment readiness for missions anywhere in Nigeria, typically launching within 48 hours of confirmation." },
    { q: "Do you provide post-flight deliverables?", a: "Absolutely. We provide fully processed orthomosaics, point clouds, thermal reports, and high-resolution media within tight SLAs." },
  ];

  // -- State Management --
  const [openFaq, setOpenFaq] = useState(null);
  const toggleFaq = (i) => setOpenFaq(openFaq === i ? null : i);

  const sectionsRef = useRef({});
  const scrollTo = (id) => {
    const el = sectionsRef.current[id];
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Simple intersection observer for reveal animations
  const [visibleElements, setVisibleElements] = useState(new Set());
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements((prev) => new Set([...prev, entry.target.dataset.id]));
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.drone-observe').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-[#0a0a0a] min-h-screen p-4 md:p-6 flex flex-col font-sans drone-body">
      {/* Main Card - Card-like container matching the template's look */}
      <div className="flex-1 bg-[#f4f4f4] rounded-[2.5rem] overflow-y-auto overflow-x-hidden flex flex-col relative shadow-2xl scrollbar-hide">
        
        {/* ==== NAVBAR ==== */}
        <header className="flex justify-between items-center px-6 md:px-12 py-8 z-40 relative sticky top-0 bg-[#f4f4f4]/90 backdrop-blur-md">
          <div className="flex items-center gap-12 w-full md:w-1/2">
            <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">
              <Crosshair className="w-6 h-6" /> Dronea<sup className="text-xs -ml-1">&reg;</sup>
            </div>
            <nav className="hidden lg:flex gap-8 text-sm text-gray-500 font-medium">
              <button onClick={() => scrollTo('services')} className="hover:text-black transition-colors">Services</button>
              <button onClick={() => scrollTo('portfolio')} className="hover:text-black transition-colors">Portfolio</button>
              <button onClick={() => scrollTo('fleet')} className="hover:text-black transition-colors">Fleet</button>
              <button onClick={() => scrollTo('contact')} className="hover:text-black transition-colors">Contact</button>
            </nav>
          </div>
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

        {/* ==== HERO SECTION ==== */}
        <section className="relative min-h-[600px] lg:min-h-[800px] flex flex-col shrink-0">
          <div className="flex flex-1 relative z-10">
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-200 -translate-x-1/2 z-0 hidden md:block" />

            {/* Left Pane */}
            <div className="w-full md:w-1/2 flex flex-col justify-end px-6 md:px-16 pb-16 md:pb-32 z-10">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-4">NCAA-Licensed Operations</p>
              <h2 className="drone-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] mb-10 max-w-md text-gray-900 tracking-tight">
                Professional drone services for surveying, inspection, and monitoring across multiple industries.
              </h2>
              <div className="flex flex-wrap items-center gap-6">
                <button onClick={() => scrollTo('contact')} className="bg-black text-white rounded-full py-3 px-6 md:py-4 md:px-8 flex items-center gap-4 hover:bg-gray-800 transition-colors group">
                  <span className="font-medium text-sm">Book a Flight</span>
                  <span className="bg-white text-black rounded-full w-8 h-8 flex items-center justify-center group-hover:translate-x-1 transition-transform"><ArrowRight className="w-4 h-4" /></span>
                </button>
                <button onClick={() => scrollTo('portfolio')} className="font-semibold text-sm underline decoration-2 underline-offset-4 hover:text-gray-500 transition-colors">View Portfolio</button>
              </div>
            </div>

            {/* Right Pane */}
            <div className="w-full md:w-1/2 flex flex-col justify-end px-6 md:px-16 pb-16 md:pb-32 z-10 hidden md:flex">
              <h1 className="drone-heading text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-6 text-gray-900">
                Professional<br />Aerial<br /><span className="text-gray-400">Intelligence</span>
              </h1>
              <p className="text-gray-500 leading-relaxed max-w-md text-sm font-medium">
                Delivering high-resolution mapping, cinematic footage, thermal inspections, and precision LiDAR scanning. Engineered for accuracy, endurance, and mission-ready performance.
              </p>
            </div>
          </div>

          {/* Center Drone Image Area */}
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[90%] md:w-[70%] max-w-5xl pointer-events-none">
            <div className="relative w-full pb-[60%]">
              <img 
                src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20sleek%20black%20stealth%20jet-powered%20military%20drone%20concept%20top-down%20view%20transparent%20background%20high%20detail&image_size=landscape_16_9" 
                alt="Jet-Powered ISR Drone Concept" 
                className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl scale-110" 
              />
              
              {/* Annotations */}
              <div className="absolute top-[10%] left-[5%] flex items-center gap-2 hidden lg:flex">
                <span className="text-[10px] text-gray-500 font-medium w-24 text-right leading-tight">Photogrammetry<br/>Mapping</span>
                <div className="w-16 h-[1px] bg-gray-300"></div>
                <div className="w-2 h-2 rounded-full border-2 border-gray-400 bg-[#f4f4f4]"></div>
              </div>
              <div className="absolute top-[60%] left-[-5%] flex items-center gap-2 hidden lg:flex">
                <span className="text-[10px] text-gray-500 font-medium">Thermal Inspection</span>
                <div className="w-24 h-[1px] bg-gray-300 transform -rotate-12 origin-left"></div>
                <div className="w-2 h-2 rounded-full border-2 border-gray-400 bg-[#f4f4f4] transform -translate-y-2"></div>
              </div>
              <div className="absolute top-[20%] right-[0%] flex items-center gap-2 hidden lg:flex flex-row-reverse">
                <span className="text-[10px] text-gray-500 font-medium w-24 leading-tight">Multispectral<br/>Sensors</span>
                <div className="w-20 h-[1px] bg-gray-300"></div>
                <div className="w-2 h-2 rounded-full border-2 border-gray-400 bg-[#f4f4f4]"></div>
              </div>
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
        </section>

        {/* ==== STATS BANNER ==== */}
        <section className="bg-black text-white px-6 md:px-12 py-12 mx-6 md:mx-12 rounded-[2rem] my-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className={`drone-observe text-center md:text-left ${visibleElements.has(`stat-${idx}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} transition-all duration-700`}
              data-id={`stat-${idx}`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <p className="text-3xl md:text-4xl font-black tracking-tight mb-2">{stat.value}</p>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-400">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* ==== SERVICES SECTION ==== */}
        <section 
          ref={(el) => (sectionsRef.current['services'] = el)} 
          className="bg-white px-6 md:px-12 py-24 z-30 relative rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.03)] shrink-0"
        >
          <div className="max-w-7xl mx-auto">
            <div className={`drone-observe flex flex-col md:flex-row justify-between items-end mb-16 gap-8 ${visibleElements.has('services-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="services-header">
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— Capabilities</p>
                <h2 className="drone-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 mb-6 leading-[0.95]">
                  Drone<br/>Services
                </h2>
                <p className="text-gray-500 max-w-xl text-base leading-relaxed font-medium">
                  Nine specialised drone service lines — from photogrammetry mapping to thermal inspection — all delivered by NCAA-licensed pilots.
                </p>
              </div>
              <button onClick={() => scrollTo('contact')} className="bg-black text-white rounded-full py-4 px-8 text-sm font-bold tracking-wide hover:bg-accent transition-colors shadow-lg shadow-black/20">
                Book a Flight
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <div 
                  key={index} 
                  className={`drone-observe bg-[#f4f4f4] rounded-[2rem] p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group border border-transparent hover:border-gray-200 ${visibleElements.has(`service-${index}`) ? 'opacity-100' : 'opacity-0'}`}
                  data-id={`service-${index}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-start mb-12">
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-300 origin-bottom-left">{service.icon}</span>
                    <span className="text-gray-300 font-bold font-mono text-xl">{service.number}</span>
                  </div>
                  <h3 className="drone-heading text-xl font-black text-gray-900 mb-3 tracking-tight">{service.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed font-medium">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==== PORTFOLIO SECTION ==== */}
        <section 
          ref={(el) => (sectionsRef.current['portfolio'] = el)} 
          className="px-6 md:px-12 py-24 max-w-7xl mx-auto w-full shrink-0"
        >
          <div className={`drone-observe flex flex-col md:flex-row justify-between items-end mb-16 gap-6 ${visibleElements.has('portfolio-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="portfolio-header">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— Selected Missions</p>
              <h2 className="drone-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 leading-[0.95]">
                Flight<br/>Portfolio
              </h2>
            </div>
            <button onClick={() => scrollTo('contact')} className="text-sm font-bold underline decoration-2 underline-offset-4 hover:text-gray-500 transition-colors">View All Projects</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolio.map((proj, idx) => (
              <div 
                key={idx}
                className={`drone-observe group relative overflow-hidden bg-white rounded-[2rem] border border-gray-100 hover:shadow-2xl transition-all duration-500 ${visibleElements.has(`proj-${idx}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                data-id={`proj-${idx}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="relative h-72 overflow-hidden rounded-t-[2rem]">
                  <img 
                    src={`https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Aerial%20drone%20shot%20of%20${encodeURIComponent(proj.title)},%20${encodeURIComponent(proj.category)},%20photorealistic,%20cinematic%20lighting&image_size=landscape_4_3`}
                    alt={proj.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 left-4 bg-white text-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full">
                    {proj.category}
                  </div>
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white w-10 h-10 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="p-6 flex justify-between items-start">
                  <div>
                    <h3 className="drone-heading text-lg font-black text-gray-900 mb-1">{proj.title}</h3>
                    <p className="text-xs text-gray-500 font-medium">{proj.location}</p>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{proj.year}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==== FLEET / EQUIPMENT ==== */}
        <section 
          ref={(el) => (sectionsRef.current['fleet'] = el)} 
          className="px-6 md:px-12 py-24 max-w-7xl mx-auto w-full shrink-0"
        >
          <div className={`drone-observe mb-16 ${visibleElements.has('fleet-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="fleet-header">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— Hardware</p>
            <h2 className="drone-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 leading-[0.95]">
              The<br/>Fleet
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {fleet.map((eq, idx) => (
              <div 
                key={idx}
                className={`drone-observe text-center group ${visibleElements.has(`fleet-${idx}`) ? 'opacity-100' : 'opacity-0'} transition-all duration-700`}
                data-id={`fleet-${idx}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="aspect-square bg-white rounded-3xl mb-4 border border-gray-100 group-hover:border-black transition-colors flex items-center justify-center overflow-hidden">
                  <img 
                    src={`https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Professional%20${encodeURIComponent(eq.name)}%20drone%20product%20shot%20white%20background%20studio%20lighting&image_size=square`}
                    alt={eq.name}
                    className="w-full h-full object-cover p-4 group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="drone-heading text-xs font-black uppercase tracking-wider text-gray-900">{eq.name}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">{eq.spec || eq.category}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ==== FAQ SECTION ==== */}
        <section 
          ref={(el) => (sectionsRef.current['faq'] = el)} 
          className="bg-white px-6 md:px-12 py-24 shrink-0"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
            <div className={`drone-observe ${visibleElements.has('faq-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="faq-header">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— Questions</p>
              <h2 className="drone-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 leading-[0.95]">
                Frequent<br/>Asked
              </h2>
            </div>

            <div className="space-y-0">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx} 
                  className={`drone-observe border-b border-gray-200 transition-all duration-700 ${visibleElements.has(`faq-${idx}`) ? 'opacity-100' : 'opacity-0'}`}
                  data-id={`faq-${idx}`}
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <button 
                    onClick={() => toggleFaq(idx)}
                    className="w-full py-6 flex justify-between items-center text-left group"
                  >
                    <span className="text-lg font-bold text-gray-900 group-hover:text-accent transition-colors pr-4">
                      {faq.q}
                    </span>
                    {openFaq === idx ? (
                      <Minus className="w-5 h-5 text-accent shrink-0" />
                    ) : (
                      <Plus className="w-5 h-5 text-accent shrink-0" />
                    )}
                  </button>
                  <div 
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      openFaq === idx ? 'max-h-48 pb-6' : 'max-h-0'
                    }`}
                  >
                    <p className="text-gray-600 leading-relaxed pr-12">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==== CONTACT / CTA SECTION ==== */}
        <section 
          ref={(el) => (sectionsRef.current['contact'] = el)} 
          className="px-6 md:px-12 py-24 max-w-7xl mx-auto w-full shrink-0"
        >
          <div className="bg-black text-white rounded-[2.5rem] p-8 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-4">— Get In Touch</p>
              <h2 className="drone-heading text-4xl md:text-5xl font-black tracking-tighter leading-[0.95] mb-6">
                Ready For<br/>Takeoff?
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8 max-w-md">
                Tell us about your aerial project and we'll provide a detailed flight plan and quote within 24 hours.
              </p>
              
              <div className="space-y-4">
                <a href="mailto:drone@buildwithlami.com" className="flex items-center gap-3 text-sm hover:text-accent transition-colors">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center"><Mail className="w-4 h-4" /></div>
                  <span>drone@buildwithlami.com</span>
                </a>
                <a href="tel:+234800000000" className="flex items-center gap-3 text-sm hover:text-accent transition-colors">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center"><Phone className="w-4 h-4" /></div>
                  <span>+234 (0) 800 DRONE-LAMI</span>
                </a>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center"><MapPin className="w-4 h-4" /></div>
                  <span>Victoria Island, Lagos, NG</span>
                </div>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleBooking}>
              <input type="text" placeholder="Full name *" required value={booking.full_name} onChange={e => setBooking({ ...booking, full_name: e.target.value })} className="w-full bg-transparent border-b-2 border-white/20 py-3 text-white placeholder-white/40 focus:outline-none focus:border-accent transition-colors" />
              <input type="email" placeholder="Email address *" required value={booking.email} onChange={e => setBooking({ ...booking, email: e.target.value })} className="w-full bg-transparent border-b-2 border-white/20 py-3 text-white placeholder-white/40 focus:outline-none focus:border-accent transition-colors" />
              <input type="tel" placeholder="Phone" value={booking.phone} onChange={e => setBooking({ ...booking, phone: e.target.value })} className="w-full bg-transparent border-b-2 border-white/20 py-3 text-white placeholder-white/40 focus:outline-none focus:border-accent transition-colors" />
              <select required value={booking.service} onChange={e => setBooking({ ...booking, service: e.target.value })} className="w-full bg-transparent border-b-2 border-white/20 py-3 text-white focus:outline-none focus:border-accent transition-colors appearance-none">
                <option value="" className="text-gray-900">— Select Service —</option>
                {services.map((s, i) => <option key={i} value={s.title} className="text-gray-900">{s.title}</option>)}
              </select>
              <input type="text" placeholder="Project location" value={booking.location} onChange={e => setBooking({ ...booking, location: e.target.value })} className="w-full bg-transparent border-b-2 border-white/20 py-3 text-white placeholder-white/40 focus:outline-none focus:border-accent transition-colors" />
              <input type="date" placeholder="Preferred date" value={booking.preferred_date} onChange={e => setBooking({ ...booking, preferred_date: e.target.value })} className="w-full bg-transparent border-b-2 border-white/20 py-3 text-white placeholder-white/40 focus:outline-none focus:border-accent transition-colors" />
              <textarea rows="3" placeholder="Tell us about your mission..." value={booking.notes} onChange={e => setBooking({ ...booking, notes: e.target.value })} className="w-full bg-transparent border-b-2 border-white/20 py-3 text-white placeholder-white/40 focus:outline-none focus:border-accent transition-colors resize-none"></textarea>
              <button type="submit" disabled={bookingStatus === 'submitting'} className={`w-full py-4 text-sm font-bold uppercase tracking-[0.2em] rounded-full flex items-center justify-center gap-3 group transition-colors ${
                bookingStatus === 'success'
                  ? 'bg-green-500 text-white'
                  : bookingStatus === 'error'
                  ? 'bg-red-500 text-white'
                  : bookingStatus === 'submitting'
                  ? 'bg-white/20 text-white/50 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-accent hover:text-white'
              }`}>
                {bookingStatus === 'success' ? '✓ Request Sent — We\'ll respond in 24h' : bookingStatus === 'error' ? '✗ Try Again' : bookingStatus === 'submitting' ? 'Sending...' : 'Submit Request'}
                {bookingStatus === 'idle' && <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />}
              </button>
              {bookingStatus === 'error' && (
                <p className="text-xs text-red-300 font-medium text-center">Something went wrong. Please try again or email us directly.</p>
              )}
            </form>
          </div>
        </section>
      </div>

      {/* ==== FOOTER ==== */}
      <footer className="mt-6 flex flex-col lg:flex-row justify-between items-center text-gray-500 text-xs px-2 md:px-8 gap-6 pb-2 shrink-0">
        <div className="font-medium tracking-wide">
          © 2026 Lami Drone Division // Precision from above
        </div>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 items-center font-bold uppercase tracking-widest text-[10px]">
          <a href="#" className="hover:text-gray-300 transition-colors">Instagram</a>
          <a href="#" className="hover:text-gray-300 transition-colors">LinkedIn</a>
          <a href="#" className="hover:text-gray-300 transition-colors">X</a>
          <a href="#" className="hover:text-gray-300 transition-colors">YouTube</a>
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
