/**
 * Role configuration for BuildWithLami.
 *
 * BuildWithLami is a one-man studio operated by a single owner. There is no
 * team, no department heads, no per-division role gating. Every authenticated
 * admin user is `Owner` and has full access to every division.
 *
 * The only non-admin identity is `Client` (with the legacy `CLIENT_PORTAL`
 * alias), which authenticates into the `/portal` surface via the
 * `CLIENT_JWT_SECRET` and the per-project `trackingId` claim.
 *
 * The `roles` table, the `users.role` TEXT column, and the `users.role_id`
 * FK are all kept in place so legacy DB rows still resolve correctly and
 * the migration history stays intact — but the *runtime* only ever emits
 * `'Owner'` for admins and `'Client'` (or `'CLIENT_PORTAL'`) for clients.
 *
 * The `division` column on projects, clients, client_projects, leads, and
 * bookings is still meaningful: every project belongs to one of
 * SOFTWARE / SURVEY / DRONE. That is data, not authorisation.
 *
 * Source of truth: backend/migrations/v7_roles_rbac.sql (RBAC table) and
 * v38_simplify_roles.sql (purge of specialist role rows).
 */
export const ROLE_DIVISIONS = {
    'Owner':         ['*'],   // Full access — there is no per-division gating.
    'Client':        [],      // Clients only see their own project — gated at resource level.
    'CLIENT_PORTAL': [],      // Legacy alias for `Client` (pre-v30 portal tokens).
};

const CANONICAL_ROLES = new Set(Object.keys(ROLE_DIVISIONS));

// Legacy aliases that pre-date the one-man simplification. These are kept
// only so old JWTs and un-migrated DB rows still resolve to their canonical
// role. New code MUST use the canonical titlecase names.
const LEGACY_ROLE_ALIASES = {
    'admin':           'Owner',
    'owner':           'Owner',
    'superadmin':      'Owner',
    'admin2':          'Owner',
    'administrator':   'Owner',
    'finance':         'Owner',
    'project_manager': 'Owner',
    'pm':              'Owner',
    'developer':       'Owner',
    'survey_manager':  'Owner',
    'surveyor':        'Owner',
    'drone_manager':   'Owner',
    'drone_pilot':     'Owner',
    'staff':           'Owner',
    'client':          'Client',
    'client_portal':   'CLIENT_PORTAL',
};

/**
 * Normalise a role string so legacy ('ADMIN', 'OWNER', 'superadmin',
 * 'Finance', 'Project Manager', etc.) and the canonical 'Owner' all resolve
 * to `'Owner'`. Client-style tokens resolve to `'Client'` / `'CLIENT_PORTAL'`.
 *
 * Returns the canonical titlecase name, or the original input if we don't
 * recognise it (defensive — better to leave a string alone than to mis-route
 * a token).
 */
export function canonicalRole(role) {
    if (typeof role !== 'string') return role;
    const trimmed = role.trim();
    if (CANONICAL_ROLES.has(trimmed)) return trimmed;
    const lower = trimmed.toLowerCase();
    if (LEGACY_ROLE_ALIASES[lower]) return LEGACY_ROLE_ALIASES[lower];
    for (const r of CANONICAL_ROLES) {
        if (r.toLowerCase() === lower) return r;
    }
    return trimmed;
}

/**
 * Divisions the role can act on. `Owner` returns `['*']` (everything);
 * clients return `[]` (resource-level gating only).
 *
 * NOTE: This helper stays for backward compatibility with code that still
 * calls `divisionsForRole(role)`. Every admin path in the app already
 * short-circuits to "all divisions" for `Owner`, so callers do not need to
 * change.
 */
export function divisionsForRole(role) {
    if (!role) return [];
    if (ROLE_DIVISIONS[role]) return ROLE_DIVISIONS[role];
    const lower = String(role).toLowerCase();
    if (LEGACY_ROLE_ALIASES[lower] && ROLE_DIVISIONS[LEGACY_ROLE_ALIASES[lower]]) {
        return ROLE_DIVISIONS[LEGACY_ROLE_ALIASES[lower]];
    }
    for (const [k, v] of Object.entries(ROLE_DIVISIONS)) {
        if (k.toLowerCase() === lower) return v;
    }
    return [];
}
