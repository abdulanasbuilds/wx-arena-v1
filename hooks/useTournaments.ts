"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Tournament {
  id: string;
  title: string;
  game_id: string;
  max_participants: number;
  current_participants: number;
  entry_fee: number;
  prize_pool: number;
  start_time: string;
  status: "open" | "in_progress" | "completed" | "cancelled";
  created_at: string;
}

interface TournamentEntry {
  id: string;
  tournament_id: string;
  user_id: string;
  joined_at: string;
  final_rank: number | null;
}

interface UseTournamentsOptions {
  status?: Tournament["status"] | "all";
  userId?: string;
  includeMyEntries?: boolean;
}

export function useTournaments(options: UseTournamentsOptions = {}) {
  const { status = "all", userId, includeMyEntries = false } = options;
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [myEntries, setMyEntries] = useState<TournamentEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let query = supabase
          .from("tournaments")
          .select("*")
          .order("start_time", { ascending: true });

        if (status !== "all") {
          query = query.eq("status", status);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        setTournaments((data as any[] || []).map((t: any) => ({
          ...t,
          status: t.status as Tournament["status"],
          game_id: t.game_id as any,
        })));

        // Fetch user's entries if requested
        if (includeMyEntries && userId) {
          const { data: entriesData, error: entriesError } = await supabase
            .from("tournament_entries")
            .select("*")
            .eq("user_id", userId);

          if (entriesError) {
            throw entriesError;
          }

          setMyEntries(entriesData || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch tournaments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournaments();
  }, [supabase, status, userId, includeMyEntries]);

  return {
    tournaments,
    myEntries,
    isLoading,
    error,
    refresh: () => {},
  };
}
