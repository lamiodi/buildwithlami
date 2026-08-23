import React, { useEffect, useLayoutEffect } from 'react';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import About from '../components/About';
import Services from '../components/Services';
import WhyChoose from '../components/WhyChoose';
import Pricing from '../components/Pricing';
import Projects from '../components/Projects';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';

const HomePage = () => {
  useEffect(() => {
    document.title = "BuildWithLami — Software, Survey & Drone Services";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "BuildWithLami is the official platform of Eugene Odibenuah — software development, land surveying, and drone services for ambitious teams.");
    }
  }, []);

  // Scroll to hash anchor after components render (handles navigation from other pages to /#pricing, /#contact, etc.)
  useLayoutEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <>
      <Hero />
      <Projects />
      <Services />
      <WhyChoose />
      <HowItWorks />
      <Testimonials />
      <Pricing isHomepage={true} />
      <About />
      <FAQ />
      <Contact />
    </>
  );
};

export default HomePage;
