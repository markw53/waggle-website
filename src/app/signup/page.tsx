"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import app from "../lib/firebase";
import Link from "next/link";

export default function Signup() {
  const auth = getAuth(app);
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Handle email/password signup
  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard"); // Redirect after signup
    } catch (err) {
      setError("Failed to create account. Please try again.");
    }
  };

  // Handle Google sign-up
  const handleGoogleSignup = async () => {
    setError("");
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard"); // Redirect after Google signup
    } catch (err) {
      setError("Google sign-up failed. Try again.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-4">Create an Account</h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg focus:ring focus:ring-indigo-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:ring focus:ring-indigo-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700">
            Sign Up
          </button>
        </form>

        <div className="text-center my-4">or</div>

        <button
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center bg-red-600 text-white p-3 rounded-lg hover:bg-red-700"
        >
          Sign Up with Google
        </button>

        <div className="flex justify-between items-center mt-4 text-sm">
          <p>Already have an account?</p>
          <Link href="/login" className="text-indigo-500 hover:underline">
            Login
          </Link>
        </div>
      </div>

      <footer className="mt-8 w-full text-center p-4 bg-[#E2B007] text-black">
        &copy; 2025 Waggle | Devon's Digital Solutions
      </footer>
    </div>
  );
}
