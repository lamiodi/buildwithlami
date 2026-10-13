import curatedProjects from '../data/fallbackProjects.js';

const publishingStates = new Set(['PUBLISHED', 'DRAFT', 'ARCHIVED', 'PENDING', 'APPROVED']);
export const projectTypeLabel = value => ({
  'Client Project': 'Client Work', 'Concept Prototype': 'Concept'
}[value] || value || 'Project');
export const isConceptProject = project => projectTypeLabel(project?.project_status) === 'Concept';

// Publishing state is administrative; never display it as a delivery status.
// Match curated case studies by slug because live rows use UUIDs, local rows use numbers.
export function normalizePublicProject(record) {
  const curated = curatedProjects.find(p => p.slug && p.slug === record.slug);
  const project = { ...curated, ...record };
  project.project_status = projectTypeLabel(record.project_status || curated?.project_status);
  const deliveryState = record.status_label || record.status;
  project.status = isConceptProject(project) ? 'Concept' :
    (deliveryState && !publishingStates.has(String(deliveryState).toUpperCase()) ? deliveryState : curated?.status || 'Case study');
  project.client = record.client || record.client_name || curated?.client;
  // Repository case-study copy describes demonstrated capabilities. API rows may
  // still contain older, unsourced numerical claims; don't reintroduce those.
  if (curated) {
    if (isConceptProject(project)) project.summary = curated.summary;
    project.description = curated.description;
    project.results = curated.results;
    project.timeline = curated.timeline;
  }
  delete project.github_url;
  return project;
}

export function selectRelatedProjects(project, candidates = curatedProjects, limit = 2) {
  const source = candidates.filter(p => !(project.slug && p.slug === project.slug) && String(p.id) !== String(project.id));
  const preferred = (Array.isArray(project.relatedSlugs) ? project.relatedSlugs : []).map(slug => source.find(p => p.slug === slug || String(p.id) === String(slug))).filter(Boolean);
  const byCategory = source.filter(p => p.category === project.category);
  return [...new Map([...preferred, ...byCategory, ...source].map(p => [p.slug || String(p.id), p])).values()].slice(0, limit);
}
