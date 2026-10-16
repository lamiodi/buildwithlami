import React, { useState, useEffect } from 'react';
import { game } from '@/components/ui/demo';

// One full pass of the dot matrix = frames × 75ms (same cadence as the
// early shell in index.html — keep both in sync).
const dotCycleMs = game.length * 75;

// Per-dot CSS keyframes from the game frames — identical output to the
// generator embedded in index.html's early-shell script. CSS opacity
// animations run on the compositor, so the matrix keeps cycling even
// while the main thread is blocked hydrating the app; the previous
// setInterval class-toggling froze for seconds on phones.
function buildDotKeyframes(frames) {
  let css = '';
  for (let d = 0; d < 49; d++) {
    const stops = [];
    for (let f = 0; f < frames.length; f++) {
      stops.push(`${((f * 100) / frames.length).toFixed(3)}%{opacity:${frames[f].includes(d) ? 1 : 0}}`);
    }
    css += `@keyframes plD${d}{${stops.join('')}100%{opacity:${frames[0].includes(d) ? 1 : 0}}}`;
  }
  return css;
}

// Static rules for the matrix plus the shutter/center transitions that
// replaced framer-motion (compositor-driven, so the exit can't jank while
// the page underneath renders). Reduced-motion users get no transitions
// and no dot animation — matching the app-wide MotionConfig behaviour.
const preloaderMotionCss = `
.pl-dotmatrix .pl-dot{position:relative;width:6px;height:6px;border-radius:1px;background:rgba(0,0,0,.1)}
.dark .pl-dotmatrix .pl-dot{background:rgba(255,255,255,.15)}
@media (prefers-reduced-motion: no-preference){
  .pl-dotmatrix .pl-dot::after{content:"";position:absolute;inset:0;border-radius:inherit;background:#F44A22;opacity:0;animation:var(--pl-anim);animation-delay:var(--pl-delay,0ms)}
}
.pl-shutter{transition:transform .52s cubic-bezier(.76,0,.24,1)}
.pl-center-anim{transition:opacity .4s ease-out,transform .4s ease-out}
.pl-center-anim.pl-exiting{transition-duration:.25s}
@media (prefers-reduced-motion: reduce){
  .pl-shutter,.pl-center-anim{transition:none}
}
`;

function installPreloaderMotionStyles() {
  if (document.getElementById('pl-motion-style')) return;
  const st = document.createElement('style');
  st.id = 'pl-motion-style';
  st.textContent = preloaderMotionCss + buildDotKeyframes(game);
  document.head.appendChild(st);
}

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

  // The preloader's own motion styles (dot keyframes + shutter/center
  // transitions), installed once per page load.
  useEffect(() => {
    installPreloaderMotionStyles();
  }, []);

  // Phase-continue the dot matrix from the early shell so the handoff
  // doesn't reset the pattern mid-cycle. Captured once: re-reading
  // performance.now() on every progress tick would shift animation-delay
  // and stutter the pattern.
  const [dotPhaseDelay] = useState(() => {
    const start = typeof window !== 'undefined' ? window.__shellDotStart : null;
    return hadEarlyShell && start ? -((performance.now() - start) % dotCycleMs) : 0;
  });

  // Fresh loads (no early shell) fade the lockup in over 400ms; takeovers
  // from the shell render it already visible.
  const [entered, setEntered] = useState(hadEarlyShell || isPreviewMode);
  useEffect(() => {
    if (entered) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
    return () => cancelAnimationFrame(id);
  }, [entered]);

  // The app-wide MotionConfig silences framer for reduced-motion users;
  // the hand-rolled CSS bar transition needs the same check.
  const [prefersReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

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
      <div
        className={`pl-shutter absolute inset-x-0 top-0 h-1/2 z-10 will-change-transform transition-colors duration-300 ${
          isDarkMode ? 'bg-[#09090b] border-b border-white/[0.04]' : 'bg-white border-b border-gray-100'
        }`}
        style={{ transform: isExiting ? 'translateY(-100%)' : 'translateY(0%)' }}
      />

      {/* Bottom Half */}
      <div
        className={`pl-shutter absolute inset-x-0 bottom-0 h-1/2 z-10 will-change-transform transition-colors duration-300 ${
          isDarkMode ? 'bg-[#09090b] border-t border-white/[0.04]' : 'bg-white border-t border-gray-100'
        }`}
        style={{ transform: isExiting ? 'translateY(100%)' : 'translateY(0%)' }}
      />

      {/* ─────────────────────────────────────────────────────────────
          MINIMALIST CENTERPIECE (Identical proportions & animation across mobile & desktop)
         ───────────────────────────────────────────────────────────── */}
      <div
        className={`pl-center-anim relative z-30 flex flex-col items-center px-4 will-change-transform${
          isExiting ? ' pl-exiting' : ''
        }`}
        style={{
          opacity: isExiting ? 0 : entered ? 1 : 0,
          transform: `scale(${isExiting ? 0.98 : entered ? 1 : 0.96})`,
        }}
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
            <div className="pl-dotmatrix grid grid-cols-7 gap-0.5">
              {Array.from({ length: 49 }).map((_, i) => (
                <span
                  key={i}
                  className="pl-dot"
                  style={{
                    '--pl-anim': `plD${i} ${dotCycleMs}ms linear infinite`,
                    '--pl-delay': `${dotPhaseDelay}ms`,
                  }}
                />
              ))}
            </div>
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
                  barGo && !isPreviewMode && !prefersReducedMotion
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
      </div>
    </div>
  );
};

export default Preloader;