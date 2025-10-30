// src/components/ui/button.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline';
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2',
          variant === 'outline' && 'border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };