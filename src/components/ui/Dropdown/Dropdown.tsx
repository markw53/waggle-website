// src/components/ui/Dropdown/Dropdown.tsx
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  className?: string;
  align?: 'left' | 'right';
}

export function Dropdown({
  trigger,
  items,
  className = '',
  align = 'right',
}: DropdownProps) {
  return (
    <Menu as="div" className={`relative inline-block text-left ${className}`}>
      <Menu.Button className="inline-flex items-center">
        {trigger}
        <ChevronDownIcon className="ml-1 h-5 w-5" aria-hidden="true" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
        >
          <div className="py-1">
            {items.map((item, index) => (
              <Menu.Item key={index}>
                {({ active }) => (
                  <button
                    onClick={item.onClick}
                    className={`
                      ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}
                      ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                      group flex w-full items-center px-4 py-2 text-sm
                    `}
                    disabled={item.disabled}
                  >
                    {item.icon && (
                      <span className="mr-3 h-5 w-5" aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}