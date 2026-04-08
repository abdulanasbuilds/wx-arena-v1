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

interface SupabaseTournament {
  id: string;
  title: string;
  game_id: string;
  status: string;
  entry_fee: number;
  prize_pool: number;
  max_participants: number;
  current_participants: number;
  start_time: string;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTodayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

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
    player_2_id: match.player_2_id,
    winner_id: match.winner_id,
    created_at: match.created_at,
    completed_at: match.completed_at,
    player_1: mapSupabaseProfile(match.player_1)!,
    player_2: mapSupabaseProfile(match.player_2),
  };
}

function mapSupabaseTournament(tournament: SupabaseTournament): Tournament {
  return {
    id: tournament.id,
    title: tournament.title,
    game_id: tournament.game_id as Tournament["game_id"],
    status: tournament.status as Tournament["status"],
    entry_fee: tournament.entry_fee,
    prize_pool: tournament.prize_pool,
    max_participants: tournament.max_participants,
    current_participants: tournament.current_participants,
    start_time: tournament.start_time,
    created_at: tournament.created_at,
  };
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

  // Fetch user profile
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile: UserProfile = (profileError || !profileData)
    ? {
        id: user.id,
        username: user.email?.split("@")[0] || "Player",
        avatar_url: null,
        bio: null,
        points: 1000,
        total_matches: 0,
        wins: 0,
        losses: 0,
        win_rate: 0,
        rank: 9999,
        streak: 0,
        is_verified: false,
        is_pro: false,
        created_at: new Date().toISOString(),
      }
    : mapSupabaseProfile(profileData as unknown as SupabaseProfile)!;

  // Fetch recent matches (where user is player_1 or player_2)
  const { data: matchesData, error: matchesError } = await supabase
    .from("matches")
    .select(`
      *,
      player_1:profiles!matches_player_1_id_fkey(*),
      player_2:profiles!matches_player_2_id_fkey(*)
    `)
    .or(`player_1_id.eq.${user.id},player_2_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(5);

  const matches: Match[] = matchesError || !matchesData
    ? []
    : (matchesData as SupabaseMatch[]).map(mapSupabaseMatch);

  // Fetch active tournaments
  const { data: tournamentsData, error: tournamentsError } = await supabase
    .from("tournaments")
    .select("*")
    .in("status", ["open", "in_progress"])
    .order("start_time", { ascending: true })
    .limit(5);

  const tournaments: Tournament[] = tournamentsError || !tournamentsData
    ? []
    : (tournamentsData as SupabaseTournament[]).map(mapSupabaseTournament);

  // Fetch recent wallet transactions for activity feed
  const { data: transactionsData, error: transactionsError } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Build activity feed from transactions
  const activityFeed = transactionsError || !transactionsData
    ? []
    : transactionsData.map((tx: { id: string; type: string; points: number; description: string; created_at: string }) => ({
        id: tx.id,
        type: tx.type === "win" ? "match_result" : tx.type === "earn" ? "achievement" : "new_player",
        username: profile.username,
        description: tx.description,
        timestamp: tx.created_at,
        points: tx.points > 0 ? tx.points : undefined,
      }));

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
            {matches.length > 0 ? (
              matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  currentUserId={profile.id}
                />
              ))
            ) : (
              <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl p-6 text-center">
                <p className="text-[#64748b] text-sm">No matches yet</p>
                <Link href="/matches">
                  <Button variant="primary" size="sm" className="mt-3">
                    Find a Match
                  </Button>
                </Link>
              </div>
            )}
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
            {tournaments.length > 0 ? (
              tournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))
            ) : (
              <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl p-6 text-center">
                <p className="text-[#64748b] text-sm">No active tournaments</p>
                <Link href="/tournaments">
                  <Button variant="outline" size="sm" className="mt-3">
                    Browse Tournaments
                  </Button>
                </Link>
              </div>
            )}
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
          {activityFeed.length > 0 ? (
            activityFeed.map((item) => (
              <FeedItem
                key={item.id}
                type={item.type as any}
                username={item.username}
                description={item.description}
                timestamp={item.timestamp}
                points={item.points}
              />
            ))
          ) : (
            <div className="bg-[#0d0d14] border border-[#1a1a2e] rounded-xl p-4 text-center">
              <p className="text-[#64748b] text-sm">No recent activity</p>
            </div>
          )}
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
