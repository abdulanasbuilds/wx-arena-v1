"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function awardPoints(userId: string, amount: number, reason: string) {
  const supabase = await createClient();
  
  // Get current points
  const { data: profile } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", userId)
    .single();

  if (!profile) {
    return { success: false, error: "User not found" };
  }

  // Update points
  const { error } = await supabase
    .from("profiles")
    .update({ points: profile.points + amount })
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Log transaction
  await supabase.from("wallet_transactions").insert({
    user_id: userId,
    type: "earned",
    amount,
    description: reason,
  });

  revalidatePath("/wallet");
  return { success: true };
}

export async function deductPoints(userId: string, amount: number, reason: string) {
  const supabase = await createClient();
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", userId)
    .single();

  if (!profile) {
    return { success: false, error: "User not found" };
  }

  if (profile.points < amount) {
    return { success: false, error: "Insufficient points" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ points: profile.points - amount })
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase.from("wallet_transactions").insert({
    user_id: userId,
    type: "spent",
    amount,
    description: reason,
  });

  revalidatePath("/wallet");
  return { success: true };
}
