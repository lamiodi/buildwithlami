import React, { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between px-6 py-4 md:px-12 max-w-7xl mx-auto">
      <div className="text-xl font-heading font-bold tracking-widest flex items-center justify-center bg-[#222] w-10 h-10">
        Ob
      </div>
      
      {/* Desktop Menu */}
      <div className="hidden md:flex space-x-8 text-sm uppercase tracking-wider">
        <a href="#home" className="hover:text-accent transition-colors">Home</a>
        <a href="#projects" className="hover:text-accent transition-colors">Projects</a>
        <a href="#about" className="hover:text-accent transition-colors">About</a>
        <a href="#contact" className="hover:text-accent transition-colors">Contact</a>
        <a href="#resume" className="hover:text-accent transition-colors">Resume</a>
      </div>

      {/* Mobile Menu Button */}
      <button 
        className="md:hidden text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-background flex flex-col items-center py-4 space-y-4 md:hidden border-b border-gray-800 z-50">
          <a href="#home" onClick={() => setIsOpen(false)} className="hover:text-accent transition-colors">Home</a>
          <a href="#projects" onClick={() => setIsOpen(false)} className="hover:text-accent transition-colors">Projects</a>
          <a href="#about" onClick={() => setIsOpen(false)} className="hover:text-accent transition-colors">About</a>
          <a href="#contact" onClick={() => setIsOpen(false)} className="hover:text-accent transition-colors">Contact</a>
          <a href="#resume" onClick={() => setIsOpen(false)} className="hover:text-accent transition-colors">Resume</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
