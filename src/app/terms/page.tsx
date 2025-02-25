// src/app/terms/page.tsx
export default function TermsPage() {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
  
          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. Terms</h2>
          <p className="text-lg text-gray-500 leading-relaxed">
            By accessing Waggle, you agree to be bound by these terms of service and comply with all applicable laws and regulations.
          </p>
  
          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. Use License</h2>
          <p className="text-lg text-gray-500 leading-relaxed">
            Permission is granted to temporarily download one copy of the app for personal, non-commercial use only.
          </p>
  
          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. Disclaimer</h2>
          <p className="text-lg text-gray-500 leading-relaxed">
            Waggle services are provided "as is". We make no warranties, expressed or implied, and hereby disclaim all warranties of merchantability and fitness for a particular purpose.
          </p>
  
          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. Limitations</h2>
          <p className="text-lg text-gray-500 leading-relaxed">
            In no event shall Waggle be liable for any damages arising out of the use or inability to use our services.
          </p>
  
          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Contact Us</h2>
          <p className="text-lg text-gray-500 leading-relaxed">
            Questions about our Terms of Service should be sent to{" "}
            <a href="mailto:legal@waggle.com" className="text-primary hover:text-primary-dark">
              legal@waggle.com
            </a>
          </p>
        </div>
      </div>
    );
  }