
import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronRight, ChevronDown, ChevronUp, Columns3, LayoutGrid } from "lucide-react";
import { PriceCategory } from "./PriceCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

interface PricingNavigationProps {
  categories: PriceCategory[];
}

const PricingNavigation: React.FC<PricingNavigationProps> = ({ categories }) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [isAutoCollapsing, setIsAutoCollapsing] = useState(false);
  
  // Cache navigation dimensions to reduce DOM queries
  const navigationCache = useRef({ height: 72, lastUpdate: 0 });
  
  const updateNavigationHeight = useCallback(() => {
    const now = Date.now();
    // Only update every 100ms to avoid excessive calculations
    if (now - navigationCache.current.lastUpdate < 100) return navigationCache.current.height;
    
    const navElement = document.querySelector('.bg-white.py-4.shadow-sm');
    if (navElement) {
      navigationCache.current = {
        height: navElement.clientHeight,
        lastUpdate: now
      };
    }
    return navigationCache.current.height;
  }, []);

  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, categoryId: string) => {
    e.preventDefault();
    const element = document.getElementById(categoryId);
    if (element) {
      // Batch all DOM operations in a single requestAnimationFrame
      requestAnimationFrame(() => {
        const navigationHeight = updateNavigationHeight();
        const offset = navigationHeight + 16;
        
        const elementRect = element.getBoundingClientRect();
        const currentScroll = window.pageYOffset;
        const targetPosition = elementRect.top + currentScroll - offset;
        
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth"
        });
      });

      // Close the mobile menu after clicking a category
      if (isMobile) {
        setIsOpen(false);
      } else {
        // For desktop, animate the closing after a slight delay
        setIsAutoCollapsing(true);
        setTimeout(() => {
          setIsDesktopOpen(false);
          setTimeout(() => {
            setIsAutoCollapsing(false);
          }, 500); // Match this with the CSS transition duration
        }, 300);
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
                className="w-full flex items-center justify-between bg-pink-100 text-pink-700 hover:bg-pink-200"
                variant="outline"
              >
                Usługi
                {isOpen ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2 animate-accordion-down">
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
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-pink-700">Kategorie zabiegów</h3>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center justify-between bg-pink-100 text-pink-700 hover:bg-pink-200"
                onClick={() => setIsDesktopOpen(!isDesktopOpen)}
              >
                {isDesktopOpen ? (
                  <>
                    <ChevronUp className="mr-1 h-4 w-4" />
                    Ukryj
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-1 h-4 w-4" />
                    Pokaż
                  </>
                )}
              </Button>
            </div>
            
            <div 
              className={cn(
                "grid-container overflow-hidden transition-all duration-500 ease-in-out",
                isDesktopOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
                isAutoCollapsing ? "animate-collapse" : ""
              )}
            >
              <div className="grid grid-cols-3 gap-2">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingNavigation;
