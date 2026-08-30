import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    // If already preloaded in this browser session, skip immediately
    if (typeof window !== 'undefined' && sessionStorage.getItem('bwl_preloader_seen')) {
      if (onComplete) onComplete();
      return;
    }

    const duration = shouldReduce ? 100 : 250;
    const interval = 16;
    const steps = Math.max(1, duration / interval);
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      const t = current / steps;
      const eased = 1 - Math.pow(1 - t, 2);
      setProgress(Math.min(Math.round(eased * 100), 100));

      if (current >= steps) {
        clearInterval(timer);
        try {
          sessionStorage.setItem('bwl_preloader_seen', 'true');
        } catch {
          // ignore private mode storage error
        }
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, shouldReduce ? 0 : 150);
        }, shouldReduce ? 0 : 50);
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
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* Accent glow */}
          <motion.div
            className="absolute w-64 h-64 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(244,74,34,0.15) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
            animate={shouldReduce ? {} : {
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
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
            {/* Logo motion video — picks the variant that matches the current theme.
                Preloader bg is dark (#161616), so on a light page we show the dark-bg video,
                and on a dark page we show the light-bg video. */}
            <motion.div
              className="mb-8"
              initial={shouldReduce ? {} : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: shouldReduce ? 0 : 0.5, delay: shouldReduce ? 0 : 0.1 }}
            >
              <video
                src={typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
                  ? '/_BUILDWITH_LAMI.lightvideo.mp4'
                  : '/_BUILDWITH_LAMI.darkvideo.mp4'}
                autoPlay
                loop
                muted
                playsInline
                aria-label="Buildwith_lami"
                className="h-16 w-auto"
              />
            </motion.div>

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
            <div className="w-48 h-[2px] bg-white/10 relative overflow-hidden rounded-full">
              <motion.div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{ backgroundColor: '#F44A22' }}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
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
