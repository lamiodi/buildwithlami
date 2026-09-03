import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const STATUS_STAGES = [
  { threshold: 0, text: 'INITIALIZING RUNTIME' },
  { threshold: 25, text: 'COMPILING DESIGN TOKENS' },
  { threshold: 55, text: 'PRE-RENDERING COMPONENTS' },
  { threshold: 82, text: 'OPTIMIZING GRAPHICS' },
  { threshold: 98, text: 'READY' },
];

const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    // Total visible duration tuned to feel deliberate, responsive, and cinematic (~1.3s).
    const duration = shouldReduce ? 250 : 1300;
    const interval = 20;
    const steps = Math.max(1, Math.round(duration / interval));
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      const t = Math.min(current / steps, 1);
      // Natural cubic ease-out so progress starts briskly then lingers smoothly at 100%
      const eased = 1 - Math.pow(1 - t, 2.4);
      const next = Math.min(Math.round(eased * 100), 100);
      setProgress(next);

      if (current >= steps) {
        clearInterval(timer);
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, shouldReduce ? 0 : 350);
        }, shouldReduce ? 0 : 160);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete, shouldReduce]);

  // Determine the active status message based on current progress
  const currentStatus = useMemo(() => {
    for (let i = STATUS_STAGES.length - 1; i >= 0; i--) {
      if (progress >= STATUS_STAGES[i].threshold) {
        return STATUS_STAGES[i].text;
      }
    }
    return STATUS_STAGES[0].text;
  }, [progress]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none bg-[#09090b] text-white"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: shouldReduce ? 1 : 1.03,
            filter: shouldReduce ? 'none' : 'blur(8px)',
            transition: { duration: shouldReduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] },
          }}
        >
          {/* Subtle architectural background grid */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />

          {/* Dynamic pulsing ambient glows */}
          <motion.div
            className="absolute w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(244,74,34,0.22) 0%, rgba(244,74,34,0.06) 45%, transparent 70%)',
              filter: 'blur(54px)',
            }}
            animate={
              shouldReduce
                ? {}
                : {
                    scale: [1, 1.18, 1],
                    opacity: [0.65, 0.95, 0.65],
                  }
            }
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.div
            className="absolute w-[260px] h-[260px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255,140,50,0.15) 0%, transparent 65%)',
              filter: 'blur(40px)',
              transform: 'translateY(-20px)',
            }}
            animate={
              shouldReduce
                ? {}
                : {
                    opacity: [0.4, 0.8, 0.4],
                  }
            }
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
          />

          {/* Main Card Wrapper with glassmorphic aesthetics */}
          <motion.div
            className="relative z-10 flex flex-col items-center px-6 py-8 sm:px-10 sm:py-10 max-w-sm sm:max-w-md w-full"
            initial={shouldReduce ? {} : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduce ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* System Status Pill */}
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-6 shadow-sm"
              initial={shouldReduce ? {} : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-white/70 uppercase">
                STUDIO CORE
              </span>
            </motion.div>

            {/* High-Resolution Brand Mark Container */}
            <motion.div
              className="relative flex items-center justify-center p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl mb-6 group"
              initial={shouldReduce ? {} : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: shouldReduce ? 0 : 0.5, delay: 0.15 }}
            >
              <img
                src="/1.png"
                alt="Buildwith_lami"
                className="h-16 sm:h-20 w-auto object-contain drop-shadow-[0_4px_24px_rgba(244,74,34,0.3)] transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Subtle top-border highlight */}
              <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            </motion.div>

            {/* Brand Title & Typography */}
            <motion.div
              className="text-center mb-7 space-y-1.5"
              initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduce ? 0 : 0.45, delay: 0.2 }}
            >
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight leading-none text-white">
                <span className="text-accent">BuildWith</span>
                <span>_Lami</span>
              </h1>
              <p className="text-[10px] sm:text-[11px] font-mono tracking-[0.35em] text-white/40 uppercase font-semibold">
                &lt; software studio &gt;
              </p>
            </motion.div>

            {/* Progress Container */}
            <div className="w-full max-w-[280px] sm:max-w-[320px] space-y-2.5">
              {/* Modern Multi-Layer Glowing Progress Track */}
              <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden relative p-[1px] shadow-inner">
                <motion.div
                  className="h-full rounded-full relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(90deg, #ea580c 0%, #f44a22 50%, #ff7849 100%)',
                    width: `${progress}%`,
                    boxShadow: '0 0 12px rgba(244, 74, 34, 0.7)',
                  }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                >
                  {/* Internal shimmering beam animation */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                      ease: 'easeInOut',
                    }}
                  />
                </motion.div>
              </div>

              {/* Progress Labels: Stage Status & Monospace Percentage */}
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono tracking-wider">
                <motion.span
                  key={currentStatus}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-white/50 font-medium truncate max-w-[200px]"
                >
                  {currentStatus}
                </motion.span>
                <span className="text-accent font-bold tabular-nums ml-2">
                  {progress}%
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;