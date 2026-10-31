import test from 'node:test';
import assert from 'node:assert/strict';
import { PROJECT_GOALS, getProjectGoal, getGoalPlan } from '../src/data/projectGoals.js';
import { inquiryContext, projectContactHref, whatsAppHref, serviceFromProjectType } from '../src/utils/inquiryContext.js';
import projects from '../src/data/fallbackProjects.js';

test('The three scoped goals point to real case studies, public starting budgets and the correct contact service', () => {
  for (const goal of PROJECT_GOALS.filter(item => item.planId)) {
    const plan = getGoalPlan(goal);
    assert.equal(plan.category, goal.id);
    assert.ok(plan.priceNGN > 0 && plan.priceUSD > 0 && plan.project);
    assert.equal(projects.find(project => project.slug === plan.project)?.project_status, 'Client Work');
    const link = new URL(projectContactHref(goal.id, 'NGN'), 'https://www.buildwithlami.com');
    const context = inquiryContext({pathname:link.pathname, search:link.search});
    assert.equal(context.service, goal.id);
    assert.equal(link.searchParams.get('currency'), 'NGN');
    assert.equal(serviceFromProjectType({websites:'Business Website', ecommerce:'E-Commerce Store', software:'Custom Software'}[goal.id]), goal.id);
  }
});

test('Not sure yet provides a useful enquiry without inventing a package or price', () => {
  const goal = getProjectGoal('unsure');
  assert.equal(getGoalPlan(goal), null);
  const context = inquiryContext({pathname:'/contact', search:'?service=unsure'});
  assert.equal(context.service, 'unsure');
  assert.match(context.message, /help choosing/);
  assert.equal(context.tier, null);
  assert.equal(getProjectGoal('constructor'), null);
});

test('Homepage selections and pricing category changes produce different WhatsApp briefs', () => {
  const home = inquiryContext({pathname:'/', search:'?service=ecommerce'});
  const pricing = inquiryContext({pathname:'/pricing', hash:'#maintenance'});
  assert.match(home.message, /online store/);
  assert.match(pricing.message, /technical care/);
  assert.notEqual(home.message, pricing.message);
  assert.equal(inquiryContext({pathname:'/pricing', hash:'#unknown'}).service, 'websites');
});

test('Project pages retain their project and service even when a query parameter conflicts', () => {
  const context = inquiryContext({pathname:'/projects/tiabrand-ecommerce', search:'?service=software'});
  assert.equal(context.service, 'ecommerce');
  assert.equal(context.project.slug, 'tiabrand-ecommerce');
  assert.match(context.message, /case study/);
  assert.match(context.message, /online store/);
});

test('Changing the contact service drops an incompatible old package', () => {
  const location = {pathname:'/contact', search:'?service=websites&tier=Growth'};
  assert.equal(inquiryContext(location).tier, 'Growth');
  const changed = inquiryContext(location, 'ecommerce');
  assert.equal(changed.service, 'ecommerce');
  assert.equal(changed.tier, null);
  assert.match(changed.message, /online store/);
  assert.equal(inquiryContext({pathname:'/contact',search:'?service=maintenance&tier=soft_enterprise'}).tier, null);
});

test('Outgoing links do not copy arbitrary URL text, private fields or a private route token', () => {
  for (const service of ['constructor', '__proto__', 'https://bad.example', 'unknown']) {
    const context = inquiryContext({pathname:'/', search:`?service=${encodeURIComponent(service)}&email=private@example.com&name=Private&budget=123456789`});
    assert.equal(context.service, null);
    assert.doesNotMatch(context.message, /bad\.example|private@example|Private|123456789|constructor|__proto__/);
  }
  const privatePage = inquiryContext({pathname:'/pay/private-token', search:'?service=ecommerce&email=private@example.com'});
  assert.equal(privatePage.service, null);
  assert.doesNotMatch(privatePage.message, /private-token|private@example/);
});

test('WhatsApp encodes the whole message as one text parameter and uses the configured destination', () => {
  const text = 'Hi Eugene, A&B? #scope + design';
  const link = new URL(whatsAppHref(text));
  assert.equal(link.origin, 'https://wa.me');
  assert.match(link.pathname, /^\/\d+$/);
  assert.equal(link.searchParams.get('text'), text);
  assert.deepEqual([...link.searchParams.keys()], ['text']);
  assert.equal(projectContactHref('__proto__', 'INVALID'), '/contact');
});
