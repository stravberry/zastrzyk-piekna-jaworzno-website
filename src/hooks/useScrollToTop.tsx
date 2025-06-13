
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook that scrolls to top when route changes
 */
export const useScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [location.pathname]);
};

export default useScrollToTop;
