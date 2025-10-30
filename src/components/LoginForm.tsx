import { useState } from 'react';
import { auth } from '@/firebase';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful! Welcome to Waggle.');
    } catch (err) {
      if (err instanceof Error && "code" in err) {
        console.error("Firebase error:", err);
        const errorCode = (err as { code: string }).code;
        switch (errorCode) {
          case "auth/invalid-email":
            toast.error("Invalid email address.");
            break;
          case "auth/user-not-found":
            toast.error("No user found with this email.");
            break;
          case "auth/wrong-password":
            toast.error("Incorrect password.");
            break;
          default:
            toast.error("Login failed. " + errorCode);
        }
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handleGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Logged in with Google!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  };

  const handleForgot = async () => {
    if (!email) {
      toast.error('Please enter your email to reset your password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white/95 dark:bg-zinc-800/95 rounded-xl shadow-lg flex flex-col items-center backdrop-blur-sm">
      <form onSubmit={handleAuth} className="w-full">
        <h2 className="text-xl font-semibold text-[#573a1c] dark:text-amber-200 mb-4 text-center">
          Sign In to Waggle
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full mb-2 px-3 py-2 border border-[#b88a6a] dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 text-base placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500"
        />
        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full mb-2 px-3 py-2 border border-[#b88a6a] dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 text-base placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500"
        />

        <button
          type="submit"
          className="w-full bg-[#8c5628] dark:bg-amber-700 text-white py-2 rounded-md text-base font-medium mt-2 hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors"
        >
          Login
        </button>

        <button
          type="button"
          onClick={handleGoogle}
          className="w-full bg-[#e94235] dark:bg-red-600 text-white py-2 rounded-md text-base font-medium mt-2 hover:bg-[#d33426] dark:hover:bg-red-500 transition-colors"
        >
          Sign in with Google
        </button>

        <button
          type="button"
          onClick={handleForgot}
          className="w-full text-[#5d4631] dark:text-amber-300 underline text-sm mt-2 bg-transparent hover:text-[#8c5628] dark:hover:text-amber-200 transition-colors"
        >
          Forgot password?
        </button>

        <div className="mt-4 flex flex-col items-center gap-1 text-sm">
          <Link 
            to="/register" 
            className="text-[#5d4631] dark:text-amber-300 underline hover:text-[#8c5628] dark:hover:text-amber-200 transition-colors"
          >
            Don't have an account? Register
          </Link>
          <Link 
            to="/reset-password" 
            className="text-[#5d4631] dark:text-amber-300 underline hover:text-[#8c5628] dark:hover:text-amber-200 transition-colors"
          >
            Reset Password
          </Link>
        </div>
      </form>
    </div>
  );
}