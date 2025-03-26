import Image from "next/image";
import Link from "next/link";
import Header from "./components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
          Turning your ideas into <br /> a digital reality
        </h1>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-2xl">
          As a company, we are dedicated to building great-looking and responsive websites and applications for your needs.
        </p>
        <div className="mt-6 flex space-x-4">
          <Link
            href="/get-started"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Get started
          </Link>
          <Link
            href="/services"
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
          >
            Services
          </Link>
        </div>
      </main>
    </div>
  );
}
