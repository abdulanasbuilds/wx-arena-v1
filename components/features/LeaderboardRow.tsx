"use client";

import { Crown, Shield, Star } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import type { UserProfile } from "@/types/app.types";

interface LeaderboardRowProps {
  profile: UserProfile;
  rank: number;
  isCurrentUser?: boolean;
}

function getRankConfig(rank: number): {
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode | null;
  label: string;
} {
  switch (rank) {
    case 1:
      return {
        color: "text-[#f59e0b]",
        bg: "bg-[#f59e0b]/15",
        border: "border-[#f59e0b]/40",
        icon: (
          <Crown className="w-3.5 h-3.5 text-[#f59e0b]" aria-hidden="true" />
        ),
        label: "Gold",
      };
    case 2:
      return {
        color: "text-[#94a3b8]",
        bg: "bg-[#94a3b8]/15",
        border: "border-[#94a3b8]/40",
        icon: (
          <Shield className="w-3.5 h-3.5 text-[#94a3b8]" aria-hidden="true" />
        ),
        label: "Silver",
      };
    case 3:
      return {
        color: "text-[#f97316]",
        bg: "bg-[#f97316]/15",
        border: "border-[#f97316]/40",
        icon: (
          <Star className="w-3.5 h-3.5 text-[#f97316]" aria-hidden="true" />
        ),
        label: "Bronze",
      };
    default:
      return {
        color: "text-[#64748b]",
        bg: "bg-transparent",
        border: "border-transparent",
        icon: null,
        label: String(rank),
      };
  }
}

function getAvatarGradient(username: string): string {
  const gradients = [
    "from-[#a855f7] to-[#7c3aed]",
    "from-[#3b82f6] to-[#1d4ed8]",
    "from-[#22c55e] to-[#15803d]",
    "from-[#f59e0b] to-[#b45309]",
    "from-[#ef4444] to-[#b91c1c]",
    "from-[#06b6d4] to-[#0e7490]",
    "from-[#ec4899] to-[#be185d]",
    "from-[#f97316] to-[#c2410c]",
  ];
  const index =
    username.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) %
    gradients.length;
  return gradients[index];
}

export function LeaderboardRow({
  profile,
  rank,
  isCurrentUser = false,
}: LeaderboardRowProps) {
  const rankConfig = getRankConfig(rank);
  const initials = profile.username.slice(0, 2).toUpperCase();
  const avatarGradient = getAvatarGradient(profile.username);
  const isTopThree = rank <= 3;

  return (
    <motion.div
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors duration-200",
        isCurrentUser
          ? "bg-[#a855f7]/10 border-[#a855f7]/30 shadow-[0_0_12px_rgba(168,85,247,0.1)]"
          : "bg-[#1a1a2e] border-[#2a2a4e] hover:border-[#2a2a4e]/80",
      )}
    >
      {/* Rank badge */}
      <div
        className={cn(
          "shrink-0 flex items-center justify-center w-8 h-8 rounded-lg border text-xs font-bold",
          isTopThree
            ? cn(rankConfig.bg, rankConfig.border, rankConfig.color)
            : "text-[#64748b]",
        )}
        aria-label={`Rank ${rank}`}
      >
        {isTopThree ? rankConfig.icon : <span>{rank}</span>}
      </div>

      {/* Avatar */}
      <div
        className={cn(
          "shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white bg-linear-to-br",
          isCurrentUser
            ? "from-[#a855f7] to-[#7c3aed] ring-2 ring-[#a855f7]/50"
            : avatarGradient,
        )}
        aria-hidden="true"
      >
        {initials}
      </div>

      {/* Username + badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-sm font-semibold truncate",
              isCurrentUser ? "text-[#a855f7]" : "text-[#f1f5f9]",
            )}
          >
            {profile.username}
          </span>
          {profile.is_pro && (
            <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30 leading-none">
              PRO
            </span>
          )}
          {profile.is_verified && (
            <span
              className="shrink-0 text-[#22c55e]"
              aria-label="Verified"
              title="Verified"
            >
              ✓
            </span>
          )}
        </div>
        <p className="text-xs text-[#64748b] mt-0.5">
          {profile.streak > 0 && (
            <span className="text-[#f59e0b] mr-1.5">🔥 {profile.streak}</span>
          )}
          {profile.total_matches.toLocaleString()} matches
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Win rate */}
        <div className="hidden sm:block text-right">
          <p className="text-xs text-[#64748b] leading-none mb-0.5">Win Rate</p>
          <p
            className={cn(
              "text-sm font-semibold leading-none",
              profile.win_rate >= 60
                ? "text-[#22c55e]"
                : profile.win_rate >= 40
                  ? "text-[#f59e0b]"
                  : "text-[#ef4444]",
            )}
          >
            {profile.win_rate.toFixed(0)}%
          </p>
        </div>

        {/* Wins */}
        <div className="hidden sm:block text-right">
          <p className="text-xs text-[#64748b] leading-none mb-0.5">Wins</p>
          <p className="text-sm font-semibold text-[#f1f5f9] leading-none">
            {profile.wins.toLocaleString()}
          </p>
        </div>

        {/* Points */}
        <div className="text-right">
          <p className="text-xs text-[#64748b] leading-none mb-0.5">Points</p>
          <p
            className={cn(
              "text-sm font-bold leading-none",
              isTopThree ? rankConfig.color : "text-[#f1f5f9]",
            )}
          >
            {profile.points.toLocaleString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
