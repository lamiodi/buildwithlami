import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Crosshair, ArrowRight, ArrowUpRight, Plus, Minus, Mail, Phone, MapPin, Download, Map as MapIcon, Building2, Home, Mountain, Calendar, TreePine, Landmark, Plane } from 'lucide-react';
import { api } from '../../services/api';
import { dronePlaceholder, equipmentPlaceholder } from '../../utils/placeholders';
import { validateBooking, validateField } from '../../utils/formValidation';

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
  // -- Booking form state --
  const [booking, setBooking] = useState({
    full_name: '', email: '', phone: '', service: '', location: '', preferred_date: '', notes: '',
  });
  const [bookingStatus, setBookingStatus] = useState('idle'); // idle | submitting | success | error
  const [bookingErrors, setBookingErrors] = useState({});

  const handleBookingFieldChange = (field, value) => {
    setBooking({ ...booking, [field]: value });
    if (bookingErrors[field]) {
      setBookingErrors({ ...bookingErrors, [field]: '' });
    }
  };

  const handleBookingFieldBlur = (field) => {
    const error = validateField(field, booking[field]);
    setBookingErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    // Client-side validation - COMPLETE AND RIGHTEOUS!
    const validation = validateBooking(booking);
    if (!validation.valid) {
      // Show ALL validation errors
      setBookingErrors(validation.errors);
      
      // Focus first field with error
      const firstError = Object.keys(validation.errors)[0];
      const el = document.querySelector(`[name="booking_${firstError}"]`);
      if (el) el.focus();
      
      return; // CRITICAL: Don't submit API call when form is invalid
    }

    // Clear all errors before API call
    setBookingErrors({});
    setBookingStatus('submitting');
    
    try {
      const res = await api.post('/bookings', { ...booking, division: 'DRONE' });
      if (res.ok) {
        setBookingStatus('success');
        // RESET FORM ON SUCCESS ONLY
        setBooking({ full_name: '', email: '', phone: '', service: '', location: '', preferred_date: '', notes: '' });
        setTimeout(() => setBookingStatus('idle'), 5000);
      } else {
        setBookingStatus('error');
        console.error('Drone booking API error:', res.error || 'Unknown error');
        setTimeout(() => setBookingStatus('idle'), 5000);
      }
    } catch (err) {
      // HANDLE NETWORK/UNKNOWN ERRORS
      setBookingStatus('error');
      console.error('Drone booking network error:', err);
      setTimeout(() => setBookingStatus('idle'), 5000);
    }
  };

  // -- Services actually deliverable with DJI Mini 4 Pro & Mini 4K --
  // No LiDAR, no thermal, no multispectral — only what a small
  // prosumer aircraft can really do in the air.
  const services = [
    { icon: '🛩️', number: '01', title: 'Aerial Photography',         description: 'High-resolution stills from DJI Mini 4 Pro (48MP) — perfect for property listings, marketing, and editorial use.' },
    { icon: '🎬', number: '02', title: 'Cinematic 4K Video',          description: 'Smooth, stabilized 4K/60fps aerial video with D-Log M for professional color grading.' },
    { icon: '🏡', number: '03', title: 'Real Estate Shoots',          description: 'Hero exteriors, estate flyovers, and twilight shots that make listings stand out online.' },
    { icon: '🏗️', number: '04', title: 'Construction Progress',       description: 'Recurring flyovers that document site progress, milestones, and investor updates over time.' },
    { icon: '🏨', number: '05', title: 'Hotel & Resort Promotion',    description: 'Cinematic resort tours, pool-to-beach reveals, and amenity showcases for hospitality brands.' },
    { icon: '🗺️', number: '06', title: 'Drone Mapping (Photogrammetry)', description: 'Orthomosaic maps, digital surface models, and contour generation from aerial imagery.' },
    { icon: '🏘️', number: '07', title: 'Estate & Property Mapping',   description: 'Plot-level mapping for residential estates, subdivisions, and large rural landholdings.' },
    { icon: '🔍', number: '08', title: 'Roof & Building Inspection',  description: 'Close-range visual inspection of roofs, facades, gutters, and hard-to-reach building elements.' },
    { icon: '🎉', number: '09', title: 'Event Aerial Coverage',       description: 'Weddings, festivals, sports, and corporate events captured from unique aerial angles.' },
    { icon: '✈️', number: '10', title: 'Travel & Tourism Videos',     description: 'Destination reels, tourism board content, and hotel marketing packages.' },
    { icon: '📱', number: '11', title: 'Social Media Drone Content',  description: 'Vertical and short-form aerial clips optimized for Instagram, TikTok, and YouTube Shorts.' },
    { icon: '🏛️', number: '12', title: 'Property Marketing Videos',   description: 'Full aerial-to-ground property tours edited for developers, brokers, and Airbnb hosts.' },
  ];

  // -- Placeholder portfolio. Real entries come from /api/projects --
  // Listed: location, client industry, services delivered, and the
  // specific aircraft used. Honest placeholders only.
  const fallbackPortfolio = [
    { id: 'fallback-1', title: "Luxury Duplex Development",     summary: 'Hero aerials + twilight exteriors for a beachfront duplex launch', industry: 'Real Estate',    services: 'Aerial Photography · Twilight Shots', equipment: 'DJI Mini 4 Pro', location: 'Lagos, Nigeria', year: '2025' },
    { id: 'fallback-2', title: "Estate Construction Progress",  summary: 'Monthly construction flyovers for a 40-unit housing estate',     industry: 'Construction',   services: 'Construction Progress · Investor Updates', equipment: 'DJI Mini 4 Pro', location: 'Lekki, Nigeria', year: '2025' },
    { id: 'fallback-3', title: "Resort Promotional Video",       summary: 'Cinematic resort tour with beach, pool, and amenity reveals',     industry: 'Hospitality',    services: 'Cinematic 4K Video · Resort Tour', equipment: 'DJI Mini 4 Pro', location: 'Epe, Nigeria', year: '2024' },
    { id: 'fallback-4', title: "Residential Estate Mapping",     summary: 'Orthomosaic & contour map for a 12-hectare subdivision plan',     industry: 'Surveying',      services: 'Drone Mapping · Orthomosaic', equipment: 'DJI Mini 4 Pro', location: 'FCT, Nigeria', year: '2024' },
    { id: 'fallback-5', title: "Warehouse Roof Inspection",      summary: 'Close-range roof and gutter inspection for a logistics warehouse', industry: 'Infrastructure', services: 'Roof & Building Inspection', equipment: 'DJI Mini 4K', location: 'Ogun, Nigeria', year: '2024' },
    { id: 'fallback-6', title: "Commercial Property Shoot",      summary: 'Marketing package for a mixed-use commercial property launch',     industry: 'Real Estate',    services: 'Property Marketing Video · Stills', equipment: 'DJI Mini 4 Pro', location: 'Lagos, Nigeria', year: '2024' },
  ];

  // Live projects fetched from /api/projects/division/DRONE.
  // Only PUBLISHED rows come back; see projectRoutes.js.
  const [apiPortfolio, setApiPortfolio] = useState([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const res = await api.get('/projects/division/DRONE');
      if (cancelled) return;
      if (res.ok && Array.isArray(res.data)) setApiPortfolio(res.data);
      setPortfolioLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const portfolio = apiPortfolio.length > 0 ? apiPortfolio : fallbackPortfolio;

  // -- My Equipment: only the drones I actually own + accessories --
  const myDrones = [
    {
      name: "DJI Mini 4 Pro",
      tagline: "Primary Workhorse",
      specs: [
        "48MP Camera",
        "4K / 60fps Video",
        "Omnidirectional Obstacle Avoidance",
        "Waypoint Flights",
        "ActiveTrack 360°",
        "RAW Photography (DNG)",
        "10-bit D-Log M Color",
        "Sub-249 g Takeoff Weight",
      ],
    },
    {
      name: "DJI Mini 4K",
      tagline: "Lightweight Secondary",
      specs: [
        "4K HDR Video",
        "Lightweight & Portable",
        "Excellent for Promotional Content",
        "Quick Deployment",
        "Sub-249 g Takeoff Weight",
        "GPS + GLONASS Positioning",
        "Return-to-Home Safety",
      ],
    },
  ];

  // -- Capability highlights (replaces fake stats banner) --
  // No made-up numbers — just the things the kit and the
  // operator can actually deliver in the air.
  const capabilities = [
    { value: "4K",      label: "Video Resolution" },
    { value: "48 MP",   label: "Still Photography" },
    { value: "RAW",     label: "Editable Image Capture" },
    { value: "HDR",     label: "High Dynamic Range" },
  ];

  // -- How We Work: 5-step premium workflow --
  const workflow = [
    { step: "01", title: "Project Consultation", description: "We start with a quick call to understand your goals, deliverables, and timeline." },
    { step: "02", title: "Mission Planning",     description: "Airspace, weather, flight path, and shot list are reviewed and confirmed." },
    { step: "03", title: "Flight Operations",    description: "On-site flying with safe, practiced maneuvers and live client review when possible." },
    { step: "04", title: "Editing & Processing", description: "Color grading, stabilization, mapping, and any required retouching." },
    { step: "05", title: "Delivery",             description: "Cloud delivery of final files within the agreed timeline — ready to publish." },
  ];

  // -- Industries we serve --
  const industries = [
    { icon: Home,       title: "Real Estate" },
    { icon: Building2,  title: "Construction" },
    { icon: Landmark,   title: "Architecture" },
    { icon: MapIcon,    title: "Surveying" },
    { icon: TreePine,   title: "Hospitality" },
    { icon: Calendar,   title: "Events" },
    { icon: Plane,      title: "Tourism" },
    { icon: Mountain,   title: "Government" },
  ];

  // -- Why Choose Us: authentic differentiators --
  const whyChoose = [
    { title: "Professional Planning",      description: "Every flight is scoped, scheduled, and shot-listed before the aircraft leaves the case." },
    { title: "High-Quality Footage",      description: "4K/60fps video and 48MP RAW stills, graded for natural color and crisp detail." },
    { title: "Fast Turnaround",           description: "Most edits are delivered within 3–5 business days. Rush options on request." },
    { title: "Licensed Where Required",   description: "Operations are flown in line with Nigerian aviation authority requirements." },
    { title: "Attention to Detail",       description: "Cinematic composition, level horizons, and clean color — even on tight timelines." },
    { title: "Reliable Communication",    description: "One point of contact from brief to delivery, with proactive updates." },
    { title: "Affordable Pricing",        description: "Premium results without the enterprise-drone-company invoice." },
    { title: "Safe Operations",           description: "Pre-flight checks, weather briefings, and conservative battery margins on every mission." },
  ];

  // -- Realistic client questions --
  const faqs = [
    { q: "Can you fly anywhere in Nigeria?",          a: "I fly regularly across Lagos, FCT, and the South-West. Longer-distance projects are quoted on a mobilization basis." },
    { q: "How long does editing take?",              a: "Standard photo edits are delivered in 2–3 business days. Video edits and mapping typically take 3–5 business days, depending on scope." },
    { q: "Do you provide RAW footage?",              a: "Yes. You can request RAW (DNG) stills and 10-bit D-Log M video files alongside the graded deliverables." },
    { q: "Can you support survey projects?",         a: "Absolutely. I work closely with our Survey Division for orthomosaics, contour maps, and estate documentation." },
    { q: "Can you work with construction companies?", a: "Yes. I provide recurring construction progress flyovers and investor-ready media packages on monthly or milestone-based schedules." },
    { q: "How do weather conditions affect flights?", a: "Wind, rain, and low light can delay or reschedule flights. I monitor conditions closely and we reschedule at no extra cost if safety is a concern." },
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
  // Guard: a ref + state check prevents duplicate observers when
  // the effect re-runs due to dependency churn (the previous
  // version would have re-attached the same observer multiple
  // times and re-fired all entries for every navigation).
  const observerRef = useRef(null);
  const [visibleElements, setVisibleElements] = useState(new Set());
  useEffect(() => {
    if (observerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleElements((prev) => {
          const next = new Set(prev);
          for (const entry of entries) {
            if (entry.isIntersecting && entry.target.dataset.id) {
              next.add(entry.target.dataset.id);
            }
          }
          return next;
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    const id = requestAnimationFrame(() => {
      document.querySelectorAll('.drone-observe').forEach((el) => observer.observe(el));
    });
    observerRef.current = { observer, raf: id };
    return () => {
      const { observer: o, raf: r } = observerRef.current || {};
      if (r) cancelAnimationFrame(r);
      if (o) o.disconnect();
      observerRef.current = null;
    };
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
              <button onClick={() => scrollTo('services')}  className="hover:text-black transition-colors">Services</button>
              <button onClick={() => scrollTo('workflow')}  className="hover:text-black transition-colors">Workflow</button>
              <button onClick={() => scrollTo('portfolio')} className="hover:text-black transition-colors">Portfolio</button>
              <button onClick={() => scrollTo('equipment')} className="hover:text-black transition-colors">Equipment</button>
              <button onClick={() => scrollTo('faq')}       className="hover:text-black transition-colors">FAQ</button>
              <button onClick={() => scrollTo('contact')}   className="hover:text-black transition-colors">Contact</button>
            </nav>
          </div>
        </header>

        {/* ==== HERO SECTION ==== */}
        <section className="relative min-h-[600px] lg:min-h-[800px] flex flex-col shrink-0">
          <div className="flex flex-1 relative z-10">
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-200 -translate-x-1/2 z-0 hidden md:block" />

            {/* Left Pane — outcome copy */}
            <div className="w-full md:w-1/2 flex flex-col justify-end px-6 md:px-16 pb-16 md:pb-32 z-10">
              <h2 className="drone-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] mb-10 max-w-md text-gray-900 tracking-tight">
                Show investors your construction progress. Market properties with cinematic aerial visuals. Document sites with mapping clarity.
              </h2>
              <div className="flex flex-wrap items-center gap-6">
                <button onClick={() => scrollTo('contact')} className="bg-black text-white rounded-full py-3 px-6 md:py-4 md:px-8 flex items-center gap-4 hover:bg-gray-800 transition-colors group">
                  <span className="font-medium text-sm">Book a Flight</span>
                  <span className="bg-white text-black rounded-full w-8 h-8 flex items-center justify-center group-hover:translate-x-1 transition-transform"><ArrowRight className="w-4 h-4" /></span>
                </button>
                <button onClick={() => scrollTo('portfolio')} className="font-semibold text-sm underline decoration-2 underline-offset-4 hover:text-gray-500 transition-colors">View Portfolio</button>
                <a
                  href="/eugene-odibenuah-land-surveyor-cv.pdf"
                  download="Eugene-Odibenuah-Surveyor-CV.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-sm hover:text-accent transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download CV
                </a>
              </div>
            </div>

            {/* Right Pane — emotional headline */}
            <div className="w-full md:w-1/2 flex flex-col justify-end px-6 md:px-16 pb-16 md:pb-32 z-10 hidden md:flex">
              <h1 className="drone-heading text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-6 text-gray-900">
                See Your<br />Project<br /><span className="text-gray-400">From Above.</span>
              </h1>
              <p className="text-gray-500 leading-relaxed max-w-md text-sm font-medium">
                Professional drone photography, videography, and mapping across Nigeria — flown on DJI Mini 4 Pro and Mini 4K, edited for clarity, and delivered ready to publish.
              </p>
            </div>
          </div>

          {/* Center Drone Image Area — realistic Mini-series render */}
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[90%] md:w-[70%] max-w-5xl pointer-events-none">
            <div className="relative w-full pb-[60%]">
              <img
                src={dronePlaceholder({ width: 800, height: 450, label: 'DJI Mini 4 Pro' })}
                alt="DJI Mini 4 Pro"
                className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl scale-110"
              />

              {/* Subtle annotations that match what the kit can do */}
              <div className="absolute top-[10%] left-[5%] flex items-center gap-2 hidden lg:flex">
                <span className="text-[10px] text-gray-500 font-medium w-24 text-right leading-tight">4K / 60fps<br/>Video</span>
                <div className="w-16 h-[1px] bg-gray-300"></div>
                <div className="w-2 h-2 rounded-full border-2 border-gray-400 bg-[#f4f4f4]"></div>
              </div>
              <div className="absolute top-[60%] left-[-5%] flex items-center gap-2 hidden lg:flex">
                <span className="text-[10px] text-gray-500 font-medium">48MP RAW Stills</span>
                <div className="w-24 h-[1px] bg-gray-300 transform -rotate-12 origin-left"></div>
                <div className="w-2 h-2 rounded-full border-2 border-gray-400 bg-[#f4f4f4] transform -translate-y-2"></div>
              </div>
              <div className="absolute top-[20%] right-[0%] flex items-center gap-2 hidden lg:flex flex-row-reverse">
                <span className="text-[10px] text-gray-500 font-medium w-24 leading-tight">Obstacle<br/>Avoidance</span>
                <div className="w-20 h-[1px] bg-gray-300"></div>
                <div className="w-2 h-2 rounded-full border-2 border-gray-400 bg-[#f4f4f4]"></div>
              </div>
              <div className="absolute top-[50%] right-[-10%] flex items-center gap-2 hidden lg:flex flex-row-reverse">
                <span className="text-[10px] text-gray-500 font-medium">Waypoint Flights</span>
                <div className="w-32 h-[1px] bg-gray-300 transform rotate-12 origin-right"></div>
                <div className="w-2 h-2 rounded-full border-2 border-gray-400 bg-[#f4f4f4] transform translate-y-3"></div>
              </div>
            </div>
          </div>

          {/* Thumbnails below the drone */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-30 hidden md:flex pointer-events-auto">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center p-3 cursor-pointer hover:shadow-md transition-shadow">
              <img src={dronePlaceholder({ width: 80, height: 80, label: 'Mini 4 Pro' })} alt="DJI Mini 4 Pro" className="w-full h-full object-contain" />
            </div>
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center p-3 cursor-pointer hover:shadow-md transition-shadow">
              <img src={dronePlaceholder({ width: 80, height: 80, label: 'Mini 4K' })} alt="DJI Mini 4K" className="w-full h-full object-contain" />
            </div>
          </div>
        </section>

        {/* ==== CAPABILITIES BANNER (replaces fake stats) ==== */}
        <section className="bg-black text-white px-6 md:px-12 py-12 mx-6 md:mx-12 rounded-[2rem] my-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {capabilities.map((cap, idx) => (
            <div
              key={idx}
              className={`drone-observe text-center md:text-left ${visibleElements.has(`cap-${idx}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} transition-all duration-700`}
              data-id={`cap-${idx}`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <p className="text-3xl md:text-4xl font-black tracking-tight mb-2">{cap.value}</p>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-400">{cap.label}</p>
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
                  Twelve service lines I actually deliver — from cinematic 4K video to photogrammetry mapping — using DJI Mini-series aircraft.
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
                  style={{ transitionDelay: `${index * 80}ms` }}
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

        {/* ==== HOW WE WORK ==== */}
        <section
          ref={(el) => (sectionsRef.current['workflow'] = el)}
          className="px-6 md:px-12 py-24 max-w-7xl mx-auto w-full shrink-0"
        >
          <div className={`drone-observe mb-16 ${visibleElements.has('workflow-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="workflow-header">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— The Process</p>
            <h2 className="drone-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 leading-[0.95]">
              How We<br/>Work
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {workflow.map((step, idx) => (
              <div
                key={idx}
                className={`drone-observe bg-white rounded-[2rem] p-8 border border-gray-100 hover:shadow-xl transition-all duration-500 ${visibleElements.has(`step-${idx}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                data-id={`step-${idx}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <span className="drone-heading text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-6 block">{step.step}</span>
                <h3 className="drone-heading text-lg font-black text-gray-900 mb-3 tracking-tight">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ==== INDUSTRIES SECTION ==== */}
        <section className="px-6 md:px-12 py-16 max-w-7xl mx-auto w-full shrink-0">
          <div className={`drone-observe mb-12 ${visibleElements.has('industries-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="industries-header">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— Industries</p>
            <h2 className="drone-heading text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-gray-900 leading-[0.95]">
              Who I Work<br/>With
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {industries.map((ind, idx) => {
              const Icon = ind.icon;
              return (
                <div
                  key={idx}
                  className={`drone-observe bg-white rounded-2xl p-6 border border-gray-100 hover:border-black transition-colors flex items-center gap-4 group ${visibleElements.has(`ind-${idx}`) ? 'opacity-100' : 'opacity-0'}`}
                  data-id={`ind-${idx}`}
                  style={{ transitionDelay: `${idx * 80}ms` }}
                >
                  <div className="w-10 h-10 bg-[#f4f4f4] rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="drone-heading text-sm font-black uppercase tracking-tight text-gray-900">{ind.title}</span>
                </div>
              );
            })}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" role="region" aria-label="Drone portfolio projects" aria-busy={portfolioLoading}>
            {portfolioLoading && portfolio.length === 0 ? (
              <>
                {[0, 1, 2, 3].map((i) => (
                  <div key={`skel-${i}`} className="animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  </div>
                ))}
              </>
            ) : portfolio.map((proj, idx) => {
              const isFallback = typeof proj.id === 'string' && proj.id.startsWith('fallback-');
              const tag = (proj.tags && proj.tags[0]) || proj.industry || proj.category || 'Drone';
              const year = proj.year || (proj.published_at ? new Date(proj.published_at).getFullYear() : '');
              const imgSrc = proj.image_url
                || dronePlaceholder({ width: 600, height: 450, label: proj.title });

              const cardInner = (
                <>
                  <div className="relative h-72 overflow-hidden rounded-t-[2rem]">
                    <img
                      src={imgSrc}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-white text-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full">
                      {tag}
                    </div>
                    {!isFallback && (
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white w-10 h-10 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="drone-heading text-lg font-black text-gray-900 mb-1">{proj.title}</h3>
                    <p className="text-xs text-gray-500 font-medium mb-4">{proj.summary}</p>
                    <div className="space-y-1.5 border-t border-gray-100 pt-3">
                      {(proj.location || proj.industry) && (
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-gray-400">Location</span>
                          <span className="text-gray-700">{proj.location || 'Nigeria'}</span>
                        </div>
                      )}
                      {proj.industry && (
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-gray-400">Industry</span>
                          <span className="text-gray-700">{proj.industry}</span>
                        </div>
                      )}
                      {proj.services && (
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-gray-400">Services</span>
                          <span className="text-gray-700 text-right max-w-[60%]">{proj.services}</span>
                        </div>
                      )}
                      {proj.equipment && (
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-gray-400">Equipment</span>
                          <span className="text-gray-700">{proj.equipment}</span>
                        </div>
                      )}
                      {year && (
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-gray-400">Year</span>
                          <span className="text-gray-400">{year}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              );

              return (
                <div
                  key={proj.id || idx}
                  className={`drone-observe group relative overflow-hidden bg-white rounded-[2rem] border border-gray-100 hover:shadow-2xl transition-all duration-500 ${visibleElements.has(`proj-${idx}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  data-id={`proj-${idx}`}
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  {isFallback ? (
                    <div className="block">{cardInner}</div>
                  ) : (
                    <Link to={`/drone/projects/${proj.id}`} className="block">
                      {cardInner}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ==== MY EQUIPMENT (drones + accessories) ==== */}
        <section
          ref={(el) => (sectionsRef.current['equipment'] = el)}
          className="px-6 md:px-12 py-24 max-w-7xl mx-auto w-full shrink-0"
        >
          <div className={`drone-observe mb-16 ${visibleElements.has('equipment-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="equipment-header">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— Hardware</p>
            <h2 className="drone-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 leading-[0.95]">
              My<br/>Equipment
            </h2>
          </div>

          {/* Drones I actually own */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {myDrones.map((drone, idx) => (
              <div
                key={idx}
                className={`drone-observe bg-white rounded-[2rem] p-8 border border-gray-100 hover:shadow-xl transition-all duration-500 ${visibleElements.has(`drone-${idx}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                data-id={`drone-${idx}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">{drone.tagline}</p>
                    <h3 className="drone-heading text-2xl font-black text-gray-900 tracking-tight">{drone.name}</h3>
                  </div>
                  <div className="w-16 h-16 bg-[#f4f4f4] rounded-2xl flex items-center justify-center">
                    <img src={equipmentPlaceholder({ width: 80, height: 80, label: drone.name })} alt={drone.name} className="w-full h-full object-contain p-2" />
                  </div>
                </div>
                <ul className="space-y-2">
                  {drone.specs.map((spec, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                      <span className="w-1.5 h-1.5 bg-black rounded-full shrink-0"></span>
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ==== WHY CHOOSE US ==== */}
        <section className="px-6 md:px-12 py-24 max-w-7xl mx-auto w-full shrink-0">
          <div className={`drone-observe mb-12 ${visibleElements.has('why-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="why-header">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— Why Me</p>
            <h2 className="drone-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 leading-[0.95]">
              Why Clients<br/>Hire Me
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {whyChoose.map((item, idx) => (
              <div
                key={idx}
                className={`drone-observe bg-[#f4f4f4] rounded-2xl p-6 hover:bg-black hover:text-white transition-colors duration-500 group ${visibleElements.has(`why-${idx}`) ? 'opacity-100' : 'opacity-0'}`}
                data-id={`why-${idx}`}
                style={{ transitionDelay: `${idx * 60}ms` }}
              >
                <span className="drone-heading text-xs font-black uppercase tracking-[0.3em] text-gray-400 group-hover:text-white/60 mb-4 block">0{idx + 1}</span>
                <h3 className="drone-heading text-base font-black uppercase tracking-tight mb-2">{item.title}</h3>
                <p className="text-xs leading-relaxed font-medium text-gray-500 group-hover:text-white/70">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ==== SURVEY DIVISION CROSS-LINK ==== */}
        <section className="px-6 md:px-12 py-16 max-w-7xl mx-auto w-full shrink-0">
          <div className="bg-black text-white rounded-[2.5rem] p-8 md:p-16 grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-12 items-start">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-4">— Sister Division</p>
              <h2 className="drone-heading text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] mb-8">
                Need<br />Accurate<br />Survey Data?
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8 max-w-md text-sm font-medium">
                Our Survey Division handles boundary, topographic, cadastral, site layout, ground control, and GPS surveys — the data foundation your drone imagery sits on.
              </p>
              <Link
                to="/survey"
                className="inline-flex items-center gap-3 border border-white px-6 py-3 text-sm font-bold tracking-wide hover:bg-white hover:text-black transition-colors group"
              >
                Explore Survey Division
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 text-xs font-bold uppercase tracking-widest text-gray-300">
              <li className="flex justify-between border-b border-white/20 pb-2"><span>Boundary Surveys</span><span className="text-white/40">01</span></li>
              <li className="flex justify-between border-b border-white/20 pb-2"><span>Topographic Surveys</span><span className="text-white/40">02</span></li>
              <li className="flex justify-between border-b border-white/20 pb-2"><span>Cadastral Surveys</span><span className="text-white/40">03</span></li>
              <li className="flex justify-between border-b border-white/20 pb-2"><span>Site Layout</span><span className="text-white/40">04</span></li>
              <li className="flex justify-between border-b border-white/20 pb-2"><span>Ground Control</span><span className="text-white/40">05</span></li>
              <li className="flex justify-between border-b border-white/20 pb-2"><span>GPS Surveys</span><span className="text-white/40">06</span></li>
            </ul>
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
                Tell us about your project — what to shoot, where, and by when — and we'll respond within one business day with a clear quote and timeline.
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
                  <span>Lagos, Nigeria — Available Nationwide</span>
                </div>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleBooking} noValidate aria-label="Drone service booking request">
              <div>
                <label htmlFor="booking_full_name" className="sr-only">Full name</label>
                <input
                  id="booking_full_name"
                  name="booking_full_name"
                  type="text"
                  placeholder="Full name *"
                  required
                  value={booking.full_name}
                  onChange={e => handleBookingFieldChange('full_name', e.target.value)}
                  onBlur={() => handleBookingFieldBlur('full_name')}
                  aria-invalid={!!bookingErrors.full_name}
                  aria-describedby={bookingErrors.full_name ? 'err_full_name' : undefined}
                  className={`w-full bg-transparent border-b-2 py-3 text-white placeholder-white/40 focus:outline-none transition-colors ${
                    bookingErrors.full_name ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-accent'
                  }`}
                />
                {bookingErrors.full_name && <p id="err_full_name" role="alert" className="text-xs text-red-300 mt-1">{bookingErrors.full_name}</p>}
              </div>
              <div>
                <label htmlFor="booking_email" className="sr-only">Email address</label>
                <input
                  id="booking_email"
                  name="booking_email"
                  type="email"
                  placeholder="Email address *"
                  required
                  value={booking.email}
                  onChange={e => handleBookingFieldChange('email', e.target.value)}
                  onBlur={() => handleBookingFieldBlur('email')}
                  aria-invalid={!!bookingErrors.email}
                  aria-describedby={bookingErrors.email ? 'err_email' : undefined}
                  className={`w-full bg-transparent border-b-2 py-3 text-white placeholder-white/40 focus:outline-none transition-colors ${
                    bookingErrors.email ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-accent'
                  }`}
                />
                {bookingErrors.email && <p id="err_email" role="alert" className="text-xs text-red-300 mt-1">{bookingErrors.email}</p>}
              </div>
              <div>
                <label htmlFor="booking_phone" className="sr-only">Phone</label>
                <input
                  id="booking_phone"
                  name="booking_phone"
                  type="tel"
                  placeholder="Phone (optional)"
                  value={booking.phone}
                  onChange={e => handleBookingFieldChange('phone', e.target.value)}
                  onBlur={() => handleBookingFieldBlur('phone')}
                  aria-invalid={!!bookingErrors.phone}
                  aria-describedby={bookingErrors.phone ? 'err_phone' : undefined}
                  className={`w-full bg-transparent border-b-2 py-3 text-white placeholder-white/40 focus:outline-none transition-colors ${
                    bookingErrors.phone ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-accent'
                  }`}
                />
                {bookingErrors.phone && <p id="err_phone" role="alert" className="text-xs text-red-300 mt-1">{bookingErrors.phone}</p>}
              </div>
              <div>
                <label htmlFor="booking_service" className="sr-only">Service type</label>
                <select
                  id="booking_service"
                  name="booking_service"
                  required
                  value={booking.service}
                  onChange={e => handleBookingFieldChange('service', e.target.value)}
                  onBlur={() => handleBookingFieldBlur('service')}
                  aria-invalid={!!bookingErrors.service}
                  aria-describedby={bookingErrors.service ? 'err_service' : undefined}
                  className={`w-full bg-transparent border-b-2 py-3 text-white focus:outline-none transition-colors appearance-none ${
                    bookingErrors.service ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-accent'
                  }`}
                >
                  <option value="" disabled className="text-gray-900">— Select Service —</option>
                  {services.map((s, i) => <option key={i} value={s.title} className="text-gray-900">{s.title}</option>)}
                </select>
                {bookingErrors.service && <p id="err_service" role="alert" className="text-xs text-red-300 mt-1">{bookingErrors.service}</p>}
              </div>
              <div>
                <label htmlFor="booking_location" className="sr-only">Project location</label>
                <input
                  id="booking_location"
                  name="booking_location"
                  type="text"
                  placeholder="Project location"
                  value={booking.location}
                  onChange={e => handleBookingFieldChange('location', e.target.value)}
                  className="w-full bg-transparent border-b-2 border-white/20 py-3 text-white placeholder-white/40 focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label htmlFor="booking_preferred_date" className="sr-only">Preferred date</label>
                <input
                  id="booking_preferred_date"
                  name="booking_preferred_date"
                  type="date"
                  placeholder="Preferred date"
                  min={new Date().toISOString().split('T')[0]}
                  value={booking.preferred_date}
                  onChange={e => handleBookingFieldChange('preferred_date', e.target.value)}
                  onBlur={() => handleBookingFieldBlur('preferred_date')}
                  aria-invalid={!!bookingErrors.preferred_date}
                  aria-describedby={bookingErrors.preferred_date ? 'err_preferred_date' : undefined}
                  className={`w-full bg-transparent border-b-2 py-3 text-white placeholder-white/40 focus:outline-none transition-colors ${
                    bookingErrors.preferred_date ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-accent'
                  }`}
                />
                {bookingErrors.preferred_date && <p id="err_preferred_date" role="alert" className="text-xs text-red-300 mt-1">{bookingErrors.preferred_date}</p>}
              </div>
              <div>
                <label htmlFor="booking_notes" className="sr-only">Mission details</label>
                <textarea
                  id="booking_notes"
                  name="booking_notes"
                  rows="3"
                  maxLength={1000}
                  placeholder="Tell us about your project..."
                  value={booking.notes}
                  onChange={e => handleBookingFieldChange('notes', e.target.value)}
                  className="w-full bg-transparent border-b-2 border-white/20 py-3 text-white placeholder-white/40 focus:outline-none focus:border-accent transition-colors resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={bookingStatus === 'submitting'}
                aria-busy={bookingStatus === 'submitting'}
                className={`w-full py-4 text-sm font-bold uppercase tracking-[0.2em] rounded-full flex items-center justify-center gap-3 group transition-colors ${
                  bookingStatus === 'success'
                    ? 'bg-green-500 text-white'
                    : bookingStatus === 'error'
                    ? 'bg-red-500 text-white'
                    : bookingStatus === 'submitting'
                    ? 'bg-white/20 text-white/50 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-accent hover:text-white'
                }`}
              >
                {bookingStatus === 'success' ? '✓ Request Sent — We\'ll respond within 1 business day' : bookingStatus === 'error' ? '✗ Try Again' : bookingStatus === 'submitting' ? 'Sending...' : 'Submit Request'}
                {bookingStatus === 'idle' && <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />}
              </button>
              {bookingStatus === 'error' && (
                <p role="alert" className="text-xs text-red-300 font-medium text-center">Something went wrong. Please try again or email us directly.</p>
              )}
            </form>
          </div>
        </section>
      </div>

      {/* ==== FOOTER ==== */}
      <footer className="mt-6 flex flex-col lg:flex-row justify-between items-center text-gray-500 text-xs px-2 md:px-8 gap-6 pb-2 shrink-0">
        <div className="font-medium tracking-wide">
          © 2026 Lami Drone Division // Aerial perspectives, premium execution
        </div>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 items-center font-bold uppercase tracking-widest text-[10px]">
          <a href="https://www.instagram.com/odibenuah_eugene?igsh=MXMwbzh6emk1eDhucA==" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">Instagram</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">LinkedIn</a>
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
