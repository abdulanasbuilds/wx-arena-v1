"use client";

import { useState } from "react";
import { Swords, Users, Clock, Trophy, Zap, X, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { GAMES } from "@/lib/utils/constants";
import type { GameId } from "@/types/app.types";

interface MatchmakingQueueProps {
  userId: string;
  onMatchFound?: (opponent: any) => void;
}

export function MatchmakingQueue({ userId, onMatchFound }: MatchmakingQueueProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const [matchType, setMatchType] = useState<"1v1" | "2v2" | "3v3" | "Squad">("1v1");
  const [wagerPoints, setWagerPoints] = useState(100);
  const [queuePosition, setQueuePosition] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState(0);

  const startQueue = () => {
    if (!selectedGame) return;
    setIsSearching(true);
    setQueuePosition(1);
    setEstimatedWait(30);
    
    // Simulate matchmaking
    const interval = setInterval(() => {
      setEstimatedWait((prev) => Math.max(0, prev - 1));
    }, 1000);

    // Auto-match after 5 seconds for demo
    setTimeout(() => {
      clearInterval(interval);
      setIsSearching(false);
      onMatchFound?.({
        id: "opponent-" + Date.now(),
        username: "ProPlayer_" + Math.floor(Math.random() * 1000),
        rank: Math.floor(Math.random() * 50) + 1,
        win_rate: 60 + Math.random() * 20,
      });
    }, 5000);
  };

  const cancelQueue = () => {
    setIsSearching(false);
    setQueuePosition(0);
    setEstimatedWait(0);
  };

  if (isSearching) {
    return (
      <div className="bg-[#0d0d14] border border-[#a855f7]/50 rounded-xl p-8 text-center space-y-4">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-[#1a1a2e]" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#a855f7] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <Swords className="absolute inset-0 m-auto w-8 h-8 text-[#a855f7]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#f1f5f9]">Finding Opponent...</h3>
          <p className="text-sm text-[#64748b] mt-1">
            Position in queue: #{queuePosition}
          </p>
          <p className="text-xs text-[#64748b]">
            Estimated wait: {estimatedWait}s
          </p>
        </div>
        <Button variant="outline" onClick={cancelQueue} className="gap-2">
          <X className="w-4 h-4" />
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#0d0d14] border border-[#2a2a4e] rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#a855f7]/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-[#a855f7]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#f1f5f9]">Quick Match</h3>
          <p className="text-sm text-[#64748b]">Find an opponent instantly</p>
        </div>
      </div>

      {/* Game Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#94a3b8]">Select Game</label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id as GameId)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all",
                selectedGame === game.id
                  ? "bg-[#a855f7]/20 border-[#a855f7] text-[#f1f5f9]"
                  : "bg-[#1a1a2e] border-[#2a2a4e] text-[#64748b] hover:border-[#a855f7]/40"
              )}
            >
              <span className="text-2xl">{game.emoji}</span>
              <span className="text-xs truncate w-full text-center">{game.shortName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Match Type */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#94a3b8]">Match Type</label>
        <div className="flex gap-2">
          {["1v1", "2v2", "3v3", "Squad"].map((type) => (
            <button
              key={type}
              onClick={() => setMatchType(type as any)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                matchType === type
                  ? "bg-[#a855f7] border-[#a855f7] text-white"
                  : "bg-[#1a1a2e] border-[#2a2a4e] text-[#94a3b8] hover:border-[#a855f7]/40"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Wager Points */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#94a3b8]">Wager Points</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="50"
            max="10000"
            step="50"
            value={wagerPoints}
            onChange={(e) => setWagerPoints(Number(e.target.value))}
            className="flex-1 h-2 bg-[#1a1a2e] rounded-lg appearance-none cursor-pointer accent-[#a855f7]"
          />
          <div className="px-4 py-2 bg-[#1a1a2e] border border-[#2a2a4e] rounded-lg text-[#f1f5f9] font-medium min-w-[100px] text-center">
            {wagerPoints} pts
          </div>
        </div>
        <div className="flex gap-2">
          {[100, 500, 1000, 5000].map((amount) => (
            <button
              key={amount}
              onClick={() => setWagerPoints(amount)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs border transition-all",
                wagerPoints === amount
                  ? "bg-[#a855f7]/20 border-[#a855f7] text-[#a855f7]"
                  : "bg-[#0d0d14] border-[#2a2a4e] text-[#64748b] hover:border-[#a855f7]/40"
              )}
            >
              {amount}
            </button>
          ))}
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={startQueue}
        disabled={!selectedGame}
        className="w-full gap-2"
      >
        <Swords className="w-5 h-5" />
        Find Match
      </Button>
    </div>
  );
}
