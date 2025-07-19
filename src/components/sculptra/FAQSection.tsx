
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      question: "Czym różni się Sculptra® od tradycyjnych wypełniaczy?",
      answer: "Sculptra® to biostymulator, nie wypełniacz. Zamiast dodawać objętość, stymuluje skórę do naturalnej produkcji kolagenu. Efekty pojawiają się stopniowo i trwają znacznie dłużej - nawet do 25 miesięcy, podczas gdy wypełniacze działają od 6 do 18 miesięcy."
    },
    {
      question: "Kto jest dobrym kandydatem na zabieg Sculptra®?",
      answer: "Sculptra® jest idealna dla osób powyżej 30. roku życia, które chcą naturalnie odmłodzić skórę i przywrócić jej jędrność. Szczególnie skuteczna u osób z utratą objętości twarzy, opadającymi policzkami i pierwszymi oznakami starzenia."
    },
    {
      question: "Czy zabieg jest bezpieczny?",
      answer: "Tak, Sculptra® ma doskonały profil bezpieczeństwa. Kwas L-polimlekowy jest biodegradowalny i od lat stosowany w medycynie. Preparat jest w pełni resorbowany przez organizm. Ewentualne skutki uboczne to przejściowy obrzęk lub niewielkie stwardnienia, które ustępują samoistnie."
    },
    {
      question: "Kiedy będą widoczne pierwsze efekty?",
      answer: "Sculptra® działa stopniowo. Pierwsze subtelne efekty można zauważyć po 4-6 tygodniach od pierwszego zabiegu. Pełne efekty rozwijają się przez 3-6 miesięcy po każdym zabiegu, gdy skóra produkuje nowy kolagen."
    },
    {
      question: "Ile kosztuje seria zabiegów Sculptra®?",
      answer: "Koszt zależy od indywidualnych potrzeb i liczby aplikowanych fiolek. Podczas konsultacji dokładnie omówimy plan zabiegowy i koszty. Pamiętaj, że inwestujesz w długotrwały efekt - nawet do 25 miesięcy pięknych rezultatów."
    },
    {
      question: "Czy mogę łączyć Sculptra® z innymi zabiegami?",
      answer: "Tak, Sculptra® doskonale łączy się z innymi zabiegami estetycznymi. Może być stosowana razem z kwasem hialuronowym, botoksem czy peelingami. Podczas konsultacji ustalimy optymalny plan zabiegowy dostosowany do Twoich potrzeb."
    },
    {
      question: "Jak przygotować się do zabiegu?",
      answer: "Przygotowanie jest proste: unikaj aspiryny i leków przeciwzakrzepowych na 7 dni przed zabiegiem, nie pij alkoholu 24h wcześniej. Skóra powinna być zdrowa, bez aktywnych stanów zapalnych. Wszystkie szczegóły omówimy podczas konsultacji."
    },
    {
      question: "Jak długo trwa rekonwalescencja?",
      answer: "Sculptra® ma minimalny czas przestoju. Możesz wrócić do normalnych aktivności od razu. Przez 2-3 dni może występować delikatny obrzęk. Przez 5 dni po zabiegu zalecamy masowanie miejsc aplikacji według instrukcji - to kluczowe dla optymalnych efektów."
    }
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 font-playfair">
            Najczęściej zadawane pytania
          </h2>
          <div className="w-24 h-1 bg-gold-400 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Wszystko co chcesz wiedzieć o Sculptra<sup>®</sup>
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold text-gray-800 hover:text-pink-600 transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed pt-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-pink-50 p-8 rounded-xl border border-pink-200 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-pink-800 mb-4">
              Masz więcej pytań?
            </h3>
            <p className="text-pink-700 mb-6">
              Umów bezpłatną konsultację, podczas której szczegółowo omówimy Twoje potrzeby i oczekiwania.
            </p>
            <div className="flex justify-center">
              <a
                href="https://instagram.com/zastrzyk_piekna"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Napisz do mnie
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
