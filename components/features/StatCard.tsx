"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface TrendProps {
  value: number;
  isPositive: boolean;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: TrendProps;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  className,
}: StatCardProps) {
  const displayValue =
    typeof value === "number" ? value.toLocaleString() : value;

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "rounded-xl border border-[#2a2a4e] bg-[#1a1a2e] p-4 flex flex-col gap-3",
        "hover:border-[#a855f7]/40 transition-colors duration-200",
        className,
      )}
    >
      {/* Top row: icon + trend */}
      <div className="flex items-start justify-between gap-2">
        {icon ? (
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#16213e] border border-[#2a2a4e] text-[#a855f7]">
            {icon}
          </span>
        ) : (
          <span className="w-9 h-9" />
        )}

        {trend !== undefined && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
              trend.isPositive
                ? "bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/25"
                : "bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/25",
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3" aria-hidden="true" />
            ) : (
              <TrendingDown className="w-3 h-3" aria-hidden="true" />
            )}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      {/* Value */}
      <div>
        <p className="text-2xl font-bold text-[#f1f5f9] leading-none tracking-tight">
          {displayValue}
        </p>
        <p className="text-xs text-[#94a3b8] mt-1.5 leading-snug">{label}</p>
      </div>
    </motion.div>
  );
}
