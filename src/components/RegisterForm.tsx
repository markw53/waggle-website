// src/components/RegisterForm.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/auth';
import './LoginForm.css';

const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await register(email, password);
      setMessage('Registration successful! Please login.');
      setTimeout(() => navigate('/'), 1200);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message || "Registration failed.");
      } else {
        setMessage("Registration failed.");
      }
    }
  };

  return (
    <div className="login-box">
      <form onSubmit={handleRegister}>
        <h2>Register for Waggle</h2>
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
          autoComplete="new-password"
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
        <div className="login-links">
          <Link to="/">Already have an account? Login</Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;