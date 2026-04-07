// Supabase Edge Function: Matchmaking Queue Handler
// This function handles all sensitive matchmaking operations server-side

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { action, userId, gameId, matchType, wagerPoints, userRank } = await req.json();

    if (action === "join") {
      // Join matchmaking queue
      const rankRange = {
        min: Math.max(1, userRank - 5),
        max: userRank + 5,
      };

      const { data, error } = await supabaseClient
        .from("matchmaking_queue")
        .insert({
          user_id: userId,
          game_id: gameId,
          match_type: matchType,
          wager_points: wagerPoints,
          rank_range_min: rankRange.min,
          rank_range_max: rankRange.max,
          status: "searching",
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, queueId: data.id }), {
        headers,
      });
    }

    if (action === "find") {
      // Find matching opponent
      const { queueId, userId, gameId, matchType, wagerPoints, userRank } = await req.json();
      
      const rankRange = {
        min: Math.max(1, userRank - 5),
        max: userRank + 5,
      };

      // Look for compatible opponents
      const { data: opponents, error: searchError } = await supabaseClient
        .from("matchmaking_queue")
        .select(`
          *,
          user:profiles!matchmaking_queue_user_id_fkey(id, username, rank, win_rate)
        `)
        .eq("game_id", gameId)
        .eq("match_type", matchType)
        .eq("wager_points", wagerPoints)
        .eq("status", "searching")
        .neq("user_id", userId)
        .gte("rank_range_min", rankRange.min)
        .lte("rank_range_max", rankRange.max)
        .order("created_at", { ascending: true })
        .limit(1);

      if (searchError) throw searchError;

      if (opponents && opponents.length > 0) {
        const opponent = opponents[0];

        // Create match
        const { data: match, error: matchError } = await supabaseClient
          .from("matches")
          .insert({
            game_id: gameId,
            match_type: matchType,
            wager_points: wagerPoints,
            player_1_id: userId,
            player_2_id: opponent.user_id,
            status: "pending",
          })
          .select()
          .single();

        if (matchError) throw matchError;

        // Update both queue entries
        await supabaseClient
          .from("matchmaking_queue")
          .update({ status: "matched", matched_at: new Date().toISOString() })
          .in("id", [queueId, opponent.id]);

        // Deduct wagers from both players
        await Promise.all([
          deductWager(supabaseClient, userId, wagerPoints),
          deductWager(supabaseClient, opponent.user_id, wagerPoints),
        ]);

        return new Response(
          JSON.stringify({
            success: true,
            matched: true,
            matchId: match.id,
            opponent: {
              id: opponent.user_id,
              username: opponent.user?.username || "Unknown",
              rank: opponent.user?.rank || 1,
              win_rate: opponent.user?.win_rate || 0,
            },
          }),
          { headers }
        );
      }

      return new Response(JSON.stringify({ success: true, matched: false }), {
        headers,
      });
    }

    if (action === "cancel") {
      const { queueId } = await req.json();
      
      await supabaseClient
        .from("matchmaking_queue")
        .update({ status: "cancelled" })
        .eq("id", queueId);

      return new Response(JSON.stringify({ success: true }), { headers });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers,
    });
  }
});

async function deductWager(supabase, userId, amount) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", userId)
    .single();

  if (profile) {
    await supabase
      .from("profiles")
      .update({ points: profile.points - amount })
      .eq("id", userId);

    await supabase.from("wallet_transactions").insert({
      user_id: userId,
      type: "spent",
      amount: -amount,
      description: "Match wager",
      reference_type: "match",
    });
  }
}
