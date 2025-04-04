"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "./lib/firebase";

export default function Page() {
  const auth = getAuth(app);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/dashboard"); // Redirect to Dashboard if logged in
      } else {
        router.replace("/login"); // Redirect to Login if not logged in
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return null; // Page is only used for redirection
}
