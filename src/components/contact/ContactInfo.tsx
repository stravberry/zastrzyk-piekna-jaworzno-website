
import React from "react";
import { MapPin, Phone, Mail, Instagram, Clock } from "lucide-react";

const ContactInfo = () => {
  return (
    <div className="bg-pink-50/50 p-8 rounded-lg h-full">
      <h2 className="text-2xl font-bold mb-6 font-playfair">
        Informacje kontaktowe
      </h2>

      <div className="space-y-6">
        <div className="flex items-start">
          <MapPin className="text-pink-500 w-5 h-5 mt-1 mr-4 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Adres</h3>
            <p className="text-gray-600">Grunwaldzka 106</p>
            <p className="text-gray-600">43-600 Jaworzno</p>
            <p className="text-gray-600">woj. śląskie</p>
          </div>
        </div>

        <div className="flex items-start">
          <Phone className="text-pink-500 w-5 h-5 mt-1 mr-4 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Telefon</h3>
            <a href="tel:514902242" className="text-gray-600 hover:text-pink-500 transition-colors">
              514 902 242
            </a>
          </div>
        </div>

        <div className="flex items-start">
          <Mail className="text-pink-500 w-5 h-5 mt-1 mr-4 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
            <a href="mailto:zastrzykpiekna.kontakt@gmail.com" className="text-gray-600 hover:text-pink-500 transition-colors">
              zastrzykpiekna.kontakt@gmail.com
            </a>
          </div>
        </div>

        <div className="flex items-start">
          <Instagram className="text-pink-500 w-5 h-5 mt-1 mr-4 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Instagram</h3>
            <a href="https://instagram.com/zastrzyk_piekna" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-500 transition-colors">
              @zastrzyk_piekna
            </a>
          </div>
        </div>

        <div className="flex items-start">
          <Clock className="text-pink-500 w-5 h-5 mt-1 mr-4 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Godziny otwarcia</h3>
            <p className="text-gray-600">Czynne całą dobę</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
