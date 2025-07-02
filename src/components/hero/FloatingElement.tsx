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

  // Calculate only scroll offset, no mouse parallax
  const scrollOffset = scrollY * speed * 0.05;

  const elementSize = 16 + size * 24; // 16-40px

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate3d(0px, ${-scrollOffset}px, 0) scale(${size})`,
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
          />
        );
      case 'bubble':
        return (
          <Bubble 
            size={elementSize} 
            color={color}
          />
        );
      case 'flower':
        return (
          <Flower 
            size={elementSize} 
            color={color}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={style}
      className="floating-element"
    >
      {renderElement()}
    </div>
  );
};

export default React.memo(FloatingElement);