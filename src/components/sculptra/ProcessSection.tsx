
import React from "react";
import { Calendar, Clock, CheckCircle } from "lucide-react";

const ProcessSection = () => {
  const steps = [
    {
      number: "1",
      title: "Pierwszy zabieg",
      description: "Rozpoczynamy proces stymulacji kolagenu. Aplikacja Sculptra® w kluczowe punkty twarzy.",
      duration: "45-60 minut",
      nextStep: "45 dni przerwy"
    },
    {
      number: "2", 
      title: "Drugi zabieg",
      description: "Kontynuujemy proces odbudowy. Efekty pierwszego zabiegu już są widoczne.",
      duration: "45-60 minut",
      nextStep: "6 miesięcy przerwy"
    },
    {
      number: "3",
      title: "Trzeci zabieg", 
      description: "Finalizujemy proces. Maksymalizujemy długotrwałe efekty odmłodzenia.",
      duration: "45-60 minut",
      nextStep: "Efekty do 25 miesięcy"
    }
  ];

  return (
    <section id="process-section" className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 font-playfair">
            Proces Zabiegu Sculptra<sup className="text-pink-500">®</sup>
          </h2>
          <div className="w-24 h-1 bg-gold-400 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sculptra<sup>®</sup> to proces składający się z 3 etapów, zaprojektowany dla optymalnych i długotrwałych rezultatów
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-pink-200 -translate-y-1/2"></div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  {/* Step circle */}
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-pink-500 text-white rounded-full flex items-center justify-center text-xl font-bold font-playfair shadow-lg relative z-10">
                      {step.number}
                    </div>
                  </div>
                  
                  {/* Step content */}
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 font-playfair">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {step.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{step.duration}</span>
                      </div>
                      
                      <div className="bg-pink-50 p-3 rounded-lg">
                        <div className="flex items-center justify-center gap-2 text-sm font-medium text-pink-700">
                          {index < 2 ? <Calendar className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          <span>{step.nextStep}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <div className="bg-gold-50 p-8 rounded-xl border border-gold-200">
              <h3 className="text-2xl font-semibold text-gold-800 mb-4 font-playfair">
                Dlaczego 3 zabiegi?
              </h3>
              <p className="text-gold-700 leading-relaxed max-w-2xl mx-auto">
                Postupowa aplikacja Sculptra<sup>®</sup> pozwala na kontrolowane i naturalne pobudzenie fibroblastów 
                do produkcji kolagenu, zapewniając optymalny i długotrwający efekt odmłodzenia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
