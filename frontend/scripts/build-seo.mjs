import { renderSummary } from './static-summary.js';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getSeo, renderSeo, publicPaths, SITE_URL } from '../src/seo.js';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, process.argv[2] || 'dist');
const template = await readFile(resolve(output, 'index.html'), 'utf8');
const replaceHead = (html, seo) => html.replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, `<!-- SEO:START -->\n${renderSeo(seo)}\n<!-- SEO:END -->`);
await writeFile(resolve(output, 'app.html'), replaceHead(template, getSeo('/login')));
if (!template.includes('<!-- SEO:START -->')) throw new Error('SEO markers missing');
for (const path of publicPaths) {
  const target = resolve(output, path === '/' ? 'index.html' : `seo${path}.html`);
  await mkdir(resolve(target, '..'), { recursive: true });
  await writeFile(target, replaceHead(template, getSeo(path)).replace('<div id="root"></div>', `<div id="root">${renderSummary(path)}</div>`));
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPaths.map(path => `  <url><loc>${SITE_URL}${path}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(resolve(output, 'sitemap.xml'), sitemap);
await writeFile(resolve(root, 'public/sitemap.xml'), sitemap);
console.log(`SEO: generated initial HTML metadata for ${publicPaths.length} public routes and sitemap.`);
