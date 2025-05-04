
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <div className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-r from-pink-50 to-white">
      <div className="absolute inset-0 z-0 opacity-20 bg-[url('/images/hero-pattern.jpg')] bg-cover bg-center"></div>
      <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-sm"></div>
      
      <div className="container-custom relative z-20 grid grid-cols-1 md:grid-cols-2 gap-8 pt-20">
        {/* Left side content */}
        <div className="flex flex-col items-start text-left space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight animate-fade-in">
            Gabinet kosmetologiczny Jaworzno
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl animate-slide-up">
            Indywidualne podejście do klienta, holistyczna pielęgnacja i najwyższej jakości zabiegi 
            kosmetologii estetycznej w Jaworznie.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-slide-up">
            <Button asChild size="lg" className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-6 text-base">
              <Link to="/kontakt">
                Umów wizytę
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-pink-500 text-pink-500 hover:bg-pink-50 px-8 py-6 text-base">
              <Link to="/zabiegi">
                Poznaj zabiegi
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-6 pt-8 w-full">
            <div className="flex flex-col items-center p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-pink-100">
              <div className="text-gold-500 text-xl font-bold font-playfair">5+</div>
              <div className="text-gray-600 text-sm">Lat doświadczenia</div>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-pink-100">
              <div className="text-gold-500 text-xl font-bold font-playfair">1000+</div>
              <div className="text-gray-600 text-sm">Zadowolonych klientów</div>
            </div>
          </div>
        </div>
        
        {/* Right side video */}
        <div className="flex items-center justify-center">
          <div className="w-full h-full min-h-[300px] bg-gray-200 rounded-lg shadow-md overflow-hidden">
            {/* Video placeholder - can be replaced with actual video component */}
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-500">Miejsce na film</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
