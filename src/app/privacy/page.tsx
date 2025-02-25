// src/app/privacy/page.tsx
export default function PrivacyPage() {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Information We Collect</h2>
          <p className="text-lg text-gray-500 leading-relaxed">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="mt-6 space-y-4 text-lg text-gray-500">
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Account information
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Dog profiles and health records
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Communication data
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Usage information
            </li>
          </ul>
  
          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">How We Use Your Information</h2>
          <ul className="mt-6 space-y-4 text-lg text-gray-500">
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Provide and maintain our services
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Match you with potential breeding partners
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Ensure platform safety and security
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Communicate with you about our services
            </li>
          </ul>
  
          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Contact Us</h2>
          <p className="text-lg text-gray-500 leading-relaxed">
            If you have any questions about our Privacy Policy, please contact us at{" "}
            <a href="mailto:privacy@waggle.com" className="text-primary hover:text-primary-dark">
              privacy@waggle.com
            </a>
          </p>
        </div>
      </div>
    );
  }