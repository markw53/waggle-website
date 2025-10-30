import { useAuth } from '@/context';
import { useState } from 'react';

const EmailVerificationBanner: React.FC = () => {
  const { user, resendVerificationEmail } = useAuth();
  const [sending, setSending] = useState(false);

  if (!user || user.emailVerified) {
    return null;
  }

  const handleResend = async () => {
    setSending(true);
    try {
      await resendVerificationEmail();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-500 dark:bg-amber-600 text-white px-4 py-3 shadow-md">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-semibold">Email not verified</p>
            <p className="text-sm">Please verify your email address to access all features.</p>
          </div>
        </div>
        <button
          onClick={handleResend}
          disabled={sending}
          className="px-4 py-2 bg-white text-amber-600 rounded-lg hover:bg-amber-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {sending ? 'Sending...' : 'Resend Email'}
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;