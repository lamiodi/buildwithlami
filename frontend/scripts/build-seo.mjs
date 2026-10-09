import { renderSummary } from './static-summary.js';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { getSeo, renderSeo, publicPaths, SITE_URL } from '../src/seo.js';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, process.argv[2] || 'dist');
const template = await readFile(resolve(output, 'index.html'), 'utf8');
const replaceHead = (html, seo) => html.replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, `<!-- SEO:START -->\n${renderSeo(seo)}\n<!-- SEO:END -->`);
await writeFile(resolve(output, 'app.html'), replaceHead(template, getSeo('/login')));
if (!template.includes('<!-- SEO:START -->')) throw new Error('SEO markers missing');

// lastmod is only bumped when a page's actual content (head metadata +
// prerendered body) changes, so Google can trust the date. Hashes are stored
// in scripts/seo-state.json, which is committed alongside the content change.
const stateFile = resolve(root, 'scripts/seo-state.json');
let state = {};
try { state = JSON.parse(await readFile(stateFile, 'utf8')); } catch { /* first run */ }
const today = new Date().toISOString().slice(0, 10);
const facts = {};

for (const path of publicPaths) {
  const seo = getSeo(path);
  const summary = renderSummary(path);
  const target = resolve(output, path === '/' ? 'index.html' : `seo${path}.html`);
  await mkdir(resolve(target, '..'), { recursive: true });
  await writeFile(target, replaceHead(template, seo).replace('<div id="root"></div>', `<div id="root">${summary}</div>`));
  const hash = createHash('sha256').update(`${renderSeo(seo)}\0${summary}`).digest('hex');
  const previous = state[path];
  facts[path] = { hash, lastmod: previous?.hash === hash && previous?.lastmod ? previous.lastmod : today, image: path.startsWith('/projects/') ? seo.image : undefined };
}
await writeFile(stateFile, `${JSON.stringify(facts, null, 2)}\n`);

const imageTag = fact => fact.image ? `<image:image><image:loc>${fact.image}</image:loc></image:image>` : '';
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${publicPaths.map(path => `  <url><loc>${SITE_URL}${path}</loc><lastmod>${facts[path].lastmod}</lastmod>${imageTag(facts[path])}</url>`).join('\n')}\n</urlset>\n`;
await writeFile(resolve(output, 'sitemap.xml'), sitemap);
await writeFile(resolve(root, 'public/sitemap.xml'), sitemap);
console.log(`SEO: generated initial HTML metadata for ${publicPaths.length} public routes and sitemap.`);
