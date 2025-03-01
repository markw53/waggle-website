// src/components/ui/Card/Card.tsx
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isHoverable?: boolean;
}

export function Card({ 
  children, 
  className = '', 
  onClick, 
  isHoverable = false 
}: CardProps) {
  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      onClick={onClick}
      whileHover={isHoverable ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={`
        bg-white rounded-lg shadow-md overflow-hidden
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}

// Card subcomponents
Card.Header = function CardHeader({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-4 py-5 sm:px-6 ${className}`}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-4 py-5 sm:p-6 ${className}`}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-4 py-4 sm:px-6 border-t ${className}`}>
      {children}
    </div>
  );
};