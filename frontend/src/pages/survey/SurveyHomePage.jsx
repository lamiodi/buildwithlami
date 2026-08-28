import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowUpRight, 
  Plus, 
  Minus, 
  Download, 
  Check, 
  X, 
  Layers, 
  Shield, 
  Compass, 
  FileText, 
  Sliders,
  MapPin,
  Phone,
  Mail,
  Menu,
  CheckCircle2,
  Cpu,
  Target,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Building2,
  Calendar,
  Activity,
  UserCheck,
  Award
} from 'lucide-react';
import { api } from '../../services/api';
import { surveyPlaceholder, projectPlaceholder } from '../../utils/placeholders';
import { validateBooking, validateField } from '../../utils/formValidation';
import { CONTACT } from '../../config/contact';
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
// Heading: Antic Didone (display serif, single weight 400).
// Body:    Manrope (variable sans, 200-800).
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Antic+Didone&family=Manrope:wght@200..800&display=swap';

const useFontsEffect = () => {
  const fontRef = useRef(null);
  
  useLayoutEffect(() => {
    if (typeof document === 'undefined') return;

    // Clean existing survey fonts to avoid duplicate styles
    const existingLink = document.querySelector('link[href*="Manrope"], link[href*="Mulish"], link[href*="Antic+Didone"]');
    const existingStyle = document.querySelector('style[data-survey-fonts]');
    if (existingLink) existingLink.remove();
    if (existingStyle) existingStyle.remove();

    const created = [];
    const add = (node) => { document.head.appendChild(node); created.push(node); fontRef.current = created; };

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
    style.setAttribute('data-survey-fonts', '');
    style.textContent = `
      /* Antic Didone: single weight 400, used for all display
         headings on the survey page. Pinning weight prevents
         Tailwind's font-bold / font-black utilities from
         requesting weights Antic Didone does not ship. */
      .survey-heading {
        font-family: "Antic Didone", serif;
        font-weight: 400;
        font-style: normal;
        /* Slight open tracking: Didone display serifs read
           tighter in UPPERCASE than they render, and the
           default tracking-tight Tailwind utility was
           crushing the hairline strokes. 0.04em keeps the
           heads tight while restoring legibility on every
           h1 / h2 / h3 that uses this class. Loaded after
           Tailwind so it wins the cascade against
           .tracking-tight at equal specificity. */
        letter-spacing: 0.04em;
      }
      /* Manrope: variable, 200-800. Used for body copy,
         nav items, list rows, and small UI labels. */
      .survey-body {
        font-family: "Manrope", sans-serif;
        font-optical-sizing: auto;
        font-weight: 400;
        font-style: normal;
      }
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

// ── Reusable Interactive 3-Image Carousel Component ──────────────────────
const ProjectImageCarousel = ({ images, title, tag }) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  const prevSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const safeImages = images && images.length > 0 ? images : [
    { url: '/images/survey/survey_proj_boundary.webp', caption: 'Field Demarcation' }
  ];

  const currentImg = safeImages[currentIdx] || safeImages[0];

  return (
    <div className="bg-gray-900 aspect-[16/10] mb-5 relative overflow-hidden group select-none">
      {/* Active Image */}
      <img
        src={typeof currentImg === 'string' ? currentImg : currentImg.url}
        alt={`${title} - slide ${currentIdx + 1}`}
        className="w-full h-full object-cover transition-all duration-700 ease-out"
        loading="lazy"
        decoding="async"
      />

      {/* Top Tag & Slide Counter */}
      <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10 pointer-events-none">
        <span className="bg-black/90 backdrop-blur-md text-white px-2.5 py-1 text-[9px] font-bold tracking-widest uppercase border border-white/20">
          {tag}
        </span>
        <span className="bg-black/80 backdrop-blur-md text-white/90 px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider border border-white/20">
          {currentIdx + 1} / {safeImages.length}
        </span>
      </div>

      {/* Image Caption Overlay */}
      {typeof currentImg === 'object' && currentImg.caption && (
        <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
          <div className="bg-black/75 backdrop-blur-sm text-white/90 px-2.5 py-1 text-[10px] font-semibold tracking-wider max-w-fit border border-white/10">
            {currentImg.caption}
          </div>
        </div>
      )}

      {/* Carousel Arrow Controls (Visible on hover & touch) */}
      {safeImages.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 z-20 border border-white/20 active:scale-95"
            aria-label="Previous Project Image"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 z-20 border border-white/20 active:scale-95"
            aria-label="Next Project Image"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-20">
            {safeImages.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIdx(i);
                }}
                className={`h-1.5 rounded-none transition-all ${
                  currentIdx === i ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Jump to image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const SurveyHomePage = () => {
  useFontsEffect();

  // -- Mobile nav state --
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // -- Booking form state --
  const [booking, setBooking] = useState({
    full_name: '', email: '', phone: '', service: '', location: '', preferred_date: '', notes: '',
  });
  const [bookingStatus, setBookingStatus] = useState('idle'); // idle | submitting | success | error
  const [bookingErrors, setBookingErrors] = useState({});

  // -- Modal & Filter States --
  const [selectedServiceModal, setSelectedServiceModal] = useState(null);
  const [selectedCaseStudyModal, setSelectedCaseStudyModal] = useState(null);
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
      headline: 'Boundary & Cadastral Demarcation',
      description: 'Perimeter boundary demarcation, physical beacon pillar monumentation, and cadastral survey plans prepared under the supervision of SURCON-registered surveyors for land title verification and statutory lodgement.',
      deliverables: 'Survey Plan, Beacon Coordinate Register, AutoCAD (.DWG/.DXF), Deed Plan Annexure',
      timeline: '3–5 business days',
      subItems: [
        'Perimeter Boundary Demarcation & Beacon Monumentation',
        'Project-Specific Coordinate Controls (Minna Datum / UTM Zone 31N/32N / WGS84)',
        'Lodgement-Ready Cadastral Survey Plans',
        'Title Boundary Verification & Boundary Dispute Reconciliation'
      ]
    },
    {
      id: 'topographic',
      category: 'Topographic Baseline Surveys',
      number: '02',
      headline: '2D & 3D Terrain, Contours & Elevation Baselines',
      description: 'Comprehensive digital elevation models, spot heights, contour baselines, and built-asset inventories designed for architectural master planning, drainage engineering, and site feasibility studies.',
      deliverables: '2D/3D Contour Plan, Digital Elevation Model (DEM), Spot Heights Grid, GeoTIFF Orthomosaic',
      timeline: '4–7 business days',
      subItems: [
        'Custom Contour Interval Generation (0.5m / 1.0m intervals)',
        'Digital Terrain & Surface Modeling (DTM / DSM)',
        'Natural & Built Feature Geospatial Asset Location',
        'Earthwork Cut & Fill Volumetric Computation'
      ]
    },
    {
      id: 'engineering',
      category: 'Engineering & Construction Setting Out',
      number: '03',
      headline: 'Construction Layouts & Axis Alignment',
      description: 'Translating structural, architectural, and civil blueprints onto physical ground with high-precision Total Station grid pegging, column axis control, and as-built deviation audits.',
      deliverables: 'Setting Out Certificate, Grid Alignment Sheet, As-Built Deviation Report',
      timeline: 'Scheduled per project milestone',
      subItems: [
        'Building Footprint & Column Grid Alignment Staking',
        'Road Centerlines, Corridors & Invert Drainage Levels',
        'Pile Position & Foundation Axis Precision Control',
        'As-Built Quality Assurance & Structural Tolerance Audits'
      ]
    },
    {
      id: 'subdivision',
      category: 'Estate Layout & Land Subdivision',
      number: '04',
      headline: 'Master Plan Demarcation & Plot Partitioning',
      description: 'Partitioning large landholdings and commercial estates into demarcated units with road network alignment, utility reservations, and drainage corridors.',
      deliverables: 'Master Subdivision Plan, Individual Plot Beacon Sheets, Road Network Layout',
      timeline: '1–2 weeks depending on acreage',
      subItems: [
        'Master Layout Plot Demarcation & Perimeter Pillar Staking',
        'Estate Road Network Alignment & Right-of-Way Staking',
        'Utility Corridor & Drainage Reservation Planning',
        'Commercial, Residential & Green Zone Allocation Plans'
      ]
    }
  ];

  const filteredServices = activeCategory === 'ALL'
    ? servicePillars
    : servicePillars.filter(s => s.id === activeCategory);

  // 5-Step Methodology / Workflow
  const workflowSteps = [
    {
      step: '01',
      title: 'Project Brief & Scope Review',
      description: 'We examine your site title documents, boundary intent, statutory requirements, and precision specifications to structure an itemized project scope and schedule.'
    },
    {
      step: '02',
      title: 'Reconnaissance & Control Setup',
      description: 'On-site reconnaissance to inspect access conditions, recover existing boundary monuments, and establish primary control points tied to available verified survey control or project-specified reference systems.'
    },
    {
      step: '03',
      title: 'Field Observation & Data Capture',
      description: 'Executing precision fieldwork using multi-frequency GNSS RTK receivers, electronic Total Station traverses, and calibrated aerial photogrammetry drones.'
    },
    {
      step: '04',
      title: 'Computation & Quality Control',
      description: 'Traverse closure computations, coordinate transformations, error residual adjustments, and rigorous boundary reconciliation before final plan preparation.'
    },
    {
      step: '05',
      title: 'Professional Deliverables & Handover',
      description: 'Preparation and handover of survey plans, coordinate registers, AutoCAD (.DWG/.DXF) drawings, digital terrain models, and applicable lodgement documentation under the required professional supervision.'
    }
  ];

  // Precision Instrument Roster
  const precisionEquipment = [
    {
      name: "Multi-Frequency GNSS RTK Receiver",
      tagline: "Satellite Positioning",
      accuracy: "Centimeter-Level Baseline Positioning",
      spec: "Multi-constellation GPS, GLONASS, Galileo & BeiDou tracking for primary ground control and boundary coordinate baselines.",
      badge: "Satellite GNSS",
      image_url: "/images/survey/survey_inst_gnss.webp"
    },
    {
      name: "Total Station & Electronic Theodolite",
      tagline: "Optical & EDM Precision",
      accuracy: "High Angular & EDM Distance Accuracy",
      spec: "Electronic distance and angle measurements for architectural baselines, structural setting out, and dense urban boundaries.",
      badge: "Optical & EDM",
      image_url: "/images/survey/survey_inst_totalstation.webp"
    },
    {
      name: "Aerial Photogrammetry Platform",
      tagline: "Aerial Imaging & Terrain",
      accuracy: "Orthomosaics & Mapping Imagery",
      spec: "Planned photogrammetric flights with ground-control integration where required for the project.",
      badge: "Photogrammetry",
      image_url: "/images/drone/drone_thumb_mini4pro.webp"
    }
  ];

  // Technical Standards & Datums Data
  const technicalStandards = {
    coordinateDatums: [
      { name: "Minna Datum (Clarke 1880)", usage: "Official Nigerian National Cadastral Coordinate Framework" },
      { name: "UTM Zones 31N & 32N", usage: "Universal Transverse Mercator Projections for Nigeria (West / Central)" },
      { name: "WGS 84 (EPSG:4326 / EPSG:3857)", usage: "Global Satellite Positioning and Modern GIS Integration" },
      { name: "Project-Specific Local Grids", usage: "Tailored engineering site grids for construction & civil works" }
    ],
    fileDeliverables: [
      { format: "AutoCAD (.DWG / .DXF)", desc: "Layered vector CAD files with clean coordinate geometry" },
      { format: "GeoTIFF & Orthomosaics", desc: "Georeferenced high-resolution aerial raster datasets" },
      { format: "Survey Plans (Supervised Lodgement)", desc: "Prepared and delivered under SURCON-registered surveyor supervision" },
      { format: "CSV / PDF Coordinate Schedules", desc: "Tabulated Eastings, Northings, and Elevation benchmarks" },
      { format: "Digital Elevation Models (DEM/DTM)", desc: "3D terrain contours and elevation surface models" }
    ]
  };

  // ── High-Detail Case Studies with 3 Images Each & What I Did ───────────────
  const fallbackProjects = [
    {
      id: 'fallback-1',
      title: "Commercial Perimeter Demarcation & Title Boundary",
      summary: "Comprehensive boundary re-establishment, beacon monumentation, and cadastral lodgement plan for a commercial development.",
      area: "1,200 m²",
      location: "Lekki Phase 1, Lagos",
      scope: "Boundary Demarcation, Beacon Monumentation & Title Annexure",
      instruments: "Multi-Frequency GNSS RTK + Optical Total Station",
      coordinateRef: "Project-specified CRS — Minna Datum / UTM Zone 31N",
      deliverables: "Survey Plan, Coordinate Register, AutoCAD (.DWG), Deed Annexure",
      outcome: "Provided coordinate-controlled boundary evidence and survey documentation to support resolution of the encroachment dispute.",
      whatIDid: [
        "Recovered 2 historical government reference control pillars in the Lekki corridor to tie in coordinates.",
        "Ran a closed-loop optical Total Station traverse with angular closure error under 6 seconds of arc.",
        "Supervised the casting and on-ground anchoring of 6 reinforced concrete beacon pillars at perimeter vertices.",
        "Executed GPS static baseline observation to verify national grid coordinates on Minna Datum (UTM 31N).",
        "Generated final CAD vector drawings and beacon schedule for legal land title registration."
      ],
      tags: ['Cadastral'],
      images: [
        { url: '/images/survey/survey_proj_boundary.webp', caption: '01 — Perimeter Boundary Demarcation & Beaconing' },
        { url: '/images/survey/survey_hero_field.webp', caption: '02 — Dual-Frequency GNSS Ground Control Setup' },
        { url: '/images/survey/survey_inst_totalstation.webp', caption: '03 — Total Station Optical Traverse & Angle Checks' }
      ],
      isCaseStudy: true
    },
    {
      id: 'fallback-2',
      title: "Residential Estate Subdivision & Infrastructure Layout",
      summary: "Master plan layout partitioning 8.4 hectares into 42 residential plots with road network reservations.",
      area: "8.4 Hectares (42 Plots)",
      location: "Ibeju-Lekki Axis, Lagos",
      scope: "Master Plan Subdivision, Right-of-Way Staking & Plot Beaconing",
      instruments: "GNSS RTK Multi-Constellation + Optical Total Station",
      coordinateRef: "Project-specified CRS — Minna Datum / UTM Zone 31N",
      deliverables: "Master Subdivision Plan, 42 Individual Plot Beacon Schedules, Road Network Profile",
      outcome: "Provided coordinate-controlled plot demarcation and access-corridor documentation to support the developer's subsequent sales and development activities.",
      whatIDid: [
        "Established 8 secondary GPS control stations across terrain using RTK base-and-rover.",
        "Mapped natural drainage lines and terrain contours to guide civil road corridor alignment.",
        "Staked 168 plot corner beacon points in real time according to approved architectural master layout.",
        "Verified road right-of-way setbacks (12m main boulevard and 9m access roads) to prevent developer disputes.",
        "Delivered individual coordinate sheets for every plot purchaser alongside the master subdivision register."
      ],
      tags: ['Subdivision'],
      images: [
        { url: '/images/survey/survey_proj_subdivision.webp', caption: '01 — Master Estate Subdivision Layout & Beaconing' },
        { url: '/images/drone/drone_proj_orthomosaic.webp', caption: '02 — Aerial Orthomosaic Baseline & Boundary Overlay' },
        { url: '/images/survey/survey_inst_gnss.webp', caption: '03 — High-Precision RTK Plot Corner Setting Out' }
      ],
      isCaseStudy: true
    },
    {
      id: 'fallback-3',
      title: "Topographic Baseline & 3D Contour Elevation Survey",
      summary: "Detailed 0.5m contour interval survey and digital terrain elevation model for civil architectural planning.",
      area: "4.5 Hectares",
      location: "Guzape Hills, Abuja (FCT)",
      scope: "Topographic Baseline, 0.5m Contours & Digital Terrain Modeling (DTM)",
      instruments: "GNSS RTK + Aerial Photogrammetry Platform + Digital Level",
      coordinateRef: "Project-specified CRS — Minna Datum / UTM Zone 32N",
      deliverables: "2D/3D Contour Plan, Digital Surface Model (DSM/DTM), Spot Height Grid, Orthomosaic",
      outcome: "Identified natural flood pathways and steep gradients, saving on earthwork cut/fill civil excavation costs.",
      whatIDid: [
        "Established a 15-meter grid of ground spot heights across steep, rocky terrain using RTK and auto-level.",
        "Flew photogrammetric missions with 12 calibrated Ground Control Points (GCPs).",
        "Generated dense 3D point cloud and extracted 0.5m & 1.0m elevation contour vectors.",
        "Mapped all existing natural rock outcrops, mature trees, power infrastructure, and adjoining road levels.",
        "Exported layered 3D AutoCAD DWG terrain model for direct import by structural and drainage engineers."
      ],
      tags: ['Topographic'],
      images: [
        { url: '/images/survey/survey_proj_topographic.webp', caption: '01 — 3D Contour Model & Elevation Spot Heights' },
        { url: '/images/survey/survey_hero_field.webp', caption: '02 — On-Site Ground Control Point (GCP) Calibration' },
        { url: '/images/drone/drone_proj_orthomosaic.webp', caption: '03 — High-Resolution 2D Georeferenced Orthomosaic' }
      ],
      isCaseStudy: true
    },
    {
      id: 'fallback-4',
      title: "Commercial Logistics Facility Construction Setting Out",
      summary: "Translating structural foundation drawings to physical ground with column grid alignment and benchmark controls.",
      area: "3,500 m² Facility Footprint",
      location: "Ikeja Industrial Zone, Lagos",
      scope: "Building Footprint Staking, Column Axis Alignment & As-Built QA",
      instruments: "Optical Total Station + Precision Leveling Staff",
      coordinateRef: "Project-specified CRS — Local Engineering Grid & TBM Elevation",
      deliverables: "Setting Out Certificate, Grid Alignment Sheet, As-Built Deviation Audit",
      outcome: "Maintained precise column alignment across structural pillars, facilitating seamless pre-fabricated roof truss installation.",
      whatIDid: [
        "Established 4 permanent off-structure site reference pillars (Temporary Benchmarks - TBM) clear of excavation zones.",
        "Transferred structural blueprint grid lines (Axes A–J, 1–12) directly onto site profile boards.",
        "Executed precision optical angle and distance verification on foundation pile caps.",
        "Provided level monitoring during foundation concrete pouring.",
        "Conducted as-built position audit and issued structural setting-out report for client engineering records."
      ],
      tags: ['Engineering'],
      images: [
        { url: '/images/survey/survey_proj_boundary.webp', caption: '01 — Building Footprint & Column Axis Staking' },
        { url: '/images/survey/survey_inst_totalstation.webp', caption: '02 — Optical EDM Distance & Alignment Verification' },
        { url: '/images/survey/survey_hero_field.webp', caption: '03 — Vertical Datum Leveling & Foundation Quality Control' }
      ],
      isCaseStudy: true
    },
  ];


  const [apiProjects, setApiProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get('/projects/division/SURVEY');
      if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
        setApiProjects(res.data.data);
      }
    } catch {
      // Keep fallback case studies
    } finally {
      setProjectsLoading(false);
    }
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

  const projects = apiProjects.length > 0 ? apiProjects : fallbackProjects;

  // Comprehensive client FAQs
  const faqs = [
    {
      q: "How are your surveys supervised and prepared for statutory lodgement?",
      a: "All survey field observations, boundary measurements, and technical drafting are executed by Eugene Odibenuah. Statutory survey plans, official lodgement, and cadastral title documentations are prepared and delivered under the direct supervision of licensed SURCON-registered surveyors in full compliance with Nigerian survey regulations."
    },
    {
      q: "How long does a typical land survey take from start to finish?",
      a: "Standard residential boundary demarcation and perimeter surveys typically require 1–2 days of field observations, followed by 2–3 business days for computation, drafting, and plan preparation. Larger agricultural or estate subdivision projects (5+ hectares) generally require 1–2 weeks depending on site access, terrain, and weather conditions."
    },
    {
      q: "What deliverables will I receive upon project completion?",
      a: "Depending on your project scope, you will receive: Survey Plans prepared under registered supervision (suitable for title deed annexure and Governor's Consent), Tabulated Beacon Coordinate Schedules, Layered AutoCAD (.DWG / .DXF) vector files, Digital Terrain Models (DTM/DEM), and georeferenced aerial orthomosaics."
    },
    {
      q: "What coordinate systems and reference datums do you use?",
      a: "We deploy project-specific coordinate reference systems: Minna Datum (Clarke 1880 spheroid) projected to UTM Zone 31N or 32N for Nigerian national cadastral lodgements, WGS 84 for satellite GIS workflows, or custom local site coordinate grids for engineering and construction layout setting out."
    },
    {
      q: "What information is needed to begin a survey and receive a quote?",
      a: "To provide an accurate scope and quotation, we require: site location (Google Maps pin or landmark address), approximate plot count or land acreage, title or purchase documentation (if available), and the intended purpose of the survey (boundary title, architectural design, subdivision, or construction)."
    },
    {
      q: "Do you execute land survey projects outside Lagos State?",
      a: "Yes. While our primary base is Lagos, we regularly deploy across Ogun, Oyo, Delta, Edo, Ondo, and Abuja (FCT). Mobilization logistics and statutory state survey requirements are factored into our transparent project proposals."
    }
  ];

  // Accordion state
  const [openFaq, setOpenFaq] = useState(null);
  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Scroll navigation
  const sectionsRef = useRef({});
  const scrollTo = (id) => {
    const el = sectionsRef.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileNavOpen(false);
    }
  };

  // Intersection observer
  const observerRef = useRef(null);
  const [visibleElements, setVisibleElements] = useState(new Set());
  
  useEffect(() => {
    document.title = "GeoSurvey — Precision Land & Engineering Surveying";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'GeoSurvey // Buildwith_lami Surveying Division — Professional cadastral boundary demarcation, topographic mapping, construction setting out, and estate subdivision across Nigeria.'
      );
    }
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
    <div className="bg-[#f4f4f4] text-black font-sans selection:bg-black selection:text-white survey-body min-h-screen">

      {/* ==== DEDICATED GEOSURVEY NAVBAR ==== */}
      <header className="sticky top-0 z-40 bg-[#f4f4f4]/95 backdrop-blur-md border-b border-gray-300/80 px-6 md:px-12 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="border-2 border-black px-2.5 py-1 flex items-center justify-center font-black text-xs tracking-wider uppercase bg-white">
              GEOSURVEY
            </div>
            <span className="hidden sm:inline-block text-[11px] font-bold tracking-wider uppercase text-gray-500">
              Land &amp; Engineering Division
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7 text-[11px] uppercase font-bold tracking-widest text-gray-600">
            <button onClick={() => scrollTo('services')} className="hover:text-black transition-colors">Services</button>
            <button onClick={() => scrollTo('workflow')} className="hover:text-black transition-colors">Methodology</button>
            <button onClick={() => scrollTo('projects')} className="hover:text-black transition-colors">Portfolio</button>
            <button onClick={() => scrollTo('equipment')} className="hover:text-black transition-colors">Equipment</button>
            <button onClick={() => scrollTo('profile')} className="hover:text-black transition-colors">Profile</button>
            <button onClick={() => scrollTo('faq')} className="hover:text-black transition-colors">FAQ</button>
          </nav>

          {/* Right Action & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => scrollTo('contact')}
              className="hidden sm:inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-sm"
            >
              <span>Request Survey</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setMobileNavOpen(prev => !prev)}
              className="lg:hidden p-2 text-black hover:text-gray-600 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileNavOpen && (
          <div className="lg:hidden pt-4 pb-2 border-t border-gray-200 mt-3 space-y-2">
            <button onClick={() => scrollTo('services')} className="block w-full text-left py-2 text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-black">Services</button>
            <button onClick={() => scrollTo('workflow')} className="block w-full text-left py-2 text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-black">Methodology</button>
            <button onClick={() => scrollTo('projects')} className="block w-full text-left py-2 text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-black">Portfolio</button>
            <button onClick={() => scrollTo('equipment')} className="block w-full text-left py-2 text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-black">Equipment</button>
            <button onClick={() => scrollTo('profile')} className="block w-full text-left py-2 text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-black">Profile</button>
            <button onClick={() => scrollTo('faq')} className="block w-full text-left py-2 text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-black">FAQ</button>
            <button onClick={() => scrollTo('contact')} className="block w-full text-left py-2 text-xs font-bold uppercase tracking-wider text-black font-black">Request a Survey →</button>
          </div>
        )}
      </header>

      {/* ==== HERO SECTION (3 Column Editorial Layout) ==== */}
      <section className="min-h-[calc(100vh-70px)] flex justify-center p-4 md:p-8 pt-6">
        <div className="bg-white w-full max-w-[1400px] flex flex-col md:flex-row overflow-hidden border border-gray-300 shadow-sm">
          
          {/* Left Column - Headline & Positioning */}
          <div className="w-full md:w-[38%] flex flex-col justify-between p-8 md:p-12 relative border-b md:border-b-0 md:border-r border-gray-300 min-h-[90vh] md:min-h-[auto]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-700 mb-8">
                <span className="w-2 h-2 rounded-full bg-black"></span>
                <span>GeoSurvey // Land &amp; Engineering Division</span>
              </div>

              <h1 className="survey-heading text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight uppercase mb-6 text-gray-900">
                Precision Surveying.<br />
                <span className="text-gray-500">Reliable Field Data.</span>
              </h1>

              <p className="text-xs sm:text-sm font-semibold leading-relaxed text-gray-700 mb-8">
                Professional land surveying and geospatial services for residential, commercial, and infrastructure projects across Lagos and beyond — delivered by <span className="text-black font-bold">Eugene Odibenuah</span> under the supervision of SURCON-registered surveyors.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-8">
                <button
                  onClick={() => scrollTo('contact')}
                  className="bg-black text-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-sm active:scale-98"
                >
                  <span>Request a Survey</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => scrollTo('projects')}
                  className="border border-black text-black px-6 py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors"
                >
                  View Portfolio
                </button>
              </div>

              <div className="pt-2">
                <a
                  href="/eugene-odibenuah-land-surveyor-cv.pdf"
                  download="Eugene-Odibenuah-Surveyor-CV.pdf"
                  className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-600 hover:text-black transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Professional Profile (CV)</span>
                </a>
              </div>
            </div>

            <div className="pt-10 mt-auto border-t border-gray-200">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-3">Core Disciplines</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-800">
                Boundary Surveys · Topographic Baselines · Setting Out · Land Subdivision
              </p>
            </div>
          </div>

          {/* Center Column - Field Operations Imagery */}
          <div className="w-full md:w-[32%] bg-[#f7f7f7] flex flex-col border-b md:border-b-0 md:border-r border-gray-300">
            <div className="w-full h-[45vh] md:h-[65%] bg-gray-200 overflow-hidden relative group">
              <img
                src="/images/survey/survey_hero_field.webp"
                alt="Cadastral Survey Field Operations"
                className="w-full h-full object-cover grayscale-[10%] contrast-110 group-hover:scale-105 transition-transform duration-700"
                loading="eager"
                decoding="async"
              />
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1 text-[9px] font-bold uppercase tracking-widest">
                Fieldwork In Action // Lagos, Nigeria
              </div>
            </div>

            <div className="p-8 flex flex-col justify-between flex-1 bg-white">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Methodology</span>
                <button onClick={() => scrollTo('workflow')} className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:text-gray-600 transition-colors">
                  How We Work <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[11px] font-medium leading-relaxed text-gray-600">
                Calibrated optical and satellite equipment paired with structured traverse closing computations, with defined quality-control checks against applicable project and statutory requirements.
              </p>
            </div>
          </div>

          {/* Right Column - Professional Practitioner Profile (About Me) */}
          <div className="w-full md:w-[30%] bg-white p-8 md:p-10 flex flex-col justify-between relative min-h-[500px]">
            <div>
              {/* Header with Practitioner Badge */}
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Field Practitioner</span>
                <span className="text-[9px] font-bold uppercase tracking-widest bg-black text-white px-2 py-0.5">
                  Lead Surveyor
                </span>
              </div>

              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-mono font-black text-base shrink-0 border border-black shadow-sm">
                  EO
                </div>
                <div>
                  <h3 className="survey-heading text-xl font-bold uppercase tracking-tight text-gray-900 leading-tight">
                    Eugene Odibenuah
                  </h3>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 font-mono">
                    Land &amp; Engineering Geomatics
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed mb-6 font-medium">
                Specialist in cadastral boundary demarcation, high-density topographic baselines, construction setting out, and estate subdivision across Lagos and nationwide.
              </p>

              {/* Credentials & Operational Standards Matrix */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">Supervision:</span>
                  <span className="font-bold text-gray-900 text-[11px] text-right">SURCON-Registered Oversight</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">Hardware:</span>
                  <span className="font-bold text-gray-900 text-[11px] text-right">GNSS RTK · Total Station · Drone</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">Coordinate Datums:</span>
                  <span className="font-bold text-gray-900 text-[11px] text-right">Minna Datum / UTM / WGS84</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">Field Base:</span>
                  <span className="font-bold text-gray-900 text-[11px] text-right">Lagos // Deployments Nationwide</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">Response Time:</span>
                  <span className="font-bold text-gray-900 text-[11px] text-right">Scope &amp; Quote in 24 Hours</span>
                </div>
              </div>
            </div>

            {/* Bottom Action: Prominent CV Download & Link */}
            <div className="pt-6 mt-6 border-t border-gray-200 space-y-2.5">
              <a
                href="/eugene-odibenuah-land-surveyor-cv.pdf"
                download="Eugene-Odibenuah-Surveyor-CV.pdf"
                className="w-full bg-black text-white hover:bg-gray-800 py-3.5 px-4 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shadow-sm active:scale-98"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Download Professional Profile (CV)</span>
              </a>

              <button
                onClick={() => scrollTo('profile')}
                className="w-full text-center text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors block py-1"
              >
                View Comprehensive Profile &amp; Bio ↓
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ==== SERVICES SECTION (4 Core Primary Disciplines) ==== */}
      <section 
        ref={(el) => (sectionsRef.current['services'] = el)} 
        className="py-20 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-gray-300"
      >
        <div className={`observe ${visibleElements.has('services-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="services-header">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-3">— Survey Disciplines</p>
              <h2 className="survey-heading text-4xl md:text-6xl font-black tracking-tight uppercase text-gray-900">
                Services
              </h2>
            </div>
            <div className="max-w-md">
              <p className="text-xs font-semibold uppercase tracking-wider leading-relaxed text-gray-700 mb-3">
                Four core survey disciplines delivered under the supervision of SURCON-registered surveyors using Total Stations, multi-frequency GNSS, and aerial photogrammetry.
              </p>
              <button
                onClick={() => setStandardsModal(true)}
                className="text-[11px] font-bold uppercase tracking-wider text-black underline underline-offset-4 hover:text-gray-500 flex items-center gap-1.5 transition-colors"
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
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all border ${
                activeCategory === cat.id
                  ? 'bg-black text-white border-black shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 4 Core Disciplines Grid */}
        <div className="flex md:grid md:grid-cols-2 gap-6 overflow-x-auto md:overflow-visible pb-6 md:pb-0 snap-x snap-mandatory scrollbar-none -mx-6 px-6 md:mx-0 md:px-0">
          {filteredServices.map((service, idx) => (
            <div 
              key={service.id}
              className={`w-[85vw] sm:w-[340px] md:w-auto shrink-0 snap-center observe ${visibleElements.has(`service-${idx}`) ? 'opacity-100' : 'opacity-0'} transition-all duration-700`}
              data-id={`service-${idx}`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div className="bg-white p-8 md:p-10 h-full hover:shadow-xl transition-all duration-500 group flex flex-col justify-between border border-gray-300">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-3xl font-black text-gray-300 group-hover:text-black transition-colors duration-500 font-mono">{service.number}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 bg-gray-100 px-3 py-1 border border-gray-200">
                      {service.timeline}
                    </span>
                  </div>
                  <h3 className="survey-heading text-xl md:text-2xl font-black uppercase tracking-tight mb-3 text-gray-900">{service.category}</h3>
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
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Professional Standards</span>
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

      {/* ==== METHODOLOGY / HOW WE WORK SECTION ==== */}
      <section 
        ref={(el) => (sectionsRef.current['workflow'] = el)} 
        className="py-20 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-gray-300"
      >
        <div className={`observe ${visibleElements.has('workflow-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 mb-14`} data-id="workflow-header">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-3">— Survey Methodology</p>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <h2 className="survey-heading text-4xl md:text-6xl font-black tracking-tight uppercase text-gray-900">
              How We Work
            </h2>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 max-w-md">
              A disciplined, five-stage quality assurance protocol from initial title review through to professional deliverable handover.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {workflowSteps.map((ws, i) => (
            <div 
              key={i} 
              className={`bg-white border border-gray-300 p-6 flex flex-col justify-between hover:border-black transition-colors observe ${visibleElements.has(`wf-${i}`) ? 'opacity-100' : 'opacity-0'}`}
              data-id={`wf-${i}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div>
                <span className="text-2xl font-black font-mono text-gray-400 block mb-4">{ws.step}</span>
                <h3 className="survey-heading text-sm font-bold uppercase tracking-tight text-gray-900 mb-3">{ws.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">{ws.description}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-1.5 text-[10px] font-bold uppercase text-gray-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-black" /> QA Verified
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==== SELECTED WORKS / PORTFOLIO SECTION (3-IMAGE CAROUSEL & EDITABLE WORKFLOWS) ==== */}
      <section 
        ref={(el) => (sectionsRef.current['projects'] = el)} 
        className="py-20 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-gray-300"
      >
        <div className={`observe ${visibleElements.has('projects-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 mb-12`} data-id="projects-header">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-3">— Technical Case Studies</p>
              <h2 className="survey-heading text-4xl md:text-6xl font-black tracking-tight uppercase text-gray-900">
                Portfolio
              </h2>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 max-w-md">
              Explore representative field case studies featuring 3-slide visual records, field execution protocols, and coordinate-controlled deliverables.
            </p>
          </div>
        </div>

        <div className="flex md:grid md:grid-cols-2 gap-8 overflow-x-auto md:overflow-visible pb-6 md:pb-0 snap-x snap-mandatory scrollbar-none -mx-6 px-6 md:mx-0 md:px-0" role="region" aria-label="Survey portfolio case studies" aria-busy={projectsLoading}>
          {projectsLoading && projects.length === 0 ? (
            <>
              {[0, 1, 2, 3].map((i) => (
                <div key={`skel-${i}`} className="w-[85vw] sm:w-[320px] md:w-auto shrink-0 snap-center animate-pulse">
                  <div className="aspect-[16/10] bg-gray-200 rounded-none mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-1" />
                </div>
              ))}
            </>
          ) : projects.map((proj, idx) => {
            const isFallback = typeof proj.id === 'string' && proj.id.startsWith('fallback-');
            const tag = (proj.tags && proj.tags[0]) || proj.type || 'Cadastral';

            // Construct 3-image carousel array
            const carouselImages = proj.images && proj.images.length > 0 
              ? proj.images 
              : [
                  { url: proj.image_url || '/images/survey/survey_proj_boundary.webp', caption: '01 — Primary Field Demarcation' },
                  { url: '/images/survey/survey_hero_field.webp', caption: '02 — GNSS RTK Control Setup' },
                  { url: '/images/survey/survey_inst_totalstation.webp', caption: '03 — Total Station Traverse Verification' }
                ];

            return (
              <div
                key={proj.id || idx}
                className={`w-[88vw] sm:w-[360px] md:w-auto shrink-0 snap-center observe ${visibleElements.has(`proj-${idx}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`}
                data-id={`proj-${idx}`}
              >
                <div className="bg-white border border-gray-300 p-6 md:p-8 flex flex-col justify-between h-full hover:shadow-xl transition-all duration-300 group">
                  <div>
                    {/* 3-Image Interactive Carousel */}
                    <ProjectImageCarousel 
                      images={carouselImages} 
                      title={proj.title} 
                      tag={tag} 
                    />

                    {/* Title & Area Badge */}
                    <div className="flex justify-between items-start mb-3 gap-3">
                      <h3 className="survey-heading text-xl font-bold uppercase tracking-tight text-gray-900 leading-snug">
                        {proj.title}
                      </h3>
                      {proj.area && (
                        <span className="text-[10px] font-black tracking-wider uppercase bg-black text-white px-2.5 py-1 shrink-0">
                          {proj.area}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-600 mb-5 font-medium leading-relaxed">
                      {proj.summary}
                    </p>

                    {/* What I Did / Field Execution Highlights */}
                    {proj.whatIDid && proj.whatIDid.length > 0 && (
                      <div className="mb-5 bg-[#f9f9f9] p-4 border border-gray-200">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 block mb-2">
                          Key Field Operations:
                        </span>
                        <ul className="space-y-1.5">
                          {proj.whatIDid.slice(0, 3).map((task, ti) => (
                            <li key={ti} className="flex items-start gap-2 text-[11px] text-gray-700 font-medium leading-tight">
                              <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-1" />
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Technical Metadata Matrix */}
                    <div className="space-y-2 py-3 border-t border-b border-gray-100 text-xs">
                      {proj.scope && (
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold shrink-0">Scope:</span>
                          <span className="font-semibold text-gray-800 text-right text-[11px]">{proj.scope}</span>
                        </div>
                      )}
                      {proj.instruments && (
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold shrink-0">Instruments:</span>
                          <span className="font-semibold text-gray-800 text-right text-[11px]">{proj.instruments}</span>
                        </div>
                      )}
                      {proj.coordinateRef && (
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold shrink-0">Reference:</span>
                          <span className="font-semibold text-gray-800 text-right text-[11px]">{proj.coordinateRef}</span>
                        </div>
                      )}
                      {proj.outcome && (
                        <div className="flex justify-between items-start gap-2 pt-1 border-t border-gray-100">
                          <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold shrink-0">Outcome:</span>
                          <span className="font-semibold text-gray-900 text-right text-[11px]">{proj.outcome}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom / Modal Trigger */}
                  <div className="pt-5 mt-4 flex justify-between items-center text-[11px] font-bold uppercase tracking-wider border-t border-gray-200">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-black" />
                      {proj.location || 'Lagos, Nigeria'}
                    </span>

                    <button
                      onClick={() => setSelectedCaseStudyModal(proj)}
                      className="bg-black text-white hover:bg-gray-800 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                    >
                      <span>Full Case Study</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==== PRECISION INSTRUMENT ROSTER ==== */}
      <section 
        ref={(el) => (sectionsRef.current['equipment'] = el)} 
        className="py-20 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-gray-300"
      >
        <div className={`observe ${visibleElements.has('equipment-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="equipment-header">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-3">— Field Hardware</p>
              <h2 className="survey-heading text-4xl md:text-6xl font-black tracking-tight uppercase text-gray-900">
                Equipment
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
              className={`observe ${visibleElements.has(`eq-${idx}`) ? 'opacity-100' : 'opacity-0'} transition-all duration-700 bg-white border border-gray-300 p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-500 group`}
              data-id={`eq-${idx}`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-3 py-1">
                    {eq.badge}
                  </span>
                  <span className="text-xs font-bold font-mono text-gray-400">0{idx + 1}</span>
                </div>
                {eq.image_url && (
                  <div className="w-full aspect-[4/3] bg-gray-50 mb-6 overflow-hidden border border-gray-200 flex items-center justify-center p-4">
                    <img 
                      src={eq.image_url} 
                      alt={eq.name} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                )}
                <h3 className="survey-heading text-lg font-bold uppercase tracking-tight mb-1.5 text-gray-900">{eq.name}</h3>
                <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">{eq.accuracy}</p>
                <p className="text-xs font-medium text-gray-600 leading-relaxed mb-6">{eq.spec}</p>
              </div>

              <div className="pt-4 border-t border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-black" /> Calibrated Field Hardware
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==== LAMI AERIAL CROSS-LINK ==== */}
      <section className="py-20 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-gray-300">
        <div className="bg-black text-white p-8 md:p-14 grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-10 items-start">
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-3">— Aerial Division</p>
            <h2 className="survey-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight mb-6">
              Need Aerial Imaging &amp; Drone Mapping?
            </h2>
            <p className="text-xs font-semibold uppercase tracking-wider leading-loose text-gray-300 max-w-md mb-8">
              Our dedicated aerial division Lami Aerial complements land surveys with commercial drone photography, 4K 60fps construction progress flyovers, and orthomosaics across Nigeria.
            </p>
            <Link
              to="/drone"
              className="inline-flex items-center gap-3 border border-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors group"
            >
              <span>Explore Lami Aerial</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-300">
            <li className="flex justify-between border-b border-white/20 pb-2">
              <span>Aerial Photography &amp; Video</span>
              <span className="text-white/40">01</span>
            </li>
            <li className="flex justify-between border-b border-white/20 pb-2">
              <span>Construction Milestone Flyovers</span>
              <span className="text-white/40">02</span>
            </li>
            <li className="flex justify-between border-b border-white/20 pb-2">
              <span>Real Estate Marketing Visuals</span>
              <span className="text-white/40">03</span>
            </li>
            <li className="flex justify-between border-b border-white/20 pb-2">
              <span>Drone Orthomosaic Baselines</span>
              <span className="text-white/40">04</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ==== PROFESSIONAL PROFILE / ABOUT SECTION ==== */}
      <section 
        ref={(el) => (sectionsRef.current['profile'] = el)} 
        className="py-20 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-gray-300"
      >
        <div className={`observe ${visibleElements.has('profile-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 mb-12`} data-id="profile-header">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-3">— Professional Profile</p>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h2 className="survey-heading text-4xl md:text-6xl font-black tracking-tight uppercase text-gray-900">
                Eugene Odibenuah
              </h2>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-500 mt-2 font-mono">
                Land Surveying &amp; Geospatial Practice
              </p>
            </div>
            <a
              href="/eugene-odibenuah-land-surveyor-cv.pdf"
              download="Eugene-Odibenuah-Surveyor-CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Full CV / Profile</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Practice Background */}
          <div className="bg-white border border-gray-300 p-8 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center mb-6">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="survey-heading text-lg font-bold uppercase tracking-tight text-gray-900 mb-3">
                Technical Practice
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Leading land and engineering field operations with hands-on expertise in boundary demarcation, high-density topographic surveys, civil setting out, and estate subdivision layouts.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Lagos Base // Deployments Nationwide
            </div>
          </div>

          {/* Card 2: Field Hardware & Workflow */}
          <div className="bg-white border border-gray-300 p-8 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center mb-6">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="survey-heading text-lg font-bold uppercase tracking-tight text-gray-900 mb-3">
                Field Instrumentation
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Proficient with multi-frequency GNSS RTK satellite positioning, optical Total Stations, digital auto-levels, AutoCAD (.DWG/.DXF) cadastral drafting, and aerial drone photogrammetry.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Minna Datum / UTM Zone 31N/32N / WGS84
            </div>
          </div>

          {/* Card 3: Professional Supervision */}
          <div className="bg-white border border-gray-300 p-8 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center mb-6">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="survey-heading text-lg font-bold uppercase tracking-tight text-gray-900 mb-3">
                SURCON Supervision
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                All statutory cadastral lodgements, legal land title survey plans, and official beacon schedules are prepared and certified under the direct supervision of licensed SURCON-registered surveyors.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-gray-100 text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-black" /> Statutory Compliance Oversight
            </div>
          </div>
        </div>
      </section>

      {/* ==== FAQ SECTION ==== */}
      <section 
        ref={(el) => (sectionsRef.current['faq'] = el)} 
        className="py-20 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-gray-300"
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10 md:gap-20">
          <div className={`observe ${visibleElements.has('faq-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="faq-header">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-3">— Frequently Asked Questions</p>
            <h2 className="survey-heading text-4xl md:text-6xl font-black tracking-tight uppercase text-gray-900 mb-4">
              FAQ
            </h2>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 leading-relaxed">
              Clear answers to common questions regarding survey procedures, SURCON supervision, turnaround times, and statutory deliverables.
            </p>
          </div>

          <div className="space-y-0 border-t border-gray-300">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className={`observe ${visibleElements.has(`faq-${idx}`) ? 'opacity-100' : 'opacity-0'} border-b border-gray-300 transition-all duration-700`}
                data-id={`faq-${idx}`}
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full py-5 flex justify-between items-center text-left group"
                >
                  <span className="text-base sm:text-lg font-bold uppercase tracking-tight pr-4 text-gray-900 group-hover:text-gray-600 transition-colors">
                    {faq.q}
                  </span>
                  {openFaq === idx ? (
                    <Minus className="w-5 h-5 shrink-0 text-black" />
                  ) : (
                    <Plus className="w-5 h-5 shrink-0 text-gray-400 group-hover:text-black" />
                  )}
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === idx ? 'max-h-60 pb-6' : 'max-h-0'
                  }`}
                >
                  <p className="text-xs font-medium text-gray-700 leading-relaxed pr-8">
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
        className="py-20 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-gray-300"
      >
        <div className="flex flex-col md:flex-row gap-12 lg:gap-16 items-start">
          
          {/* Left Column - Contact Information */}
          <div className="w-full md:w-1/2">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-3">— Direct Brief Submission</p>
            <h2 className="survey-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase text-gray-900 mb-6">
              Start A Project
            </h2>
            <p className="text-xs sm:text-sm font-semibold leading-relaxed text-gray-700 max-w-md mb-8">
              Share details about your site location, estimated acreage, and intended deliverables. We respond within one business day with a clear scope, timeline, and transparent quotation.
            </p>
            
            <div className="space-y-4 bg-white p-6 border border-gray-300 mb-6">
              <div className="border-b border-gray-200 pb-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Direct Survey Email</p>
                <a href={`mailto:${CONTACT.email}`} className="text-sm font-bold uppercase tracking-wider text-black hover:underline">
                  {CONTACT.email}
                </a>
              </div>
              <div className="border-b border-gray-200 pb-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Direct Telephone / WhatsApp</p>
                <a href={`tel:${CONTACT.phoneE164}`} className="text-sm font-bold uppercase tracking-wider text-black hover:underline">
                  {CONTACT.phoneDisplay}
                </a>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Field Operations Base</p>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-800">
                  Lagos Base // Deployments Nationwide Across Nigeria
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-100 border border-gray-200 text-xs text-gray-600 leading-relaxed font-medium">
              <span className="font-bold text-gray-900 block mb-1">Professional Guarantee:</span>
              Transparent quotations with itemized scope, mobilization, beacon requirements, and agreed deliverables.
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="w-full md:w-1/2 bg-white p-8 border border-gray-300">
            <h3 className="survey-heading text-xl font-bold uppercase tracking-tight text-gray-900 mb-6">
              Survey Brief Submission Form
            </h3>

            <form className="space-y-5" onSubmit={handleBooking} noValidate aria-label="Survey service booking request">
              <div>
                <label htmlFor="survey_booking_full_name" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Full Name *</label>
                <input
                  id="survey_booking_full_name"
                  name="survey_booking_full_name"
                  type="text"
                  required
                  placeholder="e.g. Engr. Babatunde Adeyemi"
                  value={booking.full_name}
                  onChange={e => handleBookingFieldChange('full_name', e.target.value)}
                  onBlur={() => handleBookingFieldBlur('full_name')}
                  aria-invalid={!!bookingErrors.full_name}
                  aria-describedby={bookingErrors.full_name ? 'survey_err_full_name' : undefined}
                  className={`w-full bg-[#f9f9f9] border p-3 text-xs font-bold uppercase tracking-wider focus:outline-none transition-colors ${
                    bookingErrors.full_name ? 'border-red-500' : 'border-gray-300 focus:border-black'
                  }`}
                />
                {bookingErrors.full_name && <p id="survey_err_full_name" role="alert" className="text-xs text-red-600 mt-1">{bookingErrors.full_name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="survey_booking_email" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Email Address *</label>
                  <input
                    id="survey_booking_email"
                    name="survey_booking_email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={booking.email}
                    onChange={e => handleBookingFieldChange('email', e.target.value)}
                    onBlur={() => handleBookingFieldBlur('email')}
                    aria-invalid={!!bookingErrors.email}
                    aria-describedby={bookingErrors.email ? 'survey_err_email' : undefined}
                    className={`w-full bg-[#f9f9f9] border p-3 text-xs font-bold uppercase tracking-wider focus:outline-none transition-colors ${
                      bookingErrors.email ? 'border-red-500' : 'border-gray-300 focus:border-black'
                    }`}
                  />
                  {bookingErrors.email && <p id="survey_err_email" role="alert" className="text-xs text-red-600 mt-1">{bookingErrors.email}</p>}
                </div>

                <div>
                  <label htmlFor="survey_booking_phone" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Phone / WhatsApp</label>
                  <input
                    id="survey_booking_phone"
                    name="survey_booking_phone"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={booking.phone}
                    onChange={e => handleBookingFieldChange('phone', e.target.value)}
                    onBlur={() => handleBookingFieldBlur('phone')}
                    aria-invalid={!!bookingErrors.phone}
                    aria-describedby={bookingErrors.phone ? 'survey_err_phone' : undefined}
                    className={`w-full bg-[#f9f9f9] border p-3 text-xs font-bold uppercase tracking-wider focus:outline-none transition-colors ${
                      bookingErrors.phone ? 'border-red-500' : 'border-gray-300 focus:border-black'
                    }`}
                  />
                  {bookingErrors.phone && <p id="survey_err_phone" role="alert" className="text-xs text-red-600 mt-1">{bookingErrors.phone}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="survey_booking_service" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Survey Discipline Required *</label>
                <Select
                  value={booking.service}
                  onValueChange={val => handleBookingFieldChange('service', val)}
                >
                  <SelectTrigger
                    id="survey_booking_service"
                    className={`w-full bg-[#f9f9f9] border rounded-none h-11 text-xs font-bold uppercase tracking-wider focus:outline-none transition-colors ${
                      bookingErrors.service ? 'border-red-500' : 'border-gray-300 focus:border-black'
                    }`}
                  >
                    <SelectValue placeholder="— Select Survey Discipline —" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 shadow-2xl">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="survey_booking_location" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Site Location / LGA</label>
                  <input
                    id="survey_booking_location"
                    name="survey_booking_location"
                    type="text"
                    placeholder="e.g. Epe / Ibeju-Lekki, Lagos"
                    value={booking.location}
                    onChange={e => handleBookingFieldChange('location', e.target.value)}
                    className="w-full bg-[#f9f9f9] border border-gray-300 p-3 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="survey_booking_preferred_date" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Preferred Field Date</label>
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
                    className={`w-full bg-[#f9f9f9] border p-3 text-xs font-bold uppercase tracking-wider focus:outline-none transition-colors ${
                      bookingErrors.preferred_date ? 'border-red-500' : 'border-gray-300 focus:border-black'
                    }`}
                  />
                  {bookingErrors.preferred_date && <p id="survey_err_preferred_date" role="alert" className="text-xs text-red-600 mt-1">{bookingErrors.preferred_date}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="survey_booking_notes" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 block">Project Notes &amp; Approximate Acreage</label>
                <textarea
                  id="survey_booking_notes"
                  name="survey_booking_notes"
                  rows="3"
                  maxLength={1000}
                  placeholder="e.g. 3 plots for boundary demarcation; title document is a registered deed of assignment..."
                  value={booking.notes}
                  onChange={e => handleBookingFieldChange('notes', e.target.value)}
                  className="w-full bg-[#f9f9f9] border border-gray-300 p-3 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-black transition-colors resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={bookingStatus === 'submitting'}
                aria-busy={bookingStatus === 'submitting'}
                className={`w-full py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 group transition-colors ${
                  bookingStatus === 'success'
                    ? 'bg-green-700 text-white'
                    : bookingStatus === 'error'
                    ? 'bg-red-600 text-white'
                    : bookingStatus === 'submitting'
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800 shadow-md'
                }`}
              >
                {bookingStatus === 'success' ? '✓ Survey Brief Submitted — We will reply in 24h' : bookingStatus === 'error' ? '✗ Submission Failed — Try Again' : bookingStatus === 'submitting' ? 'Submitting Brief...' : 'Submit Survey Brief'}
                {bookingStatus === 'idle' && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>

              {bookingStatus === 'error' && (
                <p role="alert" className="text-xs text-red-600 font-bold uppercase tracking-wider text-center">Something went wrong. Please try again or email us directly.</p>
              )}
            </form>
          </div>

        </div>
      </section>

      {/* ==== DETAILED CASE STUDY MODAL (FULL TECHNICAL BREAKDOWN) ==== */}
      {selectedCaseStudyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white text-black max-w-3xl w-full p-8 md:p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-none border-2 border-black">
            <button
              onClick={() => setSelectedCaseStudyModal(null)}
              className="absolute top-6 right-6 w-10 h-10 border border-black hover:bg-black hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2.5 py-1">
                  {selectedCaseStudyModal.tags ? selectedCaseStudyModal.tags[0] : 'Case Study'}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {selectedCaseStudyModal.location}
                </span>
              </div>
              <h3 className="survey-heading text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900">
                {selectedCaseStudyModal.title}
              </h3>
            </div>

            {/* 3-Image Carousel inside Modal */}
            <ProjectImageCarousel
              images={selectedCaseStudyModal.images}
              title={selectedCaseStudyModal.title}
              tag={selectedCaseStudyModal.tags ? selectedCaseStudyModal.tags[0] : 'Survey'}
            />

            {/* Overview */}
            <p className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed mb-6">
              {selectedCaseStudyModal.summary}
            </p>

            {/* What I Did / Fieldwork Details */}
            {selectedCaseStudyModal.whatIDid && selectedCaseStudyModal.whatIDid.length > 0 && (
              <div className="mb-6 bg-gray-50 p-6 border border-gray-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-black" />
                  What Eugene Odibenuah Executed on Site:
                </h4>
                <ul className="space-y-2">
                  {selectedCaseStudyModal.whatIDid.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-gray-800">
                      <Check className="w-4 h-4 text-black shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-xs">
              <div className="p-3.5 bg-gray-50 border border-gray-200">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Site Area &amp; Extent:</span>
                <span className="font-bold text-gray-900 uppercase">{selectedCaseStudyModal.area}</span>
              </div>
              <div className="p-3.5 bg-gray-50 border border-gray-200">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Instruments Deployed:</span>
                <span className="font-bold text-gray-900 uppercase">{selectedCaseStudyModal.instruments}</span>
              </div>
              <div className="p-3.5 bg-gray-50 border border-gray-200">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Coordinate Reference:</span>
                <span className="font-bold text-gray-900 uppercase">{selectedCaseStudyModal.coordinateRef}</span>
              </div>
              <div className="p-3.5 bg-gray-50 border border-gray-200">
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Delivered Outputs:</span>
                <span className="font-bold text-gray-900 uppercase">{selectedCaseStudyModal.deliverables}</span>
              </div>
            </div>

            {/* Outcome Highlight */}
            {selectedCaseStudyModal.outcome && (
              <div className="p-4 bg-black text-white mb-6 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Project Impact &amp; Result:</span>
                <p className="font-medium text-gray-200">{selectedCaseStudyModal.outcome}</p>
              </div>
            )}

            <button
              onClick={() => {
                setSelectedCaseStudyModal(null);
                scrollTo('contact');
              }}
              className="w-full py-4 bg-black text-white hover:bg-gray-800 font-bold uppercase text-xs tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              Request a Similar Survey Brief <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-1">Discipline {selectedServiceModal.number}</span>
              <h3 className="survey-heading text-2xl font-black uppercase text-gray-900">{selectedServiceModal.category}</h3>
            </div>

            <p className="text-xs font-medium text-gray-700 leading-relaxed mb-6">
              {selectedServiceModal.description}
            </p>

            <div className="mb-6 bg-gray-50 p-6 border border-gray-200">
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
              <div className="p-4 bg-gray-50 border border-gray-200">
                <span className="text-[9px] font-bold uppercase text-gray-500 block mb-1">Standard Turnaround</span>
                <span className="font-bold text-gray-900 uppercase">{selectedServiceModal.timeline}</span>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200">
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
                Project Coordinate Reference Systems
              </h4>
              <div className="space-y-2">
                {technicalStandards.coordinateDatums.map((datum, i) => (
                  <div key={i} className="p-3.5 bg-gray-50 border border-gray-200 flex justify-between items-center text-xs">
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
                  <div key={i} className="p-3.5 bg-gray-50 border border-gray-200 flex justify-between items-center text-xs">
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
