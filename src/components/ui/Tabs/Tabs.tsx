// src/components/ui/Tabs/Tabs.tsx
import { Tab } from '@headlessui/react';
import { motion } from 'framer-motion';

interface TabItem {
  key: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  className?: string;
  variant?: 'pills' | 'underline' | 'solid';
}

export function Tabs({ tabs, className = '', variant = 'pills' }: TabsProps) {
  const variants = {
    pills: 'rounded-lg bg-gray-100 p-1',
    underline: 'border-b border-gray-200',
    solid: 'bg-white shadow-sm rounded-lg',
  };

  return (
    <div className={className}>
      <Tab.Group>
        <Tab.List className={variants[variant]}>
          {tabs.map((tab) => (
            <Tab
              key={tab.key}
              className={({ selected }) =>
                `${
                  variant === 'pills'
                    ? selected
                      ? 'bg-white shadow'
                      : 'text-gray-500 hover:text-gray-700'
                    : variant === 'underline'
                    ? selected
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-gray-500 hover:text-gray-700'
                    : selected
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }
                relative px-4 py-2 text-sm font-medium
                focus:outline-none transition-all duration-200
                ${variant === 'pills' ? 'rounded-md' : ''}
                ${variant === 'solid' ? 'rounded-lg' : ''}`
              }
            >
              <span className="flex items-center">
                {tab.icon && <span className="mr-2">{tab.icon}</span>}
                {tab.label}
              </span>
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-4">
          {tabs.map((tab) => (
            <Tab.Panel
              key={tab.key}
              className="focus:outline-none"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {tab.content}
              </motion.div>
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}