"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Tournament {
  id: string;
  name: string;
  description: string | null;
  game_id: string;
  format: string;
  max_participants: number;
  entry_fee: number;
  prize_pool: number;
  start_date: string;
  end_date: string | null;
  registration_deadline: string;
  status: "draft" | "registration" | "in_progress" | "completed" | "cancelled";
  rules: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface TournamentEntry {
  id: string;
  tournament_id: string;
  user_id: string;
  status: "registered" | "confirmed" | "eliminated" | "winner";
  registered_at: string;
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
          .order("start_date", { ascending: true });

        if (status !== "all") {
          query = query.eq("status", status);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        setTournaments(data || []);

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
