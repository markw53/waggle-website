import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { auth } from '@/firebase';
import toast from 'react-hot-toast';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const actionCode = searchParams.get('oobCode');

      if (!actionCode) {
        toast.error('Invalid verification link');
        setVerifying(false);
        return;
      }

      try {
        await applyActionCode(auth, actionCode);
        setSuccess(true);
        toast.success('Email verified successfully! 🎉');
      } catch (error) {
        console.error('Error verifying email:', error);
        toast.error('Failed to verify email. The link may have expired.');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#8c5628] dark:border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">{success ? '✅' : '❌'}</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {success ? 'Email Verified!' : 'Verification Failed'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {success
              ? 'Your email has been verified successfully. You can now access all features.'
              : 'The verification link is invalid or has expired. Please request a new one.'}
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full px-6 py-3 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-semibold"
        >
          {success ? 'Go to Login' : 'Back to Home'}
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;