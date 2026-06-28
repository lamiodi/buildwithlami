/**
 * Shared Framer Motion animation variants and utilities.
 * Import these into components to apply consistent motion patterns.
 */

// ── Stagger container: wrap children for sequential fade-up ──
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

// ── Fade-up child variant (used inside stagger containers) ──
export const fadeUpItem = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// ── Scroll-reveal wrapper variant ──
export const scrollReveal = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// ── Card hover spring ──
export const cardHover = {
  scale: 1.02,
  y: -4,
};
export const cardHoverTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 20,
};

// ── Button hover / tap ──
export const buttonHover = { scale: 1.04 };
export const buttonTap = { scale: 0.97 };

// ── Viewport settings for scroll-triggered sections ──
export const sectionViewport = { once: true, margin: '-80px' };

// ── Page transition wrapper ──
export const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
};

// ── Content fade-in (used after skeleton exits) ──
export const contentFadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

/**
 * Helper: returns a zero-motion variant set when reduced motion is on.
 * Usage: const variants = shouldReduce ? reducedVariants : normalVariants;
 */
export const reducedMotionVariants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};
