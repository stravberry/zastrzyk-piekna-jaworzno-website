
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const scrollToProcess = () => {
    const processSection = document.getElementById('process-section');
    if (processSection) {
      processSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-pink-50 to-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/hero-pattern.jpg')] opacity-10 bg-cover bg-center"></div>
      
      <div className="container-custom relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-20">
        {/* Left content */}
        <div className="space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight font-playfair">
              Sculptra<sup className="text-pink-500">®</sup> – odbuduj młodość
            </h1>
            <p className="text-xl md:text-2xl text-gold-600 font-medium">
              Trwale, naturalnie, inteligentnie
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span className="text-lg text-gray-700">Efekty do 25 miesięcy</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span className="text-lg text-gray-700">Naturalna stymulacja kolagenu</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span className="text-lg text-gray-700">Biostymulator nowej generacji</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span className="text-lg text-gray-700">Potwierdzone badaniami</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button asChild size="lg" className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-6">
              <Link to="/kontakt">
                Umów konsultację
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-pink-500 text-pink-500 hover:bg-pink-50 px-8 py-6"
              onClick={scrollToProcess}
            >
              Zobacz proces zabiegu
            </Button>
          </div>
        </div>
        
        {/* Right content - placeholder for hero image */}
        <div className="flex justify-center">
          <div className="w-full max-w-md h-[400px] bg-gradient-to-br from-pink-100 to-gold-100 rounded-lg shadow-lg flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl">✨</div>
              <p className="text-gray-600 font-medium">Sculptra<sup>®</sup> Effects</p>
              <p className="text-sm text-gray-500">Naturalne odmłodzenie</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
