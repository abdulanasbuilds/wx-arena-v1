"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Plus,
  Users,
  Zap,
  Clock,
  ChevronRight,
  Flame,
  Lock,
} from "lucide-react";
import { TournamentCard } from "@/components/features/TournamentCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import { GAMES } from "@/lib/utils/constants";
import type { Tournament, TournamentStatus } from "@/types/app.types";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: "t-001",
    title: "eFootball Grand Prix — Season Opener",
    game_id: "efootball",
    status: "open",
    entry_fee: 200,
    prize_pool: 10000,
    max_participants: 32,
    current_participants: 24,
    start_time: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(), // 3 h from now
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "t-002",
    title: "Free Fire Blitz Cup",
    game_id: "free-fire",
    status: "open",
    entry_fee: 100,
    prize_pool: 5000,
    max_participants: 64,
    current_participants: 47,
    start_time: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(), // 8 h from now
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "t-003",
    title: "PUBG Mobile Legends Invitational",
    game_id: "pubg-mobile",
    status: "in_progress",
    entry_fee: 150,
    prize_pool: 8000,
    max_participants: 50,
    current_participants: 50,
    start_time: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // started 45 min ago
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "t-004",
    title: "COD Mobile Squad Showdown",
    game_id: "cod-mobile",
    status: "in_progress",
    entry_fee: 250,
    prize_pool: 15000,
    max_participants: 16,
    current_participants: 16,
    start_time: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // started 2 h ago
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: "t-005",
    title: "FC 25 Ultimate Team Championship",
    game_id: "fc25",
    status: "completed",
    entry_fee: 300,
    prize_pool: 20000,
    max_participants: 32,
    current_participants: 32,
    start_time: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
  {
    id: "t-006",
    title: "DLS Weekend Knockout",
    game_id: "dls",
    status: "cancelled",
    entry_fee: 50,
    prize_pool: 2000,
    max_participants: 20,
    current_participants: 7,
    start_time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Filter tabs
// ---------------------------------------------------------------------------

type FilterTab = "all" | TournamentStatus;

const FILTER_TABS: {
  id: FilterTab;
  label: string;
  count: (t: Tournament[]) => number;
}[] = [
  { id: "all", label: "All", count: (t) => t.length },
  {
    id: "open",
    label: "Open",
    count: (t) => t.filter((x) => x.status === "open").length,
  },
  {
    id: "in_progress",
    label: "Active",
    count: (t) => t.filter((x) => x.status === "in_progress").length,
  },
  {
    id: "completed",
    label: "Completed",
    count: (t) => t.filter((x) => x.status === "completed").length,
  },
];

export function TournamentTabs({
  selected,
  onChange,
  tournaments,
}: {
  selected: FilterTab;
  onChange: (tab: FilterTab) => void;
  tournaments: Tournament[];
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter tournaments"
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
    >
      {FILTER_TABS.map((tab) => {
        const isActive = selected === tab.id;
        const count = tab.count(tournaments);
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium",
              "transition-colors duration-150 outline-none",
              "focus-visible:ring-2 focus-visible:ring-[#a855f7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d14]",
              isActive
                ? "bg-[#a855f7] text-white shadow-[0_0_14px_rgba(168,85,247,0.35)]"
                : "bg-[#1a1a2e] text-[#94a3b8] border border-[#2a2a4e] hover:border-[#a855f7]/40 hover:text-[#f1f5f9]",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-md text-[10px] font-bold leading-none",
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-[#2a2a4e] text-[#64748b]",
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Featured tournament banner
// ---------------------------------------------------------------------------

function formatCountdown(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();

  if (diffMs <= 0) return "Started";

  const totalSecs = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function FeaturedBanner({ tournament }: { tournament: Tournament }) {
  const game = GAMES.find((g) => g.id === tournament.game_id) ?? GAMES[0];
  const fillPercent = Math.min(
    100,
    Math.round(
      (tournament.current_participants / tournament.max_participants) * 100,
    ),
  );
  const spotsLeft =
    tournament.max_participants - tournament.current_participants;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-[#a855f7]/40 bg-[#1a1a2e]"
    >
      {/* Background gradient accent */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top right, ${game.color}55 0%, transparent 65%)`,
        }}
      />
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-10 pointer-events-none bg-[#a855f7]" />

      {/* Content */}
      <div className="relative p-5 md:p-6 flex flex-col gap-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: `${game.color}22` }}
              aria-hidden="true"
            >
              {game.emoji}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30 uppercase tracking-widest">
                  Featured
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30">
                  Open
                </span>
              </div>
              <h2 className="text-base md:text-lg font-extrabold text-[#f1f5f9] leading-tight mt-1 truncate">
                {tournament.title}
              </h2>
              <p className="text-xs text-[#94a3b8] mt-0.5">{game.name}</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Prize Pool */}
          <div className="rounded-xl bg-[#16213e] border border-[#2a2a4e] p-3 text-center">
            <p className="text-[10px] text-[#64748b] mb-1 uppercase tracking-wide">
              Prize Pool
            </p>
            <p className="text-sm font-bold text-[#f59e0b] flex items-center justify-center gap-1">
              <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
              {tournament.prize_pool.toLocaleString()} pts
            </p>
          </div>

          {/* Entry Fee */}
          <div className="rounded-xl bg-[#16213e] border border-[#2a2a4e] p-3 text-center">
            <p className="text-[10px] text-[#64748b] mb-1 uppercase tracking-wide">
              Entry Fee
            </p>
            <p className="text-sm font-bold text-[#f1f5f9]">
              {tournament.entry_fee === 0
                ? "Free"
                : `${tournament.entry_fee.toLocaleString()} pts`}
            </p>
          </div>

          {/* Countdown */}
          <div className="rounded-xl bg-[#16213e] border border-[#2a2a4e] p-3 text-center">
            <p className="text-[10px] text-[#64748b] mb-1 uppercase tracking-wide">
              Starts In
            </p>
            <p className="text-sm font-bold text-[#a855f7] flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {formatCountdown(tournament.start_time)}
            </p>
          </div>
        </div>

        {/* Participant progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
              <Users className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {tournament.current_participants} /{" "}
                {tournament.max_participants} players
              </span>
            </div>
            <span
              className={cn(
                "text-xs font-semibold",
                spotsLeft <= 5 ? "text-[#ef4444]" : "text-[#22c55e]",
              )}
            >
              {spotsLeft <= 5
                ? `⚠ Only ${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left!`
                : `${spotsLeft} spots open`}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#16213e] border border-[#2a2a4e] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-[#a855f7] to-[#7c3aed]"
              initial={{ width: 0 }}
              animate={{ width: `${fillPercent}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
            <Flame className="w-3.5 h-3.5 text-[#f59e0b]" aria-hidden="true" />
            <span>Trending · High prize pool</span>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#a855f7] hover:bg-[#9333ea] text-white text-sm font-semibold transition-colors duration-150 shadow-[0_0_18px_rgba(168,85,247,0.4)]"
          >
            Join Now
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ filter }: { filter: FilterTab }) {
  const messages: Record<FilterTab, { title: string; sub: string }> = {
    all: {
      title: "No tournaments yet",
      sub: "Check back soon — new ones are added regularly.",
    },
    open: {
      title: "No open tournaments",
      sub: "All current tournaments are full or closed. Stay tuned!",
    },
    in_progress: {
      title: "No active tournaments",
      sub: "There are no tournaments running right now.",
    },
    completed: {
      title: "No completed tournaments",
      sub: "Completed tournaments will appear here.",
    },
    cancelled: {
      title: "No cancelled tournaments",
      sub: "Cancelled tournaments will be listed here.",
    },
  };
  const { title, sub } = messages[filter];

  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="col-span-full flex flex-col items-center justify-center gap-3 py-20 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-[#1a1a2e] border border-[#2a2a4e] flex items-center justify-center text-2xl">
        🏟️
      </div>
      <p className="text-base font-semibold text-[#f1f5f9]">{title}</p>
      <p className="text-sm text-[#64748b] max-w-xs">{sub}</p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TournamentsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const featured = MOCK_TOURNAMENTS.find((t) => t.status === "open") ?? null;

  const filteredTournaments =
    activeFilter === "all"
      ? MOCK_TOURNAMENTS
      : MOCK_TOURNAMENTS.filter((t) => t.status === activeFilter);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
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
            <Zap className="w-5 h-5 text-[#a855f7]" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#f1f5f9] leading-none">
              Tournaments
            </h1>
            <p className="text-xs text-[#64748b] mt-0.5">
              {MOCK_TOURNAMENTS.filter((t) => t.status === "open").length} open
              ·{" "}
              {
                MOCK_TOURNAMENTS.filter((t) => t.status === "in_progress")
                  .length
              }{" "}
              active
            </p>
          </div>
        </div>

        {/* Create Tournament — disabled / coming soon */}
        <div className="relative group">
          <Button
            variant="outline"
            size="sm"
            disabled
            title="Coming Soon"
            className="gap-1.5 cursor-not-allowed"
          >
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            Create Tournament
          </Button>
          {/* Tooltip */}
          <span
            className={cn(
              "pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2",
              "px-2 py-1 rounded-lg bg-[#1a1a2e] border border-[#2a2a4e] text-[#94a3b8] text-[10px] font-medium whitespace-nowrap",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg z-10",
            )}
            role="tooltip"
          >
            Coming Soon
          </span>
        </div>
      </motion.div>

      {/* ------------------------------------------------------------------ */}
      {/* Featured tournament banner                                          */}
      {/* ------------------------------------------------------------------ */}
      {featured !== null && <FeaturedBanner tournament={featured} />}

      {/* ------------------------------------------------------------------ */}
      {/* Filter tabs                                                          */}
      {/* ------------------------------------------------------------------ */}
      <TournamentTabs
        selected={activeFilter}
        onChange={setActiveFilter}
        tournaments={MOCK_TOURNAMENTS}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Tournament grid                                                      */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTournaments.length === 0 ? (
            <EmptyState filter={activeFilter} key="empty-state" />
          ) : (
            filteredTournaments.map((tournament, idx) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.28,
                  delay: idx * 0.05,
                  ease: "easeOut",
                }}
                layout
              >
                <TournamentCard tournament={tournament} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
