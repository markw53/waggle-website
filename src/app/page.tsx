// src/app/page.tsx
import { Suspense } from "react";
import Hero from "../components/client/Hero";
import Header from "../components/client/Header/Header";
import FAQ from "../components/client/FAQ/FAQ";
import EmailSignup from "../components/client/EmailSignup/EmailSignup";
import LoadingSpinner from "../components/client/LoadingSpinner/LoadingSpinner";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Suspense fallback={<LoadingSpinner />}>
        <FAQ />
      </Suspense>
      <EmailSignup />
    </main>
  );
}
