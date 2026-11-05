import test from 'node:test';
import assert from 'node:assert/strict';
import { createPricingRegionStore, currencyForCountry } from '../src/utils/pricingRegion.js';

test('Multiple budget subscribers share one automatic location lookup', async () => {
  let calls = 0;
  const store = createPricingRegionStore({initialCurrency:'NGN', detect:async () => { calls++; return 'USD'; }});
  const observed = [[], []];
  const unsubscribes = observed.map(values => store.subscribe(() => values.push(store.getSnapshot().currency)));
  await Promise.all([store.start(), store.start(), store.start()]);
  assert.equal(calls, 1);
  assert.deepEqual(observed, [['USD'], ['USD']]);
  unsubscribes.forEach(unsubscribe => unsubscribe());
  store.setRegion('NGN');
  assert.deepEqual(observed, [['USD'], ['USD']]);
});

test('A deliberate region choice wins over a late automatic result', async () => {
  let finish;
  const saved = [];
  const store = createPricingRegionStore({initialCurrency:'NGN', detect:() => new Promise(resolve => { finish = resolve; }), persist:value => saved.push(value)});
  const pending = store.start();
  await Promise.resolve();
  store.setRegion('NGN');
  finish('USD');
  await pending;
  assert.deepEqual(store.getSnapshot(), {currency:'NGN', automatic:false});
  assert.deepEqual(saved, ['NGN']);
  store.setRegion('auto');
  assert.deepEqual(store.getSnapshot(), {currency:'USD', automatic:true});
  assert.deepEqual(saved, ['NGN', null]);
});

test('Saved choices skip location lookup until the visitor returns to automatic', async () => {
  let calls = 0;
  const store = createPricingRegionStore({initialCurrency:'USD', savedRegion:'NGN', detect:async () => { calls++; return 'USD'; }});
  await store.start();
  assert.equal(calls, 0);
  assert.equal(store.getSnapshot().currency, 'NGN');
  store.setRegion('auto');
  await store.start();
  assert.equal(calls, 1);
  assert.deepEqual(store.getSnapshot(), {currency:'USD', automatic:true});
});

test('Storage failure and location failure leave prices usable', async () => {
  const store = createPricingRegionStore({initialCurrency:'NGN', detect:async () => { throw Error('Offline'); }, persist:() => { throw Error('Storage blocked'); }});
  await store.start();
  assert.equal(store.getSnapshot().currency, 'NGN');
  assert.doesNotThrow(() => store.setRegion('USD'));
  assert.deepEqual(store.getSnapshot(), {currency:'USD', automatic:false});
});

test('Other tabs can change or clear the choice without echoing persistence writes', async () => {
  let writes = 0;
  const store = createPricingRegionStore({initialCurrency:'NGN', persist:() => writes++});
  store.syncRegion('USD');
  assert.deepEqual(store.getSnapshot(), {currency:'USD', automatic:false});
  store.syncRegion(null);
  assert.deepEqual(store.getSnapshot(), {currency:'NGN', automatic:true});
  store.setRegion('invalid');
  assert.equal(writes, 0);
  assert.equal(currencyForCountry('NG'), 'NGN');
  assert.equal(currencyForCountry('US'), 'USD');
  assert.equal(currencyForCountry(undefined), null);
  assert.equal(currencyForCountry(''), null);
  assert.equal(currencyForCountry('__proto__'), null);
});
