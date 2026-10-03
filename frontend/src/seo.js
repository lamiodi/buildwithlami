import projects from './data/fallbackProjects.js';
import { CONTACT } from './config/contact.js';

export const FOUNDER = { name: 'Eugene Odibenuah', givenName: 'Eugene', familyName: 'Odibenuah', alternateName: ['Odibenuah Eugene'] };

export const SITE_URL = 'https://www.buildwithlami.com';
export const pages = {
  '/': ['Web Development & Custom Software in Lagos | BuildWithLami', 'Eugene Odibenuah leads BuildWithLami in Lagos, Nigeria, building business websites, online stores and custom software for founders and growing teams worldwide.'],
  '/software': ['Software Engineering & SaaS Development | BuildWithLami', 'Custom web platforms, secure APIs, SaaS products and business systems designed and engineered by Eugene Odibenuah at BuildWithLami.'],
  '/services': ['Web Design, Software & Technical SEO Services | BuildWithLami', 'Explore website development, e-commerce, custom software, API engineering, technical audits and SEO services. Discuss the right scope for your business.'],
  '/projects': ['Software Projects & Case Studies | BuildWithLami', 'Explore BuildWithLami projects: e-commerce websites, business management systems, event platforms and custom applications, with design and engineering case studies.'],
  '/pricing': ['Website & Software Development Pricing | BuildWithLami', 'Compare starting prices and scopes for websites, e-commerce, custom software and business systems. Clear deliverables and milestone billing from BuildWithLami.'],
  '/about': ['About Eugene Odibenuah, Software Engineer | BuildWithLami', 'Meet Eugene Odibenuah, founder of BuildWithLami and a full-stack software engineer based in Lagos, Nigeria. Explore his approach, experience and capabilities.'],
  '/contact': ['Discuss Your Website or Software Project | BuildWithLami', 'Tell BuildWithLami about your website, online store or custom software project. Contact Eugene Odibenuah in Lagos to discuss your goals, scope and proposal.'],
  '/survey': ['Land & Engineering Survey Services in Nigeria | GeoSurvey', 'GeoSurvey by BuildWithLami provides boundary surveys, topographic mapping, construction setting out and estate subdivision services in Nigeria. Request a quote.'],
  '/drone': ['Drone Photography & Aerial Imaging in Nigeria | Lami Aerial', 'Explore Lami Aerial drone photography, property videos, site documentation and aerial mapping services in Nigeria. Discuss your location and request a flight quote.'],
};
export const publicPaths = [...Object.keys(pages), ...projects.map(p => `/projects/${p.slug}`)];
export const normalizePath = path => path.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
export const isProjectPath = path => /^\/(?:survey\/|drone\/)?projects\/[^/]+$/.test(normalizePath(path));
const clean = value => String(value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const absoluteImage = value => {
  try {
    const url = new URL(value || '/images/social/studio.png', SITE_URL);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : `${SITE_URL}/images/social/studio.png`;
  } catch { return `${SITE_URL}/images/social/studio.png`; }
};

export function getSeo(pathname, options = {}) {
  const path = normalizePath(pathname);
  const fallback = path.startsWith('/projects/') && projects.find(p => p.slug === path.split('/').pop() || String(p.id) === path.split('/').pop());
  const project = options.project === undefined ? fallback : options.project;
  const known = pages[path];
  const pendingProject = isProjectPath(path) && options.loading;
  const indexable = Boolean(known || project?.title || pendingProject) && !options.missing;
  const canonicalPath = project?.slug && path.startsWith('/projects/') ? `/projects/${encodeURIComponent(project.slug)}` : path;
  const canonical = indexable ? `${SITE_URL}${canonicalPath}` : null;
  const title = project?.title ? `${clean(project.title)} | BuildWithLami Case Study` : known?.[0] || (pendingProject ? 'Project Case Study | BuildWithLami' : 'Page unavailable | BuildWithLami');
  const description = project?.title ? clean(project.summary || project.tagline || `Explore ${project.title}, a project by BuildWithLami.`).slice(0, 180) : known?.[1] || 'BuildWithLami software, survey and drone services.';
  const image = absoluteImage(project?.image_url || project?.image || `/images/social/${path === '/survey' ? 'survey' : path === '/drone' ? 'drone' : 'studio'}.png`);
  const organization = {
    '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'BuildWithLami', url: SITE_URL,
    logo: `${SITE_URL}/2.png`, email: CONTACT.email, telephone: `+${CONTACT.phoneE164}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Lagos', addressCountry: 'NG' },
    founder: { '@id': `${SITE_URL}/about#eugene` },
    sameAs: [CONTACT.social.twitter],
  };
  const person = { '@type': 'Person', '@id': `${SITE_URL}/about#eugene`, ...FOUNDER, jobTitle: 'Full-stack Software Engineer', url: `${SITE_URL}/about`, image: `${SITE_URL}/eugene-hero.webp`, worksFor: { '@id': organization['@id'] }, sameAs: [CONTACT.social.linkedin, CONTACT.social.github], knowsAbout: ['Web development', 'E-commerce development', 'Custom software', 'API engineering'] };
  const graph = indexable ? [organization, person, {
    '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: 'BuildWithLami', url: SITE_URL,
    publisher: { '@id': organization['@id'] }, inLanguage: 'en',
  }, {
    '@type': path === '/about' ? 'AboutPage' : path === '/contact' ? 'ContactPage' : 'WebPage',
    '@id': `${canonical}#webpage`, url: canonical, name: title, description,
    isPartOf: { '@id': `${SITE_URL}/#website` }, inLanguage: 'en',
    ...(path === '/about' ? { mainEntity: { '@id': person['@id'] } } : {}),
  }] : [];
  if (indexable && path !== '/') {
    const crumbs = [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` }];
    if (isProjectPath(path)) {
      const parent = path.startsWith('/survey/') ? '/survey' : path.startsWith('/drone/') ? '/drone' : '/projects';
      crumbs.push({ '@type': 'ListItem', position: 2, name: parent === '/projects' ? 'Projects' : parent.slice(1), item: `${SITE_URL}${parent}` });
    }
    crumbs.push({ '@type': 'ListItem', position: crumbs.length + 1, name: clean(project?.title || title.split('|')[0]), item: canonical });
    graph.push({ '@type': 'BreadcrumbList', itemListElement: crumbs });
  }
  if (['/software', '/survey', '/drone'].includes(path)) graph.push({ '@type': 'Service', name: title.split('|')[0].trim(), description, url: canonical, provider: { '@id': organization['@id'] } });
  if (project?.title && indexable) graph.push({ '@type': 'CreativeWork', name: clean(project.title), description, url: canonical, image, creator: { '@id': organization['@id'] } });
  return { title, description, canonical, image, imageAlt: project?.title ? `${clean(project.title)} project preview` : `${path === '/survey' ? 'GeoSurvey' : path === '/drone' ? 'Lami Aerial' : 'BuildWithLami'} services`, robots: indexable ? 'index, follow, max-image-preview:large' : 'noindex, nofollow', structuredData: { '@context': 'https://schema.org', '@graph': graph } };
}

export function applySeo(seo) {
  document.title = seo.title;
  const meta = (key, value, property = false) => {
    const attr = property ? 'property' : 'name';
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.append(el); }
    el.setAttribute('content', value);
  };
  meta('description', seo.description); meta('robots', seo.robots);
  for (const [key, value] of Object.entries({ type: 'website', title: seo.title, description: seo.description, url: seo.canonical || SITE_URL, site_name: 'BuildWithLami', image: seo.image, 'image:alt': seo.imageAlt, locale: 'en_NG' })) meta(`og:${key}`, value, true);
  for (const [key, value] of Object.entries({ card: 'summary_large_image', title: seo.title, description: seo.description, image: seo.image, 'image:alt': seo.imageAlt })) meta(`twitter:${key}`, value);
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (seo.canonical) {
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
    canonical.href = seo.canonical;
  } else canonical?.remove();
  let schema = document.getElementById('site-schema');
  if (!schema) { schema = document.createElement('script'); schema.id = 'site-schema'; schema.type = 'application/ld+json'; document.head.append(schema); }
  schema.textContent = JSON.stringify(seo.structuredData).replace(/</g, '\\u003c');
}

const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export function renderSeo(seo) {
  const meta = (name, value, property = false) => `<meta ${property ? 'property' : 'name'}="${name}" content="${escapeHtml(value)}" />`;
  return [
    `<title>${escapeHtml(seo.title)}</title>`, meta('description', seo.description), meta('robots', seo.robots),
    ...Object.entries({ type: 'website', title: seo.title, description: seo.description, url: seo.canonical || SITE_URL, site_name: 'BuildWithLami', image: seo.image, 'image:alt': seo.imageAlt, locale: 'en_NG' }).map(([key, value]) => meta(`og:${key}`, value, true)),
    ...Object.entries({ card: 'summary_large_image', title: seo.title, description: seo.description, image: seo.image, 'image:alt': seo.imageAlt }).map(([key, value]) => meta(`twitter:${key}`, value)),
    seo.canonical ? `<link rel="canonical" href="${escapeHtml(seo.canonical)}" />` : '',
    `<script id="site-schema" type="application/ld+json">${JSON.stringify(seo.structuredData).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ');
}
