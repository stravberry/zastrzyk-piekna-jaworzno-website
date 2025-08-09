
export const initDataLayer = () => {
  // Initialize dataLayer array if it doesn't exist
  window.dataLayer = window.dataLayer || [];
  
  // Push initial pageview event
  trackPageView(window.location.pathname, document.title);
  
  // Initialize GTM enhanced tracking
  window.dataLayer.push({
    event: 'gtm_init',
    site_name: 'Zastrzyk Piękna',
    site_type: 'beauty_clinic',
    location: 'Jaworzno',
    timestamp: new Date().toISOString()
  });
  
  console.log('Analytics data layer initialized with GTM enhancements');
};

export const trackPageView = (path: string, title: string) => {
  try {
    // Push page view to dataLayer for GTM
    window.dataLayer.push({
      event: 'page_view',
      page: {
        path,
        title,
        location: window.location.href,
        referrer: document.referrer
      },
      user: {
        timestamp: new Date().toISOString(),
        session_id: generateSessionId()
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
      event_value: value,
      timestamp: new Date().toISOString(),
      page_location: window.location.href
    });
    
    console.log(`Event tracked: ${category} / ${action} / ${label || 'N/A'} / ${value || 'N/A'}`);
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

// Enhanced GTM tracking functions
export const trackConversion = (conversionType: string, conversionValue?: number, conversionCurrency: string = 'PLN') => {
  try {
    window.dataLayer.push({
      event: 'conversion',
      conversion_type: conversionType,
      conversion_value: conversionValue,
      conversion_currency: conversionCurrency,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Conversion tracked: ${conversionType}, value: ${conversionValue} ${conversionCurrency}`);
  } catch (error) {
    console.error('Error tracking conversion:', error);
  }
};

export const trackFormSubmission = (formName: string, formData?: any) => {
  try {
    window.dataLayer.push({
      event: 'form_submission',
      form_name: formName,
      form_data: formData,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Form submission tracked: ${formName}`);
  } catch (error) {
    console.error('Error tracking form submission:', error);
  }
};

export const trackScrollDepth = (percentage: number) => {
  try {
    window.dataLayer.push({
      event: 'scroll_depth',
      scroll_percentage: percentage,
      page_location: window.location.href,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Scroll depth tracked: ${percentage}%`);
  } catch (error) {
    console.error('Error tracking scroll depth:', error);
  }
};

export const trackTimeOnPage = (timeInSeconds: number) => {
  try {
    window.dataLayer.push({
      event: 'time_on_page',
      time_seconds: timeInSeconds,
      page_location: window.location.href,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Time on page tracked: ${timeInSeconds}s`);
  } catch (error) {
    console.error('Error tracking time on page:', error);
  }
};

export const trackUserEngagement = (engagementType: string, engagementValue?: string | number) => {
  try {
    window.dataLayer.push({
      event: 'user_engagement',
      engagement_type: engagementType,
      engagement_value: engagementValue,
      timestamp: new Date().toISOString()
    });
    
    console.log(`User engagement tracked: ${engagementType}`);
  } catch (error) {
    console.error('Error tracking user engagement:', error);
  }
};

// Helper function to generate session ID
const generateSessionId = (): string => {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

// Enhanced ecommerce tracking for services
export const trackServiceView = (serviceName: string, serviceCategory: string, servicePrice?: number) => {
  try {
    window.dataLayer.push({
      event: 'view_item',
      item_name: serviceName,
      item_category: serviceCategory,
      price: servicePrice,
      currency: 'PLN',
      timestamp: new Date().toISOString()
    });
    
    console.log(`Service view tracked: ${serviceName}`);
  } catch (error) {
    console.error('Error tracking service view:', error);
  }
};

export const trackServiceInterest = (serviceName: string, actionType: string) => {
  try {
    window.dataLayer.push({
      event: 'service_interest',
      service_name: serviceName,
      action_type: actionType, // 'price_check', 'more_info', 'contact_about'
      timestamp: new Date().toISOString()
    });
    
    console.log(`Service interest tracked: ${serviceName} - ${actionType}`);
  } catch (error) {
    console.error('Error tracking service interest:', error);
  }
};

