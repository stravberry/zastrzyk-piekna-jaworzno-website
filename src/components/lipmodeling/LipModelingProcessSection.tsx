
import React, { useRef } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Card, CardContent } from "@/components/ui/card";
import { User, Search, Palette, Sparkles } from "lucide-react";

const processSteps = [
  {
    icon: <User className="w-8 h-8" />,
    title: "Konsultacja",
    description: "Dokładna analiza proporcji twarzy, omówienie oczekiwań i dobranie odpowiedniej techniki",
    duration: "15-20 min"
  },
  {
    icon: <Search className="w-8 h-8" />,
    title: "Projektowanie",
    description: "Precyzyjne zaplanowanie kształtu i objętości z uwzględnieniem naturalnych proporcji",
    duration: "10-15 min"
  },
  {
    icon: <Palette className="w-8 h-8" />,
    title: "Wykonanie zabiegu",
    description: "Profesjonalne modelowanie z użyciem najwyższej jakości kwasu hialuronowego",
    duration: "30-45 min"
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "Efekt końcowy",
    description: "Naturalne, piękne usta dostosowane do Twoich indywidualnych potrzeb",
    duration: "Natychmiastowy"
  }
];

const LipModelingProcessSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useScrollAnimation(sectionRef);

  return (
    <section ref={sectionRef} className="py-16 bg-white">
      <div className="container-custom">
        <div 
          className={`text-center mb-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair">
            <span className="text-pink-500">Przebieg </span>
            <span>zabiegu</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Każdy zabieg prowadzę z najwyższą starannością, dbając o komfort i bezpieczeństwo klienta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processSteps.map((step, index) => (
            <Card 
              key={step.title}
              className={`text-center border-0 shadow-md hover:shadow-lg transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <div className="bg-pink-100 p-3 rounded-full text-pink-500">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 font-playfair">{step.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                <div className="bg-gold-50 px-3 py-1 rounded-full text-xs font-medium text-gold-600">
                  {step.duration}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div 
          className={`mt-12 bg-pink-50 p-8 rounded-lg transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <h3 className="text-2xl font-semibold mb-4 text-center font-playfair">
            Zalecenia po zabiegu
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-gray-700">
            <div>
              <h4 className="font-semibold mb-2">Pierwsze 24 godziny:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Unikaj dotykania ust</li>
                <li>• Nie stosuj makijażu na usta</li>
                <li>• Unikaj gorących napojów</li>
                <li>• Nie wykonuj intensywnych ćwiczeń</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Pierwszy tydzień:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Unikaj sauny i solarium</li>
                <li>• Stosuj delikatne kosmetyki</li>
                <li>• Nawilżaj usta balsamem</li>
                <li>• Unikaj wstrząsów mechanicznych</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(LipModelingProcessSection);
