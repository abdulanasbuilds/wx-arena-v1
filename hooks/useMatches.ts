"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Match, MatchStatus } from "@/types/app.types";

interface UseMatchesOptions {
  userId?: string;
  status?: MatchStatus | "all";
  limit?: number;
}

export function useMatches(options: UseMatchesOptions = {}) {
  const { userId, status = "all", limit = 50 } = options;
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let query = supabase
          .from("matches")
          .select(
            `
            *,
            player_1:profiles!matches_player_1_id_fkey(*),
            player_2:profiles!matches_player_2_id_fkey(*)
          `
          )
          .order("created_at", { ascending: false })
          .limit(limit);

        if (userId) {
          query = query.or(`player_1_id.eq.${userId},player_2_id.eq.${userId}`);
        }

        if (status !== "all") {
          query = query.eq("status", status);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        setMatches(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch matches");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("matches_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        (payload) => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId, status, limit]);

  return { matches, isLoading, error, refresh: () => {} };
}
