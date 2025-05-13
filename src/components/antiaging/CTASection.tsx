
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CTASection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-pink-500 to-[#9b87f5] text-white">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair">
            Rozpocznij swoją terapię przeciwstarzeniową już dziś
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Umów się na konsultację i dowiedz się, która metoda będzie najlepsza dla Twojej skóry
          </p>
          <Button 
            asChild 
            size="lg" 
            className="bg-white text-pink-600 hover:bg-pink-50 hover:text-pink-700"
          >
            <Link to="/kontakt">
              Umów wizytę
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
