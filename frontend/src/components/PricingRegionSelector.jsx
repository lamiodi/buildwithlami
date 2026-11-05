import { useId } from 'react';
import { usePricingRegion } from '../utils/currency.js';

export default function PricingRegionSelector() {
  const id = useId();
  const { currency, automatic, setRegion } = usePricingRegion();
  return (
    <div className="w-full sm:max-w-xs">
      <label htmlFor={id} className="mb-2 block text-xs font-bold text-gray-900 dark:text-white">Pricing region</label>
      <select id={id} value={automatic ? 'auto' : currency} onChange={event => setRegion(event.target.value)} aria-describedby={`${id}-note`} className="bwl-input min-h-12 text-base">
        <option value="auto">Automatic ({currency})</option>
        <option value="NGN">Nigeria — NGN</option>
        <option value="USD">International — USD</option>
      </select>
      <p id={`${id}-note`} className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">Regional prices, not currency conversions. You can change the detected region.</p>
    </div>
  );
}
