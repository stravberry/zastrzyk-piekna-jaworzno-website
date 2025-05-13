
// Initialize the dataLayer if it doesn't exist
declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Enhanced location tracking data for Jaworzno and surrounding areas
const locationData = {
  primaryCity: 'Jaworzno',
  serviceRegion: 'Śląsk',
  nearbyLocations: ['Katowice', 'Myślowice', 'Kraków', 'Oświęcim', 'Olkusz'],
  coordinates: {
    latitude: 50.2026,
    longitude: 19.2773
  }
};

// Initialize dataLayer with enhanced configuration
export const initDataLayer = () => {
  window.dataLayer = window.dataLayer || [];
  
  // Push initial configuration data
  window.dataLayer.push({
    'businessInfo': {
      'businessName': 'Zastrzyk Piękna',
      'businessType': 'Gabinet Kosmetologii Estetycznej',
      'primaryLocation': locationData.primaryCity,
      'serviceRegion': locationData.serviceRegion
    }
  });
  
  return window.dataLayer;
};

// Track virtual pageview with enhanced location data
export const trackPageView = (pagePath: string, pageTitle: string) => {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'virtualPageview',
      virtualPagePath: pagePath,
      virtualPageTitle: pageTitle,
      pageLocations: locationData,
      timestamp: new Date().toISOString()
    });
    console.log('Virtual pageview tracked:', pagePath, pageTitle);
  }
};

// Enhanced user interaction event tracking
export const trackEvent = (category: string, action: string, label?: string, value?: number) => {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'userInteraction',
      eventCategory: category,
      eventAction: action,
      eventLabel: label,
      eventValue: value,
      locationContext: locationData,
      timestamp: new Date().toISOString()
    });
    console.log('User event tracked:', category, action, label, value);
  }
};

// Track service interest for specific treatments
export const trackServiceInterest = (serviceName: string, serviceCategory: string, interactionType: string) => {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'serviceInteraction',
      serviceName: serviceName,
      serviceCategory: serviceCategory,
      interactionType: interactionType,
      locationContext: locationData,
      timestamp: new Date().toISOString()
    });
    console.log('Service interest tracked:', serviceName, interactionType);
  }
};

// Track form submissions with enhanced data
export const trackFormSubmission = (formName: string, formFields: string[], success: boolean) => {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'formSubmission',
      formName: formName,
      formFields: formFields,
      formSuccess: success,
      locationContext: locationData,
      timestamp: new Date().toISOString()
    });
    console.log('Form submission tracked:', formName, success);
  }
};

// Track outbound links
export const trackOutboundLink = (linkUrl: string, linkText: string) => {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'outboundLink',
      linkUrl: linkUrl,
      linkText: linkText,
      locationContext: locationData,
      timestamp: new Date().toISOString()
    });
    console.log('Outbound link tracked:', linkUrl);
  }
};
