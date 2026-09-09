// ─── src/pages/PricingPage.jsx ───────────────────────────
// public /pricing page with location-aware currency support
// ──────────────────────────────────────────────────────────

import { useEffect } from 'react';
import Pricing from '../components/Pricing';

const PricingPage = () => {
    useEffect(() => {
        document.title = "Pricing — Buildwith_lami";
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute(
                'content',
                'Compare transparent starting prices for websites, e-commerce, custom software, ERP systems, AI automation, and ongoing Care from Buildwith_lami.'
            );
        }
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="pt-12">
            <Pricing />
        </div>
    );
};

export default PricingPage;
