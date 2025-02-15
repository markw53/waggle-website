// src/components/sections/HowItWorks.tsx
import { motion } from 'framer-motion';

const steps = [
  {
    id: 1,
    title: 'Create a Profile',
    description: 'Set up your dog\'s profile with photos and important details.',
    icon: '📝',
  },
  {
    id: 2,
    title: 'Find Matches',
    description: 'Browse through potential matches in your area.',
    icon: '🔍',
  },
  {
    id: 3,
    title: 'Connect',
    description: 'Chat with other dog owners and arrange meetings.',
    icon: '💬',
  },
  {
    id: 4,
    title: 'Meet',
    description: 'Meet up in a safe location and let the magic happen!',
    icon: '🐾',
  },
];

export default function HowItWorks() {
  return (
    <div className="bg-gray-50 py-12" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">
            Process
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            How Waggle Works
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Finding the perfect match for your dog has never been easier.
          </p>
        </div>

        <div className="mt-10">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-primary" />

            {/* Steps */}
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className={`relative mb-8 ${
                  index % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'
                }`}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="relative z-10 w-12 h-12 flex items-center justify-center bg-primary rounded-full">
                      <span className="text-2xl">{step.icon}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-base text-gray-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}