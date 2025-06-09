
import React, { useRef, useEffect, useState } from "react";
import { BentoGridItem } from "./data/bentoGridData";

interface BentoCardProps {
  item: BentoGridItem;
  index: number;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}

const BentoCard: React.FC<BentoCardProps> = ({ item, index, isHovered, onHover }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isCardHovered, setIsCardHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cardRef.current && isCardHovered) {
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (e.clientX - centerX) * 0.1;
        const deltaY = (e.clientY - centerY) * 0.1;
        
        setMousePosition({ x: deltaX, y: deltaY });
      }
    };

    if (isCardHovered) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isCardHovered]);

  const handleMouseEnter = () => {
    setIsCardHovered(true);
    onHover(item.id);
  };

  const handleMouseLeave = () => {
    setIsCardHovered(false);
    onHover(null);
    setMousePosition({ x: 0, y: 0 });
  };

  const Icon = item.icon;

  return (
    <div
      ref={cardRef}
      className={`
        relative group cursor-pointer rounded-2xl overflow-hidden
        transition-all duration-700 ease-out
        ${item.size}
        ${isCardHovered ? 'scale-105 z-20' : 'scale-100 z-10'}
      `}
      style={{
        transform: `scale(${isCardHovered ? 1.05 : 1}) translate(${mousePosition.x}px, ${mousePosition.y}px)`,
        transitionDelay: `${index * 100}ms`
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background with gradient */}
      <div className={`
        absolute inset-0 transition-all duration-500
        ${item.gradient}
        ${isCardHovered ? 'opacity-100' : 'opacity-90'}
      `} />

      {/* Animated border */}
      <div className={`
        absolute inset-0 rounded-2xl transition-all duration-300
        ${isCardHovered ? 'ring-2 ring-pink-400/50 ring-offset-2 ring-offset-white' : ''}
      `} />

      {/* Content */}
      <div className="relative p-6 h-full flex flex-col justify-between text-white">
        {/* Icon and Category */}
        <div className="flex items-start justify-between mb-4">
          <div className={`
            p-3 rounded-xl backdrop-blur-sm transition-all duration-300
            ${isCardHovered ? 'bg-white/20 scale-110' : 'bg-white/10'}
          `}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {item.badge && (
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
              {item.badge}
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <h3 className="text-lg font-bold mb-2 font-playfair">
            {item.title}
          </h3>
          <p className="text-white/90 text-sm leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Comparison indicator */}
        {item.comparison && (
          <div className={`
            mt-4 pt-4 border-t border-white/20 transition-all duration-300
            ${isCardHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
          `}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-red-300">Inne: {item.comparison.others}</span>
              <span className="text-green-300">Ja: {item.comparison.me}</span>
            </div>
          </div>
        )}

        {/* Floating particles effect */}
        {isCardHovered && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/40 rounded-full animate-pulse"
                style={{
                  left: `${20 + (i * 15)}%`,
                  top: `${10 + (i * 10)}%`,
                  animationDelay: `${i * 200}ms`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Glow effect */}
      <div className={`
        absolute -inset-1 rounded-2xl transition-opacity duration-300 pointer-events-none
        bg-gradient-to-r from-pink-400/20 to-purple-400/20 blur-lg
        ${isCardHovered ? 'opacity-100' : 'opacity-0'}
      `} />
    </div>
  );
};

export default BentoCard;
