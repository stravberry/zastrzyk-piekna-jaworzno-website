
import React from "react";
import { Button } from "@/components/ui/button";

interface GalleryCTAProps {
  isVisible: boolean;
}

const GalleryCTA: React.FC<GalleryCTAProps> = ({ isVisible }) => {
  return (
    <div 
      className={`text-center mt-12 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: "900ms" }}
    >
      <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
        Każdy zabieg jest przeprowadzany z najwyższą starannością i dostosowany do indywidualnych potrzeb klienta. 
        Efekty są widoczne natychmiast i trwają od 8 do 18 miesięcy.
      </p>
      <Button asChild className="bg-pink-500 hover:bg-pink-600 text-white">
        <a href="/kontakt">Umów wizytę</a>
      </Button>
    </div>
  );
};

export default GalleryCTA;
