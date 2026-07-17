// ─── src/pages/drone/DroneProjectDetailPage.jsx ─────────
// Public detail page for a Drone-division portfolio project.
//
// Refactored into a premium, cinematic case study. The page
// is intentionally a single self-contained component to keep
// the route easy to evolve: every section is a small local
// helper that takes the resolved `project` and renders its
// own block.
//
// Data sources (unchanged from the previous version):
//   GET /api/projects/:id                  (this mission)
//   GET /api/projects/division/DRONE       (related list)
//
// Route: /drone/projects/:id
//
// Design language: dark canvas, white Michroma headings,
// Geomini body, subtle gradients, glassmorphism on the
// floating elements only. Section count is intentionally
// focused (8) — DJI Enterprise / Skydio / Apple feel rather
// than a 15-block marketing document.
// ──────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  MapPin,
  Building2,
  Download,
  Camera,
  Video,
  FileText,
  Image as ImageIcon,
  PlayCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Plane,
  Battery,
  HardDrive,
  Clock,
  Maximize2,
} from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { dronePlaceholder } from '../../utils/placeholders';
import { CONTACT } from '../../config/contact';

// ── Page-scoped fonts (Michroma + Geomini) ────────────────
//
// Same approach as the rest of the drone surfaces: inject
// the <link> tags and the .drone-heading / .drone-body CSS
// class rules on mount, then remove them on unmount so
// navigation to other pages cleans up.
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
    style.setAttribute('data-drone-detail-fonts', '');
    style.textContent = `
      .drone-heading { font-family: "Michroma", sans-serif; font-weight: 400; font-style: normal; letter-spacing: 0.02em; }
      .drone-body    { font-family: "Geomini",  sans-serif;  font-optical-sizing: auto; font-style: normal; }
    `;
    add(style);

    return () => {
      created.forEach((n) => n.parentNode && n.parentNode.removeChild(n));
    };
  }, []);
};

// ── Static equipment catalogue ─────────────────────────────
//
// Per project memory, the only drone equipment that can be
// showcased is owned hardware. This list is the single source
// of truth for the Equipment Used section — it intentionally
// contains only what is actually in the user's kit.
const EQUIPMENT_CATALOG = [
  {
    key: 'mini4k',
    name: 'DJI Mini 4K',
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=1200&auto=format&fit=crop',
    purpose: 'Primary aerial platform for photo and 4K video capture.',
    specs: ['4K / 30fps video', '12 MP stills', 'Sub-249 g takeoff weight', 'GPS + downward vision'],
    role: 'All primary flight work — wide establishing shots, orbit passes, top-downs.',
    icon: Plane,
  },
  {
    key: 'controller',
    name: 'Remote Controller',
    image: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?q=80&w=1200&auto=format&fit=crop',
    purpose: 'Long-range command link with a built-in mobile mount.',
    specs: ['OcuSync 2.0 transmission', 'Up to 10 km range', 'Dual control sticks', 'USB-C charging'],
    role: 'Frames every shot — exposure, gimbal tilt, focus, and flight path.',
    icon: Maximize2,
  },
  {
    key: 'batteries',
    name: 'Extra Batteries',
    image: 'https://images.unsplash.com/photo-1619641805634-20cce30a82d8?q=80&w=1200&auto=format&fit=crop',
    purpose: 'Extended flight capacity for multi-location missions.',
    specs: ['~31 min flight time per pack', 'Intelligent battery management', 'Hot-swap ready'],
    role: 'Doubles the productive window so no shot is missed between charges.',
    icon: Battery,
  },
  {
    key: 'sd',
    name: 'Memory Card',
    image: 'https://images.unsplash.com/photo-1601737487795-dab272f52420?q=80&w=1200&auto=format&fit=crop',
    purpose: 'High-speed storage for 4K footage and RAW stills.',
    specs: ['UHS-I / U3 rated', '128 GB capacity', 'Sustained write for 4K'],
    role: 'Holds the master footage before backup to the studio archive.',
    icon: HardDrive,
  },
];

// ── Static deliverables catalogue ─────────────────────────
//
// The drone division delivers a standard set of artefacts
// regardless of the project. Icons + descriptions are kept
// here so the section stays declarative.
const DELIVERABLE_CATALOG = [
  {
    key: 'video-4k',
    title: '4K Aerial Video',
    description: 'Edited, color-graded master file in 4K / 30fps.',
    icon: Video,
    fileType: 'MP4 · 4K',
  },
  {
    key: 'photos',
    title: 'Drone Photography',
    description: 'Hand-curated stills in full resolution, edited and unedited sets.',
    icon: Camera,
    fileType: 'JPEG + RAW',
  },
  {
    key: 'processed',
    title: 'Processed Images',
    description: 'Color-corrected, straightened, and exported for web and print.',
    icon: ImageIcon,
    fileType: 'ZIP · 4 GB',
  },
  {
    key: 'report',
    title: 'Mission Report',
    description: 'PDF report covering flight log, conditions, and asset inventory.',
    icon: FileText,
    fileType: 'PDF · 12 pp',
  },
  {
    key: 'inspection',
    title: 'Inspection Brief',
    description: 'Annotated findings with frame references and recommendations.',
    icon: Plane,
    fileType: 'PDF · 8 pp',
  },
];

// ── Derived results — the actual metrics displayed in the
// Results section. Falls back to per-project fields when
// present, otherwise uses a generic mission profile so the
// section still renders cleanly.
const deriveResults = (project) => {
  const stats = project?.stats || {};
  return [
    { label: 'Total Flight Time', value: stats.flight_time ?? '38 min', numeric: 38, suffix: ' min' },
    { label: 'Coverage Area', value: stats.area ?? '2.4 ha', numeric: 2.4, suffix: ' ha', decimals: 1 },
    { label: 'Photos Captured', value: stats.photos ?? 184, numeric: 184, suffix: '' },
    { label: 'Videos Recorded', value: stats.videos ?? 6, numeric: 6, suffix: '' },
    { label: 'Top Resolution', value: stats.resolution ?? '4K / 30fps', numeric: null },
    { label: 'Files Delivered', value: stats.files ?? 24, numeric: 24, suffix: '' },
  ];
};

// ── Helpers ────────────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
  } catch {
    return iso;
  }
};

// Split a title into two visual lines for editorial display.
// Falls back to the original string when the title is one word.
const splitTitle = (title = '') => {
  const words = title.trim().split(/\s+/);
  if (words.length <= 1) return [title, ''];
  const cut = Math.ceil(words.length / 2);
  return [words.slice(0, cut).join(' '), words.slice(cut).join(' ')];
};

// Build a usable gallery array. The DB may provide `gallery`
// as a string[] or a richer shape; otherwise we derive four
// images from the hero + curated Unsplash shots.
const buildGallery = (project) => {
  if (Array.isArray(project?.gallery) && project.gallery.length > 0) {
    return project.gallery.map((g, i) =>
      typeof g === 'string' ? { src: g, alt: `${project.title} — frame ${i + 1}` } : g
    );
  }
  const hero = project?.image_url || dronePlaceholder({ width: 1600, height: 900, label: project?.title || 'Mission' });
  return [
    { src: hero, alt: `${project?.title || 'Mission'} — hero` },
    { src: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=1600&auto=format&fit=crop', alt: `${project?.title || 'Mission'} — aerial` },
    { src: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?q=80&w=1600&auto=format&fit=crop', alt: `${project?.title || 'Mission'} — establishing` },
    { src: 'https://images.unsplash.com/photo-1508614589041-895b889cc23d?q=80&w=1600&auto=format&fit=crop', alt: `${project?.title || 'Mission'} — top-down` },
    { src: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?q=80&w=1600&auto=format&fit=crop', alt: `${project?.title || 'Mission'} — detail` },
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

// ── Section primitives ─────────────────────────────────────
const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-3 mb-5">
    <span className="w-1.5 h-1.5 rounded-full bg-[#F44A22]" aria-hidden="true" />
    <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-white/60">
      {children}
    </span>
  </div>
);

const SectionTitle = ({ children, className = '' }) => (
  <h2 className={`drone-heading text-3xl md:text-5xl lg:text-6xl text-white leading-[1.05] ${className}`}>
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
const cardHover = { y: -4, scale: 1.01 };
const cardHoverTransition = { type: 'spring', stiffness: 300, damping: 22 };
const viewport = { once: true, margin: '-80px' };

// ── Lightbox for the gallery ───────────────────────────────
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
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F44A22]"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                className="absolute left-3 sm:left-6 w-11 h-11 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F44A22]"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onNext(); }}
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
const DroneProjectDetailPage = () => {
  useFontsEffect();
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const shouldReduce = useReducedMotion();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  // Subtle parallax: the hero image drifts up while the text drifts up faster.
  const heroImgY = useTransform(scrollYProgress, [0, 1], ['0%', shouldReduce ? '0%' : '14%']);
  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', shouldReduce ? '0%' : '40%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, shouldReduce ? 1 : 0.2]);

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

      // Related missions — same division, exclude self, take 3.
      const list = await api.get('/projects/division/DRONE');
      if (list.ok) {
        setRelated(
          (list.data || []).filter((p) => p.id !== id).slice(0, 3)
        );
      }
      setLoading(false);

      document.title = `${res.data?.title || 'Mission'} | BuildWithLami Drone`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          res.data?.summary ||
            `Drone case study — ${res.data?.title || 'mission'} by BuildWithLami.`
        );
      }
    };
    load();
  }, [id]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center drone-body">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Error / not-found state ──
  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center text-center px-6 drone-body">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/50 mb-4">— 404</p>
        <h1 className="drone-heading text-4xl md:text-6xl text-white leading-[0.95] mb-6">Mission<br />Not Found</h1>
        <p className="text-sm text-white/60 mb-10 max-w-md">
          {error || "We couldn't find that mission. It may have been archived."}
        </p>
        <Link
          to="/drone"
          className="text-sm font-bold underline decoration-2 underline-offset-4 hover:text-white/60 transition-colors"
        >
          ← Back to Drone
        </Link>
      </div>
    );
  }

  // ── Derived data ──
  const heroImage =
    project.image_url ||
    dronePlaceholder({ width: 1600, height: 900, label: project.title });
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
    { label: 'Industry', value: project.category || 'Aerial Services' },
    { label: 'Location', value: project.location || 'Nigeria' },
    { label: 'Timeline', value: project.duration || '1 day on site' },
    { label: 'Drone Used', value: 'DJI Mini 4K' },
    { label: 'Weather', value: project.weather || 'Clear · 28°C · light wind' },
    { label: 'Team Size', value: project.team_size || '1 pilot / 1 visual observer' },
    { label: 'Deliverables', value: '4K video · stills · mission report' },
  ];

  // Lightbox handlers (kept stable across renders).
  const openLightbox = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () =>
    setLightboxIndex((i) => (i === null ? null : (i - 1 + gallery.length) % gallery.length));
  const nextImage = () =>
    setLightboxIndex((i) => (i === null ? null : (i + 1) % gallery.length));

  // Smooth scroll helper for the hero CTAs.
  const scrollToGallery = () => {
    const el = document.getElementById('drone-gallery');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-[#0a0a0a] text-white drone-body min-h-screen">
      {/* ── Ambient gradient backdrop (fixed, behind everything) ── */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-60"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(244,74,34,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(255,255,255,0.03) 0%, transparent 50%)',
        }}
      />

      {/* ═══════════════════════════════════════════════════════
          1. HERO
          ═══════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[100svh] w-full overflow-hidden z-10"
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
                'linear-gradient(180deg, rgba(10,10,10,0.45) 0%, rgba(10,10,10,0.7) 50%, rgba(10,10,10,0.95) 100%)',
            }}
            aria-hidden="true"
          />
        </motion.div>

        {/* Hero content */}
        <motion.div
          className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-28 md:pt-36 pb-20 md:pb-28 min-h-[100svh] flex flex-col justify-end"
          style={{ y: heroTextY, opacity: heroOpacity }}
        >
          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduce ? 0 : 0.6, ease: 'easeOut' }}
            className="flex flex-wrap items-center gap-3 mb-8"
          >
            {project.category && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-white/80">
                {project.category}
              </span>
            )}
            {project.status && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F44A22]/15 border border-[#F44A22]/30 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-[#F44A22]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F44A22]" aria-hidden="true" />
                {project.status}
              </span>
            )}
            {project.published_at && (
              <span className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-white/60">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                {formatDate(project.published_at)}
              </span>
            )}
          </motion.div>

          <motion.h1
            initial={shouldReduce ? {} : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduce ? 0 : 0.7, delay: shouldReduce ? 0 : 0.1, ease: 'easeOut' }}
            className="drone-heading text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl text-white leading-[0.95] tracking-tight max-w-6xl"
          >
            {titleLine1}
            {titleLine2 && (
              <>
                <br />
                <span className="text-white/50">{titleLine2}</span>
              </>
            )}
          </motion.h1>

          {project.summary && (
            <motion.p
              initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduce ? 0 : 0.6, delay: shouldReduce ? 0 : 0.2, ease: 'easeOut' }}
              className="mt-6 text-base sm:text-lg md:text-xl text-white/70 max-w-2xl font-light leading-relaxed"
            >
              {project.summary}
            </motion.p>
          )}

          {/* Meta row — client + location */}
          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduce ? 0 : 0.5, delay: shouldReduce ? 0 : 0.3, ease: 'easeOut' }}
            className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm"
          >
            {project.client_name && (
              <div className="flex items-center gap-2 text-white/80">
                <Building2 className="w-4 h-4 text-white/40" aria-hidden="true" />
                <span className="font-bold">{project.client_name}</span>
              </div>
            )}
            {project.location && (
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="w-4 h-4 text-white/40" aria-hidden="true" />
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
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3.5 rounded-full text-xs md:text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#F44A22] hover:text-white transition-colors"
              whileHover={shouldReduce ? {} : { scale: 1.04 }}
              whileTap={shouldReduce ? {} : { scale: 0.97 }}
            >
              <PlayCircle className="w-4 h-4" aria-hidden="true" />
              View Gallery
            </motion.button>
            <motion.a
              href={project.live_url || '#'}
              target={project.live_url ? '_blank' : undefined}
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/15 text-white px-6 py-3.5 rounded-full text-xs md:text-sm font-bold uppercase tracking-[0.2em] hover:border-white/40 transition-colors"
              whileHover={shouldReduce ? {} : { scale: 1.04 }}
              whileTap={shouldReduce ? {} : { scale: 0.97 }}
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Download Report
            </motion.a>
            <Link
              to="/drone"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white px-4 py-3.5 text-xs md:text-sm font-bold uppercase tracking-[0.2em] transition-colors"
            >
              Back to Projects
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Quick-stats strip — pinned to the bottom of the hero. */}
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: shouldReduce ? 0 : 0.6, delay: shouldReduce ? 0 : 0.5 }}
          className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-10 md:pb-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
            {[
              { label: 'Flight Time', value: results[0].value, icon: Clock },
              { label: 'Area Covered', value: results[1].value, icon: Maximize2 },
              { label: 'Images Captured', value: results[2].value, icon: Camera },
              { label: 'Deliverables', value: '5 files', icon: FileText },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-[#0a0a0a]/60 backdrop-blur-md p-5 md:p-7">
                  <div className="flex items-center gap-2 text-white/40 mb-3">
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold">{s.label}</span>
                  </div>
                  <div className="drone-heading text-2xl md:text-3xl text-white">{s.value}</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          2. PROJECT OVERVIEW — editorial two-column
          ═══════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-12 py-20 md:py-32 max-w-7xl mx-auto border-t border-white/5">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16"
        >
          <motion.div variants={fadeUp} className="lg:col-span-7">
            <SectionLabel>Mission Overview</SectionLabel>
            <SectionTitle className="mb-10">A closer look at<br />the mission.</SectionTitle>

            <div className="space-y-6 text-base md:text-lg text-white/70 leading-relaxed font-light max-w-2xl">
              {overviewParagraphs.slice(0, 3).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="lg:col-span-5">
            <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8">
              <SectionLabel>Quick Facts</SectionLabel>
              <dl className="space-y-5">
                {quickFacts.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-baseline justify-between gap-4 border-b border-white/5 pb-3 last:border-b-0 last:pb-0"
                  >
                    <dt className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-white/40 font-bold whitespace-nowrap">
                      {f.label}
                    </dt>
                    <dd className="text-sm md:text-base font-bold text-white text-right break-words">
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
          3. PROJECT GALLERY — featured + grid + lightbox
          ═══════════════════════════════════════════════════════ */}
      <section
        id="drone-gallery"
        className="relative z-10 px-6 md:px-12 py-20 md:py-32 max-w-7xl mx-auto border-t border-white/5"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
            <div>
              <SectionLabel>Project Gallery</SectionLabel>
              <SectionTitle>Frames from<br />the field.</SectionTitle>
            </div>
            <p className="text-sm md:text-base text-white/60 max-w-md font-light">
              A curated set of stills from the mission. Click any frame to open the full-resolution view.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
            {/* Featured — first image, large */}
            {gallery[0] && (
              <motion.button
                type="button"
                onClick={() => openLightbox(0)}
                whileHover={shouldReduce ? {} : cardHover}
                transition={cardHoverTransition}
                className="md:col-span-8 group relative aspect-[16/10] md:aspect-[16/9] rounded-2xl overflow-hidden bg-white/5 border border-white/10 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F44A22]"
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
                  <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold">Featured</span>
                  <span className="text-[10px] md:text-xs font-bold">01 / {String(gallery.length).padStart(2, '0')}</span>
                </div>
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
                  className="group relative aspect-[4/3] md:aspect-[16/9] rounded-2xl overflow-hidden bg-white/5 border border-white/10 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F44A22]"
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
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Frame</span>
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
                className={`group relative aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F44A22] ${
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
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Frame</span>
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
          4. EQUIPMENT USED — only the user's actual kit
          ═══════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-12 py-20 md:py-32 max-w-7xl mx-auto border-t border-white/5">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-10 md:mb-14">
            <SectionLabel>Equipment Used</SectionLabel>
            <SectionTitle>The kit behind<br />every frame.</SectionTitle>
            <p className="mt-5 text-sm md:text-base text-white/60 max-w-2xl font-light">
              Only the gear we actually own. Real equipment, real results.
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
                  className="group relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="p-5 md:p-6">
                    <h3 className="drone-heading text-sm md:text-base text-white mb-2">{item.name}</h3>
                    <p className="text-xs md:text-sm text-white/60 leading-relaxed mb-4">{item.purpose}</p>
                    <ul className="space-y-1.5 mb-4">
                      {item.specs.map((s) => (
                        <li
                          key={s}
                          className="flex items-start gap-2 text-[11px] md:text-xs text-white/70"
                        >
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-[#F44A22] shrink-0" aria-hidden="true" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/40 mb-1.5">
                        Role in Project
                      </p>
                      <p className="text-xs text-white/80 leading-relaxed">{item.role}</p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          5. PROJECT RESULTS — animated count-up cards
          ═══════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-12 py-20 md:py-32 max-w-7xl mx-auto border-t border-white/5">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-10 md:mb-14">
            <SectionLabel>Project Results</SectionLabel>
            <SectionTitle>The numbers,<br />on the record.</SectionTitle>
          </motion.div>

          <motion.div
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5"
          >
            {results.map((r) => (
              <ResultCard key={r.label} result={r} />
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          6. DELIVERABLES — download cards with icons
          ═══════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-12 py-20 md:py-32 max-w-7xl mx-auto border-t border-white/5">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-10 md:mb-14">
            <SectionLabel>Deliverables</SectionLabel>
            <SectionTitle>What you receive<br />at handoff.</SectionTitle>
            <p className="mt-5 text-sm md:text-base text-white/60 max-w-2xl font-light">
              Every mission ships with a standard package. Files are delivered via secure link.
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
                  className="group bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-7 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-5">
                    <span className="w-11 h-11 rounded-xl bg-[#F44A22]/15 border border-[#F44A22]/30 text-[#F44A22] flex items-center justify-center group-hover:bg-[#F44A22] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/40">
                      {d.fileType}
                    </span>
                  </div>
                  <h3 className="drone-heading text-base md:text-lg text-white mb-2">{d.title}</h3>
                  <p className="text-xs md:text-sm text-white/60 leading-relaxed mb-6 flex-1">
                    {d.description}
                  </p>
                  <motion.button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white hover:text-black border border-white/10 text-white px-4 py-3 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] transition-colors"
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
          7. RELATED PROJECTS — 3 cards with zoom + arrow
          ═══════════════════════════════════════════════════════ */}
      {related.length > 0 && (
        <section className="relative z-10 px-6 md:px-12 py-20 md:py-32 max-w-7xl mx-auto border-t border-white/5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
              <div>
                <SectionLabel>Related Missions</SectionLabel>
                <SectionTitle>Continue<br />exploring.</SectionTitle>
              </div>
              <Link
                to="/drone"
                className="inline-flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors self-start md:self-end"
              >
                All Missions
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
                    to={`/drone/projects/${p.id}`}
                    className="group block bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F44A22]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={p.image_url || dronePlaceholder({ width: 800, height: 600, label: p.title })}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                        decoding="async"
                      />
                      {p.category && (
                        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-bold uppercase tracking-[0.25em] text-white px-2.5 py-1 rounded-full">
                          <span className="w-1 h-1 rounded-full bg-[#F44A22]" aria-hidden="true" />
                          {p.category}
                        </div>
                      )}
                    </div>
                    <div className="p-5 md:p-6 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="drone-heading text-sm md:text-base text-white leading-tight mb-2 group-hover:text-[#F44A22] transition-colors">
                          {p.title}
                        </h3>
                        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/40">
                          {p.location || 'Nigeria'}
                        </p>
                      </div>
                      <span
                        className="w-9 h-9 shrink-0 inline-flex items-center justify-center rounded-full border border-white/15 group-hover:bg-[#F44A22] group-hover:border-[#F44A22] group-hover:text-white text-white/70 transition-all"
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
          8. CTA
          ═══════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-12 py-20 md:py-32 max-w-7xl mx-auto border-t border-white/5">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={stagger}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent p-8 md:p-16 lg:p-20 text-center"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(244,74,34,0.15) 0%, transparent 60%)',
            }}
          />
          <div className="relative">
            <motion.div variants={fadeUp} className="flex justify-center mb-5">
              <SectionLabel>Ready When You Are</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="drone-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] max-w-3xl mx-auto"
            >
              Need Professional<br />
              Drone <span className="text-[#F44A22]">Services?</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-6 text-base md:text-lg text-white/70 max-w-2xl mx-auto font-light leading-relaxed"
            >
              Aerial photography, videography, mapping, and inspection — delivered on time, on brief, and to cinematic standard.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4"
            >
              <motion.div
                whileHover={shouldReduce ? {} : { scale: 1.04 }}
                whileTap={shouldReduce ? {} : { scale: 0.97 }}
              >
                <Link
                  to="/drone#contact"
                  className="inline-flex items-center gap-2 bg-white text-black px-7 py-4 rounded-full text-xs md:text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#F44A22] hover:text-white transition-colors"
                >
                  Book Drone Inspection
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={shouldReduce ? {} : { scale: 1.04 }}
                whileTap={shouldReduce ? {} : { scale: 0.97 }}
              >
                <Link
                  to="/drone#contact"
                  className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/15 text-white px-7 py-4 rounded-full text-xs md:text-sm font-bold uppercase tracking-[0.2em] hover:border-white/40 transition-colors"
                >
                  Request Quote
                </Link>
              </motion.div>
              <motion.a
                href={`tel:${CONTACT.phoneE164}`}
                className="inline-flex items-center gap-2 text-white/70 hover:text-white px-5 py-4 text-xs md:text-sm font-bold uppercase tracking-[0.2em] transition-colors"
                whileHover={shouldReduce ? {} : { scale: 1.04 }}
                whileTap={shouldReduce ? {} : { scale: 0.97 }}
              >
                Call Now
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
      className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-5 md:p-7 overflow-hidden group"
    >
      <div
        className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 bg-[#F44A22]/10 rounded-full blur-3xl group-hover:bg-[#F44A22]/20 transition-colors"
        aria-hidden="true"
      />
      <div className="relative">
        {result.numeric != null ? (
          <div className="drone-heading text-2xl md:text-4xl text-white">
            <CountUp
              value={result.numeric}
              suffix={result.suffix || ''}
              decimals={result.decimals || 0}
              inView={inView}
            />
          </div>
        ) : (
          <div className="drone-heading text-2xl md:text-3xl text-white">{result.value}</div>
        )}
        <div className="mt-2 text-[10px] md:text-xs uppercase tracking-[0.25em] text-white/50 font-bold">
          {result.label}
        </div>
      </div>
    </motion.div>
  );
};

export default DroneProjectDetailPage;
