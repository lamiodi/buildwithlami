import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Plus, Minus, Download, Check, X, Layers, Shield, Compass, FileText, Sliders } from 'lucide-react';
import { api } from '../../services/api';
import { surveyPlaceholder, projectPlaceholder } from '../../utils/placeholders';
import { validateBooking, validateField } from '../../utils/formValidation';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import SurveyFooter from '../../components/SurveyFooter';

// ── Survey-page fonts ────────────────────────────────────
// "Manrope" for headings, "Mulish" for body text. Both are
// loaded page-scoped (not globally) so the rest of the app
// doesn't pay for the font weight downloads.
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Mulish:ital,wght@0,200..1000;1,200..1000&display=swap';

const useFontsEffect = () => {
    const fontRef = useRef(null);
    
    useLayoutEffect(() => {
        if (typeof document === 'undefined') return;

        // Remove any existing survey fonts
        const existingLink = document.querySelector('link[href*="Manrope"], link[href*="Mulish"]');
        const existingStyle = document.querySelector('style[data-survey-fonts]');
        if (existingLink) existingLink.remove();
        if (existingStyle) existingStyle.remove();

        const created = [];
        const add = (node) => { document.head.appendChild(node); created.push(node); fontRef.current = created; };

        // Preconnect resources
        const preconnect1 = document.createElement('link');
        preconnect1.rel = 'preconnect';
        preconnect1.href = 'https://fonts.googleapis.com';
        add(preconnect1);

        const preconnect2 = document.createElement('link');
        preconnect2.rel = 'preconnect';
        preconnect2.href = 'https://fonts.gstatic.com';
        preconnect2.crossOrigin = 'anonymous';
        add(preconnect2);

        // Font stylesheet
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = FONT_HREF;
        add(link);

        // Page-specific styles
        const style = document.createElement('style');
        style.setAttribute('data-survey-fonts', '');
        style.textContent = `
            .survey-heading { font-family: "Manrope", sans-serif; font-optical-sizing: auto; font-weight: 700; font-style: normal; letter-spacing: -0.01em; }
            .survey-body    { font-family: "Mulish",  sans-serif; font-optical-sizing: auto; font-style: normal; }
        `;
        add(style);

        return () => {
            if (fontRef.current) {
                fontRef.current.forEach((n) => {
                    if (n.parentNode) n.parentNode.removeChild(n);
                });
            }
        };
    }, []);
};

const SurveyHomePage = () => {
    useFontsEffect();
  // -- Booking form state (fixes dead form) --
  const [booking, setBooking] = useState({
    full_name: '', email: '', phone: '', service: '', location: '', preferred_date: '', notes: '',
  });
  const [bookingStatus, setBookingStatus] = useState('idle'); // idle | submitting | success | error
  const [bookingErrors, setBookingErrors] = useState({});

  // -- Modal & Filter States --
  const [selectedServiceModal, setSelectedServiceModal] = useState(null);
  const [standardsModal, setStandardsModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('ALL');

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

    // Client-side validation
    const validation = validateBooking(booking);
    if (!validation.valid) {
      setBookingErrors(validation.errors);
      const firstError = Object.keys(validation.errors)[0];
      const el = document.querySelector(`[name="survey_booking_${firstError}"]`);
      if (el) el.focus();
      return;
    }

    setBookingErrors({});
    setBookingStatus('submitting');
    
    try {
      const res = await api.post('/bookings', { ...booking, division: 'SURVEY' });
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

  // 4 Core Primary Disciplines
  const servicePillars = [
    {
      id: 'cadastral',
      category: 'Boundary & Cadastral Demarcation',
      number: '01',
      headline: 'Legally Valid Boundary & Cadastral Demarcation',
      description: 'Precise boundary marking with reinforced concrete monument pillars, prepared in accordance with SURCON regulations and Nigeria’s Land Instruments Preparation Act.',
      deliverables: 'Registered Survey Plan, Beacon Coordinate Sheet, AutoCAD (.DWG/.DXF), Deed Plan Annexure',
      timeline: '3–5 business days',
      subItems: [
        'Official Boundary Demarcation & Beacon Installation',
        'Perimeter Coordinate Mapping (Minna Datum / UTM 31N/32N)',
        'Lodgement-Ready Registered Survey Plans',
        'Title Verification & Boundary Dispute Resolution'
      ]
    },
    {
      id: 'topographic',
      category: 'Topographic Baseline Surveys',
      number: '02',
      headline: 'High-Precision 2D & 3D Terrain & Contour Baselines',
      description: 'Detailed elevation models, contours, spot heights, and natural/built feature mapping for architectural master plans and civil engineering design.',
      deliverables: '2D/3D Contour Plan, Digital Elevation Model (DEM), Spot Heights Grid, GeoTIFF Orthomosaic',
      timeline: '4–7 business days',
      subItems: [
        'Contour Interval Generation (0.5m / 1.0m intervals)',
        'Digital Terrain & Surface Modeling (DTM / DSM)',
        'Natural & Built Feature Asset Location',
        'Earthwork Cut & Fill Volume Calculations'
      ]
    },
    {
      id: 'engineering',
      category: 'Engineering & Construction Setting Out',
      number: '03',
      headline: 'Millimeter-Accurate Construction Layouts',
      description: 'Translating structural blueprints onto physical ground with high-precision grid pegging, column alignment, and as-built verification.',
      deliverables: 'Setting Out Certificate, Grid Alignment Sheet, As-Built Deviation Report',
      timeline: 'Scheduled per project phase',
      subItems: [
        'Building Footprint & Column Grid Alignment',
        'Road Centerlines, Corridors & Drainage Levels',
        'Pile Position & Foundation Axis Staking',
        'As-Built Quality Control & Tolerance Audits'
      ]
    },
    {
      id: 'subdivision',
      category: 'Estate Layout & Land Subdivision',
      number: '04',
      headline: 'Master Plan Demarcation & Plot Partitioning',
      description: 'Partitioning large virgin landholdings and commercial estates into demarcated, sellable units with road network alignment and drainage corridors.',
      deliverables: 'Master Subdivision Plan, Individual Plot Beacon Sheets, Road Network Layout',
      timeline: '1–2 weeks depending on acreage',
      subItems: [
        'Master Layout Plot Demarcation & Beaconing',
        'Estate Road Network & Infrastructure Staking',
        'Utility Corridor & Drainage Reservation Planning',
        'Commercial & Residential Allocation Plans'
      ]
    }
  ];

  const filteredServices = activeCategory === 'ALL'
    ? servicePillars
    : servicePillars.filter(s => s.id === activeCategory);

  // Precision Instrument Roster (3 High-Precision Pillars)
  const precisionEquipment = [
    {
      name: "GNSS RTK / Static Receiver",
      tagline: "Satellite Positioning",
      accuracy: "Sub-Centimeter Accuracy",
      spec: "Multi-constellation GPS, GLONASS, and Galileo tracking for primary ground control and boundary coordinate baselines.",
      badge: "Satellite GNSS",
      image_url: "/images/survey/survey_inst_gnss.webp"
    },
    {
      name: "Total Station & Electronic Theodolite",
      tagline: "Optical Precision",
      accuracy: "2\" Angular / 1mm+2ppm Distance",
      spec: "Electronic distance and angle measurement for architectural baselines, structural setting out, and dense urban boundaries.",
      badge: "Optical & EDM",
      image_url: "/images/survey/survey_inst_totalstation.webp"
    },
    {
      name: "DJI Aerial Mapping Drone",
      tagline: "Aerial Photogrammetry",
      accuracy: "High-Resolution GSD Orthomosaics",
      spec: "DJI Mini 4 Pro aircraft for photogrammetric contours, orthomosaics, and visual estate verification.",
      badge: "Aerial Photogrammetry",
      image_url: "/images/drone/drone_thumb_mini4pro.webp"
    }
  ];

  // Technical Standards & Datums Data
  const technicalStandards = {
    coordinateDatums: [
      { name: "Minna Datum (Clarke 1880)", usage: "Official Nigerian National Cadastral Coordinate System" },
      { name: "UTM Zone 31N & 32N", usage: "Universal Transverse Mercator Projection for Nigeria" },
      { name: "WGS 84 (EPSG:4326)", usage: "Global Satellite Positioning and GIS Integration" }
    ],
    fileDeliverables: [
      { format: "AutoCAD (.DWG / .DXF)", desc: "Layered vector CAD files with clean coordinate geometry" },
      { format: "GeoTIFF & Orthomosaics", desc: "Georeferenced high-resolution aerial raster datasets" },
      { format: "Registered Hardcopy Plans", desc: "SURCON compliant stamped survey plans for legal lodgement" },
      { format: "CSV / PDF Coordinate Sheets", desc: "Tabulated Eastings, Northings, and Elevation benchmarks" }
    ]
  };

  // Fallback projects shown if the API is unreachable or empty.
  const fallbackProjects = [
    { id: 'fallback-1', title: "Residential Estate Boundary Survey", summary: 'Cadastral demarcation for a 40-unit housing estate', area: "8 Ha",  tags: ['Cadastral'],   location: "Lagos", image_url: '/images/survey/survey_proj_boundary.webp' },
    { id: 'fallback-2', title: "Subdivision Layout — Lekki Axis",  summary: 'Plot subdivision and access road alignment',      area: "12 Ha",  tags: ['Subdivision'], location: "Lagos", image_url: '/images/survey/survey_proj_subdivision.webp' },
    { id: 'fallback-3', title: "Topographic Baseline for Site Plan", summary: 'Terrain map for an architect’s master plan',    area: "5 Ha",   tags: ['Topographic'], location: "FCT", image_url: '/images/survey/survey_proj_topographic.webp' },
    { id: 'fallback-4', title: "Construction Setting Out",          summary: 'Building footprint and column setting out',       area: "2 Ha",   tags: ['Engineering'], location: "Lagos", image_url: '/images/survey/survey_proj_boundary.webp' },
  ];

  // Live projects fetched from /api/projects/division/SURVEY.
  // The endpoint only returns PUBLISHED rows; see projectRoutes.js.
  //
  // We also re-fetch when the tab regains focus so an admin who
  // publishes a new case study in /admin/survey/projects sees it
  // reflected on this page the next time they switch back.
  const [apiProjects, setApiProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const fetchProjects = useCallback(async () => {
    const res = await api.get('/projects/division/SURVEY');
    if (Array.isArray(res.data?.data)) setApiProjects(res.data.data);
    setProjectsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (cancelled) return;
      await fetchProjects();
    };
    load();
    const onFocus = () => fetchProjects();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [fetchProjects]);

  // What we actually render: API results if any, otherwise the
  // hardcoded fallback. The home page must always have a grid
  // to fill so a transient API hiccup doesn't leave a blank
  // section.
  const projects = apiProjects.length > 0 ? apiProjects : fallbackProjects;

  // Equipment we actually use in the field. Only the tools that
  // physically sit in the case — no enterprise-grade hardware that
  // sounds impressive on a brochure page.
  const equipment = [
    { name: "GNSS Receiver",         spec: "Survey-Grade GPS / GLONASS" },
    { name: "Total Station",         spec: "Electronic Angle & Distance" },
    { name: "DJI Mini 4 Pro",        spec: "Aerial Mapping Drone" },
    { name: "Digital Level",         spec: "Precise Height Determination" },
    { name: "Data Collector",        spec: "Field Tablet with Survey Software" },
    { name: "Tripod & Prism Kit",    spec: "Stable Control Points" },
  ];

  // Realistic client questions — the things people actually ask
  // before hiring a surveyor in Nigeria. No "rapid 48-hour
  // nationwide deployment" or "sub-centimeter" sales copy.
  const faqs = [
    { q: "What areas do you cover?", a: "We are based in Lagos and routinely work across the South-West and FCT. Longer-distance projects are quoted on a mobilization basis." },
    { q: "How long does a typical survey take?", a: "A standard residential boundary survey runs 1–3 days in the field, with another 3–5 days for processing, drafting, and plan preparation." },
    { q: "What deliverables will I receive?", a: "You get digital AutoCAD drawings, printable survey plans, and — where relevant — GeoTIFF orthomosaics. We hand over both files and printed copies." },
    { q: "Are you licensed by SURCON?", a: "Yes. Our field operations are supervised by registered members of the Surveyors Council of Nigeria where local regulations require it." },
    { q: "Can you support a drone project too?", a: "Absolutely. Our Drone Division handles aerial mapping, orthomosaics, and progress documentation using DJI Mini 4 Pro aircraft." },
    { q: "How do you price a project?", a: "Pricing is based on site area, terrain, accessibility, and the type of deliverable. We share a clear quote after a quick scope discussion." },
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
  // STRICT: Prevent memory leaks and duplicate observers on navigation.
  const observerRef = useRef(null);
  const [visibleElements, setVisibleElements] = useState(new Set());
  
  useEffect(() => {
    document.title = "GeoSurvey — Precision Geomatics & Land Surveying";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'GeoSurvey — SURCON-compliant land surveying, cadastral boundary demarcation, engineering setting out, and high-precision topographic mapping across Nigeria.'
      );
    }
    // Cleanup on unmount ONLY - no duplicate observers on re-render
    return () => {
      if (observerRef.current) {
        observerRef.current.observer.disconnect();
        if (observerRef.current.raf) {
          cancelAnimationFrame(observerRef.current.raf);
        }
        observerRef.current = null;
      }
    };
  }, []);
  
  useLayoutEffect(() => {
    if (observerRef.current) return; // Already initialized
    
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
      document.querySelectorAll('.observe').forEach((el) => observer.observe(el));
    });
    
    observerRef.current = { observer, raf: id };
    
    return () => {
      if (observerRef.current) {
        observerRef.current.observer.disconnect();
        cancelAnimationFrame(observerRef.current.raf);
        observerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="bg-[#f2f2f2] text-black font-sans selection:bg-black selection:text-white survey-body">
      
      {/* ==== HERO SECTION (3 Column Editorial Layout) ==== */}
      <section className="min-h-screen flex justify-center p-4 md:p-8 pt-4">
        <div className="bg-[#f2f2f2] w-full max-w-[1400px] flex flex-col md:flex-row overflow-hidden border border-gray-200">
          
          {/* Left Column - Typography */}
          <div className="w-full md:w-[35%] flex flex-col justify-between p-8 md:p-12 relative border-b md:border-b-0 md:border-r border-gray-300 min-h-[90vh] md:min-h-[auto]">
            <div className="flex items-center gap-6 mb-16">
              <div className="border-2 border-black px-2.5 h-10 flex items-center justify-center font-black text-sm tracking-wider uppercase">GEOSURVEY</div>
              <nav className="hidden xl:flex gap-6 text-[10px] uppercase font-bold tracking-widest border-b border-black pb-2">
                <button onClick={() => scrollTo('services')} className="hover:text-gray-500 transition-colors">Services</button>
                <button onClick={() => scrollTo('projects')} className="hover:text-gray-500 transition-colors">Projects</button>
                <button onClick={() => scrollTo('equipment')} className="hover:text-gray-500 transition-colors">Equipment</button>
                <button onClick={() => scrollTo('contact')} className="hover:text-gray-500 transition-colors">Contact</button>
              </nav>
            </div>

            <div className="relative mb-16 flex-1 flex flex-col justify-center">
              <div className="absolute left-[-2rem] top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[10px] font-bold tracking-[0.4em] uppercase text-black">
                GEOSURVEY
              </div>
              <h1 className="survey-heading text-[5rem] md:text-[6rem] lg:text-[8rem] font-black leading-[0.85] tracking-tighter uppercase">
                PRE<br />CI<br />SION
              </h1>
            </div>

            <div className="mt-auto">
              <p className="text-xs font-semibold leading-loose text-gray-800 max-w-[280px] uppercase tracking-wider mb-12">
                Professional land surveying across Lagos and beyond. From boundary demarcation to drone-assisted topographic mapping — clean data, delivered on time.
              </p>
              <div className="flex gap-4 text-[10px] font-bold tracking-widest uppercase">
                <a href="https://www.instagram.com/odibenuah_eugene?igsh=MXMwbzh6emk1eDhucA==" target="_blank" rel="noopener noreferrer" className="hover:text-gray-500 transition-colors">Instagram</a>
                <span>/</span>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-500 transition-colors">LinkedIn</a>
              </div>
              <a
                href="/eugene-odibenuah-land-surveyor-cv.pdf"
                download="Eugene-Odibenuah-Surveyor-CV.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 border border-black px-4 py-2.5 hover:bg-black hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest w-fit"
              >
                <Download className="w-3.5 h-3.5" />
                Download CV
              </a>
            </div>
          </div>

          {/* Center Column - Image */}
          <div className="w-full md:w-[35%] bg-[#e6e6e6] flex flex-col border-b md:border-b-0 md:border-r border-gray-300">
            <div className="w-full h-[50vh] md:h-[70%] bg-gray-200 overflow-hidden">
              <img
                src="/images/survey/survey_hero_field.webp"
                alt="Cadastral Survey Field Operations"
                className="w-full h-full object-cover grayscale-[10%] contrast-110 hover:scale-105 transition-transform duration-700"
                loading="eager"
                decoding="async"
              />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-between flex-1">
              <div className="flex justify-end border-b border-black pb-4 mb-6">
                <button onClick={() => scrollTo('projects')} className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:text-gray-600 transition-colors">
                  View Portfolio <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-gray-800 max-w-[250px]">
                Disciplined field surveys for residential, commercial, and infrastructure clients — backed by digital deliverables you can build on.
              </p>
            </div>
          </div>

          {/* Right Column - Project Details */}
          <div className="w-full md:w-[30%] bg-[#f2f2f2] p-8 md:p-12 flex flex-col relative min-h-[600px]">
            <div className="flex gap-2 mb-12">
              <span className="w-2 h-2 rounded-full bg-black"></span>
              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            </div>
            
            <div className="mb-auto">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-2">01 / LATEST PROJECT</span>
              <h3 className="survey-heading text-2xl font-bold uppercase tracking-tight mb-4">Lekki Phase 1 Commercial Boundary</h3>
              <p className="text-xs text-gray-700 leading-relaxed uppercase tracking-wider mb-6 font-medium">
                Comprehensive perimeter boundary demarcation and beacon placement for a 1,200m² commercial development.
              </p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between border-b border-gray-300 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Scope</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Boundary + Topo</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Instruments</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Total Station + Drone</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Location</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Lagos, NG</span>
                </div>
              </div>
              <button onClick={() => scrollTo('projects')} className="text-[11px] font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 transition-colors">
                Read More
              </button>
            </div>
            <div className="absolute bottom-8 right-8 w-32 h-32 hidden lg:flex items-center justify-center">
              {/* Decorative rotating text */}
              <svg className="w-full h-full animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100" aria-hidden="true">
                <path id="circlePath" fill="none" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
                <text className="text-[8.5px] font-bold tracking-[0.2em] uppercase">
                  <textPath href="#circlePath" startOffset="0%">• GEOSURVEY • PRECISION AND ACCURACY</textPath>
                </text>
              </svg>
              <div className="absolute font-black text-xs uppercase text-center leading-tight tracking-wider" aria-label="GeoSurvey">GEO<br />SURVEY</div>
            </div>
          </div>
        </div>
      </section>

      {/* ==== SERVICES SECTION (4 Core Primary Disciplines) ==== */}
      <section 
        ref={(el) => (sectionsRef.current['services'] = el)} 
        className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-gray-300"
      >
        <div className={`observe ${visibleElements.has('services-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="services-header">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— Survey Disciplines</p>
              <h2 className="survey-heading text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
                Serv<br />ices
              </h2>
            </div>
            <div className="max-w-md">
              <p className="text-xs font-bold uppercase tracking-widest leading-relaxed text-gray-700 mb-4">
                Four core survey disciplines delivered under SURCON-compliant supervision with Total Stations, GNSS receivers, and aerial photogrammetry.
              </p>
              <button
                onClick={() => setStandardsModal(true)}
                className="text-[11px] font-black uppercase tracking-widest text-black underline underline-offset-4 hover:text-gray-500 flex items-center gap-1.5 transition-colors"
              >
                <Compass className="w-3.5 h-3.5" /> View Deliverable Formats &amp; Datums
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          {[
            { id: 'ALL', label: 'All Disciplines' },
            { id: 'cadastral', label: 'Boundary & Cadastral' },
            { id: 'topographic', label: 'Topographic Baseline' },
            { id: 'engineering', label: 'Setting Out & Layout' },
            { id: 'subdivision', label: 'Estate Subdivision' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeCategory === cat.id
                  ? 'bg-black text-white shadow-md'
                  : 'bg-[#f0f0f0] text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 4 Core Disciplines Grid (Horizontal Snap on Mobile) */}
        <div className="flex md:grid md:grid-cols-2 gap-6 overflow-x-auto md:overflow-visible pb-6 md:pb-0 snap-x snap-mandatory scrollbar-none -mx-6 px-6 md:mx-0 md:px-0">
          {filteredServices.map((service, idx) => (
            <div 
              key={service.id}
              className={`w-[85vw] sm:w-[340px] md:w-auto shrink-0 snap-center observe ${visibleElements.has(`service-${idx}`) ? 'opacity-100' : 'opacity-0'} transition-all duration-700`}
              data-id={`service-${idx}`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div className="bg-[#f2f2f2] p-8 md:p-10 h-full hover:bg-white hover:shadow-xl transition-all duration-500 group flex flex-col justify-between border border-gray-200">
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <span className="text-4xl font-black text-gray-300 group-hover:text-black transition-colors duration-500 font-mono">{service.number}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-white px-3 py-1 border border-gray-200 rounded-full">
                      {service.timeline}
                    </span>
                  </div>
                  <h3 className="survey-heading text-xl md:text-2xl font-black uppercase tracking-tight mb-3">{service.category}</h3>
                  <p className="text-xs font-medium text-gray-600 leading-relaxed mb-6">
                    {service.description}
                  </p>

                  <ul className="space-y-2 border-t border-gray-200 pt-4 mb-6">
                    {service.subItems.map((sub, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-xs font-semibold text-gray-800">
                        <Check className="w-3.5 h-3.5 text-black shrink-0" />
                        <span>{sub}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Lodgement Standard</span>
                  <button
                    onClick={() => setSelectedServiceModal(service)}
                    className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5 hover:text-gray-500 group-hover:translate-x-1 duration-300"
                  >
                    Scope &amp; Deliverables <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==== PROJECTS SECTION (Horizontal Snap on Mobile) ==== */}
      <section 
        ref={(el) => (sectionsRef.current['projects'] = el)} 
        className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-gray-300"
      >
        <div className={`observe ${visibleElements.has('projects-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="projects-header">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— Selected Works</p>
              <h2 className="survey-heading text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
                Port<br />folio
              </h2>
            </div>
          </div>
        </div>

        <div className="flex md:grid md:grid-cols-2 gap-8 overflow-x-auto md:overflow-visible pb-6 md:pb-0 snap-x snap-mandatory scrollbar-none -mx-6 px-6 md:mx-0 md:px-0" role="region" aria-label="Survey portfolio projects" aria-busy={projectsLoading}>
          {projectsLoading && projects.length === 0 ? (
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
          ) : projects.map((proj, idx) => {
            const isFallback = typeof proj.id === 'string' && proj.id.startsWith('fallback-');
            const tag = (proj.tags && proj.tags[0]) || proj.type || 'Survey';
            const imgSrc = proj.image_url
              || projectPlaceholder({ width: 600, height: 450, label: proj.title });

            const cardInner = (
                <>
                    <div className="bg-[#e6e6e6] aspect-[4/3] mb-6 relative overflow-hidden group">
                        <img
                            src={imgSrc}
                            alt={proj.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-4 left-4 bg-white px-3 py-1 text-[9px] font-bold tracking-widest uppercase shadow-sm">
                            {tag}
                        </div>
                    </div>
                    <div className="flex justify-between items-start border-b border-gray-300 pb-4">
                        <div>
                            <h3 className="survey-heading text-xl font-black uppercase tracking-tight mb-2">{proj.title}</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{proj.location || 'Nigeria'}</p>
                        </div>
                        {proj.area ? (
                            <div className="text-right">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Area</p>
                                <p className="text-sm font-black tracking-widest uppercase">{proj.area}</p>
                            </div>
                        ) : (
                            <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-black transition-colors" />
                        )}
                    </div>
                </>
            );

            return (
                <div
                    key={proj.id || idx}
                    className={`w-[85vw] sm:w-[320px] md:w-auto shrink-0 snap-center observe ${visibleElements.has(`proj-${idx}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`}
                    data-id={`proj-${idx}`}
                >
                    {isFallback ? (
                        <div className="block">{cardInner}</div>
                    ) : (
                        <Link to={`/survey/projects/${proj.id}`} className="block group">
                            {cardInner}
                        </Link>
                    )}
                </div>
            );
          })}
        </div>
      </section>

      {/* ==== PRECISION INSTRUMENT ROSTER ==== */}
      <section 
        ref={(el) => (sectionsRef.current['equipment'] = el)} 
        className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-gray-300"
      >
        <div className={`observe ${visibleElements.has('equipment-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="equipment-header">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— Field Instruments</p>
              <h2 className="survey-heading text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
                Equip<br />ment
              </h2>
            </div>
            <button
              onClick={() => setStandardsModal(true)}
              className="border border-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
            >
              Coordinate Systems &amp; Standards
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {precisionEquipment.map((eq, idx) => (
            <div
              key={idx}
              className={`observe ${visibleElements.has(`eq-${idx}`) ? 'opacity-100' : 'opacity-0'} transition-all duration-700 bg-[#f9f9f9] border border-gray-200 p-8 flex flex-col justify-between hover:bg-white hover:shadow-xl transition-all duration-500 rounded-2xl group`}
              data-id={`eq-${idx}`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-3 py-1 rounded-full">
                    {eq.badge}
                  </span>
                  <span className="text-xs font-bold font-mono text-gray-400">0{idx + 1}</span>
                </div>
                {eq.image_url && (
                  <div className="w-full aspect-[4/3] bg-white rounded-xl mb-6 overflow-hidden border border-gray-100 flex items-center justify-center p-4">
                    <img 
                      src={eq.image_url} 
                      alt={eq.name} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                )}
                <h3 className="survey-heading text-xl font-black uppercase tracking-tight mb-2">{eq.name}</h3>
                <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">{eq.accuracy}</p>
                <p className="text-xs font-medium text-gray-600 leading-relaxed mb-6">{eq.spec}</p>
              </div>

              <div className="pt-4 border-t border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-black" /> Calibrated &amp; Certified
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==== LAMI AERIAL CROSS-LINK ==== */}
      <section className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-gray-300">
        <div className="bg-black text-white p-8 md:p-16 grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-12 items-start">
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-4">— Sister Studio</p>
            <h2 className="survey-heading text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85] mb-8">
              Need<br />Aerial<br />Visuals?
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest leading-loose text-gray-300 max-w-md mb-10">
              Our sister studio Lami Aerial complements every survey we deliver — flying DJI Mini 4 Pro and Mini 4K aircraft for the photography, mapping, and progress content our clients need.
            </p>
            <Link
              to="/drone"
              className="inline-flex items-center gap-3 border border-white px-6 py-3 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-colors group"
            >
              Explore Lami Aerial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-300">
            <li className="flex justify-between border-b border-white/20 pb-2">
              <span>Aerial Photography</span>
              <span className="text-white/40">01</span>
            </li>
            <li className="flex justify-between border-b border-white/20 pb-2">
              <span>Real Estate Shoots</span>
              <span className="text-white/40">02</span>
            </li>
            <li className="flex justify-between border-b border-white/20 pb-2">
              <span>Construction Progress</span>
              <span className="text-white/40">03</span>
            </li>
            <li className="flex justify-between border-b border-white/20 pb-2">
              <span>Hotel &amp; Resort Promotion</span>
              <span className="text-white/40">04</span>
            </li>
            <li className="flex justify-between border-b border-white/20 pb-2">
              <span>Event Aerial Coverage</span>
              <span className="text-white/40">05</span>
            </li>
            <li className="flex justify-between border-b border-white/20 pb-2">
              <span>Drone Mapping &amp; Orthomosaics</span>
              <span className="text-white/40">06</span>
            </li>
          </ul>
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
            <h2 className="survey-heading text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
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
            <h2 className="survey-heading text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] mb-8">
              Start<br />A<br />Project
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest leading-loose text-gray-700 max-w-md mb-12">
              Share a few details about your site and what you need delivered. We respond within one business day with a clear scope, timeline, and quote — no inflated enterprise pricing.
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
            <form className="space-y-6" onSubmit={handleBooking} noValidate aria-label="Survey service booking request">
              <div>
                <label htmlFor="survey_booking_full_name" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Full Name *</label>
                <input
                  id="survey_booking_full_name"
                  name="survey_booking_full_name"
                  type="text"
                  required
                  value={booking.full_name}
                  onChange={e => handleBookingFieldChange('full_name', e.target.value)}
                  onBlur={() => handleBookingFieldBlur('full_name')}
                  aria-invalid={!!bookingErrors.full_name}
                  aria-describedby={bookingErrors.full_name ? 'survey_err_full_name' : undefined}
                  className={`w-full bg-transparent border-b-2 py-3 text-sm font-bold uppercase tracking-wider focus:outline-none transition-colors ${
                    bookingErrors.full_name ? 'border-red-500' : 'border-black focus:border-gray-500'
                  }`}
                />
                {bookingErrors.full_name && <p id="survey_err_full_name" role="alert" className="text-xs text-red-600 mt-1">{bookingErrors.full_name}</p>}
              </div>
              <div>
                <label htmlFor="survey_booking_email" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Email *</label>
                <input
                  id="survey_booking_email"
                  name="survey_booking_email"
                  type="email"
                  required
                  value={booking.email}
                  onChange={e => handleBookingFieldChange('email', e.target.value)}
                  onBlur={() => handleBookingFieldBlur('email')}
                  aria-invalid={!!bookingErrors.email}
                  aria-describedby={bookingErrors.email ? 'survey_err_email' : undefined}
                  className={`w-full bg-transparent border-b-2 py-3 text-sm font-bold uppercase tracking-wider focus:outline-none transition-colors ${
                    bookingErrors.email ? 'border-red-500' : 'border-black focus:border-gray-500'
                  }`}
                />
                {bookingErrors.email && <p id="survey_err_email" role="alert" className="text-xs text-red-600 mt-1">{bookingErrors.email}</p>}
              </div>
              <div>
                <label htmlFor="survey_booking_phone" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Phone</label>
                <input
                  id="survey_booking_phone"
                  name="survey_booking_phone"
                  type="tel"
                  value={booking.phone}
                  onChange={e => handleBookingFieldChange('phone', e.target.value)}
                  onBlur={() => handleBookingFieldBlur('phone')}
                  aria-invalid={!!bookingErrors.phone}
                  aria-describedby={bookingErrors.phone ? 'survey_err_phone' : undefined}
                  className={`w-full bg-transparent border-b-2 py-3 text-sm font-bold uppercase tracking-wider focus:outline-none transition-colors ${
                    bookingErrors.phone ? 'border-red-500' : 'border-black focus:border-gray-500'
                  }`}
                />
                {bookingErrors.phone && <p id="survey_err_phone" role="alert" className="text-xs text-red-600 mt-1">{bookingErrors.phone}</p>}
              </div>
              <div>
                <label htmlFor="survey_booking_service" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Service Required *</label>
                <Select
                  value={booking.service}
                  onValueChange={val => handleBookingFieldChange('service', val)}
                >
                  <SelectTrigger
                    id="survey_booking_service"
                    className={`w-full bg-white dark:bg-zinc-900 border-2 rounded-xl h-12 text-sm font-bold uppercase tracking-wider focus:outline-none transition-colors ${
                      bookingErrors.service ? 'border-red-500' : 'border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white'
                    }`}
                  >
                    <SelectValue placeholder="— Select Survey Discipline —" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-gray-800 shadow-2xl">
                    <SelectGroup>
                      {servicePillars.map((s, i) => (
                        <SelectItem key={i} value={s.category} className="cursor-pointer font-bold text-xs uppercase tracking-wider">
                          {s.category}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {bookingErrors.service && <p id="survey_err_service" role="alert" className="text-xs text-red-600 mt-1">{bookingErrors.service}</p>}
              </div>
              <div>
                <label htmlFor="survey_booking_location" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Project Location</label>
                <input
                  id="survey_booking_location"
                  name="survey_booking_location"
                  type="text"
                  placeholder="e.g. Lekki Phase 1, Lagos"
                  value={booking.location}
                  onChange={e => handleBookingFieldChange('location', e.target.value)}
                  className="w-full bg-transparent border-b-2 border-black py-3 text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-gray-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="survey_booking_preferred_date" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Preferred Date</label>
                <input
                  id="survey_booking_preferred_date"
                  name="survey_booking_preferred_date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={booking.preferred_date}
                  onChange={e => handleBookingFieldChange('preferred_date', e.target.value)}
                  onBlur={() => handleBookingFieldBlur('preferred_date')}
                  aria-invalid={!!bookingErrors.preferred_date}
                  aria-describedby={bookingErrors.preferred_date ? 'survey_err_preferred_date' : undefined}
                  className={`w-full bg-transparent border-b-2 py-3 text-sm font-bold uppercase tracking-wider focus:outline-none transition-colors ${
                    bookingErrors.preferred_date ? 'border-red-500' : 'border-black focus:border-gray-500'
                  }`}
                />
                {bookingErrors.preferred_date && <p id="survey_err_preferred_date" role="alert" className="text-xs text-red-600 mt-1">{bookingErrors.preferred_date}</p>}
              </div>
              <div>
                <label htmlFor="survey_booking_notes" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Project Notes</label>
                <textarea
                  id="survey_booking_notes"
                  name="survey_booking_notes"
                  rows="4"
                  maxLength={1000}
                  placeholder="Estimated site size (plots/hectares), title status, and timeline..."
                  value={booking.notes}
                  onChange={e => handleBookingFieldChange('notes', e.target.value)}
                  className="w-full bg-transparent border-b-2 border-black py-3 text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-gray-500 transition-colors resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={bookingStatus === 'submitting'}
                aria-busy={bookingStatus === 'submitting'}
                className={`px-10 py-4 text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 group transition-colors ${
                  bookingStatus === 'success'
                    ? 'bg-green-600 text-white'
                    : bookingStatus === 'error'
                    ? 'bg-red-600 text-white'
                    : bookingStatus === 'submitting'
                    ? 'bg-gray-500 text-white cursor-not-allowed'
                    : 'bg-black text-white hover:bg-accent'
                }`}
              >
                {bookingStatus === 'success' ? '✓ Request Sent' : bookingStatus === 'error' ? '✗ Try Again' : bookingStatus === 'submitting' ? 'Sending...' : 'Submit Brief'}
                {bookingStatus === 'idle' && <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />}
              </button>
              {bookingStatus === 'error' && (
                <p role="alert" className="text-xs text-red-600 font-bold uppercase tracking-wider">Something went wrong. Please try again or email us directly.</p>
              )}
              {bookingStatus === 'success' && (
                <p role="status" className="text-xs text-green-700 font-bold uppercase tracking-wider">We'll respond within 24 hours.</p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ==== SERVICE SCOPE MODAL ==== */}
      {selectedServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white text-black max-w-2xl w-full p-8 md:p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-none border-2 border-black">
            <button
              onClick={() => setSelectedServiceModal(null)}
              className="absolute top-6 right-6 w-10 h-10 border border-black hover:bg-black hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-1">Pillar {selectedServiceModal.number}</span>
              <h3 className="survey-heading text-2xl font-black uppercase text-gray-900">{selectedServiceModal.category}</h3>
            </div>

            <p className="text-xs font-medium text-gray-700 leading-relaxed mb-6">
              {selectedServiceModal.description}
            </p>

            <div className="mb-6 bg-[#f7f7f7] p-6 border border-gray-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-black" />
                Key Fieldwork &amp; Drafting Standards
              </h4>
              <ul className="space-y-2.5">
                {selectedServiceModal.subItems.map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs font-semibold text-gray-800">
                    <Check className="w-4 h-4 text-black shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-xs font-medium">
              <div className="p-4 bg-[#f7f7f7] border border-gray-200">
                <span className="text-[9px] font-bold uppercase text-gray-500 block mb-1">Standard Turnaround</span>
                <span className="font-bold text-gray-900 uppercase">{selectedServiceModal.timeline}</span>
              </div>
              <div className="p-4 bg-[#f7f7f7] border border-gray-200">
                <span className="text-[9px] font-bold uppercase text-gray-500 block mb-1">Included Deliverables</span>
                <span className="font-bold text-gray-900 uppercase">{selectedServiceModal.deliverables}</span>
              </div>
            </div>

            <button
              onClick={() => {
                handleBookingFieldChange('service', selectedServiceModal.category);
                setSelectedServiceModal(null);
                scrollTo('contact');
              }}
              className="w-full py-4 bg-black text-white hover:bg-gray-800 font-bold uppercase text-xs tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              Request Quote for This Discipline <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==== TECHNICAL STANDARDS & DATUMS MODAL ==== */}
      {standardsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white text-black max-w-2xl w-full p-8 md:p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-none border-2 border-black">
            <button
              onClick={() => setStandardsModal(false)}
              className="absolute top-6 right-6 w-10 h-10 border border-black hover:bg-black hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 block mb-1">Technical Reference</span>
              <h3 className="survey-heading text-2xl font-black uppercase text-gray-900">Coordinate Datums &amp; Deliverables</h3>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3 flex items-center gap-2">
                <Compass className="w-4 h-4 text-black" />
                Nigerian Reference Datums
              </h4>
              <div className="space-y-2">
                {technicalStandards.coordinateDatums.map((datum, i) => (
                  <div key={i} className="p-3.5 bg-[#f7f7f7] border border-gray-200 flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-900 uppercase">{datum.name}</span>
                    <span className="text-gray-600 text-right text-[11px] font-medium">{datum.usage}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-black" />
                Digital CAD &amp; GIS Deliverable Formats
              </h4>
              <div className="space-y-2">
                {technicalStandards.fileDeliverables.map((item, i) => (
                  <div key={i} className="p-3.5 bg-[#f7f7f7] border border-gray-200 flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-900 uppercase">{item.format}</span>
                    <span className="text-gray-600 text-right text-[11px] font-medium">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setStandardsModal(false);
                scrollTo('contact');
              }}
              className="w-full py-4 bg-black text-white hover:bg-gray-800 font-bold uppercase text-xs tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              Book Survey Consultation <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==== SURVEY DIVISION FOOTER ==== */}
      <SurveyFooter />
    </div>
  );
};

export default SurveyHomePage;
