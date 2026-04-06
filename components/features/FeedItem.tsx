"use client";

import { motion } from "framer-motion";
import { Trophy, Swords, UserPlus, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type FeedItemType =
  | "match_result"
  | "tournament_win"
  | "new_player"
  | "achievement";

interface FeedItemProps {
  type: FeedItemType;
  username: string;
  description: string;
  timestamp: string;
  points?: number;
}

function getEventConfig(type: FeedItemType): {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  accentColor: string;
} {
  switch (type) {
    case "match_result":
      return {
        icon: <Swords className="w-4 h-4" aria-hidden="true" />,
        iconBg: "bg-[#3b82f6]/15 border-[#3b82f6]/25",
        iconColor: "text-[#3b82f6]",
        accentColor: "#3b82f6",
      };
    case "tournament_win":
      return {
        icon: <Trophy className="w-4 h-4" aria-hidden="true" />,
        iconBg: "bg-[#f59e0b]/15 border-[#f59e0b]/25",
        iconColor: "text-[#f59e0b]",
        accentColor: "#f59e0b",
      };
    case "new_player":
      return {
        icon: <UserPlus className="w-4 h-4" aria-hidden="true" />,
        iconBg: "bg-[#22c55e]/15 border-[#22c55e]/25",
        iconColor: "text-[#22c55e]",
        accentColor: "#22c55e",
      };
    case "achievement":
      return {
        icon: <Star className="w-4 h-4" aria-hidden="true" />,
        iconBg: "bg-[#a855f7]/15 border-[#a855f7]/25",
        iconColor: "text-[#a855f7]",
        accentColor: "#a855f7",
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

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function FeedItem({
  type,
  username,
  description,
  timestamp,
  points,
}: FeedItemProps) {
  const eventConfig = getEventConfig(type);
  const avatarGradient = getAvatarGradient(username);
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 3 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[#2a2a4e] bg-[#1a1a2e] hover:border-[#a855f7]/30 hover:bg-[#1a1a2e] transition-colors duration-200"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <span
          className={cn(
            "shrink-0 flex w-10 h-10 rounded-full items-center justify-center",
            "text-sm font-bold text-white bg-linear-to-br",
            avatarGradient,
          )}
          aria-hidden="true"
        >
          {initials}
        </span>

        {/* Event type icon badge */}
        <span
          className={cn(
            "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#1a1a2e]",
            "flex items-center justify-center border",
            eventConfig.iconBg,
            eventConfig.iconColor,
          )}
          aria-hidden="true"
        >
          <span className="scale-75">{eventConfig.icon}</span>
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#f1f5f9] leading-snug">
          <span className="font-semibold">{username}</span>{" "}
          <span className="text-[#94a3b8]">{description}</span>
        </p>
        <p className="text-xs text-[#64748b] mt-1 leading-none">
          {formatRelativeTime(timestamp)}
        </p>
      </div>

      {/* Points badge */}
      {points !== undefined && (
        <span
          className={cn(
            "shrink-0 self-center",
            "flex items-center gap-1",
            "text-xs font-bold px-2.5 py-1 rounded-full",
            "bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30",
          )}
          aria-label={`${points.toLocaleString()} points`}
        >
          🏆 <span className="tabular-nums">{points.toLocaleString()}</span>
        </span>
      )}
    </motion.div>
  );
}
