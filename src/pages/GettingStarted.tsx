import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context';
import { ROUTES } from '@/config/routes'; 

const GettingStarted: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const steps = [
    {
      number: 1,
      icon: '👤',
      title: 'Complete Your Profile',
      description: 'Add your details, location, and contact information so other breeders can connect with you.',
      action: 'Set Up Profile',
      route: ROUTES.PROFILE,
      completed: user?.displayName ? true : false,
    },
    {
      number: 2,
      icon: '🐕',
      title: 'Register Your Dogs',
      description: 'Add your dogs with health certifications, veterinary records, and breeding eligibility information.',
      action: 'Add Your First Dog',
      route: ROUTES.ADD_DOG, 
      completed: false, 
    },
    {
      number: 3,
      icon: '🔍',
      title: 'Browse Available Dogs',
      description: 'Search through our database of verified, health-tested dogs available for breeding.',
      action: 'Browse Dogs',
      route: ROUTES.DOGS, 
      completed: false,
    },
    {
      number: 4,
      icon: '💬',
      title: 'Connect with Breeders',
      description: 'Message dog owners directly to discuss breeding arrangements and schedule meetings.',
      action: 'View Messages',
      route: ROUTES.MESSAGES, 
      completed: false,
    },
    {
      number: 5,
      icon: '💕',
      title: 'Request Matches',
      description: 'Submit breeding match requests and manage your breeding calendar.',
      action: 'View Matches',
      route: ROUTES.MATCHES, 
      completed: false,
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-orange-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900"> {/* ✅ Fixed gradient class */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#573a1c] dark:text-amber-200 mb-4">
            Welcome to Waggle! 🐕
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your journey to responsible dog breeding starts here. Follow these steps to get started.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-6 mb-12">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Step Number & Icon */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                    step.completed 
                      ? 'bg-green-500' 
                      : 'bg-[#8c5628] dark:bg-amber-700'
                  }`}>
                    {step.completed ? '✓' : step.number}
                  </div>
                  <span className="text-4xl">{step.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {step.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(step.route)}
                    className={`px-6 py-2.5 rounded-lg font-semibold transition-colors ${
                      step.completed
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50'
                        : 'bg-[#8c5628] dark:bg-amber-700 text-white hover:bg-[#6d4320] dark:hover:bg-amber-600'
                    }`}
                  >
                    {step.completed ? '✓ Completed' : step.action} →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Key Features */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 p-8 mb-12">
          <h2 className="text-3xl font-bold text-[#573a1c] dark:text-amber-200 mb-6 text-center">
            Why Choose Waggle?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">
                Verified Health Records
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All dogs require veterinary verification and health clearances
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">
                Safe & Secure
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Private messaging and verified breeder profiles
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🐾</div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">
                Responsible Breeding
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Age restrictions and health requirements protect dog welfare
              </p>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-8">
          <h3 className="font-bold text-xl text-amber-900 dark:text-amber-200 mb-4 flex items-center gap-2">
            <span>⚠️</span> Important: Responsible Breeding Requirements
          </h3>
          <ul className="space-y-2 text-amber-800 dark:text-amber-300">
            <li className="flex items-start gap-2">
              <span className="text-xl">•</span>
              <span>All breeding dogs must be at least 2 years old</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">•</span>
              <span>Veterinary verification and health certificates are mandatory</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">•</span>
              <span>Brucellosis testing required within the last 6 months</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">•</span>
              <span>Vaccinations must be up to date</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">•</span>
              <span>All dogs require admin approval before appearing in search results</span>
            </li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => navigate(ROUTES.PROFILE)} 
            className="p-6 bg-white dark:bg-zinc-800 border-2 border-[#8c5628] dark:border-amber-600 rounded-xl hover:bg-amber-50 dark:hover:bg-zinc-700 transition-colors text-center"
          >
            <div className="text-3xl mb-2">👤</div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">My Profile</div>
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.MY_DOGS)} 
            className="p-6 bg-white dark:bg-zinc-800 border-2 border-[#8c5628] dark:border-amber-600 rounded-xl hover:bg-amber-50 dark:hover:bg-zinc-700 transition-colors text-center"
          >
            <div className="text-3xl mb-2">🐕</div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">My Dogs</div>
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.DOGS)} 
            className="p-6 bg-white dark:bg-zinc-800 border-2 border-[#8c5628] dark:border-amber-600 rounded-xl hover:bg-amber-50 dark:hover:bg-zinc-700 transition-colors text-center"
          >
            <div className="text-3xl mb-2">🔍</div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">Browse Dogs</div>
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.ANALYTICS)} 
            className="p-6 bg-white dark:bg-zinc-800 border-2 border-[#8c5628] dark:border-amber-600 rounded-xl hover:bg-amber-50 dark:hover:bg-zinc-700 transition-colors text-center"
          >
            <div className="text-3xl mb-2">📊</div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">Analytics</div>
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Need Help?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Have questions about using Waggle? We're here to help!
          </p>
          <a
            href="https://www.devonsdigitalsolutions.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default GettingStarted;