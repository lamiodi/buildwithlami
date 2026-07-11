import React, { useState, useEffect, useRef } from 'react';
import { Menu, ArrowRight, ArrowLeft, Plus, Minus } from 'lucide-react';
import { api } from '../../services/api';

const SurveyHomePage = () => {
  // -- Booking form state (fixes dead form) --
  const [booking, setBooking] = useState({
    full_name: '', email: '', phone: '', service: '', location: '', preferred_date: '', notes: '',
  });
  const [bookingStatus, setBookingStatus] = useState('idle'); // idle | submitting | success | error

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingStatus('submitting');
    const res = await api.post('/bookings', { ...booking, division: 'SURVEY' });
    if (res.ok) {
      setBookingStatus('success');
      setBooking({ full_name: '', email: '', phone: '', service: '', location: '', preferred_date: '', notes: '' });
      setTimeout(() => setBookingStatus('idle'), 5000);
    } else {
      setBookingStatus('error');
      setTimeout(() => setBookingStatus('idle'), 5000);
    }
  };

  // -- Data specific to Lami Survey Division --
  const services = [
    {
      title: "Boundary Demarcation",
      description: "Precise property line marking with reinforced concrete monuments, adhering strictly to Nigeria's Land Instruments Preparation Act.",
    },
    {
      title: "Topographic Mapping",
      description: "Detailed 2D and 3D representations of natural and man-made terrain features using RTK GNSS technology.",
    },
    {
      title: "Engineering & Construction",
      description: "Setting out, volume calculation, and as-built surveys tailored to civil engineering and architectural projects.",
    },
    {
      title: "Hydrographic & Bathymetric",
      description: "Mapping of underwater terrain and water bodies utilizing sonar-equipped watercraft and remote sensing.",
    },
    {
      title: "GIS & Cartography",
      description: "Geospatial database management, spatial analysis, and high-end map production for planning.",
    },
    {
      title: "Cadastral Surveying",
      description: "Official surveys for the determination of boundaries of landed properties, including deed preparation.",
    }
  ];

  const projects = [
    { title: "Eko Atlantic Coastal Survey", area: "850 Ha", type: "Hydrographic", location: "Lagos" },
    { title: "Abuja Phase IV Layout", area: "1,200 Ha", type: "Cadastral", location: "FCT" },
    { title: "Dangote Refinery Pipeline", area: "150 KM", type: "Engineering", location: "Lekki" },
    { title: "Lekki-Epe Topography", area: "600 Ha", type: "Topographic", location: "Lagos" },
  ];

  const equipment = [
    { name: "Trimble R12i", spec: "RTK GNSS Receiver" },
    { name: "Leica TS16", spec: "Robotic Total Station" },
    { name: "DJI Matrice 350", spec: "Aerial Mapping Drone" },
    { name: "SonarMite EchoSounder", spec: "Bathymetric Sensor" },
  ];

  const faqs = [
    { q: "Are your surveyors licensed by SURCON?", a: "Yes, all our field operations are led by fully registered and licensed members of the Surveyors Council of Nigeria (SURCON)." },
    { q: "What deliverables can I expect?", a: "We provide digital AutoCAD/GeoTIFFs, physical survey plans, GIS databases, and official deed plans depending on the project scope." },
    { q: "Do you offer nationwide coverage?", a: "Absolutely. We have rapid-deployment teams capable of mobilizing to any of Nigeria's 36 states within 48 hours." },
    { q: "What is your typical accuracy tolerance?", a: "We strictly adhere to sub-centimeter accuracy (±10mm) for static control and high-precision engineering tasks." },
  ];

  // -- State for FAQ accordion --
  const [openFaq, setOpenFaq] = useState(null);
  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // -- Refs for scroll navigation --
  const sectionsRef = useRef({});
  const scrollTo = (id) => {
    const el = sectionsRef.current[id];
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Simple parallax/intersection observer hook for fade-in elements
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
    document.querySelectorAll('.observe').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-[#f2f2f2] text-black font-sans selection:bg-black selection:text-white">
      
      {/* ==== HERO SECTION (3 Column Editorial Layout) ==== */}
      <section className="min-h-screen flex justify-center p-4 md:p-8 pt-4">
        <div className="bg-[#f2f2f2] w-full max-w-[1400px] flex flex-col md:flex-row overflow-hidden border border-gray-200">
          
          {/* Left Column - Typography */}
          <div className="w-full md:w-[35%] flex flex-col justify-between p-8 md:p-12 relative border-b md:border-b-0 md:border-r border-gray-300 min-h-[90vh] md:min-h-[auto]">
            <div className="flex items-center gap-6 mb-16">
              <div className="border-2 border-black w-12 h-12 flex items-center justify-center font-bold text-xl">L.</div>
              <nav className="hidden xl:flex gap-6 text-[10px] uppercase font-bold tracking-widest border-b border-black pb-2">
                <button onClick={() => scrollTo('services')} className="hover:text-gray-500 transition-colors">Services</button>
                <button onClick={() => scrollTo('projects')} className="hover:text-gray-500 transition-colors">Projects</button>
                <button onClick={() => scrollTo('equipment')} className="hover:text-gray-500 transition-colors">Equipment</button>
                <button onClick={() => scrollTo('contact')} className="hover:text-gray-500 transition-colors">Contact</button>
              </nav>
            </div>

            <div className="relative mb-16 flex-1 flex flex-col justify-center">
              <div className="absolute left-[-2rem] top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[10px] font-bold tracking-[0.4em] uppercase text-black">
                SURVEY
              </div>
              <h1 className="text-[5rem] md:text-[6rem] lg:text-[8rem] font-black leading-[0.85] tracking-tighter uppercase">
                PRE<br />CI<br />SION
              </h1>
            </div>

            <div className="mt-auto">
              <p className="text-xs font-semibold leading-loose text-gray-800 max-w-[280px] uppercase tracking-wider mb-12">
                Professional land surveying services across Nigeria. From boundary demarcation to large-scale GIS mapping — we deliver accuracy you can build on.
              </p>
              <div className="flex gap-4 text-[10px] font-bold tracking-widest uppercase">
                <a href="#" className="hover:text-gray-500 transition-colors">Instagram</a>
                <span>/</span>
                <a href="#" className="hover:text-gray-500 transition-colors">LinkedIn</a>
                <span>/</span>
                <a href="#" className="hover:text-gray-500 transition-colors">X / Twitter</a>
              </div>
            </div>
          </div>

          {/* Center Column - Image */}
          <div className="w-full md:w-[35%] bg-[#e6e6e6] flex flex-col border-b md:border-b-0 md:border-r border-gray-300">
            <div className="w-full h-[50vh] md:h-[70%] bg-gray-200 overflow-hidden">
              <img 
                src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Minimalist%20high%20contrast%203d%20render%20of%20a%20modern%20geometric%20building%20with%20a%20red%20door%20and%20a%20single%20red%20tree,%20clean%20white%20background,%20architectural%20visualization&image_size=portrait_4_3" 
                alt="Architectural Survey" 
                className="w-full h-full object-cover grayscale-[20%] contrast-125"
              />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-between flex-1">
              <div className="flex justify-end border-b border-black pb-4 mb-6">
                <button onClick={() => scrollTo('projects')} className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:text-gray-600 transition-colors">
                  View Portfolio <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-gray-800 max-w-[250px]">
                Nine specialised surveying disciplines delivered with modern equipment and SURCON-certified professionals.
              </p>
            </div>
          </div>

          {/* Right Column - Project Details */}
          <div className="w-full md:w-[30%] bg-[#f2f2f2] p-8 md:p-12 flex flex-col relative min-h-[600px]">
            <div className="flex justify-end mb-16">
              <button className="hover:opacity-60 transition-opacity"><Menu className="w-8 h-8" strokeWidth={1.5} /></button>
            </div>
            <div className="flex gap-2 mb-12">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-black flex items-center justify-center"><div className="w-1 h-1 bg-black rounded-full"></div></div>
              <div className="w-2 h-2 rounded-full bg-gray-300 mt-[2px]"></div>
              <div className="w-2 h-2 rounded-full bg-gray-300 mt-[2px]"></div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold uppercase tracking-wider mb-6">Featured Project</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-gray-600 mb-12 max-w-[250px]">
                High-resolution orthomosaic maps and DEMs from drone-captured imagery for precise terrain analysis.
              </p>
              <div className="space-y-4 mb-16 w-full max-w-[300px]">
                <div className="flex justify-between border-b border-gray-300 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Style</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><span className="text-xs">⚙</span> Topographic</span>
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
              <button onClick={() => scrollTo('projects')} className="text-[11px] font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 transition-colors">
                Read More
              </button>
            </div>
            <div className="absolute bottom-8 right-8 w-32 h-32 hidden lg:flex items-center justify-center">
              <svg className="w-full h-full animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100">
                <path id="circlePath" fill="none" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
                <text className="text-[8.5px] font-bold tracking-[0.2em] uppercase">
                  <textPath href="#circlePath" startOffset="0%">• LAMI SURVEY DIVISION • PRECISION AND ACCURACY</textPath>
                </text>
              </svg>
              <div className="absolute font-black text-sm uppercase text-center leading-none">LAMI<br />SURV</div>
            </div>
          </div>
        </div>
      </section>

      {/* ==== SERVICES SECTION ==== */}
      <section 
        ref={(el) => (sectionsRef.current['services'] = el)} 
        className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-gray-300"
      >
        <div className={`observe ${visibleElements.has('services-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="services-header">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— What We Do</p>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
                Serv<br />ices
              </h2>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest leading-relaxed text-gray-700 max-w-md">
              Nine specialised surveying disciplines — each delivered with modern equipment, SURCON-certified professionals, and digital deliverables.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-300 border border-gray-300">
          {services.map((service, idx) => (
            <div 
              key={idx}
              className={`observe ${visibleElements.has(`service-${idx}`) ? 'opacity-100' : 'opacity-0'} transition-all duration-700`}
              data-id={`service-${idx}`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div className="bg-[#f2f2f2] p-10 h-full hover:bg-white transition-colors duration-500 group cursor-pointer">
                <div className="flex justify-between items-start mb-12">
                  <span className="text-4xl font-black text-gray-200 group-hover:text-black transition-colors duration-500">0{idx + 1}</span>
                  <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-black group-hover:translate-x-2 transition-all duration-500" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-4">{service.title}</h3>
                <p className="text-xs font-semibold text-gray-600 leading-relaxed uppercase tracking-wider">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==== PROJECTS SECTION ==== */}
      <section 
        ref={(el) => (sectionsRef.current['projects'] = el)} 
        className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-gray-300"
      >
        <div className={`observe ${visibleElements.has('projects-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="projects-header">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— Selected Works</p>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
                Port<br />folio
              </h2>
            </div>
            <div className="flex gap-4">
              <button className="w-12 h-12 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button className="w-12 h-12 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((proj, idx) => (
            <div 
              key={idx}
              className={`observe ${visibleElements.has(`proj-${idx}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`}
              data-id={`proj-${idx}`}
            >
              <div className="bg-[#e6e6e6] aspect-[4/3] mb-6 relative overflow-hidden group">
                <img 
                  src={`https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Architectural%20minimalist%20topographic%20map%20rendering%20of%20${encodeURIComponent(proj.title)}%20in%20${encodeURIComponent(proj.location)},%20grayscale,%20clean%20lines&image_size=landscape_4_3`}
                  alt={proj.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-white px-3 py-1 text-[9px] font-bold tracking-widest uppercase">
                  {proj.type}
                </div>
              </div>
              <div className="flex justify-between items-start border-b border-gray-300 pb-4">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-2">{proj.title}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{proj.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Area</p>
                  <p className="text-sm font-black tracking-widest uppercase">{proj.area}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==== EQUIPMENT SECTION ==== */}
      <section 
        ref={(el) => (sectionsRef.current['equipment'] = el)} 
        className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-gray-300"
      >
        <div className={`observe ${visibleElements.has('equipment-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="equipment-header">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— The Tools</p>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] mb-16">
            Equip<br />ment
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {equipment.map((eq, idx) => (
            <div 
              key={idx}
              className={`observe ${visibleElements.has(`eq-${idx}`) ? 'opacity-100' : 'opacity-0'} transition-all duration-700`}
              data-id={`eq-${idx}`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <div className="bg-[#e6e6e6] aspect-square mb-4 flex items-center justify-center p-8 group hover:bg-[#1a1a1a] transition-colors duration-500">
                <div className="w-16 h-16 border-2 border-black group-hover:border-white transition-colors duration-500 flex items-center justify-center">
                  <span className="text-2xl font-black group-hover:text-white transition-colors duration-500">⚙</span>
                </div>
              </div>
              <h3 className="text-sm font-black uppercase tracking-tight">{eq.name}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{eq.spec}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==== FAQ SECTION ==== */}
      <section 
        ref={(el) => (sectionsRef.current['faq'] = el)} 
        className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-gray-300"
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 md:gap-24">
          <div className={`observe ${visibleElements.has('faq-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="faq-header">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— Q & A</p>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
              Freq<br />uent<br />Ask
            </h2>
          </div>

          <div className="space-y-0">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className={`observe ${visibleElements.has(`faq-${idx}`) ? 'opacity-100' : 'opacity-0'} border-b border-gray-300 transition-all duration-700`}
                data-id={`faq-${idx}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full py-6 flex justify-between items-center text-left group"
                >
                  <span className="text-lg md:text-xl font-black uppercase tracking-tight pr-4 group-hover:text-gray-600 transition-colors">
                    {faq.q}
                  </span>
                  {openFaq === idx ? (
                    <Minus className="w-5 h-5 shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 shrink-0" />
                  )}
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    openFaq === idx ? 'max-h-48 pb-6' : 'max-h-0'
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-600 leading-relaxed uppercase tracking-wider pr-12">
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
        className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-gray-300"
      >
        <div className="flex flex-col md:flex-row gap-16 items-start">
          <div className="w-full md:w-1/2">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— Get In Touch</p>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] mb-8">
              Start<br />A<br />Project
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest leading-loose text-gray-700 max-w-md mb-12">
              Ready to break ground on your next development? Our team will respond within 24 hours with a detailed scope, timeline, and quote.
            </p>
            
            <div className="space-y-4">
              <div className="border-b border-gray-300 pb-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Email</p>
                <p className="text-sm font-black uppercase tracking-wider">survey@buildwithlami.com</p>
              </div>
              <div className="border-b border-gray-300 pb-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Phone</p>
                <p className="text-sm font-black uppercase tracking-wider">+234 (0) 800 LAND-LAMI</p>
              </div>
              <div className="border-b border-gray-300 pb-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Office</p>
                <p className="text-sm font-black uppercase tracking-wider">Victoria Island, Lagos, NG</p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <form className="space-y-6" onSubmit={handleBooking}>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Full Name *</label>
                <input type="text" required value={booking.full_name} onChange={e => setBooking({ ...booking, full_name: e.target.value })} className="w-full bg-transparent border-b-2 border-black py-3 text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-gray-500 transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Email *</label>
                <input type="email" required value={booking.email} onChange={e => setBooking({ ...booking, email: e.target.value })} className="w-full bg-transparent border-b-2 border-black py-3 text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-gray-500 transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Phone</label>
                <input type="tel" value={booking.phone} onChange={e => setBooking({ ...booking, phone: e.target.value })} className="w-full bg-transparent border-b-2 border-black py-3 text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-gray-500 transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Service Required *</label>
                <select required value={booking.service} onChange={e => setBooking({ ...booking, service: e.target.value })} className="w-full bg-transparent border-b-2 border-black py-3 text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-gray-500 transition-colors appearance-none">
                  <option value="">— Select Service —</option>
                  {services.map((s, i) => <option key={i} value={s.title}>{s.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Project Location</label>
                <input type="text" value={booking.location} onChange={e => setBooking({ ...booking, location: e.target.value })} className="w-full bg-transparent border-b-2 border-black py-3 text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-gray-500 transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Preferred Date</label>
                <input type="date" value={booking.preferred_date} onChange={e => setBooking({ ...booking, preferred_date: e.target.value })} className="w-full bg-transparent border-b-2 border-black py-3 text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-gray-500 transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Project Notes</label>
                <textarea rows="4" value={booking.notes} onChange={e => setBooking({ ...booking, notes: e.target.value })} className="w-full bg-transparent border-b-2 border-black py-3 text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-gray-500 transition-colors resize-none"></textarea>
              </div>
              <button type="submit" disabled={bookingStatus === 'submitting'} className={`px-10 py-4 text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 group transition-colors ${
                bookingStatus === 'success'
                  ? 'bg-green-600 text-white'
                  : bookingStatus === 'error'
                  ? 'bg-red-600 text-white'
                  : bookingStatus === 'submitting'
                  ? 'bg-gray-500 text-white cursor-not-allowed'
                  : 'bg-black text-white hover:bg-accent'
              }`}>
                {bookingStatus === 'success' ? '✓ Request Sent' : bookingStatus === 'error' ? '✗ Try Again' : bookingStatus === 'submitting' ? 'Sending...' : 'Submit Brief'}
                {bookingStatus === 'idle' && <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />}
              </button>
              {bookingStatus === 'error' && (
                <p className="text-xs text-red-600 font-bold uppercase tracking-wider">Something went wrong. Please try again or email us directly.</p>
              )}
              {bookingStatus === 'success' && (
                <p className="text-xs text-green-700 font-bold uppercase tracking-wider">We'll respond within 24 hours.</p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ==== FOOTER ==== */}
      <footer className="border-t border-gray-300 mt-12">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            © 2026 Lami Survey Division // Built with precision
          </p>
          <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-black text-gray-500 transition-colors">Instagram</a>
            <a href="#" className="hover:text-black text-gray-500 transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-black text-gray-500 transition-colors">X</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SurveyHomePage;
