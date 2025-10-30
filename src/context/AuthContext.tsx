import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { auth } from '@/firebase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Send verification email
    await sendEmailVerification(userCredential.user);
    
    toast.success('Account created! Please check your email to verify your account.', {
      duration: 5000,
    });
  };

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if email is verified
    if (!userCredential.user.emailVerified) {
      toast.error(
        'Please verify your email before logging in. Check your inbox for the verification link.',
        { duration: 6000 }
      );
      await signOut(auth);
      throw new Error('Email not verified');
    }
    
    toast.success('Login successful!');
  };

  const logout = async () => {
    await signOut(auth);
    toast.success('Logged out successfully');
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
    toast.success('Password reset email sent! Check your inbox.');
  };

  const resendVerificationEmail = async () => {
    if (user && !user.emailVerified) {
      await sendEmailVerification(user);
      toast.success('Verification email sent! Check your inbox.');
    } else {
      toast.error('No user to send verification email to.');
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    resetPassword,
    resendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}