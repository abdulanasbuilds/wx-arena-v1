import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_API = "https://api.paystack.co";

export async function POST(request: Request) {
  try {
    const { userId, amount, email, metadata } = await request.json();

    if (!userId || !amount || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate unique reference
    const reference = `wx_${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Initialize transaction with Paystack
    const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Convert to kobo/cents
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet/verify`,
        metadata: {
          user_id: userId,
          points: metadata?.points || 0,
          custom_fields: [
            {
              display_name: "Points Package",
              variable_name: "points_package",
              value: `${metadata?.points} Points`,
            },
          ],
        },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json(
        { error: data.message || "Payment initialization failed" },
        { status: 400 }
      );
    }

    // Store pending transaction in database
    const supabase = await createClient();
    await supabase.from("wallet_transactions").insert({
      user_id: userId,
      type: "purchase",
      points: metadata?.points || 0,
      description: `Points purchase - ${amount} NGN`,
      reference_type: "paystack",
      reference_id: reference,
      status: "pending",
    });

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
