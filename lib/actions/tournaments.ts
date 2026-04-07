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

  // Check user's points balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", user.id)
    .single();

  if (!profile || profile.points < tournament.entry_fee) {
    return { success: false, error: "Insufficient points for entry fee" };
  }

  // Deduct entry fee
  const { error: pointsError } = await supabase
    .from("profiles")
    .update({ points: profile.points - tournament.entry_fee })
    .eq("id", user.id);

  if (pointsError) {
    return { success: false, error: pointsError.message };
  }

  // Create entry
  const { error } = await supabase
    .from("tournament_entries")
    .insert({
      tournament_id: tournamentId,
      user_id: user.id,
      status: "registered",
    });

  if (error) {
    // Refund points on error
    await supabase
      .from("profiles")
      .update({ points: profile.points })
      .eq("id", user.id);
    return { success: false, error: error.message };
  }

  // Log transaction
  await supabase.from("wallet_transactions").insert({
    user_id: user.id,
    type: "spent",
    amount: tournament.entry_fee,
    description: `Tournament entry fee: ${tournamentId}`,
    reference_type: "tournament",
    reference_id: tournamentId,
  });

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

  // Refund entry fee
  if (tournament?.entry_fee > 0) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", user.id)
      .single();

    if (profile) {
      await supabase
        .from("profiles")
        .update({ points: profile.points + tournament.entry_fee })
        .eq("id", user.id);

      // Log refund
      await supabase.from("wallet_transactions").insert({
        user_id: user.id,
        type: "refunded",
        amount: tournament.entry_fee,
        description: `Tournament registration refund: ${tournamentId}`,
        reference_type: "tournament",
        reference_id: tournamentId,
      });
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
