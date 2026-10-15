import projects from '../src/data/fallbackProjects.js';
import { FOUNDER, getSeo, pages } from '../src/seo.js';
import { CONTACT } from '../src/config/contact.js';
import { faqsByPath } from '../src/data/faqs.js';
import { divisionServices } from '../src/data/divisionServices.js';
import { guides, getGuide, guidePath } from '../src/data/guides.js';

const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const escMultiline = value => esc(value).replace(/\n/g, '<br />');
// Useful visible HTML before React starts, also available without JavaScript.
// It describes the same services, projects and FAQs as the interactive page,
// so the first (pre-render) crawl sees real content, not an empty shell.
export function renderSummary(path) {
  const seo = getSeo(path);
  const project = projects.find(p => path === `/projects/${p.slug}`);
  const guide = getGuide(path);
  const title = path === '/about' ? FOUNDER.name : guide?.title || project?.title || seo.title.split('|')[0].trim();
  const links = Object.entries(pages).filter(([url])=>url !== path).map(([url, data])=>`<a href="${url}">${esc(data[0].split('|')[0].trim())}</a>`).join(' · ');
  const projectList = ['/', '/projects', '/software', '/about'].includes(path) ? `<section><h2>Selected software projects</h2><ul>${projects.map(p=>`<li><a href="/projects/${p.slug}">${esc(p.title)}</a> — ${esc(p.tagline || p.summary)}</li>`).join('')}</ul></section>` : '';
  const founder = ['/', '/about', '/software'].includes(path) ? `<section><h2>About ${esc(FOUNDER.name)}</h2><p>${esc(FOUNDER.name)} is the founder of BuildWithLami and a full-stack software engineer based in Lagos, Nigeria. He builds websites, e-commerce stores, custom web applications and business management systems for founders and growing teams.</p><p><img src="/eugene-hero.webp" alt="Eugene Odibenuah, founder of BuildWithLami" width="800" height="1200" style="max-width:240px;height:auto" /></p><p><a href="/about">Meet the founder</a> · <a href="${esc(CONTACT.social.linkedin)}">LinkedIn</a></p></section>` : '';
  const projectType = project?.project_status ? `<p>Project type: ${esc(project.project_status)}</p>` : '';
  const features = project?.features?.length ? `<section><h2>Project capabilities</h2><ul>${project.features.map(f=>`<li>${esc(f)}</li>`).join('')}</ul></section>` : '';
  const contactDetails = path === '/contact' ? `<section><h2>Contact details</h2><p>Email: <a href="mailto:${esc(CONTACT.email)}">${esc(CONTACT.email)}</a><br />Phone / WhatsApp: ${esc(CONTACT.phoneDisplay)}<br />Based in ${esc(CONTACT.address)} — working with clients worldwide.</p><p>Include your project goals, timeline and budget range so the first reply can already scope a proposal.</p></section>` : '';
  const services = divisionServices[path] ? `<section><h2>Services</h2>${divisionServices[path].map(s=>`<section><h3>${esc(s.headline)}</h3><p>${esc(s.description)}</p><ul>${s.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></section>`).join('')}</section>` : '';
  const faq = faqsByPath[path]?.length ? `<section><h2>Frequently asked questions</h2>${faqsByPath[path].map(f=>`<h3>${esc(f.q)}</h3><p>${escMultiline(f.a)}</p>`).join('')}</section>` : '';
  const guideIndex = path === '/guides' ? `<section><h2>Project and development guides by Eugene Odibenuah</h2><ul>${guides.map(g => `<li><article><h3><a href="${esc(guidePath(g))}">${esc(g.title)}</a></h3><p>${esc(g.description)}</p></article></li>`).join('')}</ul></section>` : '';
  const guideArticle = guide ? `<article><p>By <strong>Eugene Odibenuah</strong> · Founder of BuildWithLami</p><p>${esc(guide.intro)}</p>${guide.sections.map(s => `<section><h2>${esc(s.title)}</h2>${s.paragraphs ? s.paragraphs.map(p => `<p>${esc(p)}</p>`).join('') : ''}${s.items ? `<ul>${s.items.map(it => `<li>${esc(it)}</li>`).join('')}</ul>` : ''}</section>`).join('')}</article>` : '';
  return `<main id="initial-page" style="max-width:72rem;margin:0 auto;padding:3rem 1.5rem;font-family:Arial,sans-serif;line-height:1.7"><a href="/">BuildWithLami</a><h1>${esc(title)}</h1><p>${esc(seo.description)}</p>${founder}${guideIndex}${guideArticle}${projectType}${features}${projectList}${services}${faq}${contactDetails}<section><h2>Discuss your project</h2><p>Share your goals and requirements to discuss the scope and a proposal.</p><p><a href="/contact">Send a project enquiry</a> · <a href="mailto:${esc(CONTACT.email)}">${esc(CONTACT.email)}</a></p></section><nav aria-label="Site pages">${links}</nav></main>`;
}
