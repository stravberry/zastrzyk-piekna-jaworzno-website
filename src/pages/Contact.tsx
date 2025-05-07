
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactHero from "@/components/contact/ContactHero";
import ContactForm from "@/components/contact/ContactForm";
import ContactInfo from "@/components/contact/ContactInfo";
import MapSection from "@/components/contact/MapSection";

const Contact = () => {
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
