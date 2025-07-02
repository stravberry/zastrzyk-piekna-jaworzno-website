import React from 'react';

interface FlowerProps {
  size?: number;
  color?: string;
  className?: string;
}

const Flower: React.FC<FlowerProps> = ({ 
  size = 20, 
  color = 'currentColor', 
  className = '' 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" />
      <path d="M21 9C21 10.1 20.1 11 19 11C17.9 11 17 10.1 17 9C17 7.9 17.9 7 19 7C20.1 7 21 7.9 21 9Z" />
      <path d="M7 9C7 10.1 6.1 11 5 11C3.9 11 3 10.1 3 9C3 7.9 3.9 7 5 7C6.1 7 7 7.9 7 9Z" />
      <path d="M18.36 16.64C19.45 17.73 19.45 19.45 18.36 20.54C17.27 21.63 15.55 21.63 14.46 20.54C13.37 19.45 13.37 17.73 14.46 16.64C15.55 15.55 17.27 15.55 18.36 16.64Z" />
      <path d="M9.54 16.64C10.63 17.73 10.63 19.45 9.54 20.54C8.45 21.63 6.73 21.63 5.64 20.54C4.55 19.45 4.55 17.73 5.64 16.64C6.73 15.55 8.45 15.55 9.54 16.64Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
};

export default Flower;