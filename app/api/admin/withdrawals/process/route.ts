import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { logWalletTransaction } from "@/lib/actions/wallet";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check for admin status
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const id = formData.get("id") as string;
    const action = formData.get("action") as string;

    if (!id || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get withdrawal request
    const { data: withdrawal, error: fetchError } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }

    if (withdrawal.status !== "pending") {
      return NextResponse.json({ error: "Already processed" }, { status: 400 });
    }

    if (action === "approve") {
      // Logic for actual bank transfer would go here
      // For now, just mark as completed
      const { error: updateError } = await supabase
        .from("withdrawal_requests")
        .update({ status: "completed" })
        .eq("id", id);

      if (updateError) throw updateError;
    } else if (action === "reject") {
      // Refund points to user
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", withdrawal.user_id)
        .single();

      if (userProfile) {
        await supabase
          .from("profiles")
          .update({ points: userProfile.points + withdrawal.points_deducted })
          .eq("id", withdrawal.user_id);

        // Log refund
        await logWalletTransaction(
          withdrawal.user_id,
          "refund",
          withdrawal.points_deducted,
          `Withdrawal #${id} rejected - points refunded`
        );
      }

      await supabase
        .from("withdrawal_requests")
        .update({ status: "rejected" })
        .eq("id", id);
    }

    // Redirect back to withdrawals page
    return new Response(null, {
      status: 303,
      headers: { Location: "/admin/withdrawals" },
    });
  } catch (error) {
    console.error("Process withdrawal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
