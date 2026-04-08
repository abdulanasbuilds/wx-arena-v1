"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createMatch(formData: {
  gameId: string;
  matchType: string;
  wagerPoints: number;
  opponentId?: string;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // 1. Deduct points if wager > 0
  if (formData.wagerPoints > 0) {
    const { data: success, error: deductError } = await supabase.rpc("deduct_points_secure", {
      u_id: user.id,
      amount: formData.wagerPoints,
      reason: `Match creation wager: ${formData.gameId}`,
    });

    if (deductError || !success) {
      return { success: false, error: deductError?.message || "Insufficient points for wager" };
    }
  }

  // 2. Create match
  const { data, error } = await supabase
    .from("matches")
    .insert({
      game_id: formData.gameId,
      match_type: formData.matchType,
      wager_points: formData.wagerPoints,
      player_1_id: user.id,
      player_2_id: formData.opponentId || null,
      status: formData.opponentId ? "pending" : "waiting",
    })
    .select()
    .single();

  if (error) {
    // Refund points if match creation fails
    if (formData.wagerPoints > 0) {
      await supabase.rpc("award_points_secure", {
        u_id: user.id,
        amount: formData.wagerPoints,
        reason: "Refund: Match creation failed",
      });
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/matches");
  return { success: true, data };
}

export async function joinMatch(matchId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Get match wager info
  const { data: match } = await supabase
    .from("matches")
    .select("wager_points, status")
    .eq("id", matchId)
    .single();

  if (!match || match.status !== "waiting") {
    return { success: false, error: "Match no longer available" };
  }

  // 1. Deduct points for joiner
  if (match.wager_points > 0) {
    const { data: success, error: deductError } = await supabase.rpc("deduct_points_secure", {
      u_id: user.id,
      amount: match.wager_points,
      reason: `Match entry wager: ${matchId}`,
      ref_type: "match",
      ref_id: matchId,
    });

    if (deductError || !success) {
      return { success: false, error: deductError?.message || "Insufficient points for wager" };
    }
  }

  // 2. Update match to add player 2
  const { data, error } = await supabase
    .from("matches")
    .update({
      player_2_id: user.id,
      status: "in_progress",
    })
    .eq("id", matchId)
    .eq("status", "waiting")
    .select()
    .single();

  if (error) {
    // Refund points if join fails
    if (match.wager_points > 0) {
      await supabase.rpc("award_points_secure", {
        u_id: user.id,
        amount: match.wager_points,
        reason: "Refund: Failed to join match",
        ref_type: "match",
        ref_id: matchId,
      });
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/matches");
  return { success: true, data };
}

export async function submitMatchResult(matchId: string, winnerId: string, scores?: {
  player1Score: number;
  player2Score: number;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Get match to verify user is participant
  const { data: match } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (!match) {
    return { success: false, error: "Match not found" };
  }

  if (match.player_1_id !== user.id && match.player_2_id !== user.id) {
    return { success: false, error: "Not a participant in this match" };
  }

  // Update match with result via secure RPC
  const { error } = await supabase.rpc("submit_match_result_secure", {
    m_id: matchId,
    w_id: winnerId,
    p1_score: scores?.player1Score,
    p2_score: scores?.player2Score,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Update player stats
  await updatePlayerStats(match.player_1_id);
  if (match.player_2_id) {
    await updatePlayerStats(match.player_2_id);
  }

  revalidatePath("/matches");
  return { success: true, data };
}

async function updatePlayerStats(userId: string) {
  const supabase = await createClient();
  
  // Calculate stats
  const { data: matches } = await supabase
    .from("matches")
    .select("winner_id, player_1_id, player_2_id")
    .or(`player_1_id.eq.${userId},player_2_id.eq.${userId}`)
    .eq("status", "completed");

  if (!matches) return;

  const total = matches.length;
  const wins = matches.filter(m => m.winner_id === userId).length;
  const losses = total - wins;
  const winRate = total > 0 ? (wins / total) * 100 : 0;

  await supabase
    .from("profiles")
    .update({
      total_matches: total,
      wins,
      losses,
      win_rate: winRate,
    })
    .eq("id", userId);
}
