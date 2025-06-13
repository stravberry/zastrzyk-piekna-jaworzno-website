
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

const ServiceCard = ({ title, description, icon, link }: ServiceCardProps) => {
  // Jeśli tytuł to "Peelingi chemiczne", używamy nowego linku
  const displayTitle = title === "Peelingi chemiczne" ? "POZOSTAŁE ZABIEGI" : title;
  
  // Mapowanie linków na prawidłowe ścieżki
  let targetLink = link;
  
  if (title === "Peelingi chemiczne") {
    targetLink = "/cennik";
  } else if (title === "Terapie przeciwstarzeniowe") {
    targetLink = "/zabiegi/terapie-przeciwstarzeniowe";
  } else if (title === "Modelowanie ust") {
    targetLink = "/zabiegi/modelowanie-ust";
  } else if (title === "Makijaż permanentny brwi") {
    targetLink = "/uslugi";
  } else if (title === "Mezoterapia igłowa") {
    targetLink = "/uslugi";
  } else if (title === "Lipoliza iniekcyjna") {
    targetLink = "/uslugi";
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-pink-50 h-full flex flex-col">
      <div className="mb-4 text-pink-500">{icon}</div>
      <h3 className="text-xl font-semibold mb-3 font-playfair">{displayTitle}</h3>
      <p className="text-gray-600 mb-4 flex-1">{description}</p>
      <Link
        to={targetLink}
        className="inline-flex items-center text-pink-500 font-medium hover:text-pink-600 transition-colors group mt-auto"
      >
        {title === "Peelingi chemiczne" ? "Zobacz cennik" : "Dowiedz się więcej"}
        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
};

export default ServiceCard;
