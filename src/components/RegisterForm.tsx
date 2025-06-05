// src/components/RegisterForm.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/auth';
import toast from 'react-hot-toast';
// import './LoginForm.css';

const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password);
      toast.success('Registration successful! Please login.');
      setTimeout(() => navigate('/'), 1200);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Registration failed.");
      } else {
        toast.error("Registration failed.");
      }
    }
  };

  return (
    <div className="login-box">
      <form onSubmit={handleRegister}>
        <h2>Register for Waggle</h2>
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