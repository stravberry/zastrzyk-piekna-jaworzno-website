
import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LipModelingHeroSection from "@/components/lipmodeling/LipModelingHeroSection";
import LipModelingIntroSection from "@/components/lipmodeling/LipModelingIntroSection";
import LipModelingTechniquesSection from "@/components/lipmodeling/LipModelingTechniquesSection";
import LipModelingProcessSection from "@/components/lipmodeling/LipModelingProcessSection";
import LipModelingGallerySection from "@/components/lipmodeling/LipModelingGallerySection";
import LipModelingFAQSection from "@/components/lipmodeling/LipModelingFAQSection";
import LipModelingCTASection from "@/components/lipmodeling/LipModelingCTASection";
import { useAnalytics } from "@/hooks/useAnalytics";

const locations = ["Jaworzno", "Katowice", "Myślowice", "Kraków", "Oświęcim", "Olkusz"];
const keywords = ["modelowanie ust", "powiększanie ust", "wypełnianie ust", "kwas hialuronowy", 
  "kosmetologia estetyczna", "gabinet kosmetologii", "korekta ust"];

const seoTitle = "Modelowanie Ust | Powiększanie Ust Kwasem Hialuronowym | Zastrzyk Piękna Jaworzno";
const seoDescription = `Profesjonalne modelowanie i powiększanie ust kwasem hialuronowym w Jaworznie. Naturalne efekty, bezpieczne zabiegi. Obsługujemy: ${locations.join(", ")}. Umów wizytę!`;

const schemaData = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "@id": "https://zastrzyk-piekna.pl/zabiegi/modelowanie-ust",
  "name": "Zastrzyk Piękna - Modelowanie Ust",
  "description": "Profesjonalne modelowanie i powiększanie ust w gabinecie kosmetologii w Jaworznie",
  "url": "https://zastrzyk-piekna.pl/zabiegi/modelowanie-ust",
  "telephone": "+48123456789",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "ul. Przykładowa 123",
    "addressLocality": "Jaworzno",
    "postalCode": "43-600",
    "addressRegion": "śląskie",
    "addressCountry": "PL"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 50.2026,
    "longitude": 19.2773
  },
  "areaServed": locations.map(location => ({
    "@type": "City",
    "name": location
  })),
  "priceRange": "$$",
  "serviceType": "Modelowanie ust"
};

const LipModeling: React.FC = () => {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    trackEvent(
      'Page Engagement',
      'Treatment Page View',
      'Lip Modeling',
      1
    );
  }, [trackEvent]);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://zastrzyk-piekna.pl/zabiegi/modelowanie-ust" />
        <meta property="og:image" content="/lovable-uploads/28e228b7-3605-4c15-9731-3c72e9585d6b.png" />
        <meta property="og:locale" content="pl_PL" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content="/lovable-uploads/28e228b7-3605-4c15-9731-3c72e9585d6b.png" />
        
        <meta name="keywords" content={[...keywords, ...locations].join(", ")} />
        
        <link rel="canonical" href="https://zastrzyk-piekna.pl/zabiegi/modelowanie-ust" />
        
        <meta name="geo.region" content="PL-24" />
        <meta name="geo.placename" content="Jaworzno" />
        <meta name="geo.position" content="50.2026;19.2773" />
        <meta name="ICBM" content="50.2026, 19.2773" />
        
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
        
        <link rel="alternate" hrefLang="pl-pl" href="https://zastrzyk-piekna.pl/zabiegi/modelowanie-ust" />
      </Helmet>
      <Navbar />
      <main className="flex-grow pt-24">
        <LipModelingHeroSection />
        <LipModelingIntroSection />
        <LipModelingTechniquesSection />
        <LipModelingProcessSection />
        <LipModelingGallerySection />
        <LipModelingFAQSection />
        <LipModelingCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LipModeling;
