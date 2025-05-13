
import React, { useRef } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/services/analyticService";

const locations = ["Jaworzno", "Katowice", "Myślowice", "Kraków", "Oświęcim", "Olkusz"];

const CTASection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useScrollAnimation(sectionRef);
  
  // Track CTA visibility and interactions
  React.useEffect(() => {
    if (isVisible) {
      trackEvent("Section Visibility", "CTA Section Viewed", "Anti-Aging Therapies");
    }
  }, [isVisible]);
  
  // Handle CTA click with tracking
  const handleCTAClick = () => {
    trackEvent(
      "User Engagement", 
      "CTA Button Click", 
      "Anti-Aging Therapies Consultation", 
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
          className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 
            id="cta-title" 
            className="text-3xl md:text-4xl font-bold mb-6 font-playfair"
          >
            Rozpocznij swoją terapię przeciwstarzeniową już dziś
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Umów się na konsultację w gabinecie w Jaworznie i dowiedz się, która metoda będzie najlepsza dla Twojej skóry
          </p>
          
          {/* Location tags for SEO */}
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
          
          <Button 
            asChild 
            size="lg" 
            className={`bg-white text-pink-600 hover:bg-pink-50 hover:text-pink-700 transition-all duration-500 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            style={{ transitionDelay: "300ms" }}
            onClick={handleCTAClick}
            data-location="jaworzno"
            data-service="anti-aging-therapy"
          >
            <Link to="/kontakt">
              Umów wizytę
              <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
            </Link>
          </Button>
          
          <p className="mt-4 text-sm text-white/80">
            Obsługujemy klientów z Jaworzna oraz okolicznych miejscowości: Katowice, Myślowice, Kraków, Oświęcim, Olkusz
          </p>
        </div>
      </div>
    </section>
  );
};

export default React.memo(CTASection);
