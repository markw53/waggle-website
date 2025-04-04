import { useState, FormEvent } from "react";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import app from "../lib/firebase"; // Firebase config
import Link from "next/link";

export default function Login() {
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful!");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      console.log("Google login successful!");
    } catch (err) {
      setError("Google login failed");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
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
            Login
          </button>
        </form>

        <div className="text-right mt-2">
          <Link href="/forgot-password" className="text-sm text-indigo-500 hover:underline">
            Forgot Password?
          </Link>
        </div>

        <div className="mt-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center bg-red-500 text-white p-3 rounded-lg hover:bg-red-600"
          >
            Sign in with Google
          </button>
        </div>

        <div className="flex justify-between mt-4 text-sm">
          <p>Don't have an account?</p>
          <Link href="/signup" className="text-indigo-500 hover:underline">
            Signup
          </Link>
        </div>
      </div>

      <footer className="mt-8 w-full text-center p-4 bg-[#E2B007] text-black">
        &copy; 2025 Waggle | Devon's Digital Solutions
      </footer>
    </div>
  );
}
