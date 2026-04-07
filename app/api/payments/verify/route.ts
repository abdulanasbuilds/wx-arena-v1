import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_API = "https://api.paystack.co";

export async function POST(request: Request) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { error: "Transaction reference required" },
        { status: 400 }
      );
    }

    // Verify transaction with Paystack
    const response = await fetch(
      `${PAYSTACK_API}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );

    const data = await response.json();

    if (!data.status || data.data.status !== "success") {
      return NextResponse.json(
        { error: "Payment verification failed", status: data.data?.status },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get transaction details
    const { data: transaction } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("reference_id", reference)
      .single();

    if (!transaction || transaction.status === "completed") {
      return NextResponse.json(
        { error: "Transaction not found or already processed" },
        { status: 400 }
      );
    }

    const userId = transaction.user_id;
    const points = transaction.amount;

    // Credit points to user
    const { data: profile } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", userId)
      .single();

    if (profile) {
      await supabase
        .from("profiles")
        .update({ points: profile.points + points })
        .eq("id", userId);

      // Update transaction status
      await supabase
        .from("wallet_transactions")
        .update({
          status: "completed",
          description: `Points purchase - ${points} points credited`,
        })
        .eq("reference_id", reference);

      return NextResponse.json({
        success: true,
        message: `${points} points credited successfully`,
        newBalance: profile.points + points,
      });
    }

    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
