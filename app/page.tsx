"use client";
import { useTheme } from "./contexts/ThemeContext"; // ✅ Import useTheme instead of ThemeContext
import Link from "next/link";
import Header from "./components/Header";

export default function Home() {
  const { theme, colors } = useTheme(); // ✅ Use useTheme() to get theme and colors

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: colors.background, color: colors.text }}
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
              backgroundColor: colors.primary,
              color: colors.white,
            }}
          >
            Find a Mate
          </Link>
          <Link
            href="/post-dog"
            className="px-6 py-3 rounded-lg transition"
            style={{
              backgroundColor: colors.secondary,
              color: colors.white,
            }}
          >
            List Your Dog
          </Link>
        </div>
      </main>
    </div>
  );
}
