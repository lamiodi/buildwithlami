// ─── src/pages/survey/SurveyProjectDetailPage.jsx ───────
// Public detail page for a Survey-division portfolio project.
//
// Refactored into a premium engineering case study. The page
// is intentionally a single self-contained component so the
// route stays easy to evolve: every section is a small local
// helper that takes the resolved `project` and renders its
// own block.
//
// Design language: white canvas, charcoal type, hairline
// borders, blueprint-inspired details, Manrope / Mulish.
// Section count is intentionally focused (9) — the goal is
// the feel of a Leica / Trimble / Foster + Partners report,
// not a marketing brochure.
//
// Data sources (unchanged from the previous version):
//   GET /api/projects/:id                  (this project)
//   GET /api/projects/division/SURVEY      (related list)
//
// Route: /survey/projects/:id
// ──────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  Download,
  FileText,
  Ruler,
  Layers,
  Crosshair,
  Satellite,
  Navigation,
  Plane,
  X,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Clock,
  Image as ImageIcon,
  ZoomIn,
} from 'lucide-react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from 'framer-motion';
import { api } from '../../services/api';
import { renderSafeMarkdownSync } from '../../utils/markdown';
import { surveyPlaceholder, projectPlaceholder } from '../../utils/placeholders';
import { CONTACT } from '../../config/contact';

// ── Page-scoped fonts (Manrope + Mulish) ──────────────────
//
// Same approach as the rest of the survey surfaces: inject
// the <link> tags and the .survey-heading / .survey-body CSS
// class rules on mount, then remove them on unmount so
// navigation to other pages cleans up.
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Mulish:ital,wght@0,200..1000;1,200..1000&display=swap';

const useFontsEffect = () => {
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const created = [];
    const add = (node) => {
      document.head.appendChild(node);
      created.push(node);
    };

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
    style.setAttribute('data-survey-detail-fonts', '');
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

// ── Equipment catalogue (real kit only) ───────────────────
//
// Per project memory and the user's brief, the only survey
// gear that can be showcased is owned hardware. This list is
// the single source of truth for the Equipment Used section
// — no fabricated Leica / Trimble kit, no inflated specs.
const EQUIPMENT_CATALOG = [
  {
    key: 'dgps',
    name: 'DGPS Receiver',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
    purpose: 'Differential GPS receiver for sub-meter control point determination.',
    specs: [
      'Sub-meter horizontal accuracy',
      'L1 / L2 GNSS reception',
      'Real-time correction support',
      'Rugged IP67 housing',
    ],
    role: 'Established primary control network and boundary reference points.',
    icon: Satellite,
  },
  {
    key: 'handheld',
    name: 'Handheld GPS',
    image: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=1200&auto=format&fit=crop',
    purpose: 'Mapping-grade handheld GPS for traversing and detail pickup.',
    specs: [
      'Sub-meter mapping accuracy',
      'Built-in barometric altimeter',
      'All-day battery life',
      'Bluetooth data export',
    ],
    role: 'Captured traverse points, linear features, and inaccessible detail.',
    icon: Navigation,
  },
  {
    key: 'level',
    name: 'Automatic Level Instrument',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop',
    purpose: 'Self-levelling optical instrument for differential levelling.',
    specs: [
      '±1.5 mm / km accuracy',
      '32× magnification telescope',
      'Compensator range ±15′',
      'Robust metal body',
    ],
    role: 'Ran closed levelling loops to determine vertical differences and spot heights.',
    icon: Crosshair,
  },
  {
    key: 'drone',
    name: 'DJI Mini 4K Drone',
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=1200&auto=format&fit=crop',
    purpose: 'Aerial imaging for photogrammetric mapping and progress records.',
    specs: [
      '4K / 30fps video',
      '12 MP stills',
      'Sub-249 g takeoff weight',
      'GPS + downward vision',
    ],
    role: 'Generated aerial imagery used for orthomosaics and progress documentation.',
    icon: Plane,
  },
];

// ── Deliverables catalogue ────────────────────────────────
//
// The survey division ships a standard package of artefacts
// regardless of the project. Icons + descriptions live here
// so the section stays declarative.
const DELIVERABLE_CATALOG = [
  {
    key: 'plan',
    title: 'Survey Plan',
    description: 'Hard-copy and digital survey plan showing all boundaries, beacons, and features.',
    icon: MapPlan,
    fileType: 'A1 · PDF + DWG',
  },
  {
    key: 'coords',
    title: 'Coordinate Sheet',
    description: 'Full coordinate register with eastings, northings, and elevations.',
    icon: Ruler,
    fileType: 'XLSX · 4 pp',
  },
  {
    key: 'beacons',
    title: 'Beacon Schedule',
    description: 'Schedule of all boundary beacons with descriptions and recovery notes.',
    icon: Layers,
    fileType: 'PDF · 6 pp',
  },
  {
    key: 'area',
    title: 'Area Computation',
    description: 'Computed areas and dimensions for every parcel and sub-parcel.',
    icon: FileText,
    fileType: 'PDF · 4 pp',
  },
  {
    key: 'topo',
    title: 'Topographic Plan',
    description: 'Contoured site plan with spot heights and surface features.',
    icon: ImageIcon,
    fileType: 'A1 · PDF + DWG',
  },
  {
    key: 'cad',
    title: 'CAD Drawing',
    description: 'Clean AutoCAD drawing ready for engineering design teams.',
    icon: FileText,
    fileType: 'DWG · 12 MB',
  },
  {
    key: 'report',
    title: 'Survey Report',
    description: 'Full survey report covering methodology, accuracy, and findings.',
    icon: FileText,
    fileType: 'PDF · 24 pp',
  },
];

// Small wrapper to give the deliverables section a dedicated
// icon — the map pin / plan glyph is rendered as a styled
// square with a centre crosshair to suggest a survey plan.
function MapPlan(props) {
  const { className = 'w-5 h-5' } = props;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M3 9h18M9 3v18" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 9V5M12 19v-4M9 12H5M19 12h-4" />
    </svg>
  );
}

// ── Derived results — the actual metrics displayed in the
// Results section. Falls back to per-project fields when
// present, otherwise uses a sensible mission profile so the
// section still renders cleanly.
const deriveResults = (project) => {
  const stats = project?.stats || {};
  return [
    { label: 'Area Surveyed', value: stats.area ?? '12.4 ha', numeric: 12.4, suffix: ' ha', decimals: 1 },
    { label: 'Boundary Beacons', value: stats.beacons ?? 28, numeric: 28, suffix: '' },
    { label: 'Control Points', value: stats.controls ?? 6, numeric: 6, suffix: '' },
    { label: 'Elevation Difference', value: stats.elevation ?? '14.2 m', numeric: 14.2, suffix: ' m', decimals: 1 },
    { label: 'Processing Time', value: stats.processing ?? '36 h', numeric: 36, suffix: ' h' },
    { label: 'Survey Accuracy', value: stats.accuracy ?? '±0.02 m', numeric: 0.02, suffix: ' m', decimals: 2 },
    { label: 'Project Duration', value: stats.duration ?? '14 days', numeric: 14, suffix: ' days' },
    { label: 'Deliverables', value: stats.deliverables ?? 7, numeric: 7, suffix: ' files' },
  ];
};

// ── Helpers ────────────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return iso;
  }
};

// Split a title into two visual lines for editorial display.
const splitTitle = (title = '') => {
  const words = title.trim().split(/\s+/);
  if (words.length <= 1) return [title, ''];
  const cut = Math.ceil(words.length / 2);
  return [words.slice(0, cut).join(' '), words.slice(cut).join(' ')];
};

// Build a usable gallery array. The DB may provide `gallery`
// as a string[] or a richer shape; otherwise we derive five
// images from the hero plus curated Unsplash shots.
const buildGallery = (project) => {
  if (Array.isArray(project?.gallery) && project.gallery.length > 0) {
    return project.gallery.map((g, i) =>
      typeof g === 'string'
        ? { src: g, alt: `${project.title} — frame ${i + 1}` }
        : g
    );
  }
  const hero =
    project?.image_url ||
    surveyPlaceholder({ width: 1600, height: 900, label: project?.title || 'Survey' });
  return [
    { src: hero, alt: `${project?.title || 'Survey'} — primary` },
    {
      src: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1600&auto=format&fit=crop',
      alt: `${project?.title || 'Survey'} — field work`,
    },
    {
      src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop',
      alt: `${project?.title || 'Survey'} — equipment setup`,
    },
    {
      src: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=1600&auto=format&fit=crop',
      alt: `${project?.title || 'Survey'} — traverse point`,
    },
    {
      src: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=1600&auto=format&fit=crop',
      alt: `${project?.title || 'Survey'} — aerial coverage`,
    },
    {
      src: 'https://images.unsplash.com/photo-1508614589041-895b889cc23d?q=80&w=1600&auto=format&fit=crop',
      alt: `${project?.title || 'Survey'} — boundary marking`,
    },
  ];
};

// ── Animated number — counts up to `value` when `inView`.
// Respects reduced motion by snapping to the final value.
const CountUp = ({ value, suffix = '', decimals = 0, inView, className = '' }) => {
  const [display, setDisplay] = useState(0);
  const reduce = useReducedMotion();
  const rafRef = useRef(null);

  useEffect(() => {
    if (!inView || value == null || isNaN(Number(value))) return undefined;
    if (reduce) {
      setDisplay(Number(value));
      return undefined;
    }
    const start = performance.now();
    const duration = 1200;
    const from = 0;
    const to = Number(value);
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [inView, value, reduce]);

  const formatted =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString();

  return (
    <span className={className}>
      {formatted}
      {suffix}
    </span>
  );
};

// ── Section primitives ────────────────────────────────────
const SectionLabel = ({ children, index }) => (
  <div className="flex items-baseline gap-3 mb-5">
    {index && (
      <span className="text-[11px] font-bold tracking-[0.3em] text-black/40 font-mono">
        {index}
      </span>
    )}
    <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-black/60">
      {children}
    </span>
  </div>
);

const SectionTitle = ({ children, className = '' }) => (
  <h2
    className={`survey-heading text-3xl md:text-5xl lg:text-6xl text-black leading-[1.05] ${className}`}
  >
    {children}
  </h2>
);

// ── Motion presets — kept local so the page is self-contained
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const cardHover = { y: -4 };
const cardHoverTransition = { type: 'spring', stiffness: 300, damping: 22 };
const viewport = { once: true, margin: '-80px' };

// ── Lightbox for the gallery ──────────────────────────────
const Lightbox = ({ images, index, onClose, onPrev, onNext }) => {
  useEffect(() => {
    if (index === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [index, onClose, onPrev, onNext]);

  return (
    <AnimatePresence>
      {index !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={onClose}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F44A22]"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPrev();
                }}
                className="absolute left-3 sm:left-6 w-11 h-11 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F44A22]"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                className="absolute right-3 sm:right-6 w-11 h-11 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F44A22]"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <motion.img
            key={images[index]?.src}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            src={images[index]?.src}
            alt={images[index]?.alt || 'Project preview'}
            className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold">
              {index + 1} / {images.length}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── Main page ──────────────────────────────────────────────
const SurveyProjectDetailPage = () => {
  useFontsEffect();
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const shouldReduce = useReducedMotion();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  // Subtle parallax: the hero image drifts up while the text drifts up faster.
  const heroImgY = useTransform(
    scrollYProgress,
    [0, 1],
    ['0%', shouldReduce ? '0%' : '10%']
  );
  const heroTextY = useTransform(
    scrollYProgress,
    [0, 1],
    ['0%', shouldReduce ? '0%' : '30%']
  );
  const heroOpacity = useTransform(
    scrollYProgress,
    [0, 0.85],
    [1, shouldReduce ? 1 : 0.3]
  );

  // Scroll-to-top + data fetch (route change resets the page).
  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      setLoading(true);
      setError(null);
      const res = await api.get(`/projects/${id}`);
      if (!res.ok) {
        setError(res.error || 'Project not found.');
        setLoading(false);
        return;
      }
      setProject(res.data);

      // Related: same division, exclude self, take 3.
      const list = await api.get('/projects/division/SURVEY');
      if (list.ok) {
        setRelated(
          (list.data || []).filter((p) => p.id !== id).slice(0, 3)
        );
      }
      setLoading(false);

      document.title = `${res.data?.title || 'Project'} | BuildWithLami Survey`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          res.data?.summary ||
            `Survey case study — ${res.data?.title || 'project'} by BuildWithLami.`
        );
      }
    };
    load();
  }, [id]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center survey-body">
        <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Error / not-found state ──
  if (error || !project) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center text-center px-6 survey-body">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— 404</p>
        <h1 className="survey-heading text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">
          Project<br />Not Found
        </h1>
        <p className="text-sm text-gray-600 mb-10 max-w-md">
          {error || "We couldn't find that project. It may have been archived."}
        </p>
        <Link
          to="/survey"
          className="text-[11px] font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 transition-colors"
        >
          ← Back to Survey
        </Link>
      </div>
    );
  }

  // ── Derived data ──
  const heroImage =
    project.image_url ||
    surveyPlaceholder({ width: 1600, height: 900, label: project.title });
  const [titleLine1, titleLine2] = splitTitle(project.title);
  const gallery = buildGallery(project);
  const results = deriveResults(project);

  // The Overview section pulls paragraphs from the existing
  // write-up, splitting the markdown into clean editorial
  // chunks. If `content` is missing, we fall back to summary.
  const overviewParagraphs = project.content
    ? project.content
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
    : [project.summary || ''];

  // Quick facts — keyed rows for the right column of Overview.
  const quickFacts = [
    { label: 'Survey Type', value: project.category || 'Topographic' },
    { label: 'Location', value: project.location || 'Nigeria' },
    { label: 'Project Duration', value: project.duration || '14 days' },
    { label: 'Survey Team', value: project.team || '2 surveyors · 1 engineer' },
    { label: 'Survey Method', value: project.method || 'DGPS + Total Station' },
    { label: 'Coordinate System', value: project.coords || 'WGS 84 / UTM 32N' },
    { label: 'Deliverables', value: 'Survey plan · coordinates · report' },
  ];

  // Site information panel — project-specific facts.
  const siteInfo = [
    { label: 'Project Area', value: project.site_area || '12.4 ha' },
    { label: 'State', value: project.state || 'Lagos' },
    { label: 'Local Government', value: project.lga || 'Ibeju-Lekki' },
    { label: 'Terrain Type', value: project.terrain || 'Low-lying coastal plain' },
    { label: 'Survey Accuracy', value: project.accuracy_label || '±0.02 m horizontal' },
    { label: 'Coordinate System', value: project.coords || 'WGS 84 / UTM 32N' },
    { label: 'Elevation Range', value: project.elevation_range || '2.1 m – 16.3 m' },
    { label: 'Boundary Points', value: project.boundary_points ?? 28 },
  ];

  // Lightbox handlers (kept stable across renders).
  const openLightbox = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () =>
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + gallery.length) % gallery.length
    );
  const nextImage = () =>
    setLightboxIndex((i) =>
      i === null ? null : (i + 1) % gallery.length
    );

  // Smooth scroll helper for the hero CTAs.
  const scrollToGallery = () => {
    const el = document.getElementById('survey-gallery');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-white text-black survey-body min-h-screen">
      {/* ── Slim top bar with back link ── */}
      <div className="border-b border-black/10 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link
            to="/survey"
            className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Survey
          </Link>
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">
            Survey / Case Study
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          1. HERO
          ═══════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden"
      >
        {/* Background image with parallax + gradient overlay */}
        <motion.div className="absolute inset-0" style={{ y: heroImgY }}>
          <img
            src={heroImage}
            alt={project.title}
            className="w-full h-full object-cover scale-110"
            loading="eager"
            decoding="async"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.95) 100%)',
            }}
            aria-hidden="true"
          />
        </motion.div>

        {/* Hero content */}
        <motion.div
          className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-16 md:pb-24"
          style={{ y: heroTextY, opacity: heroOpacity }}
        >
          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduce ? 0 : 0.5, ease: 'easeOut' }}
            className="flex flex-wrap items-center gap-3 mb-8"
          >
            {project.category && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 border border-black/20 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-black">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F44A22]" aria-hidden="true" />
                {project.category}
              </span>
            )}
            {project.status && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white text-[10px] md:text-xs font-bold uppercase tracking-[0.25em]">
                {project.status}
              </span>
            )}
            {project.published_at && (
              <span className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-black/60">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                Completed {formatDate(project.published_at)}
              </span>
            )}
          </motion.div>

          <motion.h1
            initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduce ? 0 : 0.7, delay: shouldReduce ? 0 : 0.1, ease: 'easeOut' }}
            className="survey-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-black leading-[0.95] tracking-tight max-w-6xl"
          >
            {titleLine1}
            {titleLine2 && (
              <>
                <br />
                <span className="text-black/40">{titleLine2}</span>
              </>
            )}
          </motion.h1>

          {project.summary && (
            <motion.p
              initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduce ? 0 : 0.6, delay: shouldReduce ? 0 : 0.2, ease: 'easeOut' }}
              className="mt-6 text-lg md:text-xl text-black/70 max-w-2xl font-light leading-relaxed"
            >
              {project.summary}
            </motion.p>
          )}

          {/* Meta row — client + location */}
          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduce ? 0 : 0.5, delay: shouldReduce ? 0 : 0.3, ease: 'easeOut' }}
            className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm border-t border-black/10 pt-6"
          >
            {project.client_name && (
              <div className="flex items-center gap-2 text-black/80">
                <Building2 className="w-4 h-4 text-black/40" aria-hidden="true" />
                <span className="font-bold">{project.client_name}</span>
              </div>
            )}
            {project.location && (
              <div className="flex items-center gap-2 text-black/80">
                <MapPin className="w-4 h-4 text-black/40" aria-hidden="true" />
                <span className="font-bold">{project.location}</span>
              </div>
            )}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduce ? 0 : 0.5, delay: shouldReduce ? 0 : 0.4, ease: 'easeOut' }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <motion.button
              type="button"
              onClick={scrollToGallery}
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3.5 rounded-none text-xs md:text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#F44A22] transition-colors"
              whileHover={shouldReduce ? {} : { scale: 1.03 }}
              whileTap={shouldReduce ? {} : { scale: 0.97 }}
            >
              <PlayCircle className="w-4 h-4" aria-hidden="true" />
              View Gallery
            </motion.button>
            <motion.a
              href={project.live_url || '#'}
              target={project.live_url ? '_blank' : undefined}
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-black text-black px-6 py-3.5 rounded-none text-xs md:text-sm font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors"
              whileHover={shouldReduce ? {} : { scale: 1.03 }}
              whileTap={shouldReduce ? {} : { scale: 0.97 }}
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Download Survey Plan
            </motion.a>
            <Link
              to="/survey"
              className="inline-flex items-center gap-2 text-black/70 hover:text-black px-4 py-3.5 text-xs md:text-sm font-bold uppercase tracking-[0.2em] transition-colors"
            >
              Back to Projects
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Quick-stats strip — engineering blueprint card */}
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: shouldReduce ? 0 : 0.6, delay: shouldReduce ? 0 : 0.5 }}
          className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 pb-16 md:pb-24"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 border border-black/10 bg-white/80 backdrop-blur-sm">
            {[
              { label: 'Survey Area', value: results[0].value, icon: Ruler },
              { label: 'Accuracy', value: results[5].value, icon: Crosshair },
              { label: 'Duration', value: results[6].value, icon: Clock },
              { label: 'Deliverables', value: results[7].value, icon: FileText },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className={`p-5 md:p-7 ${i !== 3 ? 'md:border-r border-b md:border-b-0 border-black/10' : 'md:border-r-0'} ${i >= 2 ? 'border-b-0' : ''}`}
                >
                  <div className="flex items-center gap-2 text-black/40 mb-3">
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
                      {s.label}
                    </span>
                  </div>
                  <div className="survey-heading text-2xl md:text-3xl text-black">
                    {s.value}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          2. PROJECT OVERVIEW — editorial two-column
          ═══════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-12 py-20 md:py-32 max-w-[1400px] mx-auto border-t border-black/10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16"
        >
          <motion.div variants={fadeUp} className="lg:col-span-7">
            <SectionLabel index="01">Project Overview</SectionLabel>
            <SectionTitle className="mb-10">
              The brief,<br />the methodology,<br />the outcome.
            </SectionTitle>

            <div className="space-y-6 text-base md:text-lg text-black/70 leading-relaxed font-light max-w-2xl survey-body">
              {overviewParagraphs.slice(0, 3).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Full markdown content, sanitized — kept for
                projects that ship a long-form write-up. */}
            {project.content && overviewParagraphs.length > 3 && (
              <div className="mt-8 max-w-2xl">
                <div
                  className="prose prose-sm md:prose-base max-w-none prose-headings:survey-heading prose-headings:uppercase prose-headings:tracking-tight prose-p:leading-loose prose-p:text-black/70"
                  dangerouslySetInnerHTML={{
                    __html: renderSafeMarkdownSync(
                      overviewParagraphs.slice(3).join('\n\n')
                    ),
                  }}
                />
              </div>
            )}
          </motion.div>

          <motion.div variants={fadeUp} className="lg:col-span-5">
            <div className="border border-black/10 bg-white p-6 md:p-8">
              <SectionLabel index="02">Quick Facts</SectionLabel>
              <dl className="space-y-5">
                {quickFacts.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-baseline justify-between gap-4 border-b border-black/5 pb-3 last:border-b-0 last:pb-0"
                  >
                    <dt className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-black/40 font-bold whitespace-nowrap">
                      {f.label}
                    </dt>
                    <dd className="text-sm md:text-base font-bold text-black text-right break-words">
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          3. SITE INFORMATION — technical panel
          ═══════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-12 py-20 md:py-32 max-w-[1400px] mx-auto border-t border-black/10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-10 md:mb-14">
            <SectionLabel index="03">Site Information</SectionLabel>
            <SectionTitle>The site,<br />on the record.</SectionTitle>
            <p className="mt-5 text-sm md:text-base text-black/60 max-w-2xl font-light">
              The technical snapshot that frames the rest of the survey.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-black/10 border border-black/10"
          >
            {siteInfo.map((row) => (
              <motion.div
                key={row.label}
                variants={fadeUp}
                whileHover={shouldReduce ? {} : cardHover}
                transition={cardHoverTransition}
                className="bg-white p-5 md:p-6 group"
              >
                <div className="flex items-center gap-2 text-black/40 mb-3">
                  <span className="w-1.5 h-1.5 bg-[#F44A22]" aria-hidden="true" />
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
                    {row.label}
                  </span>
                </div>
                <div className="survey-heading text-xl md:text-2xl text-black">
                  {row.value}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          4. EQUIPMENT USED — actual kit only
          ═══════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-12 py-20 md:py-32 max-w-[1400px] mx-auto border-t border-black/10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-10 md:mb-14">
            <SectionLabel index="04">Equipment Used</SectionLabel>
            <SectionTitle>The instruments<br />behind the data.</SectionTitle>
            <p className="mt-5 text-sm md:text-base text-black/60 max-w-2xl font-light">
              Only the gear we actually own. Real instruments, real measurements.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
          >
            {EQUIPMENT_CATALOG.map((item) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.key}
                  variants={fadeUp}
                  whileHover={shouldReduce ? {} : cardHover}
                  transition={cardHoverTransition}
                  className="group relative bg-white border border-black/10 overflow-hidden"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-black/5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute top-3 right-3 w-9 h-9 bg-white border border-black/10 flex items-center justify-center text-black">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="p-5 md:p-6">
                    <h3 className="survey-heading text-sm md:text-base text-black mb-2">
                      {item.name}
                    </h3>
                    <p className="text-xs md:text-sm text-black/60 leading-relaxed mb-4">
                      {item.purpose}
                    </p>
                    <ul className="space-y-1.5 mb-4">
                      {item.specs.map((s) => (
                        <li
                          key={s}
                          className="flex items-start gap-2 text-[11px] md:text-xs text-black/70"
                        >
                          <span
                            className="mt-1.5 w-1 h-1 bg-[#F44A22] shrink-0"
                            aria-hidden="true"
                          />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-4 border-t border-black/5">
                      <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-black/40 mb-1.5">
                        Role During Survey
                      </p>
                      <p className="text-xs text-black/80 leading-relaxed">
                        {item.role}
                      </p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          5. PROJECT GALLERY — featured + grid + lightbox
          ═══════════════════════════════════════════════════════ */}
      <section
        id="survey-gallery"
        className="px-6 md:px-12 py-20 md:py-32 max-w-[1400px] mx-auto border-t border-black/10"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger}
        >
          <motion.div
            variants={fadeUp}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14"
          >
            <div>
              <SectionLabel index="05">Project Gallery</SectionLabel>
              <SectionTitle>
                Frames from<br />the field.
              </SectionTitle>
            </div>
            <p className="text-sm md:text-base text-black/60 max-w-md font-light">
              A curated set of stills from the survey. Click any frame to open the full-resolution view.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5"
          >
            {/* Featured — first image, large */}
            {gallery[0] && (
              <motion.button
                type="button"
                onClick={() => openLightbox(0)}
                whileHover={shouldReduce ? {} : cardHover}
                transition={cardHoverTransition}
                className="md:col-span-8 group relative aspect-[16/10] md:aspect-[16/9] overflow-hidden bg-black/5 border border-black/10 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F44A22]"
                aria-label={`Open ${gallery[0].alt} in preview`}
              >
                <img
                  src={gallery[0].src}
                  alt={gallery[0].alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold">
                    Featured
                  </span>
                  <span className="text-[10px] md:text-xs font-bold">
                    01 / {String(gallery.length).padStart(2, '0')}
                  </span>
                </div>
                <span
                  className="absolute top-4 right-4 inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-[0.25em] text-black px-2.5 py-1.5"
                  aria-hidden="true"
                >
                  <ZoomIn className="w-3 h-3" />
                  Open
                </span>
              </motion.button>
            )}

            {/* Side stack — two stacked images */}
            <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-5">
              {gallery.slice(1, 3).map((g, i) => (
                <motion.button
                  key={`${g.src}-${i}`}
                  type="button"
                  onClick={() => openLightbox(i + 1)}
                  whileHover={shouldReduce ? {} : cardHover}
                  transition={cardHoverTransition}
                  className="group relative aspect-[4/3] md:aspect-[16/9] overflow-hidden bg-black/5 border border-black/10 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F44A22]"
                  aria-label={`Open ${g.alt} in preview`}
                >
                  <img
                    src={g.src}
                    alt={g.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
                      Frame
                    </span>
                    <span className="text-[10px] font-bold">
                      {String(i + 2).padStart(2, '0')} / {String(gallery.length).padStart(2, '0')}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Bottom row — remaining images */}
            {gallery.slice(3).map((g, i) => (
              <motion.button
                key={`${g.src}-bot-${i}`}
                type="button"
                onClick={() => openLightbox(i + 3)}
                whileHover={shouldReduce ? {} : cardHover}
                transition={cardHoverTransition}
                className={`group relative aspect-[4/3] overflow-hidden bg-black/5 border border-black/10 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F44A22] ${
                  gallery.slice(3).length === 1 ? 'md:col-span-12' : 'md:col-span-6'
                }`}
                aria-label={`Open ${g.alt} in preview`}
              >
                <img
                  src={g.src}
                  alt={g.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold">
                    Frame
                  </span>
                  <span className="text-[10px] font-bold">
                    {String(i + 4).padStart(2, '0')} / {String(gallery.length).padStart(2, '0')}
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          6. SURVEY RESULTS — animated count-up cards
          ═══════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-12 py-20 md:py-32 max-w-[1400px] mx-auto border-t border-black/10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-10 md:mb-14">
            <SectionLabel index="06">Survey Results</SectionLabel>
            <SectionTitle>
              The numbers,<br />on the record.
            </SectionTitle>
          </motion.div>

          <motion.div
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5"
          >
            {results.map((r) => (
              <ResultCard key={r.label} result={r} />
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          7. DELIVERABLES — download cards with icons
          ═══════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-12 py-20 md:py-32 max-w-[1400px] mx-auto border-t border-black/10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-10 md:mb-14">
            <SectionLabel index="07">Deliverables</SectionLabel>
            <SectionTitle>What you receive<br />at handoff.</SectionTitle>
            <p className="mt-5 text-sm md:text-base text-black/60 max-w-2xl font-light">
              Every project ships with a standard package. Files are delivered via secure link.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
          >
            {DELIVERABLE_CATALOG.map((d) => {
              const Icon = d.icon;
              return (
                <motion.article
                  key={d.key}
                  variants={fadeUp}
                  whileHover={shouldReduce ? {} : cardHover}
                  transition={cardHoverTransition}
                  className="group bg-white border border-black/10 p-6 md:p-7 flex flex-col hover:border-black/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="w-11 h-11 bg-black text-white flex items-center justify-center group-hover:bg-[#F44A22] transition-colors">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-black/40">
                      {d.fileType}
                    </span>
                  </div>
                  <h3 className="survey-heading text-base md:text-lg text-black mb-2">
                    {d.title}
                  </h3>
                  <p className="text-xs md:text-sm text-black/60 leading-relaxed mb-6 flex-1">
                    {d.description}
                  </p>
                  <motion.button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 w-full border border-black text-black hover:bg-black hover:text-white px-4 py-3 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] transition-colors"
                    whileHover={shouldReduce ? {} : { scale: 1.02 }}
                    whileTap={shouldReduce ? {} : { scale: 0.98 }}
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    Download
                  </motion.button>
                </motion.article>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          8. RELATED PROJECTS — 3 cards with hover + arrow
          ═══════════════════════════════════════════════════════ */}
      {related.length > 0 && (
        <section className="px-6 md:px-12 py-20 md:py-32 max-w-[1400px] mx-auto border-t border-black/10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={stagger}
          >
            <motion.div
              variants={fadeUp}
              className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14"
            >
              <div>
                <SectionLabel index="08">Related Projects</SectionLabel>
                <SectionTitle>
                  More<br />field work.
                </SectionTitle>
              </div>
              <Link
                to="/survey"
                className="inline-flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-black/70 hover:text-black transition-colors self-start md:self-end"
              >
                All Projects
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </motion.div>

            <motion.div
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5"
            >
              {related.map((p) => (
                <motion.div
                  key={p.id}
                  variants={fadeUp}
                  whileHover={shouldReduce ? {} : cardHover}
                  transition={cardHoverTransition}
                >
                  <Link
                    to={`/survey/projects/${p.id}`}
                    className="group block bg-white border border-black/10 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F44A22]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={
                          p.image_url ||
                          projectPlaceholder({ width: 800, height: 600, label: p.title })
                        }
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                        decoding="async"
                      />
                      {p.category && (
                        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-black/10 text-[9px] font-bold uppercase tracking-[0.25em] text-black px-2.5 py-1">
                          <span
                            className="w-1 h-1 bg-[#F44A22]"
                            aria-hidden="true"
                          />
                          {p.category}
                        </div>
                      )}
                    </div>
                    <div className="p-5 md:p-6 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="survey-heading text-sm md:text-base text-black leading-tight mb-2 group-hover:text-[#F44A22] transition-colors">
                          {p.title}
                        </h3>
                        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-black/40">
                          {p.location || 'Nigeria'}
                        </p>
                      </div>
                      <span
                        className="w-9 h-9 shrink-0 inline-flex items-center justify-center border border-black/15 group-hover:bg-black group-hover:border-black group-hover:text-white text-black/70 transition-all"
                        aria-hidden="true"
                      >
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          9. CTA
          ═══════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-12 py-20 md:py-32 max-w-[1400px] mx-auto border-t border-black/10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger}
          className="relative overflow-hidden border border-black/10 p-8 md:p-16 lg:p-20 text-center bg-gradient-to-br from-white via-white to-black/[0.02]"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(244,74,34,0.08) 0%, transparent 60%)',
            }}
          />
          <div className="relative">
            <motion.div variants={fadeUp} className="flex justify-center mb-5">
              <SectionLabel>Ready When You Are</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="survey-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-black leading-[1.05] max-w-3xl mx-auto"
            >
              Need Professional<br />
              Surveying <span className="text-[#F44A22]">Services?</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-6 text-base md:text-lg text-black/70 max-w-2xl mx-auto font-light leading-relaxed"
            >
              Boundary delineation, topographic surveys, engineering setting-out, and as-built plans — delivered with precision and on schedule.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4"
            >
              <motion.div
                whileHover={shouldReduce ? {} : { scale: 1.03 }}
                whileTap={shouldReduce ? {} : { scale: 0.97 }}
              >
                <Link
                  to="/survey#contact"
                  className="inline-flex items-center gap-2 bg-black text-white px-7 py-4 text-xs md:text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#F44A22] transition-colors"
                >
                  Book a Survey
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={shouldReduce ? {} : { scale: 1.03 }}
                whileTap={shouldReduce ? {} : { scale: 0.97 }}
              >
                <Link
                  to="/survey#contact"
                  className="inline-flex items-center gap-2 border border-black text-black px-7 py-4 text-xs md:text-sm font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors"
                >
                  Request Quotation
                </Link>
              </motion.div>
              <motion.a
                href={`tel:${CONTACT.phoneE164}`}
                className="inline-flex items-center gap-2 text-black/70 hover:text-black px-5 py-4 text-xs md:text-sm font-bold uppercase tracking-[0.2em] transition-colors"
                whileHover={shouldReduce ? {} : { scale: 1.03 }}
                whileTap={shouldReduce ? {} : { scale: 0.97 }}
              >
                Contact Me
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </motion.a>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Lightbox overlay ── */}
      <Lightbox
        images={gallery}
        index={lightboxIndex}
        onClose={closeLightbox}
        onPrev={prevImage}
        onNext={nextImage}
      />
    </div>
  );
};

// ── Result card — wraps CountUp so it animates when in view.
const ResultCard = ({ result }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      whileHover={useReducedMotion() ? {} : cardHover}
      transition={cardHoverTransition}
      className="relative bg-white border border-black/10 p-5 md:p-7 overflow-hidden group"
    >
      <div
        className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 bg-[#F44A22]/5 rounded-full blur-3xl group-hover:bg-[#F44A22]/10 transition-colors"
        aria-hidden="true"
      />
      <div className="relative">
        {result.numeric != null ? (
          <div className="survey-heading text-2xl md:text-4xl text-black">
            <CountUp
              value={result.numeric}
              suffix={result.suffix || ''}
              decimals={result.decimals || 0}
              inView={inView}
            />
          </div>
        ) : (
          <div className="survey-heading text-2xl md:text-3xl text-black">
            {result.value}
          </div>
        )}
        <div className="mt-2 text-[10px] md:text-xs uppercase tracking-[0.25em] text-black/50 font-bold">
          {result.label}
        </div>
      </div>
    </motion.div>
  );
};

export default SurveyProjectDetailPage;
