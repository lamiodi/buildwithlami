import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getSeo, renderSeo, publicPaths, SITE_URL } from '../src/seo.js';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, process.argv[2] || 'dist');
const config = JSON.parse(await readFile(resolve(root, 'vercel.json'), 'utf8'));
const titles = new Set();
for (const path of publicPaths) {
  const seo = getSeo(path);
  assert.equal(seo.canonical, `${SITE_URL}${path}`);
  assert.ok(seo.robots.startsWith('index,'));
  assert.ok(!titles.has(seo.title), `Duplicate title at ${path}`);
  titles.add(seo.title);
  const file = path === '/' ? '/index.html' : `/seo${path}.html`;
  if (path !== '/') assert.ok(config.rewrites.some(rule => rule.source === path && rule.destination === file), `Missing rewrite: ${path}`);
  const html = await readFile(resolve(output, `.${file}`), 'utf8');
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  assert.equal((html.match(/<title>/g) || []).length, 1);
  assert.ok(html.includes(`href="${seo.canonical}"`));
  assert.ok(html.includes('name="twitter:image"'));
  assert.ok(html.includes('<main id="initial-page"'), `Missing readable body: ${path}`);
  assert.ok(html.includes('<a href="/contact">'));
  const schema = html.match(/<script id="site-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(JSON.parse(schema[1])['@graph'].length >= 3);
  const imagePath = new URL(seo.image).pathname;
  await access(resolve(output, `.${imagePath}`));
}
for (const path of ['/admin', '/portal/invoices', '/pay/private-token', '/unsubscribe?email=private', '/unknown-page', '/projects/not-a-project']) {
  const seo = getSeo(path);
  assert.equal(seo.robots, 'noindex, nofollow', path);
  assert.equal(seo.canonical, null);
  assert.ok(!renderSeo(seo).includes('private-token'));
}
assert.equal(getSeo('/contact/?service=website#form').canonical, `${SITE_URL}/contact`);
assert.equal(getSeo('/projects/1').canonical, `${SITE_URL}/projects/vonnex2x-enterprise-erp`);
assert.equal(getSeo('/drone/projects/missing', {project:null,loading:false}).robots, 'noindex, nofollow');
const hostile = renderSeo(getSeo('/projects/test', {project:{title:'</script><script>alert(1)</script>',summary:'" & <text>'}}));
assert.ok(!hostile.includes('<script>alert'));
const sitemap = await readFile(resolve(output, 'sitemap.xml'), 'utf8');
assert.equal((sitemap.match(/<loc>/g) || []).length, publicPaths.length);
assert.ok(!sitemap.includes('/admin'));
console.log(`Passed: ${publicPaths.length} built pages, canonical uniqueness, metadata, schema, image assets, private/404 noindex, escaping and sitemap.`);
