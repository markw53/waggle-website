import { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import app from "../lib/firebase";
import Link from "next/link";

export default function ForgotPassword() {
  const auth = getAuth(app);
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      router.push("/reset-confirmation"); // Redirect to confirmation page
    } catch (err) {
      setError("Failed to send reset email. Please check your email address.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-4">Reset Password</h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 border rounded-lg focus:ring focus:ring-indigo-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700">
            Send Reset Email
          </button>
        </form>

        <div className="text-center mt-4">
          <Link href="/login" className="text-indigo-500 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>

      <footer className="mt-8 w-full text-center p-4 bg-[#E2B007] text-black">
        &copy; 2025 Waggle | Devon's Digital Solutions
      </footer>
    </div>
  );
}
