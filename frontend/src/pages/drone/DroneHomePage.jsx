import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Crosshair, ArrowRight, ArrowUpRight, Plus, Minus, Mail, Phone, MapPin, Download,
  Map as MapIcon, Building2, Home, Mountain, Calendar, TreePine, Landmark, Plane,
  X, Check, Camera, Video, Shield, Layers, Sliders, Menu, Calculator, Clock, CheckCircle2, ShieldCheck
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
// Heading: Aboreto (display, single weight 400).
// Body:    Montserrat (variable, 100-900 + italic).
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Aboreto&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap';

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
            /* Aboreto: single weight 400, used for all display headings
               on the drone page. Pinning weight prevents Tailwind's
               font-bold / font-black utilities from requesting weights
               Aboreto does not ship. */
            .drone-heading {
              font-family: "Aboreto", system-ui, sans-serif;
              font-weight: 400;
              font-style: normal;
            }
            /* Montserrat: variable, 100-900 + italic. Used for body
               copy, nav items, list rows, and small UI labels. */
            .drone-body {
              font-family: "Montserrat", system-ui, sans-serif;
              font-optical-sizing: auto;
              font-weight: 400;
              font-style: normal;
            }
        `;
        add(style);

        return () => {
            created.forEach((n) => n.parentNode && n.parentNode.removeChild(n));
        };
    }, []);
};

const DroneHomePage = () => {
  useFontsEffect();
  const reduce = useReducedMotion();

  useEffect(() => {
    document.title = 'Lami Aerial — Commercial Drone & Aerial Imaging | Chief Pilot Eugene Odibenuah';
  }, []);
  
  // -- Interactive Modal States --
  const [selectedServiceModal, setSelectedServiceModal] = useState(null);
  const [selectedEquipmentModal, setSelectedEquipmentModal] = useState(null);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // -- 4 Unified Commercial Service Pillars --
  const servicePillars = [
    {
      id: 'real-estate',
      category: 'Real Estate & Architecture',
      icon: Home,
      number: '01',
      headline: 'Cinematic Property Showcases',
      description: 'Hero exteriors, twilight architectural flyovers, and full marketing video packages designed to accelerate luxury property sales, listings, and developer presentations.',
      subServices: [
        '48MP RAW Stills (DNG) & HDR Aerial Photography',
        'Cinematic 4K/60fps Stabilized Video Tours (10-bit D-Log M)',
        'Twilight & Sunset Hero Architectural Exteriors',
        'Full Aerial-to-Ground Video Packages for Brokers'
      ],
      timeline: '2–3 business days',
      deliverables: '48MP RAW/JPEG Stills, 4K Color-Graded Video, Social Teasers'
    },
    {
      id: 'construction',
      category: 'Construction & Infrastructure',
      icon: Building2,
      number: '02',
      headline: 'Milestone Progress & Visual Audits',
      description: 'Periodic site flyovers documenting structural milestones for remote stakeholders, paired with high-resolution visual audits of roofs, facades, and hard-to-reach assets.',
      subServices: [
        'Recurring Monthly/Weekly Construction Milestone Flyovers',
        'Investor & Remote Stakeholder Progress Media Packages',
        'High-Resolution Roof, Gutter & Facade Visual Audits',
        'Site Boundary, Drainage & Access Corridor Aerial Documentation'
      ],
      timeline: '3–5 business days per mission',
      deliverables: 'Annotated 4K Progress Reel, High-Res Inspection Stills, Site Time-lapse'
    },
    {
      id: 'commercial',
      category: 'Commercial, Media & Events',
      icon: Camera,
      number: '03',
      headline: 'Hospitality, Tourism & Event Media',
      description: 'Dynamic aerial cinematography for resorts, hotels, tourism destinations, brand campaigns, and cultural events optimized for high-engagement social reels and broadcasts.',
      subServices: [
        'Hotel & Luxury Resort Promotional Flythroughs',
        'Destination, Waterfront & Tourism Marketing Reels',
        'Festival, Sporting & Corporate Event Aerial Coverage',
        'Vertical 9:16 Cutdowns for Instagram Reels, TikTok & Shorts'
      ],
      timeline: '3–5 business days',
      deliverables: 'Horizontal 4K Master Video, 9:16 Vertical Cutdowns, Graded High-Res Stills'
    },
    {
      id: 'mapping',
      category: 'Drone Mapping & Photogrammetry',
      icon: MapIcon,
      number: '04',
      headline: 'Aerial Photogrammetry & Orthomosaic Basemaps',
      description: 'High-overlap aerial photogrammetry missions generating 2D orthomosaic baselines and digital surface models (DSM) for planning, agriculture, and construction site overlays.',
      subServices: [
        'High-Resolution 2D Orthomosaic Basemap Imagery',
        'Photogrammetric Surface Models (DSM) & Elevation Overlays',
        'Site Planning, Agricultural & Subdivision Aerial Overlays',
        'Ground Control Point (GCP) Alignment (Coordinated with Survey Division)'
      ],
      timeline: '3–5 business days',
      deliverables: 'GeoTIFF Orthomosaic, Contour DXF, High-Res PDF Site Basemap'
    }
  ];

  // Filtered service list based on category pill
  const filteredServices = activeCategory === 'ALL'
    ? servicePillars
    : servicePillars.filter(p => p.id === activeCategory);

  // -- Demonstration Projects / Sample Scenarios --
  const fallbackPortfolio = [
    { 
      id: 'fallback-1', 
      title: "Luxury Duplex Development",     
      summary: 'Hero aerials + twilight exteriors demonstrating property marketing capture', 
      industry: 'Real Estate',    
      services: '48MP RAW Stills · Twilight Hero Flyover', 
      equipment: 'DJI Mini 4 Pro (10-bit D-Log M)', 
      location: 'Lagos, Nigeria', 
      year: '2025', 
      isDemo: true,
      image_url: '/images/drone/drone_proj_realestate.webp' 
    },
    { 
      id: 'fallback-2', 
      title: "Estate Construction Progress",  
      summary: 'Recurring construction milestone flyover scenario for multi-unit development',     
      industry: 'Construction',   
      services: 'Milestone Progress · Stakeholder Video', 
      equipment: 'DJI Mini 4 Pro', 
      location: 'Lekki, Nigeria', 
      year: '2025', 
      isDemo: true,
      image_url: '/images/drone/drone_proj_construction.webp' 
    },
    { 
      id: 'fallback-3', 
      title: "Resort Promotional Showcase",       
      summary: 'Cinematic waterfront hospitality tour with amenity reveals and social cutdowns',     
      industry: 'Hospitality',    
      services: 'Cinematic 4K Tour · 9:16 Social Cutdown', 
      equipment: 'DJI Mini 4 Pro (10-bit D-Log M)', 
      location: 'Epe, Nigeria', 
      year: '2024', 
      isDemo: true,
      image_url: '/images/drone/drone_proj_hospitality.webp' 
    },
    { 
      id: 'fallback-4', 
      title: "Subdivision Basemap Photogrammetry",     
      summary: 'Orthomosaic basemap & digital surface model scenario for estate layout planning',     
      industry: 'Aerial Mapping',      
      services: 'Orthomosaic Basemap · DSM Photogrammetry', 
      equipment: 'DJI Mini 4 Pro', 
      location: 'FCT Abuja, Nigeria', 
      year: '2024', 
      isDemo: true,
      image_url: '/images/drone/drone_proj_orthomosaic.webp' 
    },
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
      tagline: "Primary Workhorse · Flagship Aerial Imaging",
      sensor: "1/1.3-inch CMOS, 48MP Effective (Dual Native ISO Fusion)",
      video: "4K / 60fps HDR Video & 4K / 100fps Slow-mo",
      color: "10-bit D-Log M & 10-bit HLG Color Profiles",
      weight: "Sub-249 g Takeoff Weight (Fast Deployment & Agile Operations)",
      flightTime: "Up to 34 minutes per battery pack",
      highlights: [
        "48MP RAW Stills (DNG) for dynamic range & fine detail",
        "10-bit D-Log M Color Profile for broadcast-grade grading",
        "Omnidirectional Binocular Obstacle Sensing",
        "Autonomous Waypoint Mission Repeatability",
      ],
      fullSpecs: [
        { label: "Sensor", value: "1/1.3-inch CMOS, 48MP Effective Pixels (f/1.7)" },
        { label: "Video Resolutions", value: "4K (3840×2160) @ 24/25/30/48/50/60fps HDR; 4K @ 100fps" },
        { label: "Color Profiles", value: "10-bit D-Log M, 10-bit HLG, 8-bit Normal (Pro-Grade)" },
        { label: "Still Photo Formats", value: "48MP RAW (DNG) & 12MP JPEG/DNG" },
        { label: "Gimbal & Optics", value: "3-axis mechanical gimbal with 90° True Vertical Shooting" },
        { label: "Max Flight Time", value: "Up to 34 minutes per Intelligent Flight Battery" },
        { label: "Transmission", value: "DJI O4 up to 20 km FHD live feed (region-dependent)" },
        { label: "Obstacle Sensing", value: "Omnidirectional binocular vision + 3D ToF infrared" },
        { label: "Takeoff Weight", value: "<249 g ultra-lightweight commercial frame" }
      ]
    },
    {
      name: "DJI Mini 4K",
      tagline: "Secondary Rapid-Deployment & Backup Unit",
      sensor: "1/2.3-inch CMOS, 12MP Effective",
      video: "4K Ultra HD @ 24/25/30fps",
      color: "Standard Vibrant 8-Bit Color Profile",
      weight: "Sub-249 g Portable Airframe",
      flightTime: "Up to 31 minutes per battery pack",
      highlights: [
        "4K Ultra HD Stabilized Video Recording",
        "12MP JPEG & RAW (DNG) Still Photography",
        "Quick Deployment for Agile Missions & Redundancy",
        "GPS + GLONASS Satellite Positioning & Smart RTH",
      ],
      fullSpecs: [
        { label: "Sensor", value: "1/2.3-inch CMOS, 12MP Effective Pixels" },
        { label: "Video Resolutions", value: "4K (3840×2160) @ 24/25/30fps; 2.7K & FHD up to 60fps" },
        { label: "Color Profile", value: "Standard 8-Bit Color Profile" },
        { label: "Still Photo Formats", value: "12MP JPEG / RAW (DNG)" },
        { label: "Gimbal Stabilization", value: "3-axis mechanical motorized gimbal" },
        { label: "Max Flight Time", value: "Up to 31 minutes per battery" },
        { label: "Transmission", value: "DJI O2 up to 10 km HD feed" },
        { label: "Flight Safety", value: "Downward vision sensors + GPS Auto Return-to-Home" },
        { label: "Takeoff Weight", value: "<249 g compact airframe" }
      ]
    },
  ];

  // -- Capability highlights --
  const capabilities = [
    { value: "4K / 60",  label: "HDR Video (Mini 4 Pro)" },
    { value: "48 MP",   label: "RAW Stills (DNG)" },
    { value: "10-BIT",  label: "D-Log M (Mini 4 Pro)" },
    { value: "3–5 DAYS", label: "Standard Delivery" },
  ];

  // -- How We Work: 5-step professional workflow --
  const workflow = [
    { step: "01", title: "Project Brief", description: "Scoping consultation to align on shot objectives, site coordinates, required deliverables, and delivery timeline." },
    { step: "02", title: "Mission Planning", description: "Airspace check, regulatory permissions, weather window forecasting, obstacle assessment, and flight paths confirmed." },
    { step: "03", title: "Flight Operations", description: "On-site flight execution with practiced cinematic maneuvers, safety buffers, battery rotations, and live preview." },
    { step: "04", title: "Color & Processing", description: "10-bit D-Log M color grading (Mini 4 Pro), lens correction, stabilization, and photogrammetric orthomosaic processing." },
    { step: "05", title: "Cloud Delivery", description: "Full-resolution master files and cutdowns delivered via secure cloud link, ready for immediate publishing or CAD integration." },
  ];

  // -- Industries we serve (1-Line Compact Icon Strip) --
  const industries = [
    { icon: Home,       title: "Real Estate" },
    { icon: Building2,  title: "Construction" },
    { icon: Landmark,   title: "Architecture" },
    { icon: MapIcon,    title: "Mapping Basemaps" },
    { icon: TreePine,   title: "Hospitality" },
    { icon: Calendar,   title: "Events" },
    { icon: Plane,      title: "Tourism" },
    { icon: Mountain,   title: "Infrastructure" },
  ];

  // -- Why Choose Us: 4 Focused Commercial Differentiators --
  const whyChoose = [
    { 
      number: "01", 
      title: "Rigorous Mission Planning & Airspace Clearance", 
      description: "Every mission is pre-scoped with site coordinates, airspace classification checks, weather briefings, and obstacle hazard assessments before aircraft deployment." 
    },
    { 
      number: "02", 
      title: "4K Cinematic Video & 48MP RAW Stills (DNG)", 
      description: "Crisp 4K/60fps video and 48MP RAW stills captured on the DJI Mini 4 Pro, color-graded with 10-bit D-Log M profiles for balanced dynamic range and level horizons." 
    },
    { 
      number: "03", 
      title: "Dependable 3–5 Day Delivery", 
      description: "Organized cloud delivery of color-graded master video, social cutdowns, and high-res stills within 3 to 5 business days, with express turnaround available." 
    },
    { 
      number: "04", 
      title: "Safe & Compliant Operations", 
      description: "Sub-249g agile airframes, omnidirectional obstacle avoidance, conservative battery margins, and strict adherence to applicable Nigerian civil aviation guidelines." 
    },
  ];

  // -- Transparent Pricing & Quotation Parameters --
  const quoteFactors = [
    {
      icon: MapPin,
      title: "Location & Site Distance",
      description: "Local missions in Lagos/FCT vs. regional mobilization across Nigeria, including access logistics and site terrain."
    },
    {
      icon: Clock,
      title: "Flight Duration & Battery Cycles",
      description: "Single-flight hero showcases vs. multi-battery comprehensive site coverage, recurrent progress flyovers, or full-day missions."
    },
    {
      icon: Camera,
      title: "Capture Scope & Optics",
      description: "48MP RAW stills (DNG), 4K/60fps 10-bit D-Log M cinematic video, or high-overlap aerial photogrammetry orthomosaics."
    },
    {
      icon: Sliders,
      title: "Post-Processing & Turnaround",
      description: "Standard 3–5 business day delivery vs. express rush turnarounds, specialized color grading, or 9:16 vertical social cutdowns."
    }
  ];

  // -- Realistic client questions & authoritative answers --
  const faqs = [
    { 
      q: "Can you fly anywhere in Nigeria?",          
      a: "Missions are conducted across Nigeria (frequently in Lagos, Ogun, Oyo, and FCT Abuja) subject to Nigerian Civil Aviation Authority (NCAA) airspace restrictions, necessary local authorisations/clearances where applicable, weather windows, and on-site safety assessments. Longer-distance regional deployments are quoted with standard mobilization." 
    },
    { 
      q: "How does pricing and quotation work?",       
      a: "Every flight mission is quoted individually based on site location, flight complexity, required deliverables (48MP RAW stills, 4K 10-bit video, or photogrammetry basemaps), battery cycle requirements, and editing turnaround. Request a quote with your site details for a clear, transparent scope." 
    },
    { 
      q: "How long does post-processing and delivery take?", 
      a: "Standard photo packages are delivered within 2–3 business days. Cinematic 4K video edits and photogrammetry orthomosaics typically take 3–5 business days. Express same-day or 24-hour turnaround is available on request for urgent marketing campaigns." 
    },
    { 
      q: "Do you provide RAW stills and log footage?", 
      a: "Yes. Clients can request 48MP RAW stills (DNG) and 10-bit D-Log M master video files captured on our flagship DJI Mini 4 Pro alongside the final graded deliverables." 
    },
    { 
      q: "What is the difference between your drone mapping and your survey division?", 
      a: "Drone mapping delivers high-resolution aerial imagery, 2D orthomosaics, and photogrammetric digital surface models (DSM) for planning, agriculture, and construction visuals. For legally binding boundary demarcation, registered cadastral surveys, ground control, and certified engineering setting out, our professional Survey Division executes full SURCON-supervised services." 
    },
    { 
      q: "Can you work with construction companies on milestone schedules?", 
      a: "Yes. We offer recurring monthly or milestone-based construction progress flyovers, high-resolution facade/roof visual audits, and stakeholder-ready video reels with fixed scheduled deployment windows." 
    },
    { 
      q: "How do weather and wind affect flight operations?", 
      a: "High winds exceeding aircraft safety limits, heavy rain, or severe low-visibility conditions can delay flights. We monitor weather windows closely in the 48 hours prior to takeoff and reschedule at no additional cost if conditions compromise safety." 
    },
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
    <div className="min-h-screen flex flex-col font-sans drone-body">
      {/* Main Content */}
      <div className="flex-1 bg-[#f4f4f4] overflow-y-auto overflow-x-hidden flex flex-col relative scrollbar-hide">

        {/* ==== NAVBAR ==== */}
        <header className="flex justify-between items-center px-6 md:px-12 py-5 z-40 relative sticky top-0 bg-[#f4f4f4]/95 backdrop-blur-md border-b border-gray-200/60">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 font-black text-lg sm:text-xl tracking-tighter text-gray-900">
              <Crosshair className="w-5 h-5 text-accent" /> Lami Aerial
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 hidden sm:block">
              Commercial Drone &amp; Aerial Imaging
            </span>
          </div>

          <nav className="hidden lg:flex gap-8 text-sm text-gray-500 font-medium">
            <button onClick={() => scrollTo('services')}  className="hover:text-black transition-colors">Services</button>
            <button onClick={() => scrollTo('why-choose')} className="hover:text-black transition-colors">Why Lami Aerial</button>
            <button onClick={() => scrollTo('workflow')}  className="hover:text-black transition-colors">Workflow</button>
            <button onClick={() => scrollTo('portfolio')} className="hover:text-black transition-colors">Portfolio</button>
            <button onClick={() => scrollTo('equipment')} className="hover:text-black transition-colors">Equipment</button>
            <button onClick={() => scrollTo('pricing')}   className="hover:text-black transition-colors">Pricing</button>
            <button onClick={() => scrollTo('faq')}       className="hover:text-black transition-colors">FAQ</button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollTo('contact')}
              className="hidden lg:flex bg-black text-white rounded-full py-2.5 px-5 text-xs font-bold tracking-wide hover:bg-accent transition-colors items-center gap-2 group active:scale-95"
            >
              Book a Flight <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Panel */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out z-30 bg-[#f4f4f4]/98 backdrop-blur-md border-b border-gray-200/60 ${
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="flex flex-col px-6 py-4 gap-1">
            {[
              { label: 'Services', id: 'services' },
              { label: 'Why Lami Aerial', id: 'why-choose' },
              { label: 'Workflow', id: 'workflow' },
              { label: 'Portfolio', id: 'portfolio' },
              { label: 'Equipment', id: 'equipment' },
              { label: 'Pricing & Estimates', id: 'pricing' },
              { label: 'FAQ', id: 'faq' },
              { label: 'Book a Flight', id: 'contact' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { scrollTo(item.id); setMobileMenuOpen(false); }}
                className="py-3 px-4 text-left text-sm font-semibold text-gray-700 hover:text-black hover:bg-white/60 rounded-xl transition-colors min-h-[44px]"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => { scrollTo('contact'); setMobileMenuOpen(false); }}
              className="mt-2 bg-black text-white rounded-full py-3 px-6 text-xs font-bold tracking-wide hover:bg-accent transition-colors text-center min-h-[44px]"
            >
              Book a Flight
            </button>
          </nav>
        </div>

        {/* ==== HERO SECTION (Cinematic dark editorial: 58/42 split, real aerial photo + glassmorphism equipment card) ==== */}
        <section
          id="hero"
          className="relative min-h-[88dvh] flex flex-col shrink-0 justify-center overflow-hidden bg-[#0a0a0a] text-white"
        >
          {/* Atmospheric radial accents (warm glow anchored to the brand accent) */}
          <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
            <div className="absolute -top-32 -left-24 w-[40rem] h-[40rem] rounded-full opacity-25"
                 style={{ background: 'radial-gradient(circle, rgba(244,74,34,0.32) 0%, transparent 60%)' }} />
            <div className="absolute bottom-[-12rem] right-[-8rem] w-[36rem] h-[36rem] rounded-full opacity-20"
                 style={{ background: 'radial-gradient(circle, rgba(244,74,34,0.22) 0%, transparent 60%)' }} />
          </div>

          {/* Subtle film grain (Apple-style, scoped to hero, no scroll-jank) */}
          <div
            className="pointer-events-none absolute inset-0 z-[2] opacity-[0.05] mix-blend-overlay"
            aria-hidden="true"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
              backgroundSize: '240px 240px',
            }}
          />

          {/* Top-right operational HUD: real Lagos coordinates, AGL altitude, status. */}
          <div className="hidden md:flex absolute top-6 right-6 lg:right-10 z-20 items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              <span className="text-white/80">Mission Active</span>
            </div>
            <span className="w-px h-3 bg-white/15" aria-hidden="true" />
            <span className="font-mono tracking-[0.15em] text-white/60">06°31'N 003°22'E</span>
            <span className="w-px h-3 bg-white/15" aria-hidden="true" />
            <span className="font-mono tracking-[0.15em] text-white/60">AGL 124m</span>
          </div>

          <div className="flex flex-1 relative z-10 pt-20 md:pt-20">

            {/* Left Pane (58%) — cinematic editorial typography. */}
            <div className="w-full md:w-[58%] flex flex-col justify-center px-6 md:px-10 lg:px-16 py-10 md:py-14 z-10">
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3 mb-7"
              >
                <span className="h-px w-10 bg-accent" aria-hidden="true" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/65">
                  Commercial Drone Operations
                </span>
              </motion.div>

              <motion.h1
                initial={reduce ? false : { opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.0, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="drone-heading tracking-[-0.025em] leading-[0.95] mb-7 text-white"
                style={{ fontSize: 'clamp(2.6rem, 5.5vw, 5.2rem)' }}
              >
                See Your Project<br />
                <span className="text-white/35">From Above.</span>
              </motion.h1>

              <motion.p
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="text-sm md:text-base text-white/65 font-medium leading-relaxed max-w-md mb-10"
              >
                Commercial drone services in Nigeria. HDR cinematography, photogrammetry basemaps, and inspection stills for real estate, construction, and events.
              </motion.p>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap items-center gap-6"
              >
                <button
                  onClick={() => scrollTo('contact')}
                  className="group bg-white text-black rounded-full py-3.5 pl-7 pr-2 flex items-center gap-3 hover:bg-accent hover:text-white transition-colors active:scale-[0.98] shadow-[0_8px_30px_rgba(244,74,34,0.18)]"
                >
                  <span className="font-bold text-sm">Book a Flight</span>
                  <span className="bg-black text-white rounded-full w-7 h-7 flex items-center justify-center group-hover:translate-x-0.5 transition-transform shrink-0">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
                <button
                  onClick={() => scrollTo('portfolio')}
                  className="font-bold text-sm underline decoration-2 underline-offset-[6px] decoration-white/30 text-white/85 hover:text-accent hover:decoration-accent transition-colors"
                >
                  View Portfolio
                </button>
              </motion.div>
            </div>

            {/* Right Pane (42%) - Real aerial photo + glassmorphism equipment card. */}
            <div className="w-full md:w-[42%] hidden md:flex flex-col justify-center px-4 md:px-6 lg:px-10 py-10 md:py-14 z-10 relative">
              <div className="relative w-full mx-auto" style={{ maxWidth: '560px' }}>

                {/* Aerial photo with slow Ken Burns scale-in for cinematic depth. */}
                <motion.div
                  initial={reduce ? false : { opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full aspect-[4/5] overflow-hidden rounded-2xl"
                  style={{ boxShadow: '0 30px 80px -20px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)' }}
                >
                  <img
                    src="/images/drone/drone_proj_hospitality.webp"
                    alt="Aerial photograph of a coastal resort at sunset, captured on a commercial drone mission"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                  {/* Subtle gradient overlay: lets the photo sit in the dark theme without competing with text. */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-black/15" />
                  {/* Crosshair-style frame: signals "ops viewfinder" without an LLM AI-tell. */}
                  <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/40" aria-hidden="true" />
                  <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/40" aria-hidden="true" />
                  <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/40" aria-hidden="true" />
                  <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/40" aria-hidden="true" />
                </motion.div>

                {/* Glassmorphism equipment card: real DJI Mini 4 Pro specs (radical authenticity). */}
                <motion.div
                  initial={reduce ? false : { opacity: 0, x: 24, y: 8 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 1.0, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute -bottom-7 -left-4 lg:-left-10 w-[78%] max-w-[320px] rounded-2xl border border-white/10 p-5 backdrop-blur-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%)',
                    boxShadow:
                      'inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(255,255,255,0.04), 0 24px 60px -10px rgba(0,0,0,0.55)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/65">Primary Airframe</span>
                  </div>
                  <h3 className="drone-heading text-xl text-white mb-0.5">DJI Mini 4 Pro</h3>
                  <p className="text-[10px] text-white/45 font-medium mb-3.5 tracking-wide">249g takeoff weight</p>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 pt-3 border-t border-white/10">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mb-0.5">Video</p>
                      <p className="text-xs text-white font-semibold">4K / 100fps HDR</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mb-0.5">Stills</p>
                      <p className="text-xs text-white font-semibold">48MP DNG RAW</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mb-0.5">Profile</p>
                      <p className="text-xs text-white font-semibold">10-bit D-Log M</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mb-0.5">Missions</p>
                      <p className="text-xs text-white font-semibold">Waypoint + RTH</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Mobile-only: photo + compact glass card stacked. */}
          <div className="md:hidden flex flex-col gap-5 px-6 pb-12 relative z-10">
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl"
              style={{ boxShadow: '0 20px 50px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)' }}
            >
              <img
                src="/images/drone/drone_proj_hospitality.webp"
                alt="Aerial photograph captured on a commercial drone mission"
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
            </motion.div>
            <div
              className="rounded-2xl border border-white/10 p-5 backdrop-blur-xl"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%)' }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/65">Primary Airframe</span>
              </div>
              <h3 className="drone-heading text-lg text-white mb-0.5">DJI Mini 4 Pro</h3>
              <p className="text-[11px] text-white/50 font-medium">4K HDR · 48MP · 249g</p>
            </div>
          </div>
        </section>

        {/* ==== CAPABILITIES BANNER ==== */}
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
          id="services"
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
                  Four specialized commercial disciplines flown on lightweight DJI aircraft, engineered for marketing clarity, construction monitoring, and photogrammetric baseline data.
                </p>
              </div>
              <button 
                onClick={() => scrollTo('contact')} 
                className="bg-black text-white rounded-full py-4 px-8 text-sm font-bold tracking-wide hover:bg-accent transition-colors shadow-lg shadow-black/20 shrink-0"
              >
                Book a Flight
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              {[
                { id: 'ALL', label: 'All Disciplines' },
                { id: 'real-estate', label: 'Real Estate & Architecture' },
                { id: 'construction', label: 'Construction & Inspection' },
                { id: 'commercial', label: 'Commercial & Events' },
                { id: 'mapping', label: 'Mapping & Photogrammetry' },
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

            {/* Service Pillars Grid */}
            <div className="flex md:grid md:grid-cols-2 gap-6 overflow-x-auto md:overflow-visible pb-6 md:pb-0 snap-x snap-mandatory scrollbar-none -mx-6 px-6 md:mx-0 md:px-0">
              {filteredServices.map((service, index) => {
                const ServiceIcon = service.icon;
                return (
                <div
                  key={service.id}
                  className={`w-[85vw] sm:w-[320px] md:w-auto shrink-0 snap-center drone-observe bg-[#f4f4f4] rounded-[2rem] p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-500 group border border-transparent hover:border-gray-200 ${visibleElements.has(`service-${index}`) ? 'opacity-100' : 'opacity-0'}`}
                  data-id={`service-${index}`}
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <ServiceIcon className="w-8 h-8 text-accent group-hover:scale-110 transition-transform duration-300 origin-bottom-left" />
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
                );
              })}
            </div>
          </div>
        </section>

        {/* ==== WHY CHOOSE US (4 Focused Differentiators) ==== */}
        <section 
          id="why-choose"
          ref={(el) => (sectionsRef.current['why-choose'] = el)}
          className="px-6 md:px-12 py-24 max-w-7xl mx-auto w-full shrink-0"
        >
          <div className={`drone-observe mb-12 ${visibleElements.has('why-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="why-header">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— Commercial Reliability</p>
            <h2 className="drone-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 leading-[0.95]">
              Why Clients<br/>Hire Me
            </h2>
          </div>
          <div className="space-y-6">
            {/* Hero Differentiator Card */}
            <div
              className={`drone-observe bg-black text-white rounded-[2rem] p-10 md:p-14 ${
                visibleElements.has('why-0') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              } transition-all duration-700`}
              data-id="why-0"
            >
              <span className="drone-heading text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-5 block">{whyChoose[0].number}</span>
              <h3 className="drone-heading text-2xl md:text-3xl font-black uppercase tracking-tight mb-4 text-white">{whyChoose[0].title}</h3>
              <p className="text-sm leading-relaxed font-medium text-white/70 max-w-2xl">{whyChoose[0].description}</p>
            </div>

            {/* Supporting Differentiator Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {whyChoose.slice(1).map((item, idx) => (
                <div
                  key={idx + 1}
                  className={`drone-observe bg-[#f4f4f4] rounded-[2rem] p-8 hover:bg-black hover:text-white transition-colors duration-500 group ${
                    visibleElements.has(`why-${idx + 1}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  data-id={`why-${idx + 1}`}
                  style={{ transitionDelay: `${(idx + 1) * 80}ms` }}
                >
                  <span className="drone-heading text-xs font-black uppercase tracking-[0.3em] text-gray-400 group-hover:text-white/60 mb-4 block">{item.number}</span>
                  <h3 className="drone-heading text-base font-black uppercase tracking-tight mb-3">{item.title}</h3>
                  <p className="text-xs leading-relaxed font-medium text-gray-600 group-hover:text-white/70">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==== HOW WE WORK (5-Step Workflow) ==== */}
        <section
          id="workflow"
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

        {/* ==== INDUSTRIES SECTION (Compact Strip) ==== */}
        <section className="px-6 md:px-12 py-12 max-w-7xl mx-auto w-full shrink-0">
          <div className="bg-white rounded-3xl p-8 border border-gray-100">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-6 text-center md:text-left">— Sectors Served</p>
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

        {/* ==== PORTFOLIO SECTION (Clearly labeled Selected Work / Demonstrations) ==== */}
        <section
          id="portfolio"
          ref={(el) => (sectionsRef.current['portfolio'] = el)}
          className="px-6 md:px-12 py-24 max-w-7xl mx-auto w-full shrink-0"
        >
          <div className={`drone-observe flex flex-col md:flex-row justify-between items-end mb-16 gap-6 ${visibleElements.has('portfolio-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="portfolio-header">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— Selected Work &amp; Demonstration Projects</p>
              <h2 className="drone-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 leading-[0.95]">
                Sample<br/>Missions
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-3 max-w-lg">
                Demonstration scenarios illustrating capture parameters, optics, and deliverables across commercial sectors.
              </p>
            </div>
            <button 
              onClick={() => scrollTo('contact')} 
              className="text-sm font-bold underline decoration-2 underline-offset-4 hover:text-accent transition-colors"
            >
              Book a Flight
            </button>
          </div>

          <div className="flex md:grid md:grid-cols-2 gap-6 overflow-x-auto md:overflow-visible pb-6 md:pb-0 snap-x snap-mandatory scrollbar-none -mx-6 px-6 md:mx-0 md:px-0" role="region" aria-label="Drone portfolio projects" aria-busy={portfolioLoading}>
            {portfolioLoading && portfolio.length === 0 ? (
              <>
                {[0, 1, 2, 3].map((i) => (
                  <div key={`skel-${i}`} className="w-[85vw] sm:w-[320px] md:w-auto shrink-0 snap-center animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200 rounded-2xl mb-4" />
                    <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-1" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </>
            ) : portfolio.map((proj, idx) => {
              const isFallback = typeof proj.id === 'string' && proj.id.startsWith('fallback-');
              const tag = (proj.tags && proj.tags[0]) || proj.industry || proj.category || 'Drone';
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
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-white text-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-md">
                        {tag}
                      </span>
                      {isFallback && (
                        <span className="bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider rounded-full border border-white/20">
                          Sample Scenario
                        </span>
                      )}
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
                      {proj.equipment && (
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-gray-400">Aircraft</span>
                          <span className="text-gray-700">{proj.equipment}</span>
                        </div>
                      )}
                      {proj.services && (
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-gray-400">Deliverables</span>
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

        {/* ==== HARDWARE FLEET (Explicit Mini 4 Pro vs Mini 4K separation) ==== */}
        <section
          id="equipment"
          ref={(el) => (sectionsRef.current['equipment'] = el)}
          className="px-6 md:px-12 py-24 max-w-7xl mx-auto w-full shrink-0"
        >
          <div className={`drone-observe mb-16 ${visibleElements.has('equipment-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="equipment-header">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— Owned Hardware</p>
            <h2 className="drone-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 leading-[0.95]">
              Flight<br/>Equipment
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-3 max-w-lg">
              Dedicated sub-249g commercial aircraft configured for rapid on-site setup, low acoustic footprint, and razor-sharp optics.
            </p>
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
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-1">{drone.tagline}</p>
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

        {/* ==== SURVEY DIVISION DISTINCTION & CROSS-LINK ==== */}
        <section 
          id="sister-division"
          className="px-6 md:px-12 py-16 max-w-7xl mx-auto w-full shrink-0"
        >
          <div className="bg-black text-white rounded-[2.5rem] p-8 md:p-16 grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-12 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold tracking-widest uppercase text-accent mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                Sister Division Distinction
              </div>
              <h2 className="drone-heading text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-6">
                Need Certified<br />Legal Land<br />Survey Data?
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6 max-w-md text-sm font-normal">
                <strong className="text-white">Drone mapping</strong> produces aerial data, orthomosaics, and photogrammetric surface models.
              </p>
              <p className="text-gray-400 leading-relaxed mb-8 max-w-md text-sm font-normal">
                For legally binding boundary beaconing, registered cadastral surveys, SURCON lodgements, and engineering site setting out, our dedicated <strong className="text-white">Survey Division</strong> provides complete professional execution.
              </p>
              <Link
                to="/survey"
                className="inline-flex items-center gap-3 bg-white text-black px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-accent hover:text-white transition-colors group"
              >
                Explore Survey Division
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="bg-white/[0.04] p-6 rounded-3xl border border-white/10 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block pb-2 border-b border-white/10">
                Professional Survey Capabilities:
              </span>
              <ul className="space-y-3 text-xs font-bold uppercase tracking-wider text-gray-300">
                <li className="flex justify-between items-center"><span>Legal Boundary Surveys</span><span className="text-accent text-[10px]">SURCON</span></li>
                <li className="flex justify-between items-center"><span>Cadastral Mapping &amp; Lodgement</span><span className="text-accent text-[10px]">Legal</span></li>
                <li className="flex justify-between items-center"><span>Topographic Total Station Baselines</span><span className="text-accent text-[10px]">Contours</span></li>
                <li className="flex justify-between items-center"><span>Construction Setting Out</span><span className="text-accent text-[10px]">Axis</span></li>
                <li className="flex justify-between items-center"><span>DGPS Ground Control Points (GCP)</span><span className="text-accent text-[10px]">Control</span></li>
                <li className="flex justify-between items-center"><span>Estate Subdivisions</span><span className="text-accent text-[10px]">Partitioning</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* ==== PRICING & QUOTE EXPECTATIONS SECTION (New Dedicated Section) ==== */}
        <section 
          id="pricing"
          ref={(el) => (sectionsRef.current['pricing'] = el)}
          className="px-6 md:px-12 py-20 max-w-7xl mx-auto w-full shrink-0"
        >
          <div className="bg-gradient-to-br from-zinc-900 to-black text-white rounded-[2.5rem] p-8 md:p-14 border border-zinc-800 shadow-2xl relative overflow-hidden">
            <div className="max-w-3xl mb-12">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-accent mb-3">— Transparent Quotations</p>
              <h2 className="drone-heading text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
                Pricing &amp; Quote Expectations
              </h2>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed font-normal">
                Every mission is quoted individually based on location, flight complexity, required deliverables, number of batteries/flights, editing requirements, and project duration.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {quoteFactors.map((factor, idx) => {
                const FactorIcon = factor.icon;
                return (
                  <div key={idx} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent mb-4">
                        <FactorIcon className="w-5 h-5" />
                      </div>
                      <h4 className="drone-heading text-sm font-bold text-white mb-2">{factor.title}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed font-normal">{factor.description}</p>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 font-bold uppercase">Parameter 0{idx + 1}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Transparent written proposals with clear deliverable timelines and no hidden fees.</span>
              </div>
              <button
                onClick={() => scrollTo('contact')}
                className="w-full sm:w-auto bg-white text-black hover:bg-accent hover:text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shrink-0 shadow-lg"
              >
                Request a Mission Quote <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ==== FAQ SECTION ==== */}
        <section
          id="faq"
          ref={(el) => (sectionsRef.current['faq'] = el)}
          className="bg-white px-6 md:px-12 py-24 shrink-0"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
            <div className={`drone-observe ${visibleElements.has('faq-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="faq-header">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— Client Guidance</p>
              <h2 className="drone-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 leading-[0.95]">
                Frequently<br/>Answered
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-4 max-w-sm">
                Key questions on airspace clearances, technical camera optics, weather safety, and photogrammetry outputs.
              </p>
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
                    <span className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-accent transition-colors pr-4">
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
                      openFaq === idx ? 'max-h-64 pb-6' : 'max-h-0'
                    }`}
                  >
                    <p className="text-gray-600 text-sm leading-relaxed pr-12 font-medium">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==== CONTACT / MISSION QUOTE SECTION ==== */}
        <section
          id="contact"
          ref={(el) => (sectionsRef.current['contact'] = el)}
          className="px-6 md:px-12 py-24 max-w-7xl mx-auto w-full shrink-0"
        >
          <div className="bg-black text-white rounded-[2.5rem] p-8 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-4">— Direct Dispatch</p>
              <h2 className="drone-heading text-4xl md:text-5xl font-black tracking-tighter leading-[0.95] mb-6">
                Request a<br/>Mission Quote
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8 max-w-md text-sm">
                Tell us about your project — location coordinates, required visual deliverables, timeline, and site specifics. We will respond with an itemized quote within 24 hours.
              </p>

              <div className="space-y-4">
                <a href="mailto:drone@buildwithlami.com" className="flex items-center gap-3 text-sm hover:text-accent transition-colors">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center"><Mail className="w-4 h-4 text-accent" /></div>
                  <span>drone@buildwithlami.com</span>
                </a>
                <a href="tel:+2349064185442" className="flex items-center gap-3 text-sm hover:text-accent transition-colors">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center"><Phone className="w-4 h-4 text-accent" /></div>
                  <span>+234 906 418 5442</span>
                </a>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center"><MapPin className="w-4 h-4 text-accent" /></div>
                  <span>Lagos Base · Deployments Nationwide Across Nigeria</span>
                </div>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleBooking} noValidate aria-label="Drone mission quote request">
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
                  placeholder="Phone number (WhatsApp preferred)"
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
                  placeholder="Project location / Coordinates"
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
                  placeholder="Target flight date"
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
                  placeholder="Tell us about your mission requirements (deliverables, site conditions, timing)..."
                  value={booking.notes}
                  onChange={e => handleBookingFieldChange('notes', e.target.value)}
                  className="w-full bg-transparent border-b-2 border-white/20 py-3 text-white placeholder-white/40 focus:outline-none focus:border-accent transition-colors resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={bookingStatus === 'submitting'}
                aria-busy={bookingStatus === 'submitting'}
                className={`w-full py-4 text-xs font-bold uppercase tracking-[0.2em] rounded-full flex items-center justify-center gap-3 group transition-colors ${
                  bookingStatus === 'success'
                    ? 'bg-green-500 text-white'
                    : bookingStatus === 'error'
                    ? 'bg-red-500 text-white'
                    : bookingStatus === 'submitting'
                    ? 'bg-white/20 text-white/50 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-accent hover:text-white'
                }`}
              >
                {bookingStatus === 'success' ? '✓ Quote Request Sent — Responding within 24 hours' : bookingStatus === 'error' ? '✗ Try Again' : bookingStatus === 'submitting' ? 'Submitting...' : 'Request Mission Quote'}
                {bookingStatus === 'idle' && <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />}
              </button>
              {bookingStatus === 'error' && (
                <p role="alert" className="text-xs text-red-300 font-medium text-center">Something went wrong. Please try again or contact us directly.</p>
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
              {(() => { const ModalIcon = selectedServiceModal.icon; return <ModalIcon className="w-10 h-10 text-accent shrink-0" />; })()}
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
                  src={selectedEquipmentModal.name.includes('Pro') ? '/images/drone/drone_thumb_mini4pro.webp' : '/images/drone/drone_thumb_mini4k.webp'} 
                  alt={selectedEquipmentModal.name} 
                  className="w-full h-full object-contain" 
                  loading="lazy"
                  decoding="async"
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

      {/* Animations style tag */}
      <style dangerouslySetInnerHTML={{__html: `
        /* ── Scrollbar hide ─────────────────────────── */
        .scrollbar-hide::-webkit-scrollbar,
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-hide,
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

        /* ── Hero reduced-motion guard ──────────────── */
        @media (prefers-reduced-motion: reduce) {
          .animate-ping { animation: none !important; }
        }
      `}} />
    </div>
  );
};

export default DroneHomePage;
