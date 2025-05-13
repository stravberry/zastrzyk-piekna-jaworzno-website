
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, trackEvent } from '@/services/analyticService';

interface AnalyticsOptions {
  trackPageViews?: boolean;
  trackTimeOnPage?: boolean;
}

/**
 * Custom hook for comprehensive analytics tracking that combines
 * our custom analytics with Vercel Analytics
 */
export const useAnalytics = (options: AnalyticsOptions = {}) => {
  const location = useLocation();
  const { trackPageViews = true, trackTimeOnPage = true } = options;
  
  // Track page views on route changes
  useEffect(() => {
    if (trackPageViews) {
      // Extract page title from document
      const pageTitle = document.title || 'Zastrzyk Piękna';
      
      // Track page view on route change
      trackPageView(location.pathname, pageTitle);
      
      // Scroll to top on route change (better user experience)
      window.scrollTo(0, 0);
    }
    
    // Track time on page
    let startTime: number | null = null;
    if (trackTimeOnPage) {
      startTime = Date.now();
    }
    
    return () => {
      // Track time spent on page when unmounting
      if (trackTimeOnPage && startTime !== null) {
        const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);
        if (timeSpentSeconds > 5) { // Only track if user spent more than 5 seconds
          trackEvent(
            'User Engagement',
            'Time on Page',
            location.pathname,
            timeSpentSeconds
          );
        }
      }
    };
  }, [location, trackPageViews, trackTimeOnPage]);

  // Return utility functions for component-specific tracking
  return {
    trackEvent,
    trackPageView
  };
};

export default useAnalytics;
