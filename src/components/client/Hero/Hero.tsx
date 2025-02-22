// src/components/client/Hero/index.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  const scrollToSignup = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const signupSection = document.getElementById('signup');
    if (signupSection) {
      signupSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-white overflow-hidden min-h-[600px] lg:min-h-[800px]">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white/80 backdrop-blur-sm sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
              >
                <span className="block">Find the Perfect Match</span>
                <span className="block text-primary">for Your Dog</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
              >
                Coming soon to iOS and Android. Join the waitlist to be notified
                when we launch!
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start"
              >
                <div className="rounded-md shadow">
                  <a
                    href="#signup"
                    onClick={scrollToSignup}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark transition-colors duration-200 md:py-4 md:text-lg md:px-10"
                  >
                    Join Waitlist
                  </a>
                </div>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://via.placeholder.com/1920x1080"
          alt="Dog companions"
          fill
          priority
          className="object-cover w-full h-full"
          sizes="100vw"
          quality={90}
          style={{
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </div>
    </div>
  );
}