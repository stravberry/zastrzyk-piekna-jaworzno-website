
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, trackEvent } from '@/services/analyticService';

interface LocationTrackingOptions {
  pageTitle?: string;
  trackTimeOnPage?: boolean;
  trackViewportSize?: boolean;
  trackDeviceInfo?: boolean;
  trackUserInteraction?: boolean;
  locationData?: string[];
}

/**
 * Custom hook for enhanced page tracking with location data
 */
export const useLocationTracking = (options: LocationTrackingOptions = {}) => {
  const location = useLocation();
  const {
    pageTitle,
    trackTimeOnPage = true,
    trackViewportSize = true,
    trackDeviceInfo = true,
    trackUserInteraction = true,
    locationData = ["Jaworzno", "Katowice", "Myślowice", "Kraków", "Oświęcim", "Olkusz"]
  } = options;
  
  useEffect(() => {
    // Create title from current document or route path
    const currentPageTitle = pageTitle || document.title || location.pathname;
    
    // Track basic page view
    trackPageView(location.pathname, currentPageTitle);
    
    // Track locations data 
    if (locationData && locationData.length > 0) {
      trackEvent(
        'Location Data',
        'Page Served',
        `Locations: ${locationData.join(', ')}`,
      );
    }
    
    // Track viewport size for responsive design analytics
    if (trackViewportSize) {
      const { innerWidth, innerHeight } = window;
      trackEvent(
        'Technical',
        'Viewport Size',
        `${innerWidth}x${innerHeight}`,
      );
    }
    
    // Track device information
    if (trackDeviceInfo) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      trackEvent(
        'Technical',
        'Device Type',
        isMobile ? 'Mobile' : 'Desktop',
      );
    }
    
    // Track time on page
    let startTime: number | null = null;
    if (trackTimeOnPage) {
      startTime = Date.now();
    }
    
    // Track user interactions if requested
    let interactionCount = 0;
    const trackInteraction = () => {
      if (trackUserInteraction && interactionCount < 10) {
        interactionCount++;
        trackEvent(
          'User Behavior',
          'Page Interaction',
          location.pathname,
          interactionCount
        );
      }
    };
    
    if (trackUserInteraction) {
      document.addEventListener('click', trackInteraction);
      document.addEventListener('scroll', trackInteraction);
    }
    
    return () => {
      // Track time spent on page when unmounting
      if (trackTimeOnPage && startTime !== null) {
        const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);
        trackEvent(
          'User Engagement',
          'Time on Page',
          currentPageTitle,
          timeSpentSeconds
        );
      }
      
      // Clean up event listeners
      if (trackUserInteraction) {
        document.removeEventListener('click', trackInteraction);
        document.removeEventListener('scroll', trackInteraction);
      }
    };
  }, [location, pageTitle, trackTimeOnPage, trackViewportSize, trackDeviceInfo, trackUserInteraction, locationData]);
};

export default useLocationTracking;
