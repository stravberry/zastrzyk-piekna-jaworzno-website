
import React, { useState, useRef, useEffect } from "react";
import { CheckCircle, X, ArrowRight, Sparkles, Award, Heart, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface ComparisonItem {
  category: string;
  others: string;
  clinic: string;
  icon: React.ElementType;
  badAspect: string;
  goodAspect: string;
}

const comparisonData: ComparisonItem[] = [
  {
    category: "Podejście do klienta",
    others: "Standardowe, często schematyczne",
    clinic: "Indywidualne, holistyczne podejście",
    icon: Heart,
    badAspect: "Brak personalnej uwagi",
    goodAspect: "Każdy klient jest wyjątkowy"
  },
  {
    category: "Doświadczenie",
    others: "Różne poziomy umiejętności",
    clinic: "Laureatka Kosmetologa Roku woj. śląskiego",
    icon: Award,
    badAspect: "Niepewne efekty",
    goodAspect: "Gwarancja wysokiej jakości"
  },
  {
    category: "Wykształcenie",
    others: "Kursy i podstawowe szkolenia",
    clinic: "Magister kosmetologii, studentka pielęgniarstwa",
    icon: Star,
    badAspect: "Powierzchowna wiedza",
    goodAspect: "Dogłębna wiedza naukowa"
  },
  {
    category: "Specjalizacja",
    others: "Ogólne podejście",
    clinic: "Anti-aging, usta, makijaż permanentny brwi",
    icon: Sparkles,
    badAspect: "Przeciętne rezultaty",
    goodAspect: "Eksperckie specjalizacje"
  },
  {
    category: "Jakość preparatów",
    others: "Niejednokrotnie niska jakość",
    clinic: "Tylko sprawdzone, certyfikowane preparaty",
    icon: Shield,
    badAspect: "Ryzyko podrażnień",
    goodAspect: "Bezpieczne, premium produkty"
  }
];

const AnimatedIcon = ({ icon: Icon, isActive, delay = 0 }: { 
  icon: React.ElementType; 
  isActive: boolean; 
  delay?: number;
}) => (
  <div 
    className={`transition-all duration-700 ${isActive ? 'scale-110 rotate-12' : 'scale-100 rotate-0'}`}
    style={{ transitionDelay: `${delay}ms` }}
  >
    <Icon className={`w-8 h-8 ${isActive ? 'text-pink-500' : 'text-gray-400'}`} />
  </div>
);

const SplitScreenCard = ({ item, index, activeIndex }: { 
  item: ComparisonItem; 
  index: number; 
  activeIndex: number;
}) => {
  const isActive = activeIndex === index;
  const cardRef = useRef<HTMLDivElement>(null);
  const isVisible = useScrollAnimation(cardRef, { threshold: 0.3 });

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-xl transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      } ${isActive ? 'scale-105 z-10' : 'scale-100'}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r transition-opacity duration-500 ${
        isActive 
          ? 'from-red-50 via-gray-50 to-green-50 opacity-100' 
          : 'from-gray-50 to-gray-100 opacity-70'
      }`} />
      
      {/* Split screen container */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 min-h-[200px]">
        {/* Left side - Others */}
        <div className={`p-6 transition-all duration-700 ${
          isActive ? 'bg-red-100/50 border-r-2 border-red-200' : 'bg-gray-100/30'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-full transition-all duration-500 ${
              isActive ? 'bg-red-200 scale-110' : 'bg-gray-200'
            }`}>
              <X className={`w-5 h-5 transition-colors duration-300 ${
                isActive ? 'text-red-600' : 'text-gray-500'
              }`} />
            </div>
            <h4 className="font-semibold text-gray-800">Inne gabinety</h4>
          </div>
          <p className={`text-sm transition-all duration-300 ${
            isActive ? 'text-red-700 font-medium' : 'text-gray-600'
          }`}>
            {item.others}
          </p>
          <div className={`mt-3 text-xs transition-all duration-500 ${
            isActive ? 'text-red-600 opacity-100' : 'text-gray-500 opacity-0'
          }`}>
            → {item.badAspect}
          </div>
        </div>

        {/* Right side - My clinic */}
        <div className={`p-6 transition-all duration-700 ${
          isActive ? 'bg-green-100/50' : 'bg-gray-100/30'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-full transition-all duration-500 ${
              isActive ? 'bg-green-200 scale-110' : 'bg-gray-200'
            }`}>
              <CheckCircle className={`w-5 h-5 transition-colors duration-300 ${
                isActive ? 'text-green-600' : 'text-gray-500'
              }`} />
            </div>
            <h4 className="font-semibold text-gray-800">Zastrzyk Piękna</h4>
          </div>
          <p className={`text-sm transition-all duration-300 ${
            isActive ? 'text-green-700 font-medium' : 'text-gray-600'
          }`}>
            {item.clinic}
          </p>
          <div className={`mt-3 text-xs transition-all duration-500 ${
            isActive ? 'text-green-600 opacity-100' : 'text-gray-500 opacity-0'
          }`}>
            → {item.goodAspect}
          </div>
        </div>

        {/* Animated arrow in the middle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className={`transition-all duration-700 ${
            isActive ? 'scale-125 rotate-0' : 'scale-100 rotate-180'
          }`}>
            <div className={`p-3 rounded-full shadow-lg transition-colors duration-500 ${
              isActive ? 'bg-pink-500 text-white' : 'bg-white text-gray-400'
            }`}>
              <ArrowRight className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Category label and icon */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm transition-all duration-500 ${
            isActive ? 'bg-pink-500 text-white scale-110' : 'bg-white text-gray-600'
          }`}>
            <AnimatedIcon icon={item.icon} isActive={isActive} />
            <span className="text-sm font-medium">{item.category}</span>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
        <div className={`h-full bg-gradient-to-r from-pink-400 to-pink-600 transition-all duration-1000 ${
          isActive ? 'w-full' : 'w-0'
        }`} />
      </div>
    </div>
  );
};

const ComparisonSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useScrollAnimation(sectionRef, { threshold: 0.1 });

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % comparisonData.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={sectionRef} className="py-16 bg-gradient-to-br from-pink-50 via-white to-purple-50 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute top-10 left-10 animate-bounce opacity-20 delay-0">
        <Heart className="w-8 h-8 text-pink-300" />
      </div>
      <div className="absolute top-20 right-20 animate-bounce opacity-20 delay-1000">
        <Star className="w-6 h-6 text-gold-300" />
      </div>
      <div className="absolute bottom-20 left-1/4 animate-bounce opacity-20 delay-2000">
        <Award className="w-7 h-7 text-purple-300" />
      </div>

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
            Zobacz różnice między standardowym podejściem a profesjonalną opieką w moim gabinecie
          </p>
          
          {/* Category navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {comparisonData.map((item, index) => (
              <Button
                key={index}
                variant={activeIndex === index ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveIndex(index)}
                className={`transition-all duration-300 ${
                  activeIndex === index 
                    ? 'bg-pink-500 hover:bg-pink-600 scale-105' 
                    : 'hover:bg-pink-50 hover:border-pink-300'
                }`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.category}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-6 max-w-4xl mx-auto">
          {comparisonData.map((item, index) => (
            <SplitScreenCard 
              key={index} 
              item={item} 
              index={index} 
              activeIndex={activeIndex}
            />
          ))}
        </div>

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
