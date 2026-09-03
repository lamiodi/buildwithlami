import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { DotLoader } from '@/components/ui/dot-loader';
import { game } from '@/components/ui/demo';

/**
 * BuildWith_Lami Software Studio Minimalist Preloader
 * - Fully responsive to Dark Mode and Light Mode
 * - 7x7 cybernetic DotLoader matrix (adaptive dot colors)
 * - Actual uncropped brand logo (/1.png dark, /2.png light)
 * - Hardware-accelerated GPU scaleX progress bar (60fps / 120fps liquid smooth)
 * - requestAnimationFrame synchronized monospace percentage readout
 * - Split architectural shutter departure reveal
 */
const Preloader = ({ onComplete, isDark: propIsDark }) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const shouldReduce = useReducedMotion();

  // Support ?preview=preloader and optional &theme=light or &theme=dark for instant verification
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isPreviewMode = searchParams?.get('preview') === 'preloader';
  const forcedTheme = searchParams?.get('theme');

  // Track active theme state with DOM MutationObserver fallback
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (forcedTheme === 'light') return false;
    if (forcedTheme === 'dark') return true;
    if (typeof propIsDark === 'boolean') return propIsDark;
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  useEffect(() => {
    if (forcedTheme === 'light') {
      setIsDarkMode(false);
      return;
    }
    if (forcedTheme === 'dark') {
      setIsDarkMode(true);
      return;
    }
    if (typeof propIsDark === 'boolean') {
      setIsDarkMode(propIsDark);
    }
  }, [propIsDark, forcedTheme]);

  // Synchronize with external DOM class changes on <html>
  useEffect(() => {
    if (forcedTheme) return;
    if (typeof document === 'undefined') return;

    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [forcedTheme]);

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
          SPLIT ARCHITECTURAL SHUTTERS (Dark Mode: #09090b / Light: #ffffff)
         ───────────────────────────────────────────────────────────── */}
      {/* Top Half */}
      <motion.div
        className={`absolute inset-x-0 top-0 h-1/2 z-10 transition-colors duration-300 ${
          isDarkMode ? 'bg-[#09090b] border-b border-white/[0.04]' : 'bg-white border-b border-gray-100'
        }`}
        initial={{ y: 0 }}
        animate={{ y: isExiting && !shouldReduce ? '-100%' : '0%' }}
        transition={{ duration: 0.5, ease: shutterEase }}
      />

      {/* Bottom Half */}
      <motion.div
        className={`absolute inset-x-0 bottom-0 h-1/2 z-10 transition-colors duration-300 ${
          isDarkMode ? 'bg-[#09090b] border-t border-white/[0.04]' : 'bg-white border-t border-gray-100'
        }`}
        initial={{ y: 0 }}
        animate={{ y: isExiting && !shouldReduce ? '100%' : '0%' }}
        transition={{ duration: 0.5, ease: shutterEase }}
      />

      {/* ─────────────────────────────────────────────────────────────
          MINIMALIST CENTERPIECE (Theme Responsive)
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
        <div
          className={`inline-flex items-center gap-3.5 sm:gap-4 rounded-2xl px-5 sm:px-6 py-3.5 backdrop-blur-xl transition-all duration-300 ${
            isDarkMode
              ? 'border border-white/10 bg-[#121214]/90 shadow-lg shadow-black/40 text-white'
              : 'border border-gray-200/80 bg-white/90 shadow-lg shadow-black/[0.03] text-gray-900'
          }`}
        >
          {/* 7x7 DotLoader Matrix with theme-adaptive dots */}
          <div
            className={`flex items-center justify-center p-1 rounded-lg ${
              isDarkMode ? 'bg-white/[0.04]' : 'bg-gray-100/90'
            }`}
          >
            <DotLoader
              frames={game}
              duration={75}
              className="gap-0.5"
              dotClassName={`${
                isDarkMode ? 'bg-white/15' : 'bg-black/10'
              } [&.active]:bg-accent size-1.5 rounded-[1px]`}
            />
          </div>

          <div className={`h-6 w-[1px] ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />

          {/* Actual Uncropped Brand Logo (Adaptive Light / Dark Mode) */}
          <div className="flex items-center gap-2.5">
            {isDarkMode ? (
              <img
                src="/1.png"
                alt="BuildWith_Lami"
                className="h-7 sm:h-8 w-auto object-contain drop-shadow-[0_2px_12px_rgba(244,74,34,0.35)]"
              />
            ) : (
              <img
                src="/2.png"
                alt="BuildWith_Lami"
                className="h-7 sm:h-8 w-auto object-contain drop-shadow-sm"
              />
            )}
            <span
              className={`font-heading font-extrabold text-base sm:text-lg tracking-tight whitespace-nowrap leading-none ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              <span className="text-accent">BuildWith</span>
              <span>_Lami</span>
            </span>
          </div>
        </div>

        {/* Buttery Smooth Hardware-Accelerated Progress Gauge */}
        <div className="w-48 sm:w-56 mt-6 flex flex-col items-center">
          <div
            className={`h-[2px] w-full rounded-full overflow-hidden relative ${
              isDarkMode ? 'bg-white/10' : 'bg-gray-200/80'
            }`}
          >
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

          <span
            className={`font-mono text-[10px] tabular-nums tracking-widest mt-2 ${
              isDarkMode ? 'text-white/40' : 'text-gray-400'
            }`}
          >
            {progress}%
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default Preloader;