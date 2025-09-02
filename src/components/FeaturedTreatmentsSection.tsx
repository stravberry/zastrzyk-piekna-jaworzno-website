import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { Sparkles, User, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const FeaturedTreatmentsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useScrollAnimation(sectionRef);

  const treatments = [
    {
      id: 1,
      title: "Sculptra",
      description: "Pobudza naturalną produkcję kolagenu i przywraca objętość bez przerysowania.",
      icon: <User className="w-8 h-8" />,
      link: "/sculptra",
      delay: "delay-100"
    },
    {
      id: 2,
      title: "Fullface Natural",
      description: "Modelowanie całej twarzy z zachowaniem naturalnych proporcji i mimiki.",
      icon: <Sparkles className="w-8 h-8" />,
      link: "/modelowanie-ust",
      delay: "delay-200"
    }
  ];

  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-background to-muted/30">
      <div className="container-custom">
        <div 
          ref={sectionRef}
          className={`transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-primary mb-4">
              <Sparkles className="w-6 h-6" />
              <span className="text-sm font-medium uppercase tracking-wider">Nowości 2025</span>
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Hity Roku 2025
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Odkryj najnowsze trendy w kosmetologii estetycznej. Zabiegi, które wyznaczają standardy naturalnego piękna.
            </p>
          </div>

          {/* Treatment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {treatments.map((treatment) => (
              <div
                key={treatment.id}
                className={`group relative h-full overflow-visible rounded-xl border border-primary/10 bg-card/80 backdrop-blur-sm p-8 shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 ${
                  isVisible ? `animate-slide-up ${treatment.delay}` : ""
                }`}
              >
                {/* HIT Badge */}
                <div className="absolute -top-3 -right-3 z-10">
                  <Badge className="bg-gold-500 text-white hover:bg-gold-600 text-xs px-2 py-1 font-bold inline-flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    HIT
                  </Badge>
                </div>
                {/* Icon */}
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary ring-1 ring-primary/15 group-hover:bg-primary/15 transition-colors duration-300">
                    {treatment.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3 text-card-foreground group-hover:text-primary transition-colors duration-300">
                    {treatment.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {treatment.description}
                  </p>
                </div>

                {/* CTA Button */}
                <Link
                  to={treatment.title === "Fullface Natural" ? "/cennik" : treatment.link}
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-300 hover:bg-primary/90 hover:shadow-md group-hover:scale-105"
                >
                  {treatment.title === "Fullface Natural" ? "Cennik" : "Dowiedz się więcej"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTreatmentsSection;