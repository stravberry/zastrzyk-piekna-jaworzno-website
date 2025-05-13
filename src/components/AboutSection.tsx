
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
const AboutSection = () => {
  return <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair">
              <span className="text-pink-500">O mnie </span>
              <span>- Anna Gajęcka</span>
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Nazywam się Anna Gajęcka, jestem absolwentką Uniwersytetu Śląskiego, magistrem kosmetologii,
              studentką pielęgniarstwa, właścicielką gabinetu kosmetologii Zastrzyk_piekna,
              laureatką konkursu na Kosmetologa Roku województwa śląskiego oraz niezaprzeczalną pasjonatką zawodu.
            </p>

            <div className="mb-6 bg-pink-50/50 p-4 rounded-lg border-l-4 border-pink-500">
              <p className="text-gray-700 italic">
                "Branża beauty to ocean niekończących się możliwości. Motywuje mnie to do ciągłego podnoszenia 
                kwalifikacji i umiejętności oraz pozyskiwania wiedzy w zakresie rozwijającej się 
                medycyny estetycznej i kosmetologii."
              </p>
            </div>

            <p className="text-gray-600 mb-8">
              Moją specjalnością są terapie przeciwstarzeniowe, modelowanie ust oraz makijaż permanentny brwi.
              Holistyczne podejście to klucz to wspaniałego wyglądu i samopoczucia i takie podejście promuje 
              na swoich mediach społecznościowych.
            </p>

            <Button asChild className="bg-pink-500 hover:bg-pink-600 text-white">
              <Link to="/about">Poznaj mnie lepiej</Link>
            </Button>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img alt="Anna Gajęcka - Kosmetolog" className="w-full h-auto object-cover" src="/lovable-uploads/2e819def-450f-472d-bf96-82773e78b080.jpg" />
            </div>
            <div className="absolute -bottom-5 -right-5 bg-white p-4 rounded-lg shadow-lg border border-pink-100">
              <span className="text-xl font-semibold text-gold-500 font-playfair">
                Kosmetolog Roku
              </span>
              <span className="block text-sm text-gray-600">województwo śląskie</span>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default AboutSection;
