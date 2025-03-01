// src/components/ui/Toggle/Toggle.tsx
import { Switch } from '@headlessui/react';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: {
    switch: 'h-5 w-9',
    dot: 'h-3 w-3',
    translate: 'translate-x-4',
  },
  md: {
    switch: 'h-6 w-11',
    dot: 'h-4 w-4',
    translate: 'translate-x-5',
  },
  lg: {
    switch: 'h-7 w-12',
    dot: 'h-5 w-5',
    translate: 'translate-x-5',
  },
};

export function Toggle({
  enabled,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className = '',
}: ToggleProps) {
  return (
    <Switch.Group>
      <div className={`flex items-center ${className}`}>
        {label && (
          <div className="mr-4">
            <Switch.Label className="font-medium text-gray-900">
              {label}
            </Switch.Label>
            {description && (
              <Switch.Description className="text-sm text-gray-500">
                {description}
              </Switch.Description>
            )}
          </div>
        )}
        <Switch
          checked={enabled}
          onChange={onChange}
          disabled={disabled}
          className={`
            ${enabled ? 'bg-primary' : 'bg-gray-200'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            relative inline-flex shrink-0 rounded-full border-2 border-transparent
            transition-colors duration-200 ease-in-out focus:outline-none
            focus:ring-2 focus:ring-primary focus:ring-offset-2
            ${sizes[size].switch}
          `}
        >
          <span
            className={`
              ${enabled ? sizes[size].translate : 'translate-x-0'}
              pointer-events-none inline-block transform rounded-full
              bg-white shadow ring-0 transition duration-200 ease-in-out
              ${sizes[size].dot}
            `}
          />
        </Switch>
      </div>
    </Switch.Group>
  );
}