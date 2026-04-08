"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function registerForTournament(tournamentId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Check if already registered
  const { data: existing } = await supabase
    .from("tournament_entries")
    .select("id")
    .eq("tournament_id", tournamentId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return { success: false, error: "Already registered for this tournament" };
  }

  // Get tournament details
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("entry_fee, max_participants")
    .eq("id", tournamentId)
    .single();

  if (!tournament) {
    return { success: false, error: "Tournament not found" };
  }

  // Get profile for current balance (to show error early if possible, though RPC checks too)
  const { data: profile } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", user.id)
    .single();

  if (!profile || profile.points < tournament.entry_fee) {
    return { success: false, error: "Insufficient points for entry fee" };
  }

  // Deduct entry fee via secure RPC
  const { data: deductSuccess, error: deductError } = await supabase.rpc("deduct_points_secure", {
    u_id: user.id,
    amount: tournament.entry_fee,
    reason: `Tournament entry fee: ${tournamentId}`,
    ref_type: "tournament",
    ref_id: tournamentId,
  });

  if (deductError || !deductSuccess) {
    return { success: false, error: deductError?.message || "Failed to deduct entry fee" };
  }

  // Create entry
  const { error: entryError } = await supabase
    .from("tournament_entries")
    .insert({
      tournament_id: tournamentId,
      user_id: user.id,
    });

  if (entryError) {
    // Refund points if entry creation fails
    await supabase.rpc("award_points_secure", {
      u_id: user.id,
      amount: tournament.entry_fee,
      reason: `Refund: Tournament entry failed for ${tournamentId}`,
      ref_type: "tournament",
      ref_id: tournamentId,
    });
    return { success: false, error: entryError.message };
  }

  revalidatePath("/tournaments");
  return { success: true };
}

export async function cancelTournamentRegistration(tournamentId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Get entry details
  const { data: entry } = await supabase
    .from("tournament_entries")
    .select("*")
    .eq("tournament_id", tournamentId)
    .eq("user_id", user.id)
    .single();

  if (!entry) {
    return { success: false, error: "Not registered for this tournament" };
  }

  // Get tournament for refund amount
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("entry_fee")
    .eq("id", tournamentId)
    .single();

  // Refund entry fee via secure RPC
  if (tournament && tournament.entry_fee > 0) {
    const { error: refundError } = await supabase.rpc("award_points_secure", {
      u_id: user.id,
      amount: tournament.entry_fee,
      reason: `Tournament registration refund: ${tournamentId}`,
      ref_type: "tournament",
      ref_id: tournamentId,
    });

    if (refundError) {
      console.error("[Tournament Action] Refund failed:", refundError);
      // We continue to delete entry? Or fail? 
      // Better to fail if refund failed to avoid double registration issues.
      return { success: false, error: "Failed to process refund." };
    }
  }

  // Delete entry
  const { error } = await supabase
    .from("tournament_entries")
    .delete()
    .eq("id", entry.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/tournaments");
  return { success: true };
}
