// src/components/LoginForm.jsx
import { useState } from 'react';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword
} from 'firebase/auth';

import './LoginForm.css';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage('Registration successful! You can now log in.');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
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
        <h2>{isRegister ? 'Register for Waggle' : 'Sign In to Waggle'}</h2>
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
          {isRegister ? 'Register' : 'Login'}
        </button>
        <button type="button" className="google-btn" onClick={handleGoogle}>
          Sign in with Google
        </button>
        <div className="login-links">
          <button type="button" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Already have an account? Sign in" : "Don't have an account? Register"}
          </button>
          <button type="button" onClick={handleForgot}>
            Forgot password?
          </button>
        </div>
      </form>
    </div>
  );
}