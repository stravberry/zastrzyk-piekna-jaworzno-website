
import React from "react";
import { ChevronRight } from "lucide-react";
import { PriceCategory } from "./PriceCard";

interface PricingNavigationProps {
  categories: PriceCategory[];
}

const PricingNavigation: React.FC<PricingNavigationProps> = ({ categories }) => {
  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, categoryId: string) => {
    e.preventDefault();
    const element = document.getElementById(categoryId);
    if (element) {
      const headerHeight = 220; // Increased to 220 to ensure category headers are fully visible
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="bg-white py-8 shadow-sm sticky top-16 z-10">
      <div className="container-custom">
        <div className="grid grid-cols-3 gap-4">
          {categories.map((category) => (
            <a 
              key={category.id}
              href={`#${category.id}`}
              onClick={(e) => handleCategoryClick(e, category.id)}
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
