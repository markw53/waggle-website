// src/components/common/LoadingSpinner.tsx
'use client';

import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  color?: string;
}

export default function LoadingSpinner({
  size = "medium",
  color = "#BDB76B"
}: LoadingSpinnerProps) {
  const sizes = {
    small: "h-6 w-6",
    medium: "h-12 w-12",
    large: "h-16 w-16"
  };

  return (
    <div className="flex justify-center items-center p-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
        className={`${sizes[size]} border-4 border-t-transparent rounded-full`}
        style={{ borderColor: `${color} transparent transparent transparent` }}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
