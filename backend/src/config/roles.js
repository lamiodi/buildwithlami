/**
 * Map of role → divisions the role is allowed to act on.
 * `*` means the role has access to every division (e.g. Owner).
 *
 * Source of truth: ROADMAP.md Phase 1 + UPDATE.md §11.1.
 * Keep in sync with `backend/migrations/v7_roles_rbac.sql`.
 */
export const ROLE_DIVISIONS = {
    'Owner':             ['*'],
    'Administrator':     ['*'],
    'Project Manager':   ['SOFTWARE', 'SURVEY', 'DRONE'],
    'Developer':         ['SOFTWARE'],
    'Survey Manager':    ['SURVEY'],
    'Surveyor':          ['SURVEY'],
    'Drone Manager':     ['DRONE'],
    'Drone Pilot':       ['DRONE'],
    'Finance':           ['SOFTWARE', 'SURVEY', 'DRONE'],
    'Client':            [], // clients only see their own project — gated at resource level
};

const CANONICAL_ROLES = new Set(Object.keys(ROLE_DIVISIONS));

// Legacy aliases that pre-date v22 — preserved so old JWTs and
// un-migrated DB rows still resolve to a canonical role.
const LEGACY_ROLE_ALIASES = {
    'admin': 'Owner',
    'owner': 'Owner',
    'admin2': 'Administrator',
    'administrator': 'Administrator',
    'project_manager': 'Project Manager',
    'pm': 'Project Manager',
    'survey_manager': 'Survey Manager',
    'drone_manager': 'Drone Manager',
    'finance': 'Finance',
    'developer': 'Developer',
    'surveyor': 'Surveyor',
    'drone_pilot': 'Drone Pilot',
    'client': 'Client',
};

/**
 * Normalise a role string so legacy ('ADMIN', 'OWNER') and new
 * ('Owner', 'Administrator') spellings resolve to the same value.
 * Returns the canonical titlecase name, or the original input if
 * we don't recognise it.
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
