"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Crown,
  Shield,
  Star,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Flame,
} from "lucide-react";
import { LeaderboardRow } from "@/components/features/LeaderboardRow";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import type { UserProfile, GameId } from "@/types/app.types";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const CURRENT_USER_ID = "current-user-id";

const MOCK_PROFILES: UserProfile[] = [
  {
    id: "user-1",
    username: "PhantomStrike",
    avatar_url: null,
    bio: null,
    points: 18500,
    total_matches: 312,
    wins: 241,
    losses: 71,
    win_rate: 77,
    rank: 1,
    streak: 12,
    is_verified: true,
    is_pro: true,
    created_at: "2024-01-10T10:00:00Z",
  },
  {
    id: "user-2",
    username: "NightOwlGG",
    avatar_url: null,
    bio: null,
    points: 16300,
    total_matches: 280,
    wins: 204,
    losses: 76,
    win_rate: 73,
    rank: 2,
    streak: 8,
    is_verified: true,
    is_pro: true,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "user-3",
    username: "BlazeFury99",
    avatar_url: null,
    bio: null,
    points: 14750,
    total_matches: 265,
    wins: 185,
    losses: 80,
    win_rate: 70,
    rank: 3,
    streak: 5,
    is_verified: false,
    is_pro: true,
    created_at: "2024-01-20T10:00:00Z",
  },
  {
    id: "user-4",
    username: "VortexKing",
    avatar_url: null,
    bio: null,
    points: 13200,
    total_matches: 240,
    wins: 162,
    losses: 78,
    win_rate: 68,
    rank: 4,
    streak: 3,
    is_verified: false,
    is_pro: false,
    created_at: "2024-02-01T10:00:00Z",
  },
  {
    id: "user-5",
    username: "SwiftAce",
    avatar_url: null,
    bio: null,
    points: 12100,
    total_matches: 220,
    wins: 148,
    losses: 72,
    win_rate: 67,
    rank: 5,
    streak: 0,
    is_verified: true,
    is_pro: false,
    created_at: "2024-02-05T10:00:00Z",
  },
  {
    id: "user-6",
    username: "ZeroLatency",
    avatar_url: null,
    bio: null,
    points: 10900,
    total_matches: 198,
    wins: 130,
    losses: 68,
    win_rate: 66,
    rank: 6,
    streak: 2,
    is_verified: false,
    is_pro: false,
    created_at: "2024-02-10T10:00:00Z",
  },
  {
    id: CURRENT_USER_ID,
    username: "You",
    avatar_url: null,
    bio: null,
    points: 4200,
    total_matches: 155,
    wins: 105,
    losses: 50,
    win_rate: 68,
    rank: 7,
    streak: 4,
    is_verified: false,
    is_pro: false,
    created_at: "2024-02-14T10:00:00Z",
  },
  {
    id: "user-8",
    username: "ShadowPulse",
    avatar_url: null,
    bio: null,
    points: 9400,
    total_matches: 182,
    wins: 110,
    losses: 72,
    win_rate: 60,
    rank: 8,
    streak: 1,
    is_verified: false,
    is_pro: false,
    created_at: "2024-02-18T10:00:00Z",
  },
  {
    id: "user-9",
    username: "IronWolf",
    avatar_url: null,
    bio: null,
    points: 8800,
    total_matches: 170,
    wins: 98,
    losses: 72,
    win_rate: 58,
    rank: 9,
    streak: 0,
    is_verified: false,
    is_pro: false,
    created_at: "2024-03-01T10:00:00Z",
  },
  {
    id: "user-10",
    username: "AquaSniper",
    avatar_url: null,
    bio: null,
    points: 8100,
    total_matches: 160,
    wins: 88,
    losses: 72,
    win_rate: 55,
    rank: 10,
    streak: 0,
    is_verified: true,
    is_pro: false,
    created_at: "2024-03-05T10:00:00Z",
  },
  {
    id: "user-11",
    username: "CrimsonEdge",
    avatar_url: null,
    bio: null,
    points: 7500,
    total_matches: 148,
    wins: 80,
    losses: 68,
    win_rate: 54,
    rank: 11,
    streak: 3,
    is_verified: false,
    is_pro: false,
    created_at: "2024-03-10T10:00:00Z",
  },
  {
    id: "user-12",
    username: "TurboFlash",
    avatar_url: null,
    bio: null,
    points: 6900,
    total_matches: 140,
    wins: 73,
    losses: 67,
    win_rate: 52,
    rank: 12,
    streak: 0,
    is_verified: false,
    is_pro: false,
    created_at: "2024-03-14T10:00:00Z",
  },
  {
    id: "user-13",
    username: "NebulaX",
    avatar_url: null,
    bio: null,
    points: 6300,
    total_matches: 130,
    wins: 65,
    losses: 65,
    win_rate: 50,
    rank: 13,
    streak: 0,
    is_verified: false,
    is_pro: false,
    created_at: "2024-03-18T10:00:00Z",
  },
  {
    id: "user-14",
    username: "StormBreaker",
    avatar_url: null,
    bio: null,
    points: 5800,
    total_matches: 125,
    wins: 60,
    losses: 65,
    win_rate: 48,
    rank: 14,
    streak: 0,
    is_verified: false,
    is_pro: false,
    created_at: "2024-03-20T10:00:00Z",
  },
  {
    id: "user-15",
    username: "GhostRacer",
    avatar_url: null,
    bio: null,
    points: 5200,
    total_matches: 118,
    wins: 54,
    losses: 64,
    win_rate: 46,
    rank: 15,
    streak: 0,
    is_verified: false,
    is_pro: false,
    created_at: "2024-03-22T10:00:00Z",
  },
  {
    id: "user-16",
    username: "LunarByte",
    avatar_url: null,
    bio: null,
    points: 4700,
    total_matches: 112,
    wins: 48,
    losses: 64,
    win_rate: 43,
    rank: 16,
    streak: 0,
    is_verified: false,
    is_pro: false,
    created_at: "2024-04-01T10:00:00Z",
  },
  {
    id: "user-17",
    username: "PixelHunter",
    avatar_url: null,
    bio: null,
    points: 4100,
    total_matches: 105,
    wins: 42,
    losses: 63,
    win_rate: 40,
    rank: 17,
    streak: 0,
    is_verified: false,
    is_pro: false,
    created_at: "2024-04-05T10:00:00Z",
  },
  {
    id: "user-18",
    username: "FrostBite",
    avatar_url: null,
    bio: null,
    points: 3500,
    total_matches: 98,
    wins: 36,
    losses: 62,
    win_rate: 37,
    rank: 18,
    streak: 0,
    is_verified: false,
    is_pro: false,
    created_at: "2024-04-08T10:00:00Z",
  },
  {
    id: "user-19",
    username: "CobraStrike",
    avatar_url: null,
    bio: null,
    points: 2900,
    total_matches: 90,
    wins: 28,
    losses: 62,
    win_rate: 31,
    rank: 19,
    streak: 0,
    is_verified: false,
    is_pro: false,
    created_at: "2024-04-10T10:00:00Z",
  },
  {
    id: "user-20",
    username: "NovaBurst",
    avatar_url: null,
    bio: null,
    points: 2100,
    total_matches: 80,
    wins: 20,
    losses: 60,
    win_rate: 25,
    rank: 20,
    streak: 0,
    is_verified: false,
    is_pro: false,
    created_at: "2024-04-12T10:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Sorted for display (rank order)
// ---------------------------------------------------------------------------
const SORTED_PROFILES = [...MOCK_PROFILES].sort((a, b) => a.rank - b.rank);

// ---------------------------------------------------------------------------
// Game filter tabs
// ---------------------------------------------------------------------------

type GameTab = "all" | GameId;

const GAME_TABS: { id: GameTab; label: string; emoji: string }[] = [
  { id: "all", label: "All", emoji: "🌐" },
  { id: "efootball", label: "eFootball", emoji: "⚽" },
  { id: "dls", label: "DLS", emoji: "🏆" },
  { id: "free-fire", label: "Free Fire", emoji: "🔥" },
  { id: "pubg-mobile", label: "PUBG", emoji: "🎯" },
  { id: "cod-mobile", label: "COD Mobile", emoji: "💀" },
  { id: "fc25", label: "FC 25", emoji: "⚡" },
];

export function LeaderboardTabs({
  selected,
  onChange,
}: {
  selected: GameTab;
  onChange: (tab: GameTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter by game"
      className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide"
    >
      {GAME_TABS.map((tab) => {
        const isActive = selected === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
              "transition-colors duration-150 outline-none",
              "focus-visible:ring-2 focus-visible:ring-[#a855f7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d14]",
              isActive
                ? "bg-[#a855f7] text-white shadow-[0_0_12px_rgba(168,85,247,0.35)]"
                : "bg-[#1a1a2e] text-[#94a3b8] border border-[#2a2a4e] hover:border-[#a855f7]/40 hover:text-[#f1f5f9]",
            )}
          >
            <span aria-hidden="true">{tab.emoji}</span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Podium card helpers
// ---------------------------------------------------------------------------

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

interface PodiumConfig {
  rank: 1 | 2 | 3;
  medalColor: string;
  medalBg: string;
  medalBorder: string;
  glow: string;
  cardBg: string;
  cardBorder: string;
  heightClass: string;
  icon: React.ReactNode;
  label: string;
  order: number;
}

function getPodiumConfig(rank: 1 | 2 | 3): PodiumConfig {
  switch (rank) {
    case 1:
      return {
        rank,
        medalColor: "text-[#f59e0b]",
        medalBg: "bg-[#f59e0b]/15",
        medalBorder: "border-[#f59e0b]/40",
        glow: "shadow-[0_0_32px_rgba(245,158,11,0.2)]",
        cardBg: "bg-gradient-to-b from-[#f59e0b]/10 to-[#1a1a2e]",
        cardBorder: "border-[#f59e0b]/40",
        heightClass: "pt-4",
        icon: <Crown className="w-5 h-5 text-[#f59e0b]" aria-hidden="true" />,
        label: "Gold",
        order: 2,
      };
    case 2:
      return {
        rank,
        medalColor: "text-[#94a3b8]",
        medalBg: "bg-[#94a3b8]/15",
        medalBorder: "border-[#94a3b8]/40",
        glow: "shadow-[0_0_20px_rgba(148,163,184,0.12)]",
        cardBg: "bg-gradient-to-b from-[#94a3b8]/8 to-[#1a1a2e]",
        cardBorder: "border-[#94a3b8]/30",
        heightClass: "pt-8 mt-4",
        icon: <Shield className="w-5 h-5 text-[#94a3b8]" aria-hidden="true" />,
        label: "Silver",
        order: 1,
      };
    case 3:
      return {
        rank,
        medalColor: "text-[#f97316]",
        medalBg: "bg-[#f97316]/15",
        medalBorder: "border-[#f97316]/40",
        glow: "shadow-[0_0_20px_rgba(249,115,22,0.12)]",
        cardBg: "bg-gradient-to-b from-[#f97316]/8 to-[#1a1a2e]",
        cardBorder: "border-[#f97316]/30",
        heightClass: "pt-8 mt-4",
        icon: <Star className="w-5 h-5 text-[#f97316]" aria-hidden="true" />,
        label: "Bronze",
        order: 3,
      };
  }
}

function PodiumCard({
  profile,
  config,
}: {
  profile: UserProfile;
  config: PodiumConfig;
}) {
  const initials = profile.username.slice(0, 2).toUpperCase();
  const avatarGradient = getAvatarGradient(profile.username);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: config.rank * 0.1, ease: "easeOut" }}
      style={{ order: config.order }}
      className={cn(
        "flex-1 flex flex-col items-center gap-3 rounded-2xl border p-5",
        config.cardBg,
        config.cardBorder,
        config.glow,
        config.heightClass,
        "min-w-0",
      )}
    >
      {/* Medal icon */}
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center border",
          config.medalBg,
          config.medalBorder,
        )}
        aria-label={config.label}
      >
        {config.icon}
      </div>

      {/* Avatar */}
      <div
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center text-lg font-extrabold text-white bg-linear-to-br ring-2",
          avatarGradient,
          config.rank === 1
            ? "ring-[#f59e0b]/60 w-16 h-16 text-xl"
            : "ring-[#2a2a4e]",
        )}
        aria-hidden="true"
      >
        {initials}
      </div>

      {/* Username */}
      <div className="text-center min-w-0 w-full">
        <p
          className={cn(
            "font-bold truncate text-sm leading-tight",
            config.rank === 1 ? "text-[#f59e0b] text-base" : "text-[#f1f5f9]",
          )}
        >
          {profile.username}
        </p>
        {profile.is_pro && (
          <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30 leading-none">
            PRO
          </span>
        )}
      </div>

      {/* Points */}
      <p className={cn("text-sm font-bold tabular-nums", config.medalColor)}>
        {profile.points.toLocaleString()} pts
      </p>

      {/* Win rate */}
      <p className="text-xs text-[#64748b]">{profile.win_rate}% win rate</p>

      {profile.streak > 0 && (
        <div className="flex items-center gap-1 text-xs text-[#f59e0b]">
          <Flame className="w-3 h-3" aria-hidden="true" />
          <span>{profile.streak} streak</span>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main page — "use client" because we need useState for tabs + pagination
// ---------------------------------------------------------------------------

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<GameTab>("all");
  const [page, setPage] = useState(1);
  const TOTAL_PAGES = 5;

  const top3 = SORTED_PROFILES.slice(0, 3) as [
    UserProfile,
    UserProfile,
    UserProfile,
  ];
  const rest = SORTED_PROFILES.slice(3);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
      {/* ------------------------------------------------------------------ */}
      {/* Page header                                                          */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between gap-3 flex-wrap"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#a855f7]/15 border border-[#a855f7]/30 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-[#a855f7]" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#f1f5f9] leading-none">
              Leaderboard
            </h1>
            <p className="text-xs text-[#64748b] mt-0.5">
              Season 1 · All Games
            </p>
          </div>
        </div>

        {/* Current user rank badge */}
        <Badge
          variant="info"
          size="md"
          className="shrink-0 px-3 py-1 h-auto text-xs font-bold"
        >
          <Crown className="w-3 h-3 mr-1 text-[#a855f7]" aria-hidden="true" />
          Your rank: #7
        </Badge>
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* Game filter tabs                                                     */}
      {/* ------------------------------------------------------------------ */}
      <LeaderboardTabs selected={activeTab} onChange={setActiveTab} />

      {/* ------------------------------------------------------------------ */}
      {/* Top 3 Podium                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section aria-label="Top 3 players">
        <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest mb-4">
          🏆 Top Performers
        </p>
        <div className="flex gap-3 items-end">
          {top3.map((profile) => {
            const config = getPodiumConfig(profile.rank as 1 | 2 | 3);
            return (
              <PodiumCard key={profile.id} profile={profile} config={config} />
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Full ranked list (ranks 4–20)                                        */}
      {/* ------------------------------------------------------------------ */}
      <section aria-label="Full leaderboard">
        <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest mb-3">
          Rankings
        </p>
        <div className="flex flex-col gap-2">
          {rest.map((profile, idx) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.25,
                delay: idx * 0.035,
                ease: "easeOut",
              }}
            >
              <LeaderboardRow
                profile={profile}
                rank={profile.rank}
                isCurrentUser={profile.id === CURRENT_USER_ID}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Pagination                                                           */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="flex items-center justify-center gap-3 pt-2"
      >
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          aria-label="Previous page"
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors duration-150 outline-none",
            "focus-visible:ring-2 focus-visible:ring-[#a855f7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d14]",
            page === 1
              ? "bg-[#1a1a2e]/50 border-[#2a2a4e]/50 text-[#64748b] cursor-not-allowed"
              : "bg-[#1a1a2e] border-[#2a2a4e] text-[#94a3b8] hover:border-[#a855f7]/40 hover:text-[#f1f5f9]",
          )}
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Prev
        </button>

        <span className="text-sm text-[#94a3b8] font-medium tabular-nums select-none">
          Page <span className="text-[#f1f5f9] font-bold">{page}</span> of{" "}
          <span className="text-[#f1f5f9] font-bold">{TOTAL_PAGES}</span>
        </span>

        <button
          type="button"
          onClick={() => setPage((p) => Math.min(TOTAL_PAGES, p + 1))}
          disabled={page === TOTAL_PAGES}
          aria-label="Next page"
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors duration-150 outline-none",
            "focus-visible:ring-2 focus-visible:ring-[#a855f7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d14]",
            page === TOTAL_PAGES
              ? "bg-[#1a1a2e]/50 border-[#2a2a4e]/50 text-[#64748b] cursor-not-allowed"
              : "bg-[#1a1a2e] border-[#2a2a4e] text-[#94a3b8] hover:border-[#a855f7]/40 hover:text-[#f1f5f9]",
          )}
        >
          Next
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </motion.div>
    </div>
  );
}
