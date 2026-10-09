import projects from '../src/data/fallbackProjects.js';
import { FOUNDER, getSeo, pages } from '../src/seo.js';
import { CONTACT } from '../src/config/contact.js';
import { faqsByPath } from '../src/data/faqs.js';
import { divisionServices } from '../src/data/divisionServices.js';

const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const escMultiline = value => esc(value).replace(/\n/g, '<br />');
// Useful visible HTML before React starts, also available without JavaScript.
// It describes the same services, projects and FAQs as the interactive page,
// so the first (pre-render) crawl sees real content, not an empty shell.
export function renderSummary(path) {
  const seo = getSeo(path);
  const project = projects.find(p => path === `/projects/${p.slug}`);
  const title = path === '/about' ? FOUNDER.name : project?.title || seo.title.split('|')[0].trim();
  const links = Object.entries(pages).filter(([url])=>url !== path).map(([url, data])=>`<a href="${url}">${esc(data[0].split('|')[0].trim())}</a>`).join(' · ');
  const projectList = ['/', '/projects', '/software', '/about'].includes(path) ? `<section><h2>Selected software projects</h2><ul>${projects.map(p=>`<li><a href="/projects/${p.slug}">${esc(p.title)}</a> — ${esc(p.tagline || p.summary)}</li>`).join('')}</ul></section>` : '';
  const founder = ['/', '/about', '/software'].includes(path) ? `<section><h2>About ${esc(FOUNDER.name)}</h2><p>${esc(FOUNDER.name)} is the founder of BuildWithLami and a full-stack software engineer based in Lagos, Nigeria. He builds websites, e-commerce stores, custom web applications and business management systems for founders and growing teams.</p><p><a href="/about">Meet the founder</a> · <a href="${esc(CONTACT.social.linkedin)}">LinkedIn</a> · <a href="${esc(CONTACT.social.github)}">GitHub</a></p></section>` : '';
  const features = project?.features?.length ? `<section><h2>Project capabilities</h2><ul>${project.features.map(f=>`<li>${esc(f)}</li>`).join('')}</ul></section>` : '';
  const contactDetails = path === '/contact' ? `<section><h2>Contact details</h2><p>Email: <a href="mailto:${esc(CONTACT.email)}">${esc(CONTACT.email)}</a><br />Phone / WhatsApp: ${esc(CONTACT.phoneDisplay)}<br />Based in ${esc(CONTACT.address)} — working with clients worldwide.</p><p>Include your project goals, timeline and budget range so the first reply can already scope a proposal.</p></section>` : '';
  const services = divisionServices[path] ? `<section><h2>Services</h2>${divisionServices[path].map(s=>`<section><h3>${esc(s.headline)}</h3><p>${esc(s.description)}</p><ul>${s.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></section>`).join('')}</section>` : '';
  const faq = faqsByPath[path]?.length ? `<section><h2>Frequently asked questions</h2>${faqsByPath[path].map(f=>`<h3>${esc(f.q)}</h3><p>${escMultiline(f.a)}</p>`).join('')}</section>` : '';
  return `<main id="initial-page" style="max-width:72rem;margin:0 auto;padding:3rem 1.5rem;font-family:Arial,sans-serif;line-height:1.7"><a href="/">BuildWithLami</a><h1>${esc(title)}</h1><p>${esc(seo.description)}</p>${founder}${features}${projectList}${services}${faq}${contactDetails}<section><h2>Discuss your project</h2><p>Share your goals and requirements to discuss the scope and a proposal.</p><p><a href="/contact">Send a project enquiry</a> · <a href="mailto:${esc(CONTACT.email)}">${esc(CONTACT.email)}</a></p></section><nav aria-label="Site pages">${links}</nav></main>`;
}
