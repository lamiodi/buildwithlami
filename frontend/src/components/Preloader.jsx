import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

  // True when the instant index.html shell already painted this exact design
  // during the bundle download (mobile blank-screen fix). The entrance fade
  // is skipped so the takeover reads as one continuous preloader.
  const hadEarlyShell =
    typeof window !== 'undefined' && window.__earlyPreloaderShown === true;

  // The shell hands off here — it covers the bundle-download window that
  // this component can't (it only exists once the bundle has loaded).
  useEffect(() => {
    document.getElementById('early-preloader')?.remove();
  }, []);

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

  // Fast, punchy cinematic duration (~500ms) for snappy first-load UX.
  // Below the lg breakpoint (<1024px) the sweep gets a longer, smoother
  // pace — at 500ms the fill reads as a flash on phones right after the
  // early-shell wait (owner feedback 2026-10-16). Captured once so
  // resizing mid-load can't change the pacing.
  const [isMobileViewport] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 1023px)').matches
  );
  const duration = isMobileViewport ? 1200 : 500;

  // The progress bar sweep runs as a compositor-driven CSS transition, not
  // a JS/rAF animation: right after this preloader mounts, the phone's main
  // thread is blocked hydrating the app, which stalls rAF and made the old
  // bar freeze and then lurch to 100%. Transform transitions keep rendering
  // on the compositor thread through that block. The double rAF makes the
  // scaleX(0) state paint once before the transition to 1 begins.
  const [barGo, setBarGo] = useState(false);
  useEffect(() => {
    if (isPreviewMode) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setBarGo(true)));
    return () => cancelAnimationFrame(id);
  }, [isPreviewMode]);

  useEffect(() => {
    if (isPreviewMode) {
      setProgress(68);
      return;
    }

    let animationFrameId;
    let startTime = null;
    // Only re-render when the rounded percentage actually changes — a
    // setState per rAF frame re-renders the 49-dot matrix 60x/sec and
    // drops frames on phones.
    let lastReported = -1;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Natural cubic ease-out matching the hardware-accelerated bar
      const eased = 1 - Math.pow(1 - t, 2.5);
      const target = Math.min(Math.round(eased * 100), 100);
      // Climb toward the target in bounded steps: a phone's main thread
      // stalls hydrating the app right after mount, and a pure time-based
      // counter would lurch (0→90 in one frame) once rAF resumes. The
      // max(4, lag/6) shape keeps normal-speed ticks small while letting a
      // stalled counter ramp back smoothly instead of crawling.
      const stepUp = lastReported < 0 ? 0 : Math.max(4, Math.ceil((target - lastReported) / 6));
      const current = lastReported < 0 ? 0 : Math.min(target, lastReported + stepUp);
      if (current !== lastReported) {
        lastReported = current;
        setProgress(current);
      }

      if (t < 1 || current < 100) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        const dwellTime = 40;
        setTimeout(() => {
          setIsExiting(true);
          // Let both 520ms shutter halves finish sliding before the app
          // unmounts this overlay — cutting them at 360ms pops on mobile.
          const exitDuration = 560;
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
  }, [onComplete, isPreviewMode, duration]);

  const shutterEase = [0.76, 0, 0.24, 1];

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[9999] pointer-events-auto select-none overflow-hidden w-full h-full min-h-[100dvh] flex items-center justify-center"
    >
      <span className="sr-only">Loading BuildWithLami: {progress}%</span>

      {/* ─────────────────────────────────────────────────────────────
          SPLIT ARCHITECTURAL SHUTTERS (Dark Mode: #09090b / Light: #ffffff)
         ───────────────────────────────────────────────────────────── */}
      {/* Top Half */}
      <motion.div
        className={`absolute inset-x-0 top-0 h-1/2 z-10 will-change-transform transition-colors duration-300 ${
          isDarkMode ? 'bg-[#09090b] border-b border-white/[0.04]' : 'bg-white border-b border-gray-100'
        }`}
        initial={{ y: '0%' }}
        animate={{ y: isExiting ? '-100%' : '0%' }}
        transition={{ duration: 0.52, ease: shutterEase }}
      />

      {/* Bottom Half */}
      <motion.div
        className={`absolute inset-x-0 bottom-0 h-1/2 z-10 will-change-transform transition-colors duration-300 ${
          isDarkMode ? 'bg-[#09090b] border-t border-white/[0.04]' : 'bg-white border-t border-gray-100'
        }`}
        initial={{ y: '0%' }}
        animate={{ y: isExiting ? '100%' : '0%' }}
        transition={{ duration: 0.52, ease: shutterEase }}
      />

      {/* ─────────────────────────────────────────────────────────────
          MINIMALIST CENTERPIECE (Identical proportions & animation across mobile & desktop)
         ───────────────────────────────────────────────────────────── */}
      <motion.div
        className="relative z-30 flex flex-col items-center px-4 will-change-transform"
        initial={{ opacity: hadEarlyShell ? 1 : 0, scale: hadEarlyShell ? 1 : 0.96 }}
        animate={{
          opacity: isExiting ? 0 : 1,
          scale: isExiting ? 0.98 : 1,
        }}
        transition={{ duration: isExiting ? 0.25 : 0.4, ease: 'easeOut' }}
      >
        {/* Lockup Card */}
        <div
          className={`inline-flex items-center gap-4 rounded-2xl px-6 py-3.5 md:backdrop-blur-xl transition-all duration-300 ${
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
                alt="BuildWithLami"
                className="h-8 w-auto object-contain drop-shadow-[0_2px_12px_rgba(244,74,34,0.35)]"
              />
            ) : (
              <img
                src="/2.png"
                alt="BuildWithLami"
                className="h-8 w-auto object-contain drop-shadow-sm"
              />
            )}
            <span
              className={`font-heading font-extrabold text-lg tracking-tight whitespace-nowrap leading-none ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              <span className="text-accent">BuildWith</span>
              <span>Lami</span>
            </span>
          </div>
        </div>

        {/* Hardware-Accelerated Progress Gauge */}
        <div className="w-56 mt-6 flex flex-col items-center">
          <div
            className={`h-[2px] w-full rounded-full overflow-hidden relative ${
              isDarkMode ? 'bg-white/10' : 'bg-gray-200/80'
            }`}
          >
            <div
              className="h-full w-full bg-accent rounded-full origin-left will-change-transform"
              style={{
                transform: `scaleX(${barGo || isPreviewMode ? (isPreviewMode ? 0.68 : 1) : 0})`,
                transition:
                  barGo && !isPreviewMode
                    ? `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`
                    : 'none',
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