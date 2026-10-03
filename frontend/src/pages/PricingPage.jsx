// ─── src/pages/PricingPage.jsx ───────────────────────────
// public /pricing page with location-aware currency support
// ──────────────────────────────────────────────────────────

import { useEffect } from 'react';
import Pricing from '../components/Pricing';

const PricingPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="pt-12">
            <Pricing />
        </div>
    );
};

export default PricingPage;
