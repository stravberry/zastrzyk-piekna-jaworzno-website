
import { useCallback } from "react";

interface ScrollOptions {
  behavior?: ScrollBehavior;
  offset?: number;
}

/**
 * Custom hook for smooth scrolling to elements
 */
export const useScrollTo = () => {
  const scrollToElement = useCallback((element: HTMLElement | null, options: ScrollOptions = {}) => {
    if (!element) return;
    
    const { behavior = "smooth", offset = 0 } = options;
    
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior,
    });
  }, []);

  const scrollToRef = useCallback((ref: React.RefObject<HTMLElement>, options: ScrollOptions = {}) => {
    if (ref.current) {
      scrollToElement(ref.current, options);
    }
  }, [scrollToElement]);

  return { scrollToElement, scrollToRef };
};
