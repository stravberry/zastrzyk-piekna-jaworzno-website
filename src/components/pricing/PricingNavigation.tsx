
import React, { useState } from "react";
import { ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { PriceCategory } from "./PriceCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PricingNavigationProps {
  categories: PriceCategory[];
}

const PricingNavigation: React.FC<PricingNavigationProps> = ({ categories }) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, categoryId: string) => {
    e.preventDefault();
    const element = document.getElementById(categoryId);
    if (element) {
      const headerHeight = 300; // Increased to 300 to ensure category headers are fully visible
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      // Close the mobile menu after clicking a category
      if (isMobile) {
        setIsOpen(false);
      }
    }
  };

  return (
    <div className="bg-white py-4 shadow-sm sticky top-16 z-10">
      <div className="container-custom">
        {isMobile ? (
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <CollapsibleTrigger asChild>
              <Button 
                className="w-full flex items-center justify-between bg-pink-50 text-pink-600 hover:bg-pink-100"
                variant="outline"
              >
                Kategorie cennika
                {isOpen ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {categories.map((category) => (
                <a 
                  key={category.id}
                  href={`#${category.id}`}
                  onClick={(e) => handleCategoryClick(e, category.id)}
                  className="px-4 py-3 text-center bg-pink-50 text-pink-600 rounded-md hover:bg-pink-100 transition-colors font-medium flex items-center justify-between text-sm w-full mb-2"
                >
                  {category.title}
                  <ChevronRight className="ml-1 h-4 w-4 flex-shrink-0" />
                </a>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {categories.map((category) => (
              <a 
                key={category.id}
                href={`#${category.id}`}
                onClick={(e) => handleCategoryClick(e, category.id)}
                className="px-4 py-3 text-center bg-pink-50 text-pink-600 rounded-md hover:bg-pink-100 transition-colors font-medium flex items-center justify-between text-sm"
              >
                {category.title}
                <ChevronRight className="ml-1 h-4 w-4 flex-shrink-0" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingNavigation;
