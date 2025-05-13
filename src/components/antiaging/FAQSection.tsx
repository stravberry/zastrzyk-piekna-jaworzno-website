
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection: React.FC = () => {
  return (
    <section className="py-16 bg-pink-50/30">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
            <span className="text-pink-500">Często zadawane </span>
            <span className="text-gray-800">pytania</span>
          </h2>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                Czy zabiegi autologiczne są bolesne?
              </AccordionTrigger>
              <AccordionContent>
                Komfort podczas zabiegu jest dla mnie priorytetem. Procedura pobierania krwi jest 
                minimalne bolesna, a sama aplikacja preparatu poprzedzona jest nałożeniem kremu 
                znieczulającego. Większość pacjentów ocenia dyskomfort jako minimalny lub umiarkowany.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>
                Jak długo utrzymują się efekty zabiegów?
              </AccordionTrigger>
              <AccordionContent>
                Efekty zabiegów autologicznych rozwijają się stopniowo i mogą utrzymywać się od 6 
                do nawet 18 miesięcy, w zależności od indywidualnych cech pacjenta i zastosowanej 
                metody. Z kolei stymulatory tkankowe mogą działać nawet do 24 miesięcy.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>
                Ile zabiegów potrzeba do osiągnięcia zadowalających efektów?
              </AccordionTrigger>
              <AccordionContent>
                Zazwyczaj zalecam serię 2-4 zabiegów w odstępach 4-6 tygodni, aby osiągnąć 
                optymalny efekt. Po zakończeniu serii zabiegowej wykonujemy zabiegi podtrzymujące 
                co 6-12 miesięcy.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>
                Czy są przeciwwskazania do terapii przeciwstarzeniowych?
              </AccordionTrigger>
              <AccordionContent>
                Tak, istnieją przeciwwskazania do wykonywania tego typu zabiegów. Należą do nich m.in.: 
                ciąża i karmienie piersią, choroby autoimmunologiczne w fazie zaostrzenia, choroby 
                nowotworowe, aktywne infekcje w miejscu podania, tendencja do tworzenia bliznowców 
                i inne. Przed zabiegiem przeprowadzam dokładny wywiad medyczny.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger>
                W jakim wieku warto zacząć terapie przeciwstarzeniowe?
              </AccordionTrigger>
              <AccordionContent>
                Nie ma jednego uniwersalnego wieku, w którym należy rozpocząć zabiegi. Zazwyczaj 
                pierwsze oznaki starzenia pojawiają się około 25-30 roku życia, więc jest to dobry moment, 
                aby zacząć profilaktykę. Jednak kluczowe jest indywidualne podejście – oceniam stan skóry 
                i dostosowuję terapię do potrzeb konkretnej osoby.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
