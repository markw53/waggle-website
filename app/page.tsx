"use client";
import { useContext } from "react";
import Link from "next/link";
import Header from "./components/Header";
import { ThemeContext, ThemeProvider } from "./contexts/ThemeContext";
import { themes } from "./config/theme";

export default function Home() {
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    throw new Error("ThemeContext is undefined. Make sure to wrap your component tree with ThemeProvider.");
  }

  const { theme } = themeContext;
  const currentTheme = theme === "dark" ? themes.dark.colors : themes.light.colors;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: currentTheme.background, color: currentTheme.text }}
    >
      <Header />
      <main className="flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Find the Perfect Mate for Your Dog
        </h1>
        <p className="mt-4 text-lg max-w-2xl">
          Connect with responsible dog owners and find a compatible mate for your furry friend.
        </p>
        <div className="mt-6 flex space-x-4">
          <Link
            href="/find-mate"
            className="px-6 py-3 rounded-lg transition"
            style={{
              backgroundColor: currentTheme.primary,
              color: currentTheme.white,
            }}
          >
            Find a Mate
          </Link>
          <Link
            href="/post-dog"
            className="px-6 py-3 rounded-lg transition"
            style={{
              backgroundColor: currentTheme.secondary,
              color: currentTheme.white,
            }}
          >
            List Your Dog
          </Link>
        </div>
      </main>
    </div>
  );
}
