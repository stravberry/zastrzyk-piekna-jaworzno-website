
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-pink-500 to-pink-600 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/pattern-bg.png')] opacity-10"></div>
      
      <div className="container-custom relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair">
            Zadbaj o swoją urodę z profesjonalistką
          </h2>
          
          <p className="text-white/90 mb-8 text-lg">
            Zapraszam do gabinetu kosmetologii estetycznej Zastrzyk Piękna w Jaworznie, 
            gdzie przywrócę Twojej skórze blask i młody wygląd. Umów się już dziś!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-white text-pink-600 hover:bg-pink-50">
              <Link to="/kontakt">
                Umów wizytę
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="border-white text-white bg-gold-500 hover:bg-gold-600 hover:border-gold-400">
              <a href="https://instagram.com/zastrzyk_piekna" target="_blank" rel="noopener noreferrer">
                Odwiedź Instagram
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
