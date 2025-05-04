
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PricingInfo: React.FC = () => {
  return (
    <>
      <div className="text-center mt-12 space-y-6">
        <p className="text-gray-600 max-w-2xl mx-auto">
          Ceny zabiegów mogą się różnić w zależności od obszaru zabiegowego i indywidualnych potrzeb.
          Szczegółowa wycena zostanie przedstawiona podczas konsultacji.
        </p>
        <Button asChild className="bg-pink-500 hover:bg-pink-600 text-white">
          <Link to="/kontakt">Umów konsultację</Link>
        </Button>
      </div>

      <section className="py-12 bg-pink-50">
        <div className="container-custom">
          <div className="bg-white p-6 rounded-lg shadow-md border border-pink-100 max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold mb-4 text-pink-500 font-playfair">
              Informacje dodatkowe
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">•</span>
                <span>Ceny zabiegów obejmują konsultację kosmetologiczną.</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">•</span>
                <span>Zalecane serie zabiegowe oraz odstępy między zabiegami ustalane są indywidualnie.</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">•</span>
                <span>Płatność możliwa gotówką lub kartą płatniczą.</span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">•</span>
                <span>W przypadku odwołania wizyty, prosimy o informację minimum 24 godziny przed planowanym terminem.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

export default PricingInfo;
