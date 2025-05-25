
import React, { useRef } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const LipModelingIntroSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useScrollAnimation(sectionRef);

  return (
    <section ref={sectionRef} className="py-16 bg-white">
      <div className="container-custom">
        <div 
          className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-8 font-playfair">
            Czym jest <span className="text-pink-500">modelowanie ust?</span>
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-xl leading-relaxed">
              Modelowanie ust to <strong>precyzyjna sztuka</strong>, która wykracza daleko poza zwykłe powiększenie. 
              To kompleksowe podejście do kształtowania ust, które uwzględnia indywidualne proporcje twarzy, 
              naturalne linie oraz osobiste preferencje każdego klienta.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mt-12 text-left">
              <div className="bg-pink-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-pink-600">Indywidualne podejście</h3>
                <p>
                  Każdy zabieg rozpoczynam od dokładnej analizy proporcji twarzy i naturalnego kształtu ust. 
                  Nie stosuję szablonowych rozwiązań - każdy projekt jest unikalny.
                </p>
              </div>
              
              <div className="bg-gold-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-gold-600">Naturalne efekty</h3>
                <p>
                  Celem nie jest drastyczna zmiana, lecz podkreślenie naturalnego piękna ust. 
                  Efekt ma być harmonijny i proporcjonalny do rysów twarzy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(LipModelingIntroSection);
