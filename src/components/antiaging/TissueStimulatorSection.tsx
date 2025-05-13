
import React from "react";
import { ChevronRight } from "lucide-react";
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
  return (
    <section ref={stimulatorsRef} className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
            <span className="text-gold-500">Stymulatory </span>
            <span className="text-gray-800">tkankowe</span>
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Nowoczesne preparaty pobudzające skórę do naturalnej regeneracji
          </p>
        </div>
        
        {/* Opis stymulatorów */}
        <div className="bg-gold-50/50 rounded-xl shadow-md p-8 mb-16">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tissueStimulators.map((category, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl shadow-md p-8 border-l-4 ${
                index === 0 ? 'border-pink-400' : 'border-gold-400'
              }`}
            >
              <h3 className="text-xl font-semibold mb-6">
                {category.category}
              </h3>
              
              <ul className="space-y-3">
                {category.items.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <ChevronRight className="text-gold-500 mr-2 h-5 w-5 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Efekty przed i po */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold mb-8 font-playfair text-center">
            Porównanie efektów
          </h3>
          
          <div className="max-w-4xl mx-auto">
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
              <div className="flex justify-center mt-4">
                <CarouselPrevious className="relative inset-auto left-auto -right-40" />
                <CarouselNext className="relative inset-auto right-auto -left-40" />
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TissueStimulatorSection;
