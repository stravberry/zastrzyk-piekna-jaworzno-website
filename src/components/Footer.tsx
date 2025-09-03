import React from "react";
import { Link } from "react-router-dom";
import LogoWithFallback from "@/components/ui/LogoWithFallback";
import { Instagram, MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <LogoWithFallback
                className="h-16 mb-2"
                sizes="64px"
                priority={true}
              />
            </div>
            <p className="text-gray-600 text-sm">
              Gabinet kosmetologii estetycznej prowadzony przez Annę Gajęcką, 
              magistra kosmetologii, laureatkę konkursu na Kosmetologa Roku 
              województwa śląskiego.
            </p>
            <div className="flex items-center space-x-3">
              <a 
                href="https://instagram.com/zastrzyk_piekna"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-500 hover:text-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold font-playfair">Mapa Strony</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  Strona Główna
                </Link>
              </li>
              <li>
                <Link to="/o-mnie" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  O Mnie
                </Link>
              </li>
              <li>
                <Link to="/zabiegi" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  Zabiegi
                </Link>
              </li>
              <li>
                <Link to="/cennik" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  Cennik
                </Link>
              </li>
              <li>
                <Link to="/galeria" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  Galeria
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/kontakt" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold font-playfair">Zabiegi</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/zabiegi/terapie-przeciwstarzeniowe" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  Terapie przeciwstarzeniowe
                </Link>
              </li>
              <li>
                <Link to="/zabiegi/modelowanie-ust" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  Modelowanie ust
                </Link>
              </li>
              <li>
                <Link to="/zabiegi/makijaz-permanentny-brwi" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  Makijaż permanentny brwi
                </Link>
              </li>
              <li>
                <Link to="/zabiegi/mezoterapia-iglowa" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  Mezoterapia igłowa
                </Link>
              </li>
              <li>
                <Link to="/zabiegi/lipoliza-iniekcyjna" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  Lipoliza iniekcyjna
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold font-playfair">Kontakt</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-pink-500 mt-1 flex-shrink-0" />
                <span className="text-gray-600 text-sm">
                  Grunwaldzka 106, 43-600 Jaworzno
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-pink-500 flex-shrink-0" />
                <a href="tel:514902242" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  514 902 242
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-pink-500 flex-shrink-0" />
                <a href="mailto:zastrzykpiekna.kontakt@gmail.com" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  zastrzykpiekna.kontakt@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} Gabinet Kosmetologii Estetycznej Zastrzyk Piękna. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
