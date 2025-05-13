
import React, { useRef } from "react";
import { ChevronRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { StimulatorCategory } from "./types";

interface TissueStimulatorSectionProps {
  stimulatorsRef: React.RefObject<HTMLDivElement>;
  tissueStimulators: StimulatorCategory[];
}

const TissueStimulatorSection: React.FC<TissueStimulatorSectionProps> = ({
  stimulatorsRef,
  tissueStimulators
}) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderVisible = useScrollAnimation(headerRef);
  
  const descriptionRef = useRef<HTMLDivElement>(null);
  const isDescriptionVisible = useScrollAnimation(descriptionRef);
  
  const categoriesRef = useRef<HTMLDivElement>(null);
  const isCategoriesVisible = useScrollAnimation(categoriesRef);
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const isCarouselVisible = useScrollAnimation(carouselRef);
  
  return (
    <section ref={stimulatorsRef} className="py-16 bg-white">
      <div className="container-custom">
        <div 
          ref={headerRef}
          className={`text-center mb-16 transition-all duration-700 ${
            isHeaderVisible ? "opacity-100" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
            <span className="text-gold-500">Stymulatory </span>
            <span className="text-gray-800">tkankowe</span>
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Nowoczesne preparaty pobudzające skórę do naturalnej regeneracji
          </p>
        </div>
        
        {/* Opis stymulatorów */}
        <div 
          ref={descriptionRef}
          className={`bg-gold-50/50 rounded-xl shadow-md p-8 mb-16 transition-all duration-700 delay-100 ${
            isDescriptionVisible ? "opacity-100" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="max-w-3xl mx-auto">
            <p className="text-gray-700 mb-6">
              W moim gabinecie oferuję Państwu zabiegi z użyciem stymulatorów tkankowych –
              nowoczesnych preparatów, które pobudzają skórę do regeneracji, poprawiają jej gęstość,
              jędrność i nawilżenie. Ich celem nie jest chwilowy efekt, ale 
              <span className="font-semibold"> długotrwała poprawa jakości skóry</span>.
            </p>
            <p className="text-gray-700 mb-6">
              Stosuję <span className="font-semibold">wyłącznie certyfikowane wyroby medyczne</span> o sprawdzonym składzie i skuteczności.
            </p>
            <p className="text-gray-700">
              Zabiegi stymulujące to doskonały wybór dla osób, które oczekują naturalnych efektów
              odmłodzenia, bez sztucznego wyglądu i ingerencji w rysy twarzy.
            </p>
          </div>
        </div>
        
        {/* Rodzaje stymulatorów */}
        <div 
          ref={categoriesRef} 
          className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-700 delay-200 ${
            isCategoriesVisible ? "opacity-100" : "opacity-0 translate-y-10"
          }`}
        >
          {tissueStimulators.map((category, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl shadow-md p-8 border-l-4 transition-all duration-500 hover:shadow-lg ${
                index === 0 ? 'border-pink-400' : 'border-gold-400'
              }`}
              style={{ 
                transitionDelay: `${300 + index * 200}ms`,
                opacity: isCategoriesVisible ? 1 : 0,
                transform: isCategoriesVisible ? 'translateX(0)' : index === 0 ? 'translateX(-20px)' : 'translateX(20px)'
              }}
            >
              <h3 className="text-xl font-semibold mb-6">
                {category.category}
              </h3>
              
              <ul className="space-y-3">
                {category.items.map((item, i) => (
                  <li 
                    key={i} 
                    className="flex items-start"
                    style={{ 
                      transitionDelay: `${400 + (index * 200) + (i * 100)}ms`,
                      opacity: isCategoriesVisible ? 1 : 0,
                      transform: isCategoriesVisible ? 'translateY(0)' : 'translateY(10px)',
                      transition: 'all 0.5s ease'
                    }}
                  >
                    <ChevronRight className="text-gold-500 mr-2 h-5 w-5 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Efekty przed i po */}
        <div 
          ref={carouselRef} 
          className={`mt-16 transition-all duration-700 delay-300 ${
            isCarouselVisible ? "opacity-100" : "opacity-0 translate-y-10"
          }`}
        >
          <h3 className="text-2xl font-bold mb-8 font-playfair text-center">
            Porównanie efektów
          </h3>
          
          <div className="max-w-4xl mx-auto relative">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                <CarouselItem className="md:basis-1/2">
                  <div className="p-1">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                      <div className="p-6">
                        <h4 className="text-lg font-semibold mb-4 text-center">Przed zabiegiem</h4>
                        <img 
                          src="/lovable-uploads/28e228b7-3605-4c15-9731-3c72e9585d6b.png" 
                          alt="Przed zabiegiem" 
                          className="w-full h-64 object-cover rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2">
                  <div className="p-1">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                      <div className="p-6">
                        <h4 className="text-lg font-semibold mb-4 text-center">Po zabiegu</h4>
                        <img 
                          src="/lovable-uploads/4e36b405-2b0b-48e1-a707-234600f8a1c0.png" 
                          alt="Po zabiegu" 
                          className="w-full h-64 object-cover rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <div className="flex justify-center mt-8 gap-6">
                <CarouselPrevious 
                  className="position-static relative inset-auto transform-none left-0 h-10 w-10 border-gold-400 bg-white hover:bg-gold-50 text-gold-500" 
                  aria-label="Poprzednie zdjęcie"
                />
                <CarouselNext 
                  className="position-static relative inset-auto transform-none right-0 h-10 w-10 border-gold-400 bg-white hover:bg-gold-50 text-gold-500" 
                  aria-label="Następne zdjęcie"
                />
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TissueStimulatorSection;
