
import React from "react";
import { ChevronRight } from "lucide-react";
import { PriceCategory } from "./PriceCard";

interface PricingNavigationProps {
  categories: PriceCategory[];
}

const PricingNavigation: React.FC<PricingNavigationProps> = ({ categories }) => {
  return (
    <div className="bg-white py-8 shadow-sm sticky top-16 z-10">
      <div className="container-custom">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <a 
              key={category.id}
              href={`#${category.id}`}
              className="px-4 py-3 text-center bg-pink-50 text-pink-600 rounded-md hover:bg-pink-100 transition-colors font-medium flex items-center justify-center text-sm"
            >
              {category.title}
              <ChevronRight className="ml-1 h-4 w-4 flex-shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingNavigation;
