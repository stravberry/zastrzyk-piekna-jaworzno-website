
import React, { useRef } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// FAQ items for better maintainability
const faqItems = [
  {
    id: "item-1",
    question: "Czy zabiegi autologiczne są bolesne?",
    answer: "Komfort podczas zabiegu jest dla mnie priorytetem. Procedura pobierania krwi jest minimalne bolesna, a sama aplikacja preparatu poprzedzona jest nałożeniem kremu znieczulającego. Większość pacjentów ocenia dyskomfort jako minimalny lub umiarkowany."
  },
  {
    id: "item-2",
    question: "Jak długo utrzymują się efekty zabiegów?",
    answer: "Efekty zabiegów autologicznych rozwijają się stopniowo i mogą utrzymywać się od 6 do nawet 18 miesięcy, w zależności od indywidualnych cech pacjenta i zastosowanej metody. Z kolei stymulatory tkankowe mogą działać nawet do 24 miesięcy."
  },
  {
    id: "item-3",
    question: "Ile zabiegów potrzeba do osiągnięcia zadowalających efektów?",
    answer: "Zazwyczaj zalecam serię 2-4 zabiegów w odstępach 4-6 tygodni, aby osiągnąć optymalny efekt. Po zakończeniu serii zabiegowej wykonujemy zabiegi podtrzymujące co 6-12 miesięcy."
  },
  {
    id: "item-4",
    question: "Czy są przeciwwskazania do terapii przeciwstarzeniowych?",
    answer: "Tak, istnieją przeciwwskazania do wykonywania tego typu zabiegów. Należą do nich m.in.: ciąża i karmienie piersią, choroby autoimmunologiczne w fazie zaostrzenia, choroby nowotworowe, aktywne infekcje w miejscu podania, tendencja do tworzenia bliznowców i inne. Przed zabiegiem przeprowadzam dokładny wywiad medyczny."
  },
  {
    id: "item-5",
    question: "W jakim wieku warto zacząć terapie przeciwstarzeniowe?",
    answer: "Nie ma jednego uniwersalnego wieku, w którym należy rozpocząć zabiegi. Zazwyczaj pierwsze oznaki starzenia pojawiają się około 25-30 roku życia, więc jest to dobry moment, aby zacząć profilaktykę. Jednak kluczowe jest indywidualne podejście – oceniam stan skóry i dostosowuję terapię do potrzeb konkretnej osoby."
  }
];

const FAQSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useScrollAnimation(sectionRef);

  const accordionRef = useRef<HTMLDivElement>(null);
  const isAccordionVisible = useScrollAnimation(accordionRef, { threshold: 0.1 });
  
  return (
    <section 
      ref={sectionRef} 
      className="py-16 bg-pink-50/30" 
      aria-labelledby="faq-title"
    >
      <div className="container-custom">
        <div 
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 id="faq-title" className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
            <span className="text-pink-500">Często zadawane </span>
            <span className="text-gray-800">pytania</span>
          </h2>
        </div>
        
        <div 
          ref={accordionRef}
          className={`max-w-3xl mx-auto transition-all duration-700 delay-200 ${
            isAccordionVisible ? "opacity-100" : "opacity-0 translate-y-10"
          }`}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
              <AccordionItem 
                key={item.id}
                value={item.id} 
                className="transition-all duration-300 data-[state=open]:bg-white/60 rounded-lg mb-2"
              >
                <AccordionTrigger className="px-4 rounded-lg hover:bg-white/30 transition-colors">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default React.memo(FAQSection);
