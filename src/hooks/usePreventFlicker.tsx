import { useEffect, useState } from 'react';

export const usePreventFlicker = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Add preload class to prevent animations during initial load
    document.body.classList.add('preload-prevent');
    
    // Wait for DOM and fonts to be ready
    const timer = setTimeout(() => {
      document.body.classList.remove('preload-prevent');
      setIsLoaded(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.body.classList.remove('preload-prevent');
    };
  }, []);

  return isLoaded;
};