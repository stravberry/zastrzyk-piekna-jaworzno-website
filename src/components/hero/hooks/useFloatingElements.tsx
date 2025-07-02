import { useMemo } from 'react';

export interface FloatingElementData {
  id: string;
  type: 'heart' | 'bubble' | 'flower';
  x: number;
  y: number;
  size: number;
  speed: number;
  delay: number;
  color: string;
  opacity: number;
}

interface UseFloatingElementsOptions {
  count?: number;
  types?: Array<'heart' | 'bubble' | 'flower'>;
  colors?: string[];
}

export function useFloatingElements(options: UseFloatingElementsOptions = {}) {
  const {
    count = 15,
    types = ['heart', 'bubble', 'flower'],
    colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(350 80% 95%)', 'hsl(48 60% 90%)']
  } = options;

  const elements = useMemo(() => {
    return Array.from({ length: count }, (_, index) => ({
      id: `floating-${index}`,
      type: types[Math.floor(Math.random() * types.length)] as 'heart' | 'bubble' | 'flower',
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.3 + Math.random() * 0.7, // 0.3 to 1.0
      speed: 0.5 + Math.random() * 1.5, // 0.5 to 2.0
      delay: Math.random() * 5, // 0 to 5 seconds
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 0.1 + Math.random() * 0.3 // 0.1 to 0.4
    }));
  }, [count, types, colors]);

  return elements;
}