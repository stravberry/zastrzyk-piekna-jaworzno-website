
import React from "react";
import { Sparkles, Heart, Zap } from "lucide-react";

const TreatmentAreasSection = () => {
  const effects = [
    {
      icon: Sparkles,
      title: "Ujędrnienie skóry",
      description: "Naturalna poprawa elastyczności i napięcia skóry dzięki stymulacji kolagenu typu I"
    },
    {
      icon: Heart,
      title: "Poprawa gęstości skóry",
      description: "Zwiększenie grubości i jakości skóry, redukcja drobnych zmarszczek"
    },
    {
      icon: Zap,
      title: "Odbudowa wolumetrii",
      description: "Przywrócenie naturalnych konturów twarzy bez sztucznego efektu"
    }
  ];

  const areas = [
    "Policzki i okolice skroniowe",
    "Nasolabialny",
    "Okolice żuchwy",
    "Podbródek",
    "Dekolt i szyja",
    "Dłonie"
  ];

  return (
    <section className="section-padding bg-gradient-to-b from-gray-50 to-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 font-playfair">
            Efekty i Obszary Zastosowania
          </h2>
          <div className="w-24 h-1 bg-gold-400 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sculptra<sup>®</sup> odbudowuje strukturę skóry tam, gdzie jest to najbardziej potrzebne
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Effects */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-8 font-playfair text-center lg:text-left">
              Jakie efekty osiągniesz?
            </h3>
            <div className="space-y-6">
              {effects.map((effect, index) => (
                <div key={index} className="flex gap-4 p-6 bg-white rounded-lg shadow-md border border-gray-100">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                      <effect.icon className="w-5 h-5 text-pink-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">{effect.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{effect.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Treatment Areas */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-8 font-playfair text-center lg:text-left">
              Obszary zabiegowe
            </h3>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <div className="grid gap-4">
                {areas.map((area, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
                    <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gallery placeholder */}
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-800 mb-8 font-playfair">
            Efekty Sculptra<sup className="text-pink-500">®</sup>
          </h3>
          <div className="bg-gradient-to-br from-pink-100 to-gold-100 rounded-xl p-12 shadow-lg">
            <div className="text-6xl mb-4">📸</div>
            <p className="text-xl font-medium text-gray-700 mb-2">Galeria efektów</p>
            <p className="text-gray-600">Zdjęcia przed i po zabiegach będą dostępne wkrótce</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TreatmentAreasSection;
