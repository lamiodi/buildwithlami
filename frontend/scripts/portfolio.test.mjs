import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { normalizePublicProject, selectRelatedProjects } from '../src/utils/publicProjects.js';
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
