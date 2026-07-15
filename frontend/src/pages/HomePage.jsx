import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import About from '../components/About';
import Services from '../components/Services';
import WhyChoose from '../components/WhyChoose';
import Pricing from '../components/Pricing';

import Projects from '../components/Projects';
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

  return (
    <>
      <Hero />
      <HowItWorks />
      <About />
      <Services />
      <WhyChoose />
      <Pricing />

      <Projects />
      <FAQ />
      <Contact />
    </>
  );
};

export default HomePage;
