// src/components/RegisterForm.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/auth';
import toast from 'react-hot-toast';

import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';

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
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md shadow-lg border border-zinc-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-[#573a1c] dark:text-amber-200">
            Register for Waggle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            <EmailInput email={email} setEmail={setEmail} />
            <PasswordInput password={password} setPassword={setPassword} />
            <Button 
              type="submit" 
              className="w-full bg-[#8c5628] dark:bg-amber-700 text-white hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-medium"
            >
              Register
            </Button>
            <div className="text-center text-sm">
              <Link 
                to="/" 
                className="text-[#5d4631] dark:text-amber-300 hover:text-[#8c5628] dark:hover:text-amber-200 underline transition-colors"
              >
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
    <Label 
      htmlFor="email"
      className="text-gray-900 dark:text-gray-100 font-medium"
    >
      Email
    </Label>
    <Input
      className="text-base bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 border-zinc-300 dark:border-zinc-600 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500 focus:border-transparent" 
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
    <Label 
      htmlFor="password"
      className="text-gray-900 dark:text-gray-100 font-medium"
    >
      Password
    </Label>
    <Input
      className="text-base bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 border-zinc-300 dark:border-zinc-600 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500 focus:border-transparent"
      id="password"
      type="password"
      placeholder="Enter your password"
      autoComplete="new-password"
      value={password}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
      required
    />
  </div>
);

export default RegisterForm;