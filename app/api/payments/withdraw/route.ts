import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const MINIMUM_WITHDRAWAL = 1000; // ₦1000
const WITHDRAWAL_FEE = 50; // ₦50

export async function POST(request: Request) {
  try {
    const { userId, amount, bankCode, accountNumber, accountName } =
      await request.json();

    // Validation
    if (!userId || !amount || !bankCode || !accountNumber || !accountName) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (amount < MINIMUM_WITHDRAWAL) {
      return NextResponse.json(
        { error: `Minimum withdrawal is ₦${MINIMUM_WITHDRAWAL}` },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check user balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Convert points to Naira (100 points = ₦1)
    const nairaValue = Math.floor(profile.points / 100);

    if (nairaValue < amount + WITHDRAWAL_FEE) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Create withdrawal request
    const pointsToDeduct = (amount + WITHDRAWAL_FEE) * 100;

    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("withdrawal_requests")
      .insert({
        user_id: userId,
        amount: amount,
        fee: WITHDRAWAL_FEE,
        total_deducted: amount + WITHDRAWAL_FEE,
        points_deducted: pointsToDeduct,
        bank_code: bankCode,
        account_number: accountNumber,
        account_name: accountName,
        status: "pending",
      })
      .select()
      .single();

    if (withdrawalError) {
      return NextResponse.json(
        { error: "Failed to create withdrawal request" },
        { status: 500 }
      );
    }

    // Deduct points immediately (will be refunded if rejected)
    await supabase
      .from("profiles")
      .update({ points: profile.points - pointsToDeduct })
      .eq("id", userId);

    // Log transaction
    await supabase.from("wallet_transactions").insert({
      user_id: userId,
      type: "withdrawal",
      amount: -pointsToDeduct,
      description: `Withdrawal request #${withdrawal.id} - ₦${amount}`,
      reference_type: "withdrawal",
      reference_id: withdrawal.id,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted for review",
      requestId: withdrawal.id,
      estimatedTime: "24-48 hours",
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: withdrawals, error } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch withdrawals" },
        { status: 500 }
      );
    }

    return NextResponse.json({ withdrawals });
  } catch (error) {
    console.error("Fetch withdrawals error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
