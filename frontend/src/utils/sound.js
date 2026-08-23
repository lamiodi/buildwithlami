// ── High-Performance Web Audio API Sound Generator ──────────────────────
// Zero external files, instantaneous playback, zero latency, ultra-lightweight.

class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
    this.isMuted = false;

    // Load saved sound preference
    try {
      const saved = localStorage.getItem('bwl_sound_enabled');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    } catch {
      this.enabled = true;
    }
  }

  // Initialize or resume AudioContext on first user interaction
  initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  isEnabled() {
    return this.enabled && !this.isMuted;
  }

  toggleSound() {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem('bwl_sound_enabled', String(this.enabled));
    } catch {
      // ignore localStorage errors
    }
    if (this.enabled) {
      this.playPop();
    }
    return this.enabled;
  }

  setSoundEnabled(val) {
    this.enabled = Boolean(val);
    try {
      localStorage.setItem('bwl_sound_enabled', String(this.enabled));
    } catch {
      // ignore
    }
  }

  // 1. Crisp, tactile, subtle micro-click (like a mechanical switch or premium Apple tap)
  playClick() {
    if (!this.isEnabled()) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      // Micro oscillator click
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, now);
      filter.frequency.exponentialRampToValueAtTime(600, now + 0.025);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.02);

      // Volume envelope: very short & subtle
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.026);
    } catch {
      // ignore audio errors
    }
  }

  // 2. Smooth, satisfying pop sound (for modals, toggles, dropdowns, card selections)
  playPop() {
    if (!this.isEnabled()) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.055);
    } catch {
      // ignore audio errors
    }
  }

  // 3. Upbeat harmonic chime for successful operations (form submission, copy to clipboard)
  playSuccess() {
    if (!this.isEnabled()) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const now = this.audioCtx.currentTime + idx * 0.06;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
      });
    } catch {
      // ignore audio errors
    }
  }
}

export const soundManager = new SoundManager();

export const playClickSound = () => soundManager.playClick();
export const playPopSound = () => soundManager.playPop();
export const playSuccessSound = () => soundManager.playSuccess();
export const toggleSound = () => soundManager.toggleSound();
