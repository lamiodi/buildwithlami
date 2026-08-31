import React, { useEffect } from 'react';
import { playClickSound, soundManager } from '../utils/sound';

/**
 * Global SoundEffects Component
 * Listens for click / tap events across the website on interactive elements
 * (buttons, links, select triggers, cards, tab triggers, inputs) and triggers
 * the tactile click sound asynchronously without blocking navigation or UI threads.
 */
export const SoundEffects = () => {
  useEffect(() => {
    // Unlock AudioContext on first pointer event
    const handleFirstInteraction = () => {
      try {
        soundManager.initContext();
      } catch {
        // ignore
      }
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { passive: true });
    window.addEventListener('keydown', handleFirstInteraction, { passive: true });

    // Global listener for interactive elements - runs non-blocking
    const handleGlobalClick = (event) => {
      try {
        const target = event.target;
        if (!target) return;

        // Check if target or any ancestor is an interactive element
        const interactiveEl = target.closest(
          'button, a, input, select, textarea, [role="button"], [role="tab"], [role="menuitem"], [role="switch"], [role="combobox"], [data-clickable], .cursor-pointer'
        );

        if (interactiveEl) {
          // Prevent click sound on disabled elements
          if (interactiveEl.hasAttribute('disabled') || interactiveEl.getAttribute('aria-disabled') === 'true') {
            return;
          }
          // Non-blocking async execution
          setTimeout(() => {
            playClickSound();
          }, 0);
        }
      } catch {
        // ignore
      }
    };

    document.addEventListener('click', handleGlobalClick, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  return null;
};

export default SoundEffects;
