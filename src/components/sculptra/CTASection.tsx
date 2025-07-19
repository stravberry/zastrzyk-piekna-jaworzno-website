
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Phone, Instagram, MapPin } from "lucide-react";

const CTASection = () => {
  return (
    <section className="section-padding bg-gradient-to-r from-pink-500 to-pink-600 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/pattern-bg.png')] opacity-10"></div>
      
      <div className="container-custom relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair">
            Rozpocznij swoją podróż do młodości z Sculptra<sup>®</sup>
          </h2>
          
          <p className="text-white/90 mb-8 text-lg leading-relaxed">
            Sculptra<sup>®</sup> to inwestycja w długotrwałe piękno. Umów bezpłatną konsultację 
            i sprawdź, jak biostymulator nowej generacji może odmłodzić Twoją skórę na lata.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <div className="text-2xl font-bold mb-2">25</div>
              <div className="text-white/90">miesięcy efektów</div>
            </div>
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <div className="text-2xl font-bold mb-2">20+</div>
              <div className="text-white/90">lat na rynku</div>
            </div>
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <div className="text-2xl font-bold mb-2">100%</div>
              <div className="text-white/90">naturalne efekty</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="bg-white text-pink-600 hover:bg-pink-50">
              <Link to="/kontakt">
                <Phone className="w-4 h-4 mr-2" />
                Umów konsultację
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="border-white text-white bg-transparent hover:bg-white/10">
              <a href="https://instagram.com/zastrzyk_piekna" target="_blank" rel="noopener noreferrer">
                <Instagram className="w-4 h-4 mr-2" />
                Zobacz efekty na Instagram
              </a>
            </Button>
          </div>
          
          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Jaworzno, ul. Przykładowa 123</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+48 123 456 789</span>
              </div>
            </div>
            
            <p className="text-white/80 text-sm mt-6 max-w-2xl mx-auto">
              Sculptra<sup>®</sup> to preparat medyczny dostępny wyłącznie w gabinetach medycyny estetycznej. 
              Zabieg powinien być wykonywany przez wykwalifikowanego specjalistę.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
