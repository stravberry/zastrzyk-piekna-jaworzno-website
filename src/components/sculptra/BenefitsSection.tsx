
import React from "react";
import { Clock, Shield, Sparkles, Award } from "lucide-react";

const BenefitsSection = () => {
  const benefits = [
    {
      icon: Clock,
      title: "Długofalowy efekt odmłodzenia",
      description: "W przeciwieństwie do wielu dostępnych na rynku biostymulatorów, Sculptra® nie działa jedynie powierzchniowo. Jej unikalna formuła inicjuje procesy przebudowy skóry od wewnątrz – stymuluje fibroblasty do produkcji kolagenu, co prowadzi do naturalnej odbudowy struktury skóry.",
      highlight: "Efekty nawet do 25 miesięcy"
    },
    {
      icon: Shield,
      title: "Bezpieczna i biokompatybilna technologia",
      description: "Kwas L-polimlekowy jest biodegradowalnym związkiem od lat stosowanym w medycynie, m.in. w chirurgii i ortopedii. Organizm rozpoznaje go jako substancję naturalną, co przekłada się na wysoki profil bezpieczeństwa.",
      highlight: "Minimalne ryzyko reakcji niepożądanych"
    },
    {
      icon: Sparkles,
      title: "Precyzyjna stymulacja bez nadmiernej objętości",
      description: "Sculptra® to nie wypełniacz – jej celem nie jest chwilowe 'zamaskowanie' problemu, ale pobudzenie skóry do samodzielnej regeneracji. Efektem jest subtelne, ale zauważalne ujędrnienie, poprawa gęstości skóry i odbudowa wolumetrii twarzy.",
      highlight: "Naturalny efekt bez 'przepełnienia'"
    },
    {
      icon: Award,
      title: "Udokumentowana skuteczność kliniczna",
      description: "Sculptra® posiada liczne badania potwierdzające jej skuteczność – zarówno w zakresie odbudowy objętości, jak i jakości skóry. To produkt z ponad 20-letnim doświadczeniem na rynku medycyny estetycznej.",
      highlight: "Rekomendowany przez specjalistów na całym świecie"
    }
  ];

  return (
    <section className="section-padding bg-gradient-to-b from-gray-50 to-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 font-playfair">
            Czym wyróżnia się Sculptra<sup className="text-pink-500">®</sup>?
          </h2>
          <div className="w-24 h-1 bg-gold-400 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sculptra<sup>®</sup> to przełom w medycynie estetycznej – biostymulator, który działa inteligentnie i długotrwale
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-pink-600" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 font-playfair">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                  <div className="bg-gold-50 p-4 rounded-lg border-l-4 border-gold-400">
                    <p className="font-medium text-gold-800 text-sm">
                      ✨ {benefit.highlight}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
