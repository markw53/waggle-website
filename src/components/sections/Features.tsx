// src/components/sections/Features.tsx
import { motion } from "framer-motion";

const features = [
  {
    name: "Smart Matching",
    description:
      "Our intelligent algorithm finds the perfect match for your dog based on breed, location, and compatibility.",
    icon: "🔍"
  },
  {
    name: "Health Verified",
    description:
      "All dogs are verified with up-to-date health records and vaccinations.",
    icon: "🏥"
  },
  {
    name: "Location Based",
    description: "Find matches nearby with our location-based search feature.",
    icon: "📍"
  },
  {
    name: "Secure Messaging",
    description:
      "Chat securely with other dog owners through our built-in messaging system.",
    icon: "💬"
  }
];

export default function Features() {
  return (
    <div className="py-12 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">
            Features
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to find the perfect match
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Waggle provides all the tools you need to find the ideal mate for
            your dog.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    {feature.name}
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  {feature.description}
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
