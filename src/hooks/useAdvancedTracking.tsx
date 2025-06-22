
import { useCallback } from 'react';
import { trackEvent } from '@/services/analyticService';

interface ConversionData {
  form_type?: string;
  contact_method?: string;
  has_phone?: boolean;
  subject?: string;
  value?: number;
  currency?: string;
  [key: string]: any;
}

interface InteractionData {
  element_type?: string;
  element_text?: string;
  page_section?: string;
  scroll_depth?: number;
  time_on_page?: number;
  [key: string]: any;
}

/**
 * Hook for advanced GTM tracking with conversion and interaction events
 */
export const useAdvancedTracking = () => {
  
  // Track conversions (main business goals)
  const trackConversion = useCallback((conversionType: string, conversionName: string, data?: ConversionData) => {
    // Enhanced dataLayer event for GTM
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'conversion',
      conversion_type: conversionType,
      conversion_name: conversionName,
      conversion_data: data,
      timestamp: new Date().toISOString(),
      page_location: window.location.href,
      page_title: document.title
    });

    // Also track with our analytics service
    trackEvent('Conversion', conversionType, conversionName, data?.value);
    
    console.log(`🎯 Conversion tracked: ${conversionType} - ${conversionName}`, data);
  }, []);

  // Track user interactions
  const trackInteraction = useCallback((interactionType: string, elementInfo: string, data?: InteractionData) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'user_interaction',
      interaction_type: interactionType,
      element_info: elementInfo,
      interaction_data: data,
      timestamp: new Date().toISOString(),
      page_location: window.location.href
    });

    trackEvent('User Interaction', interactionType, elementInfo);
    
    console.log(`👆 Interaction tracked: ${interactionType} - ${elementInfo}`, data);
  }, []);

  // Track form interactions specifically
  const trackFormInteraction = useCallback((action: string, formName: string, data?: any) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'form_interaction',
      form_action: action,
      form_name: formName,
      form_data: data,
      timestamp: new Date().toISOString()
    });

    trackEvent('Form Interaction', action, formName);
  }, []);

  // Track individual form field interactions
  const trackFormField = useCallback((fieldAction: string, fieldName: string) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'form_field_interaction',
      field_action: fieldAction,
      field_name: fieldName,
      timestamp: new Date().toISOString()
    });

    trackEvent('Form Field', fieldAction, fieldName);
  }, []);

  // Track scroll depth milestones
  const trackScrollMilestone = useCallback((percentage: number, pageName?: string) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'scroll_milestone',
      scroll_percentage: percentage,
      page_name: pageName || document.title,
      timestamp: new Date().toISOString()
    });

    trackEvent('Scroll Depth', `${percentage}% Milestone`, pageName || window.location.pathname);
  }, []);

  // Track time-based engagement
  const trackTimeEngagement = useCallback((timeSpent: number, section?: string) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'time_engagement',
      time_spent_seconds: timeSpent,
      engagement_section: section || 'page',
      timestamp: new Date().toISOString()
    });

    trackEvent('Time Engagement', section || 'Page', `${timeSpent}s`, timeSpent);
  }, []);

  // Track clicks on important elements
  const trackElementClick = useCallback((elementType: string, elementText: string, elementLocation?: string) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'element_click',
      element_type: elementType,
      element_text: elementText,
      element_location: elementLocation,
      timestamp: new Date().toISOString()
    });

    trackEvent('Element Click', elementType, elementText);
  }, []);

  // Track contact attempts (phone, email clicks)
  const trackContactAttempt = useCallback((contactMethod: string, contactValue?: string) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'contact_attempt',
      contact_method: contactMethod,
      contact_value: contactValue,
      timestamp: new Date().toISOString()
    });

    // This is a conversion event
    trackConversion('contact_attempt', contactMethod, {
      contact_method: contactMethod,
      contact_value: contactValue
    });
  }, [trackConversion]);

  return {
    trackConversion,
    trackInteraction,
    trackFormInteraction,
    trackFormField,
    trackScrollMilestone,
    trackTimeEngagement,
    trackElementClick,
    trackContactAttempt
  };
};

export default useAdvancedTracking;
