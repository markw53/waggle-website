// src/components/LoginForm.tsx
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

import './LoginForm.css';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful! Welcome to Waggle.');
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  const handleGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Logged in with Google!');
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="login-box">
      <form onSubmit={handleAuth}>
        <h2>Sign In to Waggle</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          autoComplete="current-password"
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">
          Login
        </button>
        <button type="button" className="google-btn" onClick={handleGoogle}>
          Sign in with Google
        </button>
        <button
          type="button"
          className="forgot-btn"
          onClick={handleForgot}
        >
          Forgot password?
        </button>
        <div className="login-links">
          <Link to="/register">Don't have an account? Register</Link>
          <Link to="/reset-password">Reset Password</Link>
        </div>
      </form>
    </div>
  );
}