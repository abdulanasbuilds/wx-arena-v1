"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MatchCard } from "@/components/features/MatchCard";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils/cn";
import type { Match, MatchStatus } from "@/types/app.types";
import { Swords, Plus, Inbox } from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_USER_ID = "user-001";

const mockPlayerOne = {
  id: "user-001",
  username: "PhantomX",
  avatar_url: null,
  bio: null,
  points: 14_850,
  total_matches: 312,
  wins: 219,
  losses: 93,
  win_rate: 70.2,
  rank: 7,
  streak: 5,
  is_verified: true,
  is_pro: true,
  created_at: "2024-01-15T10:00:00Z",
} as const;

const mockMatches: Match[] = [
  {
    id: "match-001",
    game_id: "efootball",
    match_type: "1v1",
    status: "in_progress",
    wager_points: 500,
    player_1_id: "user-001",
    player_2_id: "user-002",
    winner_id: null,
    created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    completed_at: null,
    player_1: { ...mockPlayerOne },
    player_2: {
      id: "user-002",
      username: "NightStalker",
      avatar_url: null,
      bio: null,
      points: 11_200,
      total_matches: 198,
      wins: 118,
      losses: 80,
      win_rate: 59.6,
      rank: 14,
      streak: 2,
      is_verified: false,
      is_pro: false,
      created_at: "2024-03-10T08:30:00Z",
    },
  },
  {
    id: "match-002",
    game_id: "free-fire",
    match_type: "Squad",
    status: "completed",
    wager_points: 1_000,
    player_1_id: "user-003",
    player_2_id: "user-001",
    winner_id: "user-001",
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    player_1: {
      id: "user-003",
      username: "BlazeMaster",
      avatar_url: null,
      bio: null,
      points: 9_400,
      total_matches: 155,
      wins: 82,
      losses: 73,
      win_rate: 52.9,
      rank: 23,
      streak: 0,
      is_verified: false,
      is_pro: false,
      created_at: "2024-02-20T14:00:00Z",
    },
    player_2: { ...mockPlayerOne },
  },
  {
    id: "match-003",
    game_id: "fc25",
    match_type: "1v1",
    status: "pending",
    wager_points: 250,
    player_1_id: "user-001",
    player_2_id: "user-004",
    winner_id: null,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    completed_at: null,
    player_1: { ...mockPlayerOne },
    player_2: {
      id: "user-004",
      username: "StormRider",
      avatar_url: null,
      bio: null,
      points: 13_100,
      total_matches: 274,
      wins: 170,
      losses: 104,
      win_rate: 62.0,
      rank: 9,
      streak: 3,
      is_verified: true,
      is_pro: true,
      created_at: "2024-01-28T09:00:00Z",
    },
  },
  {
    id: "match-004",
    game_id: "pubg-mobile",
    match_type: "Squad",
    status: "completed",
    wager_points: 2_000,
    player_1_id: "user-005",
    player_2_id: "user-001",
    winner_id: "user-005",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    player_1: {
      id: "user-005",
      username: "CyberKnight",
      avatar_url: null,
      bio: null,
      points: 18_300,
      total_matches: 420,
      wins: 290,
      losses: 130,
      win_rate: 69.0,
      rank: 4,
      streak: 8,
      is_verified: true,
      is_pro: true,
      created_at: "2023-12-01T06:00:00Z",
    },
    player_2: { ...mockPlayerOne },
  },
  {
    id: "match-005",
    game_id: "dls",
    match_type: "1v1",
    status: "disputed",
    wager_points: 750,
    player_1_id: "user-001",
    player_2_id: "user-006",
    winner_id: null,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    completed_at: null,
    player_1: { ...mockPlayerOne },
    player_2: {
      id: "user-006",
      username: "VortexSniper",
      avatar_url: null,
      bio: null,
      points: 7_800,
      total_matches: 121,
      wins: 55,
      losses: 66,
      win_rate: 45.5,
      rank: 38,
      streak: 0,
      is_verified: false,
      is_pro: false,
      created_at: "2024-04-05T11:00:00Z",
    },
  },
  {
    id: "match-006",
    game_id: "cod-mobile",
    match_type: "1v1",
    status: "pending",
    wager_points: 300,
    player_1_id: "user-007",
    player_2_id: "user-001",
    winner_id: null,
    created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    completed_at: null,
    player_1: {
      id: "user-007",
      username: "IronFang",
      avatar_url: null,
      bio: null,
      points: 10_500,
      total_matches: 189,
      wins: 101,
      losses: 88,
      win_rate: 53.4,
      rank: 19,
      streak: 1,
      is_verified: false,
      is_pro: false,
      created_at: "2024-02-14T16:00:00Z",
    },
    player_2: { ...mockPlayerOne },
  },
];

// ─── Filter types ─────────────────────────────────────────────────────────────

type FilterTab = "all" | MatchStatus;

interface FilterTabConfig {
  label: string;
  value: FilterTab;
}

const FILTER_TABS: FilterTabConfig[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Active", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Disputed", value: "disputed" },
];

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({
  filter,
  onReset,
}: {
  filter: FilterTab;
  onReset: () => void;
}) {
  const messages: Record<FilterTab, { title: string; body: string }> = {
    all: {
      title: "No matches yet",
      body: "Jump in and challenge someone — your first match is waiting.",
    },
    pending: {
      title: "No pending matches",
      body: "You have no matches waiting to start right now.",
    },
    in_progress: {
      title: "Nothing live",
      body: "You have no active matches in progress.",
    },
    completed: {
      title: "No completed matches",
      body: "Finish a match and your history will appear here.",
    },
    disputed: {
      title: "No disputed matches",
      body: "Great news — no disputes to resolve.",
    },
    cancelled: {
      title: "No cancelled matches",
      body: "No matches have been cancelled.",
    },
  };

  const { title, body } = messages[filter];

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1a1a2e] border border-[#2a2a4e] text-[#2a2a4e]">
        <Inbox className="w-8 h-8 text-[#2a2a4e]" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-base font-semibold text-[#f1f5f9]">{title}</p>
        <p className="text-sm text-[#64748b] max-w-xs">{body}</p>
      </div>
      {filter !== "all" && (
        <button
          onClick={onReset}
          className="text-sm font-medium text-[#a855f7] hover:text-[#c084fc] underline underline-offset-2 transition-colors duration-150"
        >
          Show all matches
        </button>
      )}
    </div>
  );
}

// ─── MatchesClient — named export ─────────────────────────────────────────────

export function MatchesClient({
  matches,
  currentUserId,
}: {
  matches: Match[];
  currentUserId: string;
}) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const filtered =
    activeFilter === "all"
      ? matches
      : matches.filter((m) => m.status === activeFilter);

  return (
    <div className="space-y-6">
      {/* Filter tab row */}
      <div
        role="tablist"
        aria-label="Filter matches by status"
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
      >
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.value;
          const count =
            tab.value === "all"
              ? matches.length
              : matches.filter((m) => m.status === tab.value).length;

          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveFilter(tab.value)}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium",
                "border transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d14]",
                isActive
                  ? "bg-[#a855f7] border-[#a855f7] text-white shadow-[0_0_12px_rgba(168,85,247,0.30)]"
                  : "bg-[#1a1a2e] border-[#2a2a4e] text-[#94a3b8] hover:border-[#a855f7]/40 hover:text-[#f1f5f9]",
              )}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full",
                    "text-[10px] font-bold leading-none",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#16213e] text-[#64748b]",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Match grid or empty state */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          filter={activeFilter}
          onReset={() => setActiveFilter("all")}
        />
      )}
    </div>
  );
}

// ─── MatchesPage — default export ─────────────────────────────────────────────

export default function MatchesPage() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
      } else {
        setUserId(user.id);
        setIsAuthChecking(false);
      }
    });
  }, [router]);

  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#a855f7]/15 border border-[#a855f7]/25 text-[#a855f7]">
            <Swords className="w-5 h-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-[#f1f5f9] leading-tight">
              Matches
            </h1>
            <p className="text-sm text-[#64748b]">
              Track and manage your competitive matches
            </p>
          </div>
        </div>

        <Link href="/matches/new">
          <Button
            variant="primary"
            size="md"
            className="gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Find Match
          </Button>
        </Link>
      </div>

      {/* ── Filtered match grid ── */}
      <MatchesClient
        matches={mockMatches}
        currentUserId={userId ?? MOCK_USER_ID}
      />
    </div>
  );
}
