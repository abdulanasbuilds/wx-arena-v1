"use client";

import { motion } from "framer-motion";
import {
  Plus,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  Gift,
  ShoppingBag,
  Trophy,
  RotateCcw,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { WalletTransaction } from "@/types/app.types";

interface WalletCardProps {
  points: number;
  transactions?: WalletTransaction[];
}

function getTransactionConfig(type: WalletTransaction["type"]): {
  icon: React.ReactNode;
  color: string;
  prefix: string;
} {
  switch (type) {
    case "earn":
      return {
        icon: <TrendingUp className="w-4 h-4" aria-hidden="true" />,
        color: "text-[#22c55e]",
        prefix: "+",
      };
    case "win":
      return {
        icon: <Trophy className="w-4 h-4" aria-hidden="true" />,
        color: "text-[#f59e0b]",
        prefix: "+",
      };
    case "refund":
      return {
        icon: <RotateCcw className="w-4 h-4" aria-hidden="true" />,
        color: "text-[#22c55e]",
        prefix: "+",
      };
    case "purchase":
      return {
        icon: <ShoppingBag className="w-4 h-4" aria-hidden="true" />,
        color: "text-[#a855f7]",
        prefix: "+",
      };
    case "spend":
      return {
        icon: <TrendingDown className="w-4 h-4" aria-hidden="true" />,
        color: "text-[#ef4444]",
        prefix: "-",
      };
    case "wager":
      return {
        icon: <Gift className="w-4 h-4" aria-hidden="true" />,
        color: "text-[#f59e0b]",
        prefix: "-",
      };
  }
}

function getTransactionBg(type: WalletTransaction["type"]): string {
  switch (type) {
    case "earn":
    case "refund":
      return "bg-[#22c55e]/10 border-[#22c55e]/20";
    case "win":
    case "purchase":
      return "bg-[#f59e0b]/10 border-[#f59e0b]/20";
    case "spend":
      return "bg-[#ef4444]/10 border-[#ef4444]/20";
    case "wager":
      return "bg-[#a855f7]/10 border-[#a855f7]/20";
  }
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function isPositiveTransaction(type: WalletTransaction["type"]): boolean {
  return (
    type === "earn" ||
    type === "win" ||
    type === "refund" ||
    type === "purchase"
  );
}

export function WalletCard({ points, transactions }: WalletCardProps) {
  const recentTransactions = transactions?.slice(0, 5) ?? [];

  return (
    <div className="flex flex-col gap-4">
      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl border border-[#2a2a4e] bg-[#1a1a2e] p-6"
      >
        {/* Decorative glow */}
        <div
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: "#a855f7" }}
        />
        <div
          className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10 blur-2xl pointer-events-none"
          style={{ background: "#7c3aed" }}
        />

        {/* Header */}
        <div className="relative flex items-center gap-2 mb-1">
          <Wallet className="w-4 h-4 text-[#94a3b8]" aria-hidden="true" />
          <span className="text-sm text-[#94a3b8] font-medium">
            WX Points Balance
          </span>
        </div>

        {/* Balance */}
        <div className="relative mb-6">
          <p className="text-4xl font-extrabold text-[#f1f5f9] tracking-tight leading-none">
            {points.toLocaleString()}
          </p>
          <p className="text-sm text-[#64748b] mt-1">pts available</p>
        </div>

        {/* Action buttons */}
        <div className="relative flex items-center gap-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2",
              "bg-[#a855f7] hover:bg-[#9333ea] text-white",
              "text-sm font-semibold px-4 py-2.5 rounded-xl",
              "shadow-[0_0_16px_rgba(168,85,247,0.35)]",
              "transition-colors duration-150",
            )}
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add Points
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2",
              "bg-[#16213e] hover:bg-[#2a2a4e] text-[#94a3b8] hover:text-[#f1f5f9]",
              "text-sm font-semibold px-4 py-2.5 rounded-xl",
              "border border-[#2a2a4e] hover:border-[#a855f7]/40",
              "transition-colors duration-150",
            )}
          >
            <ArrowRightLeft className="w-4 h-4" aria-hidden="true" />
            Transfer
          </motion.button>
        </div>
      </motion.div>

      {/* Transaction history */}
      {recentTransactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="rounded-2xl border border-[#2a2a4e] bg-[#1a1a2e] overflow-hidden"
        >
          {/* Section header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a4e]">
            <span className="text-sm font-semibold text-[#f1f5f9]">
              Recent Transactions
            </span>
            <span className="text-xs text-[#64748b]">
              Last {recentTransactions.length}
            </span>
          </div>

          {/* Transaction list */}
          <ul className="divide-y divide-[#2a2a4e]">
            {recentTransactions.map((tx, index) => {
              const config = getTransactionConfig(tx.type);
              const bgClass = getTransactionBg(tx.type);
              const positive = isPositiveTransaction(tx.type);

              return (
                <motion.li
                  key={tx.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: 0.05 * index }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#16213e]/60 transition-colors duration-150"
                >
                  {/* Type icon */}
                  <span
                    className={cn(
                      "shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center",
                      bgClass,
                      config.color,
                    )}
                  >
                    {config.icon}
                  </span>

                  {/* Description */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#f1f5f9] truncate leading-tight">
                      {tx.description}
                    </p>
                    <p className="text-xs text-[#64748b] mt-0.5 capitalize">
                      {tx.type} · {formatRelativeTime(tx.created_at)}
                    </p>
                  </div>

                  {/* Points */}
                  <span
                    className={cn(
                      "shrink-0 text-sm font-bold tabular-nums",
                      positive ? "text-[#22c55e]" : "text-[#ef4444]",
                    )}
                  >
                    {config.prefix}
                    {tx.points.toLocaleString()}
                  </span>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
