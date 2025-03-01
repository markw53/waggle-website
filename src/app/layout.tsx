// src/app/layout.tsx
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Header from "../components/client/Header/Header";
import Footer from "../components/Footer";
import "../styles/globals.css";
import "../styles/animations.css";
import "../styles/assets.css"; // Add this new import

// Configure Inter font with more options
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  // Add specific weights if needed
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Waggle - The Premier Dog Mating App",
  description: "Find the perfect match for your beloved companion with Waggle, the leading dog mating and breeding platform.",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  themeColor: '#ffffff',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html 
      lang="en" 
      className={`scroll-smooth ${inter.variable}`}
    >
      <head>
        {/* Add preload for critical assets */}
        <link
          rel="preload"
          href="/images/logos/full-logo.png"
          as="image"
          type="image/png"
        />
      </head>
      <body className={inter.className}>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#22c55e',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
      </body>
    </html>
  );
}