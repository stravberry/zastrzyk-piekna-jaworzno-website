
import React from "react";
import ServiceCard from "./ServiceCard";
import { Droplet, User, Heart, Syringe } from "lucide-react";

const ServicesSection = () => {
  const services = [{
    id: 1,
    title: "Terapie przeciwstarzeniowe",
    description: "Zaawansowane zabiegi oparte na pobudzaniu istniejących fibroblastów do intensywniejszej produkcji kolagenu oraz zabiegi zwiększające liczbę fibroblastów (rozmnażanie/napływ)",
    icon: <Droplet size={36} />,
    link: "/zabiegi/terapie-przeciwstarzeniowe"
  }, {
    id: 2,
    title: "Modelowanie ust",
    description: "to nie tylko zabieg powiększenia ust, to precyzyjne, indywidualne dopasowanie kształtu oraz ich wielkości. Praca oparta nie na wyuczonych schematach, a oparta na wieloletnim doświadczeniu oraz jednostkowym podejściu do klienta",
    icon: <Heart size={36} />,
    link: "/zabiegi/modelowanie-ust"
  }, {
    id: 3,
    title: "Makijaż permanentny brwi",
    description: "intensywne, ale lekko wykończone brwi permanentne bez wyraźnych konturów z uniesioną końcówka dla efektu otwartego i wypoczętego spojrzenia - to moja wypracowana latami technika",
    icon: <User size={36} />,
    link: "/zabiegi/makijaz-permanentny-brwi"
  }, {
    id: 4,
    title: "Mezoterapia igłowa",
    description: "niekwestionowana królowa technik dostarczania składników odżywczych w głąb skóry. Często mylona z konkretnym zabiegiem, tymczasem jest to metoda, a nie zabieg. Nie wszystkie preparaty można podać ta techniką, dobór koktajlu możliwy jest po ustaleniu oczekiwanych rezultatów",
    icon: <Syringe size={36} />,
    link: "/zabiegi/mezoterapia-iglowa"
  }, {
    id: 5,
    title: "Lipoliza iniekcyjna",
    description: "zabieg pozwalający na redukcję lokalnie nagromadzonej tkanki tłuszczowej, zwłaszcza w okolicy twarzy",
    icon: <Syringe size={36} />,
    link: "/zabiegi/lipoliza-iniekcyjna"
  }, {
    id: 6,
    title: "Peelingi chemiczne",
    description: "Głęboka regeneracja skóry przy pomocy kwasów, poprawiająca jej strukturę i niwelująca niedoskonałości.",
    icon: <Droplet size={36} />,
    link: "/zabiegi/peelingi-chemiczne"
  }];
  return <section className="section-padding bg-pink-50/50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
            <span className="text-pink-500">OFERTA </span>
            <span>ZABIEGOWA</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Oferuje szeroki wachlarz zabiegów o działaniu przeciwstarzeniowym.

 Do każdego przypadku podchodzę holistyczne, a terapie zabiegowe tworzę indywidualnie w oparciu o dogłębny wywiad, aktualna wiedze oraz najnowocześniejsze rozwiązania</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => <ServiceCard key={service.id} title={service.title} description={service.description} icon={service.icon} link={service.link} />)}
        </div>
      </div>
    </section>;
};
export default ServicesSection;
