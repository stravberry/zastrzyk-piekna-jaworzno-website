
import React from "react";

const PricingHero: React.FC = () => {
  return (
    <section className="bg-pink-50 py-16">
      <div className="container-custom text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 font-playfair">
          <span className="text-pink-500">Cennik </span>
          <span>Zabiegów</span>
        </h1>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Zapoznaj się z cennikiem zabiegów kosmetologicznych w gabinecie kosmetologicznym w Jaworznie.
          Zabiegi wykonywane są z najwyższej jakości certyfikowanych produktów.
        </p>
      </div>
    </section>
  );
};

export default PricingHero;
