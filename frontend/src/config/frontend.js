// Single source of truth for the frontend URL used in magic links and
// any other place we need to build an absolute URL to the app.
//
// In production, set VITE_FRONTEND_URL in your Vercel env.
// In dev, fall back to the current window origin so links still work.

export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
