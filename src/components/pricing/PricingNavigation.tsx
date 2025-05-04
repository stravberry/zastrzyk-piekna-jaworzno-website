
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight } from "lucide-react";
import { PriceCategory } from "./PriceCard";

interface PricingNavigationProps {
  categories: PriceCategory[];
}

const PricingNavigation: React.FC<PricingNavigationProps> = ({ categories }) => {
  return (
    <div className="bg-white py-6 shadow-sm sticky top-16 z-10">
      <div className="container-custom">
        <ScrollArea className="w-full">
          <div className="flex space-x-4 pb-2 overflow-x-auto min-w-full">
            {categories.map((category) => (
              <a 
                key={category.id}
                href={`#${category.id}`}
                className="px-4 py-2 whitespace-nowrap bg-pink-50 text-pink-600 rounded-md hover:bg-pink-100 transition-colors font-medium flex items-center"
              >
                {category.title}
                <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default PricingNavigation;
