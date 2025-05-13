
import React, { useRef } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { TreatmentType, AdvantageType, GrowthFactorType } from "./types";

interface AutologousTreatmentsSectionProps {
  autologousRef: React.RefObject<HTMLDivElement>;
  autologousTreatments: TreatmentType[];
  autologousAdvantages: AdvantageType[];
  growthFactors: GrowthFactorType[];
  growthFactorEffects: string[];
}

const AutologousTreatmentsSection: React.FC<AutologousTreatmentsSectionProps> = ({
  autologousRef,
  autologousTreatments,
  autologousAdvantages,
  growthFactors,
  growthFactorEffects
}) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderVisible = useScrollAnimation(headerRef);
  
  const introRef = useRef<HTMLDivElement>(null);
  const isIntroVisible = useScrollAnimation(introRef);
  
  const mechanismRef = useRef<HTMLDivElement>(null);
  const isMechanismVisible = useScrollAnimation(mechanismRef);
  
  const tabsRef = useRef<HTMLDivElement>(null);
  const isTabsVisible = useScrollAnimation(tabsRef);
  
  const advantagesRef = useRef<HTMLDivElement>(null);
  const isAdvantagesVisible = useScrollAnimation(advantagesRef);
  
  return (
    <section ref={autologousRef} className="py-16 bg-gradient-to-b from-white to-pink-50/30">
      <div className="container-custom">
        <div 
          ref={headerRef} 
          className={`text-center mb-16 transition-all duration-700 ${
            isHeaderVisible ? "opacity-100" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
            <span className="text-[#9b87f5]">Zabiegi </span>
            <span className="text-gray-800">autologiczne</span>
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Przyszłość medycyny estetycznej - wykorzystanie własnych komórek do naturalnej regeneracji
          </p>
        </div>
        
        {/* Trend powrotu do naturalności */}
        <div 
          ref={introRef}
          className={`bg-white rounded-xl shadow-md p-8 mb-16 transition-all duration-700 delay-100 ${
            isIntroVisible ? "opacity-100" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <h3 className="text-2xl font-semibold mb-4 font-playfair">
                Czym są zabiegi autologiczne?
              </h3>
              <p className="text-gray-700 mb-4">
                W kontekście medycyny estetycznej zabiegi autologiczne zyskują miano 
                <span className="text-[#9b87f5] font-semibold"> przyszłości tej dziedziny</span>. 
                Coraz więcej osób odchodzi od sztucznego efektu, zbyt widocznych wypełniaczy i
                przesadnej ingerencji na rzecz subtelnego, zdrowego wyglądu.
              </p>
              <p className="text-gray-700">
                Obecnie obserwujemy wyraźny trend powrotu do naturalności – nie tylko w stylu życia, ale także w dbaniu o urodę. 
                Klienci poszukują metod, które nie zmienią ich rysów, ale przywrócą skórze młodość, 
                jędrność i blask w sposób jak najbardziej zbliżony do procesów naturalnych.
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-radial from-[#9b87f5]/20 to-transparent rounded-full transform scale-110 animate-pulse"></div>
                <img 
                  src="/lovable-uploads/a49b2ad5-04a2-47df-b4f5-9c377ef464a3.png" 
                  alt="Zabieg autologiczny" 
                  className="rounded-lg shadow-lg relative z-10 max-w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Mechanizm działania */}
        <div 
          ref={mechanismRef}
          className={`bg-white rounded-xl shadow-md p-8 mb-16 transition-all duration-700 delay-200 ${
            isMechanismVisible ? "opacity-100" : "opacity-0 translate-y-10"
          }`}
        >
          <h3 className="text-2xl font-semibold mb-6 font-playfair text-center">
            Jak działają te zabiegi?
          </h3>
          <p className="text-gray-700 mb-6 text-center max-w-3xl mx-auto">
            Mechanizm działania opiera się na wykorzystaniu składników krwi bogatych w czynniki wzrostu:
          </p>
          
          {/* Czynniki wzrostu */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {growthFactors.map((factor, index) => (
              <div 
                key={index} 
                className="bg-[#9b87f5]/10 p-4 rounded-lg text-center transform transition-all duration-500"
                style={{ 
                  transitionDelay: `${index * 100}ms`,
                  opacity: isMechanismVisible ? 1 : 0,
                  transform: isMechanismVisible ? 'translateY(0)' : 'translateY(20px)'
                }}
              >
                <div className="font-bold text-[#9b87f5] text-xl mb-1">{factor.name}</div>
                <div className="text-gray-700 text-sm">{factor.fullName}</div>
              </div>
            ))}
          </div>
          
          {/* Efekty działania czynników */}
          <h4 className="text-center text-lg font-medium mb-4">Czynniki te:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {growthFactorEffects.map((effect, index) => (
              <div 
                key={index} 
                className="flex items-start p-3 bg-white border border-[#9b87f5]/20 rounded-lg shadow-sm transform transition-all duration-500"
                style={{ 
                  transitionDelay: `${(index + 3) * 100}ms`,
                  opacity: isMechanismVisible ? 1 : 0,
                  transform: isMechanismVisible ? 'translateY(0)' : 'translateY(20px)'
                }}
              >
                <CheckCircle2 className="text-[#9b87f5] w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-gray-700">{effect}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Rodzaje zabiegów */}
        <div ref={tabsRef}>
          <h3 className={`text-2xl font-bold mb-8 font-playfair text-center transition-all duration-700 ${
            isTabsVisible ? "opacity-100" : "opacity-0 translate-y-10"
          }`}>
            Rodzaje zabiegów autologicznych
          </h3>
          
          {/* Tabs dla różnych zabiegów */}
          <div className={`transition-all duration-700 delay-200 ${
            isTabsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
            <Tabs defaultValue="prp" className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8 bg-pink-50/50">
                {autologousTreatments.map((treatment) => (
                  <TabsTrigger 
                    key={treatment.id} 
                    value={treatment.name.toLowerCase().split(' ')[0]}
                    className="font-medium data-[state=active]:text-[#9b87f5] data-[state=active]:shadow-sm"
                  >
                    {treatment.name.split('–')[0].trim()}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {autologousTreatments.map((treatment) => (
                <TabsContent 
                  key={treatment.id} 
                  value={treatment.name.toLowerCase().split(' ')[0]}
                  className="animate-fade-in"
                >
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                      <div className="p-6 md:p-8">
                        <div className="flex items-center mb-4">
                          {treatment.icon}
                          <h4 className="text-xl font-semibold ml-3">{treatment.name}</h4>
                        </div>
                        {treatment.nickname && (
                          <div className="mb-4 inline-block bg-[#9b87f5]/10 px-3 py-1 rounded-full text-sm font-medium text-[#9b87f5]">
                            {treatment.nickname}
                          </div>
                        )}
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500 font-medium">Forma</p>
                            <p className="text-gray-700">{treatment.form}</p>
                          </div>
                          
                          {treatment.content && (
                            <div>
                              <p className="text-sm text-gray-500 font-medium">Zawartość</p>
                              <p className="text-gray-700">{treatment.content}</p>
                            </div>
                          )}
                          
                          <div>
                            <p className="text-sm text-gray-500 font-medium">Cel</p>
                            <p className="text-gray-700">{treatment.goal}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500 font-medium">Efekt</p>
                            <p className="text-gray-700">{treatment.effect}</p>
                          </div>
                          
                          {treatment.additional && (
                            <div>
                              <p className="text-sm text-gray-500 font-medium">Dodatkowe zastosowanie</p>
                              <p className="text-gray-700">{treatment.additional}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-6">
                          <Link 
                            to="/kontakt" 
                            className="inline-flex items-center text-[#9b87f5] font-medium transition-colors group"
                          >
                            Umów wizytę
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                      
                      <div className="bg-pink-50 h-full">
                        <img 
                          src={treatment.image} 
                          alt={treatment.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
        
        {/* Zalety zabiegów autologicznych */}
        <div ref={advantagesRef} className="mt-16">
          <h3 className={`text-2xl font-bold mb-8 font-playfair text-center transition-all duration-700 ${
            isAdvantagesVisible ? "opacity-100" : "opacity-0 translate-y-10"
          }`}>
            Zalety zabiegów autologicznych
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {autologousAdvantages.map((advantage, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-lg shadow-md border border-[#9b87f5]/10 hover:shadow-lg transition-all duration-500"
                style={{ 
                  transitionDelay: `${index * 100}ms`,
                  opacity: isAdvantagesVisible ? 1 : 0,
                  transform: isAdvantagesVisible ? 'translateY(0)' : 'translateY(20px)'
                }}
              >
                <div className="text-[#9b87f5] mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#9b87f5]/10 flex items-center justify-center mb-2">
                    <span className="font-bold text-xl">{index + 1}</span>
                  </div>
                </div>
                <h4 className="text-lg font-medium mb-2">{advantage.title}</h4>
                <p className="text-gray-600 text-sm">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AutologousTreatmentsSection;
