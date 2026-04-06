"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { GAMES } from "@/lib/utils/constants";
import type { Match, MatchStatus } from "@/types/app.types";

interface MatchCardProps {
  match: Match;
  currentUserId?: string;
}

function getGameInfo(gameId: string) {
  return GAMES.find((g) => g.id === gameId) ?? GAMES[0];
}

function getStatusConfig(status: MatchStatus): {
  label: string;
  className: string;
  pulse: boolean;
} {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        className: "bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30",
        pulse: false,
      };
    case "in_progress":
      return {
        label: "Live",
        className: "bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30",
        pulse: true,
      };
    case "completed":
      return {
        label: "Completed",
        className: "bg-[#64748b]/15 text-[#64748b] border border-[#64748b]/30",
        pulse: false,
      };
    case "disputed":
      return {
        label: "Disputed",
        className: "bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30",
        pulse: false,
      };
    case "cancelled":
      return {
        label: "Cancelled",
        className: "bg-[#64748b]/15 text-[#64748b] border border-[#64748b]/30",
        pulse: false,
      };
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

function PlayerName({
  profile,
  isCurrentUser,
  align,
}: {
  profile?: { username: string };
  isCurrentUser: boolean;
  align: "left" | "right";
}) {
  const name = profile?.username ?? "Unknown";
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        align === "right" && "flex-row-reverse",
      )}
    >
      {/* Avatar */}
      <span
        className={cn(
          "shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
          isCurrentUser
            ? "bg-linear-to-br from-[#a855f7] to-[#7c3aed] text-white"
            : "bg-linear-to-br from-[#2a2a4e] to-[#16213e] text-[#94a3b8]",
        )}
      >
        {initials}
      </span>
      <span
        className={cn(
          "text-sm font-medium truncate max-w-20",
          isCurrentUser ? "text-[#a855f7]" : "text-[#f1f5f9]",
        )}
      >
        {name}
      </span>
    </div>
  );
}

export function MatchCard({ match, currentUserId }: MatchCardProps) {
  const game = getGameInfo(match.game_id);
  const statusConfig = getStatusConfig(match.status);
  const isP1Current = match.player_1_id === currentUserId;
  const isP2Current = match.player_2_id === currentUserId;
  const isInvolvedUser = isP1Current || isP2Current;

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "rounded-xl border p-4 bg-[#1a1a2e] transition-colors duration-200",
        isInvolvedUser
          ? "border-[#a855f7]/40 shadow-[0_0_12px_rgba(168,85,247,0.12)]"
          : "border-[#2a2a4e] hover:border-[#2a2a4e]/80",
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none" aria-hidden="true">
            {game.emoji}
          </span>
          <div>
            <p className="text-sm font-semibold text-[#f1f5f9] leading-tight">
              {game.shortName}
            </p>
            <p className="text-xs text-[#94a3b8]">{match.match_type}</p>
          </div>
        </div>

        {/* Status badge */}
        <span
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0",
            statusConfig.className,
          )}
        >
          {statusConfig.pulse && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]" />
            </span>
          )}
          {statusConfig.label}
        </span>
      </div>

      {/* Players row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <PlayerName
          profile={match.player_1}
          isCurrentUser={isP1Current}
          align="left"
        />

        <span className="shrink-0 text-xs font-bold text-[#64748b] bg-[#16213e] px-2 py-0.5 rounded-md border border-[#2a2a4e]">
          VS
        </span>

        <PlayerName
          profile={match.player_2}
          isCurrentUser={isP2Current}
          align="right"
        />
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between pt-2 border-t border-[#2a2a4e]">
        <span className="shrink-0 flex items-center gap-1 text-sm font-semibold text-[#f59e0b]">
          🏆 <span>{match.wager_points.toLocaleString()} pts</span>
        </span>
        <span className="text-xs text-[#64748b]">
          {formatRelativeTime(match.created_at)}
        </span>
      </div>
    </motion.div>
  );
}
