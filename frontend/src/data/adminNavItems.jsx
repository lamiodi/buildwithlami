// ─── src/data/adminNavItems.jsx ──────────────────────────
// Phase 6 — Workspace-scoped admin nav (icons live here so
// this file can use JSX).
//
// Four arrays: `core` (cross-workspace) + one per division.
// `AdminLayout` uses `useAuth().divisions` to pick which set
// to render. The owner of this file is the admin shell —
// each route can be reached at most once even if it lives in
// multiple arrays.
//
// Why not a single array filtered by a `divisions: [...]` tag?
//   - Survey-specific pages don't make sense in the Software
//     workspace (and vice versa). Splitting into 4 arrays
//     keeps the per-workspace nav lists intentionally small.
//   - The Owner / Administrator can manually switch workspace
//     to focus on a single division. Engineers on the
//     `Survey Manager` role can only switch to Survey, so the
//     dropdown only shows what they have access to.
// ──────────────────────────────────────────────────────────

// Inline icon set — kept tiny to avoid a separate icon library.
const I = (children) => (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>{children}</svg>
);

export const Icon = {
    Dashboard:   I(<><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></>),
    Kanban:      I(<><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></>),
    Users:       I(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>),
    Folder:      I(<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>),
    FileText:    I(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>),
    Mail:        I(<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>),
    CreditCard:  I(<><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></>),
    BarChart:    I(<><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>),
    Bell:        I(<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>),
    Shield:      I(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>),
    Activity:    I(<><polyline points="22 12 18 12 15 21"/><path d="M5.03 21a9.99 9.99 0 1 1 .02-18 7 7 0 1 0 6.97 7"/><polyline points="3 4 3 10 9 10"/></>),
    Settings:    I(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>),
    Calendar:    I(<><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>),
    Plane:       I(<><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></>),
    Satellite:   I(<><circle cx="12" cy="12" r="3"/><path d="M2 12a10 10 0 0 1 20 0"/><path d="M5 12a7 7 0 0 1 14 0"/></>),
    Code:       I(<><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 6"/></>),
    Help:       I(<><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></>),
    Payments:   I(<><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></>),
};

// ── Nav arrays ───────────────────────────────────────────

/**
 * Cross-workspace items: shown in *every* workspace. Dashboard
 * is always here; security / settings / logs are cross-cutting.
 */
export const coreNav = [
    { to: '/admin', label: 'Dashboard', icon: Icon.Dashboard, end: true },
    { to: '/admin/crm', label: 'CRM Pipeline', icon: Icon.Kanban },
    { to: '/admin/email-templates', label: 'Email Templates', icon: Icon.Mail },
    { to: '/admin/inbox', label: 'Inbox', icon: Icon.Bell },
    { to: '/admin/contracts', label: 'Contracts', icon: Icon.Code },
    { to: '/admin/payments', label: 'Payment Proofs', icon: Icon.Payments },
    { to: '/admin/security/2fa', label: 'Two-Factor Auth', icon: Icon.Shield },
    { to: '/admin/help', label: 'Help & Reference', icon: Icon.Help },
    { to: '/admin/settings', label: 'Settings', icon: Icon.Settings },
];

/**
 * Software-workspace items: developer + project management
 * surface. Visible to roles with `divisions: ['SOFTWARE']`
 * or `divisions: '*'` (Owner / Administrator).
 */
export const softwareNav = [
    { to: '/admin/clients', label: 'Clients', icon: Icon.Users },
    { to: '/admin/projects', label: 'Client Projects', icon: Icon.Folder },
    { to: '/admin/portfolio', label: 'Portfolio', icon: Icon.FileText },
    { to: '/admin/invoices', label: 'Invoices', icon: Icon.CreditCard },
    { to: '/admin/cms', label: 'CMS Pages', icon: Icon.FileText },
    { to: '/admin/testimonials', label: 'Testimonials', icon: Icon.Users },
    { to: '/admin/templates', label: 'Forms & Intake', icon: Icon.FileText },
    { to: '/admin/contracts', label: 'Contracts', icon: Icon.FileText },
    { to: '/admin/reports', label: 'Reports', icon: Icon.BarChart },
];

/**
 * Survey-workspace items: a focused subset tailored to
 * land-survey work. Project Manager-equivalent: Survey Manager
 * / Surveyor roles see this and only this.
 */
export const surveyNav = [
    { to: '/admin/survey/bookings', label: 'Bookings', icon: Icon.Calendar },
    { to: '/admin/survey/projects', label: 'Survey Projects', icon: Icon.Satellite },
    { to: '/admin/equipment', label: 'Equipment', icon: Icon.Folder },
    { to: '/admin/clients', label: 'Clients', icon: Icon.Users },
    { to: '/admin/invoices', label: 'Invoices', icon: Icon.CreditCard },
];

/**
 * Drone-workspace items: flight missions + bookings + gear.
 */
export const droneNav = [
    { to: '/admin/drone/bookings', label: 'Bookings', icon: Icon.Calendar },
    { to: '/admin/drone/missions', label: 'Flight Missions', icon: Icon.Plane },
    { to: '/admin/equipment', label: 'Equipment', icon: Icon.Folder },
    { to: '/admin/industries', label: 'Industries', icon: Icon.BarChart },
    { to: '/admin/clients', label: 'Clients', icon: Icon.Users },
    { to: '/admin/invoices', label: 'Invoices', icon: Icon.CreditCard },
];

/**
 * All four workspaces, keyed by id. `AdminLayout` uses this
 * for the workspace selector dropdown.
 */
export const workspaces = [
    { id: 'software', label: 'Software',   icon: Icon.Code,      nav: softwareNav },
    { id: 'survey',   label: 'Survey',     icon: Icon.Satellite, nav: surveyNav },
    { id: 'drone',    label: 'Drone',      icon: Icon.Plane,     nav: droneNav },
];

/**
 * Resolve which workspaces a user can see. The User object's
 * `divisions` array is what `requireDivision` reads on the
 * backend. Owners / Administrators get `'*'`, so we map that
 * to every workspace.
 *
 *   user.divisions = '*'             → all three
 *   user.divisions = ['SOFTWARE']     → only software
 *   user.divisions = ['SURVEY','DRONE']→ survey + drone
 */
export function visibleWorkspaces(user) {
    if (!user) return [];
    const divs = user.divisions;
    if (divs === '*' || (Array.isArray(divs) && divs.includes('*'))) {
        return workspaces;
    }
    if (!Array.isArray(divs)) return [];
    return workspaces.filter((w) => divs.includes(w.id.toUpperCase()));
}
