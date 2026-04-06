"use client";

import { motion } from "framer-motion";
import { Users, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { GAMES } from "@/lib/utils/constants";
import type { ChatRoom } from "@/types/app.types";

interface ChatCardProps {
  room: ChatRoom;
  onClick?: () => void;
}

function getGameEmoji(gameId: string | undefined): string {
  if (!gameId) return "🎮";
  const game = GAMES.find((g) => g.id === gameId);
  return game?.emoji ?? "🎮";
}

function getAvatarGradient(name: string): string {
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
    name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) %
    gradients.length;
  return gradients[index];
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function RoomAvatar({ room }: { room: ChatRoom }) {
  const initials = room.name.slice(0, 2).toUpperCase();
  const gradient = getAvatarGradient(room.name);

  if (room.type === "game_room") {
    const emoji = getGameEmoji(room.game_id);
    const game = GAMES.find((g) => g.id === room.game_id);
    return (
      <span
        className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl"
        style={{
          background: `${game?.color ?? "#a855f7"}20`,
          border: `1px solid ${game?.color ?? "#a855f7"}30`,
        }}
        aria-hidden="true"
      >
        {emoji}
      </span>
    );
  }

  if (room.type === "direct") {
    return (
      <span
        className={cn(
          "shrink-0 w-11 h-11 rounded-full flex items-center justify-center",
          "text-sm font-bold text-white bg-linear-to-br",
          gradient,
        )}
        aria-hidden="true"
      >
        {initials}
      </span>
    );
  }

  // group
  return (
    <span
      className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-[#16213e] border border-[#2a2a4e]"
      aria-hidden="true"
    >
      <Users className="w-5 h-5 text-[#a855f7]" />
    </span>
  );
}

function RoomTypeIcon({ type }: { type: ChatRoom["type"] }) {
  if (type === "direct") {
    return (
      <MessageCircle className="w-3 h-3 text-[#64748b]" aria-hidden="true" />
    );
  }
  if (type === "group") {
    return <Users className="w-3 h-3 text-[#64748b]" aria-hidden="true" />;
  }
  return null;
}

export function ChatCard({ room, onClick }: ChatCardProps) {
  const hasUnread = room.unread_count > 0;
  const lastMsg = room.last_message;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7]",
        hasUnread
          ? "bg-[#a855f7]/8 border-[#a855f7]/25 hover:border-[#a855f7]/45"
          : "bg-[#1a1a2e] border-[#2a2a4e] hover:border-[#a855f7]/30 hover:bg-[#1a1a2e]",
      )}
    >
      {/* Avatar */}
      <RoomAvatar room={room} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Room name + type icon */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <RoomTypeIcon type={room.type} />
          <span
            className={cn(
              "text-sm font-semibold truncate leading-tight",
              hasUnread ? "text-[#f1f5f9]" : "text-[#f1f5f9]",
            )}
          >
            {room.name}
          </span>
        </div>

        {/* Last message preview */}
        <p
          className={cn(
            "text-xs truncate leading-snug",
            hasUnread ? "text-[#94a3b8] font-medium" : "text-[#64748b]",
          )}
        >
          {lastMsg ? (
            lastMsg.content
          ) : (
            <span className="italic">No messages yet</span>
          )}
        </p>
      </div>

      {/* Right side: timestamp + unread badge */}
      <div className="shrink-0 flex flex-col items-end gap-1.5">
        {lastMsg && (
          <span className="text-[11px] text-[#64748b] leading-none tabular-nums">
            {formatTime(lastMsg.created_at)}
          </span>
        )}
        {hasUnread && (
          <span
            className={cn(
              "min-w-4.5 h-4.5 px-1 rounded-full flex items-center justify-center",
              "text-[10px] font-bold text-white bg-[#a855f7] leading-none",
              "shadow-[0_0_8px_rgba(168,85,247,0.5)]",
            )}
            aria-label={`${room.unread_count} unread messages`}
          >
            {room.unread_count > 99 ? "99+" : room.unread_count}
          </span>
        )}
      </div>
    </motion.button>
  );
}
