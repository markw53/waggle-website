// src/components/icons/index.tsx
import React from 'react';

interface IconProps {
  className?: string;
  color?: string;
  size?: number;
}

export const DogIcon = ({ className, color = 'currentColor', size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* SVG path data */}
  </svg>
);

export const MessageIcon = ({ className, color = 'currentColor', size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* SVG path data */}
  </svg>
);

// Add other icons...