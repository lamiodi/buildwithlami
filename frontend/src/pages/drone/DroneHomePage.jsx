import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Crosshair, ArrowRight, ArrowUpRight, Plus, Minus, Mail, Phone, MapPin, Download, 
  Map as MapIcon, Building2, Home, Mountain, Calendar, TreePine, Landmark, Plane, 
  X, Check, Camera, Video, Shield, Layers, Sliders 
} from 'lucide-react';
import { api } from '../../services/api';
import { dronePlaceholder, equipmentPlaceholder } from '../../utils/placeholders';
import { validateBooking, validateField } from '../../utils/formValidation';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import DroneFooter from '../../components/DroneFooter';

// ── Drone-page fonts ─────────────────────────────────────
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Geomini:wght@200..800&family=Michroma&display=swap';

const useFontsEffect = () => {
    useEffect(() => {
        if (typeof document === 'undefined') return undefined;

        const created = [];
        const add = (node) => { document.head.appendChild(node); created.push(node); };

        const preconnect1 = document.createElement('link');
        preconnect1.rel = 'preconnect';
        preconnect1.href = 'https://fonts.googleapis.com';
        add(preconnect1);

        const preconnect2 = document.createElement('link');
        preconnect2.rel = 'preconnect';
        preconnect2.href = 'https://fonts.gstatic.com';
        preconnect2.crossOrigin = 'anonymous';
        add(preconnect2);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = FONT_HREF;
        add(link);

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
  
  // -- Interactive Modal States --
  const [selectedServiceModal, setSelectedServiceModal] = useState(null);
  const [selectedEquipmentModal, setSelectedEquipmentModal] = useState(null);
  const [activeCategory, setActiveCategory] = useState('ALL');

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

    const validation = validateBooking(booking);
    if (!validation.valid) {
      setBookingErrors(validation.errors);
      const firstError = Object.keys(validation.errors)[0];
      const el = document.querySelector(`[name="booking_${firstError}"]`);
      if (el) el.focus();
      return;
    }

    setBookingErrors({});
    setBookingStatus('submitting');
    
    try {
      const res = await api.post('/bookings', { ...booking, division: 'DRONE' });
      if (res.ok) {
        setBookingStatus('success');
        setBooking({ full_name: '', email: '', phone: '', service: '', location: '', preferred_date: '', notes: '' });
        setTimeout(() => setBookingStatus('idle'), 5000);
      } else {
        setBookingStatus('error');
        setTimeout(() => setBookingStatus('idle'), 5000);
      }
    } catch (err) {
      setBookingStatus('error');
      setTimeout(() => setBookingStatus('idle'), 5000);
    }
  };

  // -- 4 Unified Commercial Service Pillars (Consolidated from 12) --
  const servicePillars = [
    {
      id: 'real-estate',
      category: 'Real Estate & Architecture',
      icon: '🏡',
      number: '01',
      headline: 'Cinematic Property Showcases',
      description: 'Hero exteriors, twilight architectural flyovers, and full marketing video packages designed to accelerate luxury property sales and listings.',
      subServices: [
        'Aerial Stills & High-Res Photography (48MP)',
        'Cinematic 4K/60fps Stabilized Video Tours',
        'Twilight & Sunset Hero Exteriors',
        'Full Aerial-to-Ground Video Packages for Brokers'
      ],
      timeline: '2–3 business days',
      deliverables: '48MP RAW/JPEG Stills, 4K Color-Graded Video (D-Log M), Social Teasers'
    },
    {
      id: 'construction',
      category: 'Construction & Infrastructure',
      icon: '🏗️',
      number: '02',
      headline: 'Milestone Progress & Visual Audits',
      description: 'Periodic site flyovers documenting structural milestones for remote stakeholders, paired with high-resolution visual audits of roofs, facades, and hard-to-reach assets.',
      subServices: [
        'Recurring Monthly/Weekly Construction Flyovers',
        'Investor & Stakeholder Progress Packages',
        'Roof, Gutter & Facade Visual Audits',
        'Site Boundary & Access Corridor Documentation'
      ],
      timeline: '3–5 business days per mission',
      deliverables: 'Annotated 4K Progress Reel, High-Res Inspection Stills, Site Time-lapse'
    },
    {
      id: 'commercial',
      category: 'Commercial, Media & Events',
      icon: '🏨',
      number: '03',
      headline: 'Hospitality, Tourism & Event Media',
      description: 'Dynamic aerial cinematography for resorts, hotels, tourism destinations, sports, and cultural events optimized for high-engagement social reels and campaigns.',
      subServices: [
        'Hotel & Luxury Resort Promotional Tours',
        'Destination & Tourism Marketing Reels',
        'Festival, Wedding & Corporate Event Coverage',
        'Vertical Short-Form Content (Instagram / TikTok / YouTube Shorts)'
      ],
      timeline: '3–5 business days',
      deliverables: 'Horizontal 4K Master Video, 9:16 Vertical Cutdowns, Graded High-Res Stills'
    },
    {
      id: 'mapping',
      category: 'Drone Mapping & Photogrammetry',
      icon: '🗺️',
      number: '04',
      headline: 'Aerial Photogrammetry & Orthomosaics',
      description: 'High-overlap aerial mapping missions producing high-resolution 2D orthomosaic baselines and digital surface models with seamless survey division coordination.',
      subServices: [
        'High-Resolution 2D Orthomosaic Imagery',
        'Digital Surface Models (DSM) & Elevation Contours',
        'Plot Demarcation & Subdivision Aerial Overlays',
        'Survey Ground Control Alignment'
      ],
      timeline: '3–5 business days',
      deliverables: 'GeoTIFF Orthomosaic, Contour DXF, High-Res PDF Site Basemap'
    }
  ];

  // Filtered service list based on category pill
  const filteredServices = activeCategory === 'ALL'
    ? servicePillars
    : servicePillars.filter(p => p.id === activeCategory);

  // -- Placeholder portfolio --
  const fallbackPortfolio = [
    { id: 'fallback-1', title: "Luxury Duplex Development",     summary: 'Hero aerials + twilight exteriors for a beachfront duplex launch', industry: 'Real Estate',    services: 'Aerial Photography · Twilight Shots', equipment: 'DJI Mini 4 Pro', location: 'Lagos, Nigeria', year: '2025', image_url: '/images/drone/drone_proj_realestate.jpg' },
    { id: 'fallback-2', title: "Estate Construction Progress",  summary: 'Monthly construction flyovers for a 40-unit housing estate',     industry: 'Construction',   services: 'Construction Progress · Investor Updates', equipment: 'DJI Mini 4 Pro', location: 'Lekki, Nigeria', year: '2025', image_url: '/images/drone/drone_proj_construction.jpg' },
    { id: 'fallback-3', title: "Resort Promotional Video",       summary: 'Cinematic resort tour with beach, pool, and amenity reveals',     industry: 'Hospitality',    services: 'Cinematic 4K Video · Resort Tour', equipment: 'DJI Mini 4 Pro', location: 'Epe, Nigeria', year: '2024', image_url: '/images/drone/drone_proj_hospitality.jpg' },
    { id: 'fallback-4', title: "Residential Estate Mapping",     summary: 'Orthomosaic & contour map for a 12-hectare subdivision plan',     industry: 'Surveying',      services: 'Drone Mapping · Orthomosaic', equipment: 'DJI Mini 4 Pro', location: 'FCT, Nigeria', year: '2024', image_url: '/images/drone/drone_proj_orthomosaic.jpg' },
  ];

  // Live projects fetched from /api/projects/division/DRONE
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

  // -- Owned Drone Hardware with Deep Technical Specs --
  const myDrones = [
    {
      name: "DJI Mini 4 Pro",
      tagline: "Primary Workhorse",
      sensor: "1/1.3-inch CMOS, 48MP Effective",
      video: "4K / 60fps HDR Video & 100fps Slow-mo",
      color: "10-bit D-Log M & HLG Color Profiles",
      weight: "Sub-249 g Takeoff Weight (Fast Deployment)",
      flightTime: "Up to 34 minutes per battery",
      highlights: [
        "48MP RAW Photography (DNG)",
        "4K / 60fps HDR Video with D-Log M",
        "Omnidirectional Obstacle Avoidance",
        "Waypoint Autonomous Flight Missions",
      ],
      fullSpecs: [
        { label: "Sensor", value: "1/1.3-inch CMOS, 48MP Effective Pixels" },
        { label: "Video", value: "4K (3840×2160) @ 24/25/30/48/50/60fps" },
        { label: "Color Profile", value: "10-bit D-Log M, 10-bit HLG, 8-bit Normal" },
        { label: "Gimbal", value: "3-axis mechanical gimbal with 90° true vertical shooting" },
        { label: "Max Flight Time", value: "34 minutes (Intelligent Flight Battery)" },
        { label: "Transmission", value: "DJI O4 up to 20 km FHD live feed" },
        { label: "Sensing", value: "Omnidirectional binocular vision system" },
        { label: "Weight", value: "249 g (exempt from bulky commercial clearances)" }
      ]
    },
    {
      name: "DJI Mini 4K",
      tagline: "Lightweight Secondary",
      sensor: "1/2.3-inch CMOS, 12MP Effective",
      video: "4K Ultra HD at 30fps",
      color: "Standard Vibrant 8-Bit Profile",
      weight: "Sub-249 g Portable Frame",
      flightTime: "Up to 31 minutes per battery",
      highlights: [
        "4K HDR Ultra-Stabilized Video",
        "Quick Deployment for Agile Missions",
        "GPS + GLONASS Satellite Positioning",
        "Return-to-Home Fail-Safe Safety",
      ],
      fullSpecs: [
        { label: "Sensor", value: "1/2.3-inch CMOS, 12MP Effective Pixels" },
        { label: "Video", value: "4K (3840×2160) @ 24/25/30fps" },
        { label: "Gimbal", value: "3-axis mechanical gimbal stabilization" },
        { label: "Max Flight Time", value: "31 minutes per battery pack" },
        { label: "Transmission", value: "DJI O2 up to 10 km HD feed" },
        { label: "Safety", value: "Downward vision sensor + GPS return-to-home" },
        { label: "Weight", value: "249 g ultra-portable airframe" }
      ]
    },
  ];

  // -- Capability highlights --
  const capabilities = [
    { value: "4K / 60",  label: "HDR Video Recording" },
    { value: "48 MP",   label: "RAW Aerial Stills" },
    { value: "10-BIT",  label: "D-Log M Color Profile" },
    { value: "3–5 DAYS", label: "Standard Delivery" },
  ];

  // -- How We Work: 5-step premium workflow --
  const workflow = [
    { step: "01", title: "Project Brief", description: "Brief scoping call to align on shot requirements, location, deliverable formats, and timeline." },
    { step: "02", title: "Mission Planning", description: "Airspace check, weather window monitoring, flight paths, and shot lists confirmed." },
    { step: "03", title: "Flight Operations", description: "On-site flight execution with practiced maneuvers, safety buffers, and live review." },
    { step: "04", title: "Color & Processing", description: "Cinematic color grading, lens distortion correction, stabilization, and mapping exports." },
    { step: "05", title: "Cloud Delivery", description: "Full-resolution files delivered via secure cloud link, ready to publish and broadcast." },
  ];

  // -- Industries we serve (1-Line Compact Icon Strip) --
  const industries = [
    { icon: Home,       title: "Real Estate" },
    { icon: Building2,  title: "Construction" },
    { icon: Landmark,   title: "Architecture" },
    { icon: MapIcon,    title: "Surveying" },
    { icon: TreePine,   title: "Hospitality" },
    { icon: Calendar,   title: "Events" },
    { icon: Plane,      title: "Tourism" },
    { icon: Mountain,   title: "Infrastructure" },
  ];

  // -- Why Choose Us: 4 Focused Differentiators (Consolidated from 8) --
  const whyChoose = [
    { 
      number: "01", 
      title: "Professional Mission Planning", 
      description: "Every flight is pre-scoped, scheduled, and shot-listed with confirmed weather briefings and airspace clearance before the aircraft leaves the case." 
    },
    { 
      number: "02", 
      title: "4K Cinematic & 48MP RAW Stills", 
      description: "4K/60fps video and 48MP RAW DNG stills graded with 10-bit D-Log M color profiles for razor-sharp clarity, level horizons, and balanced dynamic range." 
    },
    { 
      number: "03", 
      title: "Fast 3–5 Day Turnaround", 
      description: "Secure cloud delivery of final graded deliverables within 3 to 5 business days, with rush turnaround options available on request." 
    },
    { 
      number: "04", 
      title: "Safe & Regulated Operations", 
      description: "Conservative battery margins, omnidirectional obstacle avoidance, and strict compliance with Nigerian civil aviation safety guidelines." 
    },
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
                src="/images/drone/drone_hero_mini4pro.jpg"
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
              <img src="/images/drone/drone_thumb_mini4pro.jpg" alt="DJI Mini 4 Pro" className="w-full h-full object-contain" />
            </div>
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center p-3 cursor-pointer hover:shadow-md transition-shadow">
              <img src="/images/drone/drone_thumb_mini4k.jpg" alt="DJI Mini 4K" className="w-full h-full object-contain" />
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

        {/* ==== SERVICES SECTION (4 Core Commercial Pillars) ==== */}
        <section
          ref={(el) => (sectionsRef.current['services'] = el)}
          className="bg-white px-6 md:px-12 py-24 z-30 relative rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.03)] shrink-0"
        >
          <div className="max-w-7xl mx-auto">
            <div className={`drone-observe flex flex-col md:flex-row justify-between items-end mb-12 gap-8 ${visibleElements.has('services-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="services-header">
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— Commercial Capabilities</p>
                <h2 className="drone-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 mb-4 leading-[0.95]">
                  Drone<br/>Services
                </h2>
                <p className="text-gray-500 max-w-xl text-base leading-relaxed font-medium">
                  Four specialized commercial disciplines flown on DJI Mini-series aircraft, engineered for visual clarity, precision mapping, and investor engagement.
                </p>
              </div>
              <button onClick={() => scrollTo('contact')} className="bg-black text-white rounded-full py-4 px-8 text-sm font-bold tracking-wide hover:bg-accent transition-colors shadow-lg shadow-black/20 shrink-0">
                Book a Flight
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              {[
                { id: 'ALL', label: 'All Disciplines' },
                { id: 'real-estate', label: '🏡 Real Estate & Architecture' },
                { id: 'construction', label: '🏗️ Construction & Inspection' },
                { id: 'commercial', label: '🏨 Commercial & Events' },
                { id: 'mapping', label: '🗺️ Mapping & Photogrammetry' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    activeCategory === cat.id
                      ? 'bg-black text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Service Pillars Grid (Horizontal Snap on Mobile, 2-Col on Desktop) */}
            <div className="flex md:grid md:grid-cols-2 gap-6 overflow-x-auto md:overflow-visible pb-6 md:pb-0 snap-x snap-mandatory scrollbar-none -mx-6 px-6 md:mx-0 md:px-0">
              {filteredServices.map((service, index) => (
                <div
                  key={service.id}
                  className={`w-[85vw] sm:w-[320px] md:w-auto shrink-0 snap-center drone-observe bg-[#f4f4f4] rounded-[2rem] p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-500 group border border-transparent hover:border-gray-200 ${visibleElements.has(`service-${index}`) ? 'opacity-100' : 'opacity-0'}`}
                  data-id={`service-${index}`}
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-4xl group-hover:scale-110 transition-transform duration-300 origin-bottom-left">{service.icon}</span>
                      <span className="text-gray-400 font-bold font-mono text-lg">0{index + 1}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2 block">{service.category}</span>
                    <h3 className="drone-heading text-xl font-black text-gray-900 mb-3 tracking-tight">{service.headline}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed font-medium mb-6">{service.description}</p>
                    
                    <ul className="space-y-2 border-t border-gray-200/60 pt-4 mb-6">
                      {service.subServices.map((sub, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                          <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span>{sub}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{service.timeline}</span>
                    <button
                      onClick={() => setSelectedServiceModal(service)}
                      className="text-xs font-bold text-black flex items-center gap-1.5 hover:text-accent transition-colors group-hover:translate-x-1 duration-300"
                    >
                      Scope &amp; Deliverables <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==== HOW WE WORK (Horizontal Track on Mobile) ==== */}
        <section
          ref={(el) => (sectionsRef.current['workflow'] = el)}
          className="px-6 md:px-12 py-24 max-w-7xl mx-auto w-full shrink-0"
        >
          <div className={`drone-observe mb-16 ${visibleElements.has('workflow-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="workflow-header">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— Execution Standard</p>
            <h2 className="drone-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 leading-[0.95]">
              How We<br/>Work
            </h2>
          </div>

          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-5 gap-6 overflow-x-auto md:overflow-visible pb-6 md:pb-0 snap-x snap-mandatory scrollbar-none -mx-6 px-6 md:mx-0 md:px-0">
            {workflow.map((step, idx) => (
              <div
                key={idx}
                className={`w-[78vw] sm:w-[260px] md:w-auto shrink-0 snap-center drone-observe bg-white rounded-[2rem] p-8 border border-gray-100 hover:shadow-xl transition-all duration-500 ${visibleElements.has(`step-${idx}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
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

        {/* ==== INDUSTRIES SECTION (1-Line Sleek Icon Strip) ==== */}
        <section className="px-6 md:px-12 py-12 max-w-7xl mx-auto w-full shrink-0">
          <div className="bg-white rounded-3xl p-8 border border-gray-100">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-6 text-center md:text-left">— Industries We Elevate</p>
            <div className="flex flex-wrap items-center justify-between gap-4">
              {industries.map((ind, idx) => {
                const Icon = ind.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#f4f4f4] hover:bg-black hover:text-white transition-colors duration-300 group cursor-default"
                  >
                    <Icon className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-900 group-hover:text-white transition-colors">{ind.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==== PORTFOLIO SECTION (Horizontal Snap on Mobile) ==== */}
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
            <button onClick={() => scrollTo('contact')} className="text-sm font-bold underline decoration-2 underline-offset-4 hover:text-gray-500 transition-colors">Book a Mission</button>
          </div>

          <div className="flex md:grid md:grid-cols-2 gap-6 overflow-x-auto md:overflow-visible pb-6 md:pb-0 snap-x snap-mandatory scrollbar-none -mx-6 px-6 md:mx-0 md:px-0" role="region" aria-label="Drone portfolio projects" aria-busy={portfolioLoading}>
            {portfolioLoading && portfolio.length === 0 ? (
              <>
                {[0, 1, 2, 3].map((i) => (
                  <div key={`skel-${i}`} className="w-[85vw] sm:w-[320px] md:w-auto shrink-0 snap-center animate-pulse">
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
                    <div className="absolute top-4 left-4 bg-white text-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-md">
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
                    </div>
                  </div>
                </>
              );

              return (
                <div
                  key={proj.id || idx}
                  className={`w-[85vw] sm:w-[320px] md:w-auto shrink-0 snap-center drone-observe group relative overflow-hidden bg-white rounded-[2rem] border border-gray-100 hover:shadow-2xl transition-all duration-500 ${visibleElements.has(`proj-${idx}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
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

        {/* ==== HARDWARE FLEET (With Spec Sheet Modal) ==== */}
        <section
          ref={(el) => (sectionsRef.current['equipment'] = el)}
          className="px-6 md:px-12 py-24 max-w-7xl mx-auto w-full shrink-0"
        >
          <div className={`drone-observe mb-16 ${visibleElements.has('equipment-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="equipment-header">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— Owned Hardware</p>
            <h2 className="drone-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 leading-[0.95]">
              My<br/>Equipment
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {myDrones.map((drone, idx) => (
              <div
                key={idx}
                className={`drone-observe bg-white rounded-[2rem] p-8 border border-gray-100 hover:shadow-xl transition-all duration-500 flex flex-col justify-between ${visibleElements.has(`drone-${idx}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                data-id={`drone-${idx}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-1">{drone.tagline}</p>
                      <h3 className="drone-heading text-2xl font-black text-gray-900 tracking-tight">{drone.name}</h3>
                    </div>
                    <div className="w-16 h-16 bg-[#f4f4f4] rounded-2xl flex items-center justify-center">
                      <img src={equipmentPlaceholder({ width: 80, height: 80, label: drone.name })} alt={drone.name} className="w-full h-full object-contain p-2" />
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <p className="text-xs text-gray-600 font-semibold flex items-center gap-2">
                      <Camera className="w-4 h-4 text-accent shrink-0" />
                      <span>{drone.sensor}</span>
                    </p>
                    <p className="text-xs text-gray-600 font-semibold flex items-center gap-2">
                      <Video className="w-4 h-4 text-accent shrink-0" />
                      <span>{drone.video}</span>
                    </p>
                  </div>

                  <ul className="space-y-2 border-t border-gray-100 pt-4 mb-6">
                    {drone.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                        <span className="w-1.5 h-1.5 bg-black rounded-full shrink-0"></span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setSelectedEquipmentModal(drone)}
                  className="w-full py-3 rounded-xl border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-800 hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  View Full Flight &amp; Camera Specs
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ==== WHY CHOOSE US (4 Focused Differentiator Pillars) ==== */}
        <section className="px-6 md:px-12 py-24 max-w-7xl mx-auto w-full shrink-0">
          <div className={`drone-observe mb-12 ${visibleElements.has('why-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="why-header">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— Differentiators</p>
            <h2 className="drone-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 leading-[0.95]">
              Why Clients<br/>Hire Me
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChoose.map((item, idx) => (
              <div
                key={idx}
                className={`drone-observe bg-[#f4f4f4] rounded-[2rem] p-8 hover:bg-black hover:text-white transition-colors duration-500 group ${visibleElements.has(`why-${idx}`) ? 'opacity-100' : 'opacity-0'}`}
                data-id={`why-${idx}`}
                style={{ transitionDelay: `${idx * 60}ms` }}
              >
                <span className="drone-heading text-xs font-black uppercase tracking-[0.3em] text-gray-400 group-hover:text-white/60 mb-4 block">{item.number}</span>
                <h3 className="drone-heading text-base font-black uppercase tracking-tight mb-3">{item.title}</h3>
                <p className="text-xs leading-relaxed font-medium text-gray-600 group-hover:text-white/70">{item.description}</p>
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
                <Select
                  value={booking.service}
                  onValueChange={val => handleBookingFieldChange('service', val)}
                >
                  <SelectTrigger
                    id="booking_service"
                    className={`w-full bg-zinc-900/90 border-2 rounded-xl h-12 text-sm text-white focus:outline-none transition-colors ${
                      bookingErrors.service ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-accent'
                    }`}
                  >
                    <SelectValue placeholder="— Select Service Discipline —" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700 text-white shadow-2xl">
                    <SelectGroup>
                      {servicePillars.map((s, i) => (
                        <SelectItem key={i} value={s.category} className="text-white cursor-pointer font-bold text-xs uppercase tracking-wider focus:bg-accent focus:text-white">
                          {s.category}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
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

        {/* ==== DRONE DIVISION FOOTER ==== */}
        <DroneFooter />
      </div>

      {/* ==== SERVICE SCOPE MODAL ==== */}
      {selectedServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white text-black rounded-[2.5rem] max-w-2xl w-full p-8 md:p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-none border border-gray-200">
            <button
              onClick={() => setSelectedServiceModal(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 hover:bg-black hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">{selectedServiceModal.icon}</span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent block">{selectedServiceModal.category}</span>
                <h3 className="drone-heading text-2xl font-black text-gray-900">{selectedServiceModal.headline}</h3>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-6 font-medium">
              {selectedServiceModal.description}
            </p>

            <div className="mb-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent" />
                Included Capabilities &amp; Formats
              </h4>
              <ul className="space-y-2.5">
                {selectedServiceModal.subServices.map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs font-semibold text-gray-700">
                    <Check className="w-4 h-4 text-accent shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-xs font-medium">
              <div className="p-4 rounded-xl bg-gray-100/70 border border-gray-200/50">
                <span className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Standard Turnaround</span>
                <span className="font-bold text-gray-900">{selectedServiceModal.timeline}</span>
              </div>
              <div className="p-4 rounded-xl bg-gray-100/70 border border-gray-200/50">
                <span className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Primary Deliverables</span>
                <span className="font-bold text-gray-900">{selectedServiceModal.deliverables}</span>
              </div>
            </div>

            <button
              onClick={() => {
                handleBookingFieldChange('service', selectedServiceModal.category);
                setSelectedServiceModal(null);
                scrollTo('contact');
              }}
              className="w-full py-4 rounded-full bg-black text-white hover:bg-accent font-bold uppercase text-xs tracking-widest transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              Book This Discipline <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==== HARDWARE SPEC SHEET MODAL ==== */}
      {selectedEquipmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#141414] text-white rounded-[2.5rem] max-w-2xl w-full p-8 md:p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-none border border-white/10">
            <button
              onClick={() => setSelectedEquipmentModal(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-black flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center p-2 border border-white/10 overflow-hidden">
                <img 
                  src={selectedEquipmentModal.name.includes('Pro') ? '/images/drone/drone_thumb_mini4pro.jpg' : '/images/drone/drone_thumb_mini4k.jpg'} 
                  alt={selectedEquipmentModal.name} 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent block">{selectedEquipmentModal.tagline}</span>
                <h3 className="drone-heading text-2xl font-black text-white">{selectedEquipmentModal.name}</h3>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {selectedEquipmentModal.fullSpecs.map((spec, i) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-white/10 text-xs">
                  <span className="text-gray-400 font-medium uppercase tracking-wider">{spec.label}</span>
                  <span className="text-white font-bold text-right max-w-[60%]">{spec.value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setSelectedEquipmentModal(null);
                scrollTo('contact');
              }}
              className="w-full py-4 rounded-full bg-white text-black hover:bg-accent hover:text-white font-bold uppercase text-xs tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              Book Mission with this Aircraft <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hide scrollbar styles */}
      <style dangerouslySetInnerHTML={{__html: `
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
