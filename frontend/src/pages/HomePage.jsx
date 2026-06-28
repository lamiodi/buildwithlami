import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import About from '../components/About';
import Services from '../components/Services';
import Pricing from '../components/Pricing';
import Projects from '../components/Projects';
import Contact from '../components/Contact';

const HomePage = () => {
  useEffect(() => {
    document.title = "Eugene Odibenuah | Premium Full-Stack Developer & SEO Strategist";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Portfolio of Eugene Odibenuah, a premium full-stack developer specialized in building enterprise-grade web applications and high-performance digital experiences.");
    }
  }, []);

  return (
    <>
      <Hero />
      <HowItWorks />
      <About />
      <Services />
      <Pricing />
      <Projects />
      <Contact />
    </>
  );
};

export default HomePage;
