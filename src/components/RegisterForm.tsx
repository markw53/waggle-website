// src/components/RegisterForm.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/auth';
import toast from 'react-hot-toast';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

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
        toast.error(err.message || 'Registration failed.');
      } else {
        toast.error('Registration failed.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Register for Waggle</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            <EmailInput email={email} setEmail={setEmail} />
            <PasswordInput
              password={password}
              setPassword={setPassword}
            />
            <Button type="submit" className="w-full">
              Register
            </Button>
            <div className="text-center text-sm">
              <Link to="/" className="text-muted-foreground hover:underline">
                Already have an account? Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

interface EmailInputProps {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
}

const EmailInput: React.FC<EmailInputProps> = ({ email, setEmail }) => (
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input
      id="email"
      type="email"
      placeholder="you@example.com"
      value={email}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
      required
    />
  </div>
);

interface PasswordInputProps {
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ password, setPassword }) => (
  <div className="space-y-2">
    <Label htmlFor="password">Password</Label>
    <Input
      id="password"
      type="password"
      placeholder="Enter your password"
      value={password}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
      required
    />
  </div>
);

export default RegisterForm;
