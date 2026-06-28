import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export const Skeleton = ({
  variant = 'rect',
  width = '100%',
  height,
  className = '',
}) => {
  const shouldReduce = useReducedMotion();

  const resolvedHeight =
    height ??
    (variant === 'text'
      ? '0.9rem'
      : variant === 'circle'
      ? width
      : variant === 'card'
      ? '12rem'
      : '1rem');

  const shapeClass =
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'text'
      ? 'rounded'
      : 'rounded-sm';

  const baseStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof resolvedHeight === 'number' ? `${resolvedHeight}px` : resolvedHeight,
    backgroundColor: '#1a1a1a',
  };

  return (
    <div
      className={`relative overflow-hidden ${shapeClass} ${className}`}
      style={baseStyle}
      aria-hidden="true"
    >
      {!shouldReduce && (
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, #2a2a2a 50%, transparent 100%)',
          }}
          animate={{ x: ['-100%', '100%'] }}
          transition={{
            repeat: Infinity,
            duration: 1.4,
            ease: 'linear',
          }}
        />
      )}
    </div>
  );
};

// ── Skeleton exit + content enter wrapper ──
export const SkeletonTransition = ({ isLoading, skeleton, children }) => {
  const shouldReduce = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: shouldReduce ? 0 : 0.25 } }}
        >
          {skeleton}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={shouldReduce ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduce ? 0 : 0.4, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── Variant: Project Card ──
export const ProjectCardSkeleton = () => (
  <div className="w-full">
    <Skeleton variant="rect" height="400px" className="mb-4" />
    <Skeleton variant="text" width="60%" height="1rem" className="mb-2" />
    <Skeleton variant="text" width="40%" height="0.75rem" className="mb-3" />
    <div className="flex gap-2">
      <Skeleton variant="rect" width="60px" height="20px" />
      <Skeleton variant="rect" width="80px" height="20px" />
      <Skeleton variant="rect" width="50px" height="20px" />
    </div>
  </div>
);

// ── Variant: Hero Section ──
export const HeroSkeleton = () => (
  <div className="w-full max-w-2xl">
    <Skeleton variant="text" width="40%" height="0.75rem" className="mb-6" />
    <Skeleton variant="text" width="90%" height="4rem" className="mb-3" />
    <Skeleton variant="text" width="70%" height="4rem" className="mb-3" />
    <Skeleton variant="text" width="80%" height="4rem" className="mb-8" />
    <Skeleton variant="text" width="100%" height="1.25rem" className="mb-2" />
    <Skeleton variant="text" width="85%" height="1.25rem" className="mb-10" />
    <Skeleton variant="rect" width="200px" height="56px" />
  </div>
);

// ── Variant: Skills Grid ──
export const SkillSkeleton = () => (
  <div className="flex flex-col items-center gap-3">
    <Skeleton variant="circle" width="48px" height="48px" />
    <Skeleton variant="text" width="80px" height="0.75rem" />
  </div>
);

// ── Variant: Testimonial Card ──
export const TestimonialSkeleton = () => (
  <div className="w-full p-6">
    <Skeleton variant="circle" width="48px" height="48px" className="mb-4" />
    <Skeleton variant="text" width="100%" height="0.9rem" className="mb-2" />
    <Skeleton variant="text" width="95%" height="0.9rem" className="mb-2" />
    <Skeleton variant="text" width="70%" height="0.9rem" />
  </div>
);

export default Skeleton;
