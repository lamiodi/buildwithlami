import { useState, useEffect } from 'react';

/**
 * Automatically detects the visitor's currency (NGN for Nigeria/Africa, USD for International).
 * Uses timezone as an instant zero-latency default, then refines via geolocation in the background.
 */
export const getInitialCurrency = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      if (!tz.startsWith('Africa/')) {
        return 'USD';
      }
      return 'NGN';
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
          const isOutsideAfrica = data.continent_code ? data.continent_code !== 'AF' : data.country_code !== 'NG';
          const detected = isOutsideAfrica ? 'USD' : 'NGN';
          setCurrency(detected);
          return;
        }
      } catch {
        try {
          const res2 = await fetch('https://ipwho.is/');
          if (res2.ok) {
            const data2 = await res2.json();
            if (isMounted) {
              const isOutsideAfrica = data2.continent_code ? data2.continent_code !== 'AF' : data2.country_code !== 'NG';
              const detected = isOutsideAfrica ? 'USD' : 'NGN';
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
