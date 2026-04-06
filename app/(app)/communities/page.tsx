"use client";

import { useState } from "react";
import { Users, Gamepad2, Search, Plus, Crown, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import { GAMES } from "@/lib/utils/constants";
import type { GameId } from "@/types/app.types";

interface Community {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  game_id: GameId | null;
  owner_id: string;
  member_count: number;
  max_members: number;
  is_public: boolean;
  is_member?: boolean;
  user_role?: "owner" | "admin" | "moderator" | "member" | null;
}

const MOCK_COMMUNITIES: Community[] = [
  {
    id: "comm-1",
    name: "eFootball Elite",
    description: "Competitive eFootball players. Daily tournaments and scrims.",
    avatar_url: null,
    game_id: "efootball",
    owner_id: "user-1",
    member_count: 142,
    max_members: 200,
    is_public: true,
  },
  {
    id: "comm-2",
    name: "Free Fire Warriors",
    description: "Squad up for ranked matches. All skill levels welcome!",
    avatar_url: null,
    game_id: "free-fire",
    owner_id: "user-2",
    member_count: 89,
    max_members: 100,
    is_public: true,
  },
  {
    id: "comm-3",
    name: "LoL Africa",
    description: "League of Legends community for African players. Weekly custom games.",
    avatar_url: null,
    game_id: "league-of-legends",
    owner_id: "user-3",
    member_count: 256,
    max_members: 500,
    is_public: true,
  },
  {
    id: "comm-4",
    name: "COD Snipers Only",
    description: "Call of Duty snipers and quickscopers. 1v1 me bro!",
    avatar_url: null,
    game_id: "cod",
    owner_id: "user-4",
    member_count: 67,
    max_members: 150,
    is_public: true,
  },
  {
    id: "comm-5",
    name: "Fortnite Builders",
    description: "Creative builders and competitive players. Box fight practice.",
    avatar_url: null,
    game_id: "fortnite",
    owner_id: "user-5",
    member_count: 113,
    max_members: 200,
    is_public: false,
  },
];

const MY_COMMUNITIES: Community[] = [
  { ...MOCK_COMMUNITIES[0], is_member: true, user_role: "member" },
  { ...MOCK_COMMUNITIES[2], is_member: true, user_role: "moderator" },
];

export default function CommunitiesPage() {
  const [activeTab, setActiveTab] = useState<"discover" | "my-communities">("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState<GameId | "all">("all");

  const filteredCommunities = MOCK_COMMUNITIES.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame = selectedGame === "all" || c.game_id === selectedGame;
    return matchesSearch && matchesGame;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#a855f7]/15 border border-[#a855f7]/25 text-[#a855f7]">
            <Users className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-[#f1f5f9]">Communities</h1>
            <p className="text-sm text-[#64748b]">Join gaming clans and communities</p>
          </div>
        </div>
        <Button variant="primary" className="gap-2">
          <Plus className="w-4 h-4" />
          Create Community
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#2a2a4e]">
        <button
          onClick={() => setActiveTab("discover")}
          className={cn(
            "px-4 py-3 text-sm font-medium transition-colors relative",
            activeTab === "discover" ? "text-[#a855f7]" : "text-[#64748b] hover:text-[#94a3b8]"
          )}
        >
          Discover
          {activeTab === "discover" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a855f7]" />}
        </button>
        <button
          onClick={() => setActiveTab("my-communities")}
          className={cn(
            "px-4 py-3 text-sm font-medium transition-colors relative",
            activeTab === "my-communities" ? "text-[#a855f7]" : "text-[#64748b] hover:text-[#94a3b8]"
          )}
        >
          My Communities
          {activeTab === "my-communities" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a855f7]" />}
        </button>
      </div>

      {/* Filters */}
      {activeTab === "discover" && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0d0d14] border border-[#2a2a4e] text-[#f1f5f9] placeholder:text-[#64748b] focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/30 outline-none"
            />
          </div>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value as GameId | "all")}
            className="px-4 py-2.5 rounded-xl bg-[#0d0d14] border border-[#2a2a4e] text-[#f1f5f9] focus:border-[#a855f7] outline-none"
          >
            <option value="all">All Games</option>
            {GAMES.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeTab === "discover" ? (
          filteredCommunities.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))
        ) : (
          MY_COMMUNITIES.map((community) => (
            <CommunityCard key={community.id} community={community} isMember />
          ))
        )}
      </div>

      {filteredCommunities.length === 0 && activeTab === "discover" && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-[#2a2a4e] mx-auto mb-4" />
          <p className="text-[#64748b]">No communities found matching your criteria</p>
        </div>
      )}
    </div>
  );
}

function CommunityCard({ community, isMember }: { community: Community; isMember?: boolean }) {
  const game = GAMES.find((g) => g.id === community.game_id);
  const roleIcons = {
    owner: <Crown className="w-3 h-3 text-yellow-500" />,
    admin: <Shield className="w-3 h-3 text-[#a855f7]" />,
    moderator: <Shield className="w-3 h-3 text-green-500" />,
    member: <User className="w-3 h-3 text-[#64748b]" />,
  };

  return (
    <div className="bg-[#0d0d14] border border-[#2a2a4e] rounded-xl p-4 space-y-4 hover:border-[#a855f7]/40 transition-colors">
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: game?.color ? `${game.color}20` : "#1a1a2e" }}
        >
          {game?.emoji || "👥"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#f1f5f9] truncate">{community.name}</h3>
            {!community.is_public && (
              <Badge variant="default" size="sm">Private</Badge>
            )}
          </div>
          <p className="text-xs text-[#64748b] flex items-center gap-1">
            <Gamepad2 className="w-3 h-3" />
            {game?.name || "Multi-game"}
          </p>
        </div>
      </div>

      <p className="text-sm text-[#94a3b8] line-clamp-2">{community.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-[#64748b]">
          <Users className="w-3 h-3" />
          {community.member_count}/{community.max_members} members
        </div>
        {isMember ? (
          <div className="flex items-center gap-2">
            {community.user_role && roleIcons[community.user_role]}
            <span className="text-xs text-[#a855f7] capitalize">{community.user_role}</span>
            <Button variant="outline" size="sm">View</Button>
          </div>
        ) : (
          <Button variant="primary" size="sm">
            Join
          </Button>
        )}
      </div>
    </div>
  );
}
