"use client";

import { useState } from "react";
import Link from "next/link";
import { FaPaw, FaSun, FaMoon, FaBars, FaTimes } from "react-icons/fa";

export default function Header() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md py-4 px-6 fixed w-full top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center text-2xl font-bold text-gray-900 dark:text-white">
          <FaPaw className="text-blue-600 mr-2" /> Waggle
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link href="/studs" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
            Browse Studs
          </Link>
          <Link href="/find-mate" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
            Find a Mate
          </Link>
          <Link href="/resources" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
            Resources
          </Link>
          <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
            Contact
          </Link>
        </nav>

        {/* Actions: Dark Mode Toggle & CTA Button */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <button onClick={() => setDarkMode((prev) => !prev)} className="text-gray-700 dark:text-gray-300">
            {darkMode ? <FaSun className="text-yellow-400 text-xl" /> : <FaMoon className="text-xl" />}
          </button>

          {/* List Dog CTA */}
          <Link
            href="/post-dog"
            className="hidden md:block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            List Your Dog
          </Link>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMenuOpen((prev) => !prev)} className="md:hidden text-2xl">
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col bg-white dark:bg-gray-800 p-4 space-y-4 mt-2 shadow-lg">
          <Link href="/studs" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
            Browse Studs
          </Link>
          <Link href="/find-mate" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
            Find a Mate
          </Link>
          <Link href="/resources" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
            Resources
          </Link>
          <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
            Contact
          </Link>
          <Link
            href="/post-dog"
            className="bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition"
          >
            List Your Dog
          </Link>
        </div>
      )}
    </header>
  );
}
