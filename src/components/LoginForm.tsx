import { useState } from 'react';
import { auth } from '@/firebase';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  FacebookAuthProvider, // 👈 add this
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

  // 👇 NEW: Facebook login handler
  const handleFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Logged in with Facebook!');
    } catch (err) {
      if (err instanceof Error && "code" in err) {
        const errorCode = (err as { code: string }).code;
        if (errorCode === 'auth/account-exists-with-different-credential') {
          toast.error('An account already exists with this email using a different sign-in method.');
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error('An unexpected error occurred.');
      }
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

        {/* Social login buttons */}
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full bg-[#e94235] dark:bg-red-600 text-white py-2 rounded-md text-base font-medium hover:bg-[#d33426] dark:hover:bg-red-500 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          {/* 👇 NEW Facebook button */}
          <button
            type="button"
            onClick={handleFacebook}
            className="w-full bg-[#1877F2] dark:bg-[#1877F2] text-white py-2 rounded-md text-base font-medium hover:bg-[#166FE5] dark:hover:bg-[#166FE5] transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Sign in with Facebook
          </button>
        </div>

        <button
          type="button"
          onClick={handleForgot}
          className="w-full text-[#5d4631] dark:text-amber-300 underline text-sm mt-4 bg-transparent hover:text-[#8c5628] dark:hover:text-amber-200 transition-colors"
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