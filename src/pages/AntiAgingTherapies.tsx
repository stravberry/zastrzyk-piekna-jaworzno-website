
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/antiaging/HeroSection";
import IntroductionSection from "@/components/antiaging/IntroductionSection";
import AutologousTreatmentsSection from "@/components/antiaging/AutologousTreatmentsSection";
import TissueStimulatorSection from "@/components/antiaging/TissueStimulatorSection";
import FAQSection from "@/components/antiaging/FAQSection";
import CTASection from "@/components/antiaging/CTASection";
import { 
  autologousTreatments, 
  autologousAdvantages, 
  tissueStimulators, 
  growthFactors,
  growthFactorEffects
} from "@/components/antiaging/data/treatments";

const AntiAgingTherapies: React.FC = () => {
  // References for scrolling to sections
  const autologousRef = React.useRef<HTMLDivElement>(null);
  const stimulatorsRef = React.useRef<HTMLDivElement>(null);

  // Function to scroll to the appropriate section
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
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
