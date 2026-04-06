"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  rating: number;
  className?: string;
  delay?: number;
}

export function TestimonialCard({
  quote,
  author,
  role,
  rating,
  className,
  delay = 0,
}: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "relative p-6 rounded-2xl border bg-[#0d0d14]",
        "border-[#1a1a2e]",
        className,
      )}
    >
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "w-4 h-4 fill-current",
              i < rating ? "text-[#f59e0b]" : "text-[#2a2a4e]"
            )}
          />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-[#f1f5f9] mb-4 leading-relaxed">
        &ldquo;{quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center text-white font-semibold text-sm">
          {author.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-[#f1f5f9] text-sm">{author}</p>
          <p className="text-xs text-[#64748b]">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}
