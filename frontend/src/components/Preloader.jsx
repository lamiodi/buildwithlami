import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    // Skip only if we have ALREADY finished the preloader in this tab.
    // Note: we check sessionStorage AFTER mount, and only skip if the
    // preloader completed on a previous render — not on first ever load.
    // (Previously this checked unconditionally, which meant a refresh
    // during the preloader animation or a HMR reload would skip the
    // animation entirely.)
    if (typeof window !== 'undefined') {
      try {
        if (sessionStorage.getItem('bwl_preloader_complete') === 'true') {
          if (onComplete) onComplete();
          return;
        }
      } catch {
        // ignore private mode
      }
    }

    // Total visible duration tuned to feel deliberate but not slow.
    // Reduced motion users get a near-instant snap.
    const duration = shouldReduce ? 350 : 1600;
    const interval = 30;
    const steps = Math.max(1, Math.round(duration / interval));
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      // Ease-out so progress feels natural — fast at the start, slowing
      // toward the end so the brand mark lingers briefly before exit.
      const t = Math.min(current / steps, 1);
      const eased = 1 - Math.pow(1 - t, 2.2);
      const next = Math.min(Math.round(eased * 100), 100);
      setProgress(next);

      if (current >= steps) {
        clearInterval(timer);
        try {
          sessionStorage.setItem('bwl_preloader_complete', 'true');
        } catch {
          // ignore storage errors
        }
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, shouldReduce ? 0 : 250);
        }, shouldReduce ? 0 : 120);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete, shouldReduce]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ backgroundColor: '#161616' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: shouldReduce ? 0 : 0.5, ease: 'easeInOut' } }}
        >
          {/* Background grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* Accent glow */}
          <motion.div
            className="absolute w-72 h-72 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(244,74,34,0.18) 0%, transparent 70%)',
              filter: 'blur(48px)',
            }}
            animate={
              shouldReduce
                ? {}
                : {
                    scale: [1, 1.25, 1],
                    opacity: [0.55, 0.85, 0.55],
                  }
            }
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Brand mark */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduce ? 0 : 0.6, ease: 'easeOut' }}
          >
            {/* Logo mark — prefer the motion video, fall back to a clean static
                brand wordmark if the video fails to load or autoplay. This keeps
                the preloader visible on every device / browser without depending
                on the heavy mp4 assets. */}
            {!videoFailed ? (
              <motion.div
                className="mb-8"
                initial={shouldReduce ? {} : { scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: shouldReduce ? 0 : 0.55, delay: shouldReduce ? 0 : 0.1 }}
              >
                <video
                  src={
                    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
                      ? '/_BUILDWITH_LAMI.lightvideo.mp4'
                      : '/_BUILDWITH_LAMI.darkvideo.mp4'
                  }
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  onError={() => setVideoFailed(true)}
                  aria-label="Buildwith_lami"
                  className="h-16 sm:h-20 w-auto"
                />
              </motion.div>
            ) : (
              <motion.div
                className="mb-8 flex flex-col items-center"
                initial={shouldReduce ? {} : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: shouldReduce ? 0 : 0.6 }}
              >
                <div
                  className="font-heading font-extrabold text-white tracking-[0.04em] leading-none"
                  style={{ fontSize: '3rem' }}
                >
                  BUILD<span style={{ color: '#F44A22' }}>WITH</span>_LAMI
                </div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.6em] font-bold text-white/40">
                  &lt; code by hand /&gt;
                </div>
              </motion.div>
            )}

            {/* Brand name */}
            <motion.p
              className="text-white/60 text-[10px] uppercase tracking-[0.5em] font-bold mb-10"
              initial={shouldReduce ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: shouldReduce ? 0 : 0.4, delay: shouldReduce ? 0 : 0.3 }}
            >
              Buildwith_lami
            </motion.p>

            {/* Progress bar */}
            <div className="w-56 h-[2px] bg-white/10 relative overflow-hidden rounded-full">
              <motion.div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{ backgroundColor: '#F44A22' }}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.12, ease: 'linear' }}
              />
            </div>

            {/* Progress number */}
            <motion.span
              className="text-white/40 text-[11px] font-bold tracking-widest mt-4 font-heading tabular-nums"
              initial={shouldReduce ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: shouldReduce ? 0 : 0.3, delay: shouldReduce ? 0 : 0.4 }}
            >
              {progress}%
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;