
import React from "react";
import { cn } from "@/lib/utils";
import { FloatingCardData } from "./data/floatingCardsData";

interface FloatingCardProps {
  card: FloatingCardData;
  index: number;
}

const FloatingCard: React.FC<FloatingCardProps> = ({ card, index }) => {
  const Icon = card.icon;

  return (
    <div
      className={cn(
        "group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300",
        "border border-gray-100 hover:border-pink-200",
        "transform hover:scale-105 hover:-translate-y-1"
      )}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Icon */}
      <div className={cn(
        "w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300",
        card.gradient,
        "group-hover:scale-110"
      )}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Badge if present */}
      {card.badge && (
        <div className="absolute top-4 right-4 bg-gold-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
          {card.badge}
        </div>
      )}

      {/* Content */}
      <h3 className="text-xl font-bold mb-3 text-gray-800 font-playfair group-hover:text-pink-600 transition-colors duration-300">
        {card.title}
      </h3>
      
      <p className="text-gray-600 leading-relaxed mb-4">
        {card.description}
      </p>

      {/* Expanded content always visible */}
      <div className="pt-3 border-t border-gray-100">
        <p className="text-sm text-gray-500 italic">
          {card.expandedContent}
        </p>
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
    </div>
  );
};

export default FloatingCard;
