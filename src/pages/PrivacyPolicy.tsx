import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 sm:p-8 bg-white/95 dark:bg-zinc-800/95 rounded-xl shadow-xl backdrop-blur-sm border border-zinc-200 dark:border-zinc-700">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-[#8c5628] dark:text-amber-400 hover:text-[#6d4320] dark:hover:text-amber-300 font-medium transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="text-4xl font-bold text-[#573a1c] dark:text-amber-200 mb-4">
        Privacy Policy
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            1. Information We Collect
          </h2>
          <p>
            When you use Waggle, we collect the following information:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account Information:</strong> Email address, name, profile photo</li>
            <li><strong>Dog Information:</strong> Names, breeds, ages, photos, and descriptions</li>
            <li><strong>Usage Data:</strong> How you interact with our service</li>
            <li><strong>Location Data:</strong> If you choose to share your location</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            2. How We Use Your Information
          </h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and improve our dog breeding matching service</li>
            <li>Connect you with other dog owners</li>
            <li>Send you important updates about your account</li>
            <li>Ensure the safety and security of our platform</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            3. Information Sharing
          </h2>
          <p>
            We do not sell your personal information. We share information only when:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You explicitly choose to share it (e.g., dog profiles, contact info)</li>
            <li>Required by law or legal process</li>
            <li>Necessary to protect our rights or safety</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            4. Data Security
          </h2>
          <p>
            We use industry-standard security measures including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Encrypted data transmission (HTTPS/SSL)</li>
            <li>Secure authentication via Firebase</li>
            <li>Regular security audits</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            5. Your Rights
          </h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            6. Cookies
          </h2>
          <p>
            We use cookies and similar technologies to improve your experience, 
            remember your preferences, and analyze site usage.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            7. Children's Privacy
          </h2>
          <p>
            Our service is not intended for children under 18. We do not knowingly 
            collect information from children.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            8. Changes to Privacy Policy
          </h2>
          <p>
            We may update this policy from time to time. We will notify you of 
            significant changes via email or through the platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            9. Contact Us
          </h2>
          <p>
            For privacy concerns or questions, contact us at:{' '}
            <a href="mailto:privacy@waggle.com" className="text-[#8c5628] dark:text-amber-400 hover:underline">
              privacy@waggle.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;