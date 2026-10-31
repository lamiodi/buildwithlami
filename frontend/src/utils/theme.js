// Automatic appearance follows the visitor's local clock, not the server's timezone.
export const THEME_OVERRIDE_KEY = 'bwl-theme-override-v1';
export const THEME_WINDOW_KEY = 'bwl-theme-window-v1';
export const THEME_NOTICE_MS = 10000;

export function scheduledTheme(date) {
  const hour = date.getHours();
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
}

export function nextThemeBoundary(date) {
  const boundary = new Date(date);
  const hour = date.getHours();
  boundary.setHours(hour < 6 ? 6 : hour < 18 ? 18 : 6, 0, 0, 0);
  if (hour >= 18) boundary.setDate(boundary.getDate() + 1);
  return boundary;
}

export function themeWindow(date) {
  const start = new Date(date);
  start.setHours(date.getHours() >= 6 && date.getHours() < 18 ? 6 : 18, 0, 0, 0);
  if (date.getHours() < 6) start.setDate(start.getDate() - 1);
  return `${scheduledTheme(date)}:${start.getTime()}`;
}

export function readThemeOverride(storage, date) {
  try {
    const value = JSON.parse(storage?.getItem(THEME_OVERRIDE_KEY) || 'null');
    if (value && ['light', 'dark'].includes(value.theme) &&
      Number.isFinite(value.expiresAt) && value.expiresAt > date.getTime() &&
      value.expiresAt <= nextThemeBoundary(date).getTime()) return value;
  } catch { /* Storage may be blocked or contain an obsolete value. */ }
  return null;
}

export function initialTheme(date, storage, session) {
  const override = readThemeOverride(storage, date);
  if (override) return override.theme;
  // A first night visit starts light so the visitor sees the warning BEFORE dark mode.
  // Once the warning is accepted, reloads in the same night restore dark immediately.
  try {
    if (scheduledTheme(date) === 'dark' && session?.getItem(THEME_WINDOW_KEY) === themeWindow(date)) return 'dark';
  } catch { /* A warning still works when session storage is unavailable. */ }
  return 'light';
}

export function browserStorage(name) {
  try { return window[name]; } catch { return undefined; }
}

export function applyTheme(theme, root = document.documentElement) {
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#141414' : '#ffffff');
}

// Generate the inline, pre-paint initializer from the same functions React uses.
// The regression test detects stale HTML if this policy changes.
export function themeBootstrapScript() {
  return `(function () {\nconst THEME_OVERRIDE_KEY = ${JSON.stringify(THEME_OVERRIDE_KEY)};\nconst THEME_WINDOW_KEY = ${JSON.stringify(THEME_WINDOW_KEY)};\n${[scheduledTheme, nextThemeBoundary, themeWindow, readThemeOverride, initialTheme, browserStorage, applyTheme].map(fn => fn.toString()).join('\n')}\napplyTheme(initialTheme(new Date(), browserStorage('localStorage'), browserStorage('sessionStorage')));\n})();`;
}

// Small controller with injectable clock/timers so boundary and notice behavior
// can be tested without changing the user's clock or waiting until evening.
export function createThemeController({
  theme, onChange, storage, session, now = () => new Date(),
  setTimer = setTimeout, clearTimer = clearTimeout, canNotify = () => true
}) {
  let current = theme;
  let pending = null;
  let memoryOverride = null;
  let boundaryTimer;
  let noticeTimer;
  let stopped = false;
  const emit = () => onChange({ isDark: current === 'dark', notice: pending });
  const save = (target, key, value) => { try { target?.setItem(key, value); } catch { /* Keep working in memory. */ } };
  const overrideAt = date => {
    const saved = readThemeOverride(storage, date);
    return memoryOverride?.expiresAt > date.getTime() && memoryOverride.expiresAt <= nextThemeBoundary(date).getTime() ? memoryOverride : saved;
  };
  const cancelNotice = () => {
    clearTimer(noticeTimer);
    pending = null;
  };

  function reconcile() {
    if (stopped) return;
    const date = now();
    clearTimer(boundaryTimer);
    boundaryTimer = setTimer(reconcile, Math.max(1, nextThemeBoundary(date).getTime() - date.getTime()));
    const override = overrideAt(date);
    const target = override?.theme || scheduledTheme(date);
    if (override || target === current || !canNotify()) {
      const changed = pending !== null || (override && current !== target);
      cancelNotice();
      if (override) current = target;
      if (changed) emit();
      return;
    }
    const windowKey = themeWindow(date);
    if (pending?.theme === target && pending.windowKey === windowKey) return;
    cancelNotice();
    pending = { theme: target, deadline: date.getTime() + THEME_NOTICE_MS, windowKey };
    emit();
    noticeTimer = setTimer(switchNow, THEME_NOTICE_MS);
  }

  function switchNow() {
    if (stopped || !pending) return;
    const date = now();
    if (!canNotify() || overrideAt(date) || pending.theme !== scheduledTheme(date) || pending.windowKey !== themeWindow(date)) {
      reconcile();
      return;
    }
    current = pending.theme;
    save(session, THEME_WINDOW_KEY, themeWindow(date));
    cancelNotice();
    emit();
  }

  function choose(target) {
    if (stopped) return;
    const date = now();
    memoryOverride = { theme: target, expiresAt: nextThemeBoundary(date).getTime() };
    save(storage, THEME_OVERRIDE_KEY, JSON.stringify(memoryOverride));
    current = target;
    cancelNotice();
    emit();
    reconcile();
  }

  return {
    start() { emit(); reconcile(); },
    reconcile,
    synchronize() { memoryOverride = null; reconcile(); },
    toggle() { choose(current === 'dark' ? 'light' : 'dark'); },
    keepCurrent() { choose(current); },
    switchNow,
    stop() { stopped = true; clearTimer(boundaryTimer); cancelNotice(); }
  };
}
