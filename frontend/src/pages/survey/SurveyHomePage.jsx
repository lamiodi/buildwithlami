import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Plus, 
  Minus, 
  Download, 
  Check, 
  X, 
  Layers, 
  Shield, 
  Compass, 
  FileText, 
  MapPin,
  Menu,
  CheckCircle2,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Activity,
  UserCheck,
  MessageCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { CONTACT } from '../../config/contact';
import DivisionQuoteForm from '../../components/DivisionQuoteForm';
import { ServiceShortcuts, MobileQuoteBar } from '../../components/DivisionConversion';
import '../../styles/division-pages.css';
import SurveyFooter from '../../components/SurveyFooter';

// ── Reusable Interactive 3-Image Carousel Component ──────────────────────
const ProjectImageCarousel = ({ images, title, tag }) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  const prevSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const nextSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
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
            className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all opacity-80 sm:opacity-70 group-hover:opacity-100 focus-visible:opacity-100 z-20 border border-white/20 active:scale-95"
            aria-label="Previous Project Image"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all opacity-80 sm:opacity-70 group-hover:opacity-100 focus-visible:opacity-100 z-20 border border-white/20 active:scale-95"
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

  // -- Mobile nav state --
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [selectedQuoteService, setSelectedQuoteService] = useState(null);

  // -- Modal & Filter States --
  const [selectedServiceModal, setSelectedServiceModal] = useState(null);
  const [selectedCaseStudyModal, setSelectedCaseStudyModal] = useState(null);
  const [standardsModal, setStandardsModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('ALL');

  // 4 Core Primary Disciplines
  const servicePillars = [
    {
      id: 'cadastral',
      category: 'Boundary & Cadastral Demarcation',
      number: '01',
      headline: 'Legal Boundary Demarcation & Title Lodgement Plans',
      description: 'Physical perimeter beacon monumentation, boundary recovery, and cadastral survey plans prepared under the direct supervision of SURCON-registered surveyors. Fully compliant for Governor’s Consent, C of O, and title deed registration.',
      deliverables: 'Registered Survey Plan, Beacon Coordinate Register, AutoCAD (.DWG/.DXF), Deed Plan Annexure',
      timeline: '3–5 business days',
      subItems: [
        'Perimeter Boundary Demarcation & Reinforced Beacon Casting',
        'Minna Datum & UTM Zone 31N/32N Cadastral Coordinate Controls',
        'Statutory Lodgement-Ready Survey Plans (SURCON Supervised)',
        'Boundary Dispute Resolution & Encroachment Audits'
      ]
    },
    {
      id: 'topographic',
      category: 'Topographic Baseline Surveys',
      number: '02',
      headline: 'High-Density 3D Terrain, Contours & Elevation Baselines',
      description: 'Sub-centimeter digital elevation models, spot height grids, and 0.5m contour baselines essential for architectural master planning, drainage engineering, and eliminating expensive foundation flood risks.',
      deliverables: '2D/3D Contour Plan, Digital Elevation Model (DEM/DTM), Spot Heights Grid, GeoTIFF Orthomosaic',
      timeline: '4–7 business days',
      subItems: [
        'High-Resolution Contour Intervals (0.5m / 1.0m intervals)',
        'Digital Terrain & Surface Modeling (DTM / DSM)',
        'Natural & Built Feature Geospatial Asset Location',
        'Earthwork Cut & Fill Volumetric Computation'
      ]
    },
    {
      id: 'engineering',
      category: 'Engineering & Construction Setting Out',
      number: '03',
      headline: 'Construction Setting Out & Column Axis Alignment',
      description: 'Translating structural, architectural, and civil drawings directly to physical ground with Total Station millimeter precision, column axis control, pile cap staking, and as-built QA audits.',
      deliverables: 'Setting Out Certificate, Grid Alignment Sheet, As-Built Deviation Report',
      timeline: 'Scheduled per project milestone',
      subItems: [
        'Building Footprint & Column Grid Alignment Staking',
        'Road Centerlines, Corridors & Invert Drainage Levels',
        'Pile Cap Position & Foundation Axis Precision Control',
        'As-Built Quality Assurance & Structural Tolerance Audits'
      ]
    },
    {
      id: 'subdivision',
      category: 'Estate Layout & Land Subdivision',
      number: '04',
      headline: 'Master Estate Subdivision & Plot Partitioning',
      description: 'Partitioning landholdings into demarcated residential and commercial plots with approved road right-of-way setbacks (12m/9m), utility reservation corridors, and individual buyer coordinate sheets.',
      deliverables: 'Master Subdivision Plan, Individual Plot Beacon Sheets, Road Network Profile',
      timeline: '1–2 weeks depending on acreage',
      subItems: [
        'Master Layout Plot Demarcation & Perimeter Pillar Staking',
        'Estate Road Network Alignment & Right-of-Way Staking',
        'Utility Corridor & Drainage Reservation Planning',
        'Individual Purchaser Beacon Schedules for Contract Annexure'
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
      el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
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
    <div className="bg-[#f4f4f4] text-black font-sans selection:bg-black selection:text-white survey-body division-page min-h-screen">

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
              <span>Get a quote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setMobileNavOpen(prev => !prev)}
              className="lg:hidden p-2 text-black hover:text-gray-600 focus:outline-none"
              aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileNavOpen}
              aria-controls="survey-mobile-menu"
            >
              {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileNavOpen && (
          <div id="survey-mobile-menu" className="lg:hidden max-h-[70dvh] overflow-y-auto pt-4 pb-2 border-t border-gray-200 mt-3 space-y-2">
            <button onClick={() => scrollTo('services')} className="block w-full min-h-[44px] text-left py-2 text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-black">Services</button>
            <button onClick={() => scrollTo('workflow')} className="block w-full min-h-[44px] text-left py-2 text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-black">Methodology</button>
            <button onClick={() => scrollTo('projects')} className="block w-full min-h-[44px] text-left py-2 text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-black">Portfolio</button>
            <button onClick={() => scrollTo('equipment')} className="block w-full min-h-[44px] text-left py-2 text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-black">Equipment</button>
            <button onClick={() => scrollTo('profile')} className="block w-full min-h-[44px] text-left py-2 text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-black">Profile</button>
            <button onClick={() => scrollTo('faq')} className="block w-full min-h-[44px] text-left py-2 text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-black">FAQ</button>
            <button onClick={() => scrollTo('contact')} className="block w-full min-h-[44px] text-left py-2 text-xs font-bold uppercase tracking-wider text-black font-black">Request a Survey →</button>
          </div>
        )}
      </header>

      <section className="survey-hero" aria-labelledby="survey-hero-heading">
        <div className="survey-hero-grid">
          <div className="survey-hero-copy">
            <p className="division-eyebrow">GeoSurvey · Lagos &amp; across Nigeria</p>
            <h1 id="survey-hero-heading" className="survey-heading">Know your land.<br /><span>Plan your next move.</span></h1>
            <p className="survey-hero-description">Land and engineering surveys for property owners, architects, and developers. Get clear boundaries, useful site data, and setting out for your next build.</p>
            <div className="survey-hero-actions">
              <button type="button" onClick={() => scrollTo('contact')}>Get a survey quote <ArrowRight size={18} /></button>
              <a href={'https://wa.me/' + CONTACT.phoneE164 + '?text=' + encodeURIComponent('Hello Eugene, I would like to discuss a land survey.')} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> Talk on WhatsApp</a>
            </div>
            <p className="survey-hero-note">Not sure which survey you need? Tell us what you are planning.</p>
            <div className="survey-hero-proof"><span><Check size={16} /> Defined scope &amp; deliverables</span><span><Check size={16} /> Direct project contact</span></div>
          </div>
          <figure className="survey-hero-image">
            <img src="/images/survey/survey_hero_field.webp" alt="Surveying equipment in the field" fetchPriority="high" decoding="async" />
            <figcaption><span className="division-eyebrow">Land &amp; engineering division</span><strong>From field measurements to your next decision.</strong><p>Boundary surveys · Topographic surveys · Construction setting out · Land subdivision</p></figcaption>
          </figure>
        </div>
      </section>

      <ServiceShortcuts division="SURVEY" services={servicePillars} onSelect={(service) => { setSelectedQuoteService({ service }); scrollTo('contact'); }} />

      <section className="px-6 md:px-12 py-12 max-w-[1400px] mx-auto border-y border-gray-300">
        <div className="grid md:grid-cols-3 gap-8 text-gray-800">
          <div><p className="division-eyebrow mb-3">Clear from the start</p><h2 className="survey-heading text-3xl">A survey you can put to work.</h2></div>
          <div><h3 className="font-bold mb-3">Know what you will receive</h3><p className="text-sm leading-relaxed text-gray-600">We agree the site coverage, required plans, file formats, and delivery schedule with you before fieldwork begins.</p></div>
          <div><h3 className="font-bold mb-3">A scope that fits your project</h3><p className="text-sm leading-relaxed text-gray-600">Share your location and intended use. We help identify the measurements and documentation your project needs.</p></div>
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
        id="contact" ref={(el) => (sectionsRef.current['contact'] = el)} 
        className="py-20 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-gray-300"
      >
        <div className="flex flex-col md:flex-row gap-12 lg:gap-16 items-start">
          
          {/* Left Column - Contact Information */}
          <div className="w-full md:w-1/2">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-3">— Direct Brief Submission</p>
            <h2 className="survey-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase text-gray-900 mb-6">
              Let’s plan your survey
            </h2>
            <p className="text-xs sm:text-sm font-semibold leading-relaxed text-gray-700 max-w-md mb-8">
              Tell us where your site is and what you want to achieve. You do not need coordinates, exact acreage, or a finished technical brief to start.
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
                <a href={`tel:+${CONTACT.phoneE164}`} className="text-sm font-bold uppercase tracking-wider text-black hover:underline">
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
              <span className="font-bold text-gray-900 block mb-1">A clear proposal before you commit:</span>
              Transparent quotations with itemized scope, mobilization, beacon requirements, and agreed deliverables.
            </div>
<div className="division-next-steps"><h3>What happens next?</h3><ol><li>We review your location and project goals.</li><li>You receive a scope, proposed timing, and an itemized quote.</li><li>We agree the details with you before scheduling fieldwork.</li></ol></div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="w-full md:w-1/2 bg-white p-5 sm:p-8 border border-gray-300">
            <h3 className="survey-heading text-xl font-bold uppercase tracking-tight text-gray-900 mb-6">
              Get your project quote
            </h3>

            <DivisionQuoteForm division="SURVEY" services={servicePillars} selectedService={selectedQuoteService} />
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
                setSelectedQuoteService({ service: selectedServiceModal.category });
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
      <MobileQuoteBar division="SURVEY" onQuote={() => scrollTo('contact')} hidden={mobileNavOpen || !!selectedServiceModal || !!selectedCaseStudyModal || standardsModal} />
    </div>
  );
};

export default SurveyHomePage;
