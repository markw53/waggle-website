// src/context/AuthProvider.tsx
import { useEffect, useState } from 'react';
import { setUserContext, clearUserContext } from '@/lib/sentry';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider
} from 'firebase/auth';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { AuthContext } from '@/context/AuthContext';
import type { UserProfile } from '@/types/user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        setUserContext({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });

        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            const userProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              name: user.displayName || '',
              photoURL: user.photoURL || '',
              createdAt: Timestamp.fromDate(new Date()),
            };
            await setDoc(userRef, userProfile);
            console.log('Created new user profile with photo:', user.photoURL);
          } else {
            const existingData = userSnap.data();
            if (user.photoURL && user.photoURL !== existingData.photoURL) {
              await setDoc(
                userRef,
                {
                  photoURL: user.photoURL,
                  displayName: user.displayName || existingData.displayName,
                  name: user.displayName || existingData.name,
                  updatedAt: Timestamp.fromDate(new Date()),
                },
                { merge: true }
              );
              console.log('Updated user profile photo:', user.photoURL);
            }
          }
        } catch (error: unknown) { // ✅ Fixed
          if (error instanceof Error) {
            console.error('Error syncing user profile:', error.message);
          } else {
            console.error('Unknown error syncing user profile:', error);
          }
        }
      } else {
        clearUserContext();
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await sendEmailVerification(userCredential.user);
    
    const userProfile: UserProfile = {
      uid: userCredential.user.uid,
      email: userCredential.user.email || email,
      displayName: userCredential.user.displayName || '',
      name: userCredential.user.displayName || '',
      photoURL: userCredential.user.photoURL || '',
      createdAt: Timestamp.fromDate(new Date()),
    };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
    
    toast.success('Account created! Please check your email to verify your account.', {
      duration: 5000,
    });
  };

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
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

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    toast.success('Login successful!');
  };

  const loginWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Login successful!');
    } catch (error: unknown) { // ✅ Fixed
      if (error instanceof Error && 'code' in error) {
        const firebaseError = error as { code: string };
        if (firebaseError.code === 'auth/account-exists-with-different-credential') {
          toast.error('An account already exists with the same email but different sign-in method.');
        } else {
          toast.error('Facebook login failed. Please try again.');
        }
      } else {
        toast.error('An unexpected error occurred.');
      }
      throw error;
    }
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
    loginWithGoogle,
    loginWithFacebook,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}