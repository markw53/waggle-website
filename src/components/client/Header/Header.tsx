// src/components/layout/Header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Disclosure, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

// Navigation items with optional submenus
const navigation = [
  {
    name: "Features",
    href: "#features",
    subItems: [
      { name: "Matching", href: "#matching" },
      { name: "Messaging", href: "#messaging" },
      { name: "Health Verification", href: "#health" }
    ]
  },
  {
    name: "How It Works",
    href: "#how-it-works",
    subItems: [
      { name: "Create Profile", href: "#create-profile" },
      { name: "Find Matches", href: "#find-matches" },
      { name: "Meet Up", href: "#meet-up" }
    ]
  },
  { name: "FAQ", href: "#faq" }
];

// Animation variants
const fadeInVariants = {
  initial: {
    opacity: 0,
    y: -10
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2
    }
  }
};

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation item with optional dropdown
  const NavItem = ({ item }: { item: (typeof navigation)[0] }) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;

    return (
      <div
        className="relative"
        onMouseEnter={() => hasSubItems && setActiveDropdown(item.name)}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <Link
          href={item.href}
          className={`px-3 py-2 rounded-md text-sm font-medium 
                     ${isScrolled ? "text-gray-700 hover:text-gray-900" : "text-white hover:text-gray-200"}
                     transition-colors duration-200`}
        >
          {item.name}
        </Link>

        {/* Dropdown Menu */}
        {hasSubItems && (
          <AnimatePresence>
            {activeDropdown === item.name && (
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={fadeInVariants}
                className="absolute left-0 w-48 mt-2 origin-top-left bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <div className="py-1">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };

  return (
    <Disclosure as="nav">
      {({ open }) => (
        <>
          <motion.div
            className={`fixed w-full z-50 transition-colors duration-200 
                       ${isScrolled ? "bg-white shadow" : "bg-transparent"}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <Link href="/" className="flex-shrink-0 flex items-center">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="h-8 w-auto"
                      src="/images/logo.png"
                      alt="Waggle"
                    />
                  </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                  {navigation.map((item) => (
                    <NavItem key={item.name} item={item} />
                  ))}
                </div>

                {/* Mobile menu button */}
                <div className="flex items-center sm:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                    <span className="sr-only">
                      {open ? "Close main menu" : "Open main menu"}
                    </span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            {/* Mobile menu */}
            <Transition
              show={open}
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Disclosure.Panel className="sm:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {navigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as={Link}
                      href={item.href}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
              </Disclosure.Panel>
            </Transition>
          </motion.div>
        </>
      )}
    </Disclosure>
  );
}