
import React, { useRef } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import FloatingCards from "./FloatingCards";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Award, Star } from "lucide-react";

const ComparisonSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useScrollAnimation(sectionRef, { threshold: 0.1 });

  return (
    <section ref={sectionRef} className="py-16 bg-gradient-to-br from-pink-50 via-white to-purple-50 relative overflow-hidden">
      {/* Particle background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-2 h-2 bg-pink-300 rounded-full animate-pulse opacity-50"></div>
        <div className="absolute top-32 right-20 w-1 h-1 bg-purple-400 rounded-full animate-bounce opacity-60"></div>
        <div className="absolute bottom-40 left-1/4 w-3 h-3 bg-gold-300 rounded-full animate-pulse opacity-40"></div>
        <div className="absolute top-64 right-1/3 w-2 h-2 bg-pink-400 rounded-full animate-bounce opacity-50"></div>
        <div className="absolute bottom-20 right-10 w-1 h-1 bg-purple-300 rounded-full animate-pulse opacity-60"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className={`text-center mb-16 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-playfair">
            <span>Dlaczego warto wybrać </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              mój gabinet?
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg mb-8">
            Odkryj przewagi profesjonalnej opieki w moim gabinecie
          </p>
        </div>

        <FloatingCards />

        {/* Achievement badge */}
        <div className={`text-center mt-16 transform transition-all duration-1000 delay-500 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="inline-flex items-center bg-gradient-to-r from-gold-400 to-gold-600 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
            {/* Floating particles around badge */}
            <div className="absolute -top-2 -left-2 w-1 h-1 bg-white rounded-full animate-ping"></div>
            <div className="absolute -bottom-1 -right-1 w-1 h-1 bg-white rounded-full animate-pulse"></div>
            
            <Award className="w-6 h-6 mr-3" />
            <span className="font-semibold text-lg">Kosmetolog Roku Województwa Śląskiego</span>
            <div className="ml-3 flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-white animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
