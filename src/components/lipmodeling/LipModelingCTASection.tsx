
import React, { useRef } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

const locations = ["Jaworzno", "Katowice", "Myślowice", "Kraków", "Oświęcim", "Olkusz"];

const LipModelingCTASection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useScrollAnimation(sectionRef);
  const { trackEvent } = useAnalytics();
  
  const handleCTAClick = () => {
    trackEvent(
      "User Engagement", 
      "CTA Button Click", 
      "Lip Modeling Consultation", 
      1
    );
  };
  
  return (
    <section 
      ref={sectionRef} 
      className="py-16 bg-gradient-to-r from-pink-500 to-[#9b87f5] text-white"
      aria-labelledby="cta-title"
    >
      <div className="container-custom">
        <div 
          className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 
            id="cta-title" 
            className="text-3xl md:text-4xl font-bold mb-6 font-playfair"
          >
            Gotowa na piękne, naturalne usta?
          </h2>
          <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
            Umów się na konsultację w gabinecie w Jaworznie i poznaj możliwości modelowania ust 
            dostosowane do Twoich indywidualnych potrzeb.
          </p>
          
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {locations.map((location) => (
              <span 
                key={location}
                className="inline-block px-3 py-1 text-xs bg-white/20 rounded-full text-white"
                aria-label={`Obsługujemy miejscowość ${location}`}
              >
                {location}
              </span>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild 
              size="lg" 
              className={`bg-white text-pink-600 hover:bg-pink-50 hover:text-pink-700 transition-all duration-500 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
              style={{ transitionDelay: "300ms" }}
              onClick={handleCTAClick}
            >
              <Link to="/kontakt">
                Umów wizytę
                <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline"
              size="lg" 
              className={`border-white text-white hover:bg-white hover:text-pink-600 transition-all duration-500 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
              style={{ transitionDelay: "450ms" }}
            >
              <Link to="/cennik">
                Zobacz cennik
                <Phone className="ml-2 w-4 h-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          
          <p className="mt-6 text-sm text-white/80">
            Gabinet w Jaworznie obsługuje klientów z całego regionu: Katowice, Myślowice, Kraków, Oświęcim, Olkusz
          </p>
        </div>
      </div>
    </section>
  );
};

export default React.memo(LipModelingCTASection);
