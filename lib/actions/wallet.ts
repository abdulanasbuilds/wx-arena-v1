"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function awardPoints(userId: string, amount: number, reason: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.rpc("award_points_secure", {
    u_id: userId,
    amount,
    reason,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/wallet");
  return { success: true };
}

export async function deductPoints(userId: string, amount: number, reason: string) {
  const supabase = await createClient();
  
  const { data: success, error } = await supabase.rpc("deduct_points_secure", {
    u_id: userId,
    amount,
    reason,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!success) {
    return { success: false, error: "Insufficient points" };
  }

  revalidatePath("/wallet");
  return { success: true };
}

export async function logWalletTransaction(
  userId: string,
  type: "earn" | "spend" | "wager" | "win" | "refund" | "purchase",
  points: number,
  description: string,
  referenceType?: string,
  referenceId?: string
) {
  const supabase = await createClient();
  // We can still use direct insert for extra logging if RLS allows or use another RPC
  // But for now, since we secured the points, we can allow system logging via service role if we had it.
  // Actually, let's use award_points_secure for logic. 
  // If we just want to LOG without changing points, we need a separate policy.
  // However, most logs correspond to point changes.
  
  await supabase.from("wallet_transactions").insert({
    user_id: userId,
    type,
    points,
    description,
    reference_type: referenceType || null,
    reference_id: referenceId || null,
    status: "completed",
  });
}
