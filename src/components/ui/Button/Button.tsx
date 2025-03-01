// src/components/ui/Button/Button.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ASSETS } from '@/config/assets';
import { LoadingSpinner } from '@/components/shared/loaders/LoadingSpinner';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: React.ReactNode;
}

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  outline: 'border-2 border-primary text-primary hover:bg-primary/5',
  ghost: 'text-primary hover:bg-primary/5'
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  onClick,
  type = 'button',
  className = '',
  icon
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
      type={type}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      className={`
        inline-flex items-center justify-center rounded-md font-medium
        transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {isLoading ? (
        <LoadingSpinner className="mr-2" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
}