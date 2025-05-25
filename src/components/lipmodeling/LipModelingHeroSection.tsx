
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";

const LipModelingHeroSection: React.FC = () => {
  const isMobile = useIsMobile();

  const scrollToGallery = () => {
    const gallery = document.getElementById('lip-gallery');
    if (gallery) {
      gallery.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="relative bg-gradient-to-b from-pink-50/80 to-white py-12 md:py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-pink-300 via-pink-50 to-transparent" aria-hidden="true"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="animate-fade-in px-4 md:px-0 mb-10 lg:mb-0">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-playfair mb-4 md:mb-6">
              <span className="text-pink-500">Modelowanie </span>
              <span className="relative">
                ust
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-gold-400" aria-hidden="true"></span>
              </span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-700 mb-6 md:mb-8">
              Precyzyjne, indywidualne dopasowanie kształtu oraz wielkości ust. 
              Praca oparta na <span className="font-semibold">wieloletnim doświadczeniu</span> oraz 
              jednostkowym podejściu do każdego klienta.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 sm:mb-4">
              <Button 
                className="bg-pink-500 hover:bg-pink-600 text-white"
                size={isMobile ? "default" : "lg"}
                onClick={scrollToGallery}
                aria-label="Zobacz efekty zabiegów"
              >
                Zobacz efekty
                <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
              <Button 
                variant="outline" 
                className="border-pink-200 hover:bg-pink-50"
                size={isMobile ? "default" : "lg"}
                asChild
              >
                <Link to="/cennik">
                  Sprawdź cennik
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="relative px-4 sm:px-8 md:px-12 lg:px-0 mt-0">
            <div className="aspect-square rounded-full bg-pink-100 absolute -top-10 -right-5 w-20 h-20 md:w-28 md:h-28 z-0 animate-pulse hidden sm:block" aria-hidden="true"></div>
            <div className="aspect-square rounded-full bg-gold-100 absolute -bottom-5 -left-5 w-16 h-16 md:w-20 md:h-20 z-0 animate-pulse hidden sm:block" aria-hidden="true"></div>
            <div className="relative z-10 max-w-md mx-auto">
              <img 
                src="/lovable-uploads/28e228b7-3605-4c15-9731-3c72e9585d6b.png" 
                alt="Modelowanie ust - efekty zabiegów" 
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

export default React.memo(LipModelingHeroSection);
