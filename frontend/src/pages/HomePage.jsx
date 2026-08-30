import React, { useEffect, useLayoutEffect } from 'react';
import Hero from '../components/Hero';
import Projects from '../components/Projects';
import Services from '../components/Services';
import WhyAndHow from '../components/WhyAndHow';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';
import About from '../components/About';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';

const HomePage = () => {
  useEffect(() => {
    document.title = "Buildwith_lami — Software Studio for Web, Commerce & Custom Platforms";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Buildwith_lami is the software studio of Eugene Odibenuah — designing, building, and shipping websites, e-commerce stores, business portals, and custom software for founders and growing teams.");
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
      <WhyAndHow />
      <Testimonials />
      <Pricing isHomepage={true} />
      <About />
      <FAQ />
      <Contact />
    </>
  );
};

export default HomePage;
