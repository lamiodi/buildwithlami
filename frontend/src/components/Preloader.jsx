import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { DotLoader } from '@/components/ui/dot-loader';
import { game } from '@/components/ui/demo';

/**
 * BuildWith_Lami Software Studio Minimalist Preloader
 * - Minimalist luxury tech studio aesthetic
 * - 7x7 cybernetic DotLoader matrix
 * - Uncropped actual brand logo (/1.png dark, /2.png light)
 * - Hardware-accelerated GPU scaleX progress bar (60fps / 120fps liquid smooth)
 * - requestAnimationFrame synchronized monospace percentage readout
 * - Split architectural shutter departure reveal
 */
const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const shouldReduce = useReducedMotion();

  const isPreviewMode = typeof window !== 'undefined' && window.location.search.includes('preview=preloader');

  // Total duration tuned to feel deliberate, responsive, and cinematic (~1.3s)
  const duration = shouldReduce ? 250 : 1300;

  useEffect(() => {
    if (isPreviewMode) {
      setProgress(68);
      return;
    }

    let animationFrameId;
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Natural cubic ease-out matching the hardware-accelerated bar
      const eased = 1 - Math.pow(1 - t, 2.5);
      const current = Math.min(Math.round(eased * 100), 100);
      setProgress(current);

      if (t < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        const dwellTime = shouldReduce ? 0 : 120;
        setTimeout(() => {
          setIsExiting(true);
          const exitDuration = shouldReduce ? 180 : 520;
          setTimeout(() => {
            if (onComplete) onComplete();
          }, exitDuration);
        }, dwellTime);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [onComplete, shouldReduce, isPreviewMode, duration]);

  const shutterEase = [0.76, 0, 0.24, 1];

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[9999] pointer-events-auto select-none overflow-hidden min-h-[100dvh] flex items-center justify-center"
    >
      <span className="sr-only">Loading BuildWith_Lami: {progress}%</span>

      {/* ─────────────────────────────────────────────────────────────
          SPLIT ARCHITECTURAL SHUTTERS (Top & Bottom Curtain Panels)
         ───────────────────────────────────────────────────────────── */}
      {/* Top Half */}
      <motion.div
        className="absolute inset-x-0 top-0 h-1/2 bg-white dark:bg-[#09090b] border-b border-gray-100 dark:border-white/[0.04] z-10 transition-colors duration-300"
        initial={{ y: 0 }}
        animate={{ y: isExiting && !shouldReduce ? '-100%' : '0%' }}
        transition={{ duration: 0.5, ease: shutterEase }}
      />

      {/* Bottom Half */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-white dark:bg-[#09090b] border-t border-gray-100 dark:border-white/[0.04] z-10 transition-colors duration-300"
        initial={{ y: 0 }}
        animate={{ y: isExiting && !shouldReduce ? '100%' : '0%' }}
        transition={{ duration: 0.5, ease: shutterEase }}
      />

      {/* ─────────────────────────────────────────────────────────────
          MINIMALIST CENTERPIECE (DotLoader + Uncropped Logo + Gauge)
         ───────────────────────────────────────────────────────────── */}
      <motion.div
        className="relative z-30 flex flex-col items-center px-4"
        animate={{
          opacity: isExiting ? 0 : 1,
          scale: isExiting && !shouldReduce ? 0.98 : 1,
        }}
        transition={{ duration: shouldReduce ? 0.2 : 0.25, ease: 'easeOut' }}
      >
        {/* Lockup Card */}
        <div className="inline-flex items-center gap-3.5 sm:gap-4 rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-[#121214]/80 px-5 sm:px-6 py-3.5 shadow-lg shadow-black/[0.03] dark:shadow-black/40 backdrop-blur-xl transition-all duration-300">
          {/* 7x7 DotLoader Matrix */}
          <div className="flex items-center justify-center p-1 rounded-lg bg-gray-100/80 dark:bg-white/[0.04]">
            <DotLoader
              frames={game}
              duration={75}
              className="gap-0.5"
              dotClassName="bg-black/10 dark:bg-white/15 [&.active]:bg-accent size-1.5 rounded-[1px]"
            />
          </div>

          <div className="h-6 w-[1px] bg-gray-200 dark:bg-white/10" />

          {/* Actual Uncropped Brand Logo & Typography */}
          <div className="flex items-center gap-2.5">
            <img
              src="/2.png"
              alt="BuildWith_Lami"
              className="h-7 sm:h-8 w-auto object-contain block dark:hidden drop-shadow-sm"
            />
            <img
              src="/1.png"
              alt="BuildWith_Lami"
              className="h-7 sm:h-8 w-auto object-contain hidden dark:block drop-shadow-[0_2px_12px_rgba(244,74,34,0.35)]"
            />
            <span className="font-heading font-extrabold text-base sm:text-lg tracking-tight whitespace-nowrap leading-none text-gray-900 dark:text-white">
              <span className="text-accent">BuildWith</span>
              <span>_Lami</span>
            </span>
          </div>
        </div>

        {/* Buttery Smooth Hardware-Accelerated Progress Gauge */}
        <div className="w-48 sm:w-56 mt-6 flex flex-col items-center">
          <div className="h-[2px] w-full bg-gray-200/80 dark:bg-white/10 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full w-full bg-accent rounded-full origin-left will-change-transform"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isPreviewMode ? 0.68 : 1 }}
              transition={{
                duration: isPreviewMode ? 0 : (shouldReduce ? 0.25 : duration / 1000),
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </div>

          <span className="font-mono text-[10px] text-gray-400 dark:text-white/40 tabular-nums tracking-widest mt-2">
            {progress}%
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default Preloader;