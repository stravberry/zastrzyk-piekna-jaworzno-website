
// Initialize the dataLayer if it doesn't exist
declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Initialize dataLayer
export const initDataLayer = () => {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
};

// Track virtual pageview
export const trackPageView = (pagePath: string, pageTitle: string) => {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'virtualPageview',
      virtualPagePath: pagePath,
      virtualPageTitle: pageTitle
    });
    console.log('Virtual pageview tracked:', pagePath, pageTitle);
  }
};

// Track user interaction events
export const trackEvent = (category: string, action: string, label?: string, value?: number) => {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'userInteraction',
      eventCategory: category,
      eventAction: action,
      eventLabel: label,
      eventValue: value
    });
    console.log('User event tracked:', category, action, label, value);
  }
};
