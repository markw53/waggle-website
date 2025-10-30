import { useNavigate } from 'react-router-dom';

const TermsOfService: React.FC = () => {
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
        Terms of Service
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using Waggle, you accept and agree to be bound by these 
            Terms of Service. If you do not agree, please do not use our service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            2. Description of Service
          </h2>
          <p>
            Waggle is a platform that connects dog owners for breeding purposes. 
            We provide tools to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Create and manage dog profiles</li>
            <li>Search for potential breeding matches</li>
            <li>Communicate with other dog owners</li>
            <li>Arrange breeding meetings</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            3. User Responsibilities
          </h2>
          <p>As a user, you agree to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate and truthful information about your dogs</li>
            <li>Keep your account credentials secure</li>
            <li>Not misuse or abuse the platform</li>
            <li>Comply with all applicable laws and regulations</li>
            <li>Respect other users and their property</li>
            <li>Ensure your dogs are healthy and suitable for breeding</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            4. Prohibited Activities
          </h2>
          <p>You may not:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Post false, misleading, or fraudulent information</li>
            <li>Harass, threaten, or harm other users</li>
            <li>Use the service for illegal activities</li>
            <li>Attempt to breach security or access unauthorized areas</li>
            <li>Scrape or copy content without permission</li>
            <li>Promote unethical breeding practices</li>
            <li>Sell or transfer your account to others</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            5. Content Ownership
          </h2>
          <p>
            You retain ownership of content you post (photos, descriptions, etc.). 
            By posting content, you grant Waggle a license to use, display, and 
            distribute it within the platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            6. Disclaimer of Warranties
          </h2>
          <p>
            Waggle is provided "as is" without warranties of any kind. We do not:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Guarantee the accuracy of user-provided information</li>
            <li>Verify the health, temperament, or breeding suitability of dogs</li>
            <li>Guarantee successful breeding matches</li>
            <li>Take responsibility for interactions between users</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            7. Limitation of Liability
          </h2>
          <p>
            Waggle and its owners are not liable for:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Any damages arising from use of the service</li>
            <li>Disputes between users</li>
            <li>Health issues with dogs</li>
            <li>Failed breeding attempts</li>
            <li>Loss of data or content</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            8. Indemnification
          </h2>
          <p>
            You agree to indemnify and hold Waggle harmless from any claims, damages, 
            or expenses arising from your use of the service or violation of these terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            9. Account Termination
          </h2>
          <p>
            We reserve the right to suspend or terminate accounts that:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Violate these terms</li>
            <li>Engage in fraudulent activity</li>
            <li>Harm other users or the platform</li>
            <li>Remain inactive for extended periods</li>
          </ul>
          <p className="mt-2">
            You may delete your account at any time through your profile settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            10. Breeding Best Practices
          </h2>
          <p>
            We encourage responsible breeding. Users should:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Ensure dogs are of appropriate breeding age and health</li>
            <li>Have proper veterinary documentation</li>
            <li>Screen for genetic health issues</li>
            <li>Follow local breeding regulations</li>
            <li>Prioritize the welfare of the dogs</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            11. Dispute Resolution
          </h2>
          <p>
            Any disputes between users should be resolved directly. Waggle acts 
            only as a platform and is not responsible for mediating disputes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            12. Changes to Terms
          </h2>
          <p>
            We may update these terms from time to time. Continued use of the 
            service after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            13. Governing Law
          </h2>
          <p>
            These terms are governed by the laws of [Your Jurisdiction]. Any legal 
            action must be brought in the courts of [Your Jurisdiction].
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            14. Contact Information
          </h2>
          <p>
            For questions about these terms, contact us at:{' '}
            <a href="mailto:legal@waggle.com" className="text-[#8c5628] dark:text-amber-400 hover:underline">
              legal@waggle.com
            </a>
          </p>
        </section>

        <section className="border-t border-zinc-200 dark:border-zinc-700 pt-6 mt-8">
          <p className="text-sm italic text-gray-600 dark:text-gray-400">
            By using Waggle, you acknowledge that you have read, understood, and 
            agree to be bound by these Terms of Service and our Privacy Policy.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;