
import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/antiaging/HeroSection";
import IntroductionSection from "@/components/antiaging/IntroductionSection";
import AutologousTreatmentsSection from "@/components/antiaging/AutologousTreatmentsSection";
import TissueStimulatorSection from "@/components/antiaging/TissueStimulatorSection";
import FAQSection from "@/components/antiaging/FAQSection";
import CTASection from "@/components/antiaging/CTASection";
import { trackEvent } from "@/services/analyticService";
import { 
  autologousTreatments, 
  autologousAdvantages, 
  tissueStimulators, 
  growthFactors,
  growthFactorEffects
} from "@/components/antiaging/data/treatments";

// SEO configuration - keywords targeting specific locations
const locations = ["Jaworzno", "Katowice", "Myślowice", "Kraków", "Oświęcim", "Olkusz"];
const keywords = ["terapie przeciwstarzeniowe", "zabiegi odmładzające", "regeneracja skóry",
  "mezoterapia", "biostymulatory", "osocze bogatopłytkowe", "PRP", "gabinet kosmetologii"];

// Combine keywords with locations for SEO
const seoTitle = "Terapie Przeciwstarzeniowe | Gabinet Kosmetologii Zastrzyk Piękna | Jaworzno";
const seoDescription = `Profesjonalne terapie przeciwstarzeniowe, mezoterapia, osocze bogatopłytkowe PRP w Jaworznie i okolicach: ${locations.join(", ")}. Skuteczna regeneracja skóry i zabiegi odmładzające. Umów wizytę!`;

// Schema.org structured data for local business
const schemaData = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "@id": "https://zastrzyk-piekna.pl/zabiegi/terapie-przeciwstarzeniowe",
  "name": "Zastrzyk Piękna - Gabinet Kosmetologii Estetycznej",
  "description": "Terapie przeciwstarzeniowe i zabiegi odmładzające w gabinecie kosmetologii w Jaworznie",
  "url": "https://zastrzyk-piekna.pl/zabiegi/terapie-przeciwstarzeniowe",
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
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "10:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "10:00",
      "closes": "14:00"
    }
  ]
};

const AntiAgingTherapies: React.FC = () => {
  // References for scrolling to sections
  const autologousRef = React.useRef<HTMLDivElement>(null);
  const stimulatorsRef = React.useRef<HTMLDivElement>(null);

  // Function to scroll to the appropriate section
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
      
      // Track scrolling event for analytics
      trackEvent(
        'Page Navigation', 
        'Section Scroll', 
        `Scrolled to ${ref === autologousRef ? 'Autologous' : 'Stimulators'} Section`
      );
    }
  };

  // Track page view with enhanced data
  useEffect(() => {
    // Track treatment page view with location data
    trackEvent(
      'Page Engagement',
      'Treatment Page View',
      'Anti-Aging Therapies',
      1
    );

    // Track time on page
    const startTime = new Date().getTime();
    return () => {
      const timeSpent = Math.floor((new Date().getTime() - startTime) / 1000);
      trackEvent(
        'User Engagement',
        'Time on Page',
        'Anti-Aging Therapies',
        timeSpent
      );
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://zastrzyk-piekna.pl/zabiegi/terapie-przeciwstarzeniowe" />
        <meta property="og:image" content="/images/hero-pattern.jpg" />
        <meta property="og:locale" content="pl_PL" />
        
        {/* Twitter tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content="/images/hero-pattern.jpg" />
        
        {/* Keywords targeting specific locations */}
        <meta name="keywords" content={[...keywords, ...locations].join(", ")} />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://zastrzyk-piekna.pl/zabiegi/terapie-przeciwstarzeniowe" />
        
        {/* Geo tags */}
        <meta name="geo.region" content="PL-24" />
        <meta name="geo.placename" content="Jaworzno" />
        <meta name="geo.position" content="50.2026;19.2773" />
        <meta name="ICBM" content="50.2026, 19.2773" />
        
        {/* Structured data */}
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
        
        {/* Hreflang tags for language/region targeting */}
        <link rel="alternate" hreflang="pl-pl" href="https://zastrzyk-piekna.pl/zabiegi/terapie-przeciwstarzeniowe" />
      </Helmet>
      <Navbar />
      <main className="flex-grow pt-24">
        <HeroSection 
          scrollToSection={scrollToSection}
          autologousRef={autologousRef}
          stimulatorsRef={stimulatorsRef}
        />
        <IntroductionSection />
        <AutologousTreatmentsSection 
          autologousRef={autologousRef}
          autologousTreatments={autologousTreatments}
          autologousAdvantages={autologousAdvantages}
          growthFactors={growthFactors}
          growthFactorEffects={growthFactorEffects}
        />
        <TissueStimulatorSection
          stimulatorsRef={stimulatorsRef}
          tissueStimulators={tissueStimulators}
        />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default AntiAgingTherapies;
