"use client";

import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = "md",
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const wrapperClasses = fullScreen
    ? "min-h-screen flex items-center justify-center"
    : "flex items-center justify-center";

  return (
    <div className={wrapperClasses}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Outer ring */}
          <motion.div
            className={`${sizeClasses[size]} rounded-full border-4 border-[#2a2a4e]`}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          {/* Inner spinner */}
          <motion.div
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-4 border-t-[#a855f7] border-r-transparent border-b-transparent border-l-transparent`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          {/* Center glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-[#a855f7] rounded-full animate-pulse" />
          </div>
        </div>
        {text && (
          <motion.p
            className="text-[#94a3b8] text-sm font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="bg-[#0d0d14] border border-[#2a2a4e] rounded-xl p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#1a1a2e] rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[#1a1a2e] rounded w-3/4" />
          <div className="h-3 bg-[#1a1a2e] rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function LoadingGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}
