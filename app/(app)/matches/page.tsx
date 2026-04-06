"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MatchCard } from "@/components/features/MatchCard";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils/cn";
import type { Match, MatchStatus, UserProfile } from "@/types/app.types";
import { Swords, Plus, Inbox } from "lucide-react";
import { MatchmakingQueue } from "@/components/features/MatchmakingQueue";

// ─── Types for Supabase data ──────────────────────────────────────────────────

interface SupabaseProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  points: number;
  total_matches: number;
  wins: number;
  losses: number;
  win_rate: number;
  rank: number;
  streak: number;
  is_verified: boolean;
  is_pro: boolean;
  created_at: string;
}

interface SupabaseMatch {
  id: string;
  game_id: string;
  match_type: string;
  status: string;
  wager_points: number;
  player_1_id: string;
  player_2_id: string | null;
  winner_id: string | null;
  created_at: string;
  completed_at: string | null;
  player_1: SupabaseProfile;
  player_2: SupabaseProfile | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapSupabaseProfile(profile: SupabaseProfile | null): UserProfile | null {
  if (!profile) return null;
  return {
    id: profile.id,
    username: profile.username,
    avatar_url: profile.avatar_url,
    bio: profile.bio,
    points: profile.points,
    total_matches: profile.total_matches,
    wins: profile.wins,
    losses: profile.losses,
    win_rate: profile.win_rate,
    rank: profile.rank,
    streak: profile.streak,
    is_verified: profile.is_verified,
    is_pro: profile.is_pro,
    created_at: profile.created_at,
  };
}

function mapSupabaseMatch(match: SupabaseMatch): Match {
  return {
    id: match.id,
    game_id: match.game_id as Match["game_id"],
    match_type: match.match_type as Match["match_type"],
    status: match.status as Match["status"],
    wager_points: match.wager_points,
    player_1_id: match.player_1_id,
    player_2_id: match.player_2_id || undefined,
    winner_id: match.winner_id || undefined,
    created_at: match.created_at,
    completed_at: match.completed_at,
    player_1: mapSupabaseProfile(match.player_1)!,
    player_2: mapSupabaseProfile(match.player_2) || undefined,
  };
}

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
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    // Check auth and fetch matches
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      
      setUserId(user.id);
      setIsAuthChecking(false);
      
      // Fetch real matches from Supabase
      const { data: matchesData, error } = await supabase
        .from("matches")
        .select(`
          *,
          player_1:profiles!matches_player_1_id_fkey(*),
          player_2:profiles!matches_player_2_id_fkey(*)
        `)
        .or(`player_1_id.eq.${user.id},player_2_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      
      if (!error && matchesData) {
        setMatches((matchesData as SupabaseMatch[]).map(mapSupabaseMatch));
      }
      
      setIsLoading(false);
    });
  }, [router]);

  if (isAuthChecking || isLoading) {
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
            Create Match
          </Button>
        </Link>
      </div>

      {/* ── Matchmaking Queue ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <MatchmakingQueue 
            userId={userId ?? ""} 
            onMatchFound={(opponent) => {
              console.log("Match found with:", opponent);
              // Navigate to match lobby or show match found modal
            }}
          />
        </div>
        <div className="lg:col-span-2">
          {/* ── Filtered match grid ── */}
          <MatchesClient
            matches={matches}
            currentUserId={userId ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
