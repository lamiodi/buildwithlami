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
      ? 'rounded-none'
      : 'rounded-none';

  const baseStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof resolvedHeight === 'number' ? `${resolvedHeight}px` : resolvedHeight,
  };

  return (
    <div
      className={`relative overflow-hidden bg-gray-200/90 dark:bg-white/10 ${shapeClass} ${className}`}
      style={baseStyle}
      aria-hidden="true"
    >
      {!shouldReduce && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-white/10 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
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
  <div className="w-full bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm p-6 flex flex-col justify-between">
    <div>
      <Skeleton variant="rect" height="190px" className="mb-4 rounded-xl" />
      <div className="flex gap-2 mb-3">
        <Skeleton variant="rect" width="60px" height="18px" />
        <Skeleton variant="rect" width="80px" height="18px" />
      </div>
      <Skeleton variant="text" width="80%" height="1.4rem" className="mb-2" />
      <Skeleton variant="text" width="100%" height="0.85rem" className="mb-1.5" />
      <Skeleton variant="text" width="65%" height="0.85rem" className="mb-4" />
    </div>
    <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex justify-between items-center">
      <Skeleton variant="text" width="90px" height="16px" />
      <Skeleton variant="rect" width="24px" height="24px" />
    </div>
  </div>
);

// ── Variant: Hero Section ──
export const HeroSkeleton = () => (
  <div className="px-6 md:px-12 max-w-7xl mx-auto pt-10 pb-20 md:pt-16 md:pb-28 flex flex-col md:flex-row items-center justify-between gap-12">
    <div className="w-full md:w-2/3 space-y-6">
      <Skeleton variant="rect" width="280px" height="26px" className="mb-4" />
      <div className="space-y-3">
        <Skeleton variant="text" width="90%" height="3.5rem" />
        <Skeleton variant="text" width="75%" height="3.5rem" />
        <Skeleton variant="text" width="60%" height="3.5rem" />
      </div>
      <div className="space-y-2 max-w-xl">
        <Skeleton variant="text" width="100%" height="1.1rem" />
        <Skeleton variant="text" width="85%" height="1.1rem" />
      </div>
      <div className="flex flex-wrap gap-4 pt-2">
        <Skeleton variant="rect" width="160px" height="20px" />
        <Skeleton variant="rect" width="180px" height="20px" />
        <Skeleton variant="rect" width="150px" height="20px" />
      </div>
      <div className="flex gap-4 pt-4">
        <Skeleton variant="rect" width="180px" height="52px" />
        <Skeleton variant="rect" width="150px" height="52px" />
      </div>
    </div>
    <div className="w-full md:w-1/3 flex justify-center md:justify-end">
      <div className="w-64 h-80 sm:w-72 sm:h-96 rounded-2xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 p-2 shadow-2xl">
        <Skeleton variant="rect" height="100%" className="rounded-xl" />
      </div>
    </div>
  </div>
);

// ── Complete Structural Home Page Skeleton ──
export const HomePageSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-background transition-colors duration-300">
    {/* 1. Hero Wireframe */}
    <HeroSkeleton />

    {/* 2. Selected Work Wireframe */}
    <section className="px-6 md:px-12 max-w-7xl mx-auto py-20 border-t border-gray-200 dark:border-white/10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-3">
          <Skeleton variant="rect" width="160px" height="18px" />
          <Skeleton variant="text" width="340px" height="2.8rem" />
        </div>
        <div className="space-y-2 max-w-md w-full">
          <Skeleton variant="text" width="100%" height="0.9rem" />
          <Skeleton variant="text" width="80%" height="0.9rem" />
        </div>
      </div>

      {/* Main Featured Project Card Skeleton */}
      <div className="mb-12 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 min-h-[320px] md:min-h-[420px]">
          <Skeleton variant="rect" height="100%" />
        </div>
        <div className="lg:col-span-5 p-8 md:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Skeleton variant="rect" width="70px" height="20px" />
              <Skeleton variant="rect" width="80px" height="20px" />
              <Skeleton variant="rect" width="60px" height="20px" />
            </div>
            <Skeleton variant="text" width="90%" height="2rem" />
            <Skeleton variant="text" width="100%" height="0.9rem" />
            <Skeleton variant="text" width="85%" height="0.9rem" />
            <div className="space-y-2 pt-2">
              <Skeleton variant="text" width="80%" height="0.8rem" />
              <Skeleton variant="text" width="75%" height="0.8rem" />
              <Skeleton variant="text" width="70%" height="0.8rem" />
            </div>
          </div>
          <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/10">
            <Skeleton variant="rect" width="170px" height="48px" />
            <Skeleton variant="rect" width="130px" height="48px" />
          </div>
        </div>
      </div>

      {/* 3-Column Supporting Projects */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
      </div>
    </section>

    {/* 3. Services Section Wireframe */}
    <section className="px-6 md:px-12 max-w-7xl mx-auto py-20 border-t border-gray-200 dark:border-white/10">
      <div className="max-w-2xl mb-12 space-y-3">
        <Skeleton variant="rect" width="190px" height="18px" />
        <Skeleton variant="text" width="380px" height="2.5rem" />
        <Skeleton variant="text" width="90%" height="1rem" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 p-7 rounded-2xl space-y-4">
            <div className="flex justify-between">
              <Skeleton variant="rect" width="100px" height="22px" />
              <Skeleton variant="text" width="60px" height="16px" />
            </div>
            <Skeleton variant="text" width="80%" height="1.6rem" />
            <Skeleton variant="text" width="100%" height="0.9rem" />
            <Skeleton variant="text" width="70%" height="0.9rem" />
            <Skeleton variant="rect" height="48px" className="rounded-lg" />
            <div className="space-y-2 pt-2">
              <Skeleton variant="text" width="90%" height="0.8rem" />
              <Skeleton variant="text" width="85%" height="0.8rem" />
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

// ── Generic Secondary Page Layout Skeleton ──
export const PageSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-background pt-28 pb-24 px-6 md:px-12 max-w-7xl mx-auto space-y-12">
    <div className="max-w-3xl space-y-4">
      <Skeleton variant="rect" width="220px" height="24px" />
      <Skeleton variant="text" width="85%" height="3.5rem" />
      <div className="space-y-2">
        <Skeleton variant="text" width="100%" height="1.1rem" />
        <Skeleton variant="text" width="75%" height="1.1rem" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <div key={idx} className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-4">
          <Skeleton variant="rect" height="160px" className="rounded-xl" />
          <Skeleton variant="text" width="75%" height="1.4rem" />
          <Skeleton variant="text" width="100%" height="0.85rem" />
          <Skeleton variant="text" width="60%" height="0.85rem" />
          <div className="pt-2">
            <Skeleton variant="rect" width="120px" height="38px" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Skeleton;
