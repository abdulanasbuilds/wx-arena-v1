"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  delay?: number;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
  delay = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "relative p-6 rounded-2xl border bg-[#0d0d14] transition-all duration-300",
        "border-[#1a1a2e] hover:border-[#a855f7]/50",
        className,
      )}
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-[#a855f7]/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[#a855f7]" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-[#f1f5f9] mb-2">{title}</h3>
      <p className="text-sm text-[#94a3b8] leading-relaxed">{description}</p>

      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#a855f7]/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
}
