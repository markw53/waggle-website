// src/app/layout.tsx
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation"; // to handle routing

// Optional: Add a function to toggle dark mode
const toggleDarkMode = () => {
  const currentMode = localStorage.getItem("darkMode");
  if (currentMode === "enabled") {
    localStorage.setItem("darkMode", "disabled");
    document.documentElement.classList.remove("dark");
  } else {
    localStorage.setItem("darkMode", "enabled");
    document.documentElement.classList.add("dark");
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname(); // Optional: to handle different paths and layouts

  // Check if dark mode is enabled on initial load
  useEffect(() => {
    const darkModeStatus = localStorage.getItem("darkMode");
    if (darkModeStatus === "enabled") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Your Website</title>
      </head>
      <body className={`bg-background text-text dark:bg-dark-background dark:text-dark-text`}>
        {/* Optional: Dark mode toggle button */}
        <button
          onClick={toggleDarkMode}
          className="p-2 bg-primary text-white rounded-md dark:bg-dark-text dark:text-dark-background"
        >
          Toggle Dark Mode
        </button>

        <div className="container mx-auto p-4">
          {/* Your Layout Content */}
          {children}
        </div>
      </body>
    </html>
  );
}
