import React, { useState } from 'react';
import CheckIcon from './CheckIcon';

const Pricing = () => {
  // Synchronous initial check to prevent flicker on first render
  const getInitialCurrency = () => {
    const saved = localStorage.getItem('preferred_currency');
    if (saved) return saved;
    
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return tz === 'Africa/Lagos' ? 'NGN' : 'USD';
    } catch (e) {
      return 'NGN';
    }
  };

  const [currency, setCurrency] = useState(getInitialCurrency());

  // Refine location detection and handle persistence
  React.useEffect(() => {
    localStorage.setItem('preferred_currency', currency);
    
    // Background IP verification (only run if no manual preference saved)
    if (!localStorage.getItem('currency_manually_set')) {
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          if (data.country_code) {
            const detected = data.country_code === 'NG' ? 'NGN' : 'USD';
            if (detected !== currency) {
              setCurrency(detected);
            }
          }
        })
        .catch(() => console.log("Geoloc refined fallback skipped."));
    }
  }, [currency]);

  const handleCurrencyToggle = () => {
    localStorage.setItem('currency_manually_set', 'true');
    setCurrency(prev => prev === 'NGN' ? 'USD' : 'NGN');
  };

  const pricingData = {
    NGN: {
      symbol: "₦",
      suffix: "/base",
      maintenance: "110,000",
      tiers: [
        { price: "350k" },
        { price: "1.2M" },
        { price: "500k - 1.2M" },
        { price: "Custom" }
      ]
    },
    USD: {
      symbol: "$",
      suffix: "/start",
      maintenance: "450",
      tiers: [
        { price: "1,200" }, // Intl Avg $1,500 - 10%
        { price: "2,700" }, // Intl Avg $3,000 - 10%
        { price: "4,500" }, // Intl Avg $5,000 - 10%
        { price: "25,000" } // Intl Avg $28,000 - 10%
      ]
    }
  };

  const tiers = [
    {
      name: "Portfolio / Landing",
      price: pricingData[currency].tiers[0].price,
      desc: "Perfect for personal brands and startups needing a high-impact online presence.",
      features: [
        "Custom Minimalist Design",
        "Mobile-First Optimization",
        "Basic SEO Setup",
        "Contact Form Integration"
      ]
    },
    {
      name: "Business Corporate",
      price: pricingData[currency].tiers[1].price,
      desc: "For established businesses looking to professionalize their digital operations.",
      features: [
        "Up to 10 Custom Pages",
        "CMS for Content Management",
        "Advanced SEO & Analytics",
        "Priority Email Support"
      ],
      popular: true
    },
    {
      name: "E-commerce Elite",
      price: pricingData[currency].tiers[2].price,
      desc: "Scalable online stores built to convert visitors into loyal customers. *Pricing depends on user count.*",
      features: [
        "Full Product Management",
        "Payment Gateway Integration",
        "Order & User Management",
        "Inventory Notifications"
      ]
    },
    {
      name: "Custom Enterprise",
      price: pricingData[currency].tiers[3].price,
      desc: "Complex ERP and Inventory systems tailored specifically to your business logic. *Pricing depends on user count.*",
      features: [
        "Full ERP & Inventory Logic",
        "Role-Based Access Control",
        "Custom Business Reports",
        "System-Wide Automation"
      ]
    }
  ];

  return (
    <section id="pricing" className="py-24 px-6 md:px-12 bg-gray-50 dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="uppercase tracking-[0.3em] text-[10px] font-bold text-accent mb-4">Investment</p>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-black dark:text-white mb-6">
            Transparent <span className="italic">Pricing</span>
          </h2>
          
          {/* Currency Toggle */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <span className={`text-xs font-bold uppercase tracking-widest ${currency === 'NGN' ? 'text-accent' : 'text-gray-400'}`}>NGN</span>
            <button 
              onClick={handleCurrencyToggle}
              className="w-12 h-6 bg-gray-200 dark:bg-white/10 rounded-full relative p-1 transition-colors"
            >
              <div className={`w-4 h-4 bg-accent rounded-full transition-transform duration-300 ${currency === 'USD' ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
            <span className={`text-xs font-bold uppercase tracking-widest ${currency === 'USD' ? 'text-accent' : 'text-gray-400'}`}>USD</span>
          </div>

          <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            Quality software is an investment. I offer competitive, value-based pricing for high-end custom development.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier, index) => (
            <div 
              key={index}
              className={`relative p-8 border ${tier.popular ? 'border-accent' : 'border-gray-200 dark:border-white/10'} bg-white dark:bg-[#0a0a0a] rounded-sm group hover:shadow-xl transition-all duration-500`}
            >
              {tier.popular && (
                <span className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                  Most Popular
                </span>
              )}
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">{tier.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-lg font-bold text-black dark:text-white">{pricingData[currency].symbol}</span>
                <span className="text-4xl font-heading font-bold text-black dark:text-white">{tier.price}</span>
                {tier.price !== "Custom" && tier.name !== "Custom Enterprise" && <span className="text-xs text-gray-400 font-medium">{pricingData[currency].suffix}</span>}
                {tier.name === "Custom Enterprise" && tier.price !== "Custom" && <span className="text-xs text-gray-400 font-medium">+</span>}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-8 h-12">
                {tier.desc}
              </p>
              <ul className="space-y-4 mb-10">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-[13px] text-gray-700 dark:text-gray-300">
                    <CheckIcon className="w-4 h-4 text-accent mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              <a 
                href="#contact" 
                className={`block text-center py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                  tier.popular 
                  ? 'bg-accent text-white hover:bg-white hover:text-accent border border-accent' 
                  : 'bg-black text-white dark:bg-white dark:text-black hover:bg-accent hover:text-white'
                }`}
              >
                Get Started
              </a>
            </div>
          ))}
        </div>

        {/* Pricing Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-[11px] text-gray-500 dark:text-gray-500 italic tracking-wider">
            * Final pricing may vary depending on specific advanced features and custom integrations needed to grow your business or web app.
          </p>
        </div>

        {/* Maintenance Package Banner */}
        <div className="mt-16 bg-black dark:bg-[#111] p-8 md:p-12 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-accent/20 transition-colors"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center md:text-left">
              <h3 className="text-2xl font-heading font-bold text-white mb-4">Maintenance & Support Package</h3>
              <p className="text-gray-400 font-light leading-relaxed">
                Keep your system running at peak performance. This mandatory annual package covers your **Premium Hosting**, **Domain Renewal**, **Security Updates**, and **Technical Support**.
              </p>
            </div>
            <div className="text-center md:text-right">
              <div className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">Yearly Fee</div>
              <div className="text-5xl font-heading font-bold text-white">
                {pricingData[currency].symbol}{pricingData[currency].maintenance}
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">Per Year / All-inclusive</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
