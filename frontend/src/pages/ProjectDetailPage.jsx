import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SecurityPopup from '../components/SecurityPopup';
import { api } from '../services/api';
import fallbackProjects from '../data/fallbackProjects';
import { Skeleton, SkeletonTransition } from '../components/Skeleton';
import {
  staggerContainer as centralStaggerContainer,
  fadeUpItem,
  cardHover,
  cardHoverTransition,
  buttonHover,
  buttonTap,
  sectionViewport,
  reducedMotionVariants,
} from '../utils/motion';
import { CONTACT } from '../config/contact';

// ─────────────────────────────────────────────────────────────────────────────
// Inline icon set
// Stroke-based, 1.5px line, 24x24 viewbox. Kept local to avoid pulling an
// icon dependency. Used across hero, features, flow, stack, architecture, and
// CTA sections. Decorative use is aria-hidden; meaningful use is labelled.
// ─────────────────────────────────────────────────────────────────────────────
const Icon = ({ name, className = 'w-5 h-5' }) => {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    focusable: 'false',
  };
  switch (name) {
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3" y="4.5" width="18" height="16" rx="2" />
          <path d="M3 9h18M8 3v3M16 3v3" />
        </svg>
      );
    case 'users':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.25" />
          <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M21 19c0-2.3-1.7-4.2-4-4.5" />
        </svg>
      );
    case 'tag':
      return (
        <svg {...common}>
          <path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9z" />
          <circle cx="7.5" cy="7.5" r="1.25" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...common}>
          <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
        </svg>
      );
    case 'monitor':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8M12 16v4" />
        </svg>
      );
    case 'server':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="6" rx="1.5" />
          <rect x="3" y="14" width="18" height="6" rx="1.5" />
          <path d="M7 7h.01M7 17h.01" />
        </svg>
      );
    case 'database':
      return (
        <svg {...common}>
          <ellipse cx="12" cy="5" rx="8" ry="3" />
          <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3l8 3v6c0 5-3.4 8.5-8 9-4.6-.5-8-4-8-9V6l8-3z" />
        </svg>
      );
    case 'cloud':
      return (
        <svg {...common}>
          <path d="M7 18a4 4 0 0 1-.5-7.97A6 6 0 0 1 18 9.5 4.5 4.5 0 0 1 17.5 18H7z" />
        </svg>
      );
    case 'card':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18M7 15h3" />
        </svg>
      );
    case 'image':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="1.75" />
          <path d="M21 17l-5-5-9 8" />
        </svg>
      );
    case 'ticket':
      return (
        <svg {...common}>
          <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-2V8z" />
          <path d="M10 6v12" strokeDasharray="2 2" />
        </svg>
      );
    case 'store':
      return (
        <svg {...common}>
          <path d="M3 9l1.5-4h15L21 9M3 9v11h18V9M3 9h18" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );
    case 'target':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'book':
      return (
        <svg {...common}>
          <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2V5z" />
          <path d="M4 19a2 2 0 0 1 2-2h12" />
        </svg>
      );
    case 'graduation':
      return (
        <svg {...common}>
          <path d="M2 9l10-4 10 4-10 4L2 9z" />
          <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
          <path d="M22 9v5" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...common}>
          <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2H4.5L6 16z" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </svg>
      );
    case 'file':
      return (
        <svg {...common}>
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z" />
          <path d="M14 3v6h6" />
        </svg>
      );
    case 'wifi':
      return (
        <svg {...common}>
          <path d="M2 8.5a14 14 0 0 1 20 0" />
          <path d="M5 12a10 10 0 0 1 14 0" />
          <path d="M8.5 15.5a5 5 0 0 1 7 0" />
          <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'stethoscope':
      return (
        <svg {...common}>
          <path d="M5 3v6a4 4 0 0 0 8 0V3" />
          <path d="M9 13v3a5 5 0 0 0 10 0v-2" />
          <circle cx="19" cy="11" r="2" />
        </svg>
      );
    case 'package':
      return (
        <svg {...common}>
          <path d="M3 7l9-4 9 4-9 4-9-4z" />
          <path d="M3 7v10l9 4 9-4V7M12 11v10" />
        </svg>
      );
    case 'arrow-right':
      return (
        <svg {...common}>
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      );
    case 'arrow-up-right':
      return (
        <svg {...common}>
          <path d="M7 17L17 7M9 7h8v8" />
        </svg>
      );
    case 'arrow-down':
      return (
        <svg {...common}>
          <path d="M12 5v14M5 13l7 7 7-7" />
        </svg>
      );
    case 'github':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" focusable="false">
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'sparkle':
      return (
        <svg {...common}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.5 2.5M16 16l2.5 2.5M5.5 18.5L8 16M16 8l2.5-2.5" />
        </svg>
      );
    case 'close':
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      );
    case 'play':
      return (
        <svg {...common}>
          <path d="M7 5l12 7-12 7V5z" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'lightbox':
      return (
        <svg {...common}>
          <path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4" />
        </svg>
      );
    default:
      return null;
  }
};

// Helper to map technology names to high-quality SVG icons (SimpleIcons CDN).
// Used by the Tech Stack section. Falls back to a neutral code mark.
const getTechIcon = (tech) => {
  const t = String(tech).toLowerCase();
  if (t.includes('react')) return 'https://cdn.simpleicons.org/react/61DAFB';
  if (t.includes('node')) return 'https://cdn.simpleicons.org/nodedotjs/339933';
  if (t.includes('postgres')) return 'https://cdn.simpleicons.org/postgresql/4169E1';
  if (t.includes('supabase')) return 'https://cdn.simpleicons.org/supabase/3ECF8E';
  if (t.includes('socket')) return 'https://cdn.simpleicons.org/socketdotio/ffffff';
  if (t.includes('vite')) return 'https://cdn.simpleicons.org/vite/646CFF';
  if (t.includes('tailwind')) return 'https://cdn.simpleicons.org/tailwindcss/06B6D4';
  if (t.includes('paystack')) return 'https://cdn.simpleicons.org/paystack/09A5DB';
  if (t.includes('pwa')) return 'https://cdn.simpleicons.org/pwa/5A0FC8';
  if (t.includes('indexeddb')) return 'https://cdn.simpleicons.org/databricks/ffffff';
  if (t.includes('rxdb')) return 'https://cdn.simpleicons.org/rxdb/8D1F89';
  if (t.includes('termii')) return 'https://cdn.simpleicons.org/twilio/ffffff';
  if (t.includes('redis')) return 'https://cdn.simpleicons.org/redis/DC382D';
  if (t.includes('cloudinary')) return 'https://cdn.simpleicons.org/cloudinary/3448C5';
  if (t.includes('jwt')) return 'https://cdn.simpleicons.org/jsonwebtokens/000000';
  if (t.includes('express')) return 'https://cdn.simpleicons.org/express/ffffff';
  if (t.includes('oauth')) return 'https://cdn.simpleicons.org/oauth/ffffff';
  if (t.includes('render')) return 'https://cdn.simpleicons.org/render/46E3B7';
  if (t.includes('vercel')) return 'https://cdn.simpleicons.org/vercel/ffffff';
  return 'https://cdn.simpleicons.org/codeigniter/ffffff';
};

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton — high-fidelity placeholder for the new case-study layout
// ─────────────────────────────────────────────────────────────────────────────
const ProjectDetailSkeleton = () => (
  <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-6">
      <Skeleton variant="text" width="140px" height="20px" className="mx-auto" />
      <Skeleton variant="text" width="70%" height="64px" className="mx-auto" />
      <Skeleton variant="text" width="50%" height="40px" className="mx-auto" />
    </div>
    <div className="my-12">
      <Skeleton variant="rectangular" width="100%" height="0" className="aspect-video md:aspect-[21/9]" />
    </div>
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 py-12">
      <div className="md:col-span-4 space-y-8">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="space-y-2">
            <Skeleton variant="text" width="80px" height="14px" />
            <Skeleton variant="text" width="160px" height="22px" />
          </div>
        ))}
      </div>
      <div className="md:col-span-8 space-y-6">
        <Skeleton variant="text" width="240px" height="32px" />
        <Skeleton variant="text" width="100%" height="20px" />
        <Skeleton variant="text" width="100%" height="20px" />
        <Skeleton variant="text" width="80%" height="20px" />
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Reusable: section header
// Editorial typography with eyebrow, headline, and optional lede.
// ─────────────────────────────────────────────────────────────────────────────
const SectionHeader = ({ eyebrow, title, lede, align = 'left', number }) => {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <div className={`max-w-3xl ${alignment} mb-12 md:mb-16`}>
      <div
        className={`flex items-center gap-3 text-accent uppercase tracking-[0.25em] text-xs md:text-sm font-bold mb-5 ${
          align === 'center' ? 'justify-center' : ''
        }`}
      >
        {number && (
          <span className="text-accent/70 font-mono text-[11px] md:text-xs">{number}</span>
        )}
        <span>{eyebrow}</span>
      </div>
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight leading-[1.05] text-black dark:text-white break-words">
        {title}
      </h2>
      {lede && (
        <p className="mt-5 text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 font-light leading-relaxed max-w-2xl">
          {lede}
        </p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Reusable: lightbox for the responsive gallery
// ─────────────────────────────────────────────────────────────────────────────
const Lightbox = ({ images, index, onClose, onPrev, onNext }) => {
  // Close on ESC, navigate with arrow keys. Body scroll is locked while open.
  useEffect(() => {
    if (index === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
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
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={onClose}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Close preview"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                className="absolute left-3 sm:left-6 w-11 h-11 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Previous image"
              >
                <span className="sr-only">Previous</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="absolute right-3 sm:right-6 w-11 h-11 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Next image"
              >
                <span className="sr-only">Next</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </>
          )}

          <motion.img
            key={images[index]}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            src={images[index]}
            alt="Project preview"
            className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-xs uppercase tracking-[0.25em] font-bold">
              {index + 1} / {images.length}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSecurityPopup, setShowSecurityPopup] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const heroImageRef = useRef(null);
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : centralStaggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  // ── Data fetch — same shape as before, no breaking changes ──
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProject = async () => {
      const res = await api.get(`/projects/${id}`);
      if (res.ok && res.data) {
        setProject(res.data);
        setLoading(false);
        return;
      }
      // Fallback — locate by id or slug so the route stays stable.
      const found = fallbackProjects.find(
        (p) => p.id.toString() === id || p.slug === id
      );
      setProject(found || fallbackProjects[0]);
      setLoading(false);
    };
    fetchProject();
  }, [id]);

  // ── SEO + document title ──
  useEffect(() => {
    if (project) {
      document.title = `${project.title} — Case Study | BuildWithLami`;
      const setMeta = (selector, attr, value) => {
        const el = document.querySelector(selector);
        if (el) el.setAttribute(attr, value);
      };
      setMeta(
        'meta[name="description"]',
        'content',
        project.summary ||
          project.description ||
          `Case study of ${project.title} — engineered by BuildWithLami (Eugene Odibenuah).`
      );
    }
  }, [project]);

  // ── Derived data ──
  const imageUrl = useMemo(
    () =>
      project?.image_url ||
      project?.image ||
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop',
    [project]
  );

  // Curated gallery: explicit `gallery` array, or hero plus a few curated shots.
  // Each entry is { src, alt, device } so we can render responsive mockups.
  const galleryItems = useMemo(() => {
    if (!project) return [];
    if (Array.isArray(project.gallery) && project.gallery.length > 0) {
      return project.gallery.map((g, i) =>
        typeof g === 'string' ? { src: g, alt: `${project.title} screenshot ${i + 1}`, device: 'desktop' } : g
      );
    }
    return [
      { src: imageUrl, alt: `${project.title} — hero interface`, device: 'desktop' },
      {
        src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop',
        alt: `${project.title} — analytics dashboard`,
        device: 'desktop',
      },
      {
        src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
        alt: `${project.title} — operator workspace`,
        device: 'tablet',
      },
      {
        src: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?q=80&w=1964&auto=format&fit=crop',
        alt: `${project.title} — mobile experience`,
        device: 'phone',
      },
    ];
  }, [project, imageUrl]);

  // Quick stats — small set, prominent in the hero. Falls back to a sensible
  // default if the project doesn't define a `stats` object.
  const quickStats = useMemo(() => {
    if (!project) return [];
    const s = project.stats || {};
    const list = [
      { label: 'Screens', value: s.screens, suffix: '' },
      { label: 'API Endpoints', value: s.endpoints, suffix: '' },
      { label: 'Database Tables', value: s.tables, suffix: '' },
      {
        label: 'Lighthouse',
        value: project.metrics?.lighthouse,
        suffix: '/100',
      },
      { label: 'Launch Year', value: project.year, suffix: '' },
    ];
    return list.filter((x) => x.value !== undefined && x.value !== null && x.value !== '');
  }, [project]);

  // Related projects — resolved from the full fallback list (or any project
  // list passed in via window state). If `relatedSlugs` is not defined we
  // derive a sensible default by category.
  const relatedProjects = useMemo(() => {
    if (!project) return [];
    const source = fallbackProjects.filter((p) => p.id !== project.id);
    if (Array.isArray(project.relatedSlugs) && project.relatedSlugs.length > 0) {
      const resolved = project.relatedSlugs
        .map((slug) => source.find((p) => p.slug === slug || p.id.toString() === String(slug)))
        .filter(Boolean);
      // Top up with same-category projects if the explicit list is short.
      if (resolved.length < 2) {
        const sameCategory = source
          .filter((p) => p.category === project.category && !resolved.includes(p))
          .slice(0, 2 - resolved.length);
        resolved.push(...sameCategory);
      }
      return resolved.slice(0,2);
    }
    return source
      .filter((p) => p.category === project.category)
      .slice(0, 2)
      .concat(source.filter((p) => p.category !== project.category).slice(0, 2))
      .slice(0, 2);
  }, [project]);

  // Lightbox handlers
  const openLightbox = useCallback((i) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i - 1 + galleryItems.length) % galleryItems.length)),
    [galleryItems.length]
  );
  const nextImage = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i + 1) % galleryItems.length)),
    [galleryItems.length]
  );

  if (!project && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-black dark:text-white pt-24">
        <p>Project not found.</p>
      </div>
    );
  }

  // Split title across two lines for editorial display
  const words = project?.title ? project.title.split(' ') : [];
  const firstHalf = words.slice(0, Math.ceil(words.length / 2)).join(' ');
  const secondHalf = words.slice(Math.ceil(words.length / 2)).join(' ');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background text-black dark:text-white font-body overflow-x-hidden pt-24 pb-12 transition-colors duration-300">
      {/* Back link */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-8">
        <Link
          to="/projects"
          className="inline-flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-accent transition-colors group uppercase tracking-widest font-bold"
        >
          <svg
            className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Portfolio
        </Link>
      </div>

      <SkeletonTransition isLoading={loading} skeleton={<ProjectDetailSkeleton />}>
        {project && (
          <>
            {/* ═══════════════════════════════════════════════════════════════
                1. HERO — editorial split, metadata strip, quick stats
                ═══════════════════════════════════════════════════════════════ */}
            <section className="relative max-w-7xl mx-auto px-6 md:px-12 pt-8 md:pt-16 pb-12 md:pb-24">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end">
                <motion.div
                  className="lg:col-span-8"
                  initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: shouldReduce ? 0 : 0.6, ease: 'easeOut' }}
                >
                  <p className="text-accent text-xs md:text-sm font-bold uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                    <span>Case Study</span>
                    <span className="w-8 h-px bg-accent/40" aria-hidden="true" />
                    <span className="text-gray-700 dark:text-gray-300">{project.year}</span>
                  </p>
                  <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[7rem] xl:text-[8rem] font-heading font-bold uppercase tracking-tight leading-[0.92] text-black dark:text-white break-words">
                    {firstHalf}
                    <br />
                    <span className="text-gray-700 dark:text-gray-300">{secondHalf}</span>
                  </h1>
                  {project.tagline && (
                    <p className="mt-8 text-xl md:text-2xl text-gray-700 dark:text-gray-200 font-light leading-relaxed max-w-2xl">
                      {project.tagline}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  className="lg:col-span-4"
                  initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: shouldReduce ? 0 : 0.6, delay: shouldReduce ? 0 : 0.15, ease: 'easeOut' }}
                >
                  <div className="space-y-5 border-t border-gray-200 dark:border-gray-800 pt-6">
                    {[
                      { label: 'Industry', value: project.industry || project.category || 'Software' },
                      { label: 'Client', value: project.client || 'Personal Project' },
                      { label: 'Status', value: project.status || 'Live' },
                      { label: 'Duration', value: project.duration || '—' },
                      { label: 'Role', value: project.role || 'Lead Engineer' },
                    ].map((row) => (
                      <div key={row.label} className="flex items-baseline justify-between gap-4">
                        <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400 font-bold whitespace-nowrap">
                          {row.label}
                        </span>
                        <span className="text-sm md:text-base font-bold text-black dark:text-white text-right break-words">
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    {project.live_url && project.live_url !== '#' && (
                      <motion.a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center bg-accent text-white font-bold uppercase tracking-[0.2em] text-xs px-6 py-3.5 hover:bg-black dark:hover:bg-white dark:hover:text-black transition-colors"
                        whileHover={shouldReduce ? {} : buttonHover}
                        whileTap={shouldReduce ? {} : buttonTap}
                      >
                        Visit Live Site
                        <Icon name="arrow-up-right" className="w-4 h-4 ml-2" />
                      </motion.a>
                    )}
                    {project.github_url ? (
                      <motion.a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center border border-gray-300 dark:border-white/10 text-black dark:text-white font-bold uppercase tracking-[0.2em] text-xs px-6 py-3.5 hover:border-accent hover:text-accent transition-colors"
                        whileHover={shouldReduce ? {} : buttonHover}
                        whileTap={shouldReduce ? {} : buttonTap}
                      >
                        <Icon name="github" className="w-4 h-4 mr-2" />
                        View Source
                      </motion.a>
                    ) : (
                      <motion.button
                        type="button"
                        onClick={() => setShowSecurityPopup(true)}
                        className="inline-flex items-center justify-center border border-gray-300 dark:border-white/10 text-black dark:text-white font-bold uppercase tracking-[0.2em] text-xs px-6 py-3.5 hover:border-accent hover:text-accent transition-colors cursor-pointer"
                        whileHover={shouldReduce ? {} : buttonHover}
                        whileTap={shouldReduce ? {} : buttonTap}
                      >
                        <Icon name="github" className="w-4 h-4 mr-2" />
                        Source Code
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Quick stats strip — only renders when the project provides
                  enough data to fill at least one row. */}
              {quickStats.length > 0 && (
                <motion.div
                  className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-800"
                  initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={sectionViewport}
                  transition={{ duration: shouldReduce ? 0 : 0.5 }}
                >
                  {quickStats.map((s) => (
                    <div
                      key={s.label}
                      className="bg-gray-50 dark:bg-background p-5 md:p-6 text-center"
                    >
                      <div className="text-2xl md:text-4xl font-heading font-bold text-black dark:text-white">
                        {s.value}
                        {s.suffix}
                      </div>
                      <div className="mt-1 text-[10px] md:text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-bold">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                HERO IMAGE — full-bleed, with subtle parallax
                ═══════════════════════════════════════════════════════════════ */}
            <motion.section
              className="max-w-7xl mx-auto px-6 md:px-12 pb-12 md:pb-24"
              initial={shouldReduce ? {} : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={sectionViewport}
              transition={{ duration: shouldReduce ? 0 : 0.8 }}
            >
              <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl group bg-gray-100 dark:bg-gray-900">
                <img
                  ref={heroImageRef}
                  src={imageUrl}
                  alt={`${project.title} — primary interface`}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-1000"
                  loading="eager"
                  width="1600"
                  height="680"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                  <div>
                    <div className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold opacity-80">
                      {project.industry || project.category}
                    </div>
                    <div className="text-lg md:text-2xl font-heading font-bold mt-1">
                      {project.title}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openLightbox(0)}
                    className="inline-flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-[0.25em] font-bold bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 md:px-4 md:py-2.5 rounded-full hover:bg-white hover:text-black transition-colors"
                    aria-label="Open image preview"
                  >
                    <Icon name="lightbox" className="w-4 h-4" />
                    Preview
                  </button>
                </div>
              </div>
            </motion.section>

            {/* ═══════════════════════════════════════════════════════════════
                2. PROJECT OVERVIEW — editorial layout, alternating blocks
                ═══════════════════════════════════════════════════════════════ */}
            {project.description && (
              <motion.section
                className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-gray-200 dark:border-gray-800"
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                variants={container}
              >
                <SectionHeader
                  number="01"
                  eyebrow="Overview"
                  title={project.summary || 'A premium software build, end to end.'}
                  lede="The story behind the project, distilled to what matters: the goal, the audience, the role."
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                  <motion.div variants={item} className="lg:col-span-7">
                    <div className="text-[11px] uppercase tracking-[0.3em] text-accent font-bold mb-3">Project Summary</div>
                    <p className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-black dark:text-white leading-[1.2]">
                      {project.description}
                    </p>
                  </motion.div>

                  <motion.div variants={item} className="lg:col-span-5 space-y-6">
                    {[
                      { label: 'Business Goal', value: project.solution?.architecture || project.summary },
                      { label: 'Target Audience', value: project.industry ? `Operators and decision-makers in ${project.industry.toLowerCase()}.` : 'Founders, operators, and end users who expect more from software.' },
                      { label: 'Main Challenge', value: project.challenge?.problem || 'Replacing fragmented workflows with a single, dependable system.' },
                      { label: 'Key Solution', value: 'A focused product built around the operator — fast, accessible, and engineered for the long term.' },
                      { label: 'My Role', value: project.role || 'Lead Engineer' },
                      { label: 'Timeline', value: project.duration || 'Ongoing' },
                    ].map((row) => (
                      <div key={row.label} className="border-t border-gray-200 dark:border-gray-800 pt-4">
                        <div className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400 font-bold mb-2">
                          {row.label}
                        </div>
                        <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                          {row.value}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </motion.section>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                3. CHALLENGE — two-column problem + constraints
                ═══════════════════════════════════════════════════════════════ */}
            {project.challenge && (
              <motion.section
                className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-gray-200 dark:border-gray-800"
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                variants={container}
              >
                <SectionHeader
                  number="02"
                  eyebrow="The Challenge"
                  title="What we had to solve — and why it was hard."
                  lede="Every premium build starts with a real problem. Here is the one we set out to fix."
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                  <motion.div variants={item} className="lg:col-span-7">
                    <div className="bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-6 sm:p-8 md:p-10 rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl">
                      <div className="flex items-center gap-3 mb-5">
                        <span className="w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                          <Icon name="target" className="w-5 h-5" />
                        </span>
                        <span className="text-xs md:text-sm uppercase tracking-[0.25em] font-bold text-gray-700 dark:text-gray-300">
                          The Problem
                        </span>
                      </div>
                      <p className="text-lg md:text-xl lg:text-2xl font-heading font-bold text-black dark:text-white leading-[1.35]">
                        {project.challenge.problem}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div variants={item} className="lg:col-span-5 space-y-8">
                    {Array.isArray(project.challenge.constraints) && project.challenge.constraints.length > 0 && (
                      <div>
                        <div className="flex items-center gap-3 mb-5">
                          <span className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-200 flex items-center justify-center">
                            <Icon name="shield" className="w-5 h-5" />
                          </span>
                          <span className="text-xs md:text-sm uppercase tracking-[0.25em] font-bold text-gray-700 dark:text-gray-300">
                            Constraints
                          </span>
                        </div>
                        <ul className="space-y-3">
                          {project.challenge.constraints.map((c, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm md:text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {Array.isArray(project.challenge.goals) && project.challenge.goals.length > 0 && (
                      <div>
                        <div className="flex items-center gap-3 mb-5">
                          <span className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-200 flex items-center justify-center">
                            <Icon name="sparkle" className="w-5 h-5" />
                          </span>
                          <span className="text-xs md:text-sm uppercase tracking-[0.25em] font-bold text-gray-700 dark:text-gray-300">
                            Client Goals
                          </span>
                        </div>
                        <ul className="space-y-3">
                          {project.challenge.goals.map((g, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm md:text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />
                              <span>{g}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.section>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                4. SOLUTION — why these decisions, six facets
                ═══════════════════════════════════════════════════════════════ */}
            {project.solution && (
              <motion.section
                className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-gray-200 dark:border-gray-800"
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                variants={container}
              >
                <SectionHeader
                  number="03"
                  eyebrow="The Solution"
                  title="The decisions that made it work."
                  lede="Not a list of features — a record of why each layer was built the way it was."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  {[
                    { icon: 'server', label: 'Architecture', value: project.solution.architecture },
                    { icon: 'monitor', label: 'UI Decisions', value: project.solution.ui },
                    { icon: 'database', label: 'Backend Decisions', value: project.solution.backend },
                    { icon: 'chart', label: 'Performance', value: project.solution.performance },
                    { icon: 'shield', label: 'Security', value: project.solution.security },
                    { icon: 'users', label: 'Accessibility', value: project.solution.accessibility },
                  ]
                    .filter((row) => row.value)
                    .map((row) => (
                      <motion.article
                        key={row.label}
                        variants={item}
                        whileHover={shouldReduce ? {} : cardHover}
                        transition={cardHoverTransition}
                        className="bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-white/5 shadow-lg group"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <span className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                            <Icon name={row.icon} className="w-5 h-5" />
                          </span>
                          <span className="text-xs md:text-sm uppercase tracking-[0.25em] font-bold text-gray-700 dark:text-gray-300">
                            {row.label}
                          </span>
                        </div>
                        <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                          {row.value}
                        </p>
                      </motion.article>
                    ))}
                </div>
              </motion.section>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                5. RESULTS — animated metric cards
                ═══════════════════════════════════════════════════════════════ */}
            {Array.isArray(project.results) && project.results.length > 0 && (
              <motion.section
                className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-gray-200 dark:border-gray-800"
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                variants={container}
              >
                <SectionHeader
                  number="04"
                  eyebrow="Results"
                  title="Measurable outcomes from the field."
                  lede="No fluff. The numbers that mattered when the project landed in production."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                  {project.results.map((r, i) => (
                    <motion.div
                      key={`${r.label}-${i}`}
                      variants={item}
                      whileHover={shouldReduce ? {} : cardHover}
                      transition={cardHoverTransition}
                      className="relative bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-white/5 shadow-xl overflow-hidden group"
                    >
                      <div
                        className="absolute -top-12 -right-12 w-40 h-40 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors"
                        aria-hidden="true"
                      />
                      <div className="relative">
                        <div className="text-4xl md:text-6xl font-heading font-bold text-black dark:text-white tracking-tight">
                          {r.value}
                        </div>
                        <div className="mt-3 text-sm md:text-base font-bold text-black dark:text-white">
                          {r.label}
                        </div>
                        {r.description && (
                          <p className="mt-2 text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {r.description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                6. FEATURE SHOWCASE — categorized cards with icons
                ═══════════════════════════════════════════════════════════════ */}
            {Array.isArray(project.featureCategories) && project.featureCategories.length > 0 && (
              <motion.section
                className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-gray-200 dark:border-gray-800"
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                variants={container}
              >
                <SectionHeader
                  number="05"
                  eyebrow="Feature Showcase"
                  title="What the product does — by surface area."
                  lede="Grouped by how a user would actually encounter them, not by internal hierarchy."
                />

                <div className="space-y-10 md:space-y-14">
                  {project.featureCategories.map((cat, idx) => (
                    <motion.div
                      key={cat.name}
                      variants={item}
                      className={`grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 ${
                        idx % 2 === 1 ? 'lg:[direction:rtl]' : ''
                      }`}
                    >
                      <div className="lg:col-span-4 [direction:ltr]">
                        <div className="sticky top-28">
                          <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-5">
                            <Icon name={cat.icon || 'sparkle'} className="w-6 h-6" />
                          </div>
                          <h3 className="text-2xl md:text-3xl font-heading font-bold text-black dark:text-white">
                            {cat.name}
                          </h3>
                        </div>
                      </div>
                      <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 [direction:ltr]">
                        {cat.items.map((it, i) => (
                          <motion.div
                            key={`${cat.name}-${i}`}
                            whileHover={shouldReduce ? {} : cardHover}
                            transition={cardHoverTransition}
                            className="bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-lg"
                          >
                            <h4 className="text-base md:text-lg font-heading font-bold text-black dark:text-white mb-2">
                              {it.title}
                            </h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {it.description}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                7. APPLICATION FLOW — connected cards with arrows
                ═══════════════════════════════════════════════════════════════ */}
            {Array.isArray(project.flow) && project.flow.length > 0 && (
              <motion.section
                className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-gray-200 dark:border-gray-800"
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                variants={container}
              >
                <SectionHeader
                  number="06"
                  eyebrow="Application Flow"
                  title="A typical journey through the product."
                  lede="How a real user — or operator — moves from one end of the system to the other."
                />

                <div className="relative">
                  {/* Desktop vertical timeline rail */}
                  <div
                    className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent/50 via-accent/20 to-transparent"
                    aria-hidden="true"
                  />
                  <ol className="space-y-6 md:space-y-10">
                    {project.flow.map((step, i) => (
                      <motion.li
                        key={`${step.step}-${i}`}
                        variants={item}
                        className={`grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12 items-center ${
                          i % 2 === 1 ? 'md:[direction:rtl]' : ''
                        }`}
                      >
                        <div className="[direction:ltr]">
                          <div
                            className={`bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-5 md:p-7 rounded-2xl border border-gray-200 dark:border-white/5 shadow-lg ${
                              i % 2 === 1 ? 'md:text-left' : 'md:text-right'
                            }`}
                          >
                            <div className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-accent font-bold mb-2">
                              Step {String(i + 1).padStart(2, '0')}
                            </div>
                            <h4 className="text-xl md:text-2xl font-heading font-bold text-black dark:text-white mb-2">
                              {step.step}
                            </h4>
                            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                              {step.detail}
                            </p>
                          </div>
                        </div>
                        <div className="hidden md:flex [direction:ltr] items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-accent text-white font-heading font-bold text-lg flex items-center justify-center shadow-lg shadow-accent/30">
                            {i + 1}
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ol>
                </div>
              </motion.section>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                8. TECHNOLOGY STACK — categorized cards
                ═══════════════════════════════════════════════════════════════ */}
            {Array.isArray(project.techCategories) && project.techCategories.length > 0 && (
              <motion.section
                className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-gray-200 dark:border-gray-800"
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                variants={container}
              >
                <SectionHeader
                  number="07"
                  eyebrow="Technology Stack"
                  title="Engineered with a focused, modern toolkit."
                  lede="Each category was chosen for a specific job. Nothing added for show."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                  {project.techCategories.map((cat) => (
                    <motion.div
                      key={cat.name}
                      variants={item}
                      whileHover={shouldReduce ? {} : cardHover}
                      transition={cardHoverTransition}
                      className="bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-6 md:p-7 rounded-2xl border border-gray-200 dark:border-white/5 shadow-lg"
                    >
                      <div className="flex items-center gap-3 mb-5">
                        <span className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                          <Icon name={cat.icon || 'tag'} className="w-5 h-5" />
                        </span>
                        <h3 className="text-base md:text-lg font-heading font-bold text-black dark:text-white">
                          {cat.name}
                        </h3>
                      </div>
                      <ul className="space-y-2">
                        {cat.items.map((t, i) => (
                          <li
                            key={`${cat.name}-${i}`}
                            className="flex items-center gap-3 text-sm md:text-base text-gray-800 dark:text-gray-200"
                          >
                            <img
                              src={getTechIcon(t)}
                              alt=""
                              className="w-5 h-5 object-contain"
                              loading="lazy"
                              width="20"
                              height="20"
                            />
                            <span className="font-medium">{t}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                9. SYSTEM ARCHITECTURE — diagram-style technical doc
                ═══════════════════════════════════════════════════════════════ */}
            {Array.isArray(project.architecture) && project.architecture.length > 0 && (
              <motion.section
                className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-gray-200 dark:border-gray-800"
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                variants={container}
              >
                <SectionHeader
                  number="08"
                  eyebrow="System Architecture"
                  title="How the layers talk to each other."
                  lede="A simplified view of the production topology. Designed to be readable in one breath."
                />

                <div className="max-w-4xl mx-auto space-y-4">
                  {project.architecture.map((layer, i) => (
                    <motion.div
                      key={`${layer.layer}-${i}`}
                      variants={item}
                      className="relative"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 items-stretch bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] border border-gray-200 dark:border-white/5 rounded-2xl shadow-md overflow-hidden">
                        <div className="md:col-span-3 p-5 md:p-6 bg-gray-50 dark:bg-white/5 border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/5 flex items-center gap-3">
                          <span className="text-accent font-mono text-xs md:text-sm font-bold">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <h4 className="text-base md:text-lg font-heading font-bold text-black dark:text-white">
                            {layer.layer}
                          </h4>
                        </div>
                        <div className="md:col-span-9 p-5 md:p-6 flex items-center">
                          <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                            {layer.detail}
                          </p>
                        </div>
                      </div>
                      {i < project.architecture.length - 1 && (
                        <div
                          className="flex justify-center my-2 text-accent"
                          aria-hidden="true"
                        >
                          <Icon name="arrow-down" className="w-5 h-5" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                10. RESPONSIVE GALLERY — desktop / tablet / phone mockups
                ═══════════════════════════════════════════════════════════════ */}
            {galleryItems.length > 0 && (
              <motion.section
                className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-gray-200 dark:border-gray-800"
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                variants={container}
              >
                <SectionHeader
                  number="09"
                  eyebrow="Responsive Gallery"
                  title="The product, in context."
                  lede="A look at the interfaces across desktop, tablet, and mobile — every screen hand-tuned."
                />

                <div className="space-y-8 md:space-y-12">
                  {galleryItems.map((g, i) => {
                    const isPhone = g.device === 'phone';
                    const isTablet = g.device === 'tablet';
                    return (
                      <motion.button
                        key={`${g.src}-${i}`}
                        type="button"
                        variants={item}
                        whileHover={shouldReduce ? {} : cardHover}
                        transition={cardHoverTransition}
                        onClick={() => openLightbox(i)}
                        className={`group relative block w-full text-left rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 shadow-xl ${
                          isPhone
                            ? 'max-w-xs mx-auto aspect-[9/19]'
                            : isTablet
                            ? 'max-w-2xl mx-auto aspect-[4/3]'
                            : 'aspect-[16/9]'
                        }`}
                        aria-label={`Open ${g.alt} in preview`}
                      >
                        <img
                          src={g.src}
                          alt={g.alt}
                          loading="lazy"
                          decoding="async"
                          width={isPhone ? 720 : isTablet ? 1280 : 1600}
                          height={isPhone ? 1520 : isTablet ? 960 : 900}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] font-bold">
                            {g.device === 'phone' ? 'Mobile' : g.device === 'tablet' ? 'Tablet' : 'Desktop'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] md:text-xs uppercase tracking-[0.25em] font-bold">
                            <Icon name="lightbox" className="w-4 h-4" />
                            Open
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.section>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                11. DEVELOPMENT TIMELINE — vertical timeline
                ═══════════════════════════════════════════════════════════════ */}
            {Array.isArray(project.timeline) && project.timeline.length > 0 && (
              <motion.section
                className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-gray-200 dark:border-gray-800"
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                variants={container}
              >
                <SectionHeader
                  number="10"
                  eyebrow="Development Timeline"
                  title="From discovery to launch."
                  lede="The cadence we followed — visible, predictable, and designed to de-risk every milestone."
                />

                <div className="relative max-w-4xl mx-auto">
                  <div
                    className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent via-accent/30 to-transparent"
                    aria-hidden="true"
                  />
                  <ol className="space-y-6 md:space-y-8">
                    {project.timeline.map((t, i) => (
                      <motion.li
                        key={`${t.phase}-${i}`}
                        variants={item}
                        className={`relative pl-12 md:grid md:grid-cols-2 md:gap-12 md:pl-0 ${
                          i % 2 === 1 ? 'md:[direction:rtl]' : ''
                        }`}
                      >
                        <span
                          className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-1 w-8 h-8 rounded-full bg-accent text-white font-heading font-bold text-sm flex items-center justify-center shadow-md shadow-accent/30 z-10"
                          aria-hidden="true"
                        >
                          {i + 1}
                        </span>
                        <div
                          className={`bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-lg [direction:ltr] ${
                            i % 2 === 1 ? 'md:text-left' : 'md:text-right'
                          }`}
                        >
                          <div className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-accent font-bold mb-2">
                            Phase {String(i + 1).padStart(2, '0')}
                          </div>
                          <h4 className="text-lg md:text-xl font-heading font-bold text-black dark:text-white mb-2">
                            {t.phase}
                          </h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {t.detail}
                          </p>
                        </div>
                        <div className="hidden md:block [direction:ltr]" aria-hidden="true" />
                      </motion.li>
                    ))}
                  </ol>
                </div>
              </motion.section>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                12. MY RESPONSIBILITIES — professional responsibility chips
                ═══════════════════════════════════════════════════════════════ */}
            {Array.isArray(project.responsibilities) && project.responsibilities.length > 0 && (
              <motion.section
                className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-gray-200 dark:border-gray-800"
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                variants={container}
              >
                <SectionHeader
                  number="11"
                  eyebrow="My Responsibilities"
                  title="What I owned on this project."
                  lede="Not a wish list — the actual scope I carried end to end."
                />

                <div className="flex flex-wrap gap-3 md:gap-4 max-w-5xl">
                  {project.responsibilities.map((r, i) => (
                    <motion.div
                      key={`${r}-${i}`}
                      variants={item}
                      whileHover={shouldReduce ? {} : cardHover}
                      transition={cardHoverTransition}
                      className="inline-flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] border border-gray-200 dark:border-white/5 rounded-full shadow-md"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />
                      <span className="text-xs md:text-sm font-bold text-black dark:text-white uppercase tracking-widest">
                        {r}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                13. PERFORMANCE — real technical metrics
                ═══════════════════════════════════════════════════════════════ */}
            {project.metrics && (
              <motion.section
                className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-gray-200 dark:border-gray-800"
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                variants={container}
              >
                <SectionHeader
                  number="12"
                  eyebrow="Performance"
                  title="The numbers behind the experience."
                  lede="Captured at the time of launch. Real metrics, not aspirational."
                />

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {[
                    { label: 'Lighthouse', value: project.metrics.lighthouse, suffix: '/100' },
                    { label: 'Performance', value: project.metrics.performance, suffix: '/100' },
                    { label: 'Accessibility', value: project.metrics.accessibility, suffix: '/100' },
                    { label: 'SEO', value: project.metrics.seo, suffix: '/100' },
                    { label: 'Best Practices', value: project.metrics.bestPractices, suffix: '/100' },
                    { label: 'API Response', value: project.metrics.apiResponse, suffix: '' },
                    { label: 'Bundle Size', value: project.metrics.bundle, suffix: '' },
                  ]
                    .filter((m) => m.value !== undefined && m.value !== null && m.value !== '')
                    .map((m) => (
                      <motion.div
                        key={m.label}
                        variants={item}
                        whileHover={shouldReduce ? {} : cardHover}
                        transition={cardHoverTransition}
                        className="bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] p-5 md:p-7 rounded-2xl border border-gray-200 dark:border-white/5 shadow-lg text-center"
                      >
                        <div className="text-3xl md:text-5xl font-heading font-bold text-black dark:text-white">
                          {m.value}
                          {m.suffix}
                        </div>
                        <div className="mt-2 text-[10px] md:text-xs uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400 font-bold">
                          {m.label}
                        </div>
                      </motion.div>
                    ))}
                </div>
              </motion.section>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                14. RELATED PROJECTS — premium hover cards
                ═══════════════════════════════════════════════════════════════ */}
            {relatedProjects.length > 0 && (
              <motion.section
                className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-gray-200 dark:border-gray-800"
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                variants={container}
              >
                <SectionHeader
                  number="13"
                  eyebrow="Related Projects"
                  title="More selected work."
                  lede="Other case studies in the same orbit."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {relatedProjects.map((rp) => (
                    <motion.div
                      key={rp.id}
                      variants={item}
                      whileHover={shouldReduce ? {} : cardHover}
                      transition={cardHoverTransition}
                      onClick={() => navigate(`/projects/${rp.slug || rp.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/projects/${rp.slug || rp.id}`);
                        }
                      }}
                      role="link"
                      tabIndex={0}
                      className="group cursor-pointer bg-white dark:bg-gradient-to-br dark:from-[#1e1e1e] dark:to-[#151515] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={rp.image_url || rp.image}
                          alt={rp.title}
                          loading="lazy"
                          decoding="async"
                          width="800"
                          height="500"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-4 right-4 bg-white/95 dark:bg-black/80 backdrop-blur-sm text-black dark:text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                          {rp.year || (rp.created_at ? new Date(rp.created_at).getFullYear() : '')}
                        </div>
                      </div>
                      <div className="p-6 md:p-7 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-accent font-bold mb-2">
                            {rp.industry || rp.category || 'Software'}
                          </div>
                          <h3 className="text-lg md:text-xl font-heading font-bold text-black dark:text-white mb-2 group-hover:text-accent transition-colors truncate">
                            {rp.title}
                          </h3>
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {rp.summary}
                          </p>
                        </div>
                        <span
                          className="w-10 h-10 shrink-0 inline-flex items-center justify-center rounded-full border border-gray-200 dark:border-white/10 group-hover:bg-accent group-hover:border-accent group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors"
                          aria-hidden="true"
                        >
                          <Icon name="arrow-up-right" className="w-4 h-4" />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                15. FINAL CTA — large editorial call to action
                ═══════════════════════════════════════════════════════════════ */}
            <motion.section
              className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32 border-t border-gray-200 dark:border-gray-800"
              initial="hidden"
              whileInView="visible"
              viewport={sectionViewport}
              variants={container}
            >
              <div className="max-w-4xl mx-auto text-center">
                <motion.p
                  variants={item}
                  className="text-xs md:text-sm uppercase tracking-[0.3em] text-accent font-bold mb-5"
                >
                  Ready when you are
                </motion.p>
                <motion.h2
                  variants={item}
                  className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-tight text-black dark:text-white leading-[1.02]"
                >
                  Let&rsquo;s build something{' '}
                  <span className="text-accent">exceptional.</span>
                </motion.h2>
                <motion.p
                  variants={item}
                  className="mt-6 text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto font-light leading-relaxed"
                >
                  A discovery call is the fastest way to find out if we&rsquo;re a fit. No pitch deck, no pressure — just a clear conversation about what you&rsquo;re building.
                </motion.p>
                <motion.div
                  variants={item}
                  className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4"
                >
                  <motion.a
                    href="/#contact"
                    className="inline-flex items-center justify-center bg-accent text-white font-bold uppercase tracking-[0.2em] text-xs px-7 py-4 hover:bg-black dark:hover:bg-white dark:hover:text-black transition-colors"
                    whileHover={shouldReduce ? {} : buttonHover}
                    whileTap={shouldReduce ? {} : buttonTap}
                  >
                    Start a Project
                    <Icon name="arrow-right" className="w-4 h-4 ml-2" />
                  </motion.a>
                  <motion.a
                    href={`https://wa.me/${CONTACT.phoneE164}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center border border-gray-300 dark:border-white/10 text-black dark:text-white font-bold uppercase tracking-[0.2em] text-xs px-7 py-4 hover:border-accent hover:text-accent transition-colors"
                    whileHover={shouldReduce ? {} : buttonHover}
                    whileTap={shouldReduce ? {} : buttonTap}
                  >
                    Book Discovery Call
                  </motion.a>
                  <motion.div
                    whileHover={shouldReduce ? {} : buttonHover}
                    whileTap={shouldReduce ? {} : buttonTap}
                  >
                    <Link
                      to="/projects"
                      className="inline-flex items-center justify-center text-black dark:text-white font-bold uppercase tracking-[0.2em] text-xs px-5 py-4 hover:text-accent transition-colors"
                    >
                      View More Projects
                      <Icon name="arrow-up-right" className="w-4 h-4 ml-2" />
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </motion.section>
          </>
        )}
      </SkeletonTransition>

      {/* Lightbox overlay */}
      <Lightbox
        images={galleryItems.map((g) => g.src)}
        index={lightboxIndex}
        onClose={closeLightbox}
        onPrev={prevImage}
        onNext={nextImage}
      />

      {/* Security popup — shown when the user requests source code. */}
      <SecurityPopup
        isOpen={showSecurityPopup}
        onClose={() => setShowSecurityPopup(false)}
      />
    </div>
  );
};

export default ProjectDetailPage;
