import React from 'react';
import Heart from './FloatingElements/Heart';
import Bubble from './FloatingElements/Bubble';
import Flower from './FloatingElements/Flower';
import { FloatingElementData } from './hooks/useFloatingElements';

interface FloatingElementProps {
  element: FloatingElementData;
  parallaxX: number;
  parallaxY: number;
  scrollY: number;
}

const FloatingElement: React.FC<FloatingElementProps> = ({
  element,
  parallaxX,
  parallaxY,
  scrollY
}) => {
  const { type, x, y, size, speed, delay, color, opacity } = element;

  // Calculate parallax offset based on element position
  const parallaxOffsetX = parallaxX * (x / 100) * 0.5;
  const parallaxOffsetY = parallaxY * (y / 100) * 0.3;
  const scrollOffset = scrollY * speed * 0.1;

  const elementSize = 16 + size * 24; // 16-40px

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate3d(${parallaxOffsetX}px, ${parallaxOffsetY - scrollOffset}px, 0) scale(${size})`,
    opacity,
    color,
    animationDelay: `${delay}s`,
    pointerEvents: 'none',
    willChange: 'transform',
  };

  const renderElement = () => {
    switch (type) {
      case 'heart':
        return (
          <Heart 
            size={elementSize} 
            color={color}
            className="animate-pulse"
          />
        );
      case 'bubble':
        return (
          <Bubble 
            size={elementSize} 
            color={color}
            className="animate-bounce"
          />
        );
      case 'flower':
        return (
          <Flower 
            size={elementSize} 
            color={color}
            className="animate-spin"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={style}
      className="floating-element transition-transform duration-1000 ease-out"
    >
      {renderElement()}
    </div>
  );
};

export default React.memo(FloatingElement);