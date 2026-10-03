import projects from '../src/data/fallbackProjects.js';
import { FOUNDER, getSeo, pages } from '../src/seo.js';
import { CONTACT } from '../src/config/contact.js';

const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
// Useful visible HTML before React starts, also available without JavaScript.
// It describes the same services and projects as the interactive page.
export function renderSummary(path) {
  const seo = getSeo(path);
  const project = projects.find(p => path === `/projects/${p.slug}`);
  const title = path === '/about' ? FOUNDER.name : project?.title || seo.title.split('|')[0].trim();
  const links = Object.entries(pages).filter(([url])=>url !== path).map(([url, data])=>`<a href="${url}">${esc(data[0].split('|')[0].trim())}</a>`).join(' · ');
  const projectList = ['/', '/projects', '/software', '/about'].includes(path) ? `<section><h2>Selected software projects</h2><ul>${projects.map(p=>`<li><a href="/projects/${p.slug}">${esc(p.title)}</a> — ${esc(p.tagline || p.summary)}</li>`).join('')}</ul></section>` : '';
  const founder = ['/', '/about', '/software'].includes(path) ? `<section><h2>About ${esc(FOUNDER.name)}</h2><p>${esc(FOUNDER.name)} is the founder of BuildWithLami and a full-stack software engineer based in Lagos, Nigeria. He builds websites, e-commerce stores, custom web applications and business management systems for founders and growing teams.</p><p><a href="/about">Meet the founder</a> · <a href="${esc(CONTACT.social.linkedin)}">LinkedIn</a> · <a href="${esc(CONTACT.social.github)}">GitHub</a></p></section>` : '';
  const features = project?.features?.length ? `<section><h2>Project capabilities</h2><ul>${project.features.map(f=>`<li>${esc(f)}</li>`).join('')}</ul></section>` : '';
  return `<main id="initial-page" style="max-width:72rem;margin:0 auto;padding:3rem 1.5rem;font-family:Arial,sans-serif;line-height:1.7"><a href="/">BuildWithLami</a><h1>${esc(title)}</h1><p>${esc(seo.description)}</p>${founder}${features}${projectList}<section><h2>Discuss your project</h2><p>Share your goals and requirements to discuss the scope and a proposal.</p><p><a href="/contact">Send a project enquiry</a> · <a href="mailto:${esc(CONTACT.email)}">${esc(CONTACT.email)}</a></p></section><nav aria-label="Site pages">${links}</nav></main>`;
}
