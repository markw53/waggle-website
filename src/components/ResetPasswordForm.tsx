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
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Failed to send reset email.');
      } else {
        toast.error('Failed to send reset email.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Send Reset Email
            </Button>
            <div className="text-center text-sm">
              <Link to="/" className="text-muted-foreground hover:underline">
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
