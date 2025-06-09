
import React, { useState, useRef } from "react";
import { CheckCircle, Star, Award, Heart, Zap, Shield, Trophy, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface ComparisonItem {
  category: string;
  others: string;
  clinic: string;
  icon: React.ElementType;
  color: string;
}

const comparisonData: ComparisonItem[] = [
  {
    category: "Podejście do klienta",
    others: "Standardowe, często schematyczne",
    clinic: "Indywidualne, holistyczne podejście",
    icon: Heart,
    color: "from-pink-500 to-rose-500"
  },
  {
    category: "Doświadczenie",
    others: "Różne poziomy",
    clinic: "Laureatka Kosmetologa Roku woj. śląskiego",
    icon: Trophy,
    color: "from-gold-500 to-yellow-500"
  },
  {
    category: "Wykształcenie",
    others: "Kursy i szkolenia",
    clinic: "Magister kosmetologii, studentka pielęgniarstwa",
    icon: Award,
    color: "from-blue-500 to-indigo-500"
  },
  {
    category: "Specjalizacja",
    others: "Ogólna",
    clinic: "Anti-aging, usta, makijaż permanentny brwi",
    icon: Star,
    color: "from-purple-500 to-violet-500"
  },
  {
    category: "Jakość preparatów",
    others: "Niejednokrotnie niska",
    clinic: "Tylko sprawdzone, certyfikowane preparaty",
    icon: Shield,
    color: "from-green-500 to-emerald-500"
  },
  {
    category: "Efekty zabiegów",
    others: "Niekiedy powierzchowne",
    clinic: "Widoczne, precyzyjne i trwałe rezultaty",
    icon: Zap,
    color: "from-orange-500 to-red-500"
  },
  {
    category: "Wiedza i rozwój",
    others: "Rzadko aktualizowana",
    clinic: "Ciągłe szkolenia, aktualna wiedza branżowa",
    icon: CheckCircle,
    color: "from-teal-500 to-cyan-500"
  },
  {
    category: "Komunikacja z klientem",
    others: "Głównie telefoniczna",
    clinic: "Dostępność online, Instagram, rolki edukacyjne",
    icon: Users,
    color: "from-pink-500 to-purple-500"
  }
];

const ComparisonCard = ({ item, index }: { item: ComparisonItem; index: number }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isVisible = useScrollAnimation(cardRef, { threshold: 0.3 });

  return (
    <div
      ref={cardRef}
      className={`transform transition-all duration-700 ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-8 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Card
        className="relative h-64 cursor-pointer group hover:scale-105 transition-all duration-300 overflow-hidden"
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        <div className="absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity duration-300" 
             style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }} />
        
        {/* Front Card */}
        <div className={`absolute inset-0 transition-transform duration-700 transform-gpu ${
          isFlipped ? 'rotateY-180' : 'rotateY-0'
        }`}>
          <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center mb-4 shadow-lg`}>
              <item.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">{item.category}</h3>
            <div className="w-12 h-1 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"></div>
          </CardContent>
        </div>

        {/* Back Card */}
        <div className={`absolute inset-0 transition-transform duration-700 transform-gpu ${
          isFlipped ? 'rotateY-0' : 'rotateY-180'
        }`}>
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                <p className="text-xs font-medium text-red-600 mb-1">Inne gabinety:</p>
                <p className="text-sm text-red-700">{item.others}</p>
              </div>
              
              <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
                <p className="text-xs font-medium text-green-600 mb-1">Zastrzyk Piękna:</p>
                <p className="text-sm text-green-700 font-medium">{item.clinic}</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
                ))}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

const FloatingElement = ({ children, className = "", delay = 0 }: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number; 
}) => (
  <div 
    className={`absolute opacity-20 animate-pulse ${className}`}
    style={{ animationDelay: `${delay}s`, animationDuration: '3s' }}
  >
    {children}
  </div>
);

const ComparisonSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useScrollAnimation(sectionRef, { threshold: 0.1 });

  return (
    <section ref={sectionRef} className="py-16 bg-gradient-to-br from-pink-50 via-white to-purple-50 relative overflow-hidden">
      {/* Floating Background Elements */}
      <FloatingElement className="top-10 left-10" delay={0}>
        <Heart className="w-8 h-8 text-pink-300" />
      </FloatingElement>
      <FloatingElement className="top-20 right-20" delay={1}>
        <Star className="w-6 h-6 text-gold-300" />
      </FloatingElement>
      <FloatingElement className="bottom-20 left-1/4" delay={2}>
        <Award className="w-7 h-7 text-purple-300" />
      </FloatingElement>
      <FloatingElement className="bottom-10 right-10" delay={0.5}>
        <Trophy className="w-8 h-8 text-pink-300" />
      </FloatingElement>

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
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Najedź na karty poniżej, aby zobaczyć szczegółowe porównanie z innymi gabinetami
          </p>
          
          {/* Animated underline */}
          <div className="flex justify-center mt-6">
            <div className={`h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-1000 ${
              isVisible ? 'w-24' : 'w-0'
            }`}></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {comparisonData.map((item, index) => (
            <ComparisonCard key={index} item={item} index={index} />
          ))}
        </div>

        {/* Achievement Badge */}
        <div className={`text-center transform transition-all duration-1000 delay-500 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="inline-flex items-center bg-gradient-to-r from-gold-400 to-gold-600 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Trophy className="w-6 h-6 mr-3" />
            <span className="font-semibold text-lg">Kosmetolog Roku Województwa Śląskiego</span>
            <div className="ml-3 flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-white" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom styles for 3D flip effect */}
      <style jsx>{`
        .rotateY-0 {
          transform: rotateY(0deg);
        }
        .rotateY-180 {
          transform: rotateY(180deg);
        }
        .transform-gpu {
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }
      `}</style>
    </section>
  );
};

export default ComparisonSection;
