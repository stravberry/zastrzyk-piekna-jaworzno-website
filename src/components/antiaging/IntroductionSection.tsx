
import React, { useRef } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const IntroductionSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useScrollAnimation(sectionRef, { threshold: 0.2 });

  const chartRef = useRef<HTMLDivElement>(null);
  const isChartVisible = useScrollAnimation(chartRef, { threshold: 0.3 });
  
  return (
    <section ref={sectionRef} className="py-16 bg-white" aria-labelledby="introduction-title">
      <div className="container-custom">
        <div 
          className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${
            isVisible ? "opacity-100" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 id="introduction-title" className="text-3xl md:text-4xl font-bold mb-8 font-playfair">
            <span className="text-gray-800">Kompleksowe podejście do </span>
            <span className="text-pink-500">młodości skóry</span>
          </h2>
          
          <p className="text-gray-700 mb-6">
            W gabinecie kosmetologicznym terapie przeciwstarzeniowe można podzielić na 
            <span className="font-semibold"> zabiegi autologiczne</span> oraz 
            <span className="font-semibold"> stymulatory tkankowe</span>, które z kolei dzielą się na te pochodzenia
            naturalnego oraz syntetyczne polimery.
          </p>
          
          <p className="text-gray-700">
            Wszystkie te grupy mają na celu poprawę jakości skóry,
            spowolnienie procesów starzenia i wspieranie naturalnej regeneracji tkanek, 
            jednak różnią się mechanizmem działania oraz zastosowanymi substancjami.
          </p>
        </div>
        
        {/* Wizualna prezentacja podziału terapii */}
        <figure 
          ref={chartRef}
          className={`mt-16 max-w-4xl mx-auto transition-all duration-1000 delay-300 ${
            isChartVisible ? "opacity-100" : "opacity-0 translate-y-10"
          }`}
          aria-label="Schemat podziału terapii przeciwstarzeniowych"
        >
          <div className="bg-pink-50/60 rounded-xl p-8 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="w-full max-w-xs text-center p-4 mb-8 bg-pink-500 text-white rounded-lg shadow-lg">
                <h3 className="text-xl font-bold">Terapie przeciwstarzeniowe</h3>
              </div>
              
              <div className="w-0.5 h-8 bg-pink-300"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {/* Lewa strona - Zabiegi autologiczne */}
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-[#9b87f5] text-white rounded-lg shadow-md text-center w-full">
                    <h4 className="font-medium">Zabiegi autologiczne</h4>
                    <p className="text-sm mt-1 text-white/90">Wykorzystują własne komórki organizmu</p>
                  </div>
                  
                  <div className="w-0.5 h-6 bg-[#9b87f5]"></div>
                  
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="p-3 bg-white rounded-lg shadow-sm text-center border border-[#9b87f5]/20">
                      <p className="text-sm font-medium text-gray-800">PRP</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg shadow-sm text-center border border-[#9b87f5]/20">
                      <p className="text-sm font-medium text-gray-800">F-PRF</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg shadow-sm text-center border border-[#9b87f5]/20">
                      <p className="text-sm font-medium text-gray-800">I-PRF</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg shadow-sm text-center border border-[#9b87f5]/20">
                      <p className="text-sm font-medium text-gray-800">PLASMOO</p>
                    </div>
                  </div>
                </div>
                
                {/* Prawa strona - Stymulatory tkankowe */}
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-gold-400 text-white rounded-lg shadow-md text-center w-full">
                    <h4 className="font-medium">Stymulatory tkankowe</h4>
                    <p className="text-sm mt-1 text-white/90">Substancje pobudzające regenerację</p>
                  </div>
                  
                  <div className="w-0.5 h-6 bg-gold-400"></div>
                  
                  <div className="grid grid-cols-1 gap-3 w-full">
                    <div className="p-3 bg-white rounded-lg shadow-sm text-center border border-gold-400/20">
                      <p className="text-sm font-medium text-gray-800">Naturalne (kwas hialuronowy, kolagen...)</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg shadow-sm text-center border border-gold-400/20">
                      <p className="text-sm font-medium text-gray-800">Syntetyczne (PLLA, PDO, PCL)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </figure>
      </div>
    </section>
  );
};

export default React.memo(IntroductionSection);
