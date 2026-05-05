import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-background pt-16 pb-8 border-t border-gray-900">
      <div className="px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-8">
          <div className="flex gap-4">
            {/* QR Code Placeholder */}
            <div className="w-24 h-24 bg-white p-2 flex items-center justify-center">
              <div className="w-full h-full border-2 border-black flex items-center justify-center text-black text-xs text-center font-bold">
                QR CODE
              </div>
            </div>
            <div className="w-48 h-24 bg-gray-500"></div>
          </div>

          <div className="flex flex-wrap gap-8 text-xs font-bold tracking-widest uppercase text-gray-400">
            <div className="flex flex-col space-y-4">
              <a href="#about" className="hover:text-accent transition-colors">About</a>
              <a href="#demo" className="hover:text-accent transition-colors">Demo</a>
            </div>
            <div className="flex flex-col space-y-4">
              <a href="#services" className="hover:text-accent transition-colors">Services</a>
              <a href="#faqs" className="hover:text-accent transition-colors">FAQs</a>
            </div>
            <div className="flex flex-col space-y-4">
              <a href="#projects" className="hover:text-accent transition-colors">Projects</a>
            </div>
            <div className="flex flex-col space-y-4">
              <a href="#terms" className="hover:text-accent transition-colors">Terms</a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end">
          <h2 className="text-3xl md:text-5xl font-heading font-bold tracking-widest mb-4 md:mb-0">
            &lt;BUILDWITH_LAMI /&gt;
          </h2>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest">
            copyright 2024 || buildwith_lami
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
