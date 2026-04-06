"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { GAMES } from "@/lib/utils/constants";
import type { Tournament, TournamentStatus } from "@/types/app.types";

interface TournamentCardProps {
  tournament: Tournament;
}

function getGameInfo(gameId: string) {
  return GAMES.find((g) => g.id === gameId) ?? GAMES[0];
}

function getStatusConfig(status: TournamentStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case "open":
      return {
        label: "Open",
        className: "bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30",
      };
    case "in_progress":
      return {
        label: "In Progress",
        className: "bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/30",
      };
    case "completed":
      return {
        label: "Completed",
        className: "bg-[#64748b]/15 text-[#64748b] border border-[#64748b]/30",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        className: "bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30",
      };
  }
}

function formatStartTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMs < 0) return date.toLocaleDateString();
  if (diffMins < 60) return `Starts in ${diffMins}m`;
  if (diffHours < 24) return `Starts in ${diffHours}h`;
  if (diffDays === 1) return "Starts tomorrow";
  if (diffDays < 7) return `Starts in ${diffDays}d`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const game = getGameInfo(tournament.game_id);
  const statusConfig = getStatusConfig(tournament.status);
  const fillPercent = Math.min(
    100,
    Math.round(
      (tournament.current_participants / tournament.max_participants) * 100,
    ),
  );
  const isFull = tournament.current_participants >= tournament.max_participants;
  const isJoinable = tournament.status === "open" && !isFull;
  const isViewable =
    tournament.status === "in_progress" || tournament.status === "completed";

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="rounded-xl border border-[#2a2a4e] bg-[#1a1a2e] p-4 flex flex-col gap-3 hover:border-[#a855f7]/40 transition-colors duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ background: `${game.color}20` }}
            aria-hidden="true"
          >
            {game.emoji}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#f1f5f9] leading-tight truncate">
              {tournament.title}
            </p>
            <p className="text-xs text-[#94a3b8] mt-0.5">{game.shortName}</p>
          </div>
        </div>

        {/* Status badge */}
        <span
          className={cn(
            "shrink-0 text-xs font-medium px-2.5 py-1 rounded-full",
            statusConfig.className,
          )}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* Prize & Entry */}
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-lg bg-[#16213e] border border-[#2a2a4e] px-3 py-2 text-center">
          <p className="text-xs text-[#64748b] mb-0.5">Prize Pool</p>
          <p className="text-sm font-bold text-[#f59e0b]">
            🏆 {tournament.prize_pool.toLocaleString()} pts
          </p>
        </div>
        <div className="flex-1 rounded-lg bg-[#16213e] border border-[#2a2a4e] px-3 py-2 text-center">
          <p className="text-xs text-[#64748b] mb-0.5">Entry Fee</p>
          <p className="text-sm font-bold text-[#f1f5f9]">
            {tournament.entry_fee === 0
              ? "Free"
              : `${tournament.entry_fee.toLocaleString()} pts`}
          </p>
        </div>
      </div>

      {/* Participants progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-[#94a3b8]">Participants</span>
          <span className="text-xs font-medium text-[#f1f5f9]">
            {tournament.current_participants}
            <span className="text-[#64748b]">
              /{tournament.max_participants}
            </span>
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[#16213e] border border-[#2a2a4e] overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              isFull ? "bg-[#ef4444]" : "bg-[#a855f7]",
            )}
            initial={{ width: 0 }}
            animate={{ width: `${fillPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        {isFull && <p className="text-xs text-[#ef4444] mt-1">Lobby full</p>}
      </div>

      {/* Start time + CTA */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#2a2a4e]">
        <span className="text-xs text-[#64748b]">
          🕐 {formatStartTime(tournament.start_time)}
        </span>

        {(isJoinable || isViewable) && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors duration-150",
              isJoinable
                ? "bg-[#a855f7] hover:bg-[#9333ea] text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                : "bg-[#16213e] hover:bg-[#2a2a4e] text-[#94a3b8] border border-[#2a2a4e]",
            )}
          >
            {isJoinable ? "Join" : "View"}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
