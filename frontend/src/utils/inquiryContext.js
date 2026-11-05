import { BUILD_PRICING } from '../config/pricing.js';
import { CONTACT } from '../config/contact.js';
import projects from '../data/fallbackProjects.js';
import { projectService, serviceDetails } from '../data/serviceDetails.js';

export const SERVICE_TYPES = {
  websites: 'Business Website', ecommerce: 'E-Commerce Store', software: 'Custom Software',
  portals: 'Business Management System & ERP', uiux: 'UI/UX Design', branding: 'Branding',
  seo: 'SEO & Growth', marketing: 'Marketing', ai: 'AI & Automations',
  maintenance: 'Maintenance', unsure: 'Not sure yet'
};

const TOPICS = {
  websites: ['a business website', 'Business website', 'Share your services, audience and the action you want visitors to take. I’ll help shape the right website scope.'],
  ecommerce: ['an online store', 'Online store', 'Tell me what you sell and how you handle payments and delivery. I’ll help scope a store around that workflow.'],
  software: ['custom business software', 'Business software', 'Tell me which workflow needs improving, who uses it and what is difficult today. I’ll help define the starting scope.'],
  portals: ['a business portal or ERP', 'Business portal / ERP', 'Tell me about your users, roles and day-to-day operations. I’ll help identify the workflows the system should support.'],
  uiux: ['UI/UX design', 'UI/UX design', 'Share the product, its users and the screens or journey you want to improve.'],
  branding: ['branding for my business', 'Branding', 'Tell me about your business, your audience and the brand materials you need.'],
  seo: ['technical SEO for my website', 'SEO & growth', 'Share your website and the search or performance issues you want to address.'],
  marketing: ['a marketing project', 'Marketing', 'Tell me about your offer, audience and campaign goals so we can discuss the scope.'],
  ai: ['AI or workflow automation', 'AI & automation', 'Share the repetitive task, the tools involved and what you want the automation to achieve.'],
  maintenance: ['technical care for my website', 'Website care', 'Tell me about your existing site and the help you need. I’ll clarify the care scope and separate provider running costs.'],
  unsure: ['the right starting point for my business', 'Help choosing a service', 'You don’t need to know which service to choose. Tell me the problem you want to solve and I’ll help you work through the options.']
};

export function validService(id) {
  return typeof id === 'string' && Object.hasOwn(SERVICE_TYPES, id) ? id : null;
}

export function serviceFromProjectType(type) {
  return Object.keys(SERVICE_TYPES).find(id => SERVICE_TYPES[id] === type) || null;
}

export function resolveServiceTier(service, tier) {
  if (!validService(service) || !tier) return null;
  return BUILD_PRICING[service]?.tiers.find(item => item.id === tier || item.name === tier)?.name || null;
}

export function inquiryContext({ pathname = '/', search = '', hash = '' } = {}, selectedService) {
  pathname = pathname.replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(search);
  // Only curated public project names enter outgoing messages. Private routes,
  // arbitrary URL text, budgets, names and email addresses are never copied.
  const project = projects.find(item => pathname === `/projects/${item.slug}`);
  const projectCategory = project && serviceDetails[projectService[project.slug]]?.category;
  const explicitService = validService(params.get('service'));
  const chosenService = validService(selectedService);
  const service = projectCategory || chosenService ||
    (pathname === '/pricing' ? validService(hash.slice(1)) || 'websites' : null) ||
    (['/', '/contact', '/software', '/services'].includes(pathname) ? explicitService : null);
  const tierMatchesSelection = !chosenService || chosenService === explicitService;
  const tier = (pathname === '/pricing' || (pathname === '/contact' && tierMatchesSelection)) ? resolveServiceTier(service, params.get('tier')) : null;
  const topic = service ? TOPICS[service] : null;
  const intro = project ? `I’ve been looking at the ${project.title} case study. ` : '';
  const request = tier
    ? `I’d like to discuss ${tier}${service === 'maintenance' ? ' for my website' : ` for ${topic[0]}`}.`
    : service === 'unsure'
      ? 'I’d like help choosing what to build for my business. Can we discuss the goal and suitable options?'
      : `I’d like to discuss ${topic?.[0] || 'a project with BuildWithLami'}.`;
  return {
    service, tier, project: project ? {title:project.title, slug:project.slug} : null,
    label: tier ? `${topic[1]} · ${tier}` : project?.title || topic?.[1] || 'Your project',
    guidance: topic?.[2] || 'Hi, I’m Eugene. Tell me what you want to achieve and I’ll help you work out the scope and a useful next step.',
    message: `Hi Eugene, ${intro}${request}`
  };
}

export function whatsAppHref(message) {
  return `https://wa.me/${CONTACT.phoneE164}?text=${encodeURIComponent(message)}`;
}

export function reconcileInquiryMessage(current, previousGenerated, nextGenerated) {
  return !current || current === previousGenerated ? nextGenerated : current;
}

export function projectContactHref(service, currency) {
  const params = new URLSearchParams();
  if (validService(service)) params.set('service', service);
  if (['NGN', 'USD'].includes(currency)) params.set('currency', currency);
  return `/contact${params.size ? `?${params}` : ''}`;
}
