// src/app/layout.tsx
import { Inter } from "next/font/google";
import Header from "../components/client/Header/Header";
import Footer from "../components/Footer";
import "../styles/globals.css";
import "../styles/animations.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Waggle - The Premier Dog Mating App",
  description:
    "Find the perfect match for your beloved companion with Waggle, the leading dog mating and breeding platform."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
