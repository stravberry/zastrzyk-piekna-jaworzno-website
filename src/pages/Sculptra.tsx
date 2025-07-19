
import React from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/sculptra/HeroSection";
import IntroSection from "@/components/sculptra/IntroSection";
import BenefitsSection from "@/components/sculptra/BenefitsSection";
import ProcessSection from "@/components/sculptra/ProcessSection";
import TreatmentAreasSection from "@/components/sculptra/TreatmentAreasSection";
import FAQSection from "@/components/sculptra/FAQSection";
import CTASection from "@/components/sculptra/CTASection";
import { usePageTracking } from "@/hooks/usePageTracking";

const Sculptra = () => {
  usePageTracking();

  return (
    <>
      <Helmet>
        <title>Sculptra® Jaworzno - Biostymulator Kolagenu | Zastrzyk Piękna</title>
        <meta name="description" content="Sculptra® - innowacyjny biostymulator tkankowy w Jaworznie. Długotrwałe efekty odmłodzenia do 25 miesięcy. Naturalna odbudowa kolagenu. Umów konsultację!" />
        <meta name="keywords" content="Sculptra Jaworzno, biostymulator kolagenu, Galderma, odmładzanie twarzy, kwas L-polimlekowy, stymulacja kolagenu" />
        <meta property="og:title" content="Sculptra® Jaworzno - Biostymulator Kolagenu | Zastrzyk Piękna" />
        <meta property="og:description" content="Sculptra® - innowacyjny biostymulator tkankowy. Długotrwałe efekty odmłodzenia do 25 miesięcy. Naturalna odbudowa kolagenu." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://zastrzyk-piekna.pl/sculptra" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        <HeroSection />
        <IntroSection />
        <BenefitsSection />
        <ProcessSection />
        <TreatmentAreasSection />
        <FAQSection />
        <CTASection />
        <Footer />
      </div>
    </>
  );
};

export default Sculptra;
