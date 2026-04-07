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
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Create match
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

  // Update match to add player 2
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

  // Update match with result
  const { data, error } = await supabase
    .from("matches")
    .update({
      winner_id: winnerId,
      status: "completed",
      completed_at: new Date().toISOString(),
      player_1_score: scores?.player1Score,
      player_2_score: scores?.player2Score,
    })
    .eq("id", matchId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Update player stats
  await updatePlayerStats(match.player_1_id);
  await updatePlayerStats(match.player_2_id);

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
