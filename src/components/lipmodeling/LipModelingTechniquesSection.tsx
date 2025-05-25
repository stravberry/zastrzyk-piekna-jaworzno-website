
import React, { useRef } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Droplet, Shield, Star } from "lucide-react";

const techniques = [
  {
    icon: <Heart className="w-8 h-8" />,
    title: "Kwas hialuronowy",
    description: "Najwyższej jakości preparaty zapewniające naturalne i trwałe efekty",
    benefits: ["Naturalna objętość", "Długotrwały efekt", "Bezpieczne składniki", "Odwracalność"]
  },
  {
    icon: <Droplet className="w-8 h-8" />,
    title: "Precyzyjne wypełnianie",
    description: "Technika pozwalająca na dokładne modelowanie każdej części ust",
    benefits: ["Precyzyjne kontury", "Symetryczne efekty", "Kontrola objętości", "Minimalne opuchnięcie"]
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Bezpieczeństwo zabiegu",
    description: "Najwyższe standardy bezpieczeństwa i higieny podczas każdego zabiegu",
    benefits: ["Sterylne warunki", "Wysokiej jakości preparaty", "Minimalne ryzyko", "Doświadczenie"]
  },
  {
    icon: <Star className="w-8 h-8" />,
    title: "Kompleksowa korekta",
    description: "Możliwość korekty asymetrii, powiększenia oraz poprawy konturu",
    benefits: ["Korekta asymetrii", "Poprawa konturu", "Zwiększenie objętości", "Wygładzenie"]
  }
];

const LipModelingTechniquesSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useScrollAnimation(sectionRef);

  return (
    <section ref={sectionRef} className="py-16 bg-pink-50/30">
      <div className="container-custom">
        <div 
          className={`text-center mb-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair">
            <span>Techniki </span>
            <span className="text-pink-500">modelowania</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Wykorzystuję nowoczesne metody i najwyższej jakości preparaty, 
            aby uzyskać naturalne i harmonijne efekty dostosowane do Twoich potrzeb.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {techniques.map((technique, index) => (
            <Card 
              key={technique.title}
              className={`transition-all duration-1000 hover:shadow-lg border-0 shadow-md ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="text-pink-500">
                    {technique.icon}
                  </div>
                  <CardTitle className="text-xl font-playfair">{technique.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{technique.description}</p>
                <ul className="space-y-2">
                  {technique.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start">
                      <Star className="text-gold-400 mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(LipModelingTechniquesSection);
