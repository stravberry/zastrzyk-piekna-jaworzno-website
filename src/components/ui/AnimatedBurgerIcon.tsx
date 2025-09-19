import React from 'react';

interface AnimatedBurgerIconProps {
  isOpen: boolean;
  className?: string;
}

const AnimatedBurgerIcon: React.FC<AnimatedBurgerIconProps> = ({ isOpen, className = "w-6 h-6" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      overflow="visible"
    >
      {/* Top line - rotates and moves down to form top part of X */}
      <path
        d="M4 6h16"
        className={`transition-all duration-300 ease-in-out origin-center ${
          isOpen ? 'rotate-45 translate-y-1.5' : 'rotate-0 translate-y-0'
        }`}
        style={{
          transformOrigin: '50% 50%',
          transformBox: 'fill-box'
        }}
      />
      
      {/* Middle line - fades out */}
      <path
        d="M4 12h16"
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-0' : 'opacity-100'
        }`}
      />
      
      {/* Bottom line - rotates and moves up to form bottom part of X */}
      <path
        d="M4 18h16"
        className={`transition-all duration-300 ease-in-out origin-center ${
          isOpen ? '-rotate-45 -translate-y-1.5' : 'rotate-0 translate-y-0'
        }`}
        style={{
          transformOrigin: '50% 50%',
          transformBox: 'fill-box'
        }}
      />
    </svg>
  );
};

export default AnimatedBurgerIcon;