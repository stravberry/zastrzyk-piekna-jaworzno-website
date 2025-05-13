
import React, { useRef, useEffect } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { trackEvent } from "@/services/analyticService";

const faqs = [
  {
    question: "Czy zabiegi przeciwstarzeniowe są bolesne?",
    answer: "Większość zabiegów przeciwstarzeniowych w naszym gabinecie w Jaworznie wykonujemy z zastosowaniem kremów znieczulających lub odpowiedniego przygotowania skóry, co minimalizuje dyskomfort. Poziom odczuwanego bólu jest bardzo indywidualny, jednak pacjenci zazwyczaj określają go jako nieznaczny lub umiarkowany."
  },
  {
    question: "Jak szybko będą widoczne efekty zabiegów?",
    answer: "Pierwsze efekty widoczne są zazwyczaj bezpośrednio po zabiegu w postaci lepszego napięcia i nawilżenia skóry. Pełne rezultaty pojawiają się po kilku tygodniach od zabiegu, gdy skóra zdąży wyprodukować nowe włókna kolagenowe. W naszym gabinecie w Jaworznie oferujemy pełne monitorowanie postępów terapii."
  },
  {
    question: "Jak długo utrzymują się efekty zabiegów przeciwstarzeniowych?",
    answer: "Efekty zabiegów przeciwstarzeniowych utrzymują się średnio od 6 do 18 miesięcy, w zależności od zastosowanej metody, indywidualnych predyspozycji pacjenta oraz dbałości o skórę po zabiegu. Dla podtrzymania efektów zalecamy regularne zabiegi podtrzymujące, które dobieramy indywidualnie dla mieszkańców Jaworzna i okolicznych miast."
  },
  {
    question: "Czy zabiegi mają okres rekonwalescencji?",
    answer: "Czas rekonwalescencji zależy od typu zabiegu. Zabiegi małoinwazyjne jak mezoterapia igłowa wymagają 1-2 dni, podczas których mogą występować zaczerwienienia czy obrzęki. W przypadku intensywniejszych zabiegów regeneracja może trwać kilka dni. Zapewniamy pełne wsparcie w okresie rekonwalescencji dla pacjentów z Jaworzna, Katowic, Myślowic i innych pobliskich miejscowości."
  },
  {
    question: "Czy można łączyć różne terapie przeciwstarzeniowe?",
    answer: "Tak, w naszym gabinecie w Jaworznie często stosujemy terapie łączone, co przynosi lepsze i trwalsze efekty. Odpowiednio dobrana sekwencja zabiegów pozwala na kompleksowe rozwiązanie problemów skórnych. Oferujemy indywidualnie dobrane plany zabiegowe dla mieszkańców całego regionu śląskiego oraz Małopolski."
  },
  {
    question: "Od jakiego wieku można stosować terapie przeciwstarzeniowe?",
    answer: "Zabiegi profilaktyczne można rozpocząć już od 25-30 roku życia. W przypadku wyraźnych oznak starzenia, zabiegi można wykonywać niezależnie od wieku, po konsultacji w naszym gabinecie. Zapraszamy pacjentów z Jaworzna, Katowic, Krakowa, Olkusza i innych okolicznych miejscowości na bezpłatną konsultację."
  },
  {
    question: "Czy dojazd do gabinetu w Jaworznie z okolicznych miejscowości jest dogodny?",
    answer: "Nasz gabinet w Jaworznie posiada bardzo dobrą lokalizację z łatwym dojazdem zarówno z centrum miasta, jak i z okolicznych miejscowości. Z Katowic czy Mysłowic dojazd zajmuje około 20-30 minut, z Krakowa około 45 minut, a z Oświęcimia czy Olkusza około 30 minut. Przy gabinecie znajduje się wygodny parking dla naszych klientów."
  }
];

const FAQSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useScrollAnimation(sectionRef);
  
  // Track FAQ interactions
  const handleAccordionChange = (value: string) => {
    trackEvent(
      'User Interaction',
      'FAQ Expanded',
      value,
    );
  };
  
  // Track section visibility
  useEffect(() => {
    if (isVisible) {
      trackEvent('Section Visibility', 'FAQ Section Viewed', 'Terapie Przeciwstarzeniowe');
    }
  }, [isVisible]);
  
  return (
    <section
      ref={sectionRef}
      className="py-16 bg-gray-50"
      aria-labelledby="faq-heading"
    >
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2
            id="faq-heading"
            className={`text-3xl md:text-4xl font-bold mb-4 font-playfair transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Najczęściej zadawane pytania
          </h2>
          <p 
            className={`text-gray-600 max-w-2xl mx-auto transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Odpowiedzi na najczęstsze pytania dotyczące terapii przeciwstarzeniowych w naszym gabinecie w Jaworznie oraz regionie śląskim
          </p>
        </div>

        <div 
          className={`max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <Accordion 
            type="single" 
            collapsible 
            className="w-full" 
            onValueChange={handleAccordionChange}
          >
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger
                  className="text-left text-lg font-medium"
                  data-question-id={index}
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
                  {faq.answer}
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
