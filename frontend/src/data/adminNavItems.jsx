// ─── src/data/adminNavItems.jsx ──────────────────────────
// Phase 6 — Workspace-scoped admin nav.
//
// Four arrays: `core` (cross-workspace) + one per division.
// `AdminLayout` uses `useAuth().divisions` to pick which set
// to render.
//
// Icons are imported from the centralized adminIcons module.
// ──────────────────────────────────────────────────────────

import { NavIcon as Icon } from './adminIcons.jsx';

// Re-export for components that import Icon from this file.
export { Icon };

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
    { to: '/admin/survey/portfolio', label: 'Portfolio', icon: Icon.FileText },
    { to: '/admin/clients', label: 'Clients', icon: Icon.Users },
    { to: '/admin/invoices', label: 'Invoices', icon: Icon.CreditCard },
];

/**
 * Drone-workspace items: flight missions + bookings + gear.
 */
export const droneNav = [
    { to: '/admin/drone/bookings', label: 'Bookings', icon: Icon.Calendar },
    { to: '/admin/drone/missions', label: 'Flight Missions', icon: Icon.Plane },
    { to: '/admin/drone/portfolio', label: 'Portfolio', icon: Icon.FileText },
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
    // Always return all workspaces manually instead of checking user divisions,
    // as requested by the user ("no conditions since i cant see it").
    return workspaces;
}
