// src/app/page.tsx
import { Suspense } from "react";
import Hero from "../src/components/sections/Hero";
import Features from "../src/components/sections/Features";
import HowItWorks from "../src/components/sections/HowItWorks";
import FAQ from "../src/components/sections/FAQ";
import EmailSignup from "../src/components/sections/EmailSignup";
import LoadingSpinner from "../src/components/common/LoadingSpinner";

export default function Home() {
  return (
    <main>
      <Hero />
      <Features />
      <HowItWorks />
      <Suspense fallback={<LoadingSpinner />}>
        <FAQ />
      </Suspense>
      <EmailSignup />
    </main>
  );
}


