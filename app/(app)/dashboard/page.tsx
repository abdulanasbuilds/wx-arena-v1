import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GAMES } from "@/lib/utils/constants";
import { StatCard } from "@/components/features/StatCard";
import { MatchCard } from "@/components/features/MatchCard";
import { TournamentCard } from "@/components/features/TournamentCard";
import { GameCard } from "@/components/features/GameCard";
import { FeedItem } from "@/components/features/FeedItem";
import { Button } from "@/components/ui/Button";
import type { UserProfile, Match, Tournament } from "@/types/app.types";
import {
  Zap,
  Target,
  Swords,
  Trophy,
  ArrowRight,
  Gamepad2,
} from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockProfile: UserProfile = {
  id: "user-001",
  username: "PhantomX",
  avatar_url: null,
  bio: "Top-ranked eFootball player. Here to dominate.",
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
};

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
    player_1: mockProfile,
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
    player_2: mockProfile,
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
    player_1: mockProfile,
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
];

const mockTournaments: Tournament[] = [
  {
    id: "tourney-001",
    title: "Weekend Warrior Cup",
    game_id: "efootball",
    status: "open",
    entry_fee: 200,
    prize_pool: 10_000,
    max_participants: 64,
    current_participants: 47,
    start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tourney-002",
    title: "Free Fire Royale Series",
    game_id: "free-fire",
    status: "in_progress",
    entry_fee: 500,
    prize_pool: 25_000,
    max_participants: 32,
    current_participants: 32,
    start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

interface MockFeedItem {
  id: string;
  type: "match_result" | "tournament_win" | "new_player" | "achievement";
  username: string;
  description: string;
  timestamp: string;
  points?: number;
}

const mockFeed: MockFeedItem[] = [
  {
    id: "feed-001",
    type: "match_result",
    username: "PhantomX",
    description: "won a 1v1 match against BlazeMaster in eFootball",
    timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    points: 1_000,
  },
  {
    id: "feed-002",
    type: "tournament_win",
    username: "CyberKnight",
    description: "claimed 1st place in the PUBG Mobile Grand Prix",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    points: 8_500,
  },
  {
    id: "feed-003",
    type: "new_player",
    username: "VortexSniper",
    description: "joined WX ARENA and is ready to compete",
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "feed-004",
    type: "achievement",
    username: "StormRider",
    description: "unlocked the 'On Fire' badge with a 10-win streak",
    timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
    points: 500,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTodayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Use mock profile but override the id to match the real auth user
  const profile: UserProfile = { ...mockProfile, id: user.id };

  const winRateTrend =
    profile.win_rate >= 50
      ? { value: 4, isPositive: true }
      : { value: 3, isPositive: false };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* ── Welcome header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#f1f5f9] leading-tight">
            Welcome back,{" "}
            <span className="text-[#a855f7]">{profile.username}</span>! 👋
          </h1>
          <p className="text-sm text-[#64748b] mt-1">{getTodayLabel()}</p>
        </div>

        {profile.streak > 0 && (
          <div className="inline-flex items-center gap-2 bg-[#f59e0b]/10 border border-[#f59e0b]/25 text-[#f59e0b] px-4 py-2 rounded-xl text-sm font-semibold self-start sm:self-auto">
            🔥 {profile.streak}-match win streak
          </div>
        )}
      </div>

      {/* ── Stats row ── */}
      <section aria-label="Your statistics">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="WX Points"
            value={profile.points}
            icon={<Zap className="w-4 h-4" aria-hidden="true" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            label="Win Rate"
            value={`${profile.win_rate.toFixed(1)}%`}
            icon={<Target className="w-4 h-4" aria-hidden="true" />}
            trend={winRateTrend}
          />
          <StatCard
            label="Total Matches"
            value={profile.total_matches}
            icon={<Swords className="w-4 h-4" aria-hidden="true" />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            label="Current Rank"
            value={`#${profile.rank}`}
            icon={<Trophy className="w-4 h-4" aria-hidden="true" />}
            trend={{ value: 3, isPositive: true }}
          />
        </div>
      </section>

      {/* ── Two-column grid: Matches + Tournaments ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Matches */}
        <section aria-label="Recent matches">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#f1f5f9]">
              Recent Matches
            </h2>
            <Link
              href="/matches"
              className="flex items-center gap-1 text-xs font-medium text-[#a855f7] hover:text-[#c084fc] transition-colors duration-150"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="space-y-3">
            {mockMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                currentUserId={profile.id}
              />
            ))}
          </div>
        </section>

        {/* Active Tournaments */}
        <section aria-label="Active tournaments">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#f1f5f9]">
              Active Tournaments
            </h2>
            <Link
              href="/tournaments"
              className="flex items-center gap-1 text-xs font-medium text-[#a855f7] hover:text-[#c084fc] transition-colors duration-150"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="space-y-3">
            {mockTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        </section>
      </div>

      {/* ── Recent Activity feed ── */}
      <section aria-label="Recent activity">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#f1f5f9]">
            Recent Activity
          </h2>
          <span className="text-xs text-[#64748b]">Live feed</span>
        </div>

        <div className="space-y-2">
          {mockFeed.map((item) => (
            <FeedItem
              key={item.id}
              type={item.type}
              username={item.username}
              description={item.description}
              timestamp={item.timestamp}
              points={item.points}
            />
          ))}
        </div>
      </section>

      {/* ── Play Now — Games grid ── */}
      <section aria-label="Play now">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-[#a855f7]" aria-hidden="true" />
            <h2 className="text-base font-semibold text-[#f1f5f9]">Play Now</h2>
          </div>
          <Link href="/matches">
            <Button variant="primary" size="sm">
              Find Match
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {GAMES.map((game) => (
            <Link
              key={game.id}
              href={`/matches?game=${game.id}`}
              tabIndex={-1}
              aria-label={`Play ${game.name}`}
            >
              <GameCard game={game} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
