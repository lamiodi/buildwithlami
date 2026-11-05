export function authReturnTo(location, area = 'admin') {
  const fallback = area === 'portal' ? '/portal' : '/admin';
  const state = location.state?.from;
  const candidate = new URLSearchParams(location.search).get('from') ||
    (typeof state === 'string' ? state : state?.pathname ? `${state.pathname}${state.search || ''}${state.hash || ''}` : '');
  const hasControl = [...candidate].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127);
  if (!candidate.startsWith('/') || candidate.startsWith('//') || candidate.includes('\\') || hasControl) return fallback;
  try {
    const url = new URL(candidate, 'https://local.invalid');
    if (url.origin !== 'https://local.invalid' || !(url.pathname === fallback || url.pathname.startsWith(fallback + '/'))) return fallback;
    if (url.pathname === '/portal/login') return fallback;
    return url.pathname + url.search + url.hash;
  } catch { return fallback; }
}
