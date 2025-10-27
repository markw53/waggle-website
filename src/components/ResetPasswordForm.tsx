// src/components/ResetPasswordForm.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/auth';
import toast from 'react-hot-toast';

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';

const ResetPasswordForm: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword(email);
      toast.success('Password reset email sent! Please check your inbox.');
      setEmail(''); // Clear the input after success
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Failed to send reset email.');
      } else {
        toast.error('Failed to send reset email.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md shadow-lg border border-zinc-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-[#573a1c] dark:text-amber-200">
            Reset Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <Label 
                htmlFor="email"
                className="text-gray-900 dark:text-gray-100 font-medium"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="text-base bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 border-zinc-300 dark:border-zinc-600 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#8c5628] dark:bg-amber-700 text-white hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-medium"
            >
              Send Reset Email
            </Button>
            <div className="text-center text-sm">
              <Link 
                to="/" 
                className="text-[#5d4631] dark:text-amber-300 hover:text-[#8c5628] dark:hover:text-amber-200 underline transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordForm;