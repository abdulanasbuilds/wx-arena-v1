"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { GameId, MatchType } from "@/types/app.types";

interface MatchmakingOptions {
  gameId: GameId;
  matchType: MatchType;
  wagerPoints: number;
}

interface MatchmakingState {
  isSearching: boolean;
  isMatched: boolean;
  opponent: {
    id: string;
    username: string;
    avatar_url: string | null;
    rank: number;
    win_rate: number;
  } | null;
  matchId: string | null;
  queuePosition: number;
  estimatedWait: number; // seconds
}

export function useMatchmaking(userId: string) {
  const [state, setState] = useState<MatchmakingState>({
    isSearching: false,
    isMatched: false,
    opponent: null,
    matchId: null,
    queuePosition: 0,
    estimatedWait: 0,
  });
  const supabase = createClient();

  // Join matchmaking queue
  const joinQueue = useCallback(
    async (options: MatchmakingOptions) => {
      setState((prev) => ({ ...prev, isSearching: true }));

      // Add to queue
      const { error } = await supabase.from("matchmaking_queue").insert({
        user_id: userId,
        game_id: options.gameId,
        match_type: options.matchType,
        wager_points: options.wagerPoints,
        status: "waiting",
      });

      if (error) {
        console.error("Join queue error:", error);
        setState((prev) => ({ ...prev, isSearching: false }));
        return false;
      }

      return true;
    },
    [userId, supabase]
  );

  // Leave queue
  const leaveQueue = useCallback(async () => {
    await supabase
      .from("matchmaking_queue")
      .delete()
      .eq("user_id", userId)
      .eq("status", "waiting");

    setState({
      isSearching: false,
      isMatched: false,
      opponent: null,
      matchId: null,
      queuePosition: 0,
      estimatedWait: 0,
    });
  }, [userId, supabase]);

  // Subscribe to matchmaking updates
  useEffect(() => {
    if (!state.isSearching) return;

    const channel = supabase
      .channel(`matchmaking:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matchmaking_queue",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          const update = payload.new as any;

          if (update.status === "matched" && update.matched_with) {
            // Fetch opponent details
            const { data: opponent } = await supabase
              .from("profiles")
              .select("id, username, avatar_url, rank, win_rate")
              .eq("id", update.matched_with)
              .single();

            // Create the match
            const { data: match } = await supabase
              .from("matches")
              .insert({
                game_id: update.game_id,
                match_type: update.match_type,
                status: "pending",
                wager_points: update.wager_points,
                player_1_id: userId,
                player_2_id: update.matched_with,
              })
              .select()
              .single();

            setState({
              isSearching: false,
              isMatched: true,
              opponent: opponent || null,
              matchId: match?.id || null,
              queuePosition: 0,
              estimatedWait: 0,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [state.isSearching, userId, supabase]);

  // Auto-match logic: Check for compatible opponents periodically
  useEffect(() => {
    if (!state.isSearching) return;

    const interval = setInterval(async () => {
      // Find waiting players with similar wager
      const { data: queueEntry } = await supabase
        .from("matchmaking_queue")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "waiting")
        .single();

      if (!queueEntry) return;

      // Look for a match
      const { data: opponents } = await supabase
        .from("matchmaking_queue")
        .select("user_id")
        .eq("game_id", queueEntry.game_id)
        .eq("match_type", queueEntry.match_type)
        .eq("status", "waiting")
        .neq("user_id", userId)
        .gte("wager_points", queueEntry.wager_points * 0.8)
        .lte("wager_points", queueEntry.wager_points * 1.2)
        .order("created_at", { ascending: true })
        .limit(1);

      if (opponents && opponents.length > 0) {
        const opponentId = opponents[0].user_id;

        // Match found! Update both entries
        await supabase
          .from("matchmaking_queue")
          .update({ status: "matched", matched_with: opponentId, matched_at: new Date().toISOString() })
          .eq("user_id", userId);

        await supabase
          .from("matchmaking_queue")
          .update({ status: "matched", matched_with: userId, matched_at: new Date().toISOString() })
          .eq("user_id", opponentId);
      }

      // Update queue position
      const { data: position } = await supabase
        .from("matchmaking_queue")
        .select("id", { count: "exact" })
        .eq("game_id", queueEntry.game_id)
        .eq("status", "waiting")
        .lt("created_at", queueEntry.created_at);

      setState((prev) => ({
        ...prev,
        queuePosition: (position?.length || 0) + 1,
        estimatedWait: (position?.length || 0) * 15, // Rough estimate
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [state.isSearching, userId, supabase]);

  return {
    ...state,
    joinQueue,
    leaveQueue,
  };
}
