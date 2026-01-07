import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { ROUTES } from '@/config/routes';

export default function SubscriptionCancelled() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8 md:p-12">
        {/* Cancel Icon */}
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-6">
          <XCircle className="h-10 w-10 text-orange-600 dark:text-orange-400" />
        </div>

        {/* Cancel Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#573a1c] dark:text-amber-200 mb-3">
            Subscription Cancelled
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your payment was cancelled and no charges were made.
          </p>
        </div>

        {/* Information Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <div className="flex gap-3">
            <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                What happened?
              </h3>
              <p className="text-blue-800 dark:text-blue-400 text-sm">
                You cancelled the checkout process before completing your payment. 
                Don't worry - you haven't been charged anything and you can try again whenever you're ready.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Reminder */}
        <div className="mb-8">
          <h3 className="font-semibold text-[#573a1c] dark:text-amber-200 text-lg mb-4 text-center">
            Why upgrade to Premium?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-[#8c5628] dark:bg-amber-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">∞</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Unlimited dog profiles</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add as many dogs as you want</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-[#8c5628] dark:bg-amber-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">⭐</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Featured listings</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get more visibility for your dogs</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-[#8c5628] dark:bg-amber-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">💬</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Priority support</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get help when you need it</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(ROUTES.PRICING)}
            className="w-full bg-[#8c5628] dark:bg-amber-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-[#6d4320] dark:hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Try Again - View Pricing
          </button>
          
          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="w-full bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-gray-100 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Support Link */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-3">
            Have questions about our plans?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href="mailto:support@waggle-app.com" 
              className="text-[#8c5628] dark:text-amber-400 hover:underline font-medium text-sm text-center"
            >
              Contact Support
            </a>
            <span className="hidden sm:inline text-gray-400">•</span>
            <button
              onClick={() => navigate(ROUTES.PRICING)}
              className="text-[#8c5628] dark:text-amber-400 hover:underline font-medium text-sm"
            >
              View Plan Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}