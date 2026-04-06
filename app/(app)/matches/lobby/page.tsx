"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Swords, MessageCircle, Flag, ChevronLeft, Clock, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

interface Player {
  id: string;
  username: string;
  avatar_url?: string;
  isReady: boolean;
  isHost: boolean;
}

interface MatchLobby {
  id: string;
  game_id: string;
  game_name: string;
  match_type: string;
  wager_points: number;
  status: "waiting" | "in_progress" | "completed";
  created_at: string;
  players: Player[];
  game_settings?: Record<string, any>;
}

export default function MatchLobbyPage() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id");
  
  const [lobby, setLobby] = useState<MatchLobby>({
    id: matchId || "new-match",
    game_id: "efootball",
    game_name: "eFootball",
    match_type: "1v1",
    wager_points: 500,
    status: "waiting",
    created_at: new Date().toISOString(),
    players: [
      {
        id: "player-1",
        username: "You",
        isReady: true,
        isHost: true,
      },
      {
        id: "player-2",
        username: "DragonKick",
        isReady: false,
        isHost: false,
      },
    ],
  });

  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes to start
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const allReady = lobby.players.every((p) => p.isReady);
  const canStart = allReady && lobby.players.length >= 2;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/matches">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Match Lobby</h1>
          <p className="text-sm text-[#64748b]">
            {lobby.game_name} • {lobby.match_type} • {lobby.wager_points} points
          </p>
        </div>
        <Badge variant={lobby.status === "waiting" ? "info" : "success"}>
          {lobby.status === "waiting" ? "Waiting" : "In Progress"}
        </Badge>
      </div>

      {/* Timer Card */}
      <div className="bg-[#0d0d14] border border-[#2a2a4e] rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#f59e0b]" />
            </div>
            <div>
              <p className="text-sm text-[#64748b]">Time to start</p>
              <p className="text-2xl font-bold text-[#f1f5f9]">{formatTime(timeLeft)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#64748b]">Match ID</p>
            <p className="text-lg font-mono text-[#f1f5f9]">#{lobby.id.slice(-6)}</p>
          </div>
        </div>
      </div>

      {/* Players */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lobby.players.map((player, index) => (
          <div
            key={player.id}
            className={cn(
              "bg-[#0d0d14] border rounded-xl p-4 flex items-center gap-4",
              player.isReady
                ? "border-green-500/50"
                : "border-[#2a2a4e]"
            )}
          >
            <div className="relative">
              <Avatar
                username={player.username}
                size="lg"
                src={player.avatar_url}
              />
              {player.isReady && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#0d0d14] flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[#f1f5f9]">{player.username}</h3>
                {player.isHost && (
                  <Badge variant="default" size="sm">Host</Badge>
                )}
              </div>
              <p className={cn("text-sm", player.isReady ? "text-green-500" : "text-[#64748b]")}>
                {player.isReady ? "Ready" : "Not Ready"}
              </p>
            </div>
            {player.id === "player-1" && (
              <Button
                variant={player.isReady ? "outline" : "primary"}
                size="sm"
                onClick={() => {
                  setLobby((prev) => ({
                    ...prev,
                    players: prev.players.map((p) =>
                      p.id === player.id ? { ...p, isReady: !p.isReady } : p
                    ),
                  }));
                }}
              >
                {player.isReady ? "Unready" : "Ready Up"}
              </Button>
            )}
          </div>
        ))}

        {/* Empty Slot */}
        {lobby.players.length < 2 && (
          <div className="bg-[#0d0d14] border border-dashed border-[#2a2a4e] rounded-xl p-4 flex items-center justify-center min-h-[100px]">
            <p className="text-[#64748b]">Waiting for opponent...</p>
          </div>
        )}
      </div>

      {/* Game Settings */}
      <div className="bg-[#0d0d14] border border-[#2a2a4e] rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-[#f1f5f9] flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#a855f7]" />
          Match Rules
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between py-2 border-b border-[#2a2a4e]">
            <span className="text-[#64748b]">Game</span>
            <span className="text-[#f1f5f9]">{lobby.game_name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#2a2a4e]">
            <span className="text-[#64748b]">Match Type</span>
            <span className="text-[#f1f5f9]">{lobby.match_type}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#2a2a4e]">
            <span className="text-[#64748b]">Wager</span>
            <span className="text-[#f1f5f9]">{lobby.wager_points} points</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#2a2a4e]">
            <span className="text-[#64748b]">Winner Takes</span>
            <span className="text-[#f1f5f9]">{lobby.wager_points * 2} points</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => setChatOpen(!chatOpen)}
        >
          <MessageCircle className="w-4 h-4" />
          Chat
        </Button>
        <Button variant="outline" className="flex-1 gap-2 text-red-500 hover:text-red-400">
          <Flag className="w-4 h-4" />
          Forfeit
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="flex-[2] gap-2"
          disabled={!canStart}
        >
          <Swords className="w-5 h-5" />
          {canStart ? "Start Match" : "Waiting for players..."}
        </Button>
      </div>

      {!allReady && (
        <p className="text-center text-sm text-[#64748b]">
          All players must be ready to start the match
        </p>
      )}
    </div>
  );
}
