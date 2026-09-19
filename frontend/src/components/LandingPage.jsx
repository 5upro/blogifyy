import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './Landing/Navbar';
import Hero from './Landing/Hero';
import Stats from './Landing/Stats';
import Features from './Landing/Features';
import HowItWorks from './Landing/HowItWorks';
import Testimonials from './Landing/Testimonials';
import CTA from './Landing/CTA';
import Footer from './Landing/Footer';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = ({ onGetStarted }) => {
  const containerRef = useRef(null);
  
  // Refs to pass to components for GSAP targets
  const navRef = useRef(null);
  const heroHeadingRef = useRef(null);
  const heroSubRef = useRef(null);
  const heroBtnsRef = useRef(null);
  
  const featuresRef = useRef(null);
  const featureCardsRef = useRef([]); // Mutable ref array for cards
  
  const ctaRef = useRef(null);
  
  const stepsRef = useRef(null);
  const stepItemsRef = useRef([]); // Mutable ref array for steps
  
  const testimonialRef = useRef(null);

  // Core GSAP logic remains exactly the same!
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Navbar slide-in
      gsap.from(navRef.current, { y: -80, opacity: 0, duration: 1, ease: 'power3.out' });

      // Hero text stagger
      const heroTl = gsap.timeline({ delay: 0.4 });
      heroTl
        .from(heroHeadingRef.current?.children || [], { y: 80, opacity: 0, duration: 1, stagger: 0.15, ease: 'power4.out' })
        .from(heroSubRef.current, { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
        .from(heroBtnsRef.current?.children || [], { y: 30, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out' }, '-=0.4');

      // Feature cards
      featureCardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.from(card, {
          scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' },
          y: 60, opacity: 0, duration: 0.8, delay: i * 0.15, ease: 'power3.out',
        });
      });

      // Features heading
      if (featuresRef.current) {
        gsap.from(featuresRef.current.querySelectorAll('.features-header > *'), {
          scrollTrigger: { trigger: featuresRef.current, start: 'top 80%' },
          y: 50, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
        });
      }

      // Steps section
      stepItemsRef.current.forEach((step, i) => {
        if (!step) return;
        gsap.from(step, {
          scrollTrigger: { trigger: step, start: 'top 85%', toggleActions: 'play none none reverse' },
          x: i % 2 === 0 ? -60 : 60, opacity: 0, duration: 0.8, delay: i * 0.1, ease: 'power3.out',
        });
      });

      // CTA parallax
      if (ctaRef.current) {
        gsap.from(ctaRef.current.querySelectorAll('.cta-inner > *'), {
          scrollTrigger: { trigger: ctaRef.current, start: 'top 80%' },
          y: 60, opacity: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out',
        });
      }

      // Testimonials
      if (testimonialRef.current) {
        gsap.from(testimonialRef.current.querySelectorAll('.testimonial-card'), {
          scrollTrigger: { trigger: testimonialRef.current, start: 'top 80%' },
          y: 50, opacity: 0, scale: 0.95, duration: 0.7, stagger: 0.15, ease: 'power3.out',
        });
      }

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Shared button animation handlers
  const handleMagnetic = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
  };

  const handleMagneticLeave = (e) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
  };

  return (
    <div ref={containerRef} className="landing-page bg-[#0a0a0f] text-white overflow-x-hidden">
      <Navbar 
        ref={navRef} 
        onGetStarted={onGetStarted} 
        handleMagnetic={handleMagnetic} 
        handleMagneticLeave={handleMagneticLeave} 
      />
      <Hero 
        headingRef={heroHeadingRef} 
        subRef={heroSubRef} 
        btnsRef={heroBtnsRef} 
        onGetStarted={onGetStarted} 
      />
      <Stats />
      <Features 
        ref={featuresRef} 
        cardsRef={featureCardsRef} 
      />
      <HowItWorks 
        ref={stepsRef} 
        itemsRef={stepItemsRef} 
      />
      <Testimonials 
        ref={testimonialRef} 
      />
      <CTA 
        ref={ctaRef} 
        onGetStarted={onGetStarted} 
        handleMagnetic={handleMagnetic} 
        handleMagneticLeave={handleMagneticLeave} 
      />
      <Footer />
    </div>
  );
};

export default LandingPage;