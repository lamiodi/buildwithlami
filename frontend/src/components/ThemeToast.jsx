import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Moon, Sun, X } from 'lucide-react';
import { THEME_NOTICE_MS } from '../utils/theme.js';

export default function ThemeToast({ notice, isDark, onKeepTheme, onSwitchNow }) {
  const reduceMotion = useReducedMotion();
  const [seconds, setSeconds] = useState(THEME_NOTICE_MS / 1000);

  useEffect(() => {
    if (!notice) return;
    const update = () => setSeconds(Math.max(0, Math.ceil((notice.deadline - Date.now()) / 1000)));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [notice]);

  const nextLabel = notice?.theme === 'dark' ? 'dark' : 'light';
  const keepLabel = isDark ? 'dark' : 'light';
  const NextIcon = nextLabel === 'dark' ? Moon : Sun;

  return (
    <AnimatePresence>
      {notice && (
        <motion.aside
          key={notice.windowKey}
          initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
          aria-label="Theme assistant"
          className="fixed bottom-24 left-4 right-4 z-[90] max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-2xl border border-accent/30 bg-white p-5 text-gray-900 shadow-2xl shadow-black/15 dark:bg-[#141414] dark:text-white sm:bottom-6 sm:left-6 sm:right-auto sm:w-[26rem]"
        >
          <div className="flex items-start gap-4">
            <motion.div
              aria-hidden="true"
              animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent"
            >
              <img src="/images/lami-theme-avatar.webp" width="64" height="64" alt="" className="h-full w-full rounded-2xl object-contain" decoding="async" />
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white"><NextIcon className="h-3 w-3" /></span>
            </motion.div>
            <div className="min-w-0 flex-1" role="status" aria-live="polite" aria-atomic="true">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">Lami · Theme assistant</p>
              <h2 className="mt-1 font-heading text-xl leading-tight">{nextLabel === 'dark' ? 'A softer view for evening.' : 'A brighter view for daytime.'}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">We’re about to switch to {nextLabel} mode to match your local time. You can keep your current appearance.</p>
            </div>
            <button type="button" onClick={onKeepTheme} aria-label={`Keep ${keepLabel} mode and dismiss notice`} className="-mr-2 -mt-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent dark:hover:bg-white/5"><X className="h-4 w-4" aria-hidden="true" /></button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button type="button" onClick={onSwitchNow} className="min-h-11 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white hover:bg-[#d93a16] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Switch to {nextLabel} now</button>
            <button type="button" onClick={onKeepTheme} className="min-h-11 rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent dark:border-white/15">Keep {keepLabel} mode</button>
            <span className="ml-auto text-xs tabular-nums text-gray-500 dark:text-gray-400" aria-hidden="true">{seconds}s</span>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">Automatic: light 6am–6pm, dark 6pm–6am. Your choice lasts until the next change.</p>
          <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10" aria-hidden="true"><div className="h-full origin-left bg-accent" style={{ transform: `scaleX(${seconds / (THEME_NOTICE_MS / 1000)})`, transition: reduceMotion ? 'none' : 'transform 1s linear' }} /></div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
