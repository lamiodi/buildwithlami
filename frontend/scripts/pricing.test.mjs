import test from 'node:test';
import assert from 'node:assert/strict';
import { BUILD_PRICING, CARE_PLANS, USD_CARE_PRICING } from '../src/config/pricing.js';
import { getServicePlan, regionalStartingPrices, serviceDetails } from '../src/data/serviceDetails.js';

test('Tailored quote packages carry no numeric package rate in public data', () => {
  const custom = Object.values(BUILD_PRICING).flatMap(category => category.tiers).filter(tier => tier.priceFormatted === 'Custom Quote');
  assert.ok(custom.length > 0);
  for (const tier of custom) {
    assert.equal(Object.hasOwn(tier, 'priceNGN'), false, `${tier.id} leaks an NGN rate`);
    assert.equal(Object.hasOwn(tier, 'priceUSD'), false, `${tier.id} leaks a USD rate`);
  }
  for (const key of ['software', 'portals', 'ai']) {
    assert.ok(BUILD_PRICING[key].tiers.every(tier => tier.priceFormatted === 'Custom Quote'));
  }
});

test('Every build category and service retains a valid regional budget when tier rates are private', () => {
  for (const [key, category] of Object.entries(BUILD_PRICING)) {
    if (key === 'maintenance') continue;
    assert.ok(category.startingPriceNGN > 0, key);
    assert.ok(category.startingPriceUSD > 0, key);
    for (const tier of category.tiers.filter(tier => tier.priceFormatted !== 'Custom Quote')) {
      assert.equal(tier.priceNGN, category.startingPriceNGN);
      assert.equal(tier.priceUSD, category.startingPriceUSD);
    }
  }
  for (const id of Object.keys(serviceDetails)) {
    const plan = getServicePlan(id);
    assert.ok(plan.priceNGN > 0 && plan.priceUSD > 0, id);
    assert.doesNotMatch(regionalStartingPrices(plan), /undefined|NaN/);
  }
});

test('Annual care discounts never create negative savings in either region', () => {
  for (const tier of CARE_PLANS.filter(tier => tier.monthlyPriceNGN)) {
    const usd = USD_CARE_PRICING[tier.id];
    assert.ok(tier.annualPriceNGN > 0 && tier.annualPriceNGN <= 12 * tier.monthlyPriceNGN, tier.id);
    assert.ok(usd.annualPriceUSD > 0 && usd.annualPriceUSD <= 12 * usd.monthlyPriceUSD, tier.id);
  }
});
