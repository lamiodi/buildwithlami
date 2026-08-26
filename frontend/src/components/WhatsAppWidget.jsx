import React, { useState, useEffect } from 'react';
import { CONTACT } from '../config/contact';

const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // International format (E.164, no leading +) from the shared contact config.
  const phoneNumber = CONTACT.phoneE164;
  const defaultMessage = encodeURIComponent("Hi Eugene! I'd like to discuss a project with BuildWithLami.");
  const waLink = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  // Delay the appearance of the widget slightly for smooth page entry
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-body">
      {/* Popup Window */}
      <div 
        className={`bg-white dark:bg-[#141414] text-black dark:text-white rounded-2xl shadow-2xl mb-4 w-72 sm:w-80 overflow-hidden border border-gray-200 dark:border-white/10 transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-black dark:bg-[#1a1a1a] px-4 py-3.5 flex items-center justify-between border-b border-gray-800 dark:border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center overflow-hidden">
              <span className="text-accent text-xs font-bold font-mono">EO</span>
            </div>
            <div>
              <h4 className="text-white font-heading font-bold text-sm tracking-tight">Eugene Odibenuah</h4>
              <p className="text-gray-400 text-[11px] flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span>Typically replies in minutes</span>
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Close WhatsApp chat popup"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat Body */}
        <div className="bg-gray-50 dark:bg-[#0c0c0c] p-4 min-h-[150px] flex flex-col justify-end space-y-4 relative">
          {/* Subtle dot pattern */}
          <div 
            className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '12px 12px' }}
          />
          
          <div className="bg-white dark:bg-[#1c1c1c] p-3.5 rounded-xl rounded-tl-none border border-gray-200 dark:border-white/10 shadow-sm max-w-[90%] relative z-10">
            <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed font-light">
              Hi there! 👋<br/><br/>
              Looking to build a custom web platform, e-commerce store, or business software? Let me know how I can help!
            </p>
            <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 block mt-2 text-right">Just now</span>
          </div>
        </div>

        {/* Footer / Action */}
        <div className="bg-white dark:bg-[#141414] p-3.5 border-t border-gray-100 dark:border-white/5">
          <a 
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="w-full bg-accent hover:bg-accent/90 text-white font-mono font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-accent/20 active:scale-98"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>Start WhatsApp Chat ↗</span>
          </a>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen 
            ? 'bg-black dark:bg-[#1a1a1a] text-white scale-90 border border-gray-700 dark:border-white/20 shadow-xl' 
            : 'bg-accent hover:bg-accent/90 text-white shadow-xl shadow-accent/25 hover:scale-105 active:scale-95'
        } rounded-full p-3.5 sm:p-4 transition-all duration-300 flex items-center justify-center cursor-pointer`}
        aria-label="Chat on WhatsApp"
      >
        {isOpen ? (
          <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        )}
      </button>
    </div>
  );
};

export default WhatsAppWidget;
