"use client";

import { useState, useEffect, useCallback } from "react";
import { Swords, Users, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { GAMES } from "@/lib/utils/constants";
import { createClient } from "@/lib/supabase/client";
import type { GameId } from "@/types/app.types";

const EDGE_FUNCTION_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1/matchmaking';

interface MatchmakingQueueProps {
  userId: string;
  userRank?: number;
  onMatchFound?: (match: {
    matchId: string;
    opponent: {
      id: string;
      username: string;
      rank: number;
      win_rate: number;
    };
    gameId: GameId;
    wagerPoints: number;
  }) => void;
}

export function MatchmakingQueue({ userId, userRank = 1, onMatchFound }: MatchmakingQueueProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const [matchType, setMatchType] = useState<"1v1" | "2v2" | "3v3" | "Squad">("1v1");
  const [wagerPoints, setWagerPoints] = useState(100);
  const [queuePosition, setQueuePosition] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState(0);
  const [queueId, setQueueId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Calculate rank range for matching (±5 ranks)
  const getRankRange = useCallback(() => {
    const range = 5;
    return {
      min: Math.max(1, userRank - range),
      max: userRank + range,
    };
  }, [userRank]);

  // Join matchmaking queue via Edge Function
  const startQueue = async () => {
    if (!selectedGame) {
      setError("Please select a game");
      return;
    }

    try {
      setError(null);
      setIsSearching(true);
      setQueuePosition(1);
      setEstimatedWait(30);

      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'join',
          userId,
          gameId: selectedGame,
          matchType,
          wagerPoints,
          userRank,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join queue');
      }

      setQueueId(data.queueId);

      // Try to find a match immediately
      await findMatch(data.queueId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join queue");
      setIsSearching(false);
    }
  };

  // Find a matching opponent via Edge Function
  const findMatch = async (currentQueueId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'find',
          queueId: currentQueueId,
          userId,
          gameId: selectedGame,
          matchType,
          wagerPoints,
          userRank,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find match');
      }

      if (data.matched) {
        setIsSearching(false);
        onMatchFound?.({
          matchId: data.matchId,
          opponent: data.opponent,
          gameId: selectedGame!,
          wagerPoints,
        });
      }
    } catch (err) {
      console.error("Match finding error:", err);
    }
  };

  // Cancel queue via Edge Function
  const cancelQueue = async () => {
    if (queueId) {
      const { data: { session } } = await supabase.auth.getSession();

      await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'cancel',
          queueId,
        }),
      });
    }
    setIsSearching(false);
    setQueuePosition(0);
    setEstimatedWait(0);
    setQueueId(null);
  };

  // Subscribe to queue updates
  useEffect(() => {
    if (!isSearching || !queueId) return;

    const channel = supabase
      .channel("matchmaking_updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matchmaking_queue",
          filter: `id=eq.${queueId}`,
        },
        (payload) => {
          if (payload.new.status === "matched") {
            // Match was found - handled by findMatch response
          }
        }
      )
      .subscribe();

    // Periodic match finding while searching
    const interval = setInterval(() => {
      if (queueId) {
        findMatch(queueId);
      }
      setEstimatedWait((prev) => Math.max(0, prev - 1));
    }, 3000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [isSearching, queueId]);

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

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

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
        <div className="grid grid-cols-4 gap-2">
          {["1v1", "2v2", "3v3", "Squad"].map((type) => (
            <button
              key={type}
              onClick={() => setMatchType(type as any)}
              className={cn(
                "flex items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                matchType === type
                  ? "border-[#a855f7] bg-[#a855f7]/10 text-[#f1f5f9]"
                  : "border-[#2a2a4e] text-[#94a3b8] hover:border-[#4a4a6e]"
              )}
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{type}</span>
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
            min="100"
            max="10000"
            step="100"
            value={wagerPoints}
            onChange={(e) => setWagerPoints(Number(e.target.value))}
            className="flex-1 h-2 bg-[#1a1a2e] rounded-lg appearance-none cursor-pointer accent-[#a855f7]"
          />
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] rounded-lg border border-[#2a2a4e]">
            <span className="text-sm font-semibold text-[#f1f5f9]">
              {wagerPoints.toLocaleString()} pts
            </span>
          </div>
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
