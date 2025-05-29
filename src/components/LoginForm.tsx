import { useState } from 'react';
import { auth } from '../firebase';
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
      toast.error(err instanceof Error ? err.message : 'An unexpected error occurred.');
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
    <div className="max-w-md mx-auto p-8 bg-white/90 rounded-xl shadow-lg flex flex-col items-center">
      <form onSubmit={handleAuth} className="w-full">
        <h2 className="text-xl font-semibold text-[#573a1c] mb-4 text-center">
          Sign In to Waggle
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full mb-2 px-3 py-2 border border-[#b88a6a] rounded-md bg-[#f9f4f1] text-base"
        />
        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full mb-2 px-3 py-2 border border-[#b88a6a] rounded-md bg-[#f9f4f1] text-base"
        />

        <button
          type="submit"
          className="w-full bg-[#8c5628] text-white py-2 rounded-md text-base mt-2 hover:opacity-85 transition-opacity"
        >
          Login
        </button>

        <button
          type="button"
          onClick={handleGoogle}
          className="w-full bg-[#e94235] text-white py-2 rounded-md text-base mt-2 hover:opacity-85 transition-opacity"
        >
          Sign in with Google
        </button>

        <button
          type="button"
          onClick={handleForgot}
          className="w-full text-[#5d4631] underline text-sm mt-2 bg-transparent hover:opacity-85 transition-opacity"
        >
          Forgot password?
        </button>

        <div className="mt-4 flex flex-col items-center gap-1 text-sm">
          <Link to="/register" className="text-[#5d4631] underline hover:opacity-85">
            Don't have an account? Register
          </Link>
          <Link to="/reset-password" className="text-[#5d4631] underline hover:opacity-85">
            Reset Password
          </Link>
        </div>
      </form>
    </div>
  );
}
