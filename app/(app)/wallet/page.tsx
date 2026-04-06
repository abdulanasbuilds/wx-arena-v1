"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Tv,
  Users,
  Calendar,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Trophy,
  RotateCcw,
  ShoppingBag,
  Gift,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { WalletCard } from "@/components/features/WalletCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import {
  AD_REWARD_POINTS,
  REFERRAL_REWARD_POINTS,
} from "@/lib/utils/constants";
import type { WalletTransaction } from "@/types/app.types";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_POINTS = 4200;

const now = Date.now();
const mins = (n: number) => n * 60 * 1000;
const hours = (n: number) => n * 60 * mins(1);
const days = (n: number) => n * 24 * hours(1);

const MOCK_TRANSACTIONS: WalletTransaction[] = [
  {
    id: "tx-01",
    user_id: "current-user-id",
    type: "win",
    points: 500,
    description: "Match win vs PhantomStrike",
    created_at: new Date(now - mins(25)).toISOString(),
  },
  {
    id: "tx-02",
    user_id: "current-user-id",
    type: "earn",
    points: 100,
    description: "Watched rewarded ad",
    created_at: new Date(now - hours(2)).toISOString(),
  },
  {
    id: "tx-03",
    user_id: "current-user-id",
    type: "wager",
    points: 200,
    description: "Wager placed — 1v1 vs NightOwlGG",
    created_at: new Date(now - hours(4)).toISOString(),
  },
  {
    id: "tx-04",
    user_id: "current-user-id",
    type: "earn",
    points: 50,
    description: "Daily check-in reward",
    created_at: new Date(now - hours(6)).toISOString(),
  },
  {
    id: "tx-05",
    user_id: "current-user-id",
    type: "spend",
    points: 150,
    description: "Tournament entry — eFootball Grand Prix",
    created_at: new Date(now - days(1) - hours(1)).toISOString(),
  },
  {
    id: "tx-06",
    user_id: "current-user-id",
    type: "refund",
    points: 150,
    description: "Refund — DLS Weekend Knockout cancelled",
    created_at: new Date(now - days(1) - hours(3)).toISOString(),
  },
  {
    id: "tx-07",
    user_id: "current-user-id",
    type: "win",
    points: 300,
    description: "Match win vs BlazeFury99",
    created_at: new Date(now - days(1) - hours(7)).toISOString(),
  },
  {
    id: "tx-08",
    user_id: "current-user-id",
    type: "purchase",
    points: 1500,
    description: "Purchased Player Pack",
    created_at: new Date(now - days(3) - hours(2)).toISOString(),
  },
  {
    id: "tx-09",
    user_id: "current-user-id",
    type: "earn",
    points: 500,
    description: "Referral bonus — ZeroLatency joined",
    created_at: new Date(now - days(4) - hours(5)).toISOString(),
  },
  {
    id: "tx-10",
    user_id: "current-user-id",
    type: "spend",
    points: 250,
    description: "Tournament entry — COD Mobile Squad Showdown",
    created_at: new Date(now - days(6) - hours(1)).toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Transaction helpers
// ---------------------------------------------------------------------------

function getTransactionConfig(type: WalletTransaction["type"]): {
  icon: React.ReactNode;
  color: string;
  bgBorder: string;
  prefix: string;
  isPositive: boolean;
} {
  switch (type) {
    case "earn":
      return {
        icon: <TrendingUp className="w-4 h-4" aria-hidden="true" />,
        color: "text-[#22c55e]",
        bgBorder: "bg-[#22c55e]/10 border-[#22c55e]/20",
        prefix: "+",
        isPositive: true,
      };
    case "win":
      return {
        icon: <Trophy className="w-4 h-4" aria-hidden="true" />,
        color: "text-[#f59e0b]",
        bgBorder: "bg-[#f59e0b]/10 border-[#f59e0b]/20",
        prefix: "+",
        isPositive: true,
      };
    case "refund":
      return {
        icon: <RotateCcw className="w-4 h-4" aria-hidden="true" />,
        color: "text-[#22c55e]",
        bgBorder: "bg-[#22c55e]/10 border-[#22c55e]/20",
        prefix: "+",
        isPositive: true,
      };
    case "purchase":
      return {
        icon: <ShoppingBag className="w-4 h-4" aria-hidden="true" />,
        color: "text-[#a855f7]",
        bgBorder: "bg-[#a855f7]/10 border-[#a855f7]/20",
        prefix: "+",
        isPositive: true,
      };
    case "spend":
      return {
        icon: <TrendingDown className="w-4 h-4" aria-hidden="true" />,
        color: "text-[#ef4444]",
        bgBorder: "bg-[#ef4444]/10 border-[#ef4444]/20",
        prefix: "-",
        isPositive: false,
      };
    case "wager":
      return {
        icon: <Gift className="w-4 h-4" aria-hidden="true" />,
        color: "text-[#f59e0b]",
        bgBorder: "bg-[#a855f7]/10 border-[#a855f7]/20",
        prefix: "-",
        isPositive: false,
      };
  }
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Date grouping
// ---------------------------------------------------------------------------

type DateGroup = "today" | "yesterday" | "older";

function getDateGroup(dateString: string): DateGroup {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "today";
  if (date.toDateString() === yesterday.toDateString()) return "yesterday";
  return "older";
}

const GROUP_LABELS: Record<DateGroup, string> = {
  today: "Today",
  yesterday: "Yesterday",
  older: "Older",
};

const GROUP_ORDER: DateGroup[] = ["today", "yesterday", "older"];

function groupTransactions(
  txs: WalletTransaction[],
): { group: DateGroup; items: WalletTransaction[] }[] {
  const map = new Map<DateGroup, WalletTransaction[]>();

  for (const tx of txs) {
    const g = getDateGroup(tx.created_at);
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(tx);
  }

  return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({
    group: g,
    items: map.get(g)!,
  }));
}

// ---------------------------------------------------------------------------
// Earn More section
// ---------------------------------------------------------------------------

interface EarnAction {
  id: string;
  title: string;
  description: string;
  reward: number;
  icon: React.ReactNode;
  disabled: boolean;
  disabledLabel?: string;
  accentColor: string;
  accentBg: string;
}

function EarnCard({ action }: { action: EarnAction }) {
  const [loading, setLoading] = useState(false);

  function handleClick() {
    if (action.disabled) return;
    setLoading(true);
    // Simulate async — just visual feedback
    setTimeout(() => setLoading(false), 1400);
  }

  return (
    <motion.div
      whileHover={action.disabled ? undefined : { y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={cn(
        "flex flex-col gap-4 rounded-2xl border p-5 transition-colors duration-200",
        action.disabled
          ? "bg-[#1a1a2e]/60 border-[#2a2a4e]/60 opacity-70"
          : "bg-[#1a1a2e] border-[#2a2a4e] hover:border-[#a855f7]/30",
      )}
    >
      {/* Icon + reward */}
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center border",
            action.accentBg,
          )}
        >
          <span className={action.accentColor}>{action.icon}</span>
        </div>
        <span
          className={cn(
            "text-xs font-bold px-2.5 py-1 rounded-full border",
            action.disabled
              ? "bg-[#2a2a4e]/50 text-[#64748b] border-[#2a2a4e]/50"
              : cn(action.accentBg, action.accentColor, "border-current/30"),
          )}
        >
          +{action.reward} pts
        </span>
      </div>

      {/* Text */}
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#f1f5f9] leading-tight">
          {action.title}
        </p>
        <p className="text-xs text-[#64748b] mt-1">{action.description}</p>
      </div>

      {/* CTA */}
      {action.disabled ? (
        <div className="inline-flex items-center gap-1.5 text-xs text-[#64748b] font-medium">
          <CheckCircle
            className="w-3.5 h-3.5 text-[#22c55e]"
            aria-hidden="true"
          />
          {action.disabledLabel ?? "Unavailable"}
        </div>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          isLoading={loading}
          onClick={handleClick}
          className={cn(
            "w-full justify-center text-xs font-semibold",
            !loading && "hover:border-[#a855f7]/40 hover:text-[#a855f7]",
          )}
        >
          {!loading && (
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          {loading ? "Processing…" : "Claim"}
        </Button>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Full transaction history (date-grouped)
// ---------------------------------------------------------------------------

function TransactionHistory({
  transactions,
}: {
  transactions: WalletTransaction[];
}) {
  const groups = groupTransactions(transactions);

  return (
    <div className="flex flex-col gap-6">
      {groups.map(({ group, items }) => (
        <div key={group}>
          {/* Group heading */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-semibold text-[#64748b] uppercase tracking-widest">
              {GROUP_LABELS[group]}
            </span>
            <div className="flex-1 h-px bg-[#2a2a4e]" />
            <span className="text-[10px] text-[#64748b]">
              {items.length} transaction{items.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Transaction rows */}
          <ul className="flex flex-col gap-1.5">
            {items.map((tx, idx) => {
              const cfg = getTransactionConfig(tx.type);
              return (
                <motion.li
                  key={tx.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22, delay: idx * 0.04 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1a1a2e] border border-[#2a2a4e] hover:border-[#a855f7]/20 transition-colors duration-150"
                >
                  {/* Icon */}
                  <span
                    className={cn(
                      "shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center",
                      cfg.bgBorder,
                      cfg.color,
                    )}
                  >
                    {cfg.icon}
                  </span>

                  {/* Description */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#f1f5f9] truncate leading-tight">
                      {tx.description}
                    </p>
                    <p className="text-xs text-[#64748b] mt-0.5 capitalize">
                      {tx.type} · {formatTime(tx.created_at)}
                    </p>
                  </div>

                  {/* Amount */}
                  <span
                    className={cn(
                      "shrink-0 text-sm font-bold tabular-nums",
                      cfg.isPositive ? "text-[#22c55e]" : "text-[#ef4444]",
                    )}
                  >
                    {cfg.prefix}
                    {tx.points.toLocaleString()}
                  </span>
                </motion.li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function WalletPage() {
  const EARN_ACTIONS: EarnAction[] = [
    {
      id: "watch-ad",
      title: "Watch Ad",
      description: `Earn ${AD_REWARD_POINTS} points by watching a short rewarded video.`,
      reward: AD_REWARD_POINTS,
      icon: <Tv className="w-5 h-5" aria-hidden="true" />,
      disabled: false,
      accentColor: "text-[#3b82f6]",
      accentBg: "bg-[#3b82f6]/10 border-[#3b82f6]/20",
    },
    {
      id: "refer-friend",
      title: "Refer a Friend",
      description: `Share your code and earn ${REFERRAL_REWARD_POINTS} points when they sign up.`,
      reward: REFERRAL_REWARD_POINTS,
      icon: <Users className="w-5 h-5" aria-hidden="true" />,
      disabled: false,
      accentColor: "text-[#a855f7]",
      accentBg: "bg-[#a855f7]/10 border-[#a855f7]/20",
    },
    {
      id: "daily-checkin",
      title: "Daily Check-in",
      description: "Come back every day to claim your daily bonus points.",
      reward: 50,
      icon: <Calendar className="w-5 h-5" aria-hidden="true" />,
      disabled: true,
      disabledLabel: "Claimed today",
      accentColor: "text-[#22c55e]",
      accentBg: "bg-[#22c55e]/10 border-[#22c55e]/20",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-10">
      {/* ------------------------------------------------------------------ */}
      {/* Page header                                                          */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-3"
      >
        <div className="w-9 h-9 rounded-xl bg-[#a855f7]/15 border border-[#a855f7]/30 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-[#a855f7]" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#f1f5f9] leading-none">
            Wallet
          </h1>
          <p className="text-xs text-[#64748b] mt-0.5">Manage your WX Points</p>
        </div>
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* WalletCard                                                           */}
      {/* ------------------------------------------------------------------ */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        aria-label="Wallet balance"
      >
        <WalletCard points={MOCK_POINTS} transactions={MOCK_TRANSACTIONS} />
      </motion.section>

      {/* ------------------------------------------------------------------ */}
      {/* Earn More Points                                                     */}
      {/* ------------------------------------------------------------------ */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12 }}
        aria-label="Earn more points"
      >
        {/* Section heading */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-[#f59e0b]" aria-hidden="true" />
          <h2 className="text-sm font-bold text-[#f1f5f9] uppercase tracking-wider">
            Earn More Points
          </h2>
          <div className="flex-1 h-px bg-[#2a2a4e]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {EARN_ACTIONS.map((action) => (
            <EarnCard key={action.id} action={action} />
          ))}
        </div>
      </motion.section>

      {/* ------------------------------------------------------------------ */}
      {/* Full transaction history (date-grouped)                              */}
      {/* ------------------------------------------------------------------ */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        aria-label="Transaction history"
      >
        {/* Section heading */}
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-sm font-bold text-[#f1f5f9] uppercase tracking-wider">
            Transaction History
          </h2>
          <div className="flex-1 h-px bg-[#2a2a4e]" />
          <span className="text-xs text-[#64748b]">
            {MOCK_TRANSACTIONS.length} total
          </span>
        </div>

        <TransactionHistory transactions={MOCK_TRANSACTIONS} />
      </motion.section>
    </div>
  );
}
