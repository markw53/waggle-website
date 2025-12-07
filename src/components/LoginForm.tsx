import { useState } from 'react';
import { auth } from '@/firebase';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  // FacebookAuthProvider,
  signInWithPopup,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  getMultiFactorResolver,
  signInWithPhoneNumber
} from 'firebase/auth';
import type { MultiFactorResolver, MultiFactorError, ConfirmationResult } from 'firebase/auth';

// Extend Window interface for recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [show2FAPrompt, setShow2FAPrompt] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const navigate = useNavigate();

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-login', {
        size: 'invisible',
      });
    }
  };

  // Format UK phone number as user types
  const formatUKPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // If starts with 44, it's already in international format
    if (cleaned.startsWith('44')) {
      const digits = cleaned.slice(2);
      if (digits.length <= 4) {
        return `+44 ${digits}`;
      } else if (digits.length <= 7) {
        return `+44 ${digits.slice(0, 4)} ${digits.slice(4)}`;
      } else {
        return `+44 ${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
      }
    }
    
    // If starts with 0, convert to +44
    if (cleaned.startsWith('0')) {
      const digits = cleaned.slice(1);
      if (digits.length <= 4) {
        return `+44 ${digits}`;
      } else if (digits.length <= 7) {
        return `+44 ${digits.slice(0, 4)} ${digits.slice(4)}`;
      } else {
        return `+44 ${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
      }
    }
    
    // Otherwise format assuming UK number without prefix
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 4) {
      return `+44 ${cleaned}`;
    } else if (cleaned.length <= 7) {
      return `+44 ${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    } else {
      return `+44 ${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 11)}`;
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatUKPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handlePhoneLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    // Remove spaces for Firebase
    const formattedPhone = phoneNumber.replace(/\s/g, '');

    // Validate UK phone number format
    if (!formattedPhone.match(/^\+44\d{10}$/)) {
      toast.error('Please enter a valid UK phone number');
      return;
    }

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      
      if (!appVerifier) {
        toast.error('reCAPTCHA verification failed');
        return;
      }

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      
      setConfirmationResult(confirmation);
      setShowPhoneVerification(true);
      toast.success('Verification code sent to your phone!');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Phone login error:', error);
        toast.error(`Failed to send code: ${error.message}`);
      }
      // Reset recaptcha on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    }
  };

  const handleVerifyPhoneCode = async () => {
    if (!confirmationResult || !verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }

    try {
      await confirmationResult.confirm(verificationCode);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Verification failed: ${error.message}`);
      }
    }
  };

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful! Welcome to Waggle.');
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error && "code" in err) {
        console.error("Firebase error:", err);
        const errorCode = (err as { code: string }).code;
        
        if (errorCode === 'auth/multi-factor-auth-required') {
          await handle2FAChallenge(err as MultiFactorError);
        } else {
          switch (errorCode) {
            case "auth/invalid-email":
              toast.error("Invalid email address.");
              break;
            case "auth/user-not-found":
              toast.error("No user found with this email.");
              break;
            case "auth/wrong-password":
              toast.error("Incorrect password.");
              break;
            default:
              toast.error("Login failed. " + errorCode);
          }
        }
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handle2FAChallenge = async (error: MultiFactorError) => {
    try {
      const res = getMultiFactorResolver(auth, error as MultiFactorError);
      setResolver(res);

      setupRecaptcha();
      const recaptchaVerifier = window.recaptchaVerifier;

      if (!recaptchaVerifier) {
        toast.error('reCAPTCHA verification failed');
        return;
      }

      const phoneInfoOptions = {
        multiFactorHint: res.hints[0],
        session: res.session,
      };

      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verId = await phoneAuthProvider.verifyPhoneNumber(
        phoneInfoOptions,
        recaptchaVerifier
      );

      setVerificationId(verId);
      setShow2FAPrompt(true);
      toast.success('2FA code sent to your phone!');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`2FA setup failed: ${error.message}`);
      }
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationId || !resolver) return;

    try {
      const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

      await resolver.resolveSignIn(multiFactorAssertion);
      toast.success('Login successful with 2FA!');
      navigate('/dashboard');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Verification failed: ${error.message}`);
      }
    }
  };

  const handleGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Logged in with Google!');
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  {/*
  const handleFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Logged in with Facebook!');
      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error && "code" in err) {
        const errorCode = (err as { code: string }).code;
        if (errorCode === 'auth/account-exists-with-different-credential') {
          toast.error('An account already exists with this email using a different sign-in method.');
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };
  */}

  const handleForgot = async () => {
    if (!email) {
      toast.error('Please enter your email to reset your password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent.');
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  // Phone Verification Prompt
  if (showPhoneVerification) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white/95 dark:bg-zinc-800/95 rounded-xl shadow-lg backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-[#573a1c] dark:text-amber-200 mb-4 text-center">
          📱 Verify Your Phone
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
          Enter the 6-digit code sent to {phoneNumber}
        </p>

        <input
          type="text"
          placeholder="123456"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
          maxLength={6}
          className="w-full mb-4 px-3 py-2 border border-[#b88a6a] dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500"
        />

        <button
          onClick={handleVerifyPhoneCode}
          disabled={verificationCode.length !== 6}
          className="w-full bg-[#8c5628] dark:bg-amber-700 text-white py-2 rounded-md font-medium hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Verify & Login
        </button>

        <button
          onClick={() => {
            setShowPhoneVerification(false);
            setVerificationCode('');
            setConfirmationResult(null);
          }}
          className="w-full mt-2 text-sm text-gray-600 dark:text-gray-400 hover:underline"
        >
          Cancel
        </button>
        <div id="recaptcha-container-login"></div>
      </div>
    );
  }

  // 2FA Prompt Modal
  if (show2FAPrompt) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white/95 dark:bg-zinc-800/95 rounded-xl shadow-lg backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-[#573a1c] dark:text-amber-200 mb-4 text-center">
          🔐 Two-Factor Authentication
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
          Enter the 6-digit code sent to your phone
        </p>

        <input
          type="text"
          placeholder="123456"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          maxLength={6}
          className="w-full mb-4 px-3 py-2 border border-[#b88a6a] dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500"
        />

        <button
          onClick={handleVerify2FA}
          disabled={verificationCode.length !== 6}
          className="w-full bg-[#8c5628] dark:bg-amber-700 text-white py-2 rounded-md font-medium hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Verify
        </button>

        <button
          onClick={() => {
            setShow2FAPrompt(false);
            setVerificationCode('');
          }}
          className="w-full mt-2 text-sm text-gray-600 dark:text-gray-400 hover:underline"
        >
          Cancel
        </button>
        <div id="recaptcha-container-login"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-white/95 dark:bg-zinc-800/95 rounded-xl shadow-lg flex flex-col items-center backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-[#573a1c] dark:text-amber-200 mb-4 text-center">
        Sign In to Waggle
      </h2>

      {/* Login Method Toggle */}
      <div className="w-full flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setLoginMethod('email')}
          className={`flex-1 py-2 rounded-md font-medium transition-colors ${
            loginMethod === 'email'
              ? 'bg-[#8c5628] dark:bg-amber-700 text-white'
              : 'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-600'
          }`}
        >
          📧 Email
        </button>
        <button
          type="button"
          onClick={() => setLoginMethod('phone')}
          className={`flex-1 py-2 rounded-md font-medium transition-colors ${
            loginMethod === 'phone'
              ? 'bg-[#8c5628] dark:bg-amber-700 text-white'
              : 'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-600'
          }`}
        >
          📱 Phone
        </button>
      </div>

      {loginMethod === 'email' ? (
        <form onSubmit={handleAuth} className="w-full">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full mb-2 px-3 py-2 border border-[#b88a6a] dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 text-base placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500"
          />
          <input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full mb-2 px-3 py-2 border border-[#b88a6a] dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 text-base placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500"
          />

          <button
            type="submit"
            className="w-full bg-[#8c5628] dark:bg-amber-700 text-white py-2 rounded-md text-base font-medium mt-2 hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors"
          >
            Login with Email
          </button>

          <button
            type="button"
            onClick={handleForgot}
            className="w-full text-[#5d4631] dark:text-amber-300 underline text-sm mt-4 bg-transparent hover:text-[#8c5628] dark:hover:text-amber-200 transition-colors"
          >
            Forgot password?
          </button>
        </form>
      ) : (
        <form onSubmit={handlePhoneLogin} className="w-full">
          <input
            type="tel"
            placeholder="07123 456 789"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            required
            maxLength={17} // +44 xxxx xxx xxxx
            className="w-full mb-2 px-3 py-2 border border-[#b88a6a] dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 text-base placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            UK mobile number (will be formatted as +44 xxxx xxx xxxx)
          </p>

          <button
            type="submit"
            className="w-full bg-[#8c5628] dark:bg-amber-700 text-white py-2 rounded-md text-base font-medium mt-2 hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors"
          >
            Send Verification Code
          </button>
        </form>
      )}

      <div className="w-full mt-4 space-y-2">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-zinc-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-zinc-800 text-gray-500 dark:text-gray-400">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="w-full bg-[#e94235] dark:bg-red-600 text-white py-2 rounded-md text-base font-medium hover:bg-[#d33426] dark:hover:bg-red-500 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>
      </div>

      <div className="mt-4 flex flex-col items-center gap-1 text-sm">
        <Link 
          to="/register" 
          className="text-[#5d4631] dark:text-amber-300 underline hover:text-[#8c5628] dark:hover:text-amber-200 transition-colors"
        >
          Don't have an account? Register
        </Link>
        <Link 
          to="/reset-password" 
          className="text-[#5d4631] dark:text-amber-300 underline hover:text-[#8c5628] dark:hover:text-amber-200 transition-colors"
        >
          Reset Password
        </Link>
      </div>

      <div id="recaptcha-container-login"></div>
    </div>
  );
}