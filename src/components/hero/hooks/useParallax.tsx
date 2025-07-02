import { useState, useEffect, useCallback } from 'react';

interface ParallaxState {
  mouseX: number;
  mouseY: number;
  scrollY: number;
}

interface UseParallaxOptions {
  mouseSensitivity?: number;
  scrollSensitivity?: number;
  enabled?: boolean;
}

export function useParallax(options: UseParallaxOptions = {}) {
  const {
    mouseSensitivity = 0.03,
    scrollSensitivity = 0.5,
    enabled = true
  } = options;

  const [parallaxState, setParallaxState] = useState<ParallaxState>({
    mouseX: 0,
    mouseY: 0,
    scrollY: 0
  });

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!enabled) return;
    
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const mouseX = (event.clientX - centerX) * mouseSensitivity;
    const mouseY = (event.clientY - centerY) * mouseSensitivity;
    
    setParallaxState(prev => ({ ...prev, mouseX, mouseY }));
  }, [enabled, mouseSensitivity]);

  const handleScroll = useCallback(() => {
    if (!enabled) return;
    
    const scrollY = window.scrollY * scrollSensitivity;
    setParallaxState(prev => ({ ...prev, scrollY }));
  }, [enabled, scrollSensitivity]);

  useEffect(() => {
    if (!enabled) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enabled, handleMouseMove, handleScroll]);

  return parallaxState;
}