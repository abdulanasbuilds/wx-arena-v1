import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: Request) {
  try {
    // Get the raw body
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    // Verify webhook signature
    if (PAYSTACK_SECRET && signature) {
      const hash = crypto
        .createHmac("sha512", PAYSTACK_SECRET)
        .update(rawBody)
        .digest("hex");

      if (hash !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);

    // Handle charge.success event
    if (event.event === "charge.success") {
      const { reference, metadata } = event.data;
      const userId = metadata?.user_id;
      const points = metadata?.points;

      if (!userId || !points) {
        return NextResponse.json(
          { error: "Missing metadata" },
          { status: 400 }
        );
      }

      const supabase = await createClient();

      // Check if already processed
      const { data: existing } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("reference_id", reference)
        .eq("status", "completed")
        .single();

      if (existing) {
        return NextResponse.json({ message: "Already processed" });
      }

      // Credit points
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

        // Update transaction
        await supabase
          .from("wallet_transactions")
          .update({
            status: "completed",
            description: `Points purchase via webhook - ${points} points`,
          })
          .eq("reference_id", reference);

        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ message: "Event received" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
