import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <nav className="px-6 py-4 border-b border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex justify-between items-center shadow-sm">
      <span className="text-xl font-bold text-[#573a20] dark:text-amber-200">
        Welcome to Waggle
      </span>

      <div className="flex items-center gap-4">
        <Link
          to="/dashboard"
          className="text-[#573a20] dark:text-zinc-100 text-base font-medium bg-[#ffeedd] dark:bg-zinc-800 px-3 py-1.5 rounded-md shadow-sm hover:bg-[#f9deb3] dark:hover:bg-zinc-700 transition"
        >
          Home
        </Link>

        {/* Switch Toggle */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-amber-400 dark:peer-focus:ring-amber-500 rounded-full peer dark:bg-zinc-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-zinc-400"></div>
        </label>
      </div>
    </nav>
  );
}
