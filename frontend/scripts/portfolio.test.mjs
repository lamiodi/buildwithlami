import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { normalizePublicProject, selectRelatedProjects, publicEvidenceUrl } from '../src/utils/publicProjects.js';
import projects from '../src/data/fallbackProjects.js';
import { getSeo, publicPaths } from '../src/seo.js';
import { renderSummary } from './static-summary.js';
import { CONTACT } from '../src/config/contact.js';

test('UUID-backed concept keeps its classification instead of exposing publishing state', () => {
  const result = normalizePublicProject({ id: 'database-uuid', slug: 'medios-hospital-os', status: 'PUBLISHED', status_label: 'Live', project_status: null, description: '40% fewer rejections', summary: 'zero-downtime', github_url: 'https://github.com/private' });
  assert.equal(result.project_status, 'Concept');
  assert.equal(result.status, 'Concept');
  assert.ok(!result.description.includes('40%'));
  assert.ok(!result.summary.includes('zero-downtime'));
  assert.ok(!Object.hasOwn(result, 'github_url'));
});
test('client identity and delivery status use public API fields', () => {
  const result = normalizePublicProject({ id: 'database-uuid', slug: 'new-case', status: 'PUBLISHED', status_label: 'Delivered', client_name: 'Client name', project_status: 'Client Project' });
  assert.equal(result.client, 'Client name');
  assert.equal(result.status, 'Delivered');
  assert.equal(result.project_status, 'Client Work');
  assert.equal(normalizePublicProject({ slug: 'new-case', status: 'PUBLISHED' }).status, 'Case study');
});
test('related projects exclude the current slug despite different local and API IDs', () => {
  const current = { ...projects.find(p => p.slug === 'medios-hospital-os'), id: 'database-uuid', relatedSlugs: ['medios-hospital-os', 'vonnex2x-enterprise-erp', 'vonnex2x-enterprise-erp'] };
  const related = selectRelatedProjects(current);
  assert.equal(related.length, 2);
  assert.ok(related.every(p => p.slug !== current.slug));
  assert.equal(new Set(related.map(p => p.slug)).size, related.length);
  assert.equal(related[0].slug, 'vonnex2x-enterprise-erp');
});
test('admin copy and qualitative results remain editable for client work', () => {
  const result = normalizePublicProject({ slug: 'tiabrand-ecommerce', content: 'Updated client-approved project overview.', results: [{value:'Integrated',label:'Checkout',description:'Updated capability.'}], related_slugs:['sourceline-limited'] });
  assert.equal(result.description, 'Updated client-approved project overview.');
  assert.equal(result.results[0].description, 'Updated capability.');
  assert.deepEqual(result.relatedSlugs, ['sourceline-limited']);
});
test('numerical outcomes require evidence and measurement context', () => {
  const base = { slug:'tiabrand-ecommerce', results:[{value:'42%',label:'Conversion',description:'Claim'}] };
  assert.ok(!normalizePublicProject(base).results.some(result => result.value === '42%'));
  const evidence = {...base, results:[{...base.results[0], evidenceUrl:'https://example.com/report',measurementContext:'Measured over the agreed comparison period.'}]};
  assert.equal(normalizePublicProject(evidence).results[0].value, '42%');
});
test('unknown API-only projects get related work without relying on curated IDs', () => {
  assert.equal(selectRelatedProjects({ id: 'new', slug: 'new', category: 'SaaS', relatedSlugs: null }).length, 2);
});
test('About metadata ties the confirmed LinkedIn profile and portrait to Eugene', () => {
  const about = getSeo('/about');
  const person = about.structuredData['@graph'].find(item => item['@type'] === 'Person');
  const page = about.structuredData['@graph'].find(item => Array.isArray(item['@type']) && item['@type'].includes('ProfilePage'));
  assert.equal(person.name, 'Eugene Odibenuah');
  assert.deepEqual(person.sameAs, [CONTACT.social.linkedin]);
  assert.equal(CONTACT.social.linkedin, 'https://www.linkedin.com/in/eugene-odibenuah-38a448293/');
  assert.ok(about.image.endsWith('/eugene-hero.webp'));
  assert.equal(page.mainEntity['@id'], person['@id']);
});
test('malformed result rows and numeric zero cannot bypass evidence requirements', () => {
  const result = normalizePublicProject({slug:'unknown-case',results:[null, 'invalid', {value:0,label:'Data loss'}]});
  assert.deepEqual(result.results, []);
});
test('supporting evidence rejects executable and GitHub destinations', () => {
  assert.equal(publicEvidenceUrl('javascript:alert(1)'), null);
  assert.equal(publicEvidenceUrl('https://github.com/owner/private'), null);
  assert.equal(publicEvidenceUrl('not a URL'), null);
  assert.equal(publicEvidenceUrl('https://example.com/report'), 'https://example.com/report');
});
test('all public metadata and readable summaries omit GitHub links', () => {
  for (const path of publicPaths) {
    assert.ok(!JSON.stringify(getSeo(path)).includes('github.com'), path);
    assert.ok(!renderSummary(path).includes('github.com'), path);
    assert.ok(!renderSummary(path).includes('undefined'), path);
  }
});
test('built sitemap includes the founder portrait on About', async () => {
  const sitemap = await readFile(new URL('../dist/sitemap.xml', import.meta.url), 'utf8');
  assert.match(sitemap, /<loc>https:\/\/www.buildwithlami.com\/about<\/loc>[^]*?<image:loc>https:\/\/www.buildwithlami.com\/eugene-hero.webp<\/image:loc>/);
});
