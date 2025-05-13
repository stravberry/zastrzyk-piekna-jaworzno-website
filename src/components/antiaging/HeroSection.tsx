
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeroSectionProps {
  scrollToSection: (ref: React.RefObject<HTMLDivElement>) => void;
  autologousRef: React.RefObject<HTMLDivElement>;
  stimulatorsRef: React.RefObject<HTMLDivElement>;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  scrollToSection,
  autologousRef,
  stimulatorsRef,
}) => {
  const isMobile = useIsMobile();

  return (
    <header className="relative bg-gradient-to-b from-pink-50/80 to-white py-12 md:py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-pink-300 via-pink-50 to-transparent" aria-hidden="true"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10 items-center">
          <div className="animate-fade-in px-4 md:px-0">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-playfair mb-4 md:mb-6">
              <span className="text-pink-500">Terapie </span>
              <span className="relative">
                przeciwstarzeniowe
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-gold-400" aria-hidden="true"></span>
              </span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-700 mb-6 md:mb-8">
              Nowoczesne rozwiązania, które skutecznie spowalniają procesy starzenia 
              i wspierają <span className="font-semibold">naturalną regenerację</span> tkanek.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Button 
                className="bg-pink-500 hover:bg-pink-600 text-white"
                size={isMobile ? "default" : "lg"}
                onClick={() => scrollToSection(autologousRef)}
                aria-label="Przejdź do sekcji zabiegów autologicznych"
              >
                Zabiegi autologiczne
                <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
              <Button 
                variant="outline" 
                className="border-pink-200 hover:bg-pink-50"
                size={isMobile ? "default" : "lg"}
                onClick={() => scrollToSection(stimulatorsRef)}
                aria-label="Przejdź do sekcji stymulatorów tkankowych"
              >
                Stymulatory tkankowe
                <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
          
          <div className="relative mt-8 lg:mt-0 px-4 sm:px-8 md:px-12 lg:px-0">
            <div className="aspect-square rounded-full bg-pink-100 absolute -top-10 -right-5 w-20 h-20 md:w-28 md:h-28 z-0 animate-pulse hidden sm:block" aria-hidden="true"></div>
            <div className="aspect-square rounded-full bg-gold-100 absolute -bottom-5 -left-5 w-16 h-16 md:w-20 md:h-20 z-0 animate-pulse hidden sm:block" aria-hidden="true"></div>
            <div className="relative z-10 max-w-md mx-auto">
              <img 
                src="/lovable-uploads/8911cfd6-7a54-4b02-8722-20c61218807d.png" 
                alt="Terapie przeciwstarzeniowe" 
                className="rounded-lg shadow-xl w-full h-auto aspect-[4/3] object-cover transform-gpu transition-transform duration-700 hover:scale-[1.02]"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(HeroSection);
