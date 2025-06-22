
import { useEffect } from 'react';
import { useAdvancedTracking } from './useAdvancedTracking';

interface ClickTrackingOptions {
  trackLinks?: boolean;
  trackButtons?: boolean;
  trackImages?: boolean;
  trackForms?: boolean;
  excludeSelectors?: string[];
}

/**
 * Hook to automatically track clicks on important elements
 */
export const useClickTracking = (options: ClickTrackingOptions = {}) => {
  const {
    trackLinks = true,
    trackButtons = true,
    trackImages = true,
    trackForms = true,
    excludeSelectors = []
  } = options;

  const { trackElementClick, trackContactAttempt } = useAdvancedTracking();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Skip if target matches exclude selectors
      if (excludeSelectors.some(selector => target.matches?.(selector))) {
        return;
      }

      // Track different element types
      if (trackLinks && target.closest('a')) {
        const link = target.closest('a') as HTMLAnchorElement;
        const href = link.href;
        const text = link.textContent?.trim() || 'Link';
        
        // Special tracking for contact methods
        if (href.includes('tel:')) {
          trackContactAttempt('phone', href.replace('tel:', ''));
        } else if (href.includes('mailto:')) {
          trackContactAttempt('email', href.replace('mailto:', ''));
        } else if (href.includes('instagram.com') || href.includes('@')) {
          trackContactAttempt('instagram', text);
        } else {
          trackElementClick('link', text, href);
        }
      }
      
      if (trackButtons && target.closest('button')) {
        const button = target.closest('button') as HTMLButtonElement;
        const text = button.textContent?.trim() || 'Button';
        const type = button.type || 'button';
        trackElementClick('button', text, `type:${type}`);
      }
      
      if (trackImages && target.tagName === 'IMG') {
        const img = target as HTMLImageElement;
        const alt = img.alt || 'Image';
        const src = img.src;
        trackElementClick('image', alt, src);
      }

      if (trackForms && target.closest('form')) {
        const form = target.closest('form');
        const formName = form?.getAttribute('name') || form?.id || 'Form';
        
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
          const fieldName = (target as HTMLInputElement).name || (target as HTMLInputElement).id || 'Field';
          trackElementClick('form_field', fieldName, formName);
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [trackLinks, trackButtons, trackImages, trackForms, excludeSelectors, trackElementClick, trackContactAttempt]);
};

export default useClickTracking;
