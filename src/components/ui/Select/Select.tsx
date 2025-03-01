// src/components/ui/Select/Select.tsx
import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  value: Option;
  onChange: (option: Option) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  label,
  error,
  disabled = false,
  className = '',
}: SelectProps) {
  return (
    <div className={className}>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        {({ open }) => (
          <>
            {label && (
              <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </Listbox.Label>
            )}
            <div className="relative">
              <Listbox.Button className={`
                relative w-full cursor-default rounded-md border
                bg-white py-2 pl-3 pr-10 text-left shadow-sm
                focus:border-primary focus:outline-none focus:ring-1
                focus:ring-primary sm:text-sm
                ${disabled ? 'bg-gray-50 text-gray-500' : ''}
                ${error ? 'border-red-300' : 'border-gray-300'}
              `}>
                <span className="block truncate">{value.label}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>

              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {options.map((option) => (
                    <Listbox.Option
                      key={option.value}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 
                        ${active ? 'bg-primary-50 text-primary-900' : 'text-gray-900'}`
                      }
                      value={option}
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            {option.label}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </>
        )}
      </Listbox>
    </div>
  );
}