
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/services/analyticService';

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Extract page title from document or use a default
    const pageTitle = document.title || 'Zastrzyk Piękna';
    
    // Track page view on route change
    trackPageView(location.pathname, pageTitle);
    
    // Scroll to top on route change (better user experience)
    window.scrollTo(0, 0);
  }, [location]);
};

export default usePageTracking;
