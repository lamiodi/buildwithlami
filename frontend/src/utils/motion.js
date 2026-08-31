/**
 * Shared Framer Motion animation variants and utilities.
 * Import these into components to apply consistent motion patterns.
 */

// ── Stagger container: wrap children for sequential fade-up ──
// Container starts visible so LCP elements paint immediately. Each
// child still staggers its own opacity/y animation in.
export const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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

// ── Capability-aware hover variants ──
// On touch devices (smartphones/tablets), applying transforms on hover causes
// elements to shift under the finger on tap, which cancels click events on mobile WebKit/Blink.
// We only enable spring hover transforms on devices with true fine-pointer hover support (mice/trackpads).
const canHover =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// ── Card hover spring ──
export const cardHover = canHover
  ? { scale: 1.02, y: -4 }
  : {};

export const cardHoverTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 20,
};

// ── Button hover / tap ──
export const buttonHover = canHover ? { scale: 1.02 } : {};
export const buttonTap = { scale: 0.98 };

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
