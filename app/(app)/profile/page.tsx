import { redirect } from "next/navigation";
import {
  Calendar,
  Edit2,
  Link2,
  Trophy,
  Target,
  Zap,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/features/StatCard";
import { MatchCard } from "@/components/features/MatchCard";
import { cn } from "@/lib/utils/cn";
import { GAMES } from "@/lib/utils/constants";
import type { UserProfile, Match, LinkedGame } from "@/types/app.types";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PROFILE: UserProfile = {
  id: "current-user-id",
  username: "GhostSniper",
  avatar_url: null,
  bio: "Competitive gamer from Lagos 🇳🇬",
  points: 4200,
  total_matches: 87,
  wins: 59,
  losses: 28,
  win_rate: 67.8,
  rank: 7,
  streak: 4,
  is_verified: true,
  is_pro: false,
  created_at: "2024-01-15T00:00:00Z",
};

const MOCK_MATCHES: Match[] = [
  {
    id: "m1",
    game_id: "fortnite",
    match_type: "1v1",
    status: "completed",
    wager_points: 200,
    player_1_id: "current-user-id",
    player_2_id: "opp-1",
    winner_id: "current-user-id",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    completed_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    player_1: MOCK_PROFILE,
    player_2: { ...MOCK_PROFILE, id: "opp-1", username: "DragonKick" },
  },
  {
    id: "m2",
    game_id: "pubg",
    match_type: "Squad",
    status: "completed",
    wager_points: 500,
    player_1_id: "opp-2",
    player_2_id: "current-user-id",
    winner_id: "opp-2",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString(),
    player_1: { ...MOCK_PROFILE, id: "opp-2", username: "PhantomBlaze" },
    player_2: MOCK_PROFILE,
  },
  {
    id: "m3",
    game_id: "apex-legends",
    match_type: "1v1",
    status: "in_progress",
    wager_points: 150,
    player_1_id: "current-user-id",
    player_2_id: "opp-3",
    winner_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    completed_at: null,
    player_1: MOCK_PROFILE,
    player_2: { ...MOCK_PROFILE, id: "opp-3", username: "SteelNova" },
  },
];

const MOCK_LINKED_GAMES: LinkedGame[] = [
  {
    id: "lg1",
    user_id: "current-user-id",
    game_id: "fortnite",
    platform: "Android",
    external_id: "FN-78923",
    display_name: "GhostSniper_FN",
    is_verified: true,
    created_at: "2024-01-20T00:00:00Z",
  },
  {
    id: "lg2",
    user_id: "current-user-id",
    game_id: "pubg",
    platform: "iOS",
    external_id: "PB-445512",
    display_name: "Gh0stPB",
    is_verified: false,
    created_at: "2024-02-03T00:00:00Z",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function formatJoinDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function getGameInfo(gameId: string) {
  return GAMES.find((g) => g.id === gameId) ?? GAMES[0];
}

export function ProfileHeader({ profile }: { profile: UserProfile }) {
  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <Avatar
          src={profile.avatar_url ?? undefined}
          username={profile.username}
          size="xl"
          isPro={profile.is_pro}
        />

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
            <h1 className="text-xl font-bold text-[#f1f5f9] leading-tight">
              {profile.username}
            </h1>
            {profile.is_verified && (
              <Badge variant="verified" size="sm">
                Verified
              </Badge>
            )}
            {profile.is_pro && (
              <Badge variant="pro" size="sm">
                PRO
              </Badge>
            )}
            {profile.streak > 0 && (
              <Badge variant="warning" size="sm">
                🔥{profile.streak} Streak
              </Badge>
            )}
          </div>

          {profile.bio && (
            <p className="text-sm text-[#94a3b8] mb-3 max-w-md">
              {profile.bio}
            </p>
          )}

          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-[#64748b]">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Joined {formatJoinDate(profile.created_at)}</span>
          </div>
        </div>

        <div className="shrink-0">
          <Button variant="secondary" size="sm">
            <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
            Edit Profile
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function LinkedGamesSection({ games }: { games: LinkedGame[] }) {
  return (
    <section aria-labelledby="linked-games-heading">
      <div className="flex items-center justify-between mb-3">
        <h2
          id="linked-games-heading"
          className="text-base font-semibold text-[#f1f5f9]"
        >
          Linked Games
        </h2>
        <Button variant="outline" size="sm">
          <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
          Link a Game
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {games.map((lg) => {
          const game = getGameInfo(lg.game_id);
          return (
            <Card key={lg.id} className="flex items-center gap-4 py-3 px-4">
              <span
                className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{
                  background: `${game?.color ?? "#a855f7"}20`,
                  border: `1px solid ${game?.color ?? "#a855f7"}30`,
                }}
                aria-hidden="true"
              >
                {game?.emoji}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-[#f1f5f9] truncate">
                    {lg.display_name}
                  </p>
                  {lg.is_verified && (
                    <Badge variant="verified" size="sm">
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-[#64748b]">
                  {game?.name} · {lg.platform}
                </p>
              </div>
            </Card>
          );
        })}

        {games.length === 0 && (
          <Card className="py-8 text-center">
            <p className="text-sm text-[#64748b]">No games linked yet.</p>
          </Card>
        )}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = MOCK_PROFILE;
  const matches = MOCK_MATCHES;
  const linkedGames = MOCK_LINKED_GAMES;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Profile header */}
      <ProfileHeader profile={profile} />

      {/* Stats grid */}
      <section aria-label="Player statistics">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Win Rate"
            value={`${profile.win_rate}%`}
            icon={<Trophy className="w-4 h-4" aria-hidden="true" />}
            trend={{ value: 3.2, isPositive: true }}
          />
          <StatCard
            label="Total Matches"
            value={profile.total_matches}
            icon={<Target className="w-4 h-4" aria-hidden="true" />}
          />
          <StatCard
            label="WX Points"
            value={profile.points.toLocaleString()}
            icon={<Zap className="w-4 h-4" aria-hidden="true" />}
            trend={{ value: 8.5, isPositive: true }}
          />
          <StatCard
            label="Global Rank"
            value={`#${profile.rank}`}
            icon={<Star className="w-4 h-4" aria-hidden="true" />}
          />
        </div>
      </section>

      {/* Win / Loss bar */}
      <Card className="py-3 px-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#94a3b8]">
            Wins{" "}
            <span className="text-[#22c55e] font-bold">{profile.wins}</span>
          </span>
          <span className="text-xs font-medium text-[#94a3b8]">
            Losses{" "}
            <span className="text-[#ef4444] font-bold">{profile.losses}</span>
          </span>
        </div>
        <div className="h-2 rounded-full bg-[#16213e] overflow-hidden">
          <div
            className="h-full rounded-full bg-linear-to-r from-[#22c55e] to-[#16a34a]"
            style={{ width: `${profile.win_rate}%` }}
            role="progressbar"
            aria-valuenow={profile.win_rate}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Win rate: ${profile.win_rate}%`}
          />
        </div>
      </Card>

      {/* Recent Matches */}
      <section aria-labelledby="recent-matches-heading">
        <h2
          id="recent-matches-heading"
          className="text-base font-semibold text-[#f1f5f9] mb-3"
        >
          Recent Matches
        </h2>
        <div className={cn("flex flex-col gap-3")}>
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              currentUserId={profile.id}
            />
          ))}
        </div>
      </section>

      {/* Linked Games */}
      <LinkedGamesSection games={linkedGames} />
    </div>
  );
}
