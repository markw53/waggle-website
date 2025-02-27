// src/app/about/page.tsx
export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white pt-16"> {/* Added padding-top for header */}
            <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-white mb-8">About Waggle</h1>
            <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-500 leading-relaxed">
                Waggle is the premier dog mating app designed to help responsible dog owners find the perfect breeding matches for their beloved companions.
            </p>
            
            <h2 className="text-2xl font-bold text-white mt-12 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-500 leading-relaxed">
                We're dedicated to promoting responsible breeding practices while making it easier for dog owners to connect and build a community focused on the wellbeing of their pets.
            </p>
    
            <h2 className="text-2xl font-bold text-white mt-12 mb-4">What We Offer</h2>
            <ul className="mt-6 space-y-4 text-lg text-gray-500">
                <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Verified profiles and health records
                </li>
                <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Smart matching algorithm
                </li>
                <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Secure communication platform
                </li>
                <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Local community connections
                </li>
            </ul>
    
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Contact Us</h2>
            <p className="text-lg text-gray-500 leading-relaxed">
                Have questions? Reach out to us at{" "}
                <a href="mailto:contact@waggle.com" className="text-primary hover:text-primary-dark">
                contact@waggle.com
                </a>
            </p>
            </div>
        </div>
      </main>
    );
  }