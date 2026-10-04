import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getSeo, renderSeo } from '../src/seo.js';
import projects from '../src/data/fallbackProjects.js';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const errorHtml = (status, message) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>${status} | BuildWithLami</title></head><body><main><h1>${message}</h1><p><a href="/projects">View projects</a> · <a href="/contact">Contact us</a></p></main></body></html>`;

export function createProjectHandler({ fetchImpl = fetch, readShell = () => readFile(resolve(process.cwd(), 'dist/app.html'), 'utf8') } = {}) {
  return async (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    const fail = (status, message) => { res.setHeader('X-Robots-Tag', 'noindex, nofollow'); return res.status(status).send(errorHtml(status, message)); };
    if (!['GET','HEAD'].includes(req.method)) { res.setHeader('Allow','GET, HEAD'); return fail(405,'Method not allowed'); }
    const { id, division } = req.query || {};
    if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,160}$/.test(id) || !['SOFTWARE','SURVEY','DRONE'].includes(division)) return fail(404,'Project not found');
    const local = division === 'SOFTWARE' && projects.find(p => p.slug === id || String(p.id) === id);
    if (local) { res.setHeader('Location', `/projects/${local.slug}`); return res.status(308).end(); }
    const prefix = division === 'SOFTWARE' ? '' : `/${division.toLowerCase()}`;
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    try {
      const upstream = await fetchImpl(`https://buildwithlami-jb12.onrender.com/api/projects/${uuid ? '' : 'slug/'}${encodeURIComponent(id)}`, { signal: AbortSignal.timeout(10000) });
      if (upstream.status === 404 || upstream.status === 400) return fail(404,'Project not found');
      if (!upstream.ok) throw new Error('Project service unavailable');
      const body = await upstream.json();
      const project = body?.data || body;
      const actualDivision = String(project?.division || '').toUpperCase();
      const matchesDivision = actualDivision === division || (division === 'SOFTWARE' && ['TECHNOLOGY','TECH'].includes(actualDivision));
      if (!project?.title || project.status !== 'PUBLISHED' || !matchesDivision) return fail(404,'Project not found');
      const path = `${prefix}/projects/${id}`;
      const seo = getSeo(path, { project });
      const shell = await readShell();
      const summary = `<main id="initial-page"><h1>${escape(project.title)}</h1><p>${escape(seo.description)}</p><a href="${prefix || '/projects'}">View projects</a><a href="/contact">Discuss your project</a></main>`;
      const html = shell.replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, `<!-- SEO:START -->${renderSeo(seo)}<!-- SEO:END -->`).replace('<div id="root"></div>', `<div id="root">${summary}</div>`);
      return res.status(200).send(html);
    } catch {
      // An upstream outage is temporary, not evidence that a published page was deleted.
      res.setHeader('Retry-After','60');
      return fail(503,'Project temporarily unavailable. Please try again shortly.');
    }
  };
}
export default createProjectHandler();
