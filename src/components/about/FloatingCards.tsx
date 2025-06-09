
import React, { useRef } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import FloatingCard from "./FloatingCard";
import { floatingCardsData } from "./data/floatingCardsData";

const FloatingCards = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useScrollAnimation(containerRef, { threshold: 0.2 });

  return (
    <div 
      ref={containerRef}
      className={`relative transform transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {floatingCardsData.map((card, index) => (
          <FloatingCard
            key={card.id}
            card={card}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default FloatingCards;
