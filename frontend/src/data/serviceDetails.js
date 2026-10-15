import { BUILD_PRICING, USD_TIER_PRICING } from '../config/pricing.js';

// Commercial details always come from the same configuration as the pricing page.
export const serviceDetails = {
  interfaces: { category: 'websites', project: 'sourceline-limited', projectTitle: 'Sourceline Limited website', decision: 'Choose a focused website for service information and enquiries. Choose a CMS package if your team needs to edit content regularly.' },
  ecommerce: { category: 'ecommerce', project: 'tiabrand-ecommerce', projectTitle: 'The TiaBrand storefront', decision: 'A small catalogue and a single payment gateway fit a focused store. Bundles, regional pricing and custom fulfilment need their own scope.' },
  'web-platforms': { category: 'software', project: 'vonnex2x-enterprise-erp', projectTitle: 'VonneX2X operations platform', decision: 'Start with the users, permissions and one complete business workflow. Additional roles, integrations and migration work affect the quote.' },
  'business-portals': { category: 'portals', project: 'vonnex2x-enterprise-erp', projectTitle: 'VonneX2X booking, POS and workforce workflows', decision: 'The final scope depends on the operating workflow: a gate-pass system, school portal and retail platform are different builds.' },
};

export const projectService = {
  'sourceline-limited': 'interfaces',
  'tiabrand-ecommerce': 'ecommerce',
  'wodibenuah-fair': 'web-platforms',
  'vonnex2x-enterprise-erp': 'business-portals',
  'eduflow-academic-erp': 'business-portals',
  'medios-hospital-os': 'web-platforms',
};

export function getServicePlan(id) {
  const detail = serviceDetails[id];
  if (!detail) return null;
  const category = BUILD_PRICING[detail.category];
  const tier = category.tiers[0];
  return { ...detail, tier, pricingNotes: category.pricingNotes, priceNGN: tier.priceNGN, priceUSD: USD_TIER_PRICING[tier.id]?.priceUSD };
}

export function regionalStartingPrices(plan) {
  return `Nigeria: ₦${plan.priceNGN.toLocaleString('en-NG')} · International: $${plan.priceUSD.toLocaleString('en-US')}`;
}
