
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

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
  return (
    <section className="relative bg-gradient-to-b from-pink-50/80 to-white py-16 md:py-28 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-pink-300 via-pink-50 to-transparent"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-playfair mb-6">
              <span className="text-pink-500">Terapie </span>
              <span className="relative">
                przeciwstarzeniowe
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-gold-400"></span>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8">
              Nowoczesne rozwiązania, które skutecznie spowalniają procesy starzenia 
              i wspierają <span className="font-semibold">naturalną regenerację</span> tkanek.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-pink-500 hover:bg-pink-600 text-white"
                size="lg"
                onClick={() => scrollToSection(autologousRef)}
              >
                Zabiegi autologiczne
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="border-pink-200 hover:bg-pink-50"
                size="lg"
                onClick={() => scrollToSection(stimulatorsRef)}
              >
                Stymulatory tkankowe
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square rounded-full bg-pink-100 absolute -top-10 -right-10 w-28 h-28 z-0 animate-pulse"></div>
            <div className="aspect-square rounded-full bg-gold-100 absolute -bottom-5 -left-5 w-20 h-20 z-0 animate-pulse"></div>
            <img 
              src="/lovable-uploads/8911cfd6-7a54-4b02-8722-20c61218807d.png" 
              alt="Terapie przeciwstarzeniowe" 
              className="rounded-lg shadow-xl relative z-10 w-full h-auto aspect-[4/3] object-cover transform-gpu transition-transform duration-700 hover:scale-[1.02]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
