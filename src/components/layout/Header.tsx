// src/components/layout/Header.tsx
import { useState } from 'react';
import Link from 'next/link';
import { Disclosure } from '@headlessui/react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';

export default function Header() {
  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link href="/" className="flex-shrink-0 flex items-center">
                  <img
                    className="h-8 w-auto"
                    src="/images/logo.png"
                    alt="Waggle"
                  />
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <Link 
                  href="#features" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Features
                </Link>
                <Link 
                  href="#how-it-works" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  How It Works
                </Link>
                <Link 
                  href="#faq" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  FAQ
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  );
}