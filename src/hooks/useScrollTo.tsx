
import { useCallback, useRef } from "react";

interface ScrollOptions {
  behavior?: ScrollBehavior;
  offset?: number;
}

/**
 * Custom hook for smooth scrolling to elements
 */
export const useScrollTo = () => {
  // Cache window dimensions to reduce DOM queries
  const dimensionsCache = useRef({ height: 0, lastUpdate: 0 });

  const scrollToElement = useCallback((element: HTMLElement | null, options: ScrollOptions = {}) => {
    if (!element) return;
    
    const { behavior = "smooth", offset = 0 } = options;
    
    // Batch all DOM operations in a single frame
    requestAnimationFrame(() => {
      const elementRect = element.getBoundingClientRect();
      const currentScroll = window.pageYOffset;
      const targetPosition = elementRect.top + currentScroll - offset;
    
      window.scrollTo({
        top: targetPosition,
        behavior,
      });
    });
  }, []);

  const scrollToRef = useCallback((ref: React.RefObject<HTMLElement>, options: ScrollOptions = {}) => {
    if (ref.current) {
      scrollToElement(ref.current, options);
    }
  }, [scrollToElement]);

  return { scrollToElement, scrollToRef };
};
