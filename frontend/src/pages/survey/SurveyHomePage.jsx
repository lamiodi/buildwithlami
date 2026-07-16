import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Plus, Minus, Download } from 'lucide-react';
import { api } from '../../services/api';
import { surveyPlaceholder, projectPlaceholder, equipmentPlaceholder } from '../../utils/placeholders';
import { validateBooking, validateField } from '../../utils/formValidation';

// ── Survey-page fonts ────────────────────────────────────
// "Manrope" for headings, "Mulish" for body text. Both are
// loaded page-scoped (not globally) so the rest of the app
// doesn't pay for the font weight downloads.
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Mulish:ital,wght@0,200..1000;1,200..1000&display=swap';

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
        style.setAttribute('data-survey-fonts', '');
        style.textContent = `
            .survey-heading { font-family: "Manrope", sans-serif; font-optical-sizing: auto; font-weight: 700; font-style: normal; letter-spacing: -0.01em; }
            .survey-body    { font-family: "Mulish",  sans-serif; font-optical-sizing: auto; font-style: normal; }
        `;
        add(style);

        return () => {
            created.forEach((n) => n.parentNode && n.parentNode.removeChild(n));
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

    setBookingStatus('submitting');
    setBookingErrors({});
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
  // Authentic services delivered with a total station, GNSS receiver,
  // and DJI Mini-series drones. No sonar, no LiDAR, no hydrographic
  // watercraft — just disciplined fieldwork and clean deliverables.
  const services = [
    {
      title: "Boundary Demarcation",
      description: "Precise property line marking with reinforced concrete monuments, prepared in line with Nigeria's Land Instruments Preparation Act.",
    },
    {
      title: "Topographic Surveys",
      description: "Detailed 2D and 3D terrain maps showing elevation, slopes, and natural features — for architects, engineers, and planners.",
    },
    {
      title: "Cadastral Surveys",
      description: "Official surveys for landed property boundaries, including deed preparation and registration-ready plan production.",
    },
    {
      title: "Engineering & Setting Out",
      description: "Construction layout, as-built surveys, and volume calculations tailored to civil engineering and architectural projects.",
    },
    {
      title: "Site Layout & Subdivision",
      description: "Estate and plot subdivision into sellable units with road alignment, drainage corridors, and access planning.",
    },
    {
      title: "Drone Mapping & Photogrammetry",
      description: "Orthomosaic maps, digital surface models, and contour generation from DJI Mini 4 Pro aerial imagery.",
    },
    {
      title: "GIS Mapping & Spatial Data",
      description: "Geospatial database design, asset mapping, and presentation-ready cartographic outputs for planning teams.",
    },
    {
      title: "GPS / GNSS Control Surveys",
      description: "Establishment of ground control points and coordinate reference frameworks using survey-grade GNSS receivers.",
    },
    {
      title: "Land Documentation",
      description: "Clean AutoCAD drawings, GeoTIFFs, and printed survey plans ready for architects, lawyers, and government filing.",
    }
  ];

  // Fallback projects shown if the API is unreachable or empty.
  // Keeps the page presentable until the admin publishes real
  // entries from /admin/portfolio. Placeholders only — replace
  // with verified client work before going public.
  const fallbackProjects = [
    { id: 'fallback-1', title: "Residential Estate Boundary Survey", summary: 'Cadastral demarcation for a 40-unit housing estate', area: "8 Ha",  tags: ['Cadastral'],   location: "Lagos" },
    { id: 'fallback-2', title: "Subdivision Layout — Lekki Axis",  summary: 'Plot subdivision and access road alignment',      area: "12 Ha",  tags: ['Subdivision'], location: "Lagos" },
    { id: 'fallback-3', title: "Topographic Baseline for Site Plan", summary: 'Terrain map for an architect’s master plan',    area: "5 Ha",   tags: ['Topographic'], location: "FCT" },
    { id: 'fallback-4', title: "Construction Setting Out",          summary: 'Building footprint and column setting out',       area: "2 Ha",   tags: ['Engineering'], location: "Lagos" },
  ];

  // Live projects fetched from /api/projects/division/SURVEY.
  // The endpoint only returns PUBLISHED rows; see projectRoutes.js.
  const [apiProjects, setApiProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const res = await api.get('/projects/division/SURVEY');
      if (cancelled) return;
      if (res.ok && Array.isArray(res.data)) setApiProjects(res.data);
      setProjectsLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

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
      document.querySelectorAll('.observe').forEach((el) => observer.observe(el));
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
    <div className="bg-[#f2f2f2] text-black font-sans selection:bg-black selection:text-white survey-body">
      
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
              <h1 className="survey-heading text-[5rem] md:text-[6rem] lg:text-[8rem] font-black leading-[0.85] tracking-tighter uppercase">
                PRE<br />CI<br />SION
              </h1>
            </div>

            <div className="mt-auto">
              <p className="text-xs font-semibold leading-loose text-gray-800 max-w-[280px] uppercase tracking-wider mb-12">
                Professional land surveying across Lagos and beyond. From boundary demarcation to drone-assisted topographic mapping — clean data, delivered on time.
              </p>
              <div className="flex gap-4 text-[10px] font-bold tracking-widest uppercase">
                <a href="#" className="hover:text-gray-500 transition-colors">Instagram</a>
                <span>/</span>
                <a href="#" className="hover:text-gray-500 transition-colors">LinkedIn</a>
                <span>/</span>
                <a href="#" className="hover:text-gray-500 transition-colors">X / Twitter</a>
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
                src={surveyPlaceholder({ width: 600, height: 800, label: 'Cadastral Survey' })}
                alt="Cadastral Survey"
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
                Disciplined field surveys for residential, commercial, and infrastructure clients — backed by digital deliverables you can build on.
              </p>
            </div>
          </div>

          {/* Right Column - Project Details */}
          <div className="w-full md:w-[30%] bg-[#f2f2f2] p-8 md:p-12 flex flex-col relative min-h-[600px]">
            <div className="flex gap-2 mb-12">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-black flex items-center justify-center"><div className="w-1 h-1 bg-black rounded-full"></div></div>
              <div className="w-2 h-2 rounded-full bg-gray-300 mt-[2px]"></div>
              <div className="w-2 h-2 rounded-full bg-gray-300 mt-[2px]"></div>
            </div>
            <div className="flex-1">
              <h2 className="survey-heading text-xl font-bold uppercase tracking-wider mb-6">Featured Project</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-gray-600 mb-12 max-w-[250px]">
                Topographic baseline survey with drone-captured orthomosaic — clean contours and elevations ready for the architect’s master plan.
              </p>
              <div className="space-y-4 mb-16 w-full max-w-[300px]">
                <div className="flex justify-between border-b border-gray-300 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Service</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><span className="text-xs">⚙</span> Topographic</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Type</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Site Survey.</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Area</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">5 HA</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest">Method</span>
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
              {/* Decorative rotating text — hidden from screen readers
                  because it's purely visual (the "LAMI SURV" overlay
                  below is the actual content). */}
              <svg className="w-full h-full animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100" aria-hidden="true">
                <path id="circlePath" fill="none" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
                <text className="text-[8.5px] font-bold tracking-[0.2em] uppercase">
                  <textPath href="#circlePath" startOffset="0%">• LAMI SURVEY DIVISION • PRECISION AND ACCURACY</textPath>
                </text>
              </svg>
              <div className="absolute font-black text-sm uppercase text-center leading-none" aria-label="Lami Survey Division">LAMI<br />SURV</div>
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
              <h2 className="survey-heading text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
                Serv<br />ices
              </h2>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest leading-relaxed text-gray-700 max-w-md">
              Fieldwork, drafting, and drone-assisted mapping — delivered with the gear we actually carry, and the standards a property transaction deserves.
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
                <h3 className="survey-heading text-2xl font-black uppercase tracking-tight mb-4">{service.title}</h3>
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
              <h2 className="survey-heading text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
                Port<br />folio
              </h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" role="region" aria-label="Survey portfolio projects" aria-busy={projectsLoading}>
          {projectsLoading && projects.length === 0 ? (
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
          ) : projects.map((proj, idx) => {
            // API rows are an object with `id` (uuid). Fallback
            // rows have `id: 'fallback-N'` and a string `type`
            // — we map that to a single-element `tags` array so
            // the badge below renders the same way.
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
                        <div className="absolute top-4 left-4 bg-white px-3 py-1 text-[9px] font-bold tracking-widest uppercase">
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
                    className={`observe ${visibleElements.has(`proj-${idx}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`}
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

      {/* ==== EQUIPMENT SECTION ==== */}
      <section 
        ref={(el) => (sectionsRef.current['equipment'] = el)} 
        className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-gray-300"
      >
        <div className={`observe ${visibleElements.has('equipment-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`} data-id="equipment-header">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— The Tools</p>
          <h2 className="survey-heading text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] mb-16">
            Equip<br />ment
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
              <h3 className="survey-heading text-sm font-black uppercase tracking-tight">{eq.name}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{eq.spec}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==== DRONE DIVISION CROSS-LINK ==== */}
      <section className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-gray-300">
        <div className="bg-black text-white p-8 md:p-16 grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-12 items-start">
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-4">— Sister Division</p>
            <h2 className="survey-heading text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85] mb-8">
              Need<br />Aerial<br />Visuals?
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest leading-loose text-gray-300 max-w-md mb-10">
              Our Drone Division complements every survey we deliver — flying DJI Mini 4 Pro and Mini 4K aircraft for the photography, mapping, and progress content our clients need.
            </p>
            <Link
              to="/drone"
              className="inline-flex items-center gap-3 border border-white px-6 py-3 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-colors group"
            >
              Explore Drone Services
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
                <select
                  id="survey_booking_service"
                  name="survey_booking_service"
                  required
                  value={booking.service}
                  onChange={e => handleBookingFieldChange('service', e.target.value)}
                  onBlur={() => handleBookingFieldBlur('service')}
                  aria-invalid={!!bookingErrors.service}
                  aria-describedby={bookingErrors.service ? 'survey_err_service' : undefined}
                  className={`w-full bg-transparent border-b-2 py-3 text-sm font-bold uppercase tracking-wider focus:outline-none transition-colors appearance-none ${
                    bookingErrors.service ? 'border-red-500' : 'border-black focus:border-gray-500'
                  }`}
                >
                  <option value="" disabled>— Select Service —</option>
                  {services.map((s, i) => <option key={i} value={s.title}>{s.title}</option>)}
                </select>
                {bookingErrors.service && <p id="survey_err_service" role="alert" className="text-xs text-red-600 mt-1">{bookingErrors.service}</p>}
              </div>
              <div>
                <label htmlFor="survey_booking_location" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Project Location</label>
                <input
                  id="survey_booking_location"
                  name="survey_booking_location"
                  type="text"
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
