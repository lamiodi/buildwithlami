import { useEffect, useSyncExternalStore } from 'react';
import { createPricingRegionStore, currencyForCountry } from './pricingRegion.js';

const REGION_KEY = 'bwl-pricing-region';

/**
 * Automatically detects the visitor's currency (NGN for Nigeria, USD elsewhere).
 * Uses timezone as an instant zero-latency default, then refines via geolocation in the background.
 */
export const getInitialCurrency = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      return tz === 'Africa/Lagos' ? 'NGN' : 'USD';
    }
  } catch (e) {
    console.warn("Timezone detection fallback hit", e);
  }
  return 'USD';
};

const readRegion = () => {
  try { return globalThis.localStorage?.getItem(REGION_KEY); } catch { return null; }
};

async function detectCurrency() {
  for (const url of ['https://ipapi.co/json/', 'https://ipwho.is/']) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (!response.ok) continue;
      const data = await response.json();
      if (data.success === false) continue;
      const currency = currencyForCountry(data.country_code);
      if (currency) return currency;
    } catch { /* Keep the timezone default if location lookup fails. */ }
  }
  return null;
}

const regionStore = createPricingRegionStore({
  initialCurrency: getInitialCurrency(),
  savedRegion: readRegion(),
  detect: detectCurrency,
  persist: value => {
    if (value) globalThis.localStorage?.setItem(REGION_KEY, value);
    else globalThis.localStorage?.removeItem(REGION_KEY);
  },
});

export function usePricingRegion() {
  const region = useSyncExternalStore(regionStore.subscribe, regionStore.getSnapshot, regionStore.getSnapshot);
  useEffect(() => {
    regionStore.start();
    const sync = event => {
      if (event.key === REGION_KEY || event.key === null) regionStore.syncRegion(event.newValue);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  return { ...region, setRegion: regionStore.setRegion };
}

export const useAutomatedCurrency = () => usePricingRegion().currency;

/**
 * Shared naira formatter for admin surfaces. One implementation instead
 * of per-page copies (Dashboard, Reports, ClientProjects each carried
 * their own). Currency-aware pages (Invoices, Contracts) keep their
 * multi-currency Intl wrappers.
 */
export const formatNaira = (n) => `₦${Number(n || 0).toLocaleString()}`;
