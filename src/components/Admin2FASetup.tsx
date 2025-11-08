import { useState } from 'react';
import { 
  multiFactor, 
  PhoneAuthProvider, 
  PhoneMultiFactorGenerator,
  RecaptchaVerifier 
} from 'firebase/auth';
import { auth } from '@/firebase';
import { useAuth } from '@/context/useAuth';
import toast from 'react-hot-toast';

export default function Admin2FASetup() {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [loading, setLoading] = useState(false);

  // Check if 2FA is already enabled
  const is2FAEnabled = user && multiFactor(user).enrolledFactors.length > 0;

  const handleSendCode = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Setup invisible reCAPTCHA
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });

      const multiFactorSession = await multiFactor(user).getSession();
      const phoneAuthProvider = new PhoneAuthProvider(auth);

      // ✅ Fixed: Pass phone number with session, and recaptchaVerifier as second arg
      const phoneInfoOptions = {
        phoneNumber,
        session: multiFactorSession,
      };

      const verId = await phoneAuthProvider.verifyPhoneNumber(
        phoneInfoOptions,
        recaptchaVerifier // ✅ Pass recaptcha as second argument
      );

      setVerificationId(verId);
      setStep('verify');
      toast.success('Verification code sent to your phone!');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
        console.error('2FA setup error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!user || !verificationId) return;

    setLoading(true);
    try {
      const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

      await multiFactor(user).enroll(multiFactorAssertion, 'Admin Phone');
      toast.success('2FA enabled successfully! Your admin account is now secure.');
      setStep('phone');
      setPhoneNumber('');
      setVerificationCode('');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Verification failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!user) return;
    
    const confirmed = confirm('Are you sure you want to disable 2FA? This will reduce your account security.');
    if (!confirmed) return;

    setLoading(true);
    try {
      const enrolledFactors = multiFactor(user).enrolledFactors;
      if (enrolledFactors.length > 0) {
        await multiFactor(user).unenroll(enrolledFactors[0]);
        toast.success('2FA disabled');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (is2FAEnabled) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-1">
              2FA Enabled ✓
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mb-4">
              Your admin account is protected with two-factor authentication.
            </p>
            <button
              onClick={handleDisable2FA}
              disabled={loading}
              className="text-sm text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
            >
              Disable 2FA
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6 rounded-lg">
      <div className="flex items-start gap-3 mb-4">
        <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-1">
            Enable Two-Factor Authentication
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
            As an admin, we strongly recommend enabling 2FA to protect your account.
          </p>
        </div>
      </div>

      {step === 'phone' ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="phone-2fa" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <input
              id="phone-2fa"
              type="tel"
              placeholder="+1 234 567 8900"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Include country code (e.g., +1 for US/Canada)
            </p>
          </div>
          <button
            onClick={handleSendCode}
            disabled={loading || !phoneNumber}
            className="w-full bg-amber-700 hover:bg-amber-600 text-white py-2 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
          <div id="recaptcha-container"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Verification Code
            </label>
            <input
              id="verification-code"
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 text-center text-2xl tracking-widest"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter the 6-digit code sent to {phoneNumber}
            </p>
          </div>
          <button
            onClick={handleVerifyCode}
            disabled={loading || verificationCode.length !== 6}
            className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
          </button>
          <button
            onClick={() => {
              setStep('phone');
              setVerificationCode('');
            }}
            className="w-full text-sm text-gray-600 dark:text-gray-400 hover:underline"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}