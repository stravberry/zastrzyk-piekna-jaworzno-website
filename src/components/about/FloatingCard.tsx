
import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FloatingCardData } from "./data/floatingCardsData";

interface FloatingCardProps {
  card: FloatingCardData;
  index: number;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  mousePosition: { x: number; y: number };
}

const FloatingCard: React.FC<FloatingCardProps> = ({
  card,
  index,
  isHovered,
  onHover,
  mousePosition,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setCardPosition({ x: rect.left, y: rect.top });
    }
  }, []);

  const handleMouseEnter = () => {
    onHover(card.id);
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    onHover(null);
    setIsExpanded(false);
  };

  // Calculate magnetic effect
  const magneticEffect = () => {
    if (!cardRef.current || !isHovered) return {};
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (mousePosition.x - centerX) * 0.1;
    const deltaY = (mousePosition.y - centerY) * 0.1;
    
    return {
      transform: `translate3d(${deltaX}px, ${deltaY}px, 0) rotateY(${deltaX * 0.1}deg) rotateX(${-deltaY * 0.1}deg)`,
    };
  };

  const Icon = card.icon;

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative group cursor-pointer transition-all duration-700 ease-out",
        "hover:z-20 transform-gpu",
        `animation-delay-${index * 200}ms`,
        isExpanded ? "scale-110" : "hover:scale-105"
      )}
      style={{
        ...magneticEffect(),
        animationDelay: `${index * 200}ms`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Floating glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-2xl blur-xl transition-all duration-700",
        card.gradient,
        isHovered ? "opacity-30 scale-110" : "opacity-0"
      )} />

      {/* Main card */}
      <div className={cn(
        "relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg",
        "border border-white/50 transition-all duration-700",
        "hover:shadow-2xl hover:bg-white/90",
        isExpanded ? "shadow-2xl bg-white/95" : ""
      )}>
        {/* Particle burst on hover */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-ping"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
        )}

        {/* Icon with floating animation */}
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-all duration-500",
          card.gradient,
          "shadow-lg group-hover:shadow-xl",
          isHovered ? "animate-bounce" : ""
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>

        {/* Badge if present */}
        {card.badge && (
          <div className="absolute top-4 right-4 bg-gold-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
            {card.badge}
          </div>
        )}

        {/* Content */}
        <h3 className="text-xl font-bold mb-3 text-gray-800 font-playfair group-hover:text-pink-600 transition-colors duration-300">
          {card.title}
        </h3>
        
        <p className="text-gray-600 leading-relaxed mb-4 transition-all duration-300">
          {card.description}
        </p>

        {/* Expandable details */}
        <div className={cn(
          "overflow-hidden transition-all duration-500 ease-out",
          isExpanded ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 italic">
              {card.expandedContent}
            </p>
          </div>
        </div>

        {/* Comparison indicator */}
        {card.comparison && (
          <div className="flex justify-between items-center mt-4 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Inni</div>
              <div className="text-sm font-medium text-gray-600">{card.comparison.others}</div>
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-pink-300 to-purple-300"></div>
            <div className="text-center">
              <div className="text-xs text-pink-500 mb-1">Ja</div>
              <div className="text-sm font-semibold text-pink-600">{card.comparison.me}</div>
            </div>
          </div>
        )}

        {/* Floating particles on hover */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-float opacity-60"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                  animationDelay: `${i * 300}ms`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingCard;
