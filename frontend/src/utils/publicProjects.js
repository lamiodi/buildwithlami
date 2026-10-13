import curatedProjects from '../data/fallbackProjects.js';

const publishingStates = new Set(['PUBLISHED', 'DRAFT', 'ARCHIVED', 'PENDING', 'APPROVED']);
export const projectTypeLabel = value => ({
  'Client Project': 'Client Work', 'Concept Prototype': 'Concept'
}[value] || value || 'Project');
export const isConceptProject = project => projectTypeLabel(project?.project_status) === 'Concept';

// Publishing state is administrative; never display it as a delivery status.
// Match curated case studies by slug because live rows use UUIDs, local rows use numbers.
export function publicEvidenceUrl(value) {
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || /(^|\.)github\.com$/i.test(url.hostname)) return null;
    return url.href;
  } catch { return null; }
}

export function normalizePublicProject(record) {
  const curated = curatedProjects.find(p => p.slug && p.slug === record.slug);
  const project = { ...curated, ...record };
  project.project_status = projectTypeLabel(record.project_status || curated?.project_status);
  const deliveryState = record.status_label || record.status;
  project.status = isConceptProject(project) ? 'Concept' :
    (deliveryState && !publishingStates.has(String(deliveryState).toUpperCase()) ? deliveryState : curated?.status || 'Case study');
  project.client = record.client || record.client_name || curated?.client;
  const description = record.description || record.content;
  const hasNumericalClaim = value => /\d+(?:\.\d+)?\s*%|zero[- ]downtime/i.test(value || '');
  // Preserve admin edits, while replacing the known old unsourced outcome
  // copy with the curated capability descriptions. Verified outcomes may
  // include an evidenceUrl and measurement context in the existing JSON fields.
  project.description = description && (!hasNumericalClaim(description) || (publicEvidenceUrl(record.meta?.outcomeEvidenceUrl) && record.meta?.measurementContext))
    ? description : curated?.description || description;
  const results = Array.isArray(record.results) ? record.results.filter(result => result && typeof result === 'object' && ['string', 'number'].includes(typeof result.value) && typeof result.label === 'string') : [];
  const supportedResults = results.length > 0 && results.every(result =>
    !/\d/.test(String(result.value ?? '')) || (publicEvidenceUrl(result.evidenceUrl) && result.measurementContext));
  project.results = supportedResults ? results : curated?.results || [];
  if (isConceptProject(project) && curated) {
    project.summary = curated.summary;
    project.description = curated.description;
    project.results = curated.results;
    project.timeline = curated.timeline;
  }
  project.featureCategories = record.featureCategories?.length ? record.featureCategories : record.feature_categories?.length ? record.feature_categories : curated?.featureCategories;
  project.techCategories = record.techCategories?.length ? record.techCategories : record.tech_categories?.length ? record.tech_categories : curated?.techCategories;
  if (record.related_slugs?.length) project.relatedSlugs = record.related_slugs;
  delete project.repo_url;
  delete project.github_url;
  return project;
}

export function selectRelatedProjects(project, candidates = curatedProjects, limit = 2) {
  const source = candidates.filter(p => !(project.slug && p.slug === project.slug) && String(p.id) !== String(project.id));
  const preferred = (Array.isArray(project.relatedSlugs) ? project.relatedSlugs : []).map(slug => source.find(p => p.slug === slug || String(p.id) === String(slug))).filter(Boolean);
  const byCategory = source.filter(p => p.category === project.category);
  return [...new Map([...preferred, ...byCategory, ...source].map(p => [p.slug || String(p.id), p])).values()].slice(0, limit);
}
