// src/components/LoginForm.jsx
import { useState } from 'react';
import { auth } from '../firebase';
import { Link } from 'react-router-dom';
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
  // Removed isRegister and setIsRegister since registration is not toggled in this form
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      if (err instanceof Error) {       
        setMessage(err.message);
          } else {
        setMessage('An unexpected error occurred.');
        }                    
      }
    };

  const handleGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage('An unexpected error occurred.');
      }
   }
  };

  const handleForgot = async () => {
    if (!email) {
      setMessage('Please enter your email to reset your password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent.');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="login-box">
      <form onSubmit={handleAuth}>
        <h2>Sign In to Waggle</h2>
        {message && <div className="login-message">{message}</div>}
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
        </div>
      </form>
    </div>
  );
}