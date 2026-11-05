export const validPricingRegion = value => ['NGN', 'USD'].includes(value) ? value : null;

export function currencyForCountry(country) {
  if (typeof country !== 'string' || !/^[A-Z]{2}$/.test(country)) return null;
  return country === 'NG' ? 'NGN' : 'USD';
}

// A late location result must never overwrite the visitor's region choice.
export function createPricingRegionStore({ initialCurrency = 'USD', savedRegion, detect, persist = () => {} } = {}) {
  let automaticCurrency = validPricingRegion(initialCurrency) || 'USD';
  let override = validPricingRegion(savedRegion);
  let snapshot = { currency: override || automaticCurrency, automatic: !override };
  let pending;
  const listeners = new Set();
  const publish = () => {
    const next = { currency: override || automaticCurrency, automatic: !override };
    if (next.currency === snapshot.currency && next.automatic === snapshot.automatic) return;
    snapshot = next;
    listeners.forEach(listener => listener());
  };
  const start = () => {
    if (override || pending || !detect) return pending;
    pending = Promise.resolve().then(detect).then(value => {
      automaticCurrency = validPricingRegion(value) || automaticCurrency;
      publish();
    }).catch(() => {});
    return pending;
  };
  const select = (value, save) => {
    if (value !== 'auto' && !validPricingRegion(value)) return;
    override = validPricingRegion(value);
    if (save) {
      try { persist(override); } catch { /* The choice still works in memory. */ }
    }
    publish();
    if (!override) start();
  };
  return {
    getSnapshot: () => snapshot,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener); },
    start,
    setRegion: value => select(value, true),
    syncRegion: value => select(value || 'auto', false),
  };
}
