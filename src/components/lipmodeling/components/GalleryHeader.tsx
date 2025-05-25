
import React from "react";

interface GalleryHeaderProps {
  isVisible: boolean;
}

const GalleryHeader: React.FC<GalleryHeaderProps> = ({ isVisible }) => {
  return (
    <div 
      className={`text-center mb-12 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair">
        <span className="text-pink-500">Galeria </span>
        <span>efektów</span>
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Zobacz efekty moich zabiegów modelowania ust. Każdy przypadek jest unikalny 
        i dostosowany do indywidualnych potrzeb klienta.
      </p>
    </div>
  );
};

export default GalleryHeader;
