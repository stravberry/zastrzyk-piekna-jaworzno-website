
import React from "react";

const IntroSection = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 font-playfair">
              Sculptra<sup className="text-pink-500">®</sup> – Biostymulator Nowej Generacji
            </h2>
            <div className="w-24 h-1 bg-gold-400 mx-auto mb-8"></div>
          </div>
          
          <div className="space-y-8 text-lg text-gray-700 leading-relaxed">
            <p className="text-xl font-medium text-center text-gray-800">
              Sculptra<sup>®</sup> to innowacyjny biostymulator tkankowy nowej generacji, oparty na kwasie L-polimlekowym (PLLA) – substancji o potwierdzonej skuteczności i bezpieczeństwie klinicznym.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-800 font-playfair">
                  Jak działa Sculptra<sup>®</sup>?
                </h3>
                <p>
                  Opracowany przez renomowaną firmę <strong>Galderma</strong>, preparat ten działa głęboko w skórze, pobudzając naturalne procesy regeneracyjne, w tym przede wszystkim syntezę nowego <strong>kolagenu typu I</strong>, kluczowego dla jędrności i sprężystości skóry.
                </p>
                <div className="bg-pink-50 p-6 rounded-lg border-l-4 border-pink-500">
                  <p className="font-medium text-pink-800">
                    Sculptra<sup>®</sup> nie jest wypełniaczem – to inteligentny stymulator, który uczy Twoją skórę, jak być młodą.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-800 font-playfair">
                  Potwierdzona skuteczność
                </h3>
                <p>
                  Sculptra<sup>®</sup> to produkt z <strong>ponad 20-letnim doświadczeniem</strong> na rynku medycyny estetycznej, rekomendowany przez specjalistów na całym świecie.
                </p>
                <div className="bg-gold-50 p-6 rounded-lg border-l-4 border-gold-500">
                  <p className="font-medium text-gold-800">
                    Liczne badania kliniczne potwierdzają skuteczność zarówno w zakresie odbudowy objętości, jak i jakości skóry.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
