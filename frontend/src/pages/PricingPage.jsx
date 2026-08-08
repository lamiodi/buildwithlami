// ─── src/pages/PricingPage.jsx ───────────────────────────
// public /pricing page with location-aware currency support
// ──────────────────────────────────────────────────────────

import React, { useEffect } from 'react';
import Pricing from '../components/Pricing';

const PricingPage = () => {
    useEffect(() => {
        document.title = "Pricing — BuildWithLami";
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="pt-12">
            <Pricing />
        </div>
    );
};

export default PricingPage;
