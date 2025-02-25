// src/components/client/FAQ/FAQ.tsx
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// FAQ Data
const faqData = [
  {
    question: "What is Waggle?",
    answer: "Waggle is a mobile app designed to help dog owners find suitable breeding matches for their dogs. Our platform focuses on responsible breeding practices and helps connect dog owners in their local area.",
    category: "general"
  },
  {
    question: "How does the matching process work?",
    answer: "Our matching algorithm considers various factors including breed, location, health records, and temperament to suggest compatible matches. Users can browse through potential matches and connect with other dog owners through our secure messaging system.",
    category: "features"
  },
  {
    question: "How do you verify health records?",
    answer: "We require users to upload official veterinary documents and vaccination records. Our team verifies these documents before allowing dogs to be listed for breeding.",
    category: "safety"
  },
  {
    question: "What safety measures are in place?",
    answer: "We implement user verification, secure messaging, and location verification. We also provide guidelines for safe meetups and recommend public meeting spots.",
    category: "safety"
  }
];

const categories = {
  all: "All Questions",
  general: "General",
  features: "Features",
  safety: "Safety",
  pricing: "Pricing"
} as const;

type Category = keyof typeof categories;

function FAQItem({ faq, index }: { faq: typeof faqData[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2, delay: index * 0.1 }}
    >
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button className="py-4 w-full flex justify-between items-center text-left">
              <span className="text-lg font-medium text-gray-900">{faq.question}</span>
              <ChevronDownIcon
                className={`${
                  open ? "transform rotate-180" : ""
                } w-5 h-5 text-primary transition-transform duration-200`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="pb-4 pr-12">
              <p className="text-base text-gray-500">{faq.answer}</p>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </motion.div>
  );
}

function CategoryFilter({ activeCategory, setActiveCategory }: { 
  activeCategory: Category; 
  setActiveCategory: (category: Category) => void 
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {Object.entries(categories).map(([key, label]) => (
        <button
          key={key}
          onClick={() => setActiveCategory(key as Category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${activeCategory === key
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const filteredFaqs = useMemo(() => {
    return faqData.filter((faq) => {
      const matchesSearch =
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        activeCategory === "all" || faq.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  return (
    <section className="bg-white py-16 sm:py-24" id="faq">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="lg:text-center mb-12">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">
            FAQ
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Frequently Asked Questions
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Everything you need to know about Waggle and how it works.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search questions..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md 
                focus:ring-2 focus:ring-primary focus:border-primary
                text-gray-900 placeholder-gray-500 bg-white" // Added text color and background
              style={{ caretColor: 'auto' }} // Ensures cursor is visible
            />
            <MagnifyingGlassIcon 
              className="absolute left-3 top-3 h-5 w-5 text-gray-400" 
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="max-w-3xl mx-auto mb-8">
          <CategoryFilter 
            activeCategory={activeCategory} 
            setActiveCategory={setActiveCategory} 
          />
        </div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto divide-y-2 divide-gray-200">
          <AnimatePresence>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <FAQItem key={index} faq={faq} index={index} />
              ))
            ) : (
              <div className="py-4 text-center text-gray-500">
                No questions found.
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Contact Support */}
        <div className="mt-16 text-center">
          <p className="text-base text-gray-500">Still have questions?</p>
          <a
            href="mailto:support@waggle.com"
            className="mt-2 inline-flex items-center text-primary hover:text-primary-dark"
          >
            Contact our support team
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}