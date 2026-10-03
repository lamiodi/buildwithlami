import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowUpRight } from 'lucide-react';

// A brief brand introduction, not a simulated asset-download percentage.
const INTRO_MS = 520;
const EXIT_MS = 240;

export default function Preloader({ onComplete, isDark = false, preview = false }) {
  const reducedMotion = useReducedMotion();
  const [isExiting, setIsExiting] = useState(false);
  const completeRef = useRef(onComplete);
  const completedRef = useRef(false);
  const previewTheme = import.meta.env.DEV && preview
    ? new URLSearchParams(window.location.search).get('theme')
    : null;
  const dark = previewTheme === 'dark' || (previewTheme !== 'light' && isDark);

  useEffect(() => { completeRef.current = onComplete; }, [onComplete]);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    completeRef.current?.();
  }, []);

  useEffect(() => {
    if (preview) return;
    // No waiting for images, fonts, network requests, or animation callbacks.
    // Reduced-motion visitors go straight to the page.
    const reveal = setTimeout(() => setIsExiting(true), reducedMotion ? 0 : INTRO_MS);
    const complete = setTimeout(finish, reducedMotion ? 0 : INTRO_MS + EXIT_MS);
    return () => { clearTimeout(reveal); clearTimeout(complete); };
  }, [preview, reducedMotion, finish]);

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) finish(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9998]" />
        <Dialog.Content asChild onCloseAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById('main')?.focus({ preventScroll: true });
        }}>
          <motion.div
            data-testid="studio-preloader"
            initial={false}
            animate={{ opacity: isExiting ? 0 : 1 }}
            transition={{ duration: reducedMotion ? 0 : EXIT_MS / 1000, ease: 'easeOut' }}
            className={`fixed inset-0 z-[9999] flex min-h-[100dvh] flex-col justify-between overflow-y-auto px-6 py-6 sm:px-12 sm:py-10 select-none font-body outline-none ${dark ? 'bg-[#101010] text-white' : 'bg-[#f8f8f5] text-[#171717]'}`}
          >
            <Dialog.Title className="sr-only">BuildWithLami software studio</Dialog.Title>
            <Dialog.Description className="sr-only">Opening the studio. Select Enter site or press Escape to continue immediately.</Dialog.Description>

            <div className={`flex items-center justify-between gap-6 border-b pb-5 ${dark ? 'border-white/10' : 'border-black/10'}`} aria-hidden="true">
              <span className="flex items-center gap-2 text-[10px] sm:text-xs font-medium uppercase tracking-[0.18em]">
                <span className="h-1.5 w-1.5 bg-accent" /> Independent software studio
              </span>
              <span className={`hidden sm:block text-[10px] uppercase tracking-[0.18em] ${dark ? 'text-white/55' : 'text-black/55'}`}>Lagos · Working worldwide</span>
            </div>

            <div className="mx-auto w-full max-w-3xl py-12 text-center">
              <img src={dark ? '/1.png' : '/2.png'} alt="" width="100" height="64" className="mx-auto mb-7 h-14 w-24 object-contain sm:h-16" />
              <p aria-hidden="true" className="font-heading text-[clamp(2.5rem,8vw,6rem)] font-normal leading-[1.05] tracking-[-0.04em]">
                BuildWith<span className="text-accent">Lami</span><span className="text-accent">.</span>
              </p>
              <p className={`mt-5 text-sm sm:text-base tracking-wide ${dark ? 'text-white/65' : 'text-black/65'}`}>
                Thoughtful design. Purposeful software.
              </p>

              <div className="mx-auto mt-10 w-full max-w-[260px] sm:mt-12">
                <div aria-hidden="true" className={`h-px overflow-hidden ${dark ? 'bg-white/15' : 'bg-black/15'}`}>
                  <motion.div
                    className="h-full w-full origin-left bg-accent"
                    initial={reducedMotion || preview ? false : { scaleX: 0 }}
                    animate={{ scaleX: preview ? 0.68 : 1 }}
                    transition={{ duration: reducedMotion || preview ? 0 : INTRO_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <p role="status" className={`mt-4 text-[11px] font-medium tracking-[0.12em] uppercase ${dark ? 'text-white/60' : 'text-black/60'}`}>Opening the studio</p>
              </div>
            </div>

            <div className={`flex flex-wrap items-center justify-between gap-4 border-t pt-4 ${dark ? 'border-white/10' : 'border-black/10'}`}>
              <p className={`text-[10px] sm:text-xs tracking-wide ${dark ? 'text-white/55' : 'text-black/55'}`}>Design. Build. Launch.</p>
              <button type="button" onClick={finish} className={`flex min-h-11 items-center gap-2 rounded px-3 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${dark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
                Enter site <ArrowUpRight size={15} aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
