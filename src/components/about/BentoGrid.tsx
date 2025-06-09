
import React, { useState, useRef } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import BentoCard from "./BentoCard";
import { bentoGridData } from "./data/bentoGridData";

const BentoGrid = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const isVisible = useScrollAnimation(gridRef, { threshold: 0.2 });

  return (
    <div 
      ref={gridRef}
      className={`grid grid-cols-1 md:grid-cols-6 lg:grid-cols-8 gap-4 max-w-6xl mx-auto transform transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
    >
      {bentoGridData.map((item, index) => (
        <BentoCard
          key={item.id}
          item={item}
          index={index}
          isHovered={hoveredCard === item.id}
          onHover={setHoveredCard}
        />
      ))}
    </div>
  );
};

export default BentoGrid;
