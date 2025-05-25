
import React, { useRef } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqData = [
  {
    question: "Czy zabieg modelowania ust jest bolesny?",
    answer: "Zabieg jest praktycznie bezbolesny. Używam preparatów z lidokainą, która miejscowo znieczula obszar. Większość klientów odczuwa jedynie delikatny ucisk podczas wstrzykiwania."
  },
  {
    question: "Jak długo utrzymuje się efekt?",
    answer: "Efekt modelowania ust utrzymuje się od 8 do 18 miesięcy, w zależności od rodzaju użytego preparatu, indywidualnych cech organizmu i stylu życia. Kwas hialuronowy jest naturalnie wchłaniany przez organizm."
  },
  {
    question: "Czy mogę wrócić do normalnych czynności po zabiegu?",
    answer: "Tak, można wrócić do normalnych czynności praktycznie od razu. Zalecam jednak unikanie intensywnego wysiłku fizycznego, sauny i gorących napojów przez pierwsze 24 godziny."
  },
  {
    question: "Jakie mogą wystąpić objawy po zabiegu?",
    answer: "Normalne objawy to delikatne opuchnięcie i ewentualne niewielkie siniaki, które ustępują w ciągu 2-7 dni. Mogą też wystąpić drobne asymetrie, które wyrównują się po opadnięciu opuchlizny."
  },
  {
    question: "Ile kosztuje zabieg modelowania ust?",
    answer: "Koszt zależy od ilości użytego preparatu i stopnia korekty. Ceny zaczynają się od 700 zł za 1ml kwasu hialuronowego. Podczas konsultacji ustalamy dokładny koszt dostosowany do Twoich potrzeb."
  },
  {
    question: "Czy zabieg można cofnąć?",
    answer: "Tak, efekty zabiegu można cofnąć w razie potrzeby za pomocą hialuronidazy - enzymu, który rozpuszcza kwas hialuronowy. To jeden z głównych atutów tej metody modelowania ust."
  },
  {
    question: "Kiedy widać końcowy efekt?",
    answer: "Wstępny efekt widać od razu, ale końcowy rezultat oceniamy po 2 tygodniach, gdy opuchlizna całkowicie opadnie i preparat się ustabilizuje w tkankach."
  },
  {
    question: "Czy mogę robić makijaż po zabiegu?",
    answer: "Makijaż ust zalecam unikać przez pierwsze 24 godziny. Makijaż twarzy można wykonać normalnie, unikając jedynie obszaru ust."
  }
];

const LipModelingFAQSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useScrollAnimation(sectionRef);

  return (
    <section ref={sectionRef} className="py-16 bg-pink-50/30">
      <div className="container-custom">
        <div 
          className={`text-center mb-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair">
            <span>Najczęściej zadawane </span>
            <span className="text-pink-500">pytania</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Odpowiedzi na najważniejsze pytania dotyczące modelowania ust
          </p>
        </div>

        <div 
          className={`max-w-4xl mx-auto transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "300ms" }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqData.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white rounded-lg border-0 shadow-sm px-6"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6">
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

export default React.memo(LipModelingFAQSection);
