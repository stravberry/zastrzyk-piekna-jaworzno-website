
import React, { useRef } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import BentoGrid from "./BentoGrid";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Award, Star } from "lucide-react";

const ComparisonSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useScrollAnimation(sectionRef, { threshold: 0.1 });

  return (
    <section ref={sectionRef} className="py-16 bg-gradient-to-br from-pink-50 via-white to-purple-50 relative overflow-hidden">
      <div className="container-custom relative z-10">
        <div className={`text-center mb-12 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-playfair">
            <span>Dlaczego warto wybrać </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              mój gabinet?
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg mb-8">
            Poznaj przewagi profesjonalnej opieki w moim gabinecie
          </p>
        </div>

        <BentoGrid />

        {/* Achievement badge */}
        <div className={`text-center mt-12 transform transition-all duration-1000 delay-500 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="inline-flex items-center bg-gradient-to-r from-gold-400 to-gold-600 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
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
