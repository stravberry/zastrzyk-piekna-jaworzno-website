
import { useEffect, useRef } from 'react';
import { useAdvancedTracking } from './useAdvancedTracking';

interface ScrollTrackingOptions {
  milestones?: number[];
  pageName?: string;
  trackTimeOnSection?: boolean;
}

/**
 * Hook to track scroll depth and reading progress
 */
export const useScrollTracking = (options: ScrollTrackingOptions = {}) => {
  const { 
    milestones = [25, 50, 75, 90, 100], 
    pageName,
    trackTimeOnSection = true 
  } = options;
  
  const { trackScrollMilestone, trackTimeEngagement } = useAdvancedTracking();
  const trackedMilestones = useRef(new Set<number>());
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const documentHeight = document.documentElement.scrollHeight;
          const windowHeight = window.innerHeight;
          const scrollableHeight = documentHeight - windowHeight;
          
          if (scrollableHeight > 0) {
            const scrollPercentage = Math.round((scrollTop / scrollableHeight) * 100);
            
            // Track milestones
            milestones.forEach(milestone => {
              if (scrollPercentage >= milestone && !trackedMilestones.current.has(milestone)) {
                trackedMilestones.current.add(milestone);
                trackScrollMilestone(milestone, pageName);
              }
            });
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    // Track time engagement when user leaves or scrolls significantly
    const handleBeforeUnload = () => {
      if (trackTimeOnSection) {
        const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
        if (timeSpent > 5) { // Only track if more than 5 seconds
          trackTimeEngagement(timeSpent, pageName);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Track initial page load
    trackScrollMilestone(0, pageName);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [milestones, pageName, trackScrollMilestone, trackTimeEngagement, trackTimeOnSection]);

  return {
    trackedMilestones: Array.from(trackedMilestones.current)
  };
};

export default useScrollTracking;
