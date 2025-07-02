import React from 'react';

interface BubbleProps {
  size?: number;
  color?: string;
  className?: string;
}

const Bubble: React.FC<BubbleProps> = ({ 
  size = 20, 
  color = 'currentColor', 
  className = '' 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill={color}
        fillOpacity="0.3"
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.6"
      />
      <circle
        cx="9"
        cy="9"
        r="2"
        fill="white"
        fillOpacity="0.8"
      />
    </svg>
  );
};

export default Bubble;