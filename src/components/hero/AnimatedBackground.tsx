import React from 'react';
import { useParallax } from './hooks/useParallax';
import { useFloatingElements } from './hooks/useFloatingElements';
import FloatingElement from './FloatingElement';

interface AnimatedBackgroundProps {
  className?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ className = '' }) => {
  const { mouseX, mouseY, scrollY } = useParallax({
    mouseSensitivity: 0.02,
    scrollSensitivity: 0.3,
  });

  const floatingElements = useFloatingElements({
    count: 12,
    types: ['heart', 'bubble', 'flower'],
    colors: [
      'hsl(350 85% 85%)', // Light pink
      'hsl(48 60% 88%)',  // Light gold
      'hsl(280 50% 90%)', // Light lavender
      'hsl(160 40% 88%)', // Light mint
    ]
  });

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 via-transparent to-gold-50/20" />
      
      {/* Floating elements */}
      {floatingElements.map((element) => (
        <FloatingElement
          key={element.id}
          element={element}
          parallaxX={mouseX}
          parallaxY={mouseY}
          scrollY={scrollY}
        />
      ))}
      
      {/* Additional ambient particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, index) => (
          <div
            key={`particle-${index}`}
            className="absolute w-1 h-1 rounded-full bg-pink-200/20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              transform: `translate3d(${mouseX * 0.1}px, ${mouseY * 0.1}px, 0)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(AnimatedBackground);