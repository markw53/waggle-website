// src/components/ResetPasswordForm.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/auth';
import './LoginForm.css';

const ResetPasswordForm: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await resetPassword(email);
      setMessage('Password reset email sent! Please check your inbox.');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message || "Failed to send reset email.");
      } else {
        setMessage("Failed to send reset email.");
      }
    }
  };

  return (
    <div className="login-box">
      <form onSubmit={handleReset}>
        <h2>Reset Password</h2>
        {message && <div className="login-message">{message}</div>}
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Email</button>
        <div className="login-links">
          <Link to="/">Back to Login</Link>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordForm;