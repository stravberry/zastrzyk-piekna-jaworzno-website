
import React from "react";
import ServiceCard from "./ServiceCard";
import { Droplet, User, Heart, Syringe } from "lucide-react";

const ServicesSection = () => {
  const services = [
    {
      id: 1,
      title: "Terapie przeciwstarzeniowe",
      description: "Zaawansowane zabiegi anti-aging, które redukują oznaki starzenia i przywracają skórze młodzieńczy wygląd.",
      icon: <Droplet size={36} />,
      link: "/zabiegi/terapie-przeciwstarzeniowe",
    },
    {
      id: 2,
      title: "Modelowanie ust",
      description: "Precyzyjne zabiegi powiększania i konturowania ust z wykorzystaniem najwyższej jakości preparatów.",
      icon: <Heart size={36} />,
      link: "/zabiegi/modelowanie-ust",
    },
    {
      id: 3,
      title: "Makijaż permanentny brwi",
      description: "Idealnie dopasowany makijaż permanentny brwi, wykonany z najwyższą dbałością o naturalny efekt.",
      icon: <User size={36} />,
      link: "/zabiegi/makijaz-permanentny-brwi",
    },
    {
      id: 4,
      title: "Mezoterapia igłowa",
      description: "Zabieg polegający na dostarczaniu aktywnych składników w głąb skóry, poprawiający jej kondycję i wygląd.",
      icon: <Syringe size={36} />,
      link: "/zabiegi/mezoterapia-iglowa",
    },
    {
      id: 5,
      title: "Lipoliza iniekcyjna",
      description: "Zabieg redukcji lokalnej tkanki tłuszczowej, pomagający wymodelować wybrane partie ciała.",
      icon: <Syringe size={36} />,
      link: "/zabiegi/lipoliza-iniekcyjna",
    },
    {
      id: 6,
      title: "Peelingi chemiczne",
      description: "Głęboka regeneracja skóry przy pomocy kwasów, poprawiająca jej strukturę i niwelująca niedoskonałości.",
      icon: <Droplet size={36} />,
      link: "/zabiegi/peelingi-chemiczne",
    },
  ];

  return (
    <section className="section-padding bg-pink-50/50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
            <span className="text-pink-500">Nasze </span>
            <span>Zabiegi</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Oferujemy szeroki zakres profesjonalnych zabiegów kosmetologicznych,
            dostosowanych do indywidualnych potrzeb każdego klienta.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              description={service.description}
              icon={service.icon}
              link={service.link}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
