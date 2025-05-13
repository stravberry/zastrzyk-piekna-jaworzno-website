
import React, { useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import InstagramSection from "@/components/InstagramSection";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnalytics } from "@/hooks/useAnalytics";

const Index = () => {
  const servicesRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const instagramRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  
  // Initialize analytics tracking
  const { trackEvent } = useAnalytics();
  
  // Track home page engagement
  useEffect(() => {
    trackEvent('Page Engagement', 'Homepage View', 'Landing Page', 1);
  }, [trackEvent]);
  
  // Track scroll animations for each section
  const isServicesVisible = useScrollAnimation(servicesRef);
  const isAboutVisible = useScrollAnimation(aboutRef);
  const isTestimonialsVisible = useScrollAnimation(testimonialsRef);
  const isInstagramVisible = useScrollAnimation(instagramRef);
  const isCtaVisible = useScrollAnimation(ctaRef);
  
  // Track when sections become visible
  useEffect(() => {
    if (isServicesVisible) {
      trackEvent('Section Visibility', 'Services Section Viewed', 'Homepage');
    }
    if (isAboutVisible) {
      trackEvent('Section Visibility', 'About Section Viewed', 'Homepage');
    }
    if (isTestimonialsVisible) {
      trackEvent('Section Visibility', 'Testimonials Section Viewed', 'Homepage');
    }
    if (isInstagramVisible) {
      trackEvent('Section Visibility', 'Instagram Section Viewed', 'Homepage');
    }
    if (isCtaVisible) {
      trackEvent('Section Visibility', 'CTA Section Viewed', 'Homepage');
    }
  }, [isServicesVisible, isAboutVisible, isTestimonialsVisible, isInstagramVisible, isCtaVisible, trackEvent]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <div 
          ref={servicesRef}
          id="services"
          className={`transition-all duration-700 ${
            isServicesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <ServicesSection />
        </div>
        <div 
          ref={aboutRef}
          className={`transition-all duration-700 ${
            isAboutVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <AboutSection />
        </div>
        <div 
          ref={testimonialsRef}
          className={`transition-all duration-700 ${
            isTestimonialsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <TestimonialsSection />
        </div>
        <div 
          ref={instagramRef}
          className={`transition-all duration-700 ${
            isInstagramVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <InstagramSection />
        </div>
        <div 
          ref={ctaRef}
          className={`transition-all duration-700 ${
            isCtaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <CTASection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
