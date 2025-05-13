export const initDataLayer = () => {
  // Initialize dataLayer array if it doesn't exist
  window.dataLayer = window.dataLayer || [];
  
  // Push initial pageview event
  trackPageView(window.location.pathname, document.title);
  
  console.log('Analytics data layer initialized');
};

export const trackPageView = (path: string, title: string) => {
  try {
    // Push page view to dataLayer for GTM
    window.dataLayer.push({
      event: 'page_view',
      page: {
        path,
        title
      }
    });
    
    console.log(`Page view tracked: ${path}`);
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

export const trackEvent = (category: string, action: string, label?: string, value?: number) => {
  try {
    // Push event to dataLayer for GTM
    window.dataLayer.push({
      event: 'custom_event',
      event_category: category,
      event_action: action,
      event_label: label,
      event_value: value
    });
    
    console.log(`Event tracked: ${category} / ${action} / ${label || 'N/A'} / ${value || 'N/A'}`);
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};
