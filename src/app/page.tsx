// src/app/page.tsx
import { Suspense } from "react";
import { FAQ } from "../components/client/FAQ";
import { EmailSignup } from "../components/client/EmailSignup";
import { Header } from "../components/client/Header";
import { LoadingSpinner } from "../components/client/LoadingSpinner";

export default function Home() {
  return (
    <main>
      <Header />
      <Suspense fallback={<LoadingSpinner />}>
        <FAQ />
      </Suspense>
      <EmailSignup />
    </main>
  );
}
