import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Compass, MessageCircle, ArrowUpRight, CheckCircle2, ShieldCheck, Crosshair, Camera, Video, Shield, Plane } from 'lucide-react';
import { CONTACT } from '../config/contact';

const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  const currentPath = (location.pathname || '').toLowerCase();
  const isSurvey = currentPath.startsWith('/survey');
  const isDrone = currentPath.startsWith('/drone');

  const phoneNumber = CONTACT.phoneE164;
  const [surveyTopic, setSurveyTopic] = useState('Boundary Survey');
  const [droneTopic, setDroneTopic] = useState('Real Estate');

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  // ── 1. Dedicated Survey Division WhatsApp Interface ──────────────────
  if (isSurvey) {
    const surveyTopics = [
      { id: 'boundary', label: 'Boundary Survey', text: "Hi Eugene, I'd like to inquire about a Boundary Demarcation & Beaconing project in [Location] (Approx. size: [Plots/Acreage]). Please share scope and quotation details." },
      { id: 'topo', label: 'Topographic Baseline', text: "Hi Eugene, I need a Topographic Survey & Contour Elevation model in [Location] (Approx. size: [Plots/Acreage]). Please share scope and quotation details." },
      { id: 'setting-out', label: 'Setting Out / Layout', text: "Hi Eugene, I'd like to schedule Construction Setting Out & Axis Alignment in [Location] (Approx. footprint: [Area/Units]). Please share timeline and quote." },
      { id: 'subdivision', label: 'Estate Subdivision', text: "Hi Eugene, I need assistance with an Estate Subdivision & Plot Partitioning project in [Location] (Approx. extent: [Hectares/Plots]). Please share scope and quote." }
    ];

    const activeTopicObj = surveyTopics.find(t => t.label === surveyTopic) || surveyTopics[0];
    const surveyWaLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(activeTopicObj.text)}`;

    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
        <div 
          className={`bg-white text-black rounded-none shadow-2xl mb-4 w-80 sm:w-96 overflow-hidden border-2 border-black transition-all duration-300 origin-bottom-right ${
            isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="bg-black text-white p-4 flex items-center justify-between border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-white text-black flex items-center justify-center font-black">
                <Compass className="w-5 h-5 text-black animate-[spin_20s_linear_infinite]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-black text-xs uppercase tracking-wider">GeoSurvey</h4>
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-white/20 text-white px-1.5 py-0.5">Field Inquiries</span>
                </div>
                <p className="text-gray-400 text-[10px] flex items-center gap-1.5 font-mono mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span>Eugene Odibenuah // Field Desk</span>
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors p-1"
              aria-label="Close Survey WhatsApp Chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="bg-[#f7f7f7] p-4 space-y-3.5 border-b border-gray-200">
            <div className="bg-white p-3.5 border border-gray-300 shadow-sm">
              <p className="text-xs text-gray-800 leading-relaxed font-semibold">
                Hello! 👋 Need a land survey, boundary beaconing, topographic baseline, or setting out in Nigeria?
              </p>
              <p className="text-[11px] text-gray-500 mt-1 font-medium">
                Select your project type below to start a direct consultation on WhatsApp:
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block">Select Discipline:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {surveyTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSurveyTopic(topic.label)}
                    className={`p-2 text-[10px] font-bold uppercase tracking-wider text-left border transition-all flex items-center justify-between ${
                      surveyTopic === topic.label
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                    }`}
                  >
                    <span className="truncate">{topic.label}</span>
                    {surveyTopic === topic.label && <CheckCircle2 className="w-3 h-3 text-white shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-white p-2 border border-gray-200">
              <ShieldCheck className="w-3.5 h-3.5 text-black shrink-0" />
              <span>SURCON-Supervised Field Services</span>
            </div>
          </div>
          <div className="bg-white p-3.5">
            <a 
              href={surveyWaLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-widest py-3 px-4 flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Chat with Surveyor ↗</span>
            </a>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`${
            isOpen 
              ? 'bg-black text-white scale-90 border-2 border-black shadow-2xl' 
              : 'bg-black hover:bg-gray-900 text-white border-2 border-black shadow-xl hover:scale-105 active:scale-95'
          } rounded-none p-3.5 sm:p-4 transition-all duration-300 flex items-center justify-center cursor-pointer relative group`}
          aria-label="Direct Land Survey WhatsApp Inquiries"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-white animate-[spin_12s_linear_infinite]" />
              <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-widest text-white pr-1">
                Survey Desk
              </span>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            </div>
          )}
        </button>
      </div>
    );
  }

  // ── 2. Dedicated Drone Division WhatsApp Interface (Theme-Matched) ─────
  if (isDrone) {
    const droneTopics = [
      { 
        id: 'real-estate', 
        label: 'Real Estate', 
        text: "Hi Eugene, I'd like to book a luxury property / architectural aerial shoot in [Location]. Deliverables: [48MP Stills / 4K 10-bit Video]. Please share availability and quote." 
      },
      { 
        id: 'construction', 
        label: 'Construction Flyover', 
        text: "Hi Eugene, I need recurring construction milestone progress flyovers & visual audits in [Location]. Schedule: [Monthly / Milestone]. Please share quote details." 
      },
      { 
        id: 'commercial', 
        label: 'Hospitality / Events', 
        text: "Hi Eugene, I'd like to book aerial cinematography for a resort / event / brand campaign in [Location]. Please share timeline and quote." 
      },
      { 
        id: 'mapping', 
        label: 'Drone Mapping / DSM', 
        text: "Hi Eugene, I need high-resolution 2D orthomosaic basemaps & photogrammetric elevation data in [Location] (Approx. extent: [Hectares/Acres]). Please share quote." 
      }
    ];

    const activeDroneObj = droneTopics.find(t => t.label === droneTopic) || droneTopics[0];
    const droneWaLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(activeDroneObj.text)}`;

    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
        <div 
          className={`bg-[#121212] text-white rounded-[2rem] shadow-2xl mb-4 w-80 sm:w-96 overflow-hidden border border-white/10 transition-all duration-300 origin-bottom-right ${
            isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
          }`}
        >
          {/* Header */}
          <div className="bg-[#181818] p-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F44A22]/15 border border-[#F44A22]/30 flex items-center justify-center text-[#F44A22]">
                <Crosshair className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="drone-heading text-white font-black text-xs uppercase tracking-wider">Lami Aerial</h4>
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-[#F44A22]/20 text-[#F44A22] px-2 py-0.5 rounded-full border border-[#F44A22]/30">
                    Flight Dispatch
                  </span>
                </div>
                <p className="text-gray-400 text-[10px] flex items-center gap-1.5 mt-0.5 font-medium">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span>Eugene Odibenuah · Chief Pilot</span>
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
              aria-label="Close Drone Flight Dispatch WhatsApp Chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="bg-[#121212] p-4 space-y-3.5 border-b border-white/5">
            <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/10">
              <p className="text-xs text-gray-200 leading-relaxed font-medium">
                Ready for takeoff! 🚁 Need commercial drone photography (48MP RAW), 4K 60fps HDR video (10-bit D-Log M), or orthomosaic basemaps across Nigeria?
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Select your mission discipline below to start an immediate briefing on WhatsApp:
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block">
                Select Mission Discipline:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {droneTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setDroneTopic(topic.label)}
                    className={`p-2.5 text-[10px] font-bold uppercase tracking-wider text-left rounded-xl border transition-all flex items-center justify-between ${
                      droneTopic === topic.label
                        ? 'bg-[#F44A22] text-white border-[#F44A22] shadow-lg shadow-[#F44A22]/20'
                        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{topic.label}</span>
                    {droneTopic === topic.label && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Hardware & Spec Indicator */}
            <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
              <div className="flex items-center gap-2">
                <Camera className="w-3.5 h-3.5 text-[#F44A22]" />
                <span>DJI Mini 4 Pro · 4K/60 HDR · 48MP RAW</span>
              </div>
              <span className="text-emerald-400 text-[9px] uppercase font-bold">Ready</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="bg-[#181818] p-3.5">
            <a 
              href={droneWaLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="w-full bg-[#F44A22] hover:bg-[#d93f1b] text-white font-bold text-xs uppercase tracking-widest py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#F44A22]/25 active:scale-98"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>Dispatch Flight Mission ↗</span>
            </a>
          </div>
        </div>

        {/* Floating Trigger Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`${
            isOpen 
              ? 'bg-[#181818] text-white scale-90 border border-white/20 shadow-2xl' 
              : 'bg-[#121212] hover:bg-[#181818] text-white border border-[#F44A22]/40 shadow-xl shadow-[#F44A22]/20 hover:scale-105 active:scale-95'
          } rounded-full p-3.5 sm:py-3.5 sm:px-5 transition-all duration-300 flex items-center justify-center cursor-pointer relative group`}
          aria-label="Direct Drone Flight Dispatch Inquiries"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <div className="flex items-center gap-2.5">
              <Crosshair className="w-5 h-5 text-[#F44A22] group-hover:rotate-90 transition-transform duration-500" />
              <span className="hidden sm:inline-block drone-heading text-[10px] font-black uppercase tracking-wider text-white pr-0.5">
                Flight Desk
              </span>
              <span className="w-2 h-2 bg-[#F44A22] rounded-full animate-ping" />
            </div>
          )}
        </button>
      </div>
    );
  }

  // ── 3. Main Software & Product Studio WhatsApp Interface ──────────────
  const divisionTitle = 'Software & Product Studio';
  const greetingText = (
    <>
      Hi there! 👋<br/><br/>
      Looking to build a custom web platform, e-commerce store, or business software? Let me know how I can help!
    </>
  );
  const actionLabel = 'Start WhatsApp Chat ↗';
  const defaultMessage = "Hi Eugene! I'd like to discuss a software project with BuildWithLami.";
  const waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-body">
      <div 
        className={`bg-white dark:bg-[#141414] text-black dark:text-white rounded-2xl shadow-2xl mb-4 w-72 sm:w-80 overflow-hidden border border-gray-200 dark:border-white/10 transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-black dark:bg-[#1a1a1a] px-4 py-3.5 flex items-center justify-between border-b border-gray-800 dark:border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center overflow-hidden">
              <span className="text-accent text-xs font-bold font-mono">EO</span>
            </div>
            <div>
              <h4 className="text-white font-heading font-bold text-sm tracking-tight">Eugene Odibenuah</h4>
              <p className="text-gray-400 text-[10px] flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span>{divisionTitle}</span>
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
        <div className="bg-gray-50 dark:bg-[#0c0c0c] p-4 min-h-[150px] flex flex-col justify-end space-y-4 relative">
          <div 
            className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '12px 12px' }}
          />
          <div className="bg-white dark:bg-[#1c1c1c] p-3.5 rounded-xl rounded-tl-none border border-gray-200 dark:border-white/10 shadow-sm max-w-[95%] relative z-10">
            <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed font-light">
              {greetingText}
            </p>
            <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 block mt-2 text-right">Just now</span>
          </div>
        </div>
        <div className="bg-white dark:bg-[#141414] p-3.5 border-t border-gray-100 dark:border-white/5">
          <a 
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="w-full bg-accent hover:bg-accent/90 text-white font-mono font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-accent/20 active:scale-98"
          >
            <MessageCircle className="w-4 h-4 text-white" />
            <span>{actionLabel}</span>
          </a>
        </div>
      </div>
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
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
        )}
      </button>
    </div>
  );
};

export default WhatsAppWidget;
