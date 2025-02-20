// src/pages/index.tsx
import FAQ from "../../components/client/FAQ/FAQ";
import RootLayout from "@/src/app/layout";

export default function Home() {
  return (
    <RootLayout>
      {/* Other sections */}
      <FAQ />
      {/* Other sections */}
    </RootLayout>
  );
}
