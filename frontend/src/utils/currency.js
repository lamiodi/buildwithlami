import { useState, useEffect } from 'react';

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

export const useAutomatedCurrency = () => {
  const [currency, setCurrency] = useState(getInitialCurrency);

  useEffect(() => {
    let isMounted = true;

    const detectLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (!res.ok) throw new Error('ipapi failed');
        const data = await res.json();
        if (isMounted) {
          const detected = data.country_code === 'NG' ? 'NGN' : 'USD';
          setCurrency(detected);
          return;
        }
      } catch {
        try {
          const res2 = await fetch('https://ipwho.is/');
          if (res2.ok) {
            const data2 = await res2.json();
            if (isMounted) {
              const detected = data2.country_code === 'NG' ? 'NGN' : 'USD';
              setCurrency(detected);
            }
          }
        } catch {
          // Fallback retained
        }
      }
    };

    detectLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return currency;
};

/**
 * Shared naira formatter for admin surfaces. One implementation instead
 * of per-page copies (Dashboard, Reports, ClientProjects each carried
 * their own). Currency-aware pages (Invoices, Contracts) keep their
 * multi-currency Intl wrappers.
 */
export const formatNaira = (n) => `₦${Number(n || 0).toLocaleString()}`;
