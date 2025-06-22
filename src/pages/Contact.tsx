
import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactHero from "@/components/contact/ContactHero";
import ContactForm from "@/components/contact/ContactForm";
import ContactInfo from "@/components/contact/ContactInfo";
import MapSection from "@/components/contact/MapSection";
import { useScrollTracking } from "@/hooks/useScrollTracking";
import { useClickTracking } from "@/hooks/useClickTracking";
import { useAdvancedTracking } from "@/hooks/useAdvancedTracking";

const Contact = () => {
  const { trackConversion } = useAdvancedTracking();

  // Enable automatic tracking
  useScrollTracking({
    pageName: 'Contact Page',
    milestones: [25, 50, 75, 100],
    trackTimeOnSection: true
  });
  
  useClickTracking({
    trackLinks: true,
    trackButtons: true,
    trackForms: true
  });

  // Track contact page view as potential conversion
  useEffect(() => {
    trackConversion('page_view', 'Contact Page View', {
      page_type: 'contact',
      user_intent: 'contact_inquiry'
    });
  }, [trackConversion]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <ContactHero />

        {/* Contact Info & Form */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="order-2 lg:order-1">
                <ContactInfo />
              </div>

              {/* Contact Form */}
              <div className="order-1 lg:order-2">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <MapSection />
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
